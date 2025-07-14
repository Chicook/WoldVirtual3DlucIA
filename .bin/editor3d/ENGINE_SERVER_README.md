# Servidor del Motor 3D - WoldVirtual3DlucIA

## Descripción

El servidor del motor 3D es un componente esencial del editor que maneja las conexiones WebSocket y procesa los comandos del motor 3D. Este servidor debe estar ejecutándose para que el EngineBridge pueda conectarse y funcionar correctamente.

## Problema Resuelto

El error `WebSocket connection to 'ws://localhost:8080/' failed: Insufficient resources` se debía a que no había un servidor WebSocket ejecutándose en el puerto 8080. Este servidor ahora proporciona:

- ✅ Conexiones WebSocket estables
- ✅ Manejo de comandos del motor 3D
- ✅ Sistema de heartbeat para mantener conexiones
- ✅ Reconexión automática en caso de errores
- ✅ Broadcast de eventos a todos los clientes conectados

## Instalación

### 1. Instalar dependencias

```bash
cd .bin/editor3d
npm install
```

### 2. Verificar dependencias

El servidor requiere las siguientes dependencias:
- `ws`: Para WebSocket
- `events`: Para EventEmitter
- `ts-node`: Para ejecutar TypeScript directamente
- `@types/ws`: Tipos para WebSocket
- `@types/node`: Tipos para Node.js

## Uso

### Opción 1: Script automático (Recomendado)

```bash
cd .bin/editor3d
node start-engine-server.js
```

### Opción 2: Ejecución directa

```bash
cd .bin/editor3d
npx ts-node src/core/engine/EngineServer.ts
```

### Opción 3: Con parámetros personalizados

```bash
cd .bin/editor3d
node start-engine-server.js --port 9000 --host 0.0.0.0 --debug
```

### Opción 4: Variables de entorno

```bash
cd .bin/editor3d
ENGINE_PORT=9000 ENGINE_HOST=0.0.0.0 ENGINE_DEBUG=true node start-engine-server.js
```

## Configuración

### Puerto por defecto
- **Puerto**: 8080
- **Host**: localhost
- **Protocolo**: WebSocket (ws://)

### Variables de entorno
- `ENGINE_PORT`: Puerto del servidor (default: 8080)
- `ENGINE_HOST`: Host del servidor (default: localhost)
- `ENGINE_DEBUG`: Habilitar debug (default: false)

## Funcionalidades

### Comandos Soportados

El servidor maneja los siguientes comandos del motor 3D:

1. **create_entity**: Crear una nueva entidad
2. **delete_entity**: Eliminar una entidad existente
3. **add_component**: Agregar componente a una entidad
4. **remove_component**: Remover componente de una entidad
5. **update_component**: Actualizar componente de una entidad
6. **load_model**: Cargar modelo 3D
7. **create_material**: Crear material
8. **create_light**: Crear luz
9. **create_camera**: Crear cámara
10. **load_scene**: Cargar escena
11. **save_scene**: Guardar escena
12. **get_state**: Obtener estado actual
13. **get_stats**: Obtener estadísticas

### Eventos Broadcast

El servidor emite eventos a todos los clientes conectados:

- `entity_created`: Nueva entidad creada
- `entity_updated`: Entidad actualizada
- `entity_deleted`: Entidad eliminada
- `scene_loaded`: Escena cargada
- `scene_saved`: Escena guardada
- `heartbeat`: Latido del servidor

### Sistema de Heartbeat

- **Intervalo**: 30 segundos por defecto
- **Propósito**: Mantener conexiones activas
- **Configuración**: Modificable en el código

## Solución de Problemas

### Error: "Insufficient resources"

**Causa**: No hay servidor WebSocket ejecutándose en el puerto 8080

**Solución**:
1. Ejecutar el servidor del motor 3D
2. Verificar que el puerto 8080 esté disponible
3. Revisar logs del servidor

### Error: "Maximum retries reached"

**Causa**: El EngineBridge no puede conectarse después de múltiples intentos

**Solución**:
1. Verificar que el servidor esté ejecutándose
2. Comprobar configuración de puerto/host
3. Revisar firewall/antivirus

### Error: "WebSocket is closed"

**Causa**: Conexión WebSocket cerrada inesperadamente

**Solución**:
1. El servidor maneja reconexión automática
2. Verificar estabilidad de la red
3. Revisar logs del servidor

## Logs y Debugging

### Habilitar modo debug

```bash
node start-engine-server.js --debug
```

### Logs típicos

```
🚀 Iniciando servidor del motor 3D...
==================================================
📊 Configuración:
   - Puerto: 8080
   - Host: localhost
   - Debug: true
==================================================
📍 Ruta del servidor: C:\...\src\core\engine\EngineServer.ts
🚀 Servidor del motor 3D iniciado en ws://localhost:8080
✅ Servidor del motor 3D iniciado correctamente
🔌 Cliente conectado: client_1234567890_abc123
📨 Mensaje de client_1234567890_abc123: command
⚡ Comando de client_1234567890_abc123: create_entity
```

## Arquitectura

### Componentes Principales

1. **EngineServer**: Servidor WebSocket principal
2. **EngineBridge**: Cliente WebSocket en el editor
3. **EngineCommands**: Comandos específicos del motor
4. **EventEmitter**: Sistema de eventos

### Flujo de Comunicación

```
Editor (EngineBridge) ←→ WebSocket ←→ Servidor (EngineServer)
                              ↓
                        Comandos del Motor
                              ↓
                        Respuestas y Eventos
```

## Desarrollo

### Estructura de Archivos

```
.bin/editor3d/
├── src/
│   └── core/
│       └── engine/
│           ├── EngineServer.ts      # Servidor WebSocket
│           ├── EngineBridge.ts      # Cliente WebSocket
│           └── types/
│               └── engine.ts        # Tipos TypeScript
├── start-engine-server.js           # Script de inicio
└── ENGINE_SERVER_README.md          # Esta documentación
```

### Agregar Nuevos Comandos

1. Agregar el comando en `EngineServer.ts`
2. Implementar la lógica del comando
3. Agregar el método correspondiente en `EngineCommands`
4. Actualizar tipos en `engine.ts`

### Ejemplo de Nuevo Comando

```typescript
// En EngineServer.ts
case 'custom_command':
  response = await this.customCommand(command.data);
  break;

private async customCommand(data: any): Promise<EngineResponse> {
  // Implementar lógica del comando
  return {
    success: true,
    data: { result: 'success' }
  };
}
```

## Seguridad

### Consideraciones

- El servidor actual es para desarrollo
- En producción, implementar autenticación
- Validar todos los comandos de entrada
- Limitar conexiones por IP
- Implementar rate limiting

### Configuración de Producción

```typescript
const config = {
  port: 8080,
  host: '0.0.0.0',
  maxConnections: 100,
  heartbeatInterval: 30000,
  commandTimeout: 5000,
  // Agregar configuraciones de seguridad
  enableAuth: true,
  rateLimit: 100, // comandos por minuto
  allowedOrigins: ['https://tu-dominio.com']
};
```

## Contribución

Para contribuir al desarrollo del servidor:

1. Seguir las reglas de modularidad (200-300 líneas por archivo)
2. Mantener compatibilidad con el EngineBridge
3. Agregar tests para nuevos comandos
4. Documentar cambios en este README

## Licencia

MIT License - Ver LICENSE para más detalles. 