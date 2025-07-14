# 🔧 Configuración de APIs para LucIA

## 🚀 Configuración Rápida

### Opción 1: Script Automático (Recomendado)
```bash
cd lucIA
python setup_api.py
```

### Opción 2: Configuración Manual

1. **Crea un archivo `.env` en la carpeta `lucIA/`:**
```bash
cd lucIA
touch .env  # En Windows: echo. > .env
```

2. **Edita el archivo `.env` y agrega tus claves API:**
```env
# API Keys - Reemplaza con tus claves reales
OPENAI_API_KEY=sk-tu-clave-openai-aqui
ANTHROPIC_API_KEY=sk-ant-tu-clave-anthropic-aqui
GEMINI_API_KEY=tu-clave-gemini-aqui
HUGGINGFACE_API_KEY=hf-tu-clave-huggingface-aqui
COHERE_API_KEY=tu-clave-cohere-aqui
```

## 🔑 Obtener Claves API

### OpenAI
1. Ve a [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Crea una nueva clave API
3. Copia la clave (empieza con `sk-`)

### Anthropic (Claude)
1. Ve a [Anthropic Console](https://console.anthropic.com/)
2. Crea una nueva clave API
3. Copia la clave (empieza con `sk-ant-`)

### Google Gemini
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva clave API
3. Copia la clave

### Hugging Face
1. Ve a [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Crea un nuevo token
3. Copia el token (empieza con `hf_`)

### Cohere
1. Ve a [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)
2. Crea una nueva clave API
3. Copia la clave

## 🛡️ Seguridad

- **NUNCA** subas el archivo `.env` a Git
- El archivo `.env` ya está en `.gitignore`
- Las claves API son sensibles, mantenlas seguras

## 🧪 Probar la Configuración

```bash
cd lucIA
python lucIA.py
```

LucIA te mostrará qué APIs están configuradas al iniciar.

## 🔧 Solución de Problemas

### "OpenAI API key not found"
- Verifica que el archivo `.env` existe en la carpeta `lucIA/`
- Verifica que la variable `OPENAI_API_KEY` está correctamente escrita
- Verifica que la clave API es válida

### "Daily limit reached"
- Las APIs tienen límites diarios
- Espera hasta el día siguiente o usa otra API

### "API not configured"
- Solo las APIs con claves válidas estarán disponibles
- LucIA funcionará con conocimiento local si no hay APIs configuradas 