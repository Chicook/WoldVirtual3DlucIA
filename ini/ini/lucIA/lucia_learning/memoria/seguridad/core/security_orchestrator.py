#!/usr/bin/env python3
"""
security_orchestrator.py
Orquestador de seguridad para lucIA
Coordina todos los módulos de seguridad y proporciona interfaz unificada
"""

import os
import sys
import json
import time
import subprocess
import threading
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security_orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class SecurityAlert:
    """Estructura para alertas de seguridad"""
    id: str
    timestamp: str
    severity: int  # 1-10
    category: str
    source: str
    description: str
    evidence: List[str]
    confidence: float
    status: str = "active"

@dataclass
class SecurityReport:
    """Reporte completo de seguridad"""
    timestamp: str
    total_alerts: int
    critical_alerts: int
    high_alerts: int
    medium_alerts: int
    low_alerts: int
    modules_status: Dict[str, str]
    recommendations: List[str]
    threat_score: float

class SecurityOrchestrator:
    """Orquestador principal de seguridad para lucIA"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.alerts: List[SecurityAlert] = []
        self.modules_status: Dict[str, str] = {}
        self.running = False
        self.alert_lock = threading.Lock()
        
        # Inicializar módulos
        self.modules = {
            'virus_scanner': self._init_virus_scanner(),
            'network_analyzer': self._init_network_analyzer(),
            'behavior_analyzer': self._init_behavior_analyzer(),
            'malware_analyzer': self._init_malware_analyzer()
        }
        
        logger.info("Orquestador de seguridad inicializado")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Cargar configuración de seguridad"""
        default_config = {
            'scan_interval': 300,  # 5 minutos
            'alert_threshold': 7,  # Severidad mínima para alertas
            'max_alerts': 1000,
            'modules': {
                'virus_scanner': {'enabled': True, 'path': './virus_scanner.mojo'},
                'network_analyzer': {'enabled': True, 'path': './network_analyzer.rs'},
                'behavior_analyzer': {'enabled': True, 'path': './behavior_analyzer.go'},
                'malware_analyzer': {'enabled': True, 'path': './malware_analyzer.cpp'}
            },
            'monitored_paths': [
                './',
                './uploads/',
                './temp/',
                './logs/'
            ],
            'excluded_paths': [
                './node_modules/',
                './.git/',
                './venv/',
                './__pycache__/'
            ]
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
            except Exception as e:
                logger.error(f"Error cargando configuración: {e}")
        
        return default_config
    
    def _init_virus_scanner(self) -> Dict[str, Any]:
        """Inicializar módulo de escaneo de virus (Mojo)"""
        try:
            # Verificar si Mojo está disponible
            result = subprocess.run(['mojo', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return {
                    'status': 'ready',
                    'version': result.stdout.strip(),
                    'path': self.config['modules']['virus_scanner']['path']
                }
            else:
                return {'status': 'error', 'error': 'Mojo no disponible'}
        except FileNotFoundError:
            return {'status': 'error', 'error': 'Mojo no encontrado'}
    
    def _init_network_analyzer(self) -> Dict[str, Any]:
        """Inicializar módulo de análisis de red (Rust)"""
        try:
            # Verificar si Rust está disponible
            result = subprocess.run(['rustc', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return {
                    'status': 'ready',
                    'version': result.stdout.strip(),
                    'path': self.config['modules']['network_analyzer']['path']
                }
            else:
                return {'status': 'error', 'error': 'Rust no disponible'}
        except FileNotFoundError:
            return {'status': 'error', 'error': 'Rust no encontrado'}
    
    def _init_behavior_analyzer(self) -> Dict[str, Any]:
        """Inicializar módulo de análisis de comportamiento (Go)"""
        try:
            # Verificar si Go está disponible
            result = subprocess.run(['go', 'version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return {
                    'status': 'ready',
                    'version': result.stdout.strip(),
                    'path': self.config['modules']['behavior_analyzer']['path']
                }
            else:
                return {'status': 'error', 'error': 'Go no disponible'}
        except FileNotFoundError:
            return {'status': 'error', 'error': 'Go no encontrado'}
    
    def _init_malware_analyzer(self) -> Dict[str, Any]:
        """Inicializar módulo de análisis de malware (C++)"""
        try:
            # Verificar si g++ está disponible
            result = subprocess.run(['g++', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return {
                    'status': 'ready',
                    'version': result.stdout.strip(),
                    'path': self.config['modules']['malware_analyzer']['path']
                }
            else:
                return {'status': 'error', 'error': 'g++ no disponible'}
        except FileNotFoundError:
            return {'status': 'error', 'error': 'g++ no encontrado'}
    
    def add_alert(self, alert: SecurityAlert) -> None:
        """Añadir nueva alerta de seguridad"""
        with self.alert_lock:
            self.alerts.append(alert)
            
            # Mantener límite de alertas
            if len(self.alerts) > self.config['max_alerts']:
                self.alerts = self.alerts[-self.config['max_alerts']:]
            
            logger.warning(f"Nueva alerta: {alert.category} - {alert.description}")
    
    def scan_file(self, file_path: str) -> Dict[str, Any]:
        """Escanear archivo individual con todos los módulos disponibles"""
        results = {
            'file_path': file_path,
            'timestamp': datetime.now().isoformat(),
            'modules_results': {},
            'overall_threat_score': 0.0,
            'recommendations': []
        }
        
        # Escaneo con virus scanner (Mojo)
        if self.modules['virus_scanner']['status'] == 'ready':
            try:
                mojo_result = self._run_mojo_scan(file_path)
                results['modules_results']['virus_scanner'] = mojo_result
                if mojo_result.get('riesgo') == 'alto':
                    results['overall_threat_score'] += 30.0
                    results['recommendations'].append("Archivo marcado como de alto riesgo por virus scanner")
            except Exception as e:
                logger.error(f"Error en virus scanner: {e}")
        
        # Análisis de malware (C++)
        if self.modules['malware_analyzer']['status'] == 'ready':
            try:
                malware_result = self._run_malware_analysis(file_path)
                results['modules_results']['malware_analyzer'] = malware_result
                if malware_result.get('is_malicious', False):
                    results['overall_threat_score'] += 40.0
                    results['recommendations'].append("Malware detectado en archivo")
            except Exception as e:
                logger.error(f"Error en malware analyzer: {e}")
        
        # Normalizar puntuación
        results['overall_threat_score'] = min(results['overall_threat_score'], 100.0)
        
        # Crear alerta si es necesario
        if results['overall_threat_score'] > 50.0:
            alert = SecurityAlert(
                id=f"file_scan_{int(time.time())}",
                timestamp=results['timestamp'],
                severity=int(results['overall_threat_score'] / 10),
                category="FILE_SCAN",
                source="security_orchestrator",
                description=f"Archivo sospechoso detectado: {file_path}",
                evidence=results['recommendations'],
                confidence=results['overall_threat_score'] / 100.0
            )
            self.add_alert(alert)
        
        return results
    
    def _run_mojo_scan(self, file_path: str) -> Dict[str, Any]:
        """Ejecutar escaneo con Mojo"""
        try:
            # Crear script temporal para Mojo
            script_content = f'''
# Escaneo temporal
from virus_scanner import escanear_archivo
resultado = escanear_archivo("{file_path}")
print(resultado)
'''
            
            with open('temp_scan.mojo', 'w') as f:
                f.write(script_content)
            
            result = subprocess.run(['mojo', 'temp_scan.mojo'], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                # Parsear resultado (simplificado)
                return {'status': 'success', 'output': result.stdout}
            else:
                return {'status': 'error', 'error': result.stderr}
        
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
        finally:
            # Limpiar archivo temporal
            if os.path.exists('temp_scan.mojo'):
                os.remove('temp_scan.mojo')
    
    def _run_malware_analysis(self, file_path: str) -> Dict[str, Any]:
        """Ejecutar análisis de malware con C++"""
        try:
            # Compilar y ejecutar malware analyzer
            compile_result = subprocess.run([
                'g++', '-o', 'malware_analyzer', 
                self.modules['malware_analyzer']['path']
            ], capture_output=True, text=True)
            
            if compile_result.returncode == 0:
                result = subprocess.run(['./malware_analyzer', file_path], 
                                      capture_output=True, text=True, timeout=60)
                
                if result.returncode == 0:
                    return {'status': 'success', 'output': result.stdout}
                else:
                    return {'status': 'error', 'error': result.stderr}
            else:
                return {'status': 'error', 'error': compile_result.stderr}
        
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def scan_directory(self, directory_path: str) -> Dict[str, Any]:
        """Escanear directorio completo"""
        results = {
            'directory': directory_path,
            'timestamp': datetime.now().isoformat(),
            'files_scanned': 0,
            'threats_found': 0,
            'file_results': [],
            'summary': {}
        }
        
        try:
            for root, dirs, files in os.walk(directory_path):
                # Excluir directorios no deseados
                dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__']]
                
                for file in files:
                    file_path = os.path.join(root, file)
                    
                    # Verificar si el archivo debe ser escaneado
                    if self._should_scan_file(file_path):
                        file_result = self.scan_file(file_path)
                        results['file_results'].append(file_result)
                        results['files_scanned'] += 1
                        
                        if file_result['overall_threat_score'] > 50.0:
                            results['threats_found'] += 1
            
            # Generar resumen
            results['summary'] = {
                'total_files': results['files_scanned'],
                'threats_detected': results['threats_found'],
                'threat_percentage': (results['threats_found'] / max(results['files_scanned'], 1)) * 100
            }
            
        except Exception as e:
            logger.error(f"Error escaneando directorio {directory_path}: {e}")
            results['error'] = str(e)
        
        return results
    
    def _should_scan_file(self, file_path: str) -> bool:
        """Determinar si un archivo debe ser escaneado"""
        # Verificar exclusiones
        for excluded in self.config['excluded_paths']:
            if excluded in file_path:
                return False
        
        # Verificar extensiones de archivo
        extensions_to_scan = ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.exe', '.dll', '.so', '.dylib']
        file_ext = Path(file_path).suffix.lower()
        
        return file_ext in extensions_to_scan
    
    def get_security_report(self) -> SecurityReport:
        """Generar reporte completo de seguridad"""
        with self.alert_lock:
            critical_alerts = len([a for a in self.alerts if a.severity >= 9])
            high_alerts = len([a for a in self.alerts if 7 <= a.severity < 9])
            medium_alerts = len([a for a in self.alerts if 4 <= a.severity < 7])
            low_alerts = len([a for a in self.alerts if a.severity < 4])
            
            # Calcular puntuación de amenaza general
            if self.alerts:
                threat_score = sum(a.severity for a in self.alerts) / len(self.alerts)
            else:
                threat_score = 0.0
            
            # Generar recomendaciones
            recommendations = []
            if critical_alerts > 0:
                recommendations.append("Revisar inmediatamente las alertas críticas")
            if high_alerts > 5:
                recommendations.append("Implementar medidas de seguridad adicionales")
            if threat_score > 7.0:
                recommendations.append("Realizar auditoría completa del sistema")
            
            return SecurityReport(
                timestamp=datetime.now().isoformat(),
                total_alerts=len(self.alerts),
                critical_alerts=critical_alerts,
                high_alerts=high_alerts,
                medium_alerts=medium_alerts,
                low_alerts=low_alerts,
                modules_status={name: module['status'] for name, module in self.modules.items()},
                recommendations=recommendations,
                threat_score=threat_score
            )
    
    def start_monitoring(self) -> None:
        """Iniciar monitoreo continuo"""
        self.running = True
        logger.info("Iniciando monitoreo de seguridad continuo")
        
        # Iniciar hilo de monitoreo
        monitor_thread = threading.Thread(target=self._monitoring_loop)
        monitor_thread.daemon = True
        monitor_thread.start()
    
    def stop_monitoring(self) -> None:
        """Detener monitoreo continuo"""
        self.running = False
        logger.info("Deteniendo monitoreo de seguridad")
    
    def _monitoring_loop(self) -> None:
        """Bucle principal de monitoreo"""
        while self.running:
            try:
                # Escanear directorios monitoreados
                for path in self.config['monitored_paths']:
                    if os.path.exists(path):
                        self.scan_directory(path)
                
                # Esperar hasta el siguiente escaneo
                time.sleep(self.config['scan_interval'])
                
            except Exception as e:
                logger.error(f"Error en bucle de monitoreo: {e}")
                time.sleep(60)  # Esperar 1 minuto antes de reintentar
    
    def export_alerts(self, format: str = 'json') -> str:
        """Exportar alertas en formato especificado"""
        with self.alert_lock:
            if format == 'json':
                return json.dumps([asdict(alert) for alert in self.alerts], indent=2)
            elif format == 'csv':
                csv_lines = ['ID,Timestamp,Severity,Category,Description,Confidence']
                for alert in self.alerts:
                    csv_lines.append(f'{alert.id},{alert.timestamp},{alert.severity},{alert.category},"{alert.description}",{alert.confidence}')
                return '\n'.join(csv_lines)
            else:
                raise ValueError(f"Formato no soportado: {format}")

# Función principal para integración con lucIA
def run_security_analysis(target_path: str = None) -> str:
    """Función principal para integración con lucIA"""
    try:
        orchestrator = SecurityOrchestrator()
        
        if target_path:
            if os.path.isfile(target_path):
                result = orchestrator.scan_file(target_path)
                return f"Análisis completado: {result['overall_threat_score']:.1f}% de amenaza"
            elif os.path.isdir(target_path):
                result = orchestrator.scan_directory(target_path)
                return f"Directorio escaneado: {result['files_scanned']} archivos, {result['threats_found']} amenazas"
        else:
            # Escaneo por defecto
            result = orchestrator.scan_directory('.')
            return f"Escaneo por defecto: {result['files_scanned']} archivos, {result['threats_found']} amenazas"
    
    except Exception as e:
        return f"Error en análisis de seguridad: {e}"

if __name__ == "__main__":
    # Ejemplo de uso
    result = run_security_analysis()
    print(result) 