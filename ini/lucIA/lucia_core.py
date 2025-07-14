"""
Núcleo principal de LucIA - IA de la Plataforma Metaverso
"""

import asyncio
import logging
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
from dataclasses import dataclass
from collections import deque

from config import config, PersonalityType, APIType
from memory import MemoryManager, MemoryEntry, ConversationEntry
from api_manager import APIManager, APIResponse
from paraphraser import Paraphraser, ParaphraseConfig
from enhanced_paraphraser import EnhancedParaphraser, EnhancedParaphraseResult, process_with_enhanced_paraphrasing
from query_optimizer import QueryOptimizer, OptimizationConfig, create_query_optimizer
from response_validator import ResponseValidator, ValidationResult
from context_manager import ContextManager, ContextType

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
    """Núcleo principal de la IA LucIA"""
    
    def __init__(self, 
                 name: str = None,
                 personality: PersonalityType = None,
                 enable_memory: bool = True,
                 enable_paraphrasing: bool = True,
                 enable_optimization: bool = True,
                 memory_interval: int = 2):
        
        # Configuración
        self.name = name or config.platform.ai_name
        self.personality = personality or config.platform.default_personality
        self.enable_memory = enable_memory
        self.enable_paraphrasing = enable_paraphrasing
        self.enable_optimization = enable_optimization
        self.memory_interval = memory_interval
        
        # Inicializar componentes
        self.memory_manager = MemoryManager()
        self.paraphraser = Paraphraser(ParaphraseConfig(
            personality=self.personality,
            confidence_threshold=config.memory.paraphrase_confidence
        ))
        self.response_validator = ResponseValidator()
        self.context_manager = ContextManager()
        
        # Inicializar optimizador de consultas
        if self.enable_optimization:
            self.query_optimizer = create_query_optimizer(
                self.memory_manager, 
                self.memory_interval
            )
        else:
            self.query_optimizer = None
        
        # Historial de conversación
        self.conversation_history = deque(maxlen=config.memory.max_conversations)
        
        # Estadísticas
        self.stats = {
            "total_requests": 0,
            "api_requests": 0,
            "memory_requests": 0,
            "total_processing_time": 0.0,
            "average_confidence": 0.0
        }
        
        # Mostrar información de inicialización
        self._show_startup_info()
        
    def _show_startup_info(self):
        """Muestra información de inicialización"""
        print(f"\n🚀 {self.name} - IA de la Plataforma {config.platform.platform_name}")
        print(f"🎭 Personalidad: {self.personality.value}")
        print(f"🧠 Memoria: {'✅' if self.enable_memory else '❌'}")
        print(f"🔄 Parafraseo: {'✅' if self.enable_paraphrasing else '❌'}")
        print(f"⚡ Optimización: {'✅' if self.enable_optimization else '❌'}")
        if self.enable_optimization:
            print(f"   📊 Intervalo memoria: cada {self.memory_interval} interacciones")
        print(f"📡 APIs configuradas: {len(config.get_enabled_apis())}")
        print(f"💾 Memoria cargada: {self.memory_manager.get_memory_stats().get('total_memory_entries', 0)} entradas")
        
    async def chat(self, prompt: str, context: List[str] = None, session_id: str = "default") -> ChatResponse:
        """Función principal de chat"""
        start_time = time.time()
        self.stats["total_requests"] += 1
        
        print(f"\n🤖 {self.name}: Procesando tu consulta...")
        
        # Gestionar contexto de sesión
        if session_id not in self.context_manager.active_contexts:
            self.context_manager.create_session(session_id, prompt)
        
        self.context_manager.add_message(session_id, prompt, is_user=True)
        
        # Obtener contexto inteligente
        conversation_context = self._get_conversation_context()
        context_data = self.context_manager.get_context_for_response(session_id, prompt)
        
        if context:
            conversation_context.extend(context)
            
        # Usar el sistema de optimización si está habilitado
        if self.enable_optimization and self.query_optimizer:
            print("⚡ Usando sistema de optimización de consultas...")
            
            # Procesar con optimizador
            optimization_result = await self.query_optimizer.optimize_query(
                prompt, conversation_context
            )
            
            if optimization_result.used_memory:
                print(f"🧠 Respuesta desde memoria local (ahorro: ${optimization_result.cost_saved:.4f})")
                if optimization_result.memory_entry_used:
                    print(f"   📍 Similitud: {optimization_result.similarity_score:.2f}")
            else:
                print(f"🚀 Respuesta desde APIs (costo: ${optimization_result.cost_saved:.4f})")
            
            # Crear respuesta del chat
            chat_response = ChatResponse(
                original_response=optimization_result.response,
                paraphrased_response=optimization_result.response,
                source_api=optimization_result.source,
                confidence=optimization_result.confidence,
                processing_time=optimization_result.processing_time,
                keywords=self._extract_keywords(prompt),
                context=", ".join(conversation_context[-3:]) if conversation_context else "",
                used_memory=optimization_result.used_memory
            )
            
            # Almacenar en memoria si es una oportunidad de aprendizaje
            if optimization_result.learning_opportunity:
                self._store_response_in_memory(prompt, chat_response)
            
            # Actualizar contexto con la respuesta
            self.context_manager.add_message(session_id, optimization_result.response, is_user=False)
            
            # Actualizar estadísticas
            self._update_stats(chat_response)
            
            print(f"📡 Respuesta optimizada obtenida en {optimization_result.processing_time:.2f}s")
            print(f"🎯 Confianza: {optimization_result.confidence:.2f}")
            return chat_response
        
        # Usar el nuevo sistema de parafraseo mejorado si está habilitado
        elif self.enable_paraphrasing and config.platform.enable_api_rotation:
            print("🚀 Usando sistema de parafraseo mejorado (Deepseek -> Gemini -> Deepseek)...")
            
            # Procesar con parafraseo mejorado
            enhanced_result = await process_with_enhanced_paraphrasing(
                prompt, conversation_context, self.memory_manager
            )
            
            if enhanced_result.success:
                # Validar calidad de la respuesta final
                validation_result = self.response_validator.validate_response(
                    enhanced_result.final_response, prompt, conversation_context
                )
                
                # Crear respuesta del chat con datos del proceso mejorado
                chat_response = ChatResponse(
                    original_response=enhanced_result.gemini_response,
                    paraphrased_response=enhanced_result.final_response,
                    source_api="gemini_pro (mejorado con deepseek)",
                    confidence=validation_result.confidence,
                    processing_time=enhanced_result.total_time,
                    keywords=self._extract_keywords(prompt),
                    context=", ".join(conversation_context[-3:]) if conversation_context else "",
                    used_memory=False
                )
                
                # Mostrar información del proceso
                print(f"📊 Estadísticas del proceso:")
                print(f"   ⏱️ Parafraseo entrada: {enhanced_result.input_paraphrase_time:.2f}s")
                print(f"   🤖 Gemini: {enhanced_result.gemini_time:.2f}s")
                print(f"   ✨ Parafraseo salida: {enhanced_result.output_paraphrase_time:.2f}s")
                print(f"   🎯 Total: {enhanced_result.total_time:.2f}s")
                
                # Almacenar en memoria
                self._store_response_in_memory(prompt, chat_response)
                
                # Actualizar contexto con la respuesta
                self.context_manager.add_message(session_id, enhanced_result.final_response, is_user=False)
                
                # Actualizar estadísticas
                self._update_stats(chat_response)
                
                print(f"📡 Respuesta mejorada obtenida en {enhanced_result.total_time:.2f}s")
                print(f"🎯 Calidad: {validation_result.quality_score:.1f}/100")
                return chat_response
            else:
                print(f"⚠️ Error en parafraseo mejorado: {enhanced_result.error_message}")
                print("🔄 Fallback a sistema tradicional...")
        
        # Sistema tradicional como fallback
        api_response = await self._get_api_response(prompt, conversation_context)
        
        if api_response and api_response.success:
            # Validar calidad de la respuesta
            validation_result = self.response_validator.validate_response(
                api_response.content, prompt, conversation_context
            )
            
            # Mejorar respuesta si es necesario
            improved_response = api_response.content
            if not validation_result.is_valid:
                improved_response = self.response_validator.improve_response(
                    api_response.content, validation_result
                )
            
            # Parafrasear respuesta si está habilitado
            paraphrased_response = self._paraphrase_response(improved_response)
            
            # Crear respuesta del chat
            chat_response = ChatResponse(
                original_response=improved_response,
                paraphrased_response=paraphrased_response,
                source_api=api_response.source_api,
                confidence=validation_result.confidence,
                processing_time=api_response.processing_time,
                keywords=self._extract_keywords(prompt),
                context=", ".join(conversation_context[-3:]) if conversation_context else "",
                used_memory=False
            )
            
            # Almacenar en memoria
            self._store_response_in_memory(prompt, chat_response)
            
            # Actualizar contexto con la respuesta
            self.context_manager.add_message(session_id, paraphrased_response, is_user=False)
            
            # Actualizar estadísticas
            self._update_stats(chat_response)
            
            # Mostrar información de validación si hay problemas
            if not validation_result.is_valid:
                print(f"⚠️ Respuesta mejorada - Problemas detectados: {len(validation_result.issues)}")
            
            print(f"📡 Respuesta obtenida de {api_response.source_api} en {api_response.processing_time:.2f}s")
            print(f"🎯 Calidad: {validation_result.quality_score:.1f}/100")
            return chat_response
            
        else:
            # Usar memoria como fallback
            print(f"🏠 APIs no disponibles, consultando memoria...")
            memory_response = await self._get_memory_response(prompt)
            
            if memory_response:
                chat_response = ChatResponse(
                    original_response=memory_response.original_response,
                    paraphrased_response=memory_response.paraphrased_response,
                    source_api=memory_response.source_api,
                    confidence=memory_response.confidence,
                    processing_time=time.time() - start_time,
                    keywords=self._extract_keywords(prompt),
                    context="",
                    used_memory=True
                )
                
                print(f"🧠 Respuesta obtenida de memoria (fuente: {memory_response.source_api})")
                return chat_response
            else:
                # Respuesta local como último recurso
                local_response = self._generate_local_response(prompt)
                paraphrased_local = self._paraphrase_response(local_response)
                
                chat_response = ChatResponse(
                    original_response=local_response,
                    paraphrased_response=paraphrased_local,
                    source_api="local",
                    confidence=0.5,
                    processing_time=time.time() - start_time,
                    keywords=self._extract_keywords(prompt),
                    context="",
                    used_memory=False
                )
                
                print(f"🏠 Respuesta generada localmente")
                return chat_response
                
    async def _get_api_response(self, prompt: str, context: List[str] = None) -> Optional[APIResponse]:
        """Obtiene respuesta de las APIs"""
        async with APIManager(self.memory_manager) as api_manager:
            return await api_manager.get_response(prompt, context)
            
    async def _get_memory_response(self, prompt: str) -> Optional[MemoryEntry]:
        """Obtiene respuesta de la memoria con parafraseo mejorado"""
        if not self.enable_memory:
            return None
            
        # Usar el nuevo método que genera respuestas parafraseadas desde memoria
        return self.memory_manager.generate_response_from_memory(prompt, self.paraphraser)
        
    def _paraphrase_response(self, response: str) -> str:
        """Parafrasea la respuesta si está habilitado"""
        if not self.enable_paraphrasing:
            return response
            
        return self.paraphraser.paraphrase(response)
        
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrae palabras clave del texto"""
        # Implementación simple de extracción de palabras clave
        import re
        
        # Palabras comunes a ignorar
        stop_words = {
            "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", "da", "su", "por", "son", 
            "con", "para", "al", "una", "me", "tu", "como", "qué", "cómo", "dónde", "cuándo", "por", "qué", "muy", 
            "más", "pero", "si", "yo", "él", "ella", "nosotros", "vosotros", "ellos", "ellas", "este", "esta", "estos", 
            "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "aquellos", "aquellas", "ser", "estar", "tener", 
            "hacer", "decir", "poder", "ir", "ver", "dar", "saber", "querer", "llegar", "pasar", "deber", "poner", 
            "parecer", "quedar", "creer", "hablar", "llevar", "dejar", "seguir", "encontrar", "llamar", "venir", 
            "pensar", "salir", "volver", "tomar", "conocer", "vivir", "sentir", "tratar", "mirar", "contar", "empezar", 
            "esperar", "buscar", "existir", "entrar", "trabajar", "escribir", "perder", "producir", "ocurrir", "entender", 
            "pedir", "recibir", "recordar", "terminar", "permitir", "aparecer", "conseguir", "comenzar", "servir", 
            "sacar", "necesitar", "mantener", "resultar", "leer", "caer", "cambiar", "presentar", "crear", "abrir", 
            "considerar", "oír", "puede", "podría", "debería", "haría", "sería", "estaría", "tendría", "vendría"
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
        memory_stats = self.memory_manager.get_memory_stats()
        api_status = self._get_api_status()
        
        stats = {
            "core_stats": self.stats,
            "memory_stats": memory_stats,
            "api_status": api_status,
            "personality": self.personality.value,
            "name": self.name,
            "platform": config.platform.platform_name
        }
        
        # Añadir estadísticas de optimización si está habilitada
        if self.enable_optimization and self.query_optimizer:
            stats["optimization_stats"] = self.query_optimizer.get_optimization_stats()
        
        return stats
        
    def _get_api_status(self) -> Dict[str, Dict]:
        """Obtiene el estado de las APIs de forma sincrónica"""
        try:
            # Crear instancia temporal para obtener estado
            api_manager = APIManager(self.memory_manager)
            return api_manager.get_api_status()
        except Exception as e:
            logger.error(f"Error obteniendo estado de APIs: {e}")
            return {}
            
    def provide_feedback(self, feedback_type: str, rating: int = 0, comment: str = ""):
        """Permite al usuario proporcionar retroalimentación"""
        if not self.conversation_history:
            return "No hay conversaciones recientes para evaluar."
            
        last_entry = self.conversation_history[-1]
        
        # Actualizar efectividad en memoria
        if rating > 0:
            effectiveness = min(rating / 5.0, 1.0)
            
            # Buscar entrada en memoria y actualizar
            conn = self.memory_manager.db_path
            # Aquí se actualizaría la efectividad en la base de datos
            
        feedback_responses = {
            "positivo": "😊 ¡Gracias por tu feedback positivo! Esto me ayuda a mejorar.",
            "negativo": "😔 Lamento no haber sido útil. Aprenderé de esto para mejorar.",
            "neutral": "🤔 Gracias por tu feedback. Seguiré trabajando en mejorar mis respuestas."
        }
        
        return feedback_responses.get(feedback_type, "Gracias por tu retroalimentación.")
        
    def export_conversation_history(self, format: str = "json") -> str:
        """Exporta el historial de conversaciones"""
        return self.memory_manager.export_memory(format)
        
    def create_backup(self) -> str:
        """Crea un backup completo"""
        return self.memory_manager.create_backup()
        
    def cleanup_old_data(self, days: int = 30):
        """Limpia datos antiguos"""
        self.memory_manager.cleanup_old_data(days)
        
    def search_conversations(self, query: str, limit: int = 10) -> List[Dict]:
        """Busca en el historial de conversaciones"""
        # Implementar búsqueda en memoria
        return []
        
    def reset_daily_limits(self):
        """Resetea los límites diarios de API"""
        # Limpiar contadores de uso diario
        self.memory_manager.daily_usage.clear()
        return "🔄 Límites diarios de API reseteados" 