# security/

Scripts de auditoría, escaneo de dependencias y refuerzo de seguridad.

## ¿Qué contiene?
- Escaneo de dependencias (npm audit, snyk, etc).
- Análisis estático de código (eslint, slither, mythril).
- Reportes automáticos y centralizados.

## Buenas prácticas
- Centraliza reportes de seguridad en logs/.
- Integra con CI/CD para bloquear builds inseguros.
- Documenta políticas de seguridad y ejemplos de uso.

## Ejemplo de uso
```bash
./audit.sh
node scan-vulnerabilities.js
``` 