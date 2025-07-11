"""
API Connector para Gemini - Gestión avanzada de conexiones
WoldVirtual3DlucIA v0.6.0

Responsabilidades:
- Gestión de conexiones específicas para Gemini
- Manejo de errores y reconexión automática
- Pool de conexiones
- Rate limiting inteligente
"""

import asyncio
import aiohttp
import json
import logging
import time
from typing import Dict, List, Optional, Tuple, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import ssl
import certifi

logger = logging.getLogger(__name__)

class ConnectionStatus(Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ERROR = "error"
    RATE_LIMITED = "rate_limited"

@dataclass
class ConnectionConfig:
    """Configuración de conexión para Gemini"""
    api_key: str
    endpoint: str = "https://generativelanguage.googleapis.com/v1beta/models"
    model: str = "gemini-pro"
    max_retries: int = 3
    retry_delay: float = 1.0
    timeout: float = 30.0
    max_connections: int = 5
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000
    enable_ssl_verification: bool = True
    proxy_url: Optional[str] = None

@dataclass
class ConnectionMetrics:
    """Métricas de conexión"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    total_response_time: float = 0.0
    average_response_time: float = 0.0
    last_request_time: Optional[datetime] = None
    last_error_time: Optional[datetime] = None
    consecutive_failures: int = 0
    rate_limit_hits: int = 0

class GeminiAPIConnector:
    """Conector específico para API Gemini con gestión avanzada de conexiones"""
    
    def __init__(self, config: ConnectionConfig):
        self.config = config
        self.status = ConnectionStatus.DISCONNECTED
        self.metrics = ConnectionMetrics()
        self.session: Optional[aiohttp.ClientSession] = None
        self.connection_pool: List[aiohttp.ClientSession] = []
        self.rate_limit_tracker = RateLimitTracker(
            per_minute=config.rate_limit_per_minute,
            per_hour=config.rate_limit_per_hour
        )
        self.ssl_context = self._create_ssl_context()
        self._setup_logging()
        
    def _create_ssl_context(self) -> ssl.SSLContext:
        """Crea contexto SSL seguro"""
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        if not self.config.enable_ssl_verification:
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
        return ssl_context
        
    def _setup_logging(self):
        """Configura logging específico para el conector"""
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    async def __aenter__(self):
        """Context manager entry"""
        await self.connect()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        await self.disconnect()
        
    async def connect(self) -> bool:
        """Establece conexión con la API Gemini"""
        if self.status == ConnectionStatus.CONNECTED:
            return True
            
        self.status = ConnectionStatus.CONNECTING
        logger.info("🔗 Conectando a API Gemini...")
        
        try:
            # Crear sesión principal
            connector = aiohttp.TCPConnector(
                ssl=self.ssl_context,
                limit=self.config.max_connections,
                limit_per_host=self.config.max_connections,
                ttl_dns_cache=300,
                use_dns_cache=True
            )
            
            timeout = aiohttp.ClientTimeout(total=self.config.timeout)
            
            self.session = aiohttp.ClientSession(
                connector=connector,
                timeout=timeout,
                headers={
                    "User-Agent": "WoldVirtual3DlucIA/1.0",
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            )
            
            # Crear pool de conexiones
            await self._create_connection_pool()
            
            # Verificar conectividad
            if await self._test_connection():
                self.status = ConnectionStatus.CONNECTED
                logger.info("✅ Conexión a Gemini establecida")
                return True
            else:
                self.status = ConnectionStatus.ERROR
                logger.error("❌ Fallo en verificación de conectividad")
                return False
                
        except Exception as e:
            self.status = ConnectionStatus.ERROR
            logger.error(f"❌ Error al conectar a Gemini: {e}")
            return False
            
    async def disconnect(self):
        """Cierra todas las conexiones"""
        logger.info("🔌 Desconectando de API Gemini...")
        
        # Cerrar sesión principal
        if self.session:
            await self.session.close()
            self.session = None
            
        # Cerrar pool de conexiones
        for session in self.connection_pool:
            await session.close()
        self.connection_pool.clear()
        
        self.status = ConnectionStatus.DISCONNECTED
        logger.info("✅ Desconexión completada")
        
    async def send_request(self, prompt: str, context: List[str] = None) -> Dict[str, Any]:
        """Envía una petición a la API Gemini"""
        if self.status != ConnectionStatus.CONNECTED:
            await self.connect()
            
        # Verificar rate limiting
        if not self.rate_limit_tracker.can_make_request():
            self.status = ConnectionStatus.RATE_LIMITED
            raise Exception("Rate limit alcanzado")
            
        # Preparar datos de la petición
        request_data = self._prepare_request_data(prompt, context)
        
        # Intentar petición con reintentos
        for attempt in range(self.config.max_retries):
            try:
                start_time = time.time()
                
                response = await self._make_request(request_data)
                
                # Actualizar métricas
                self._update_metrics(True, time.time() - start_time)
                
                # Registrar petición exitosa
                self.rate_limit_tracker.record_request()
                
                return response
                
            except aiohttp.ClientError as e:
                logger.warning(f"Error de cliente en intento {attempt + 1}: {e}")
                self._update_metrics(False, 0)
                
                if attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay * (attempt + 1))
                else:
                    raise
                    
            except Exception as e:
                logger.error(f"Error inesperado en intento {attempt + 1}: {e}")
                self._update_metrics(False, 0)
                
                if attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay * (attempt + 1))
                else:
                    raise
                    
    async def _make_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Realiza la petición HTTP"""
        url = f"{self.config.endpoint}/{self.config.model}:generateContent"
        
        params = {
            "key": self.config.api_key
        }
        
        async with self.session.post(url, json=request_data, params=params) as response:
            if response.status == 200:
                return await response.json()
            elif response.status == 429:
                # Rate limit
                retry_after = int(response.headers.get("Retry-After", 60))
                logger.warning(f"Rate limit alcanzado. Reintentando en {retry_after} segundos")
                await asyncio.sleep(retry_after)
                raise Exception("Rate limit")
            elif response.status == 401:
                raise Exception("API key inválida")
            elif response.status == 403:
                raise Exception("Acceso denegado")
            else:
                error_text = await response.text()
                raise Exception(f"HTTP {response.status}: {error_text}")
                
    def _prepare_request_data(self, prompt: str, context: List[str] = None) -> Dict[str, Any]:
        """Prepara los datos de la petición para Gemini"""
        # Construir contenido
        content_parts = []
        
        # Agregar contexto si existe
        if context:
            context_text = "\n".join(context[-3:])  # Últimos 3 contextos
            content_parts.append({
                "text": f"Contexto previo:\n{context_text}\n\n"
            })
            
        # Agregar prompt principal
        content_parts.append({
            "text": prompt
        })
        
        return {
            "contents": [{
                "parts": content_parts
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
    async def _create_connection_pool(self):
        """Crea un pool de conexiones para mejor rendimiento"""
        for i in range(self.config.max_connections - 1):
            connector = aiohttp.TCPConnector(
                ssl=self.ssl_context,
                limit=1,
                limit_per_host=1
            )
            
            session = aiohttp.ClientSession(
                connector=connector,
                timeout=aiohttp.ClientTimeout(total=self.config.timeout)
            )
            
            self.connection_pool.append(session)
            
    async def _test_connection(self) -> bool:
        """Prueba la conectividad con la API"""
        try:
            test_prompt = "Test de conectividad"
            test_data = self._prepare_request_data(test_prompt)
            
            # Usar una petición simple para verificar conectividad
            url = f"{self.config.endpoint}/{self.config.model}:generateContent"
            params = {"key": self.config.api_key}
            
            async with self.session.post(url, json=test_data, params=params) as response:
                return response.status == 200
                
        except Exception as e:
            logger.error(f"Error en test de conectividad: {e}")
            return False
            
    def _update_metrics(self, success: bool, response_time: float):
        """Actualiza las métricas de conexión"""
        self.metrics.total_requests += 1
        self.metrics.last_request_time = datetime.now()
        
        if success:
            self.metrics.successful_requests += 1
            self.metrics.consecutive_failures = 0
            self.metrics.total_response_time += response_time
            self.metrics.average_response_time = (
                self.metrics.total_response_time / self.metrics.successful_requests
            )
        else:
            self.metrics.failed_requests += 1
            self.metrics.consecutive_failures += 1
            self.metrics.last_error_time = datetime.now()
            
    def get_connection_status(self) -> Dict[str, Any]:
        """Obtiene el estado actual de la conexión"""
        return {
            "status": self.status.value,
            "metrics": {
                "total_requests": self.metrics.total_requests,
                "successful_requests": self.metrics.successful_requests,
                "failed_requests": self.metrics.failed_requests,
                "average_response_time": self.metrics.average_response_time,
                "consecutive_failures": self.metrics.consecutive_failures,
                "rate_limit_hits": self.metrics.rate_limit_hits
            },
            "rate_limit": self.rate_limit_tracker.get_status(),
            "last_request": self.metrics.last_request_time.isoformat() if self.metrics.last_request_time else None,
            "last_error": self.metrics.last_error_time.isoformat() if self.metrics.last_error_time else None
        }
        
    def is_healthy(self) -> bool:
        """Verifica si la conexión está saludable"""
        if self.status != ConnectionStatus.CONNECTED:
            return False
            
        # Verificar si hay demasiados fallos consecutivos
        if self.metrics.consecutive_failures > 5:
            return False
            
        # Verificar si la última petición fue hace más de 5 minutos
        if (self.metrics.last_request_time and 
            datetime.now() - self.metrics.last_request_time > timedelta(minutes=5)):
            return False
            
        return True

class RateLimitTracker:
    """Rastreador de rate limiting"""
    
    def __init__(self, per_minute: int, per_hour: int):
        self.per_minute = per_minute
        self.per_hour = per_hour
        self.minute_requests: List[datetime] = []
        self.hour_requests: List[datetime] = []
        
    def can_make_request(self) -> bool:
        """Verifica si se puede hacer una petición"""
        now = datetime.now()
        
        # Limpiar requests antiguos
        self._cleanup_old_requests(now)
        
        # Verificar límites
        if len(self.minute_requests) >= self.per_minute:
            return False
            
        if len(self.hour_requests) >= self.per_hour:
            return False
            
        return True
        
    def record_request(self):
        """Registra una petición"""
        now = datetime.now()
        self.minute_requests.append(now)
        self.hour_requests.append(now)
        
    def _cleanup_old_requests(self, now: datetime):
        """Limpia requests antiguos"""
        # Limpiar requests de hace más de 1 minuto
        self.minute_requests = [
            req for req in self.minute_requests
            if now - req < timedelta(minutes=1)
        ]
        
        # Limpiar requests de hace más de 1 hora
        self.hour_requests = [
            req for req in self.hour_requests
            if now - req < timedelta(hours=1)
        ]
        
    def get_status(self) -> Dict[str, Any]:
        """Obtiene el estado del rate limiting"""
        now = datetime.now()
        self._cleanup_old_requests(now)
        
        return {
            "minute_requests": len(self.minute_requests),
            "hour_requests": len(self.hour_requests),
            "minute_limit": self.per_minute,
            "hour_limit": self.per_hour,
            "can_make_request": self.can_make_request()
        }

# Función de utilidad para crear conector
def create_gemini_connector(api_key: str, **kwargs) -> GeminiAPIConnector:
    """Crea un conector Gemini con configuración por defecto"""
    config = ConnectionConfig(api_key=api_key, **kwargs)
    return GeminiAPIConnector(config) 