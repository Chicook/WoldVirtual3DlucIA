# 🛡️ Configuración Segura de Variables de Entorno

## ¿Cómo agregar tus claves y variables de entorno de forma segura?

### 1. **Nunca subas archivos `.env` reales a git**
- Usa siempre el archivo `development.env.example` como plantilla.
- Crea tu propio archivo local: `development.env` (o `.env` según el módulo).
- **No renombres ni modifiques el `.example` para poner claves reales.**

### 2. **Pasos para configurar tu entorno local**
1. Copia el archivo de ejemplo:
   ```
   cp development.env.example development.env
   ```
2. Abre `development.env` y pon tus claves y endpoints reales:
   ```
   API_KEY=tu-clave-aqui
   JWT_SECRET=tu-secreto-aqui
   ...
   ```
3. Guarda el archivo. **No lo subas nunca a git.**

### 3. **¿Por qué es importante?**
- Subir claves a git puede comprometer la seguridad de todo el proyecto y de los usuarios.
- Los archivos `.env` y similares están protegidos por `.gitignore`.
- Si accidentalmente subes una clave, **cámbiala inmediatamente** y elimina el commit del historial.

### 4. **Buenas prácticas para el equipo**
- Usa siempre archivos `.env` locales y nunca los compartas por correo ni chats públicos.
- Si necesitas compartir la estructura, usa solo el archivo `.example`.
- Si tienes dudas, pregunta antes de hacer commit.
- Haz `git status` antes de cada commit para asegurarte de que no hay archivos sensibles en staging.

### 5. **Advertencia**
> **Nunca subas archivos de entorno reales, claves API, secretos ni contraseñas al repositorio.**
> El incumplimiento puede llevar a la revocación de accesos y a problemas legales/operativos.

---

**¡Gracias por mantener el proyecto seguro y profesional!** 