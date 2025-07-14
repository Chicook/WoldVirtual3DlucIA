#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const reportsDir = path.resolve(__dirname, '../workflows');
const outputDir = path.resolve(__dirname, '../artifacts');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
const summary = [];
fs.readdirSync(reportsDir).forEach(file => {
  if (file.endsWith('-report.json')) {
    const data = JSON.parse(fs.readFileSync(path.join(reportsDir, file), 'utf8'));
    summary.push({file, ...data});
  }
});
fs.writeFileSync(path.join(outputDir, 'security-dashboard.json'), JSON.stringify(summary, null, 2));
// HTML básico
let html = `<html><head><title>Panel de Seguridad</title></head><body><h1>Panel de Seguridad</h1><ul>`;
summary.forEach(r => {
  html += `<li><b>${r.file}</b><pre>${JSON.stringify(r, null, 2)}</pre></li>`;
});
html += '</ul></body></html>';
fs.writeFileSync(path.join(outputDir, 'security-dashboard.html'), html);
console.log('Panel de seguridad generado en artifacts/.'); 