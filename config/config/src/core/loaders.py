# ============================================================================
# 📂 LOADERS - Cargadores de Configuración
# ============================================================================

import os
import json
import yaml
import toml
from pathlib import Path
from typing import Dict, Any, Optional, Union, List
from dataclasses import dataclass
import logging

# ============================================================================
# 🏗️ CARGADOR BASE
# ============================================================================

class BaseLoader:
    """Cargador base con funcionalidades comunes."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.loaded_configs: Dict[str, Any] = {}
    
    def load(self, filepath: Union[str, Path]) -> Dict[str, Any]:
        """Cargar configuración desde archivo."""
        raise NotImplementedError("Subclasses must implement load method")
    
    def save(self, config: Dict[str, Any], filepath: Union[str, Path]) -> bool:
        """Guardar configuración en archivo."""
        raise NotImplementedError("Subclasses must implement save method")
    
    def validate_file_exists(self, filepath: Union[str, Path]) -> bool:
        """Validar que el archivo existe."""
        path = Path(filepath)
        if not path.exists():
            self.logger.error(f"Configuration file not found: {filepath}")
            return False
        return True
    
    def get_loaded_configs(self) -> Dict[str, Any]:
        """Obtener configuraciones cargadas."""
        return self.loaded_configs.copy()

# ============================================================================
# 📄 CARGADOR JSON
# ============================================================================

class JSONLoader(BaseLoader):
    """Cargador para archivos JSON."""
    
    def load(self, filepath: Union[str, Path]) -> Dict[str, Any]:
        """Cargar configuración desde archivo JSON."""
        if not self.validate_file_exists(filepath):
            return {}
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            self.loaded_configs[str(filepath)] = config
            self.logger.info(f"Successfully loaded JSON config from: {filepath}")
            return config
        
        except json.JSONDecodeError as e:
            self.logger.error(f"Invalid JSON in file {filepath}: {e}")
            return {}
        except Exception as e:
            self.logger.error(f"Error loading JSON config from {filepath}: {e}")
            return {}
    
    def save(self, config: Dict[str, Any], filepath: Union[str, Path]) -> bool:
        """Guardar configuración en archivo JSON."""
        try:
            # Crear directorio si no existe
            path = Path(filepath)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"Successfully saved JSON config to: {filepath}")
            return True
        
        except Exception as e:
            self.logger.error(f"Error saving JSON config to {filepath}: {e}")
            return False

# ============================================================================
# 📄 CARGADOR YAML
# ============================================================================

class YAMLLoader(BaseLoader):
    """Cargador para archivos YAML."""
    
    def load(self, filepath: Union[str, Path]) -> Dict[str, Any]:
        """Cargar configuración desde archivo YAML."""
        if not self.validate_file_exists(filepath):
            return {}
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
            
            self.loaded_configs[str(filepath)] = config
            self.logger.info(f"Successfully loaded YAML config from: {filepath}")
            return config or {}
        
        except yaml.YAMLError as e:
            self.logger.error(f"Invalid YAML in file {filepath}: {e}")
            return {}
        except Exception as e:
            self.logger.error(f"Error loading YAML config from {filepath}: {e}")
            return {}
    
    def save(self, config: Dict[str, Any], filepath: Union[str, Path]) -> bool:
        """Guardar configuración en archivo YAML."""
        try:
            # Crear directorio si no existe
            path = Path(filepath)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                yaml.dump(config, f, default_flow_style=False, allow_unicode=True)
            
            self.logger.info(f"Successfully saved YAML config to: {filepath}")
            return True
        
        except Exception as e:
            self.logger.error(f"Error saving YAML config to {filepath}: {e}")
            return False

# ============================================================================
# 📄 CARGADOR TOML
# ============================================================================

class TOMLLoader(BaseLoader):
    """Cargador para archivos TOML."""
    
    def load(self, filepath: Union[str, Path]) -> Dict[str, Any]:
        """Cargar configuración desde archivo TOML."""
        if not self.validate_file_exists(filepath):
            return {}
        
        try:
            config = toml.load(filepath)
            
            self.loaded_configs[str(filepath)] = config
            self.logger.info(f"Successfully loaded TOML config from: {filepath}")
            return config
        
        except toml.TomlDecodeError as e:
            self.logger.error(f"Invalid TOML in file {filepath}: {e}")
            return {}
        except Exception as e:
            self.logger.error(f"Error loading TOML config from {filepath}: {e}")
            return {}
    
    def save(self, config: Dict[str, Any], filepath: Union[str, Path]) -> bool:
        """Guardar configuración en archivo TOML."""
        try:
            # Crear directorio si no existe
            path = Path(filepath)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                toml.dump(config, f)
            
            self.logger.info(f"Successfully saved TOML config to: {filepath}")
            return True
        
        except Exception as e:
            self.logger.error(f"Error saving TOML config to {filepath}: {e}")
            return False

# ============================================================================
# 🔧 CARGADOR DE VARIABLES DE ENTORNO
# ============================================================================

class EnvironmentLoader(BaseLoader):
    """Cargador para variables de entorno."""
    
    def __init__(self):
        super().__init__()
        self.env_prefix = "METAVERSO_"
    
    def load(self, filepath: Optional[Union[str, Path]] = None) -> Dict[str, Any]:
        """Cargar variables de entorno."""
        config = {}
        
        # Cargar desde archivo .env si se especifica
        if filepath and self.validate_file_exists(filepath):
            try:
                from dotenv import load_dotenv
                load_dotenv(filepath)
                self.logger.info(f"Loaded environment variables from: {filepath}")
            except ImportError:
                self.logger.warning("python-dotenv not installed, skipping .env file")
            except Exception as e:
                self.logger.error(f"Error loading .env file {filepath}: {e}")
        
        # Cargar variables de entorno con prefijo
        for key, value in os.environ.items():
            if key.startswith(self.env_prefix):
                config_key = key[len(self.env_prefix):].lower()
                config[config_key] = self._parse_env_value(value)
        
        self.loaded_configs['environment'] = config
        self.logger.info(f"Loaded {len(config)} environment variables")
        return config
    
    def save(self, config: Dict[str, Any], filepath: Union[str, Path]) -> bool:
        """Guardar variables de entorno en archivo."""
        try:
            # Crear directorio si no existe
            path = Path(filepath)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                for key, value in config.items():
                    env_key = f"{self.env_prefix}{key.upper()}"
                    f.write(f"{env_key}={value}\n")
            
            self.logger.info(f"Successfully saved environment variables to: {filepath}")
            return True
        
        except Exception as e:
            self.logger.error(f"Error saving environment variables to {filepath}: {e}")
            return False
    
    def _parse_env_value(self, value: str) -> Any:
        """Parsear valor de variable de entorno."""
        # Intentar convertir a tipos específicos
        if value.lower() in ('true', 'false'):
            return value.lower() == 'true'
        
        try:
            # Intentar convertir a entero
            return int(value)
        except ValueError:
            try:
                # Intentar convertir a float
                return float(value)
            except ValueError:
                # Mantener como string
                return value

# ============================================================================
# 🎯 CARGADOR PRINCIPAL
# ============================================================================

class ConfigLoader:
    """Cargador principal para toda la configuración del sistema."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.loaders = {
            'json': JSONLoader(),
            'yaml': YAMLLoader(),
            'yml': YAMLLoader(),
            'toml': TOMLLoader(),
            'env': EnvironmentLoader()
        }
        self.loaded_configs: Dict[str, Any] = {}
    
    def load_config(self, filepath: Union[str, Path]) -> Dict[str, Any]:
        """Cargar configuración detectando automáticamente el formato."""
        path = Path(filepath)
        
        if not path.exists():
            self.logger.error(f"Configuration file not found: {filepath}")
            return {}
        
        # Detectar formato por extensión
        extension = path.suffix.lower().lstrip('.')
        
        if extension in self.loaders:
            loader = self.loaders[extension]
            config = loader.load(filepath)
            self.loaded_configs[str(filepath)] = config
            return config
        else:
            self.logger.error(f"Unsupported file format: {extension}")
            return {}
    
    def load_configs_from_directory(self, directory: Union[str, Path]) -> Dict[str, Any]:
        """Cargar todas las configuraciones de un directorio."""
        dir_path = Path(directory)
        
        if not dir_path.exists() or not dir_path.is_dir():
            self.logger.error(f"Directory not found: {directory}")
            return {}
        
        configs = {}
        
        # Buscar archivos de configuración
        config_files = []
        for ext in ['json', 'yaml', 'yml', 'toml']:
            config_files.extend(dir_path.glob(f"*.{ext}"))
        
        # Cargar cada archivo
        for file_path in config_files:
            config = self.load_config(file_path)
            if config:
                configs[file_path.stem] = config
        
        self.logger.info(f"Loaded {len(configs)} configuration files from {directory}")
        return configs
    
    def load_environment_config(self, environment: str) -> Dict[str, Any]:
        """Cargar configuración específica del entorno."""
        env_loader = self.loaders['env']
        
        # Buscar archivo .env específico del entorno
        env_files = [
            f".env.{environment}",
            f".env.{environment}.local",
            ".env"
        ]
        
        config = {}
        for env_file in env_files:
            if Path(env_file).exists():
                env_config = env_loader.load(env_file)
                config.update(env_config)
        
        return config
    
    def merge_configs(self, configs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fusionar múltiples configuraciones."""
        merged = {}
        
        for config in configs:
            self._deep_merge(merged, config)
        
        return merged
    
    def _deep_merge(self, target: Dict[str, Any], source: Dict[str, Any]):
        """Fusión profunda de diccionarios."""
        for key, value in source.items():
            if key in target and isinstance(target[key], dict) and isinstance(value, dict):
                self._deep_merge(target[key], value)
            else:
                target[key] = value
    
    def save_config(self, config: Dict[str, Any], filepath: Union[str, Path], format: str = 'json') -> bool:
        """Guardar configuración en formato específico."""
        if format not in self.loaders:
            self.logger.error(f"Unsupported format: {format}")
            return False
        
        loader = self.loaders[format]
        return loader.save(config, filepath)
    
    def get_loader(self, format: str) -> Optional[BaseLoader]:
        """Obtener cargador específico."""
        return self.loaders.get(format)
    
    def reload_config(self, filepath: Union[str, Path]) -> Dict[str, Any]:
        """Recargar configuración desde archivo."""
        # Limpiar configuración cargada
        if str(filepath) in self.loaded_configs:
            del self.loaded_configs[str(filepath)]
        
        return self.load_config(filepath)
    
    def watch_config_file(self, filepath: Union[str, Path], callback) -> bool:
        """Observar cambios en archivo de configuración."""
        try:
            from watchdog.observers import Observer
            from watchdog.events import FileSystemEventHandler
            
            class ConfigFileHandler(FileSystemEventHandler):
                def __init__(self, loader, callback):
                    self.loader = loader
                    self.callback = callback
                
                def on_modified(self, event):
                    if not event.is_directory and event.src_path == str(filepath):
                        self.callback(self.loader.reload_config(filepath))
            
            observer = Observer()
            handler = ConfigFileHandler(self, callback)
            observer.schedule(handler, str(Path(filepath).parent), recursive=False)
            observer.start()
            
            self.logger.info(f"Started watching config file: {filepath}")
            return True
        
        except ImportError:
            self.logger.warning("watchdog not installed, file watching disabled")
            return False
        except Exception as e:
            self.logger.error(f"Error setting up file watcher: {e}")
            return False

# ============================================================================
# 🛠️ FUNCIONES DE CONVENIENCIA
# ============================================================================

def load_config_file(filepath: Union[str, Path]) -> Dict[str, Any]:
    """Cargar archivo de configuración."""
    loader = ConfigLoader()
    return loader.load_config(filepath)

def load_configs_from_directory(directory: Union[str, Path]) -> Dict[str, Any]:
    """Cargar configuraciones de directorio."""
    loader = ConfigLoader()
    return loader.load_configs_from_directory(directory)

def save_config_file(config: Dict[str, Any], filepath: Union[str, Path], format: str = 'json') -> bool:
    """Guardar configuración en archivo."""
    loader = ConfigLoader()
    return loader.save_config(config, filepath, format)

# ============================================================================
# 📦 EXPORTACIONES
# ============================================================================

__all__ = [
    'BaseLoader',
    'JSONLoader',
    'YAMLLoader',
    'TOMLLoader',
    'EnvironmentLoader',
    'ConfigLoader',
    'load_config_file',
    'load_configs_from_directory',
    'save_config_file'
] 