// ws-test-server.js
const { WebSocketServer } = require('ws');
const PORT = 8181;

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`✅ WebSocket de prueba escuchando en ws://localhost:${PORT}`);
});

wss.on('connection', ws => {
  console.log('🔌 Cliente conectado');
  ws.on('message', msg => {
    console.log('📨 Mensaje recibido:', msg.toString());
    ws.send('pong');
  });
  ws.send('¡Bienvenido!');
});

wss.on('error', err => {
  console.error('❌ Error en WebSocket:', err);
}); 