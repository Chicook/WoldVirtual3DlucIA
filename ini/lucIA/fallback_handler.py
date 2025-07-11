"""
Fallback Handler para LucIA - Manejo de respuestas cuando APIs externas fallan
WoldVirtual3DlucIA v0.6.0

Responsabilidades:
- Manejo de fallbacks cuando APIs externas no están disponibles
- Respuestas locales inteligentes
- Cache de respuestas previas
- Degradación graceful del servicio
"""

import json
import logging
import hashlib
import time
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import random
import re

logger = logging.getLogger(__name__)

class FallbackType(Enum):
    CACHED_RESPONSE = "cached_response"
    LOCAL_RESPONSE = "local_response"
    SIMPLE_RESPONSE = "simple_response"
    ERROR_RESPONSE = "error_response"

@dataclass
class FallbackResponse:
    """Respuesta de fallback"""
    content: str
    fallback_type: FallbackType
    confidence: float
    source: str
    timestamp: datetime
    original_query: str
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class CachedResponse:
    """Respuesta en caché"""
    content: str
    query_hash: str
    timestamp: datetime
    usage_count: int = 0
    last_used: datetime = field(default_factory=datetime.now)

class FallbackHandler:
    """Manejador de fallbacks para cuando las APIs externas no están disponibles"""
    
    def __init__(self, cache_size: int = 1000, cache_ttl_hours: int = 24):
        self.cache_size = cache_size
        self.cache_ttl_hours = cache_ttl_hours
        self.response_cache: Dict[str, CachedResponse] = {}
        self.local_responses: Dict[str, List[str]] = self._load_local_responses()
        self.simple_responses: List[str] = self._load_simple_responses()
        self.fallback_stats = {
            "total_fallbacks": 0,
            "cached_responses": 0,
            "local_responses": 0,
            "simple_responses": 0,
            "error_responses": 0
        }
        self._setup_logging()
        
    def _setup_logging(self):
        """Configura logging para el fallback handler"""
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - FallbackHandler - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    def get_fallback_response(self, query: str, context: List[str] = None) -> FallbackResponse:
        """Obtiene una respuesta de fallback para una consulta"""
        self.fallback_stats["total_fallbacks"] += 1
        
        # Limpiar caché expirado
        self._cleanup_expired_cache()
        
        # Intentar obtener respuesta de caché
        cached_response = self._get_cached_response(query)
        if cached_response:
            self.fallback_stats["cached_responses"] += 1
            return FallbackResponse(
                content=cached_response.content,
                fallback_type=FallbackType.CACHED_RESPONSE,
                confidence=0.8,
                source="cache",
                timestamp=datetime.now(),
                original_query=query,
                metadata={"cache_hit": True, "usage_count": cached_response.usage_count}
            )
            
        # Intentar respuesta local inteligente
        local_response = self._get_local_response(query, context)
        if local_response:
            self.fallback_stats["local_responses"] += 1
            return FallbackResponse(
                content=local_response,
                fallback_type=FallbackType.LOCAL_RESPONSE,
                confidence=0.6,
                source="local_knowledge",
                timestamp=datetime.now(),
                original_query=query,
                metadata={"response_type": "local_knowledge"}
            )
            
        # Respuesta simple
        simple_response = self._get_simple_response(query)
        self.fallback_stats["simple_responses"] += 1
        return FallbackResponse(
            content=simple_response,
            fallback_type=FallbackType.SIMPLE_RESPONSE,
            confidence=0.3,
            source="simple_fallback",
            timestamp=datetime.now(),
            original_query=query,
            metadata={"response_type": "simple_fallback"}
        )
        
    def cache_response(self, query: str, response: str):
        """Guarda una respuesta en caché"""
        query_hash = self._hash_query(query)
        
        # Verificar si ya existe en caché
        if query_hash in self.response_cache:
            cached = self.response_cache[query_hash]
            cached.usage_count += 1
            cached.last_used = datetime.now()
        else:
            # Agregar nueva respuesta al caché
            self.response_cache[query_hash] = CachedResponse(
                content=response,
                query_hash=query_hash,
                timestamp=datetime.now(),
                usage_count=1
            )
            
            # Limpiar caché si está lleno
            if len(self.response_cache) > self.cache_size:
                self._cleanup_cache()
                
        logger.info(f"Respuesta cacheada para query: {query[:50]}...")
        
    def _get_cached_response(self, query: str) -> Optional[str]:
        """Obtiene una respuesta del caché"""
        query_hash = self._hash_query(query)
        cached = self.response_cache.get(query_hash)
        
        if cached:
            # Verificar si no ha expirado
            if datetime.now() - cached.timestamp < timedelta(hours=self.cache_ttl_hours):
                cached.usage_count += 1
                cached.last_used = datetime.now()
                logger.info(f"Cache hit para query: {query[:50]}...")
                return cached.content
            else:
                # Remover respuesta expirada
                del self.response_cache[query_hash]
                
        return None
        
    def _get_local_response(self, query: str, context: List[str] = None) -> Optional[str]:
        """Genera una respuesta local basada en conocimiento predefinido"""
        query_lower = query.lower()
        
        # Buscar en respuestas locales
        for category, responses in self.local_responses.items():
            if self._matches_category(query_lower, category):
                response = random.choice(responses)
                logger.info(f"Respuesta local encontrada para categoría: {category}")
                return response
                
        # Generar respuesta contextual si hay contexto
        if context:
            return self._generate_contextual_response(query, context)
            
        return None
        
    def _get_simple_response(self, query: str) -> str:
        """Obtiene una respuesta simple genérica"""
        # Seleccionar respuesta basada en el tipo de consulta
        if self._is_question(query):
            return random.choice([
                "Entiendo tu pregunta. En este momento estoy operando en modo local debido a problemas de conectividad.",
                "Es una buena pregunta. Te sugiero consultar la documentación del proyecto o intentar más tarde.",
                "No puedo proporcionar una respuesta completa en este momento, pero puedo ayudarte con información básica."
            ])
        elif self._is_greeting(query):
            return random.choice([
                "¡Hola! Soy LucIA, operando en modo local. ¿En qué puedo ayudarte?",
                "Saludos. Estoy aquí para asistirte con el proyecto WoldVirtual3DlucIA.",
                "¡Hola! Aunque estoy en modo local, puedo ayudarte con consultas básicas."
            ])
        else:
            return random.choice(self.simple_responses)
            
    def _generate_contextual_response(self, query: str, context: List[str]) -> str:
        """Genera una respuesta contextual basada en el historial"""
        # Analizar contexto para generar respuesta más relevante
        context_text = " ".join(context[-3:])  # Últimos 3 contextos
        
        if "error" in context_text.lower() or "problema" in context_text.lower():
            return "Veo que hay un problema en el contexto. Te sugiero revisar los logs y verificar la configuración."
        elif "configuración" in context_text.lower() or "setup" in context_text.lower():
            return "Para configurar el sistema, revisa los archivos de configuración en la carpeta config/."
        elif "api" in context_text.lower() or "gemini" in context_text.lower():
            return "La API Gemini está temporalmente no disponible. Estoy operando en modo local."
        else:
            return "Basándome en el contexto de la conversación, puedo ayudarte con información general del proyecto."
            
    def _matches_category(self, query: str, category: str) -> bool:
        """Verifica si una consulta coincide con una categoría"""
        category_keywords = {
            "saludos": ["hola", "buenos días", "buenas tardes", "saludos", "hey"],
            "despedida": ["adiós", "hasta luego", "nos vemos", "chao"],
            "ayuda": ["ayuda", "ayúdame", "soporte", "problema", "error"],
            "proyecto": ["proyecto", "woldvirtual", "metaverso", "lucia"],
            "tecnología": ["tecnología", "código", "programación", "desarrollo"],
            "configuración": ["config", "configuración", "setup", "instalación"],
            "api": ["api", "gemini", "openai", "conexión", "internet"]
        }
        
        keywords = category_keywords.get(category, [])
        return any(keyword in query for keyword in keywords)
        
    def _is_question(self, query: str) -> bool:
        """Verifica si la consulta es una pregunta"""
        question_words = ["qué", "cómo", "cuándo", "dónde", "por qué", "quién", "cuál"]
        return any(word in query.lower() for word in question_words) or query.strip().endswith("?")
        
    def _is_greeting(self, query: str) -> bool:
        """Verifica si la consulta es un saludo"""
        greeting_words = ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "saludos"]
        return any(word in query.lower() for word in greeting_words)
        
    def _hash_query(self, query: str) -> str:
        """Genera hash de la consulta para usar como clave de caché"""
        return hashlib.md5(query.lower().strip().encode()).hexdigest()
        
    def _cleanup_expired_cache(self):
        """Limpia respuestas expiradas del caché"""
        current_time = datetime.now()
        expired_keys = []
        
        for key, cached in self.response_cache.items():
            if current_time - cached.timestamp > timedelta(hours=self.cache_ttl_hours):
                expired_keys.append(key)
                
        for key in expired_keys:
            del self.response_cache[key]
            
        if expired_keys:
            logger.info(f"Limpiadas {len(expired_keys)} respuestas expiradas del caché")
            
    def _cleanup_cache(self):
        """Limpia el caché eliminando las respuestas menos usadas"""
        if len(self.response_cache) <= self.cache_size:
            return
            
        # Ordenar por uso y fecha
        sorted_cache = sorted(
            self.response_cache.items(),
            key=lambda x: (x[1].usage_count, x[1].last_used)
        )
        
        # Eliminar las respuestas menos usadas
        to_remove = len(self.response_cache) - self.cache_size
        for i in range(to_remove):
            del self.response_cache[sorted_cache[i][0]]
            
        logger.info(f"Limpieza de caché: eliminadas {to_remove} respuestas")
        
    def _load_local_responses(self) -> Dict[str, List[str]]:
        """Carga respuestas locales predefinidas"""
        return {
            "saludos": [
                "¡Hola! Soy LucIA, tu asistente de IA para WoldVirtual3DlucIA. ¿En qué puedo ayudarte?",
                "¡Saludos! Estoy aquí para asistirte con el desarrollo del metaverso.",
                "¡Hola! Bienvenido al proyecto WoldVirtual3DlucIA. ¿Cómo puedo ayudarte hoy?"
            ],
            "ayuda": [
                "Puedo ayudarte con desarrollo, configuración, debugging y más. ¿Qué necesitas específicamente?",
                "Estoy aquí para asistirte con el proyecto. ¿Tienes alguna pregunta o problema?",
                "Puedo ayudarte con código, documentación, configuración y desarrollo del metaverso."
            ],
            "proyecto": [
                "WoldVirtual3DlucIA es un metaverso descentralizado con arquitectura ultra-modular.",
                "El proyecto está desarrollado con múltiples tecnologías: TypeScript, Python, JavaScript, y más.",
                "La plataforma incluye un editor 3D, sistema de blockchain, IA integrada y mucho más."
            ],
            "configuración": [
                "Para configurar el proyecto, revisa los archivos en la carpeta config/.",
                "La configuración principal está en config/metaverso-config.json.",
                "Puedes usar los scripts de setup en la carpeta scripts/ para configuración automática."
            ],
            "api": [
                "Las APIs externas están temporalmente no disponibles. Estoy operando en modo local.",
                "Para problemas de API, verifica las claves en config/ y la conectividad de red.",
                "El sistema tiene fallbacks locales para cuando las APIs externas no están disponibles."
            ]
        }
        
    def _load_simple_responses(self) -> List[str]:
        """Carga respuestas simples genéricas"""
        return [
            "Entiendo tu consulta. Estoy operando en modo local debido a problemas de conectividad.",
            "Puedo ayudarte con información básica del proyecto mientras se restaura la conectividad.",
            "Estoy aquí para asistirte. ¿Hay algo específico sobre el proyecto que te gustaría saber?",
            "Aunque estoy en modo local, puedo proporcionarte información útil sobre WoldVirtual3DlucIA.",
            "Estoy disponible para ayudarte con consultas básicas mientras se resuelven los problemas de conectividad."
        ]
        
    def get_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del fallback handler"""
        return {
            "fallback_stats": self.fallback_stats,
            "cache_stats": {
                "total_cached": len(self.response_cache),
                "cache_size_limit": self.cache_size,
                "cache_ttl_hours": self.cache_ttl_hours
            },
            "local_responses": len(self.local_responses),
            "simple_responses": len(self.simple_responses)
        }
        
    def clear_cache(self):
        """Limpia todo el caché"""
        self.response_cache.clear()
        logger.info("Caché de fallback limpiado completamente")

# Instancia global del fallback handler
fallback_handler = FallbackHandler() 