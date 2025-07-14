# 🔐 Configuración Segura de API para LucIA

## 📋 Resumen

Este documento te explica cómo configurar de forma segura tu API de ChatGPT (y otras APIs) para LucIA, sin exponer tus claves en GitHub.

## 🚨 IMPORTANTE - Seguridad

**NUNCA subas tus claves API a GitHub.** El archivo `.env` está configurado en `.gitignore` para evitar esto.

## 🛠️ Configuración Automática (Recomendada)

### Paso 1: Ejecutar el Configurador
```bash
cd lucIA
python configurar_api.py
```

### Paso 2: Seguir las Instrucciones
1. Selecciona "1" para configurar API de ChatGPT
2. Ingresa tu API key cuando se te solicite (no se mostrará en pantalla)
3. El script creará automáticamente el archivo `.env` y configurará el sistema

### Paso 3: Probar la Configuración
```bash
python probar_api.py
```

## 🔑 Obtener API Key de ChatGPT (Gratuita)

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create new secret key"
4. Copia la clave (empieza con `sk-`)
5. **Guárdala en un lugar seguro**

## 📁 Estructura de Archivos

```
lucIA/
├── .env                    # 🔒 TU ARCHIVO CON CLAVES (NO SUBIR A GITHUB)
├── env.example            # 📄 Ejemplo de configuración
├── configurar_api.py      # 🛠️ Script de configuración automática
├── probar_api.py          # 🧪 Script de prueba
├── config.py              # ⚙️ Configuración del sistema
└── lucIA.py               # 🤖 LucIA principal
```

## 🔒 Configuración Manual (Alternativa)

Si prefieres configurar manualmente:

### 1. Crear archivo `.env`
```bash
cd lucIA
cp env.example .env
```

### 2. Editar `.env`
```env
# Tu API key de ChatGPT
OPENAI_API_KEY=sk-tu_clave_aqui

# Configuración de LucIA
LUCIA_DEFAULT_PERSONALITY=metaverso
LUCIA_LOG_LEVEL=INFO
```

## 🧪 Verificar Configuración

### Verificación Automática
```bash
python probar_api.py
```

### Verificación Manual
```bash
# Verificar que el archivo .env existe
ls -la .env

# Verificar que no está en git
git status
```

## 🔄 APIs Soportadas

LucIA soporta múltiples APIs con rotación automática:

| API | Gratuita | Modelo | Límite Diario |
|-----|----------|--------|---------------|
| OpenAI (ChatGPT) | ✅ | gpt-3.5-turbo | 100 requests |
| HuggingFace | ✅ | DialoGPT-medium | 1000 requests |
| Local (Fallback) | ✅ | Local | Ilimitado |

## 🚨 Solución de Problemas

### Error: "No se encontró el archivo .env"
```bash
python configurar_api.py
```

### Error: "API key inválida"
1. Verifica que tu API key empiece con `sk-`
2. Verifica que no tenga espacios extra
3. Obtén una nueva clave en [OpenAI Platform](https://platform.openai.com/api-keys)

### Error: "Límite de requests excedido"
- La versión gratuita tiene límites diarios
- Espera 24 horas o usa otra API
- Considera actualizar a versión de pago

### Error: "No se pudo conectar"
1. Verifica tu conexión a internet
2. Verifica que la API key sea correcta
3. Verifica que no estés usando un proxy

## 🔧 Configuración Avanzada

### Variables de Entorno Disponibles

```env
# APIs
OPENAI_API_KEY=sk-tu_clave
HUGGINGFACE_API_KEY=tu_clave
ANTHROPIC_API_KEY=tu_clave
GEMINI_API_KEY=tu_clave

# Configuración de LucIA
LUCIA_DEFAULT_PERSONALITY=metaverso
LUCIA_LOG_LEVEL=INFO
LUCIA_ENABLE_PARAPHRASING=true
LUCIA_ENABLE_MEMORY_LEARNING=true
LUCIA_ENABLE_API_ROTATION=true

# Seguridad
LUCIA_ENCRYPT_SENSITIVE_DATA=true
LUCIA_LOG_API_CALLS=false
LUCIA_RATE_LIMITING=true
```

### Personalidades Disponibles
- `amigable` - Respuestas cálidas y cercanas
- `profesional` - Respuestas formales y técnicas
- `creativo` - Respuestas imaginativas
- `analítico` - Respuestas detalladas y lógicas
- `divertido` - Respuestas con humor
- `empático` - Respuestas comprensivas
- `metaverso` - Respuestas específicas del metaverso

## 📞 Soporte

Si tienes problemas:

1. Ejecuta `python probar_api.py` y comparte el resultado
2. Verifica que sigues todos los pasos de este documento
3. Asegúrate de que tu API key sea válida y esté activa

## 🔐 Seguridad Adicional

- El archivo `.env` está en `.gitignore`
- Las claves se cargan solo en memoria
- Se pueden encriptar datos sensibles
- Los logs de API están deshabilitados por defecto

---

**¡Tu API está configurada de forma segura! 🎉** 