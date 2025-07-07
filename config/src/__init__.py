# ============================================================================
# 📁 CONFIG - Sistema de Configuración Centralizada
# ============================================================================

"""
Sistema de configuración centralizada para el Metaverso Crypto World Virtual 3D.

Este módulo proporciona:
- Gestión de configuraciones globales y por entorno
- Configuración de redes blockchain
- Gestión de contratos inteligentes
- Validación y carga de configuraciones
- Utilidades de configuración
"""

__version__ = "1.0.0"
__author__ = "Metaverso Team"
__email__ = "team@metaverso.com"

# ============================================================================
# 📦 EXPORTACIONES PRINCIPALES
# ============================================================================

from .core.settings import get_settings, Settings
from .core.validators import ConfigValidator
from .core.loaders import ConfigLoader

from .networks.networks import NetworkManager, get_network_config
from .networks.ethereum import EthereumConfig
from .networks.polygon import PolygonConfig
from .networks.bsc import BSCConfig

from .contracts.addresses import ContractAddresses, get_contract_address
from .contracts.deploy import ContractDeployer
from .contracts.verification import ContractVerifier

from .environments.environments import EnvironmentManager
from .environments.development import DevelopmentEnvironment
from .environments.staging import StagingEnvironment
from .environments.production import ProductionEnvironment

from .utils.crypto import CryptoUtils
from .utils.validation import ValidationUtils
from .utils.helpers import ConfigHelpers

# ============================================================================
# 🎯 CONFIGURACIONES PREDEFINIDAS
# ============================================================================

# Configuraciones de redes soportadas
SUPPORTED_NETWORKS = [
    'ethereum',
    'polygon',
    'bsc',
    'arbitrum',
    'optimism',
    'avalanche'
]

# Entornos soportados
SUPPORTED_ENVIRONMENTS = [
    'development',
    'staging',
    'production',
    'testing'
]

# Tipos de contratos soportados
SUPPORTED_CONTRACT_TYPES = [
    'token',
    'nft',
    'marketplace',
    'governance',
    'defi',
    'metaverso'
]

# ============================================================================
# 🛠️ FUNCIONES DE CONVENIENCIA
# ============================================================================

def initialize_config(environment: str = 'development') -> Settings:
    """
    Inicializar configuración del sistema.
    
    Args:
        environment: Entorno a cargar ('development', 'staging', 'production')
    
    Returns:
        Configuración inicializada
    """
    return get_settings(environment)

def get_network_manager() -> NetworkManager:
    """
    Obtener gestor de redes blockchain.
    
    Returns:
        Gestor de redes configurado
    """
    return NetworkManager()

def get_environment_manager() -> EnvironmentManager:
    """
    Obtener gestor de entornos.
    
    Returns:
        Gestor de entornos configurado
    """
    return EnvironmentManager()

def validate_config(config: dict) -> bool:
    """
    Validar configuración.
    
    Args:
        config: Configuración a validar
    
    Returns:
        True si la configuración es válida
    """
    validator = ConfigValidator()
    return validator.validate(config)

# ============================================================================
# 📊 ESTADÍSTICAS DE CONFIGURACIÓN
# ============================================================================

CONFIG_STATS = {
    'networks': len(SUPPORTED_NETWORKS),
    'environments': len(SUPPORTED_ENVIRONMENTS),
    'contract_types': len(SUPPORTED_CONTRACT_TYPES),
    'version': __version__
}

# ============================================================================
# 🎯 VERSIÓN Y METADATOS
# ============================================================================

__all__ = [
    # Core
    'get_settings',
    'Settings',
    'ConfigValidator',
    'ConfigLoader',
    
    # Networks
    'NetworkManager',
    'get_network_config',
    'EthereumConfig',
    'PolygonConfig',
    'BSCConfig',
    
    # Contracts
    'ContractAddresses',
    'get_contract_address',
    'ContractDeployer',
    'ContractVerifier',
    
    # Environments
    'EnvironmentManager',
    'DevelopmentEnvironment',
    'StagingEnvironment',
    'ProductionEnvironment',
    
    # Utils
    'CryptoUtils',
    'ValidationUtils',
    'ConfigHelpers',
    
    # Convenience functions
    'initialize_config',
    'get_network_manager',
    'get_environment_manager',
    'validate_config',
    
    # Constants
    'SUPPORTED_NETWORKS',
    'SUPPORTED_ENVIRONMENTS',
    'SUPPORTED_CONTRACT_TYPES',
    'CONFIG_STATS'
] 