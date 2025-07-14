#!/usr/bin/env python3
"""
Memory Manager - Gestión de Memoria y Aprendizaje de LucIA
Versión para auto-análisis y mejora
"""

import sqlite3
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
import re
from pathlib import Path

from paraphraser import Paraphraser, ParaphraseConfig, PersonalityType
import config

logger = logging.getLogger(__name__)

@dataclass
class MemoryEntry:
    """Entrada de memoria"""
    id: Optional[int]
    original_prompt: str
    original_response: str
    paraphrased_response: str
    source_api: str
    timestamp: datetime
    confidence: float
    keywords: List[str]
    context: str
    usage_count: int
    effectiveness_score: float

@dataclass
class ConversationEntry:
    """Entrada de conversación"""
    id: Optional[int]
    user_input: str
    lucia_response: str
    paraphrased_response: str
    timestamp: datetime
    source_api: str
    confidence: float
    processing_time: float
    keywords: List[str]
    context: str

class MemoryManager:
    """Gestor de memoria para LucIA"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or config.memory.db_path
        self.daily_usage = {}
        self._init_database()
        
    def _init_database(self):
        """Inicializa la base de datos"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Tabla de memoria
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS memory_entries (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        original_prompt TEXT NOT NULL,
                        original_response TEXT NOT NULL,
                        paraphrased_response TEXT NOT NULL,
                        source_api TEXT NOT NULL,
                        timestamp TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        keywords TEXT NOT NULL,
                        context TEXT NOT NULL,
                        usage_count INTEGER DEFAULT 0,
                        effectiveness_score REAL DEFAULT 0.5,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Tabla de conversaciones
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS conversations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_input TEXT NOT NULL,
                        lucia_response TEXT NOT NULL,
                        paraphrased_response TEXT NOT NULL,
                        timestamp TEXT NOT NULL,
                        source_api TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        processing_time REAL NOT NULL,
                        keywords TEXT NOT NULL,
                        context TEXT NOT NULL,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Tabla de uso diario
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS daily_usage (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        api_name TEXT NOT NULL,
                        usage_date TEXT NOT NULL,
                        request_count INTEGER DEFAULT 0,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(api_name, usage_date)
                    )
                ''')
                
                # Índices para optimizar búsquedas
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_memory_keywords ON memory_entries(keywords)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_memory_timestamp ON memory_entries(timestamp)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(usage_date)')
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
            raise
            
    def store_memory_entry(self, entry: MemoryEntry, paraphraser: Paraphraser = None):
        """Almacena una entrada de memoria"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Parafrasear respuesta si es necesario
                paraphrased_response = entry.paraphrased_response
                if paraphraser and entry.original_response != entry.paraphrased_response:
                    paraphrased_response = paraphraser.paraphrase_from_memory(entry.original_response)
                
                cursor.execute('''
                    INSERT INTO memory_entries 
                    (original_prompt, original_response, paraphrased_response, source_api, 
                     timestamp, confidence, keywords, context, usage_count, effectiveness_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    entry.original_prompt,
                    entry.original_response,
                    paraphrased_response,
                    entry.source_api,
                    entry.timestamp.isoformat(),
                    entry.confidence,
                    json.dumps(entry.keywords),
                    entry.context,
                    entry.usage_count,
                    entry.effectiveness_score
                ))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"Error almacenando entrada de memoria: {e}")
            
    def store_conversation(self, entry: ConversationEntry):
        """Almacena una conversación"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO conversations 
                    (user_input, lucia_response, paraphrased_response, timestamp, 
                     source_api, confidence, processing_time, keywords, context)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    entry.user_input,
                    entry.lucia_response,
                    entry.paraphrased_response,
                    entry.timestamp.isoformat(),
                    entry.source_api,
                    entry.confidence,
                    entry.processing_time,
                    json.dumps(entry.keywords),
                    entry.context
                ))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"Error almacenando conversación: {e}")
            
    def generate_response_from_memory(self, prompt: str, paraphraser: Paraphraser = None) -> Optional[MemoryEntry]:
        """Genera respuesta desde la memoria"""
        try:
            # Extraer palabras clave del prompt
            prompt_keywords = self._extract_keywords(prompt)
            
            if not prompt_keywords:
                return None
                
            # Buscar entradas similares
            similar_entries = self._find_similar_entries(prompt_keywords)
            
            if not similar_entries:
                return None
                
            # Seleccionar la mejor entrada
            best_entry = self._select_best_entry(similar_entries, prompt_keywords)
            
            if not best_entry:
                return None
                
            # Parafrasear la respuesta
            paraphrased_response = best_entry.paraphrased_response
            if paraphraser:
                paraphrased_response = paraphraser.paraphrase_from_memory(best_entry.original_response)
                
            # Actualizar contador de uso
            self._update_usage_count(best_entry.id)
            
            # Crear nueva entrada con respuesta parafraseada
            return MemoryEntry(
                id=best_entry.id,
                original_prompt=best_entry.original_prompt,
                original_response=best_entry.original_response,
                paraphrased_response=paraphrased_response,
                source_api=f"{best_entry.source_api}_memory",
                timestamp=datetime.now(),
                confidence=best_entry.confidence * 0.9,  # Ligeramente menor confianza
                keywords=best_entry.keywords,
                context=best_entry.context,
                usage_count=best_entry.usage_count + 1,
                effectiveness_score=best_entry.effectiveness_score
            )
            
        except Exception as e:
            logger.error(f"Error generando respuesta desde memoria: {e}")
            return None
            
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrae palabras clave del texto"""
        # Palabras de parada en español
        stop_words = {
            "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", "da", "su", "por", "son", "con", "para", "al", "del", "los", "las", "una", "como", "pero", "sus", "me", "hasta", "hay", "donde", "han", "quien", "están", "estado", "desde", "todo", "nos", "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual", "poco", "ella", "estar", "estas", "algunas", "algo", "nosotros", "mi", "mis", "tú", "te", "ti", "tu", "tus", "ellas", "nosotras", "vosotros", "vosotras", "os", "mío", "mía", "míos", "mías", "tuyo", "tuya", "tuyos", "tuyas", "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra", "nuestros", "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "esos", "esas", "estoy", "estás", "está", "estamos", "estáis", "están", "esté", "estés", "estemos", "estéis", "estén", "estaré", "estarás", "estará", "estaremos", "estaréis", "estarán", "estaría", "estarías", "estaríamos", "estaríais", "estarían", "estaba", "estabas", "estábamos", "estabais", "estaban", "estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron", "estuviera", "estuvieras", "estuviéramos", "estuvierais", "estuvieran", "estuviese", "estuvieses", "estuviésemos", "estuvieseis", "estuviesen", "estando", "estado", "estada", "estados", "estadas", "estad", "he", "has", "ha", "hemos", "habéis", "han", "haya", "hayas", "hayamos", "hayáis", "hayan", "habré", "habrás", "habrá", "habremos", "habréis", "habrán", "habría", "habrías", "habríamos", "habríais", "habrían", "había", "habías", "habíamos", "habíais", "habían", "hube", "hubiste", "hubo", "hubimos", "hubisteis", "hubieron", "hubiera", "hubieras", "hubiéramos", "hubierais", "hubieran", "hubiese", "hubieses", "hubiésemos", "hubieseis", "hubiesen", "habiendo", "habido", "habida", "habidos", "habidas", "soy", "eres", "es", "somos", "sois", "son", "sea", "seas", "seamos", "seáis", "sean", "seré", "serás", "será", "seremos", "seréis", "serán", "sería", "serías", "seríamos", "seríais", "serían", "era", "eras", "éramos", "erais", "eran", "fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron", "fuera", "fueras", "fuéramos", "fuerais", "fueran", "fuese", "fueses", "fuésemos", "fueseis", "fuesen", "sintiendo", "sentido", "sentida", "sentidos", "sentidas", "siente", "sentid", "tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen", "tenga", "tengas", "tengamos", "tengáis", "tengan", "tendré", "tendrás", "tendrá", "tendremos", "tendréis", "tendrán", "tendría", "tendrías", "tendríamos", "tendríais", "tendrían", "tenía", "tenías", "teníamos", "teníais", "tenían", "tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron", "tuviera", "tuvieras", "tuviéramos", "tuvierais", "tuvieran", "tuviese", "tuvieses", "tuviésemos", "tuvieseis", "tuviesen", "teniendo", "tenido", "tenida", "tenidos", "tenidas", "tened", "más", "pero", "si", "yo", "él", "ella", "nosotros", "vosotros", "ellos", "ellas", "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "aquellos", "aquellas", "ser", "estar", "tener", "hacer", "decir", "poder", "ir", "ver", "dar", "saber", "querer", "llegar", "pasar", "deber", "poner", "parecer", "quedar", "creer", "hablar", "llevar", "dejar", "seguir", "encontrar", "llamar", "venir", "pensar", "salir", "volver", "tomar", "conocer", "vivir", "sentir", "tratar", "mirar", "contar", "empezar", "esperar", "buscar", "existir", "entrar", "trabajar", "escribir", "perder", "producir", "ocurrir", "entender", "pedir", "recibir", "recordar", "terminar", "permitir", "aparecer", "conseguir", "comenzar", "servir", "sacar", "necesitar", "mantener", "resultar", "leer", "caer", "cambiar", "presentar", "crear", "abrir", "considerar", "oír", "puede", "podría", "debería", "haría", "sería", "estaría", "tendría", "vendría"
        }
        
        # Limpiar texto
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text.split()
        
        # Filtrar palabras
        keywords = []
        for word in words:
            if (len(word) > 2 and 
                word not in stop_words and 
                not word.isdigit() and 
                word.isalpha()):
                keywords.append(word)
        
        return list(dict.fromkeys(keywords))
        
    def _find_similar_entries(self, keywords: List[str], limit: int = 10) -> List[MemoryEntry]:
        """Encuentra entradas similares basadas en palabras clave"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Buscar entradas que contengan las palabras clave
                keyword_conditions = []
                params = []
                
                for keyword in keywords:
                    keyword_conditions.append("keywords LIKE ?")
                    params.append(f"%{keyword}%")
                
                query = f'''
                    SELECT * FROM memory_entries 
                    WHERE {' OR '.join(keyword_conditions)}
                    ORDER BY confidence DESC, usage_count DESC
                    LIMIT ?
                '''
                params.append(limit)
                
                cursor.execute(query, params)
                rows = cursor.fetchall()
                
                entries = []
                for row in rows:
                    entry = MemoryEntry(
                        id=row[0],
                        original_prompt=row[1],
                        original_response=row[2],
                        paraphrased_response=row[3],
                        source_api=row[4],
                        timestamp=datetime.fromisoformat(row[5]),
                        confidence=row[6],
                        keywords=json.loads(row[7]),
                        context=row[8],
                        usage_count=row[9],
                        effectiveness_score=row[10]
                    )
                    entries.append(entry)
                    
                return entries
                
        except Exception as e:
            logger.error(f"Error buscando entradas similares: {e}")
            return []
            
    def _select_best_entry(self, entries: List[MemoryEntry], prompt_keywords: List[str]) -> Optional[MemoryEntry]:
        """Selecciona la mejor entrada basada en relevancia y calidad"""
        if not entries:
            return None
            
        best_entry = None
        best_score = 0
        
        for entry in entries:
            # Calcular puntuación de relevancia
            keyword_overlap = len(set(prompt_keywords) & set(entry.keywords))
            relevance_score = keyword_overlap / len(prompt_keywords) if prompt_keywords else 0
            
            # Calcular puntuación de calidad
            quality_score = (entry.confidence * 0.6 + 
                           entry.effectiveness_score * 0.3 + 
                           min(entry.usage_count / 10, 1.0) * 0.1)
            
            # Puntuación final
            final_score = relevance_score * 0.7 + quality_score * 0.3
            
            if final_score > best_score:
                best_score = final_score
                best_entry = entry
                
        return best_entry if best_score > 0.3 else None
        
    def _update_usage_count(self, entry_id: int):
        """Actualiza el contador de uso de una entrada"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE memory_entries 
                    SET usage_count = usage_count + 1 
                    WHERE id = ?
                ''', (entry_id,))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Error actualizando contador de uso: {e}")
            
    def get_memory_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de memoria"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Total de entradas
                cursor.execute('SELECT COUNT(*) FROM memory_entries')
                total_entries = cursor.fetchone()[0]
                
                # Entradas por API
                cursor.execute('''
                    SELECT source_api, COUNT(*) 
                    FROM memory_entries 
                    GROUP BY source_api
                ''')
                entries_by_api = dict(cursor.fetchall())
                
                # Confianza promedio
                cursor.execute('SELECT AVG(confidence) FROM memory_entries')
                avg_confidence = cursor.fetchone()[0] or 0
                
                # Total de conversaciones
                cursor.execute('SELECT COUNT(*) FROM conversations')
                total_conversations = cursor.fetchone()[0]
                
                # Uso diario
                cursor.execute('''
                    SELECT api_name, SUM(request_count) 
                    FROM daily_usage 
                    WHERE usage_date >= date('now', '-7 days')
                    GROUP BY api_name
                ''')
                weekly_usage = dict(cursor.fetchall())
                
                return {
                    "total_entries": total_entries,
                    "entries_by_api": entries_by_api,
                    "average_confidence": round(avg_confidence, 3),
                    "total_conversations": total_conversations,
                    "weekly_usage": weekly_usage,
                    "database_size": Path(self.db_path).stat().st_size if Path(self.db_path).exists() else 0
                }
                
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas de memoria: {e}")
            return {}
            
    def export_memory(self, format: str = "json") -> str:
        """Exporta la memoria en el formato especificado"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                if format.lower() == "json":
                    # Exportar como JSON
                    cursor.execute('SELECT * FROM memory_entries ORDER BY timestamp DESC LIMIT 100')
                    rows = cursor.fetchall()
                    
                    data = []
                    for row in rows:
                        data.append({
                            "id": row[0],
                            "original_prompt": row[1],
                            "original_response": row[2],
                            "paraphrased_response": row[3],
                            "source_api": row[4],
                            "timestamp": row[5],
                            "confidence": row[6],
                            "keywords": json.loads(row[7]),
                            "context": row[8],
                            "usage_count": row[9],
                            "effectiveness_score": row[10]
                        })
                    
                    return json.dumps(data, indent=2, ensure_ascii=False)
                    
                elif format.lower() == "csv":
                    # Exportar como CSV
                    cursor.execute('SELECT * FROM memory_entries ORDER BY timestamp DESC LIMIT 100')
                    rows = cursor.fetchall()
                    
                    csv_data = "id,original_prompt,original_response,paraphrased_response,source_api,timestamp,confidence,keywords,context,usage_count,effectiveness_score\n"
                    
                    for row in rows:
                        csv_data += f"{row[0]},\"{row[1].replace('\"', '\"\"')}\",\"{row[2].replace('\"', '\"\"')}\",\"{row[3].replace('\"', '\"\"')}\",{row[4]},{row[5]},{row[6]},\"{row[7]}\",\"{row[8].replace('\"', '\"\"')}\",{row[9]},{row[10]}\n"
                    
                    return csv_data
                    
                else:
                    return "Formato no soportado. Use 'json' o 'csv'."
                    
        except Exception as e:
            logger.error(f"Error exportando memoria: {e}")
            return "Error exportando memoria"
            
    def create_backup(self) -> str:
        """Crea un backup de la memoria"""
        try:
            backup_path = Path(self.db_path).parent / f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
            
            with sqlite3.connect(self.db_path) as source_conn:
                with sqlite3.connect(backup_path) as backup_conn:
                    source_conn.backup(backup_conn)
                    
            return f"Backup creado en: {backup_path}"
            
        except Exception as e:
            logger.error(f"Error creando backup: {e}")
            return "Error creando backup"
            
    def cleanup_old_data(self, days: int = 30):
        """Limpia datos antiguos"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Limpiar entradas de memoria antiguas
                cursor.execute('''
                    DELETE FROM memory_entries 
                    WHERE timestamp < ?
                ''', (cutoff_date.isoformat(),))
                
                # Limpiar conversaciones antiguas
                cursor.execute('''
                    DELETE FROM conversations 
                    WHERE timestamp < ?
                ''', (cutoff_date.isoformat(),))
                
                # Limpiar uso diario antiguo
                cursor.execute('''
                    DELETE FROM daily_usage 
                    WHERE usage_date < date('now', '-30 days')
                ''')
                
                conn.commit()
                
            logger.info(f"Datos de más de {days} días eliminados")
            
        except Exception as e:
            logger.error(f"Error limpiando datos antiguos: {e}")
            
    def search_memory(self, query: str, limit: int = 10) -> List[MemoryEntry]:
        """Busca en la memoria"""
        try:
            keywords = self._extract_keywords(query)
            return self._find_similar_entries(keywords, limit)
            
        except Exception as e:
            logger.error(f"Error buscando en memoria: {e}")
            return []
            
    def get_recent_conversations(self, limit: int = 10) -> List[ConversationEntry]:
        """Obtiene conversaciones recientes"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT * FROM conversations 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                ''', (limit,))
                
                rows = cursor.fetchall()
                conversations = []
                
                for row in rows:
                    conversation = ConversationEntry(
                        id=row[0],
                        user_input=row[1],
                        lucia_response=row[2],
                        paraphrased_response=row[3],
                        timestamp=datetime.fromisoformat(row[4]),
                        source_api=row[5],
                        confidence=row[6],
                        processing_time=row[7],
                        keywords=json.loads(row[8]),
                        context=row[9]
                    )
                    conversations.append(conversation)
                    
                return conversations
                
        except Exception as e:
            logger.error(f"Error obteniendo conversaciones recientes: {e}")
            return [] 