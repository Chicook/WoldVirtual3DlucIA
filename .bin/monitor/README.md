# monitor/

Scripts de monitoreo distribuido, health-checks y métricas de rendimiento.

## ¿Qué contiene?
- Health-checks de servicios (API, DB, blockchain, assets).
- Métricas de rendimiento (latencia, CPU, RAM, FPS).
- Integración con Prometheus/Grafana/Sentry.

## Buenas prácticas
- Centraliza logs de monitoreo en logs/.
- Automatiza alertas ante fallos o degradación.
- Documenta integración y visualización de métricas.

## Ejemplo de uso
```bash
./health-check.sh
node performance-check.js
``` 