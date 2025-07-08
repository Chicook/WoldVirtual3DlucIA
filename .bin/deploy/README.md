# deploy/

Scripts de despliegue seguro y reproducible para mainnet y testnet.

## ¿Qué contiene?
- Scripts Bash para despliegue (`deploy-mainnet.sh`, `deploy-testnet.sh`).
- Validaciones previas, backups y limpieza post-deploy.

## Buenas prácticas
- Centraliza logs de despliegue en logs/.
- Añade notificaciones post-deploy.
- Documenta variables de entorno necesarias.

## Ejemplo de uso
```bash
./deploy-mainnet.sh
./deploy-testnet.sh deploy
``` 