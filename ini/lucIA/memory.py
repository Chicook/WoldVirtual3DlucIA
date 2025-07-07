"""
Sistema de memoria para LucIA - IA de la Plataforma Metaverso
"""

import sqlite3
import json
import hashlib
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import logging
from config import config

logger = logging.getLogger(__name__)

@dataclass
class MemoryEntry:
    """Entrada en la memoria de la IA"""
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
    user_feedback: Optional[str] = None

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
    """Gestor de memoria para la IA"""
    
    def __init__(self, memory_path: Optional[Path] = None):
        self.memory_path = memory_path or config.get_memory_path()
        self.memory_path.mkdir(parents=True, exist_ok=True)
        
        # Base de datos
        self.db_path = self.memory_path / "lucia_memory.db"
        self._init_database()
        
        # Cache en memoria
        self.memory_cache = deque(maxlen=1000)
        self.conversation_history = deque(maxlen=500)
        
        # Contadores de uso
        self.api_usage_count = defaultdict(int)
        self.daily_usage = defaultdict(int)
        
        # Cargar datos existentes
        self._load_existing_data()
        
    def _init_database(self):
        """Inicializa la base de datos SQLite"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de memoria principal
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memory_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_prompt TEXT NOT NULL,
                original_response TEXT NOT NULL,
                paraphrased_response TEXT NOT NULL,
                source_api TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                confidence REAL DEFAULT 0.0,
                keywords TEXT,
                context TEXT,
                usage_count INTEGER DEFAULT 0,
                effectiveness_score REAL DEFAULT 0.5,
                user_feedback TEXT,
                prompt_hash TEXT UNIQUE
            )
        ''')
        
        # Tabla de conversaciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_input TEXT NOT NULL,
                lucia_response TEXT NOT NULL,
                paraphrased_response TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                source_api TEXT NOT NULL,
                confidence REAL DEFAULT 0.0,
                processing_time REAL DEFAULT 0.0,
                keywords TEXT,
                context TEXT
            )
        ''')
        
        # Tabla de uso de APIs
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS api_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                api_name TEXT NOT NULL,
                usage_date DATE NOT NULL,
                usage_count INTEGER DEFAULT 0,
                cost_accumulated REAL DEFAULT 0.0,
                UNIQUE(api_name, usage_date)
            )
        ''')
        
        # Tabla de estadísticas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                timestamp DATETIME NOT NULL
            )
        ''')
        
        # Índices para optimización
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memory_timestamp ON memory_entries(timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memory_source ON memory_entries(source_api)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memory_effectiveness ON memory_entries(effectiveness_score)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp)')
        
        conn.commit()
        conn.close()
        
    def _load_existing_data(self):
        """Carga datos existentes en memoria"""
        self._load_conversation_history()
        self._load_api_usage()
        
    def _load_conversation_history(self):
        """Carga historial de conversaciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT id, user_input, lucia_response, paraphrased_response, timestamp, 
                       source_api, confidence, processing_time, keywords, context
                FROM conversations 
                ORDER BY timestamp DESC 
                LIMIT 100
            ''')
            
            for row in cursor.fetchall():
                entry = ConversationEntry(
                    id=row[0],
                    user_input=row[1],
                    lucia_response=row[2],
                    paraphrased_response=row[3],
                    timestamp=datetime.fromisoformat(row[4]),
                    source_api=row[5],
                    confidence=row[6],
                    processing_time=row[7],
                    keywords=json.loads(row[8]) if row[8] else [],
                    context=row[9]
                )
                self.conversation_history.append(entry)
                
        except Exception as e:
            logger.error(f"Error cargando historial: {e}")
        finally:
            conn.close()
            
    def _load_api_usage(self):
        """Carga estadísticas de uso de APIs"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT api_name, usage_count 
                FROM api_usage 
                WHERE usage_date = DATE('now')
            ''')
            
            for row in cursor.fetchall():
                self.daily_usage[row[0]] = row[1]
                
        except Exception as e:
            logger.error(f"Error cargando uso de APIs: {e}")
        finally:
            conn.close()
            
    def store_memory_entry(self, entry: MemoryEntry, paraphraser=None):
        """Almacena una entrada en la memoria con parafraseo de código"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Parafrasear código si está presente
            if paraphraser and self._contains_code(entry.original_response):
                paraphrased_response = self._paraphrase_code_in_response(entry.original_response, paraphraser)
                entry.paraphrased_response = paraphrased_response
            
            prompt_hash = hashlib.md5(entry.original_prompt.encode()).hexdigest()
            
            cursor.execute('''
                INSERT OR REPLACE INTO memory_entries 
                (original_prompt, original_response, paraphrased_response, source_api, 
                 timestamp, confidence, keywords, context, usage_count, effectiveness_score, 
                 user_feedback, prompt_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                entry.original_prompt,
                entry.original_response,
                entry.paraphrased_response,
                entry.source_api,
                entry.timestamp,
                entry.confidence,
                json.dumps(entry.keywords),
                entry.context,
                entry.usage_count,
                entry.effectiveness_score,
                entry.user_feedback,
                prompt_hash
            ))
            
            conn.commit()
            
            # Añadir al cache
            self.memory_cache.append(entry)
            
            logger.info(f"Entrada de memoria almacenada: {entry.source_api}")
            
        except Exception as e:
            logger.error(f"Error almacenando entrada de memoria: {e}")
        finally:
            conn.close()
    
    def _contains_code(self, text: str) -> bool:
        """Detecta si el texto contiene código"""
        code_indicators = [
            "def ", "class ", "function ", "import ", "from ",
            "if ", "for ", "while ", "try:", "except:",
            "var ", "let ", "const ", "public ", "private ",
            "return ", "print(", "console.log(", "System.out.println(",
            "=", "==", "!=", ">", "<", ">=", "<=",
            "(", ")", "{", "}", "[", "]", ";"
        ]
        
        text_lower = text.lower()
        code_count = sum(1 for indicator in code_indicators if indicator in text_lower)
        
        # Si hay más de 3 indicadores de código, considerarlo como código
        return code_count >= 3
    
    def _paraphrase_code_in_response(self, response: str, paraphraser) -> str:
        """Parafrasea el código dentro de una respuesta"""
        try:
            # Detectar bloques de código
            code_blocks = self._extract_code_blocks(response)
            
            paraphrased_response = response
            
            for code_block in code_blocks:
                if code_block['code']:
                    # Detectar lenguaje
                    language = self._detect_code_language(code_block['code'])
                    
                    # Parafrasear código
                    paraphrased_code = paraphraser.paraphrase_code(code_block['code'], language)
                    
                    # Reemplazar en la respuesta
                    paraphrased_response = paraphrased_response.replace(
                        code_block['full_block'], 
                        f"```{language}\n{paraphrased_code}\n```"
                    )
            
            return paraphrased_response
            
        except Exception as e:
            logger.error(f"Error parafraseando código en respuesta: {e}")
            return response
    
    def _extract_code_blocks(self, text: str) -> List[Dict]:
        """Extrae bloques de código del texto"""
        code_blocks = []
        
        # Patrones para bloques de código
        patterns = [
            r'```(\w+)?\n(.*?)\n```',  # Bloques con backticks
            r'`(.*?)`',  # Código inline
            r'<code>(.*?)</code>',  # Tags HTML
            r'<pre>(.*?)</pre>'  # Bloques pre
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.DOTALL)
            for match in matches:
                if pattern == r'```(\w+)?\n(.*?)\n```':
                    language = match.group(1) or "text"
                    code = match.group(2)
                else:
                    language = "text"
                    code = match.group(1)
                
                code_blocks.append({
                    'language': language,
                    'code': code,
                    'full_block': match.group(0)
                })
        
        return code_blocks
    
    def _detect_code_language(self, code: str) -> str:
        """Detecta el lenguaje de programación del código"""
        code_lower = code.lower()
        
        if "def " in code_lower or "import " in code_lower or "class " in code_lower:
            return "python"
        elif "function " in code_lower or "var " in code_lower or "const " in code_lower or "let " in code_lower:
            return "javascript"
        elif "public " in code_lower or "private " in code_lower or "class " in code_lower:
            return "java"
        elif "#include" in code_lower or "int main" in code_lower:
            return "cpp"
        else:
            return "text"
            
    def store_conversation(self, entry: ConversationEntry):
        """Almacena una conversación"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO conversations 
                (user_input, lucia_response, paraphrased_response, timestamp, source_api, 
                 confidence, processing_time, keywords, context)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                entry.user_input,
                entry.lucia_response,
                entry.paraphrased_response,
                entry.timestamp,
                entry.source_api,
                entry.confidence,
                entry.processing_time,
                json.dumps(entry.keywords),
                entry.context
            ))
            
            conn.commit()
            
            # Añadir al historial
            self.conversation_history.append(entry)
            
        except Exception as e:
            logger.error(f"Error almacenando conversación: {e}")
        finally:
            conn.close()
            
    def find_similar_memory(self, prompt: str, min_similarity: float = 0.3) -> Optional[MemoryEntry]:
        """Busca memoria similar"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT id, original_prompt, original_response, paraphrased_response, 
                       source_api, timestamp, confidence, keywords, context, 
                       usage_count, effectiveness_score, user_feedback
                FROM memory_entries 
                WHERE effectiveness_score > 0.3
                ORDER BY effectiveness_score DESC, usage_count DESC
                LIMIT 100
            ''')
            
            results = cursor.fetchall()
            
            best_match = None
            best_score = 0.0
            
            for row in results:
                stored_prompt = row[1]
                similarity = self._calculate_similarity(prompt, stored_prompt)
                
                # Puntaje combinado
                effectiveness = row[10] or 0.5
                usage_count = row[9] or 0
                combined_score = similarity * 0.6 + effectiveness * 0.3 + min(usage_count / 10, 0.1)
                
                if combined_score > best_score and similarity > min_similarity:
                    best_score = combined_score
                    best_match = MemoryEntry(
                        id=row[0],
                        original_prompt=row[1],
                        original_response=row[2],
                        paraphrased_response=row[3],
                        source_api=row[4],
                        timestamp=datetime.fromisoformat(row[5]),
                        confidence=row[6],
                        keywords=json.loads(row[7]) if row[7] else [],
                        context=row[8],
                        usage_count=row[9],
                        effectiveness_score=row[10],
                        user_feedback=row[11]
                    )
                    
            # Actualizar contador de uso
            if best_match:
                cursor.execute('''
                    UPDATE memory_entries 
                    SET usage_count = usage_count + 1 
                    WHERE id = ?
                ''', (best_match.id,))
                conn.commit()
                
            return best_match
            
        except Exception as e:
            logger.error(f"Error buscando memoria similar: {e}")
            return None
        finally:
            conn.close()
    
    def generate_response_from_memory(self, prompt: str, paraphraser=None) -> Optional[MemoryEntry]:
        """
        Genera una respuesta desde la memoria usando parafraseo mejorado
        """
        try:
            # Buscar memoria similar
            memory_entry = self.find_similar_memory(prompt, min_similarity=0.2)
            
            if memory_entry and paraphraser:
                # Usar el parafraseador para generar una respuesta variada
                new_paraphrased = paraphraser.paraphrase_from_memory(prompt)
                
                # Crear una nueva entrada de memoria con la respuesta parafraseada
                enhanced_entry = MemoryEntry(
                    id=None,  # Nueva entrada
                    original_prompt=prompt,
                    original_response=memory_entry.original_response,
                    paraphrased_response=new_paraphrased,
                    source_api=f"{memory_entry.source_api}_paraphrased",
                    timestamp=datetime.now(),
                    confidence=memory_entry.confidence * 0.9,  # Ligeramente menor confianza
                    keywords=memory_entry.keywords,
                    context=memory_entry.context,
                    usage_count=0,
                    effectiveness_score=memory_entry.effectiveness_score * 0.8,
                    user_feedback=None
                )
                
                return enhanced_entry
            else:
                return memory_entry
                
        except Exception as e:
            logger.error(f"Error generando respuesta desde memoria: {e}")
            return None
            
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calcula similitud entre dos textos"""
        # Implementación simple basada en palabras clave
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
            
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
        
    def update_api_usage(self, api_name: str, cost: float = 0.0):
        """Actualiza el contador de uso de una API"""
        today = datetime.now().date()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO api_usage (api_name, usage_date, usage_count, cost_accumulated)
                VALUES (?, ?, ?, ?)
            ''', (api_name, today, self.daily_usage[api_name] + 1, cost))
            
            conn.commit()
            self.daily_usage[api_name] += 1
            
        except Exception as e:
            logger.error(f"Error actualizando uso de API: {e}")
        finally:
            conn.close()
            
    def get_api_usage_today(self, api_name: str) -> int:
        """Obtiene el uso de una API hoy"""
        return self.daily_usage.get(api_name, 0)
        
    def can_use_api(self, api_name: str, daily_limit: int) -> bool:
        """Verifica si se puede usar una API"""
        return self.get_api_usage_today(api_name) < daily_limit
        
    def get_memory_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de la memoria"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Total de entradas de memoria
            cursor.execute('SELECT COUNT(*) FROM memory_entries')
            total_memory_entries = cursor.fetchone()[0]
            
            # Total de conversaciones
            cursor.execute('SELECT COUNT(*) FROM conversations')
            total_conversations = cursor.fetchone()[0]
            
            # Efectividad promedio
            cursor.execute('SELECT AVG(effectiveness_score) FROM memory_entries')
            avg_effectiveness = cursor.fetchone()[0] or 0.0
            
            # Uso de APIs hoy
            cursor.execute('''
                SELECT api_name, usage_count 
                FROM api_usage 
                WHERE usage_date = DATE('now')
            ''')
            api_usage_today = dict(cursor.fetchall())
            
            # Entradas más usadas
            cursor.execute('''
                SELECT source_api, COUNT(*) 
                FROM memory_entries 
                GROUP BY source_api
            ''')
            source_distribution = dict(cursor.fetchall())
            
            return {
                "total_memory_entries": total_memory_entries,
                "total_conversations": total_conversations,
                "avg_effectiveness": round(avg_effectiveness, 2),
                "api_usage_today": api_usage_today,
                "source_distribution": source_distribution,
                "cache_size": len(self.memory_cache),
                "conversation_history_size": len(self.conversation_history)
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            return {}
        finally:
            conn.close()
            
    def cleanup_old_data(self, days: int = 30):
        """Limpia datos antiguos"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Limpiar conversaciones antiguas
            cursor.execute('''
                DELETE FROM conversations 
                WHERE timestamp < ?
            ''', (cutoff_date,))
            
            # Limpiar estadísticas antiguas
            cursor.execute('''
                DELETE FROM statistics 
                WHERE timestamp < ?
            ''', (cutoff_date,))
            
            conn.commit()
            
            logger.info(f"Datos antiguos limpiados (más de {days} días)")
            
        except Exception as e:
            logger.error(f"Error limpiando datos antiguos: {e}")
        finally:
            conn.close()
            
    def export_memory(self, format: str = "json") -> str:
        """Exporta la memoria"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format.lower() == "json":
            filename = self.memory_path / f"memory_export_{timestamp}.json"
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            try:
                cursor.execute('''
                    SELECT original_prompt, original_response, paraphrased_response, 
                           source_api, timestamp, confidence, keywords, context, 
                           usage_count, effectiveness_score
                    FROM memory_entries 
                    ORDER BY timestamp DESC
                ''')
                
                data = []
                for row in cursor.fetchall():
                    data.append({
                        "original_prompt": row[0],
                        "original_response": row[1],
                        "paraphrased_response": row[2],
                        "source_api": row[3],
                        "timestamp": row[4],
                        "confidence": row[5],
                        "keywords": json.loads(row[6]) if row[6] else [],
                        "context": row[7],
                        "usage_count": row[8],
                        "effectiveness_score": row[9]
                    })
                    
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                    
            finally:
                conn.close()
                
        return f"Memoria exportada a: {filename}"
        
    def create_backup(self) -> str:
        """Crea un backup de la memoria"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = self.memory_path / "backups" / f"memory_backup_{timestamp}"
        backup_path.mkdir(parents=True, exist_ok=True)
        
        # Backup de la base de datos
        db_backup = backup_path / "lucia_memory.db"
        
        conn_source = sqlite3.connect(self.db_path)
        conn_backup = sqlite3.connect(db_backup)
        
        conn_source.backup(conn_backup)
        conn_source.close()
        conn_backup.close()
        
        # Backup de estadísticas
        stats = self.get_memory_stats()
        stats_file = backup_path / "statistics.json"
        
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
            
        return f"Backup creado en: {backup_path}" 