// Script de publicación de escenas para el metaverso
// Uso: node publishScene.js --src <ruta_escena> --dest <directorio_destino>

const fs = require('fs');
const path = require('path');

function log(msg) {
  console.log(`[publishScene] ${msg}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--')) {
      params[args[i].substring(2)] = args[i + 1];
    }
  }
  return params;
}

function main() {
  const { src, dest } = parseArgs();
  if (!src || !dest) {
    log('Error: Debes especificar --src <archivo> y --dest <directorio>');
    process.exit(1);
  }

  if (!fs.existsSync(src)) {
    log(`Error: El archivo fuente no existe: ${src}`);
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    log(`El directorio destino no existe, creando: ${dest}`);
    fs.mkdirSync(dest, { recursive: true });
  }

  const fileName = path.basename(src);
  const destPath = path.join(dest, fileName);

  try {
    fs.copyFileSync(src, destPath);
    log(`✅ Escena publicada correctamente en: ${destPath}`);
  } catch (err) {
    log(`Error al copiar el archivo: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 