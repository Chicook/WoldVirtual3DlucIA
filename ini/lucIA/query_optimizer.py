"""
Sistema de Optimización de Consultas para LucIA
Optimiza el uso de APIs usando memoria local cada N interacciones
"""

import asyncio
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import deque
from pathlib import Path

from config import config
from memory import MemoryManager, MemoryEntry
from paraphraser import Paraphraser, ParaphraseConfig
from enhanced_paraphraser import EnhancedParaphraser, EnhancedParaphraseResult

logger = logging.getLogger(__name__)

@dataclass
class OptimizationConfig:
    """Configuración de optimización"""
    memory_every_n: int = 3  # Cada cuántas interacciones usar memoria (la tercera)
    min_memory_entries: int = 10  # Mínimo de entradas en memoria para usar optimización
    similarity_threshold: float = 0.6  # Umbral de similitud para respuestas de memoria
    max_memory_age_days: int = 30  # Máxima edad de respuestas en memoria
    enable_learning: bool = True  # Habilitar aprendizaje de nuevas respuestas
    cost_savings_tracking: bool = True  # Rastrear ahorros de costos

@dataclass
class OptimizationResult:
    """Resultado de la optimización"""
    used_memory: bool
    response: str
    source: str
    confidence: float
    processing_time: float
    cost_saved: float
    learning_opportunity: bool
    memory_entry_used: Optional[MemoryEntry] = None
    similarity_score: float = 0.0

class QueryOptimizer:
    """
    Sistema de optimización que alterna entre APIs y memoria local
    para reducir costos y mejorar el entrenamiento a largo plazo
    """
    
    def __init__(self, 
                 memory_manager: MemoryManager,
                 config: OptimizationConfig = None):
        self.memory_manager = memory_manager
        self.config = config or OptimizationConfig()
        
        # Contador de interacciones
        self.interaction_counter = 0
        
        # Historial de optimizaciones
        self.optimization_history = deque(maxlen=100)
        
        # Estadísticas de ahorro
        self.cost_savings = {
            "total_saved": 0.0,
            "memory_responses": 0,
            "api_responses": 0,
            "last_reset": datetime.now()
        }
        
        # Inicializar paraphraser
        from config import config as global_config
        self.paraphraser = Paraphraser(ParaphraseConfig(
            personality=global_config.platform.default_personality,
            confidence_threshold=0.8
        ))
        
        logger.info(f"QueryOptimizer inicializado con memoria cada {self.config.memory_every_n} interacciones")
        
    def should_use_memory(self, prompt: str) -> bool:
        """
        Determina si debe usar memoria local en lugar de APIs
        
        Args:
            prompt: La consulta del usuario
            
        Returns:
            True si debe usar memoria, False si debe usar APIs
        """
        self.interaction_counter += 1
        # Usar memoria solo en la tercera de cada ciclo de 3
        if self.interaction_counter % self.config.memory_every_n == 0:
            memory_stats = self.memory_manager.get_memory_stats()
            if memory_stats.get('total_memory_entries', 0) >= self.config.min_memory_entries:
                logger.info(f"Usando memoria local (interacción {self.interaction_counter})")
                return True
        logger.info(f"Usando APIs (interacción {self.interaction_counter})")
        return False
    
    async def optimize_query(self, 
                           prompt: str, 
                           context: List[str] = None,
                           enhanced_paraphraser: EnhancedParaphraser = None) -> OptimizationResult:
        """
        Optimiza una consulta usando memoria local o APIs según la configuración
        
        Args:
            prompt: La consulta del usuario
            context: Contexto de la conversación
            enhanced_paraphraser: Instancia del paraphraser mejorado (opcional)
            
        Returns:
            OptimizationResult con la respuesta optimizada
        """
        start_time = datetime.now()
        
        try:
            # Determinar si usar memoria o APIs
            use_memory = self.should_use_memory(prompt)
            
            if use_memory:
                return await self._process_with_memory(prompt, context, start_time)
            else:
                return await self._process_with_apis(prompt, context, start_time, enhanced_paraphraser)
                
        except Exception as e:
            logger.error(f"Error en optimización de consulta: {e}")
            # Fallback a respuesta local
            return self._generate_fallback_response(prompt, start_time)
    
    async def _process_with_memory(self, 
                                 prompt: str, 
                                 context: List[str] = None,
                                 start_time: datetime = None) -> OptimizationResult:
        """
        Procesa la consulta usando memoria local
        """
        if start_time is None:
            start_time = datetime.now()
            
        print("🧠 Procesando con memoria local (optimización activa)...")
        
        # Buscar respuesta similar en memoria
        memory_entry = self.memory_manager.find_similar_memory(
            prompt, 
            min_similarity=self.config.similarity_threshold
        )
        
        if memory_entry:
            # Verificar que la respuesta no sea muy antigua
            age_days = (datetime.now() - memory_entry.timestamp).days
            if age_days <= self.config.max_memory_age_days:
                
                # Parafrasear la respuesta para personalizarla
                paraphrased_response = self.paraphraser.paraphrase(memory_entry.paraphrased_response)
                
                processing_time = (datetime.now() - start_time).total_seconds()
                
                # Calcular similitud
                similarity = self._calculate_similarity(prompt, memory_entry.original_prompt)
                
                # Actualizar estadísticas
                self._update_cost_savings(True, 0.0)  # Ahorro estimado
                
                # Incrementar uso de la entrada de memoria
                self._increment_memory_usage(memory_entry)
                
                print(f"✅ Respuesta encontrada en memoria (similitud: {similarity:.2f})")
                
                return OptimizationResult(
                    used_memory=True,
                    response=paraphrased_response,
                    source=f"memoria_local (original: {memory_entry.source_api})",
                    confidence=memory_entry.confidence * similarity,
                    processing_time=processing_time,
                    cost_saved=0.002,  # Estimación de ahorro
                    learning_opportunity=True,
                    memory_entry_used=memory_entry,
                    similarity_score=similarity
                )
        
        # Si no hay respuesta adecuada en memoria, generar una local
        print("⚠️ No se encontró respuesta similar en memoria, generando respuesta local...")
        
        local_response = self._generate_local_response(prompt)
        paraphrased_local = self.paraphraser.paraphrase(local_response)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Aún cuenta como ahorro porque no usamos APIs
        self._update_cost_savings(True, 0.001)
        
        return OptimizationResult(
            used_memory=True,
            response=paraphrased_local,
            source="memoria_local (generada)",
            confidence=0.6,
            processing_time=processing_time,
            cost_saved=0.001,
            learning_opportunity=True
        )
    
    async def _process_with_apis(self, 
                               prompt: str, 
                               context: List[str] = None,
                               start_time: datetime = None,
                               enhanced_paraphraser: EnhancedParaphraser = None) -> OptimizationResult:
        """
        Procesa la consulta usando APIs (sistema tradicional)
        """
        if start_time is None:
            start_time = datetime.now()
            
        print("🚀 Procesando con APIs (sistema tradicional)...")
        
        try:
            if enhanced_paraphraser:
                # Usar sistema de parafraseo mejorado
                enhanced_result = await enhanced_paraphraser.process_with_enhanced_paraphrasing(
                    prompt, context
                )
                
                if enhanced_result.success:
                    processing_time = (datetime.now() - start_time).total_seconds()
                    
                    # Actualizar estadísticas
                    self._update_cost_savings(False, 0.003)  # Costo estimado
                    
                    return OptimizationResult(
                        used_memory=False,
                        response=enhanced_result.final_response,
                        source="apis_mejoradas",
                        confidence=0.9,
                        processing_time=processing_time,
                        cost_saved=0.0,
                        learning_opportunity=True
                    )
            
            # Fallback a sistema tradicional
            from api_manager import APIManager
            
            async with APIManager(self.memory_manager) as api_manager:
                api_response = await api_manager.get_response(prompt, context)
                
                if api_response and api_response.success:
                    processing_time = (datetime.now() - start_time).total_seconds()
                    
                    # Parafrasear respuesta
                    paraphrased_response = self.paraphraser.paraphrase(api_response.content)
                    
                    # Actualizar estadísticas
                    self._update_cost_savings(False, api_response.cost)
                    
                    return OptimizationResult(
                        used_memory=False,
                        response=paraphrased_response,
                        source=api_response.source_api,
                        confidence=api_response.confidence,
                        processing_time=processing_time,
                        cost_saved=0.0,
                        learning_opportunity=True
                    )
        
        except Exception as e:
            logger.error(f"Error procesando con APIs: {e}")
        
        # Fallback a respuesta local si las APIs fallan
        return self._generate_fallback_response(prompt, start_time)
    
    def _generate_fallback_response(self, prompt: str, start_time: datetime = None) -> OptimizationResult:
        """
        Genera una respuesta de fallback
        """
        if start_time is None:
            start_time = datetime.now()
            
        print("🏠 Generando respuesta de fallback...")
        
        local_response = self._generate_local_response(prompt)
        paraphrased_local = self.paraphraser.paraphrase(local_response)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return OptimizationResult(
            used_memory=True,
            response=paraphrased_local,
            source="fallback_local",
            confidence=0.5,
            processing_time=processing_time,
            cost_saved=0.001,
            learning_opportunity=True
        )
    
    def _generate_local_response(self, prompt: str) -> str:
        """
        Genera una respuesta local basada en palabras clave
        """
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
        
        # Buscar palabras clave en el prompt
        prompt_lower = prompt.lower()
        for keyword, response in metaverse_responses.items():
            if keyword in prompt_lower:
                return response
        
        # Respuesta genérica
        return f"🌟 En el metaverso {config.platform.platform_name}, puedes explorar, crear y conectar en un mundo virtual 3D. ¿Te gustaría saber más sobre algún aspecto específico?"
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calcula la similitud entre dos textos
        """
        # Implementación simple basada en palabras comunes
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union)
    
    def _update_cost_savings(self, used_memory: bool, cost: float):
        """
        Actualiza las estadísticas de ahorro de costos
        """
        if not self.config.cost_savings_tracking:
            return
            
        if used_memory:
            self.cost_savings["total_saved"] += cost
            self.cost_savings["memory_responses"] += 1
        else:
            self.cost_savings["api_responses"] += 1
    
    def _increment_memory_usage(self, memory_entry: MemoryEntry):
        """
        Incrementa el contador de uso de una entrada de memoria
        """
        try:
            conn = sqlite3.connect(self.memory_manager.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE memory_entries 
                SET usage_count = usage_count + 1 
                WHERE id = ?
            ''', (memory_entry.id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error incrementando uso de memoria: {e}")
    
    def get_optimization_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas de optimización
        """
        memory_stats = self.memory_manager.get_memory_stats()
        
        return {
            "interaction_counter": self.interaction_counter,
            "memory_every_n": self.config.memory_every_n,
            "cost_savings": self.cost_savings,
            "memory_stats": memory_stats,
            "optimization_history_length": len(self.optimization_history),
            "next_memory_use": self.config.memory_every_n - (self.interaction_counter % self.config.memory_every_n)
        }
    
    def reset_counter(self):
        """
        Reinicia el contador de interacciones
        """
        self.interaction_counter = 0
        logger.info("Contador de interacciones reiniciado")
    
    def update_config(self, new_config: OptimizationConfig):
        """
        Actualiza la configuración de optimización
        """
        self.config = new_config
        logger.info(f"Configuración de optimización actualizada: memoria cada {new_config.memory_every_n} interacciones")

# Función de conveniencia
def create_query_optimizer(memory_manager: MemoryManager, 
                          memory_every_n: int = 3) -> QueryOptimizer:
    """
    Crea un optimizador de consultas con configuración personalizada
    
    Args:
        memory_manager: Gestor de memoria
        memory_every_n: Cada cuántas interacciones usar memoria (la tercera)
        
    Returns:
        QueryOptimizer configurado
    """
    config = OptimizationConfig(
        memory_every_n=memory_every_n,
        min_memory_entries=10,
        similarity_threshold=0.6,
        max_memory_age_days=30,
        enable_learning=True,
        cost_savings_tracking=True
    )
    
    return QueryOptimizer(memory_manager, config) 