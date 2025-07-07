const fs = require('fs');
const path = require('path');

// Directorios que contienen package.json con referencias workspace:*
const directories = [
  'config',
  'client', 
  'bloc',
  'cli',
  'assets',
  'backend'
];

function fixWorkspaceDeps(dir) {
  const packagePath = path.join(dir, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log(`⚠️  No se encontró package.json en ${dir}`);
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    let modified = false;

    // Corregir dependencies
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach(key => {
        if (packageJson.dependencies[key] === 'workspace:*') {
          packageJson.dependencies[key] = '^1.0.0';
          modified = true;
          console.log(`✅ Corregido dependency en ${dir}: ${key}`);
        }
      });
    }

    // Corregir devDependencies
    if (packageJson.devDependencies) {
      Object.keys(packageJson.devDependencies).forEach(key => {
        if (packageJson.devDependencies[key] === 'workspace:*') {
          packageJson.devDependencies[key] = '^1.0.0';
          modified = true;
          console.log(`✅ Corregido devDependency en ${dir}: ${key}`);
        }
      });
    }

    // Corregir peerDependencies
    if (packageJson.peerDependencies) {
      Object.keys(packageJson.peerDependencies).forEach(key => {
        if (packageJson.peerDependencies[key] === 'workspace:*') {
          packageJson.peerDependencies[key] = '^1.0.0';
          modified = true;
          console.log(`✅ Corregido peerDependency en ${dir}: ${key}`);
        }
      });
    }

    if (modified) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Package.json actualizado en ${dir}`);
    } else {
      console.log(`ℹ️  No se encontraron referencias workspace:* en ${dir}`);
    }

  } catch (error) {
    console.error(`❌ Error procesando ${dir}:`, error.message);
  }
}

console.log('🔧 Corrigiendo referencias workspace:* en package.json...\n');

directories.forEach(dir => {
  console.log(`📁 Procesando ${dir}...`);
  fixWorkspaceDeps(dir);
  console.log('');
});

console.log('✅ Proceso completado!'); 