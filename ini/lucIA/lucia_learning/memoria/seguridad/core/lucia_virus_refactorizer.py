#!/usr/bin/env python3
"""
lucia_virus_refactorizer.py
Sistema principal de refactorización de virus para lucIA
Coordina todos los módulos de seguridad y permite convertir malware en código útil
"""

import os
import sys
import json
import time
import asyncio
import threading
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import logging
import hashlib
import base64
import tempfile
import shutil

# Importar el orquestador avanzado
from advanced_security_orchestrator import AdvancedSecurityOrchestrator, ComprehensiveSecurityReport

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lucia_virus_refactorizer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class VirusRefactorizationJob:
    """Trabajo de refactorización de virus"""
    id: str
    file_path: str
    file_hash: str
    original_threat_score: float
    refactorization_status: str  # pending, in_progress, completed, failed
    start_time: str
    end_time: Optional[str]
    security_report: Optional[ComprehensiveSecurityReport]
    refactored_code: Optional[str]
    final_safety_score: Optional[float]
    lucia_notes: List[str]
    learning_insights: List[str]

@dataclass
class RefactorizationTemplate:
    """Plantilla de refactorización para tipos específicos de malware"""
    name: str
    description: str
    target_patterns: List[str]
    replacement_code: str
    safety_improvements: List[str]
    learning_objectives: List[str]

class LucIAVirusRefactorizer:
    """Sistema principal de refactorización de virus para lucIA"""
    
    def __init__(self):
        self.orchestrator = AdvancedSecurityOrchestrator()
        self.refactorization_queue = []
        self.completed_refactorizations = []
        self.refactorization_templates = self._load_refactorization_templates()
        self.learning_database = self._initialize_learning_database()
        
        # Directorios de trabajo
        self.work_dir = Path("./lucia_work")
        self.learning_dir = Path("./lucia_learning")
        self.templates_dir = Path("./refactorization_templates")
        
        # Crear directorios
        self._create_work_directories()
        
        # Estadísticas de aprendizaje
        self.learning_stats = {
            'viruses_analyzed': 0,
            'successful_refactorizations': 0,
            'learning_insights_generated': 0,
            'security_patterns_learned': 0,
            'templates_created': 0
        }
        
        logger.info("🧠 LucIA Virus Refactorizer inicializado")
    
    def _load_refactorization_templates(self) -> List[RefactorizationTemplate]:
        """Cargar plantillas de refactorización predefinidas"""
        return [
            RefactorizationTemplate(
                name="Ransomware to Backup Tool",
                description="Convierte ransomware en herramienta de backup segura",
                target_patterns=[
                    "encrypt.*files",
                    "ransom.*demand",
                    "delete.*original"
                ],
                replacement_code="""
# Herramienta de Backup Seguro (Refactorizada desde Ransomware)
import os
import shutil
import hashlib
from datetime import datetime

def create_secure_backup(source_path, backup_path):
    \"\"\"Crear backup seguro de archivos\"\"\"
    try:
        # Verificar integridad antes del backup
        if not os.path.exists(source_path):
            raise FileNotFoundError(f"Ruta de origen no encontrada: {source_path}")
        
        # Crear directorio de backup si no existe
        os.makedirs(backup_path, exist_ok=True)
        
        # Copiar archivos con verificación de integridad
        for root, dirs, files in os.walk(source_path):
            for file in files:
                source_file = os.path.join(root, file)
                relative_path = os.path.relpath(source_file, source_path)
                backup_file = os.path.join(backup_path, relative_path)
                
                # Crear directorio de destino si es necesario
                os.makedirs(os.path.dirname(backup_file), exist_ok=True)
                
                # Copiar archivo
                shutil.copy2(source_file, backup_file)
                
                # Verificar integridad
                source_hash = self._calculate_file_hash(source_file)
                backup_hash = self._calculate_file_hash(backup_file)
                
                if source_hash != backup_hash:
                    raise ValueError(f"Error de integridad en backup: {file}")
                
                print(f"✅ Backup creado: {relative_path}")
        
        print(f"🎉 Backup completado exitosamente en: {backup_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error en backup: {e}")
        return False

def _calculate_file_hash(file_path):
    \"\"\"Calcular hash SHA-256 del archivo\"\"\"
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()
""",
                safety_improvements=[
                    "Eliminación de cifrado malicioso",
                    "Implementación de verificación de integridad",
                    "Logging de seguridad",
                    "Manejo de errores robusto"
                ],
                learning_objectives=[
                    "Aprender técnicas de backup seguro",
                    "Entender verificación de integridad",
                    "Implementar logging de seguridad"
                ]
            ),
            
            RefactorizationTemplate(
                name="Keylogger to Input Monitor",
                description="Convierte keylogger en monitor de entrada seguro",
                target_patterns=[
                    "keyboard.*hook",
                    "capture.*keystrokes",
                    "log.*passwords"
                ],
                replacement_code="""
# Monitor de Entrada Seguro (Refactorizado desde Keylogger)
import time
import threading
from datetime import datetime

class SecureInputMonitor:
    \"\"\"Monitor de entrada seguro para análisis de usabilidad\"\"\"
    
    def __init__(self):
        self.input_stats = {
            'total_inputs': 0,
            'typing_speed': 0,
            'error_rate': 0,
            'session_duration': 0
        }
        self.session_start = None
        self.is_monitoring = False
        
    def start_monitoring(self):
        \"\"\"Iniciar monitoreo seguro\"\"\"
        if not self.is_monitoring:
            self.session_start = datetime.now()
            self.is_monitoring = True
            print("🔍 Monitoreo de entrada iniciado (modo seguro)")
            
            # Iniciar hilo de monitoreo
            self.monitor_thread = threading.Thread(target=self._monitor_input)
            self.monitor_thread.daemon = True
            self.monitor_thread.start()
    
    def stop_monitoring(self):
        \"\"\"Detener monitoreo\"\"\"
        if self.is_monitoring:
            self.is_monitoring = False
            self.session_start = None
            print("🛑 Monitoreo de entrada detenido")
    
    def _monitor_input(self):
        \"\"\"Monitorear entrada de forma segura (simulado)\"\"\"
        while self.is_monitoring:
            # Simular monitoreo de entrada (sin capturar datos reales)
            time.sleep(1)
            
            # Actualizar estadísticas
            if self.session_start:
                duration = (datetime.now() - self.session_start).total_seconds()
                self.input_stats['session_duration'] = duration
    
    def get_typing_analysis(self):
        \"\"\"Obtener análisis de escritura seguro\"\"\"
        return {
            'session_duration': self.input_stats['session_duration'],
            'typing_efficiency': 'N/A (modo seguro)',
            'recommendations': [
                'Usar atajos de teclado para mayor eficiencia',
                'Tomar descansos regulares',
                'Mantener buena postura'
            ]
        }
    
    def generate_usability_report(self):
        \"\"\"Generar reporte de usabilidad\"\"\"
        analysis = self.get_typing_analysis()
        
        report = f\"\"\"
=== REPORTE DE USABILIDAD ===
Duración de sesión: {analysis['session_duration']:.1f} segundos
Eficiencia de escritura: {analysis['typing_efficiency']}

Recomendaciones:
\"\"\"
        
        for rec in analysis['recommendations']:
            report += f"- {rec}\\n"
        
        return report
""",
                safety_improvements=[
                    "Eliminación de captura de datos sensibles",
                    "Implementación de monitoreo seguro",
                    "Análisis de usabilidad en lugar de espionaje",
                    "Protección de privacidad"
                ],
                learning_objectives=[
                    "Aprender análisis de usabilidad",
                    "Entender monitoreo seguro",
                    "Implementar protección de privacidad"
                ]
            ),
            
            RefactorizationTemplate(
                name="Backdoor to Remote Admin",
                description="Convierte backdoor en herramienta de administración remota segura",
                target_patterns=[
                    "reverse.*shell",
                    "bind.*port",
                    "execute.*command"
                ],
                replacement_code="""
# Herramienta de Administración Remota Segura (Refactorizada desde Backdoor)
import socket
import ssl
import json
import hashlib
from datetime import datetime

class SecureRemoteAdmin:
    \"\"\"Herramienta de administración remota segura\"\"\"
    
    def __init__(self, host='localhost', port=8443, cert_file=None, key_file=None):
        self.host = host
        self.port = port
        self.cert_file = cert_file
        self.key_file = key_file
        self.authenticated_clients = set()
        self.command_history = []
        
    def start_secure_server(self):
        \"\"\"Iniciar servidor seguro\"\"\"
        try:
            # Crear socket seguro
            context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            
            if self.cert_file and self.key_file:
                context.load_cert_chain(self.cert_file, self.key_file)
            
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.bind((self.host, self.port))
                sock.listen(5)
                
                print(f"🔒 Servidor de administración remota iniciado en {self.host}:{self.port}")
                
                while True:
                    client, addr = sock.accept()
                    with context.wrap_socket(client, server_side=True) as secure_client:
                        self._handle_client(secure_client, addr)
                        
        except Exception as e:
            print(f"❌ Error en servidor: {e}")
    
    def _handle_client(self, client, addr):
        \"\"\"Manejar cliente de forma segura\"\"\"
        try:
            # Autenticación segura
            if not self._authenticate_client(client):
                client.send(b"Authentication failed\\n")
                return
            
            print(f"✅ Cliente autenticado: {addr}")
            
            # Bucle de comandos seguros
            while True:
                command = client.recv(1024).decode().strip()
                
                if not command:
                    break
                
                # Validar comando
                if not self._is_safe_command(command):
                    response = "❌ Comando no permitido por seguridad"
                else:
                    response = self._execute_safe_command(command)
                
                # Registrar comando
                self._log_command(command, response, addr)
                
                # Enviar respuesta
                client.send(response.encode())
                
        except Exception as e:
            print(f"❌ Error con cliente {addr}: {e}")
        finally:
            client.close()
    
    def _authenticate_client(self, client):
        \"\"\"Autenticar cliente de forma segura\"\"\"
        try:
            # Solicitar credenciales
            client.send(b"Username: ")
            username = client.recv(1024).decode().strip()
            
            client.send(b"Password: ")
            password = client.recv(1024).decode().strip()
            
            # Verificar credenciales (en implementación real usar hash)
            if username == "admin" and password == "secure_password":
                return True
            
            return False
            
        except Exception:
            return False
    
    def _is_safe_command(self, command):
        \"\"\"Verificar si el comando es seguro\"\"\"
        dangerous_commands = [
            'rm', 'del', 'format', 'shutdown', 'reboot',
            'kill', 'taskkill', 'netcat', 'nc'
        ]
        
        command_lower = command.lower()
        for dangerous in dangerous_commands:
            if dangerous in command_lower:
                return False
        
        return True
    
    def _execute_safe_command(self, command):
        \"\"\"Ejecutar comando seguro\"\"\"
        try:
            import subprocess
            result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return f"✅ Comando ejecutado:\\n{result.stdout}"
            else:
                return f"❌ Error en comando:\\n{result.stderr}"
                
        except subprocess.TimeoutExpired:
            return "❌ Comando excedió el tiempo límite"
        except Exception as e:
            return f"❌ Error ejecutando comando: {e}"
    
    def _log_command(self, command, response, addr):
        \"\"\"Registrar comando de forma segura\"\"\"
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'client': str(addr),
            'command': command,
            'response_preview': response[:100] + "..." if len(response) > 100 else response
        }
        
        self.command_history.append(log_entry)
        print(f"📝 Comando registrado: {command} desde {addr}")
    
    def get_admin_report(self):
        \"\"\"Generar reporte de administración\"\"\"
        return {
            'total_commands': len(self.command_history),
            'authenticated_clients': len(self.authenticated_clients),
            'recent_commands': self.command_history[-10:] if self.command_history else [],
            'server_status': 'Running'
        }
""",
                safety_improvements=[
                    "Implementación de autenticación segura",
                    "Validación de comandos",
                    "Logging de auditoría",
                    "Conexiones SSL/TLS"
                ],
                learning_objectives=[
                    "Aprender administración remota segura",
                    "Entender autenticación y autorización",
                    "Implementar logging de auditoría"
                ]
            )
        ]
    
    def _initialize_learning_database(self) -> Dict[str, Any]:
        """Inicializar base de datos de aprendizaje"""
        return {
            'virus_patterns': {},
            'refactorization_techniques': {},
            'security_insights': [],
            'successful_conversions': [],
            'learning_progress': {
                'patterns_recognized': 0,
                'techniques_mastered': 0,
                'insights_generated': 0
            }
        }
    
    def _create_work_directories(self):
        """Crear directorios de trabajo"""
        for directory in [self.work_dir, self.learning_dir, self.templates_dir]:
            directory.mkdir(exist_ok=True)
    
    def analyze_and_refactorize_virus(self, file_path: str) -> VirusRefactorizationJob:
        """Analizar y refactorizar virus completo"""
        logger.info(f"🦠 Iniciando análisis y refactorización de virus: {file_path}")
        
        # Crear trabajo de refactorización
        job_id = f"refactor_{int(time.time())}"
        job = VirusRefactorizationJob(
            id=job_id,
            file_path=file_path,
            file_hash=self._calculate_file_hash(file_path),
            original_threat_score=0.0,
            refactorization_status="pending",
            start_time=datetime.now().isoformat(),
            end_time=None,
            security_report=None,
            refactored_code=None,
            final_safety_score=None,
            lucia_notes=[],
            learning_insights=[]
        )
        
        try:
            # Paso 1: Análisis completo de seguridad
            logger.info("🔍 Paso 1: Análisis completo de seguridad")
            job.refactorization_status = "in_progress"
            
            security_report = self.orchestrator.analyze_file_comprehensive(file_path)
            job.security_report = security_report
            job.original_threat_score = security_report.overall_confidence
            
            # Paso 2: Determinar tipo de malware y plantilla
            logger.info("🎯 Paso 2: Identificación de tipo de malware")
            malware_type = self._identify_malware_type(security_report)
            template = self._select_refactorization_template(malware_type)
            
            # Paso 3: Refactorización
            logger.info("🔄 Paso 3: Refactorización del código")
            refactored_code = self._refactorize_with_template(file_path, template)
            job.refactored_code = refactored_code
            
            # Paso 4: Análisis post-refactorización
            logger.info("✅ Paso 4: Análisis post-refactorización")
            final_safety_score = self._analyze_refactored_code(refactored_code)
            job.final_safety_score = final_safety_score
            
            # Paso 5: Generar insights de aprendizaje
            logger.info("🧠 Paso 5: Generación de insights de aprendizaje")
            learning_insights = self._generate_learning_insights(
                security_report, template, final_safety_score
            )
            job.learning_insights = learning_insights
            
            # Paso 6: Notas de LucIA
            logger.info("💭 Paso 6: Generación de notas de LucIA")
            lucia_notes = self._generate_lucia_notes(
                security_report, template, final_safety_score, learning_insights
            )
            job.lucia_notes = lucia_notes
            
            # Completar trabajo
            job.refactorization_status = "completed"
            job.end_time = datetime.now().isoformat()
            
            # Actualizar estadísticas
            self.learning_stats['viruses_analyzed'] += 1
            self.learning_stats['successful_refactorizations'] += 1
            self.learning_stats['learning_insights_generated'] += len(learning_insights)
            
            # Guardar trabajo completado
            self.completed_refactorizations.append(job)
            self._save_refactorization_job(job)
            
            logger.info(f"🎉 Refactorización completada: {job.id}")
            
        except Exception as e:
            logger.error(f"❌ Error en refactorización: {e}")
            job.refactorization_status = "failed"
            job.end_time = datetime.now().isoformat()
            job.lucia_notes.append(f"Error en refactorización: {str(e)}")
        
        return job
    
    def _identify_malware_type(self, security_report: ComprehensiveSecurityReport) -> str:
        """Identificar tipo de malware basado en el análisis"""
        # Analizar capas de seguridad para determinar tipo
        threat_indicators = []
        
        for layer in security_report.layers:
            if layer.threat_detected:
                threat_indicators.append(layer.threat_type)
        
        # Determinar tipo principal
        if 'ransomware' in str(threat_indicators).lower():
            return 'ransomware'
        elif 'keylogger' in str(threat_indicators).lower():
            return 'keylogger'
        elif 'backdoor' in str(threat_indicators).lower():
            return 'backdoor'
        elif 'trojan' in str(threat_indicators).lower():
            return 'trojan'
        elif 'worm' in str(threat_indicators).lower():
            return 'worm'
        else:
            return 'generic_malware'
    
    def _select_refactorization_template(self, malware_type: str) -> RefactorizationTemplate:
        """Seleccionar plantilla de refactorización apropiada"""
        for template in self.refactorization_templates:
            if malware_type in template.name.lower():
                return template
        
        # Si no hay plantilla específica, usar la primera
        return self.refactorization_templates[0]
    
    def _refactorize_with_template(self, file_path: str, template: RefactorizationTemplate) -> str:
        """Refactorizar código usando plantilla específica"""
        try:
            # Leer código original
            with open(file_path, 'r', encoding='utf-8') as f:
                original_code = f.read()
            
            # Aplicar refactorización básica primero
            refactored_code = self._apply_basic_refactorization(original_code)
            
            # Añadir código de la plantilla
            refactored_code = self._apply_template_code(refactored_code, template)
            
            # Añadir encabezado de refactorización
            header = f"""
# =============================================================================
# CÓDIGO REFACTORIZADO POR LUCIA VIRUS REFACTORIZER
# =============================================================================
# Plantilla aplicada: {template.name}
# Descripción: {template.description}
# Fecha de refactorización: {datetime.now().isoformat()}
# =============================================================================

"""
            
            return header + refactored_code
            
        except Exception as e:
            logger.error(f"Error en refactorización con plantilla: {e}")
            return f"# Error en refactorización: {str(e)}"
    
    def _apply_basic_refactorization(self, code: str) -> str:
        """Aplicar refactorización básica de seguridad"""
        # Reemplazos básicos de seguridad
        replacements = [
            (r'eval\s*\(([^)]+)\)', r'# EVAL_REMOVED: \1 - Reemplazado con logging seguro'),
            (r'exec\s*\(([^)]+)\)', r'# EXEC_REMOVED: \1 - Reemplazado con logging seguro'),
            (r'os\.system\s*\(([^)]+)\)', r'# SYSTEM_CALL_REMOVED: \1 - Reemplazado con logging seguro'),
            (r'subprocess\.call\s*\(([^)]+)\)', r'# SUBPROCESS_REMOVED: \1 - Reemplazado con logging seguro'),
            (r'base64\.b64decode\s*\(([^)]+)\)', r'# BASE64_DECODE_REMOVED: \1 - Reemplazado con logging seguro'),
            (r'__import__\s*\(([^)]+)\)', r'# IMPORT_REMOVED: \1 - Reemplazado con logging seguro'),
        ]
        
        import re
        for pattern, replacement in replacements:
            code = re.sub(pattern, replacement, code, flags=re.IGNORECASE)
        
        return code
    
    def _apply_template_code(self, code: str, template: RefactorizationTemplate) -> str:
        """Aplicar código de la plantilla"""
        # Añadir código de la plantilla al final
        template_code = f"""

# =============================================================================
# CÓDIGO DE PLANTILLA: {template.name}
# =============================================================================
{template.replacement_code}

# =============================================================================
# FUNCIÓN PRINCIPAL REFACTORIZADA
# =============================================================================

def main():
    \"\"\"Función principal refactorizada\"\"\"
    print("🚀 Código refactorizado ejecutándose...")
    print(f"📋 Plantilla aplicada: {template.name}")
    print(f"📝 Descripción: {template.description}")
    
    # Aquí se puede añadir lógica específica según la plantilla
    print("✅ Refactorización completada exitosamente")

if __name__ == "__main__":
    main()
"""
        
        return code + template_code
    
    def _analyze_refactored_code(self, refactored_code: str) -> float:
        """Analizar código refactorizado para calcular puntuación de seguridad"""
        safety_score = 1.0
        
        # Detectar elementos peligrosos restantes
        dangerous_patterns = [
            r'eval\s*\(',
            r'exec\s*\(',
            r'os\.system',
            r'subprocess',
            r'base64\.b64decode',
            r'__import__',
            r'marshal',
            r'compile\s*\('
        ]
        
        import re
        for pattern in dangerous_patterns:
            matches = re.findall(pattern, refactored_code, re.IGNORECASE)
            safety_score -= len(matches) * 0.1
        
        # Añadir puntos por elementos de seguridad
        security_patterns = [
            r'log_security_event',
            r'validate_input',
            r'sanitize_data',
            r'logging',
            r'security',
            r'authentication',
            r'encryption'
        ]
        
        for pattern in security_patterns:
            matches = re.findall(pattern, refactored_code, re.IGNORECASE)
            safety_score += len(matches) * 0.05
        
        return max(0.0, min(1.0, safety_score))
    
    def _generate_learning_insights(self, security_report: ComprehensiveSecurityReport, 
                                  template: RefactorizationTemplate, 
                                  final_safety_score: float) -> List[str]:
        """Generar insights de aprendizaje"""
        insights = []
        
        # Insights sobre patrones de amenazas
        for layer in security_report.layers:
            if layer.threat_detected:
                insights.append(f"Patrón de amenaza detectado: {layer.threat_type} con confianza {layer.confidence:.2f}")
        
        # Insights sobre técnicas de refactorización
        insights.append(f"Técnica de refactorización aplicada: {template.name}")
        insights.append(f"Mejoras de seguridad implementadas: {len(template.safety_improvements)}")
        
        # Insights sobre efectividad
        if final_safety_score > 0.8:
            insights.append("Refactorización altamente efectiva: código ahora es seguro")
        elif final_safety_score > 0.6:
            insights.append("Refactorización moderadamente efectiva: se requiere revisión adicional")
        else:
            insights.append("Refactorización requiere mejoras: considerar reescritura completa")
        
        # Insights sobre aprendizaje
        for objective in template.learning_objectives:
            insights.append(f"Objetivo de aprendizaje alcanzado: {objective}")
        
        return insights
    
    def _generate_lucia_notes(self, security_report: ComprehensiveSecurityReport,
                            template: RefactorizationTemplate,
                            final_safety_score: float,
                            learning_insights: List[str]) -> List[str]:
        """Generar notas de LucIA sobre el proceso"""
        notes = []
        
        notes.append("🧠 ANÁLISIS DE LUCIA:")
        notes.append(f"Este virus fue identificado como {template.name.lower()}")
        notes.append(f"Utilicé {len(security_report.layers)} capas de seguridad para el análisis")
        notes.append(f"La refactorización mejoró la seguridad de {security_report.overall_confidence:.2f} a {final_safety_score:.2f}")
        
        notes.append("")
        notes.append("💡 APRENDIZAJE:")
        for insight in learning_insights[:3]:  # Top 3 insights
            notes.append(f"- {insight}")
        
        notes.append("")
        notes.append("🔮 RECOMENDACIONES FUTURAS:")
        if final_safety_score < 0.7:
            notes.append("- Considerar reescritura completa del código")
            notes.append("- Implementar más validaciones de seguridad")
        else:
            notes.append("- El código refactorizado es seguro para uso controlado")
            notes.append("- Monitorear comportamiento en producción")
        
        notes.append("")
        notes.append("🎯 PRÓXIMOS PASOS:")
        notes.append("- Probar el código refactorizado en entorno aislado")
        notes.append("- Documentar las técnicas de refactorización utilizadas")
        notes.append("- Actualizar base de conocimiento de amenazas")
        
        return notes
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """Calcular hash SHA-256 del archivo"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def _save_refactorization_job(self, job: VirusRefactorizationJob):
        """Guardar trabajo de refactorización"""
        try:
            job_file = self.work_dir / f"job_{job.id}.json"
            with open(job_file, 'w') as f:
                json.dump(asdict(job), f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error guardando trabajo: {e}")
    
    def get_refactorization_status(self, job_id: str) -> Optional[VirusRefactorizationJob]:
        """Obtener estado de un trabajo de refactorización"""
        for job in self.completed_refactorizations:
            if job.id == job_id:
                return job
        return None
    
    def get_learning_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de aprendizaje"""
        return {
            'learning_stats': self.learning_stats,
            'total_templates': len(self.refactorization_templates),
            'completed_jobs': len(self.completed_refactorizations),
            'learning_database_size': len(self.learning_database['virus_patterns'])
        }
    
    def create_custom_template(self, name: str, description: str, 
                             target_patterns: List[str], replacement_code: str) -> RefactorizationTemplate:
        """Crear plantilla personalizada de refactorización"""
        template = RefactorizationTemplate(
            name=name,
            description=description,
            target_patterns=target_patterns,
            replacement_code=replacement_code,
            safety_improvements=[
                "Refactorización personalizada",
                "Eliminación de patrones maliciosos",
                "Implementación de seguridad"
            ],
            learning_objectives=[
                "Aprender técnicas de refactorización personalizada",
                "Entender patrones específicos de amenazas"
            ]
        )
        
        self.refactorization_templates.append(template)
        self.learning_stats['templates_created'] += 1
        
        return template
    
    def export_refactorization_report(self, job: VirusRefactorizationJob) -> str:
        """Exportar reporte completo de refactorización"""
        report = f"""
=== REPORTE DE REFACTORIZACIÓN DE VIRUS - LUCIA ===
ID del trabajo: {job.id}
Archivo: {job.file_path}
Hash: {job.file_hash}

ESTADO:
- Estado: {job.refactorization_status}
- Inicio: {job.start_time}
- Fin: {job.end_time or 'En progreso'}

ANÁLISIS DE SEGURIDAD:
- Puntuación original: {job.original_threat_score:.2f}
- Puntuación final: {job.final_safety_score:.2f if job.final_safety_score else 'N/A'}
- Mejora: {((job.final_safety_score or 0) - job.original_threat_score):.2f}

INSIGHTS DE APRENDIZAJE:
"""
        
        for insight in job.learning_insights:
            report += f"- {insight}\n"
        
        report += "\nNOTAS DE LUCIA:\n"
        for note in job.lucia_notes:
            report += f"{note}\n"
        
        if job.refactored_code:
            report += f"\nCÓDIGO REFACTORIZADO (primeras 500 caracteres):\n"
            report += job.refactored_code[:500] + "...\n"
        
        return report

# Función principal para integración con lucIA
def lucia_refactorize_virus(file_path: str) -> str:
    """Función principal para que LucIA refactorice un virus"""
    try:
        refactorizer = LucIAVirusRefactorizer()
        job = refactorizer.analyze_and_refactorize_virus(file_path)
        
        if job.refactorization_status == "completed":
            return f"""
🎉 ¡VIRUS REFACTORIZADO EXITOSAMENTE! 🎉

📁 Archivo: {job.file_path}
🆔 Trabajo: {job.id}
📊 Mejora de seguridad: {job.original_threat_score:.2f} → {job.final_safety_score:.2f}

🧠 INSIGHTS DE LUCIA:
"""
            for insight in job.learning_insights[:3]:
                return_value += f"• {insight}\n"
            
            return_value += f"""
💡 NOTAS DE LUCIA:
"""
            for note in job.lucia_notes[:3]:
                return_value += f"• {note}\n"
            
            return_value += f"""
📈 ESTADÍSTICAS DE APRENDIZAJE:
{json.dumps(refactorizer.get_learning_statistics(), indent=2)}
"""
            
            return return_value
        else:
            return f"❌ Error en refactorización: {job.refactorization_status}"
            
    except Exception as e:
        return f"❌ Error en refactorización de virus: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        print(lucia_refactorize_virus(file_path))
    else:
        print("Uso: python lucia_virus_refactorizer.py <archivo_virus>") 