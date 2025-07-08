#!/usr/bin/env node
const fs = require('fs');
const files = ['.env', '.secrets.baseline', '.env.local', '.env.secret', '.pem', '.key'];
let issues = 0;
files.forEach(f => {
  if (fs.existsSync(f)) {
    const stat = fs.statSync(f);
    const mode = stat.mode & 0o777;
    if (mode & 0o077) {
      console.log(`⚠️  Permisos inseguros en ${f}: ${mode.toString(8)}. Recomiendo chmod 600 ${f}`);
      issues++;
    }
  }
});
if (issues === 0) {
  console.log('✅ Todos los archivos sensibles tienen permisos seguros.');
} else {
  process.exit(1);
} 