"""
Configuración centralizada para LucIA - IA de la Plataforma Metaverso
"""

import os
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

class APIType(Enum):
    """Tipos de APIs disponibles"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"
    HUGGINGFACE = "huggingface"
    DEEPSEEK = "deepseek"
    LOCAL = "local"
    CUSTOM = "custom"

class PersonalityType(Enum):
    """Tipos de personalidad para la IA"""
    FRIENDLY = "amigable"
    PROFESSIONAL = "profesional"
    CREATIVE = "creativo"
    ANALYTICAL = "analítico"
    HUMOROUS = "divertido"
    EMPATHETIC = "empático"
    METAVERSE = "metaverso"  # Nueva personalidad específica

@dataclass
class APIConfig:
    """Configuración de una API específica"""
    name: str
    api_type: APIType
    api_key: str
    endpoint: str
    model: str
    daily_limit: int
    priority: int
    enabled: bool = True
    cost_per_request: float = 0.0
    response_timeout: int = 30
    max_tokens: int = 1500
    temperature: float = 0.7

@dataclass
class MemoryConfig:
    """Configuración de la memoria de la IA"""
    max_conversations: int = 1000
    max_learning_entries: int = 5000
    backup_interval_hours: int = 24
    cleanup_old_data_days: int = 30
    similarity_threshold: float = 0.3
    paraphrase_confidence: float = 0.8

@dataclass
class PlatformConfig:
    """Configuración específica de la plataforma"""
    platform_name: str = "Metaverso Crypto World Virtual 3D"
    ai_name: str = "LucIA"
    version: str = "2.0.0"
    description: str = "IA inteligente para la plataforma metaverso"
    
    # Configuración de respuestas
    enable_paraphrasing: bool = True
    enable_memory_learning: bool = True
    enable_api_rotation: bool = True
    enable_fallback_to_memory: bool = True
    
    # Configuración de personalidad
    default_personality: PersonalityType = PersonalityType.METAVERSE
    
    # Configuración de seguridad
    encrypt_sensitive_data: bool = True
    log_api_calls: bool = True
    rate_limiting: bool = True

class Config:
    """Clase principal de configuración"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = Path(config_path) if config_path else Path(__file__).parent / "config"
        self.config_path.mkdir(exist_ok=True)
        
        # Configuraciones
        self.platform = PlatformConfig()
        self.memory = MemoryConfig()
        self.apis: Dict[str, APIConfig] = {}
        
        # Cargar configuración desde archivo
        self._load_config()
        
    def _load_config(self):
        """Carga configuración desde archivo"""
        config_file = self.config_path / "lucia_config.json"
        
        if config_file.exists():
            import json
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Cargar APIs
                if 'apis' in data:
                    for api_data in data['apis']:
                        api_config = APIConfig(
                            name=api_data['name'],
                            api_type=APIType(api_data['api_type']),
                            api_key=api_data['api_key'],
                            endpoint=api_data['endpoint'],
                            model=api_data['model'],
                            daily_limit=api_data['daily_limit'],
                            priority=api_data['priority'],
                            enabled=api_data.get('enabled', True),
                            cost_per_request=api_data.get('cost_per_request', 0.0),
                            response_timeout=api_data.get('response_timeout', 30),
                            max_tokens=api_data.get('max_tokens', 1500),
                            temperature=api_data.get('temperature', 0.7)
                        )
                        self.apis[api_config.name] = api_config
                        
            except Exception as e:
                print(f"Error cargando configuración: {e}")
                
        # Configuración por defecto si no hay archivo
        if not self.apis:
            self._setup_default_apis()
            
    def _setup_default_apis(self):
        """Configura SOLO Gemini como API principal (todas las demás deshabilitadas)"""
        env_file = Path(__file__).parent / ".env"
        if env_file.exists():
            from dotenv import load_dotenv
            load_dotenv(env_file)

        # 1. Gemini (Google) - ÚNICA API habilitada
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            self.add_api(
                name="gemini_pro",
                api_type=APIType.GEMINI,
                api_key=gemini_key,
                endpoint="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent",
                model="models/gemini-1.5-pro-latest",
                daily_limit=1000,
                priority=1,
                enabled=True,
                cost_per_request=0.0
            )

        # 2. Claude (Anthropic) - DESHABILITADA
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        if anthropic_key:
            self.add_api(
                name="claude_haiku",
                api_type=APIType.ANTHROPIC,
                api_key=anthropic_key,
                endpoint="https://api.anthropic.com/v1/messages",
                model="claude-3-haiku-20240307",
                daily_limit=1000,
                priority=2,
                enabled=False,
                cost_per_request=0.0
            )

        # 3. OpenAI (ChatGPT) - DESHABILITADA
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            self.add_api(
                name="openai_chatgpt",
                api_type=APIType.OPENAI,
                api_key=openai_key,
                endpoint="https://api.openai.com/v1",
                model="gpt-3.5-turbo",
                daily_limit=100,
                priority=3,
                enabled=False,
                cost_per_request=0.002,
                response_timeout=30,
                max_tokens=1500,
                temperature=0.7
            )

        # 4. HuggingFace (gratuito) - DESHABILITADA
        huggingface_key = os.getenv("HUGGINGFACE_API_KEY")
        if huggingface_key:
            self.add_api(
                name="huggingface_free",
                api_type=APIType.HUGGINGFACE,
                api_key=huggingface_key,
                endpoint="https://api-inference.huggingface.co/models/",
                model="microsoft/DialoGPT-medium",
                daily_limit=1000,
                priority=4,
                enabled=False,
                cost_per_request=0.0
            )

        # 5. Deepseek - DESHABILITADA
        deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        if deepseek_key:
            self.add_api(
                name="deepseek_chat",
                api_type=APIType.DEEPSEEK,
                api_key=deepseek_key,
                endpoint="https://api.deepseek.com/v1",
                model="deepseek-chat",
                daily_limit=1000,
                priority=5,
                enabled=False,
                cost_per_request=0.0,
                response_timeout=30,
                max_tokens=1500,
                temperature=0.7
            )

        # 6. API local (fallback)
        self.add_api(
            name="local_fallback",
            api_type=APIType.LOCAL,
            api_key="",
            endpoint="local",
            model="local",
            daily_limit=999999,
            priority=999,
            enabled=True,
            cost_per_request=0.0
        )
        
    def add_api(self, **kwargs):
        """Añade una nueva API"""
        api_config = APIConfig(**kwargs)
        self.apis[api_config.name] = api_config
        self._save_config()
        
    def remove_api(self, name: str):
        """Elimina una API"""
        if name in self.apis:
            del self.apis[name]
            self._save_config()
            
    def get_enabled_apis(self) -> List[APIConfig]:
        """Obtiene todas las APIs habilitadas ordenadas por prioridad"""
        enabled = [api for api in self.apis.values() if api.enabled]
        return sorted(enabled, key=lambda x: x.priority)
        
    def get_api_by_name(self, name: str) -> Optional[APIConfig]:
        """Obtiene una API por nombre"""
        return self.apis.get(name)
        
    def _save_config(self):
        """Guarda la configuración en archivo"""
        config_file = self.config_path / "lucia_config.json"
        
        import json
        try:
            data = {
                'apis': [
                    {
                        'name': api.name,
                        'api_type': api.api_type.value,
                        'api_key': api.api_key,
                        'endpoint': api.endpoint,
                        'model': api.model,
                        'daily_limit': api.daily_limit,
                        'priority': api.priority,
                        'enabled': api.enabled,
                        'cost_per_request': api.cost_per_request,
                        'response_timeout': api.response_timeout,
                        'max_tokens': api.max_tokens,
                        'temperature': api.temperature
                    }
                    for api in self.apis.values()
                ]
            }
            
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f"Error guardando configuración: {e}")
            
    def get_memory_path(self) -> Path:
        """Obtiene la ruta de la memoria"""
        return Path(__file__).parent / "lucia_learning"
        
    def get_logs_path(self) -> Path:
        """Obtiene la ruta de los logs"""
        return Path(__file__).parent / "logs"
        
    def get_backups_path(self) -> Path:
        """Obtiene la ruta de los backups"""
        return Path(__file__).parent / "backups"

# Instancia global de configuración
config = Config() 