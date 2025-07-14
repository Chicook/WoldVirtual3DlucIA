#!/usr/bin/env python3
"""
Verificador de Integridad para Metaverso Crypto World Virtual 3D
Genera y verifica checksums de archivos críticos del entorno virtual
"""

import os
import json
import hashlib
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class IntegrityChecker:
    """Verificador de integridad de archivos del entorno virtual"""
    
    def __init__(self, venv_path: str = "."):
        self.venv_path = Path(venv_path)
        self.checksums_file = self.venv_path / ".venv_checksums"
        self.security_files = [
            "security_config.json",
            "blacklist.json",
            "whitelist.json",
            "README.md"
        ]
        self.script_files = [
            "Scripts/activate",
            "Scripts/Activate.ps1",
            "Scripts/security_activate.sh",
            "Scripts/metaverse_security_monitor.py",
            "Scripts/integrity_checker.py"
        ]
        self.critical_files = self.security_files + self.script_files
        
    def generate_checksums(self) -> Dict[str, str]:
        """Generar checksums de todos los archivos críticos"""
        checksums = {}
        
        logging.info("🔍 Generando checksums de archivos críticos...")
        
        for file_path in self.critical_files:
            full_path = self.venv_path / file_path
            if full_path.exists():
                try:
                    checksum = self.calculate_file_hash(full_path)
                    checksums[str(file_path)] = checksum
                    logging.info(f"✅ {file_path}: {checksum[:8]}...")
                except Exception as e:
                    logging.error(f"❌ Error generando checksum para {file_path}: {e}")
            else:
                logging.warning(f"⚠️ Archivo no encontrado: {file_path}")
        
        return checksums
    
    def save_checksums(self, checksums: Dict[str, str]):
        """Guardar checksums en archivo"""
        try:
            checksum_data = {
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "venv_path": str(self.venv_path),
                    "total_files": len(checksums),
                    "version": "1.0.0"
                },
                "checksums": checksums
            }
            
            with open(self.checksums_file, 'w') as f:
                json.dump(checksum_data, f, indent=2)
            
            logging.info(f"💾 Checksums guardados en: {self.checksums_file}")
            
        except Exception as e:
            logging.error(f"❌ Error guardando checksums: {e}")
    
    def load_checksums(self) -> Optional[Dict[str, str]]:
        """Cargar checksums desde archivo"""
        try:
            if not self.checksums_file.exists():
                logging.warning("⚠️ Archivo de checksums no encontrado")
                return None
            
            with open(self.checksums_file, 'r') as f:
                data = json.load(f)
            
            logging.info(f"📋 Checksums cargados desde: {self.checksums_file}")
            return data.get("checksums", {})
            
        except Exception as e:
            logging.error(f"❌ Error cargando checksums: {e}")
            return None
    
    def verify_checksums(self) -> Tuple[bool, List[str]]:
        """Verificar integridad de archivos"""
        stored_checksums = self.load_checksums()
        if not stored_checksums:
            logging.error("❌ No se pueden verificar checksums - archivo no encontrado")
            return False, ["Archivo de checksums no encontrado"]
        
        current_checksums = self.generate_checksums()
        violations = []
        
        logging.info("🔍 Verificando integridad de archivos...")
        
        # Verificar archivos existentes
        for file_path, stored_hash in stored_checksums.items():
            if file_path in current_checksums:
                current_hash = current_checksums[file_path]
                if stored_hash != current_hash:
                    violation = f"Checksum incorrecto para {file_path}"
                    violations.append(violation)
                    logging.error(f"❌ {violation}")
                    logging.error(f"   Esperado: {stored_hash[:8]}...")
                    logging.error(f"   Actual:   {current_hash[:8]}...")
                else:
                    logging.info(f"✅ {file_path}: Integridad verificada")
            else:
                violation = f"Archivo faltante: {file_path}"
                violations.append(violation)
                logging.error(f"❌ {violation}")
        
        # Verificar archivos nuevos
        for file_path in current_checksums:
            if file_path not in stored_checksums:
                violation = f"Archivo nuevo no verificado: {file_path}"
                violations.append(violation)
                logging.warning(f"⚠️ {violation}")
        
        integrity_ok = len(violations) == 0
        
        if integrity_ok:
            logging.info("✅ Verificación de integridad completada - TODOS LOS ARCHIVOS SON VÁLIDOS")
        else:
            logging.error(f"❌ Verificación de integridad fallida - {len(violations)} violaciones encontradas")
        
        return integrity_ok, violations
    
    def calculate_file_hash(self, file_path: Path) -> str:
        """Calcular hash SHA-256 de un archivo"""
        hash_sha256 = hashlib.sha256()
        
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_sha256.update(chunk)
            
            return hash_sha256.hexdigest()
            
        except Exception as e:
            logging.error(f"Error calculando hash de {file_path}: {e}")
            raise
    
    def check_file_permissions(self) -> List[str]:
        """Verificar permisos de archivos críticos"""
        permission_issues = []
        
        logging.info("🔐 Verificando permisos de archivos...")
        
        for file_path in self.critical_files:
            full_path = self.venv_path / file_path
            if full_path.exists():
                try:
                    stat = full_path.stat()
                    mode = stat.st_mode
                    
                    # Verificar permisos
                    if file_path.startswith("Scripts/"):
                        # Scripts deben ser ejecutables
                        if not (mode & 0o111):
                            issue = f"Script no ejecutable: {file_path}"
                            permission_issues.append(issue)
                            logging.warning(f"⚠️ {issue}")
                    else:
                        # Archivos de configuración no deben ser ejecutables
                        if mode & 0o111:
                            issue = f"Archivo de configuración ejecutable: {file_path}"
                            permission_issues.append(issue)
                            logging.warning(f"⚠️ {issue}")
                    
                    # Verificar que el propietario sea correcto
                    if hasattr(os, 'getuid'):
                        if stat.st_uid != os.getuid():
                            issue = f"Propietario incorrecto: {file_path}"
                            permission_issues.append(issue)
                            logging.warning(f"⚠️ {issue}")
                
                except Exception as e:
                    logging.error(f"Error verificando permisos de {file_path}: {e}")
        
        return permission_issues
    
    def scan_for_suspicious_content(self) -> List[str]:
        """Escanear archivos en busca de contenido sospechoso"""
        suspicious_patterns = [
            b"eval(",
            b"exec(",
            b"os.system(",
            b"subprocess.call(",
            b"pickle.loads(",
            b"marshal.loads(",
            b"yaml.load(",
            b"javascript:",
            b"vbscript:",
            b"data:",
            b"file://",
            b"http://",
            b"ftp://",
            b"telnet://"
        ]
        
        suspicious_findings = []
        
        logging.info("🔍 Escaneando contenido sospechoso...")
        
        for file_path in self.critical_files:
            full_path = self.venv_path / file_path
            if full_path.exists() and full_path.is_file():
                try:
                    with open(full_path, 'rb') as f:
                        content = f.read()
                    
                    for pattern in suspicious_patterns:
                        if pattern in content:
                            finding = f"Contenido sospechoso en {file_path}: {pattern.decode()}"
                            suspicious_findings.append(finding)
                            logging.warning(f"⚠️ {finding}")
                
                except Exception as e:
                    logging.error(f"Error escaneando {file_path}: {e}")
        
        return suspicious_findings
    
    def generate_integrity_report(self) -> Dict[str, Any]:
        """Generar reporte completo de integridad"""
        logging.info("📊 Generando reporte de integridad...")
        
        # Verificar checksums
        integrity_ok, violations = self.verify_checksums()
        
        # Verificar permisos
        permission_issues = self.check_file_permissions()
        
        # Escanear contenido sospechoso
        suspicious_content = self.scan_for_suspicious_content()
        
        # Generar reporte
        report = {
            "timestamp": datetime.now().isoformat(),
            "venv_path": str(self.venv_path),
            "integrity_status": "secure" if integrity_ok else "compromised",
            "checksum_violations": violations,
            "permission_issues": permission_issues,
            "suspicious_content": suspicious_content,
            "total_issues": len(violations) + len(permission_issues) + len(suspicious_content),
            "files_checked": len(self.critical_files)
        }
        
        return report
    
    def save_integrity_report(self, report: Dict[str, Any]):
        """Guardar reporte de integridad"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = self.venv_path / f"integrity_report_{timestamp}.json"
        
        try:
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            
            logging.info(f"💾 Reporte de integridad guardado: {report_file}")
            
        except Exception as e:
            logging.error(f"❌ Error guardando reporte: {e}")

def main():
    """Función principal"""
    print("🔍 Verificador de Integridad para Metaverso Crypto World Virtual 3D")
    print("=" * 70)
    
    checker = IntegrityChecker()
    
    # Generar checksums si no existen
    if not checker.checksums_file.exists():
        print("📝 Generando checksums iniciales...")
        checksums = checker.generate_checksums()
        checker.save_checksums(checksums)
        print("✅ Checksums iniciales generados")
    else:
        print("🔍 Verificando integridad existente...")
    
    # Generar reporte completo
    report = checker.generate_integrity_report()
    
    # Mostrar resumen
    print("\n📊 RESUMEN DE INTEGRIDAD:")
    print(f"Estado: {'🔒 SEGURO' if report['integrity_status'] == 'secure' else '🚨 COMPROMETIDO'}")
    print(f"Archivos verificados: {report['files_checked']}")
    print(f"Violaciones de checksum: {len(report['checksum_violations'])}")
    print(f"Problemas de permisos: {len(report['permission_issues'])}")
    print(f"Contenido sospechoso: {len(report['suspicious_content'])}")
    print(f"Total de problemas: {report['total_issues']}")
    
    # Guardar reporte
    checker.save_integrity_report(report)
    
    # Mostrar detalles si hay problemas
    if report['total_issues'] > 0:
        print("\n🚨 PROBLEMAS DETECTADOS:")
        
        if report['checksum_violations']:
            print("\n📋 Violaciones de Checksum:")
            for violation in report['checksum_violations']:
                print(f"  ❌ {violation}")
        
        if report['permission_issues']:
            print("\n🔐 Problemas de Permisos:")
            for issue in report['permission_issues']:
                print(f"  ⚠️ {issue}")
        
        if report['suspicious_content']:
            print("\n🔍 Contenido Sospechoso:")
            for finding in report['suspicious_content']:
                print(f"  ⚠️ {finding}")
    
    print("\n" + "=" * 70)
    
    if report['integrity_status'] == 'secure':
        print("✅ El entorno virtual es seguro y confiable")
        return 0
    else:
        print("❌ Se detectaron problemas de integridad - revisar reporte")
        return 1

if __name__ == "__main__":
    exit(main()) 