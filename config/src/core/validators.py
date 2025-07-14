# ============================================================================
# ✅ VALIDATORS - Validadores de Configuración
# ============================================================================

import re
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from pydantic import BaseModel, validator, ValidationError
import jsonschema
from cerberus import Validator as CerberusValidator

# ============================================================================
# 🏗️ VALIDADORES BASE
# ============================================================================

class BaseValidator:
    """Validador base con funcionalidades comunes."""
    
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
    
    def add_error(self, message: str):
        """Agregar error de validación."""
        self.errors.append(message)
    
    def add_warning(self, message: str):
        """Agregar advertencia de validación."""
        self.warnings.append(message)
    
    def has_errors(self) -> bool:
        """Verificar si hay errores."""
        return len(self.errors) > 0
    
    def has_warnings(self) -> bool:
        """Verificar si hay advertencias."""
        return len(self.warnings) > 0
    
    def get_errors(self) -> List[str]:
        """Obtener lista de errores."""
        return self.errors.copy()
    
    def get_warnings(self) -> List[str]:
        """Obtener lista de advertencias."""
        return self.warnings.copy()
    
    def clear(self):
        """Limpiar errores y advertencias."""
        self.errors.clear()
        self.warnings.clear()

# ============================================================================
# 🌐 VALIDADOR DE REDES BLOCKCHAIN
# ============================================================================

class NetworkValidator(BaseValidator):
    """Validador para configuraciones de redes blockchain."""
    
    def __init__(self):
        super().__init__()
        self.supported_networks = [
            'ethereum', 'polygon', 'bsc', 'arbitrum', 
            'optimism', 'avalanche', 'fantom', 'cronos'
        ]
        self.supported_testnets = [
            'goerli', 'sepolia', 'mumbai', 'bsc-testnet',
            'arbitrum-goerli', 'optimism-goerli', 'fuji'
        ]
    
    def validate_network_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración de red."""
        self.clear()
        
        # Validar red principal
        if 'network' not in config:
            self.add_error("Network configuration must specify 'network'")
            return False
        
        network = config['network']
        if network not in self.supported_networks:
            self.add_error(f"Unsupported network: {network}")
            return False
        
        # Validar RPC URL
        if 'rpc_url' not in config:
            self.add_error("Network configuration must specify 'rpc_url'")
            return False
        
        if not self._validate_rpc_url(config['rpc_url']):
            self.add_error("Invalid RPC URL format")
            return False
        
        # Validar chain ID
        if 'chain_id' in config:
            if not isinstance(config['chain_id'], int) or config['chain_id'] <= 0:
                self.add_error("Chain ID must be a positive integer")
                return False
        
        # Validar configuración de gas
        if 'gas_config' in config:
            if not self._validate_gas_config(config['gas_config']):
                return False
        
        # Validar explorador
        if 'explorer' in config:
            if not self._validate_explorer_url(config['explorer']):
                self.add_warning("Invalid explorer URL format")
        
        return not self.has_errors()
    
    def _validate_rpc_url(self, url: str) -> bool:
        """Validar formato de RPC URL."""
        if not url:
            return False
        
        # Patrones válidos para RPC URLs
        patterns = [
            r'^https?://[^\s/$.?#].[^\s]*$',  # HTTP/HTTPS
            r'^wss?://[^\s/$.?#].[^\s]*$',   # WebSocket
        ]
        
        return any(re.match(pattern, url) for pattern in patterns)
    
    def _validate_gas_config(self, gas_config: Dict[str, Any]) -> bool:
        """Validar configuración de gas."""
        required_fields = ['gas_limit', 'gas_price']
        
        for field in required_fields:
            if field not in gas_config:
                self.add_error(f"Gas configuration must specify '{field}'")
                return False
            
            value = gas_config[field]
            if not isinstance(value, int) or value <= 0:
                self.add_error(f"Gas {field} must be a positive integer")
                return False
        
        return True
    
    def _validate_explorer_url(self, url: str) -> bool:
        """Validar URL del explorador."""
        if not url:
            return False
        
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        return bool(re.match(pattern, url))

# ============================================================================
# 📜 VALIDADOR DE CONTRATOS
# ============================================================================

class ContractValidator(BaseValidator):
    """Validador para configuraciones de contratos inteligentes."""
    
    def __init__(self):
        super().__init__()
        self.supported_compilers = ['0.8.0', '0.8.19', '0.8.20', '0.8.21']
    
    def validate_contract_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración de contrato."""
        self.clear()
        
        # Validar nombre del contrato
        if 'name' not in config:
            self.add_error("Contract configuration must specify 'name'")
            return False
        
        if not self._validate_contract_name(config['name']):
            self.add_error("Invalid contract name format")
            return False
        
        # Validar versión del compilador
        if 'compiler_version' in config:
            if config['compiler_version'] not in self.supported_compilers:
                self.add_warning(f"Compiler version {config['compiler_version']} not in supported list")
        
        # Validar optimizador
        if 'optimizer' in config:
            if not self._validate_optimizer_config(config['optimizer']):
                return False
        
        # Validar constructor arguments
        if 'constructor_args' in config:
            if not self._validate_constructor_args(config['constructor_args']):
                return False
        
        return not self.has_errors()
    
    def validate_abi(self, abi: List[Dict[str, Any]]) -> bool:
        """Validar ABI de contrato."""
        self.clear()
        
        if not isinstance(abi, list):
            self.add_error("ABI must be a list")
            return False
        
        for item in abi:
            if not isinstance(item, dict):
                self.add_error("ABI items must be dictionaries")
                return False
            
            if 'type' not in item:
                self.add_error("ABI items must specify 'type'")
                return False
        
        return not self.has_errors()
    
    def validate_bytecode(self, bytecode: str) -> bool:
        """Validar bytecode de contrato."""
        self.clear()
        
        if not bytecode:
            self.add_error("Bytecode cannot be empty")
            return False
        
        # Validar formato hexadecimal
        if not re.match(r'^0x[a-fA-F0-9]+$', bytecode):
            self.add_error("Bytecode must be valid hexadecimal starting with 0x")
            return False
        
        # Validar longitud mínima
        if len(bytecode) < 4:
            self.add_error("Bytecode too short")
            return False
        
        return not self.has_errors()
    
    def _validate_contract_name(self, name: str) -> bool:
        """Validar nombre del contrato."""
        if not name:
            return False
        
        # Patrón para nombres de contratos Solidity
        pattern = r'^[A-Z][a-zA-Z0-9_]*$'
        return bool(re.match(pattern, name))
    
    def _validate_optimizer_config(self, optimizer: Dict[str, Any]) -> bool:
        """Validar configuración del optimizador."""
        if 'enabled' in optimizer and not isinstance(optimizer['enabled'], bool):
            self.add_error("Optimizer enabled must be boolean")
            return False
        
        if 'runs' in optimizer:
            runs = optimizer['runs']
            if not isinstance(runs, int) or runs < 0:
                self.add_error("Optimizer runs must be non-negative integer")
                return False
        
        return True
    
    def _validate_constructor_args(self, args: Dict[str, Any]) -> bool:
        """Validar argumentos del constructor."""
        # Validación básica - en una implementación real sería más compleja
        if not isinstance(args, dict):
            self.add_error("Constructor arguments must be a dictionary")
            return False
        
        return True

# ============================================================================
# 🗄️ VALIDADOR DE BASE DE DATOS
# ============================================================================

class DatabaseValidator(BaseValidator):
    """Validador para configuraciones de base de datos."""
    
    def __init__(self):
        super().__init__()
        self.supported_databases = ['postgresql', 'mongodb', 'redis', 'mysql']
    
    def validate_database_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración de base de datos."""
        self.clear()
        
        # Validar tipo de base de datos
        if 'type' not in config:
            self.add_error("Database configuration must specify 'type'")
            return False
        
        db_type = config['type']
        if db_type not in self.supported_databases:
            self.add_error(f"Unsupported database type: {db_type}")
            return False
        
        # Validar configuración específica según el tipo
        if db_type == 'postgresql':
            return self._validate_postgresql_config(config)
        elif db_type == 'mongodb':
            return self._validate_mongodb_config(config)
        elif db_type == 'redis':
            return self._validate_redis_config(config)
        
        return not self.has_errors()
    
    def _validate_postgresql_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración de PostgreSQL."""
        required_fields = ['host', 'port', 'database', 'username']
        
        for field in required_fields:
            if field not in config:
                self.add_error(f"PostgreSQL configuration must specify '{field}'")
                return False
        
        # Validar puerto
        port = config['port']
        if not isinstance(port, int) or port < 1 or port > 65535:
            self.add_error("Port must be between 1 and 65535")
            return False
        
        # Validar pool de conexiones
        if 'pool_size' in config:
            pool_size = config['pool_size']
            if not isinstance(pool_size, int) or pool_size < 1:
                self.add_error("Pool size must be a positive integer")
                return False
        
        return True
    
    def _validate_mongodb_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración de MongoDB."""
        if 'uri' not in config:
            self.add_error("MongoDB configuration must specify 'uri'")
            return False
        
        uri = config['uri']
        if not uri.startswith('mongodb://') and not uri.startswith('mongodb+srv://'):
            self.add_error("MongoDB URI must start with mongodb:// or mongodb+srv://")
            return False
        
        return True
    
    def _validate_redis_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración de Redis."""
        required_fields = ['host', 'port']
        
        for field in required_fields:
            if field not in config:
                self.add_error(f"Redis configuration must specify '{field}'")
                return False
        
        # Validar puerto
        port = config['port']
        if not isinstance(port, int) or port < 1 or port > 65535:
            self.add_error("Port must be between 1 and 65535")
            return False
        
        # Validar base de datos
        if 'database' in config:
            db = config['database']
            if not isinstance(db, int) or db < 0:
                self.add_error("Database must be a non-negative integer")
                return False
        
        return True

# ============================================================================
# 🔐 VALIDADOR DE SEGURIDAD
# ============================================================================

class SecurityValidator(BaseValidator):
    """Validador para configuraciones de seguridad."""
    
    def __init__(self):
        super().__init__()
    
    def validate_security_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración de seguridad."""
        self.clear()
        
        # Validar JWT
        if 'jwt' in config:
            if not self._validate_jwt_config(config['jwt']):
                return False
        
        # Validar CORS
        if 'cors' in config:
            if not self._validate_cors_config(config['cors']):
                return False
        
        # Validar rate limiting
        if 'rate_limiting' in config:
            if not self._validate_rate_limiting_config(config['rate_limiting']):
                return False
        
        # Validar encriptación
        if 'encryption' in config:
            if not self._validate_encryption_config(config['encryption']):
                return False
        
        return not self.has_errors()
    
    def _validate_jwt_config(self, jwt_config: Dict[str, Any]) -> bool:
        """Validar configuración JWT."""
        if 'secret' not in jwt_config:
            self.add_error("JWT configuration must specify 'secret'")
            return False
        
        secret = jwt_config['secret']
        if len(secret) < 32:
            self.add_warning("JWT secret should be at least 32 characters long")
        
        # Validar algoritmo
        if 'algorithm' in jwt_config:
            algorithm = jwt_config['algorithm']
            valid_algorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']
            if algorithm not in valid_algorithms:
                self.add_error(f"Invalid JWT algorithm: {algorithm}")
                return False
        
        # Validar expiración
        if 'expiration' in jwt_config:
            expiration = jwt_config['expiration']
            if not isinstance(expiration, int) or expiration <= 0:
                self.add_error("JWT expiration must be a positive integer")
                return False
        
        return True
    
    def _validate_cors_config(self, cors_config: Dict[str, Any]) -> bool:
        """Validar configuración CORS."""
        if 'origins' in cors_config:
            origins = cors_config['origins']
            if not isinstance(origins, list):
                self.add_error("CORS origins must be a list")
                return False
            
            for origin in origins:
                if not self._validate_origin(origin):
                    self.add_error(f"Invalid CORS origin: {origin}")
                    return False
        
        return True
    
    def _validate_rate_limiting_config(self, rate_config: Dict[str, Any]) -> bool:
        """Validar configuración de rate limiting."""
        if 'requests_per_minute' in rate_config:
            requests = rate_config['requests_per_minute']
            if not isinstance(requests, int) or requests <= 0:
                self.add_error("Requests per minute must be a positive integer")
                return False
        
        if 'window_size' in rate_config:
            window = rate_config['window_size']
            if not isinstance(window, int) or window <= 0:
                self.add_error("Window size must be a positive integer")
                return False
        
        return True
    
    def _validate_encryption_config(self, encryption_config: Dict[str, Any]) -> bool:
        """Validar configuración de encriptación."""
        if 'key' not in encryption_config:
            self.add_error("Encryption configuration must specify 'key'")
            return False
        
        key = encryption_config['key']
        if len(key) < 32:
            self.add_warning("Encryption key should be at least 32 characters long")
        
        return True
    
    def _validate_origin(self, origin: str) -> bool:
        """Validar origen CORS."""
        if origin == '*':
            return True
        
        # Patrón para URLs válidas
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        return bool(re.match(pattern, origin))

# ============================================================================
# 🎯 VALIDADOR PRINCIPAL
# ============================================================================

class ConfigValidator(BaseValidator):
    """Validador principal para toda la configuración del sistema."""
    
    def __init__(self):
        super().__init__()
        self.network_validator = NetworkValidator()
        self.contract_validator = ContractValidator()
        self.database_validator = DatabaseValidator()
        self.security_validator = SecurityValidator()
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración completa del sistema."""
        self.clear()
        
        # Validar configuración del metaverso
        if 'metaverso' in config:
            if not self._validate_metaverso_config(config['metaverso']):
                return False
        
        # Validar configuraciones de redes
        if 'networks' in config:
            if not self._validate_networks_config(config['networks']):
                return False
        
        # Validar configuraciones de contratos
        if 'contracts' in config:
            if not self._validate_contracts_config(config['contracts']):
                return False
        
        # Validar configuraciones de base de datos
        if 'database' in config:
            if not self._validate_databases_config(config['database']):
                return False
        
        # Validar configuraciones de seguridad
        if 'security' in config:
            if not self._validate_security_config(config['security']):
                return False
        
        # Validar configuraciones de API
        if 'api' in config:
            if not self._validate_api_config(config['api']):
                return False
        
        return not self.has_errors()
    
    def validate_config_file(self, filepath: Union[str, Path]) -> bool:
        """Validar archivo de configuración."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                config = json.load(f)
            return self.validate_config(config)
        except FileNotFoundError:
            self.add_error(f"Configuration file not found: {filepath}")
            return False
        except json.JSONDecodeError as e:
            self.add_error(f"Invalid JSON in configuration file: {e}")
            return False
        except Exception as e:
            self.add_error(f"Error reading configuration file: {e}")
            return False
    
    def _validate_metaverso_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuración del metaverso."""
        required_fields = ['name', 'version', 'environment']
        
        for field in required_fields:
            if field not in config:
                self.add_error(f"Metaverso configuration must specify '{field}'")
                return False
        
        # Validar entorno
        environment = config['environment']
        valid_environments = ['development', 'staging', 'production', 'testing']
        if environment not in valid_environments:
            self.add_error(f"Invalid environment: {environment}")
            return False
        
        # Validar configuración de rendimiento
        if 'max_players' in config:
            max_players = config['max_players']
            if not isinstance(max_players, int) or max_players <= 0:
                self.add_error("Max players must be a positive integer")
                return False
        
        return True
    
    def _validate_networks_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuraciones de redes."""
        if not isinstance(config, dict):
            self.add_error("Networks configuration must be a dictionary")
            return False
        
        for network_name, network_config in config.items():
            if not self.network_validator.validate_network_config(network_config):
                self.errors.extend(self.network_validator.get_errors())
                return False
        
        return True
    
    def _validate_contracts_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuraciones de contratos."""
        if not isinstance(config, dict):
            self.add_error("Contracts configuration must be a dictionary")
            return False
        
        for contract_name, contract_config in config.items():
            if not self.contract_validator.validate_contract_config(contract_config):
                self.errors.extend(self.contract_validator.get_errors())
                return False
        
        return True
    
    def _validate_databases_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuraciones de base de datos."""
        if not isinstance(config, dict):
            self.add_error("Database configuration must be a dictionary")
            return False
        
        for db_name, db_config in config.items():
            if not self.database_validator.validate_database_config(db_config):
                self.errors.extend(self.database_validator.get_errors())
                return False
        
        return True
    
    def _validate_security_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuraciones de seguridad."""
        return self.security_validator.validate_security_config(config)
    
    def _validate_api_config(self, config: Dict[str, Any]) -> bool:
        """Validar configuraciones de API."""
        if not isinstance(config, dict):
            self.add_error("API configuration must be a dictionary")
            return False
        
        # Validar host y puerto
        if 'host' in config:
            host = config['host']
            if not isinstance(host, str):
                self.add_error("API host must be a string")
                return False
        
        if 'port' in config:
            port = config['port']
            if not isinstance(port, int) or port < 1 or port > 65535:
                self.add_error("API port must be between 1 and 65535")
                return False
        
        return True

# ============================================================================
# 📦 EXPORTACIONES
# ============================================================================

__all__ = [
    'BaseValidator',
    'NetworkValidator',
    'ContractValidator',
    'DatabaseValidator',
    'SecurityValidator',
    'ConfigValidator'
] 