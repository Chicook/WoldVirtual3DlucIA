#!/usr/bin/env python3
"""
Script de Configuración de Seguridad del Metaverso
Configura el sistema de seguridad desde la carpeta Include
"""

import os
import json
import hashlib
import logging
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class SecuritySetup:
    """Configurador del sistema de seguridad"""
    
    def __init__(self, project_root: str = ".."):
        self.project_root = Path(project_root).resolve()
        self.include_dir = Path(".").resolve()
        
        # Archivos de configuración
        self.security_config = self.include_dir / "security_config.json"
        self.blacklist = self.include_dir / "blacklist.json"
        self.whitelist = self.include_dir / "whitelist.json"
        
    def validate_security_files(self) -> bool:
        """Validar archivos de configuración de seguridad"""
        print("🔍 Validando archivos de configuración de seguridad...")
        
        required_files = [
            self.security_config,
            self.blacklist,
            self.whitelist
        ]
        
        for file_path in required_files:
            if not file_path.exists():
                print(f"❌ Archivo faltante: {file_path}")
                return False
            
            try:
                with open(file_path, 'r') as f:
                    json.load(f)
                print(f"✅ {file_path.name} válido")
            except json.JSONDecodeError as e:
                print(f"❌ Error en {file_path.name}: {e}")
                return False
        
        return True
    
    def generate_checksums(self) -> Dict[str, str]:
        """Generar checksums de archivos críticos"""
        print("🔐 Generando checksums de archivos críticos...")
        
        critical_files = [
            "security_config.json",
            "blacklist.json", 
            "whitelist.json",
            "Scripts/security_activate.sh",
            "Scripts/metaverse_security_monitor.py",
            "Scripts/integrity_checker.py"
        ]
        
        checksums = {}
        
        for file_path in critical_files:
            full_path = self.include_dir / file_path
            if full_path.exists():
                try:
                    with open(full_path, 'rb') as f:
                        content = f.read()
                        checksum = hashlib.sha256(content).hexdigest()
                        checksums[file_path] = checksum
                        print(f"✅ {file_path}: {checksum[:8]}...")
                except Exception as e:
                    print(f"❌ Error generando checksum para {file_path}: {e}")
            else:
                print(f"⚠️ Archivo no encontrado: {file_path}")
        
        return checksums
    
    def save_checksums(self, checksums: Dict[str, str]):
        """Guardar checksums en archivo"""
        try:
            checksum_data = {
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "include_path": str(self.include_dir),
                    "total_files": len(checksums),
                    "version": "1.0.0"
                },
                "checksums": checksums
            }
            
            checksum_file = self.include_dir / ".security_checksums"
            with open(checksum_file, 'w') as f:
                json.dump(checksum_data, f, indent=2)
            
            print(f"💾 Checksums guardados en: {checksum_file}")
            
        except Exception as e:
            print(f"❌ Error guardando checksums: {e}")
    
    def setup_security_environment(self) -> bool:
        """Configurar variables de entorno de seguridad"""
        print("🔒 Configurando variables de entorno de seguridad...")
        
        try:
            env_file = self.project_root / ".security.env"
            env_content = [
                "# Variables de entorno de seguridad del Metaverso",
                "# Generado automáticamente por security_setup.py",
                "",
                "# Configuración de seguridad",
                "SECURITY_ENABLED=true",
                "SECURITY_LEVEL=high",
                "SECURITY_MONITORING_ENABLED=true",
                "SECURITY_AUTO_BLOCK_SUSPICIOUS=true",
                "",
                "# Verificación de integridad",
                "SECURITY_VERIFY_CHECKSUMS=true",
                "SECURITY_VERIFY_SIGNATURES=true",
                "SECURITY_WHITELIST_ONLY=true",
                "",
                "# Monitoreo",
                "SECURITY_MONITORING_INTERVAL=30",
                "SECURITY_ALERT_THRESHOLD=5",
                "",
                "# Blockchain security",
                "BLOCKCHAIN_SECURITY_ENABLED=true",
                "FLASH_LOAN_PROTECTION=true",
                "REENTRANCY_PROTECTION=true",
                "FRONT_RUNNING_PROTECTION=true",
                "",
                "# 3D security",
                "THREEJS_SECURITY_ENABLED=true",
                "WEBGL_SANDBOX=true",
                "MODEL_VALIDATION=true",
                "",
                "# NFT security",
                "NFT_SECURITY_ENABLED=true",
                "METADATA_VALIDATION=true",
                "ROYALTY_VALIDATION=true",
                "",
                "# DeFi security",
                "DEFI_SECURITY_ENABLED=true",
                "LIQUIDITY_VALIDATION=true",
                "PRICE_VALIDATION=true",
                "SLIPPAGE_PROTECTION=true"
            ]
            
            with open(env_file, 'w') as f:
                f.write('\n'.join(env_content))
            
            print(f"✅ Variables de entorno de seguridad configuradas en {env_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error configurando variables de entorno: {e}")
            return False
    
    def setup_security_scripts(self) -> bool:
        """Configurar scripts de seguridad"""
        print("📜 Configurando scripts de seguridad...")
        
        try:
            scripts_dir = self.include_dir / "Scripts"
            scripts_dir.mkdir(exist_ok=True)
            
            # Verificar que los scripts existan
            required_scripts = [
                "security_activate.sh",
                "metaverse_security_monitor.py",
                "integrity_checker.py"
            ]
            
            for script in required_scripts:
                script_path = scripts_dir / script
                if not script_path.exists():
                    print(f"⚠️ Script faltante: {script}")
                else:
                    # Hacer ejecutable en sistemas Unix
                    try:
                        os.chmod(script_path, 0o755)
                        print(f"✅ {script} configurado")
                    except Exception:
                        print(f"✅ {script} verificado")
            
            return True
            
        except Exception as e:
            print(f"❌ Error configurando scripts: {e}")
            return False
    
    def create_security_readme(self) -> bool:
        """Crear README de seguridad"""
        print("📖 Creando documentación de seguridad...")
        
        try:
            readme_content = """# 🔒 Sistema de Seguridad del Metaverso

## 🚀 Inicio Rápido

### Activación del Sistema de Seguridad
```bash
# Activar con todas las protecciones
source Scripts/security_activate.sh
```

### Verificación de Integridad
```bash
# Verificar integridad de archivos críticos
python Scripts/integrity_checker.py
```

### Monitoreo Continuo
```bash
# Iniciar monitor de seguridad en background
python Scripts/metaverse_security_monitor.py &
```

## 🛡️ Protecciones Implementadas

### Protección Blockchain
- Flash Loan Protection
- Reentrancy Protection
- Front-Running Protection
- MEV Protection
- Sandwich Attack Protection
- Rug Pull Detection

### Protección 3D
- WebGL Sandbox
- Three.js Security
- Model Validation
- Texture Validation
- Animation Validation
- Scene Integrity

### Protección NFT
- Metadata Validation
- URI Validation
- Royalty Validation
- Ownership Validation
- Transfer Validation

### Protección DeFi
- Liquidity Validation
- Price Validation
- Slippage Protection
- Flash Loan Detection
- Sandwich Attack Detection

## 📊 Monitoreo y Alertas

### Tipos de Alertas
- **🔴 Críticas**: Procesos maliciosos, violaciones de integridad, ataques blockchain
- **🟡 Altas**: Paquetes en lista negra, conexiones sospechosas, vulnerabilidades NFT
- **🟠 Medias**: Uso alto de recursos, tráfico anómalo, configuraciones inseguras
- **🟢 Bajas**: Advertencias, actualizaciones, logs de auditoría

## 🚨 Respuesta a Incidentes

### Comandos de Emergencia
```bash
# Activar modo de emergencia
export EMERGENCY_MODE=1

# Bloquear IPs sospechosas
python Scripts/block_suspicious_ips.py

# Aislar procesos maliciosos
python Scripts/quarantine_processes.py

# Pausar funcionalidades críticas
python Scripts/pause_blockchain.py
python Scripts/pause_3d_rendering.py
python Scripts/freeze_wallets.py
```

## 🔧 Mantenimiento

### Actualizaciones Diarias
```bash
# Verificar actualizaciones de seguridad
python Scripts/check_security_updates.py

# Aplicar actualizaciones automáticas
python Scripts/auto_update_security.py

# Rotar logs
python Scripts/rotate_logs.py
```

### Auditoría Semanal
```bash
# Auditoría de seguridad completa
python Scripts/security_audit.py --full

# Verificación de backups
python Scripts/verify_backups.py

# Análisis de vulnerabilidades
python Scripts/vulnerability_scan.py
```

## ⚠️ Advertencias Importantes

1. **Nunca desactives el sistema de seguridad** sin autorización
2. **Mantén actualizadas** las listas de amenazas
3. **Revisa regularmente** los logs de seguridad
4. **Reporta inmediatamente** cualquier incidente sospechoso
5. **Haz backups regulares** de la configuración de seguridad
6. **Prueba el sistema** en un entorno controlado antes de producción

---

*Configurado automáticamente por security_setup.py*
*Última actualización: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
            
            readme_file = self.include_dir / "SECURITY_QUICKSTART.md"
            with open(readme_file, 'w') as f:
                f.write(readme_content)
            
            print(f"✅ Documentación de seguridad creada en {readme_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error creando documentación: {e}")
            return False
    
    def run_security_setup(self) -> bool:
        """Ejecutar configuración completa de seguridad"""
        print("🔒 Configurando Sistema de Seguridad del Metaverso")
        print("=" * 60)
        
        # Validar archivos de configuración
        if not self.validate_security_files():
            return False
        
        # Generar checksums
        checksums = self.generate_checksums()
        if checksums:
            self.save_checksums(checksums)
        
        # Configurar variables de entorno
        if not self.setup_security_environment():
            return False
        
        # Configurar scripts
        if not self.setup_security_scripts():
            return False
        
        # Crear documentación
        if not self.create_security_readme():
            return False
        
        print("\n" + "=" * 60)
        print("✅ Configuración de seguridad completada exitosamente!")
        print("\n📋 Próximos pasos:")
        print("1. Activar sistema de seguridad: source Scripts/security_activate.sh")
        print("2. Verificar integridad: python Scripts/integrity_checker.py")
        print("3. Iniciar monitoreo: python Scripts/metaverse_security_monitor.py &")
        print("4. Revisar documentación: SECURITY_QUICKSTART.md")
        print("5. Configurar alertas y notificaciones")
        
        return True

def main():
    """Función principal"""
    setup = SecuritySetup()
    
    try:
        success = setup.run_security_setup()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n❌ Configuración cancelada por el usuario")
        exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la configuración: {e}")
        exit(1)

if __name__ == "__main__":
    main() 