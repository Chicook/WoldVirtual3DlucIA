#!/usr/bin/env python3
"""
LucIA Core - Sistema Principal de LucIA
Versión para auto-análisis y mejora (sin claves de API)
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
import json
import re

from memory import MemoryManager, MemoryEntry, ConversationEntry
from paraphraser import Paraphraser, ParaphraseConfig, PersonalityType
from api_manager import APIManager, APIResponse
import config

logger = logging.getLogger(__name__)

@dataclass
class ChatResponse:
    """Respuesta del chat"""
    original_response: str
    paraphrased_response: str
    source_api: str
    confidence: float
    processing_time: float
    keywords: List[str]
    context: str
    used_memory: bool = False

class LucIACore:
    """Núcleo principal de LucIA"""
    
    def __init__(self, 
                 name: str = None,
                 personality: PersonalityType = None,
                 enable_memory: bool = True,
                 enable_paraphrasing: bool = True):
        
        # Configuración
        self.name = name or config.platform.ai_name
        self.personality = personality or PersonalityType.FRIENDLY
        self.enable_memory = enable_memory
        self.enable_paraphrasing = enable_paraphrasing
        
        # Componentes principales
        self.memory_manager = MemoryManager() if enable_memory else None
        self.paraphraser = Paraphraser(ParaphraseConfig(
            personality=self.personality,
            confidence_threshold=config.memory.paraphrase_confidence
        )) if enable_paraphrasing else None
        
        # Estado del sistema
        self.conversation_history: List[ConversationEntry] = []
        self.stats = {
            "total_requests": 0,
            "api_requests": 0,
            "memory_requests": 0,
            "total_processing_time": 0.0,
            "average_confidence": 0.0
        }
        
        self._show_startup_info()
    
    def _show_startup_info(self):
        """Muestra información de inicio"""
        logger.info(f"🌟 {self.name} inicializado")
        logger.info(f"🎭 Personalidad: {self.personality.value}")
        logger.info(f"🧠 Memoria: {'Activada' if self.enable_memory else 'Desactivada'}")
        logger.info(f"🔄 Parafraseo: {'Activado' if self.enable_paraphrasing else 'Desactivado'}")
        logger.info(f"🌐 Plataforma: {config.platform.platform_name}")
        
    async def chat(self, prompt: str, context: List[str] = None) -> ChatResponse:
        """Procesa una conversación con el usuario"""
        start_time = datetime.now()
        self.stats["total_requests"] += 1
        
        try:
            # Extraer palabras clave
            keywords = self._extract_keywords(prompt)
            
            # Obtener contexto de conversación
            conversation_context = self._get_conversation_context()
            if context:
                conversation_context.extend(context)
            
            # Intentar obtener respuesta de API
            api_response = await self._get_api_response(prompt, conversation_context)
            
            if api_response:
                # Usar respuesta de API
                response = api_response.response
                source_api = api_response.source_api
                confidence = api_response.confidence
                used_memory = False
            else:
                # Intentar obtener respuesta de memoria
                memory_entry = await self._get_memory_response(prompt)
                
                if memory_entry:
                    response = memory_entry.paraphrased_response
                    source_api = f"{memory_entry.source_api}_memory"
                    confidence = memory_entry.confidence * 0.9  # Ligeramente menor confianza
                    used_memory = True
                else:
                    # Generar respuesta local
                    response = self._generate_local_response(prompt)
                    source_api = "local"
                    confidence = 0.7
                    used_memory = False
            
            # Parafrasear respuesta si está habilitado
            paraphrased_response = response
            if self.enable_paraphrasing and self.paraphraser:
                paraphrased_response = self._paraphrase_response(response)
            
            # Calcular tiempo de procesamiento
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Crear respuesta del chat
            chat_response = ChatResponse(
                original_response=response,
                paraphrased_response=paraphrased_response,
                source_api=source_api,
                confidence=confidence,
                processing_time=processing_time,
                keywords=keywords,
                context=json.dumps(conversation_context),
                used_memory=used_memory
            )
            
            # Almacenar en memoria
            self._store_response_in_memory(prompt, chat_response)
            
            # Actualizar estadísticas
            self._update_stats(chat_response)
            
            return chat_response
            
        except Exception as e:
            logger.error(f"Error en chat: {e}")
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return ChatResponse(
                original_response="Lo siento, hubo un error procesando tu solicitud.",
                paraphrased_response="Lo siento, hubo un error procesando tu solicitud.",
                source_api="error",
                confidence=0.0,
                processing_time=processing_time,
                keywords=[],
                context="",
                used_memory=False
            )
    
    async def _get_api_response(self, prompt: str, context: List[str] = None) -> Optional[APIResponse]:
        """Obtiene respuesta de API externa"""
        if not self.memory_manager:
            return None
            
        try:
            async with APIManager(self.memory_manager) as api_manager:
                return await api_manager.get_response(prompt, context)
        except Exception as e:
            logger.error(f"Error obteniendo respuesta de API: {e}")
            return None
    
    async def _get_memory_response(self, prompt: str) -> Optional[MemoryEntry]:
        """Obtiene respuesta desde la memoria"""
        if not self.memory_manager:
            return None
            
        try:
            return self.memory_manager.generate_response_from_memory(prompt, self.paraphraser)
        except Exception as e:
            logger.error(f"Error obteniendo respuesta de memoria: {e}")
            return None
    
    def _paraphrase_response(self, response: str) -> str:
        """Parafrasea una respuesta"""
        if not self.paraphraser:
            return response
            
        try:
            return self.paraphraser.paraphrase_from_memory(response)
        except Exception as e:
            logger.error(f"Error parafraseando respuesta: {e}")
            return response
        
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
        
    def _generate_local_response(self, prompt: str) -> str:
        """Genera respuesta local"""
        keywords = self._extract_keywords(prompt)
        
        if not keywords:
            return "🤔 Hmm, necesito más información para ayudarte mejor."
            
        # Respuestas específicas para el metaverso
        metaverse_responses = {
            "metaverso": "🌐 El metaverso es un espacio virtual 3D donde puedes interactuar, crear y explorar nuevos mundos digitales.",
            "avatar": "👤 Los avatares son tu representación digital en el metaverso. Puedes personalizarlos completamente.",
            "cripto": "₿ Las criptomonedas son la base económica del metaverso, permitiendo transacciones seguras y descentralizadas.",
            "nft": "🖼️ Los NFTs son activos digitales únicos que puedes poseer, intercambiar y usar en el metaverso.",
            "virtual": "🕶️ La realidad virtual te permite sumergirte completamente en experiencias digitales inmersivas.",
            "3d": "🎨 Los mundos 3D del metaverso ofrecen experiencias visuales y espaciales únicas.",
            "juego": "🎮 El metaverso combina gaming, socialización y economía digital en una experiencia completa.",
            "social": "👥 Conecta con personas de todo el mundo en espacios virtuales compartidos.",
            "crear": "🛠️ Construye y diseña tu propio espacio en el metaverso con herramientas creativas.",
            "explorar": "🗺️ Descubre nuevos mundos, experiencias y comunidades en el metaverso."
        }
        
        # Buscar coincidencias
        for keyword in keywords:
            if keyword in metaverse_responses:
                return metaverse_responses[keyword]
                
        # Respuesta genérica para la plataforma
        return f"🌟 En el metaverso {config.platform.platform_name}, puedes explorar, crear y conectar en un mundo virtual 3D. ¿Te gustaría saber más sobre algún aspecto específico?"
        
    def _get_conversation_context(self, limit: int = 5) -> List[str]:
        """Obtiene contexto de conversación reciente"""
        if not self.enable_memory:
            return []
            
        context = []
        for entry in list(self.conversation_history)[-limit:]:
            context.append(f"Usuario: {entry.user_input}")
            context.append(f"{self.name}: {entry.paraphrased_response}")
                
        return context
        
    def _store_response_in_memory(self, prompt: str, chat_response: ChatResponse):
        """Almacena la respuesta en memoria"""
        if not self.enable_memory:
            return
            
        # Crear entrada de memoria
        memory_entry = MemoryEntry(
            id=None,
            original_prompt=prompt,
            original_response=chat_response.original_response,
            paraphrased_response=chat_response.paraphrased_response,
            source_api=chat_response.source_api,
            timestamp=datetime.now(),
            confidence=chat_response.confidence,
            keywords=chat_response.keywords,
            context=chat_response.context,
            usage_count=0,
            effectiveness_score=0.5
        )
        
        # Almacenar en memoria con parafraseo de código
        self.memory_manager.store_memory_entry(memory_entry, self.paraphraser)
        
        # Crear entrada de conversación
        conversation_entry = ConversationEntry(
            id=None,
            user_input=prompt,
            lucia_response=chat_response.original_response,
            paraphrased_response=chat_response.paraphrased_response,
            timestamp=datetime.now(),
            source_api=chat_response.source_api,
            confidence=chat_response.confidence,
            processing_time=chat_response.processing_time,
            keywords=chat_response.keywords,
            context=chat_response.context
        )
        
        # Almacenar conversación
        self.memory_manager.store_conversation(conversation_entry)
        self.conversation_history.append(conversation_entry)
        
    def _update_stats(self, chat_response: ChatResponse):
        """Actualiza estadísticas"""
        self.stats["total_processing_time"] += chat_response.processing_time
        
        if chat_response.used_memory:
            self.stats["memory_requests"] += 1
        else:
            self.stats["api_requests"] += 1
            
        # Calcular confianza promedio
        total_requests = self.stats["total_requests"]
        current_avg = self.stats["average_confidence"]
        self.stats["average_confidence"] = ((current_avg * (total_requests - 1)) + chat_response.confidence) / total_requests
        
    def change_personality(self, new_personality: PersonalityType):
        """Cambia la personalidad de la IA"""
        old_personality = self.personality
        self.personality = new_personality
        
        # Actualizar paraphraser
        self.paraphraser = Paraphraser(ParaphraseConfig(
            personality=self.personality,
            confidence_threshold=config.memory.paraphrase_confidence
        ))
        
        return f"🎭 Personalidad cambiada de {old_personality.value} a {new_personality.value}!"
        
    def get_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas completas"""
        memory_stats = self.memory_manager.get_memory_stats() if self.memory_manager else {}
        
        return {
            "core_stats": self.stats,
            "memory_stats": memory_stats,
            "personality": self.personality.value,
            "name": self.name,
            "platform": config.platform.platform_name
        }
        
    def provide_feedback(self, feedback_type: str, rating: int = 0, comment: str = ""):
        """Permite al usuario proporcionar retroalimentación"""
        if not self.conversation_history:
            return "No hay conversaciones recientes para evaluar."
            
        last_entry = self.conversation_history[-1]
        
        feedback_responses = {
            "positivo": "😊 ¡Gracias por tu feedback positivo! Esto me ayuda a mejorar.",
            "negativo": "😔 Lamento no haber sido útil. Aprenderé de esto para mejorar.",
            "neutral": "🤔 Gracias por tu feedback. Seguiré trabajando en mejorar mis respuestas."
        }
        
        return feedback_responses.get(feedback_type, "Gracias por tu retroalimentación.")
        
    def export_conversation_history(self, format: str = "json") -> str:
        """Exporta el historial de conversaciones"""
        return self.memory_manager.export_memory(format) if self.memory_manager else "{}"
        
    def create_backup(self) -> str:
        """Crea un backup completo"""
        return self.memory_manager.create_backup() if self.memory_manager else "Backup no disponible"
        
    def cleanup_old_data(self, days: int = 30):
        """Limpia datos antiguos"""
        if self.memory_manager:
            self.memory_manager.cleanup_old_data(days)
        
    def search_conversations(self, query: str, limit: int = 10) -> List[Dict]:
        """Busca en el historial de conversaciones"""
        # Implementar búsqueda en memoria
        return []
        
    def reset_daily_limits(self):
        """Resetea los límites diarios de API"""
        # Limpiar contadores de uso diario
        if self.memory_manager:
            self.memory_manager.daily_usage.clear()
        return "🔄 Límites diarios de API reseteados" 