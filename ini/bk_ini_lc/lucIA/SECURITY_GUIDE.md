# 🛡️ Guía de Seguridad Completa - LucIA

## 🚨 **ADVERTENCIA DE SEGURIDAD**

Esta guía es **OBLIGATORIA** para todos los desarrolladores que trabajen con LucIA. Sigue estas prácticas para mantener tu proyecto y datos seguros.

## 📋 **Checklist de Seguridad**

### ✅ **Antes de Empezar**
- [ ] Verificar que no hay claves API en el código
- [ ] Configurar .gitignore correctamente
- [ ] Crear archivo .env con tus claves
- [ ] Probar configuración con `python probar_api.py`
- [ ] Verificar permisos de archivos sensibles

### ✅ **Durante el Desarrollo**
- [ ] Nunca committear archivos .env
- [ ] Usar variables de entorno para claves
- [ ] Validar inputs de usuario
- [ ] Mantener logs de seguridad
- [ ] Actualizar dependencias regularmente

### ✅ **Antes de Deploy**
- [ ] Ejecutar auditoría de seguridad
- [ ] Verificar que no hay datos sensibles
- [ ] Configurar rate limiting
- [ ] Habilitar encriptación
- [ ] Probar en entorno de staging

## 🔐 **Protección de Credenciales**

### **1. Variables de Entorno**
```bash
# ✅ CORRECTO - Usar variables de entorno
export OPENAI_API_KEY="sk-tu_clave_aqui"
export HUGGINGFACE_API_KEY="tu_clave_aqui"

# ❌ INCORRECTO - Hardcodear en el código
api_key = "sk-tu_clave_aqui"  # NUNCA hacer esto
```

### **2. Archivo .env Seguro**
```env
# 🔒 .env - Archivo privado (NO subir a GitHub)
OPENAI_API_KEY=sk-tu_clave_real_aqui
HUGGINGFACE_API_KEY=tu_clave_real_aqui
GEMINI_API_KEY=tu_clave_real_aqui
ANTHROPIC_API_KEY=tu_clave_real_aqui

# Configuración de seguridad
LUCIA_ENCRYPT_SENSITIVE_DATA=true
LUCIA_LOG_API_CALLS=false
LUCIA_RATE_LIMITING=true
```

### **3. .gitignore Configurado**
```gitignore
# 🔒 Archivos sensibles que NO deben subirse
.env
.env.local
.env.production
.env.staging
*.key
*.pem
*.p12
*.pfx
secrets/
keys/
tokens/
credentials/

# Logs que pueden contener información sensible
*.log
logs/
lucia_pro.log

# Archivos de backup
*.backup
*.bak
*.tmp
```

## 🛠️ **Configuración Segura**

### **1. Script de Configuración Automática**
```bash
# Ejecutar configurador seguro
python configurar_api.py

# Este script:
# ✅ Valida el formato de las claves
# ✅ Crea el archivo .env automáticamente
# ✅ Configura permisos correctos
# ✅ Verifica que todo funciona
```

### **2. Validación de Configuración**
```bash
# Probar que todo está configurado correctamente
python probar_api.py

# Verificar que no hay claves hardcodeadas
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "Bearer" . --exclude-dir=node_modules --exclude-dir=.git
```

### **3. Permisos de Archivos**
```bash
# Configurar permisos seguros
chmod 600 .env                    # Solo lectura para propietario
chmod 700 lucIA/                  # Solo acceso para propietario
chmod 644 *.py                    # Lectura para todos, escritura solo propietario
```

## 🔍 **Auditoría de Seguridad**

### **1. Verificación Automática**
```bash
# Ejecutar auditoría completa
python -c "
from security_checker import SecurityChecker
sc = SecurityChecker()
results = sc.run_full_check()
print('✅ Seguridad verificada' if results['secure'] else '❌ Problemas encontrados')
"
```

### **2. Verificación Manual**
```bash
# Buscar patrones de claves API
grep -r "sk-[a-zA-Z0-9]" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "Bearer [a-zA-Z0-9]" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "api_key.*=" . --exclude-dir=node_modules --exclude-dir=.git

# Verificar archivos sensibles
find . -name "*.env" -o -name "*.key" -o -name "*.token" -o -name "*.secret"

# Verificar permisos
ls -la .env
ls -la *.py
```

### **3. Verificación de Git**
```bash
# Verificar que .env no está en el repositorio
git ls-files | grep -E "\.(env|key|token|secret)"

# Verificar estado de archivos
git status

# Verificar historial de commits
git log --oneline --grep="key\|token\|secret\|password"
```

## 🚨 **Detección de Vulnerabilidades**

### **1. Claves API Expuestas**
```python
# ✅ CORRECTO - Cargar desde variables de entorno
import os
api_key = os.getenv('OPENAI_API_KEY')

# ❌ INCORRECTO - Hardcodear en el código
api_key = "sk-1234567890abcdef"  # VULNERABLE
```

### **2. Logs Sensibles**
```python
# ✅ CORRECTO - No loggear claves
logger.info("API call successful")

# ❌ INCORRECTO - Loggear información sensible
logger.info(f"API key: {api_key}")  # VULNERABLE
```

### **3. Manejo de Errores**
```python
# ✅ CORRECTO - Manejo seguro de errores
try:
    response = api_call()
except Exception as e:
    logger.error("API call failed")
    return None

# ❌ INCORRECTO - Exponer información sensible
except Exception as e:
    logger.error(f"API call failed with key: {api_key}")  # VULNERABLE
```

## 🔄 **Rotación de Claves**

### **1. Rotación Automática**
```python
# Sistema de rotación de claves
class KeyRotator:
    def __init__(self):
        self.keys = [
            os.getenv('OPENAI_API_KEY_1'),
            os.getenv('OPENAI_API_KEY_2'),
            os.getenv('OPENAI_API_KEY_3')
        ]
        self.current_index = 0
    
    def get_next_key(self):
        key = self.keys[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.keys)
        return key
```

### **2. Monitoreo de Uso**
```python
# Monitorear uso de APIs
class APIMonitor:
    def __init__(self):
        self.usage = {}
    
    def track_usage(self, api_name, tokens_used):
        if api_name not in self.usage:
            self.usage[api_name] = 0
        self.usage[api_name] += tokens_used
        
        # Alertar si se excede el límite
        if self.usage[api_name] > DAILY_LIMIT:
            self.alert_limit_exceeded(api_name)
```

## 🛡️ **Encriptación de Datos**

### **1. Encriptación de Configuración**
```python
from cryptography.fernet import Fernet
import base64

class ConfigEncryption:
    def __init__(self):
        self.key = Fernet.generate_key()
        self.cipher = Fernet(self.key)
    
    def encrypt_config(self, data):
        return self.cipher.encrypt(data.encode())
    
    def decrypt_config(self, encrypted_data):
        return self.cipher.decrypt(encrypted_data).decode()
```

### **2. Almacenamiento Seguro**
```python
# Almacenar configuración encriptada
def save_secure_config(config_data):
    encryption = ConfigEncryption()
    encrypted_data = encryption.encrypt_config(json.dumps(config_data))
    
    with open('.config.encrypted', 'wb') as f:
        f.write(encrypted_data)
```

## 📊 **Monitoreo de Seguridad**

### **1. Logs de Seguridad**
```python
import logging

# Configurar logger de seguridad
security_logger = logging.getLogger('security')
security_logger.setLevel(logging.INFO)

# Log de eventos de seguridad
def log_security_event(event_type, details):
    security_logger.info(f"SECURITY: {event_type} - {details}")
    
# Ejemplos de uso
log_security_event("API_KEY_USED", "OpenAI API called")
log_security_event("RATE_LIMIT_HIT", "Rate limit exceeded")
log_security_event("CONFIG_CHANGED", "Configuration modified")
```

### **2. Alertas Automáticas**
```python
# Sistema de alertas de seguridad
class SecurityAlerts:
    def __init__(self):
        self.alert_thresholds = {
            'failed_attempts': 5,
            'rate_limit_hits': 10,
            'config_changes': 1
        }
    
    def check_and_alert(self, event_type, count):
        if count >= self.alert_thresholds.get(event_type, 0):
            self.send_alert(f"Security alert: {event_type} threshold exceeded")
```

## 🚀 **Deployment Seguro**

### **1. Entorno de Producción**
```bash
# Configurar entorno de producción
export NODE_ENV=production
export LUCIA_ENCRYPT_SENSITIVE_DATA=true
export LUCIA_LOG_API_CALLS=false
export LUCIA_RATE_LIMITING=true
export LUCIA_MAX_REQUESTS_PER_DAY=1000

# Verificar configuración
python probar_api.py --production
```

### **2. Docker Seguro**
```dockerfile
# Dockerfile seguro
FROM python:3.9-slim

# No ejecutar como root
RUN useradd -m -u 1000 lucia
USER lucia

# Copiar solo archivos necesarios
COPY --chown=lucia:lucia . /app
WORKDIR /app

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Configurar variables de entorno
ENV PYTHONPATH=/app
ENV LUCIA_ENCRYPT_SENSITIVE_DATA=true

# Exponer solo puerto necesario
EXPOSE 8000

# Comando seguro
CMD ["python", "lucIA.py"]
```

### **3. Kubernetes Seguro**
```yaml
# ConfigMap para configuración no sensible
apiVersion: v1
kind: ConfigMap
metadata:
  name: lucia-config
data:
  LUCIA_DEFAULT_PERSONALITY: "metaverso"
  LUCIA_LOG_LEVEL: "INFO"

---
# Secret para claves API
apiVersion: v1
kind: Secret
metadata:
  name: lucia-secrets
type: Opaque
data:
  OPENAI_API_KEY: <base64-encoded-key>
  HUGGINGFACE_API_KEY: <base64-encoded-key>
```

## 🆘 **Respuesta a Incidentes**

### **1. Clave API Comprometida**
```bash
# Pasos inmediatos
1. Revocar la clave comprometida inmediatamente
2. Generar nueva clave
3. Actualizar .env con la nueva clave
4. Verificar que no hay logs con la clave antigua
5. Monitorear uso de la clave antigua
6. Reportar el incidente si es necesario
```

### **2. Archivo .env Subido a GitHub**
```bash
# Pasos de emergencia
1. Eliminar el archivo del repositorio inmediatamente
2. Revocar todas las claves API
3. Generar nuevas claves
4. Actualizar .gitignore
5. Verificar historial de commits
6. Considerar usar BFG Repo-Cleaner si es necesario
```

### **3. Ataque de Rate Limiting**
```bash
# Respuesta al ataque
1. Activar rate limiting estricto
2. Monitorear patrones de uso
3. Implementar CAPTCHA si es necesario
4. Bloquear IPs maliciosas
5. Escalar recursos si es necesario
```

## 📚 **Recursos Adicionales**

### **Documentación de Seguridad**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure)
- [Python Security](https://python-security.readthedocs.io/)

### **Herramientas de Seguridad**
- [Bandit](https://bandit.readthedocs.io/) - Análisis estático de seguridad
- [Safety](https://pyup.io/safety/) - Verificación de dependencias vulnerables
- [TruffleHog](https://github.com/trufflesecurity/truffleHog) - Detección de secretos

### **Comandos Útiles**
```bash
# Instalar herramientas de seguridad
pip install bandit safety trufflehog

# Ejecutar auditoría de seguridad
bandit -r .
safety check
trufflehog --regex --entropy=False .

# Verificar dependencias
pip list --outdated
pip audit
```

---

## 🎯 **Resumen de Seguridad**

### **✅ Prácticas Obligatorias**
1. **NUNCA** hardcodear claves API en el código
2. **SIEMPRE** usar variables de entorno
3. **VERIFICAR** que .env está en .gitignore
4. **MONITOREAR** logs de seguridad
5. **ACTUALIZAR** dependencias regularmente
6. **VALIDAR** configuración antes de deploy

### **🚨 Señales de Alerta**
- Claves API en el código fuente
- Archivos .env en el repositorio
- Logs con información sensible
- Dependencias desactualizadas
- Rate limiting deshabilitado

### **🛡️ Protección Continua**
- Auditorías regulares de seguridad
- Monitoreo de uso de APIs
- Rotación de claves
- Backup de configuración
- Respuesta rápida a incidentes

---

**¡La seguridad es responsabilidad de todos! 🛡️**

Mantén tu proyecto seguro siguiendo estas prácticas y reporta cualquier vulnerabilidad que encuentres. 