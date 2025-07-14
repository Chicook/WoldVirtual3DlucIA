#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Recuperación Masiva - WoldVirtual3DlucIA
Recupera todo el desarrollo perdido desde los backups disponibles
"""

import os
import shutil
import zipfile
from pathlib import Path
from datetime import datetime
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('recovery_operations.log'),
        logging.StreamHandler()
    ]
)

class MassRecoveryManager:
    """Gestor de recuperación masiva de desarrollo perdido"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.backup_dir = self.project_root / "backups" / "config_security"
        self.recovery_log = self.project_root / "logs" / "recovery_operations.log"
        
        # Carpetas críticas que deben recuperarse
        self.critical_folders = [
            'ini', 'client', 'web', 'src', 'services', 'components',
            'bloc', 'assets', 'entities', 'fonts', 'helpers', 'image',
            'languages', 'lib', 'middlewares', 'models', 'package',
            'pages', 'public', 'scripts', 'test', 'css', 'data',
            'docs', 'config', 'cli', 'js', 'Include', '@types'
        ]
        
        self.setup_logging()
    
    def setup_logging(self):
        """Configura el sistema de logging"""
        self.recovery_log.parent.mkdir(parents=True, exist_ok=True)
    
    def log_operation(self, operation: str, details: str):
        """Registra operaciones de recuperación"""
        timestamp = datetime.now().isoformat()
        log_entry = f"[{timestamp}] {operation}: {details}\n"
        
        with open(self.recovery_log, 'a', encoding='utf-8') as f:
            f.write(log_entry)
        
        logging.info(f"{operation}: {details}")
    
    def find_latest_backup(self, folder_name: str) -> Path:
        """Encuentra el backup más reciente de una carpeta"""
        # Buscar backups completos primero
        complete_pattern = f"complete_{folder_name}_*"
        complete_backups = list(self.backup_dir.glob(complete_pattern))
        
        if complete_backups:
            # Ordenar por timestamp y tomar el más reciente
            latest_complete = max(complete_backups, key=lambda x: x.name)
            self.log_operation("BACKUP_FOUND", f"Backup completo: {latest_complete}")
            return latest_complete
        
        # Buscar backups regulares
        regular_pattern = f"{folder_name}_*"
        regular_backups = list(self.backup_dir.glob(regular_pattern))
        
        if regular_backups:
            latest_regular = max(regular_backups, key=lambda x: x.name)
            self.log_operation("BACKUP_FOUND", f"Backup regular: {latest_regular}")
            return latest_regular
        
        return None
    
    def backup_current_state(self, folder_name: str):
        """Hace backup del estado actual antes de restaurar"""
        current_folder = self.project_root / folder_name
        if current_folder.exists():
            backup_name = f"pre_recovery_{folder_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            backup_path = self.backup_dir / backup_name
            
            try:
                shutil.copytree(current_folder, backup_path)
                self.log_operation("PRE_RECOVERY_BACKUP", f"{folder_name} -> {backup_name}")
            except Exception as e:
                self.log_operation("BACKUP_ERROR", f"Error backup {folder_name}: {str(e)}")
    
    def restore_folder(self, folder_name: str) -> bool:
        """Restaura una carpeta desde su backup más reciente"""
        try:
            # Hacer backup del estado actual
            self.backup_current_state(folder_name)
            
            # Encontrar el backup más reciente
            backup_path = self.find_latest_backup(folder_name)
            if not backup_path:
                self.log_operation("NO_BACKUP_FOUND", f"No se encontró backup para {folder_name}")
                return False
            
            # Ruta de destino
            target_path = self.project_root / folder_name
            
            # Eliminar carpeta actual si existe
            if target_path.exists():
                shutil.rmtree(target_path)
                self.log_operation("CLEANED_TARGET", f"Eliminada carpeta actual: {folder_name}")
            
            # Restaurar desde backup
            shutil.copytree(backup_path, target_path)
            self.log_operation("RESTORED_FOLDER", f"{folder_name} restaurada desde {backup_path.name}")
            
            return True
            
        except Exception as e:
            self.log_operation("RESTORE_ERROR", f"Error restaurando {folder_name}: {str(e)}")
            return False
    
    def extract_dependencies_zip(self):
        """Extrae el archivo de dependencias más reciente"""
        try:
            # Buscar el archivo de dependencias más reciente
            dependency_zips = list(self.backup_dir.glob("dependencies_*.zip"))
            if not dependency_zips:
                self.log_operation("NO_DEPENDENCIES_ZIP", "No se encontró archivo de dependencias")
                return False
            
            latest_zip = max(dependency_zips, key=lambda x: x.name)
            self.log_operation("EXTRACTING_DEPENDENCIES", f"Extrayendo {latest_zip.name}")
            
            # Extraer al directorio raíz
            with zipfile.ZipFile(latest_zip, 'r') as zip_ref:
                zip_ref.extractall(self.project_root)
            
            self.log_operation("DEPENDENCIES_EXTRACTED", f"Dependencias extraídas desde {latest_zip.name}")
            return True
            
        except Exception as e:
            self.log_operation("EXTRACT_ERROR", f"Error extrayendo dependencias: {str(e)}")
            return False
    
    def perform_mass_recovery(self):
        """Ejecuta la recuperación masiva de todo el desarrollo"""
        self.log_operation("RECOVERY_STARTED", "Iniciando recuperación masiva del desarrollo")
        
        # Estadísticas
        total_folders = len(self.critical_folders)
        restored_folders = 0
        failed_folders = []
        
        # Restaurar cada carpeta crítica
        for folder_name in self.critical_folders:
            self.log_operation("PROCESSING_FOLDER", f"Procesando: {folder_name}")
            
            if self.restore_folder(folder_name):
                restored_folders += 1
                self.log_operation("SUCCESS", f"{folder_name} restaurada exitosamente")
            else:
                failed_folders.append(folder_name)
                self.log_operation("FAILED", f"Falló la restauración de {folder_name}")
        
        # Extraer dependencias
        self.extract_dependencies_zip()
        
        # Resumen final
        success_rate = (restored_folders / total_folders) * 100
        self.log_operation("RECOVERY_COMPLETED", 
                          f"Recuperación completada: {restored_folders}/{total_folders} carpetas ({success_rate:.1f}%)")
        
        if failed_folders:
            self.log_operation("FAILED_FOLDERS", f"Carpetas fallidas: {', '.join(failed_folders)}")
        
        return success_rate >= 80  # Considerar exitoso si se recuperó al menos 80%
    
    def verify_recovery(self):
        """Verifica que la recuperación fue exitosa"""
        self.log_operation("VERIFICATION_STARTED", "Iniciando verificación de recuperación")
        
        verification_results = {}
        
        for folder_name in self.critical_folders:
            folder_path = self.project_root / folder_name
            if folder_path.exists():
                # Contar archivos en la carpeta
                file_count = len(list(folder_path.rglob('*')))
                verification_results[folder_name] = {
                    'exists': True,
                    'file_count': file_count
                }
                self.log_operation("VERIFICATION_SUCCESS", f"{folder_name}: {file_count} archivos")
            else:
                verification_results[folder_name] = {
                    'exists': False,
                    'file_count': 0
                }
                self.log_operation("VERIFICATION_FAILED", f"{folder_name}: No existe")
        
        # Resumen de verificación
        existing_folders = sum(1 for result in verification_results.values() if result['exists'])
        total_files = sum(result['file_count'] for result in verification_results.values())
        
        self.log_operation("VERIFICATION_COMPLETED", 
                          f"Verificación completada: {existing_folders}/{len(self.critical_folders)} carpetas, {total_files} archivos totales")
        
        return verification_results

def main():
    """Función principal del script de recuperación"""
    print("🚨 INICIANDO RECUPERACIÓN MASIVA DEL DESARROLLO 🚨")
    print("=" * 60)
    
    recovery_manager = MassRecoveryManager()
    
    # Ejecutar recuperación masiva
    success = recovery_manager.perform_mass_recovery()
    
    if success:
        print("\n✅ RECUPERACIÓN MASIVA COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        
        # Verificar la recuperación
        verification_results = recovery_manager.verify_recovery()
        
        print("\n📊 RESUMEN DE VERIFICACIÓN:")
        for folder_name, result in verification_results.items():
            status = "✅" if result['exists'] else "❌"
            print(f"{status} {folder_name}: {result['file_count']} archivos")
        
        print(f"\n🎯 El desarrollo ha sido recuperado en un {success * 100:.1f}%")
        print("📝 Revisa el archivo 'recovery_operations.log' para detalles completos")
        
    else:
        print("\n❌ LA RECUPERACIÓN NO FUE COMPLETAMENTE EXITOSA")
        print("📝 Revisa el archivo 'recovery_operations.log' para identificar problemas")
    
    print("\n🔄 Reinicia el proyecto y verifica que todo funcione correctamente")

if __name__ == "__main__":
    main() 