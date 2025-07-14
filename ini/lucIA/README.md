# 🧠 LucIA - IA Inteligente para el Metaverso

## 🌟 Descripción

LucIA es una IA avanzada diseñada específicamente para la plataforma **Metaverso Crypto World Virtual 3D**. Utiliza un sistema de rotación automática de APIs, memoria persistente con parafraseo inteligente, y personalidades configurables para proporcionar respuestas únicas y contextuales.

## 🛡️ **VERSIÓN DE CÓDIGO ABIERTO SEGURA**

**⚠️ IMPORTANTE**: Esta es una versión **100% segura** para código abierto. **NUNCA** incluye claves API reales, tokens, o información sensible.

### 📚 **Documentación de Seguridad**
- 🔐 **[README_OPEN_SOURCE.md](README_OPEN_SOURCE.md)** - Guía completa para código abierto
- 🛡️ **[SECURITY_GUIDE.md](SECURITY_GUIDE.md)** - Guía de seguridad detallada
- 🚀 **[quick_start_secure.py](quick_start_secure.py)** - Configuración automática segura

### 🚀 **Inicio Rápido Seguro**
```bash
# Configuración automática y segura
python quick_start_secure.py

# O configuración manual
python configurar_api.py
```

## 🚀 Características Principales

### 🔄 Rotación Automática de APIs
- **Sistema inteligente**: Cuando una API se agota, automáticamente pasa a la siguiente
- **Priorización**: Las APIs se usan en orden de prioridad configurada
- **Fallback inteligente**: Si todas las APIs están agotadas, usa la memoria local

### 🧠 Memoria Persistente con Parafraseo
- **Almacenamiento**: Todas las respuestas se guardan en `lucia_learning/`
- **Parafraseo inteligente**: Las respuestas se reescriben para ser únicas
- **Búsqueda semántica**: Encuentra respuestas similares en la memoria
- **Aprendizaje continuo**: Mejora con el uso y feedback del usuario

### 🎭 Personalidades Configurables
- **Friendly**: Amigable y cercano
- **Professional**: Formal y eficiente
- **Creative**: Imaginativo y expresivo
- **Analytical**: Lógico y estructurado
- **Humorous**: Divertido y relajado
- **Empathetic**: Comprensivo y solidario
- **Metaverse**: Específica para el metaverso 🌐

### 💰 Gestión de Costos
- **Control de gastos**: Monitorea el uso de APIs de pago
- **Límites diarios**: Configura límites por API
- **Optimización**: Prioriza APIs gratuitas cuando es posible

## 📦 Instalación

### 1. Instalación Automática Segura
```bash
cd lucIA
python quick_start_secure.py
```

### 2. Instalación Manual
```bash
# Instalar dependencias básicas
pip install aiohttp requests python-dotenv loguru rich

# Instalar APIs opcionales
pip install openai anthropic google-generativeai

# Instalar NLP opcional
pip install nltk textblob
```

## ⚙️ Configuración Segura

### 1. Variables de Entorno
Copia `.env.example` a `.env` y configura tus APIs:

```env
# APIs (opcionales - configura solo las que uses)
OPENAI_API_KEY=tu_clave_openai
ANTHROPIC_API_KEY=tu_clave_anthropic
GEMINI_API_KEY=tu_clave_gemini
HUGGINGFACE_API_KEY=tu_clave_huggingface

# Configuración de la IA
LUCIA_NAME=LucIA
LUCIA_PERSONALITY=metaverse
LUCIA_ENABLE_MEMORY=true
LUCIA_ENABLE_PARAPHRASING=true
```

### 2. APIs Gratuitas Disponibles
- **HuggingFace**: API gratuita con límites generosos
- **Respuestas locales**: Sistema inteligente de respuestas locales
- **Fallback automático**: Siempre hay una respuesta disponible

## 🎮 Uso

### Ejecutar LucIA
```bash
python lucIA.py
```

### Comandos Principales

#### 💬 Conversación
- Escribe cualquier mensaje para chatear
- `salir` o `exit`: Terminar la conversación

#### 📊 Información
- `stats`: Ver estadísticas detalladas
- `apis`: Ver estado de APIs
- `memoria`: Ver estadísticas de memoria

#### 🎭 Personalidad
- `personalidad [tipo]`: Cambiar personalidad
- Tipos: `friendly`, `professional`, `creative`, `analytical`, `humorous`, `empathetic`, `metaverse`

#### 💾 Gestión de Datos
- `export json/txt`: Exportar historial
- `backup`: Crear backup completo
- `buscar [término]`: Buscar en conversaciones

#### 🔄 Sistema
- `feedback positivo/negativo/neutral [comentario]`: Dar retroalimentación
- `limpiar`: Limpiar pantalla
- `ayuda`: Mostrar ayuda
- `reset`: Resetear límites diarios

## 🏗️ Arquitectura

### Módulos Principales

#### `config.py`
- Configuración centralizada
- Gestión de APIs
- Configuración de personalidades

#### `memory.py`
- Sistema de memoria persistente
- Base de datos SQLite
- Búsqueda semántica

#### `api_manager.py`
- Gestión de APIs externas
- Rotación automática
- Control de límites y costos

#### `paraphraser.py`
- Parafraseo inteligente
- Personalidades aplicadas
- Calidad de respuestas

#### `lucia_core.py`
- Núcleo principal de la IA
- Coordinación de módulos
- Gestión de conversaciones

#### `lucIA.py`
- Interfaz de usuario
- Comandos y controles
- Bucle principal de chat

## 📊 Estadísticas

### Métricas Disponibles
- **Total de peticiones**: Número total de consultas
- **Peticiones API**: Uso de APIs externas
- **Peticiones memoria**: Uso de memoria local
- **Tiempo promedio**: Tiempo de respuesta
- **Confianza promedio**: Calidad de respuestas
- **Efectividad**: Puntuación de aprendizaje

### APIs Soportadas
- **OpenAI**: GPT-3.5, GPT-4
- **Anthropic**: Claude 3
- **Google Gemini**: Gemini Pro
- **HuggingFace**: Modelos gratuitos
- **Local**: Sistema inteligente local

## 🔧 Personalización

### Añadir Nueva API
```python
from config import config, APIType

config.add_api(
    name="mi_api",
    api_type=APIType.CUSTOM,
    api_key="mi_clave",
    endpoint="https://mi-api.com/v1/chat",
    model="mi-modelo",
    daily_limit=1000,
    priority=1
)
```

### Crear Nueva Personalidad
```python
from config import PersonalityType

# En config.py, añadir nueva personalidad
class PersonalityType(Enum):
    # ... otras personalidades ...
    CUSTOM = "personalizada"

# En paraphraser.py, añadir patrones
self.personality_patterns[PersonalityType.CUSTOM] = {
    "greetings": ["¡Hola personalizado!"],
    "connectors": ["Además"],
    "endings": ["¡Hasta luego!"],
    "emojis": ["🎯"]
}
```

## 🧪 Testing y Validación

### Tests Automáticos
```bash
# Ejecutar todos los tests
python -m pytest test_*.py

# Test específico de seguridad
python security_checker.py

# Test de configuración
python probar_api.py
```

### Validación Manual
```bash
# Verificar que no hay claves hardcodeadas
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "Bearer" . --exclude-dir=node_modules --exclude-dir=.git

# Verificar permisos de archivos
ls -la .env
chmod 600 .env  # Solo lectura para el propietario
```

## 🆘 Solución de Problemas

### Error de Importación
```bash
# Verificar que todas las dependencias están instaladas
pip install -r requirements.txt

# Verificar versión de Python
python --version  # Debe ser 3.8+
```

### Error de Configuración
```bash
# Verificar archivo .env
python probar_api.py

# Reconfigurar APIs
python configurar_api.py
```

### Error de Memoria
```bash
# Limpiar memoria
rm -rf lucia_learning/memoria/*.db

# Reiniciar LucIA
python lucIA.py
```

## 📞 Soporte y Comunidad

### Recursos de Ayuda
- 📚 [Documentación Completa](docs/)
- 🐛 [Reportar Bugs](https://github.com/Chicook/MetaversoCryptoWoldVirtual3d/issues)
- 💬 [Discussions](https://github.com/Chicook/MetaversoCryptoWoldVirtual3d/discussions)
- 📧 [Email de Soporte](mailto:soporte@metaversocrypto.com)

### Comunidad
- 🌐 [Discord](https://discord.gg/metaversocrypto)
- 🐦 [Twitter](https://twitter.com/metaversocrypto)
- 📺 [YouTube](https://youtube.com/@metaversocrypto)

## 🏆 Buenas Prácticas

### ✅ Hacer:
- Usar APIs gratuitas cuando sea posible
- Configurar límites de uso
- Mantener actualizado el sistema
- Reportar bugs y mejoras
- Contribuir al proyecto

### ❌ No Hacer:
- Compartir claves API
- Subir archivos .env a GitHub
- Usar claves de producción en desarrollo
- Ignorar mensajes de seguridad

## 📊 Métricas de Seguridad

### Verificaciones Automáticas
- ✅ No hay claves hardcodeadas
- ✅ Archivos sensibles en .gitignore
- ✅ Configuración encriptada
- ✅ Logs de seguridad activos
- ✅ Rate limiting configurado

### Estado del Sistema
```bash
# Verificar estado de seguridad
python security_checker.py
```

---

## 🎉 ¡Listo para Usar de Forma Segura!

Tu instalación de LucIA está configurada para ser **100% segura** y **código abierto**. Puedes compartir el repositorio sin preocupaciones, ya que cada desarrollador configurará sus propias credenciales de forma segura.

**¡Disfruta explorando el metaverso con LucIA! 🌐🚀** 