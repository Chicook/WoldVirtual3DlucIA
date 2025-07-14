# ============================================================================
# ⚙️ SETTINGS - Configuraciones Principales del Sistema
# ============================================================================

import os
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from pydantic import BaseSettings, Field, validator
from pydantic_settings import BaseSettings as PydanticBaseSettings

# ============================================================================
# 🏗️ CONFIGURACIÓN BASE
# ============================================================================

class BaseConfig(PydanticBaseSettings):
    """Configuración base con validaciones Pydantic."""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# ============================================================================
# 🎮 CONFIGURACIÓN DEL METAVERSO
# ============================================================================

class MetaversoConfig(BaseConfig):
    """Configuración principal del metaverso."""
    
    # Información básica
    name: str = Field(default="Metaverso Crypto World Virtual 3D", description="Nombre del metaverso")
    version: str = Field(default="1.0.0", description="Versión del sistema")
    description: str = Field(default="Metaverso descentralizado Web3", description="Descripción del sistema")
    
    # Configuración de la aplicación
    debug: bool = Field(default=False, description="Modo debug")
    environment: str = Field(default="development", description="Entorno de ejecución")
    log_level: str = Field(default="INFO", description="Nivel de logging")
    
    # Configuración de rendimiento
    max_players: int = Field(default=1000, description="Máximo número de jugadores")
    max_objects_per_scene: int = Field(default=10000, description="Máximo objetos por escena")
    target_fps: int = Field(default=60, description="FPS objetivo")
    
    # Configuración de seguridad
    enable_encryption: bool = Field(default=True, description="Habilitar encriptación")
    session_timeout: int = Field(default=3600, description="Timeout de sesión en segundos")
    max_login_attempts: int = Field(default=5, description="Máximo intentos de login")
    
    # Configuración de blockchain
    default_network: str = Field(default="ethereum", description="Red blockchain por defecto")
    gas_limit: int = Field(default=3000000, description="Límite de gas por defecto")
    gas_price: int = Field(default=20000000000, description="Precio de gas por defecto")
    
    @validator('environment')
    def validate_environment(cls, v):
        valid_environments = ['development', 'staging', 'production', 'testing']
        if v not in valid_environments:
            raise ValueError(f'Environment must be one of {valid_environments}')
        return v
    
    @validator('log_level')
    def validate_log_level(cls, v):
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Log level must be one of {valid_levels}')
        return v.upper()

# ============================================================================
# 🌐 CONFIGURACIÓN DE REDES
# ============================================================================

class NetworkConfig(BaseConfig):
    """Configuración de redes blockchain."""
    
    # Ethereum
    ethereum_mainnet_rpc: str = Field(default="https://mainnet.infura.io/v3/YOUR_PROJECT_ID")
    ethereum_goerli_rpc: str = Field(default="https://goerli.infura.io/v3/YOUR_PROJECT_ID")
    ethereum_sepolia_rpc: str = Field(default="https://sepolia.infura.io/v3/YOUR_PROJECT_ID")
    
    # Polygon
    polygon_mainnet_rpc: str = Field(default="https://polygon-rpc.com")
    polygon_mumbai_rpc: str = Field(default="https://rpc-mumbai.maticvigil.com")
    
    # BSC
    bsc_mainnet_rpc: str = Field(default="https://bsc-dataseed.binance.org")
    bsc_testnet_rpc: str = Field(default="https://data-seed-prebsc-1-s1.binance.org:8545")
    
    # Arbitrum
    arbitrum_mainnet_rpc: str = Field(default="https://arb1.arbitrum.io/rpc")
    arbitrum_goerli_rpc: str = Field(default="https://goerli-rollup.arbitrum.io/rpc")
    
    # Optimism
    optimism_mainnet_rpc: str = Field(default="https://mainnet.optimism.io")
    optimism_goerli_rpc: str = Field(default="https://goerli.optimism.io")
    
    # Avalanche
    avalanche_mainnet_rpc: str = Field(default="https://api.avax.network/ext/bc/C/rpc")
    avalanche_fuji_rpc: str = Field(default="https://api.avax-test.network/ext/bc/C/rpc")
    
    # Configuración general
    default_gas_limit: int = Field(default=3000000)
    default_gas_price: int = Field(default=20000000000)
    max_retries: int = Field(default=3)
    timeout: int = Field(default=30)

# ============================================================================
# 📜 CONFIGURACIÓN DE CONTRATOS
# ============================================================================

class ContractConfig(BaseConfig):
    """Configuración de contratos inteligentes."""
    
    # Directorios
    contracts_dir: str = Field(default="contracts/", description="Directorio de contratos")
    abis_dir: str = Field(default="contracts/abis/", description="Directorio de ABIs")
    artifacts_dir: str = Field(default="artifacts/", description="Directorio de artifacts")
    
    # Configuración de compilación
    compiler_version: str = Field(default="0.8.19", description="Versión del compilador Solidity")
    optimizer_enabled: bool = Field(default=True, description="Habilitar optimizador")
    optimizer_runs: int = Field(default=200, description="Runs del optimizador")
    
    # Configuración de deploy
    auto_verify: bool = Field(default=True, description="Verificación automática")
    constructor_args: Dict[str, Any] = Field(default_factory=dict, description="Argumentos del constructor")
    
    # Configuración de gas
    gas_estimate_buffer: float = Field(default=1.2, description="Buffer para estimación de gas")
    max_gas_price: int = Field(default=100000000000, description="Precio máximo de gas")

# ============================================================================
# 🗄️ CONFIGURACIÓN DE BASE DE DATOS
# ============================================================================

class DatabaseConfig(BaseConfig):
    """Configuración de base de datos."""
    
    # PostgreSQL
    postgres_host: str = Field(default="localhost", description="Host de PostgreSQL")
    postgres_port: int = Field(default=5432, description="Puerto de PostgreSQL")
    postgres_user: str = Field(default="metaverso", description="Usuario de PostgreSQL")
    postgres_password: str = Field(default="", description="Contraseña de PostgreSQL")
    postgres_database: str = Field(default="metaverso", description="Base de datos de PostgreSQL")
    
    # MongoDB
    mongo_uri: str = Field(default="mongodb://localhost:27017", description="URI de MongoDB")
    mongo_database: str = Field(default="metaverso", description="Base de datos de MongoDB")
    
    # Redis
    redis_host: str = Field(default="localhost", description="Host de Redis")
    redis_port: int = Field(default=6379, description="Puerto de Redis")
    redis_password: str = Field(default="", description="Contraseña de Redis")
    redis_database: int = Field(default=0, description="Base de datos de Redis")
    
    # Configuración general
    connection_pool_size: int = Field(default=10, description="Tamaño del pool de conexiones")
    connection_timeout: int = Field(default=30, description="Timeout de conexión")
    max_retries: int = Field(default=3, description="Máximo reintentos")

# ============================================================================
# 🔐 CONFIGURACIÓN DE SEGURIDAD
# ============================================================================

class SecurityConfig(BaseConfig):
    """Configuración de seguridad."""
    
    # JWT
    jwt_secret: str = Field(default="your-secret-key", description="Clave secreta JWT")
    jwt_algorithm: str = Field(default="HS256", description="Algoritmo JWT")
    jwt_expiration: int = Field(default=3600, description="Expiración JWT en segundos")
    
    # CORS
    cors_origins: List[str] = Field(default=["http://localhost:3000"], description="Orígenes CORS permitidos")
    cors_methods: List[str] = Field(default=["GET", "POST", "PUT", "DELETE"], description="Métodos CORS permitidos")
    cors_headers: List[str] = Field(default=["*"], description="Headers CORS permitidos")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=100, description="Límite de requests por minuto")
    rate_limit_window: int = Field(default=60, description="Ventana de rate limiting en segundos")
    
    # Encriptación
    encryption_key: str = Field(default="your-encryption-key", description="Clave de encriptación")
    encryption_algorithm: str = Field(default="AES-256-GCM", description="Algoritmo de encriptación")

# ============================================================================
# 📡 CONFIGURACIÓN DE API
# ============================================================================

class APIConfig(BaseConfig):
    """Configuración de APIs."""
    
    # API Principal
    api_host: str = Field(default="0.0.0.0", description="Host de la API")
    api_port: int = Field(default=8000, description="Puerto de la API")
    api_workers: int = Field(default=4, description="Número de workers")
    
    # API Externa
    ipfs_gateway: str = Field(default="https://ipfs.io/ipfs/", description="Gateway de IPFS")
    pinata_api_key: str = Field(default="", description="API Key de Pinata")
    pinata_secret_key: str = Field(default="", description="Secret Key de Pinata")
    
    # APIs de Blockchain
    etherscan_api_key: str = Field(default="", description="API Key de Etherscan")
    polygonscan_api_key: str = Field(default="", description="API Key de Polygonscan")
    bscscan_api_key: str = Field(default="", description="API Key de BSCScan")
    
    # Configuración general
    request_timeout: int = Field(default=30, description="Timeout de requests")
    max_retries: int = Field(default=3, description="Máximo reintentos")
    cache_ttl: int = Field(default=300, description="TTL del cache en segundos")

# ============================================================================
# 🎮 CONFIGURACIÓN DE JUEGO
# ============================================================================

class GameConfig(BaseConfig):
    """Configuración del juego/metaverso."""
    
    # Configuración de mundo
    world_size: int = Field(default=10000, description="Tamaño del mundo en unidades")
    chunk_size: int = Field(default=100, description="Tamaño de chunk en unidades")
    max_chunks_loaded: int = Field(default=100, description="Máximo chunks cargados")
    
    # Configuración de física
    gravity: float = Field(default=-9.81, description="Gravedad del mundo")
    physics_tick_rate: int = Field(default=60, description="Tick rate de física")
    collision_detection: bool = Field(default=True, description="Detección de colisiones")
    
    # Configuración de renderizado
    render_distance: int = Field(default=1000, description="Distancia de renderizado")
    shadow_quality: str = Field(default="medium", description="Calidad de sombras")
    texture_quality: str = Field(default="medium", description="Calidad de texturas")
    
    # Configuración de audio
    audio_enabled: bool = Field(default=True, description="Audio habilitado")
    audio_channels: int = Field(default=32, description="Número de canales de audio")
    audio_sample_rate: int = Field(default=44100, description="Sample rate de audio")

# ============================================================================
# 📊 CONFIGURACIÓN DE MONITOREO
# ============================================================================

class MonitoringConfig(BaseConfig):
    """Configuración de monitoreo."""
    
    # Métricas
    metrics_enabled: bool = Field(default=True, description="Métricas habilitadas")
    metrics_port: int = Field(default=9090, description="Puerto de métricas")
    metrics_path: str = Field(default="/metrics", description="Path de métricas")
    
    # Logging
    log_file: str = Field(default="logs/metaverso.log", description="Archivo de log")
    log_max_size: int = Field(default=100, description="Tamaño máximo de log en MB")
    log_backup_count: int = Field(default=5, description="Número de backups de log")
    
    # Alertas
    alerts_enabled: bool = Field(default=True, description="Alertas habilitadas")
    alert_webhook: str = Field(default="", description="Webhook para alertas")
    alert_threshold: float = Field(default=0.9, description="Umbral de alertas")

# ============================================================================
# 🎯 CONFIGURACIÓN PRINCIPAL
# ============================================================================

@dataclass
class Settings:
    """Configuración principal del sistema."""
    
    # Configuraciones específicas
    metaverso: MetaversoConfig = field(default_factory=MetaversoConfig)
    networks: NetworkConfig = field(default_factory=NetworkConfig)
    contracts: ContractConfig = field(default_factory=ContractConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    security: SecurityConfig = field(default_factory=SecurityConfig)
    api: APIConfig = field(default_factory=APIConfig)
    game: GameConfig = field(default_factory=GameConfig)
    monitoring: MonitoringConfig = field(default_factory=MonitoringConfig)
    
    # Configuración de archivos
    config_dir: Path = field(default=Path("config/"))
    config_file: str = field(default="config.json")
    
    def __post_init__(self):
        """Inicialización post-construcción."""
        self._load_from_file()
        self._validate_config()
    
    def _load_from_file(self):
        """Cargar configuración desde archivo."""
        config_path = self.config_dir / self.config_file
        if config_path.exists():
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    config_data = json.load(f)
                self._update_from_dict(config_data)
            except Exception as e:
                print(f"Error loading config file: {e}")
    
    def _update_from_dict(self, config_data: Dict[str, Any]):
        """Actualizar configuración desde diccionario."""
        for key, value in config_data.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def _validate_config(self):
        """Validar configuración."""
        # Validaciones básicas
        if self.metaverso.max_players <= 0:
            raise ValueError("max_players must be positive")
        
        if self.game.world_size <= 0:
            raise ValueError("world_size must be positive")
        
        if self.networks.default_gas_limit <= 0:
            raise ValueError("default_gas_limit must be positive")
    
    def save_to_file(self, filepath: Optional[str] = None):
        """Guardar configuración en archivo."""
        if filepath is None:
            filepath = self.config_dir / self.config_file
        
        config_data = self.to_dict()
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir configuración a diccionario."""
        return {
            'metaverso': self.metaverso.dict(),
            'networks': self.networks.dict(),
            'contracts': self.contracts.dict(),
            'database': self.database.dict(),
            'security': self.security.dict(),
            'api': self.api.dict(),
            'game': self.game.dict(),
            'monitoring': self.monitoring.dict()
        }
    
    def get_network_rpc(self, network: str, testnet: bool = False) -> str:
        """Obtener RPC URL para una red específica."""
        network_configs = {
            'ethereum': {
                'mainnet': self.networks.ethereum_mainnet_rpc,
                'testnet': self.networks.ethereum_goerli_rpc
            },
            'polygon': {
                'mainnet': self.networks.polygon_mainnet_rpc,
                'testnet': self.networks.polygon_mumbai_rpc
            },
            'bsc': {
                'mainnet': self.networks.bsc_mainnet_rpc,
                'testnet': self.networks.bsc_testnet_rpc
            }
        }
        
        if network not in network_configs:
            raise ValueError(f"Unsupported network: {network}")
        
        return network_configs[network]['testnet' if testnet else 'mainnet']
    
    def get_database_url(self, db_type: str = 'postgres') -> str:
        """Obtener URL de base de datos."""
        if db_type == 'postgres':
            return f"postgresql://{self.database.postgres_user}:{self.database.postgres_password}@{self.database.postgres_host}:{self.database.postgres_port}/{self.database.postgres_database}"
        elif db_type == 'mongo':
            return f"{self.database.mongo_uri}/{self.database.mongo_database}"
        else:
            raise ValueError(f"Unsupported database type: {db_type}")

# ============================================================================
# 🛠️ FUNCIONES DE CONVENIENCIA
# ============================================================================

_settings_instance: Optional[Settings] = None

def get_settings(environment: str = None) -> Settings:
    """
    Obtener instancia de configuración.
    
    Args:
        environment: Entorno específico a cargar
    
    Returns:
        Instancia de configuración
    """
    global _settings_instance
    
    if _settings_instance is None:
        _settings_instance = Settings()
        
        # Cargar configuración específica del entorno
        if environment:
            _settings_instance.metaverso.environment = environment
            _load_environment_config(_settings_instance, environment)
    
    return _settings_instance

def _load_environment_config(settings: Settings, environment: str):
    """Cargar configuración específica del entorno."""
    env_file = f".env.{environment}"
    if os.path.exists(env_file):
        # Cargar variables de entorno específicas
        from dotenv import load_dotenv
        load_dotenv(env_file)

def reload_settings() -> Settings:
    """Recargar configuración desde archivos."""
    global _settings_instance
    _settings_instance = None
    return get_settings()

def update_settings(updates: Dict[str, Any]) -> Settings:
    """Actualizar configuración con nuevos valores."""
    settings = get_settings()
    
    for key, value in updates.items():
        if hasattr(settings, key):
            setattr(settings, key, value)
    
    return settings

# ============================================================================
# 📦 EXPORTACIONES
# ============================================================================

__all__ = [
    'Settings',
    'MetaversoConfig',
    'NetworkConfig',
    'ContractConfig',
    'DatabaseConfig',
    'SecurityConfig',
    'APIConfig',
    'GameConfig',
    'MonitoringConfig',
    'get_settings',
    'reload_settings',
    'update_settings'
]
