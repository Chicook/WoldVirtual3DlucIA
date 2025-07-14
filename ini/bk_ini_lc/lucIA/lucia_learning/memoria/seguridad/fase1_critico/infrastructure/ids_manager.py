#!/usr/bin/env python3
"""
ids_manager.py
Gestor de IDS/IPS (Intrusion Detection/Prevention System) para lucIA
Sistema de detección y prevención de intrusiones en tiempo real
"""

import os
import sys
import json
import time
import threading
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import ipaddress
import re
import hashlib
import sqlite3
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SecurityEvent:
    """Evento de seguridad detectado"""
    id: str
    timestamp: datetime
    source_ip: str
    dest_ip: str
    event_type: str
    severity: int  # 1-10
    description: str
    payload: Optional[str] = None
    signature_id: Optional[str] = None
    action_taken: str = "detected"
    confidence: float = 0.0

@dataclass
class IDSRule:
    """Regla de IDS/IPS"""
    id: str
    name: str
    description: str
    pattern: str
    severity: int
    action: str  # "alert", "block", "drop"
    enabled: bool = True
    threshold: int = 1
    time_window: int = 60  # segundos

class IDSManager:
    """Gestor principal de IDS/IPS"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.rules: Dict[str, IDSRule] = {}
        self.events: List[SecurityEvent] = []
        self.blocked_ips: set = set()
        self.whitelist_ips: set = set()
        self.event_counters: Dict[str, int] = defaultdict(int)
        self.last_cleanup = datetime.now()
        self.running = False
        self.db_path = "ids_events.db"
        
        # Inicializar base de datos
        self._init_database()
        
        # Cargar reglas por defecto
        self._load_default_rules()
        
        # Inicializar contadores de eventos
        self.event_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        
        logger.info("IDS Manager inicializado")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Cargar configuración del IDS"""
        default_config = {
            'mode': 'detection',  # 'detection', 'prevention', 'hybrid'
            'alert_threshold': 5,
            'block_duration': 3600,  # 1 hora
            'max_events': 10000,
            'cleanup_interval': 3600,  # 1 hora
            'log_level': 'INFO',
            'enable_machine_learning': True,
            'enable_behavioral_analysis': True,
            'enable_signature_based': True,
            'enable_anomaly_detection': True,
            'monitoring_interfaces': ['eth0', 'lo'],
            'excluded_ips': ['127.0.0.1', '::1'],
            'high_risk_ports': [22, 23, 3389, 1433, 3306, 5432],
            'suspicious_patterns': [
                r'sqlmap',
                r'nmap',
                r'hydra',
                r'john',
                r'hashcat',
                r'aircrack',
                r'wireshark',
                r'burpsuite'
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
    
    def _init_database(self):
        """Inicializar base de datos SQLite para eventos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Crear tabla de eventos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS security_events (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT,
                    source_ip TEXT,
                    dest_ip TEXT,
                    event_type TEXT,
                    severity INTEGER,
                    description TEXT,
                    payload TEXT,
                    signature_id TEXT,
                    action_taken TEXT,
                    confidence REAL
                )
            ''')
            
            # Crear tabla de reglas
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS ids_rules (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    pattern TEXT,
                    severity INTEGER,
                    action TEXT,
                    enabled INTEGER,
                    threshold INTEGER,
                    time_window INTEGER
                )
            ''')
            
            # Crear tabla de IPs bloqueadas
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS blocked_ips (
                    ip TEXT PRIMARY KEY,
                    timestamp TEXT,
                    reason TEXT,
                    duration INTEGER
                )
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
    
    def _load_default_rules(self):
        """Cargar reglas de detección por defecto"""
        default_rules = [
            IDSRule(
                id="SQL_INJECTION_001",
                name="SQL Injection Detection",
                description="Detecta intentos de inyección SQL",
                pattern=r"(union|select|insert|update|delete|drop|create|alter).*from|'.*or.*'|'.*and.*'",
                severity=9,
                action="block"
            ),
            IDSRule(
                id="XSS_001",
                name="Cross-Site Scripting Detection",
                description="Detecta intentos de XSS",
                pattern=r"<script|javascript:|vbscript:|onload=|onerror=|onclick=",
                severity=8,
                action="block"
            ),
            IDSRule(
                id="PATH_TRAVERSAL_001",
                name="Path Traversal Detection",
                description="Detecta intentos de path traversal",
                pattern=r"\.\./|\.\.\\|%2e%2e%2f|%2e%2e%5c",
                severity=7,
                action="block"
            ),
            IDSRule(
                id="COMMAND_INJECTION_001",
                name="Command Injection Detection",
                description="Detecta intentos de inyección de comandos",
                pattern=r";\s*(ls|cat|rm|wget|curl|nc|telnet|ssh|ftp)|`.*`|\$\(.*\)",
                severity=9,
                action="block"
            ),
            IDSRule(
                id="BRUTE_FORCE_001",
                name="Brute Force Detection",
                description="Detecta ataques de fuerza bruta",
                pattern=r"login|auth|password",
                severity=6,
                action="alert",
                threshold=10,
                time_window=300
            ),
            IDSRule(
                id="DOS_001",
                name="Denial of Service Detection",
                description="Detecta intentos de DoS",
                pattern=r"",
                severity=8,
                action="block",
                threshold=100,
                time_window=60
            ),
            IDSRule(
                id="SCANNING_001",
                name="Port Scanning Detection",
                description="Detecta escaneo de puertos",
                pattern=r"",
                severity=5,
                action="alert",
                threshold=50,
                time_window=300
            )
        ]
        
        for rule in default_rules:
            self.add_rule(rule)
    
    def add_rule(self, rule: IDSRule) -> bool:
        """Añadir nueva regla de IDS"""
        try:
            self.rules[rule.id] = rule
            
            # Guardar en base de datos
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO ids_rules 
                (id, name, description, pattern, severity, action, enabled, threshold, time_window)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (rule.id, rule.name, rule.description, rule.pattern, rule.severity, 
                  rule.action, rule.enabled, rule.threshold, rule.time_window))
            conn.commit()
            conn.close()
            
            logger.info(f"Regla añadida: {rule.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo regla: {e}")
            return False
    
    def remove_rule(self, rule_id: str) -> bool:
        """Eliminar regla de IDS"""
        try:
            if rule_id in self.rules:
                del self.rules[rule_id]
                
                # Eliminar de base de datos
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute('DELETE FROM ids_rules WHERE id = ?', (rule_id,))
                conn.commit()
                conn.close()
                
                logger.info(f"Regla eliminada: {rule_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error eliminando regla: {e}")
            return False
    
    def analyze_packet(self, source_ip: str, dest_ip: str, payload: str, 
                      protocol: str = "HTTP", port: int = 80) -> Optional[SecurityEvent]:
        """Analizar paquete en busca de amenazas"""
        
        # Verificar IPs excluidas
        if source_ip in self.config['excluded_ips'] or source_ip in self.whitelist_ips:
            return None
        
        # Verificar si la IP está bloqueada
        if source_ip in self.blocked_ips:
            return SecurityEvent(
                id=f"blocked_{int(time.time())}",
                timestamp=datetime.now(),
                source_ip=source_ip,
                dest_ip=dest_ip,
                event_type="BLOCKED_IP",
                severity=1,
                description=f"Acceso bloqueado desde IP: {source_ip}",
                action_taken="blocked"
            )
        
        # Verificar puertos de alto riesgo
        if port in self.config['high_risk_ports']:
            event = SecurityEvent(
                id=f"high_risk_port_{int(time.time())}",
                timestamp=datetime.now(),
                source_ip=source_ip,
                dest_ip=dest_ip,
                event_type="HIGH_RISK_PORT",
                severity=4,
                description=f"Acceso a puerto de alto riesgo: {port}",
                payload=payload[:200] if payload else None
            )
            self._process_event(event)
        
        # Análisis basado en firmas
        for rule in self.rules.values():
            if not rule.enabled:
                continue
            
            if rule.pattern and re.search(rule.pattern, payload, re.IGNORECASE):
                event = SecurityEvent(
                    id=f"{rule.id}_{int(time.time())}",
                    timestamp=datetime.now(),
                    source_ip=source_ip,
                    dest_ip=dest_ip,
                    event_type=rule.name.upper().replace(" ", "_"),
                    severity=rule.severity,
                    description=f"Patrón detectado: {rule.description}",
                    payload=payload[:500] if payload else None,
                    signature_id=rule.id,
                    action_taken=rule.action,
                    confidence=0.9
                )
                
                # Verificar umbral
                if self._check_threshold(rule, source_ip):
                    self._process_event(event)
                    return event
        
        # Análisis de anomalías
        anomaly_event = self._detect_anomalies(source_ip, dest_ip, payload, protocol, port)
        if anomaly_event:
            self._process_event(anomaly_event)
            return anomaly_event
        
        return None
    
    def _check_threshold(self, rule: IDSRule, source_ip: str) -> bool:
        """Verificar si se ha alcanzado el umbral de la regla"""
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(seconds=rule.time_window)
        
        # Contar eventos recientes para esta IP y regla
        count = 0
        for event in self.events:
            if (event.source_ip == source_ip and 
                event.signature_id == rule.id and 
                event.timestamp > cutoff_time):
                count += 1
        
        return count >= rule.threshold
    
    def _detect_anomalies(self, source_ip: str, dest_ip: str, payload: str, 
                         protocol: str, port: int) -> Optional[SecurityEvent]:
        """Detectar anomalías basadas en comportamiento"""
        
        # Análisis de frecuencia de eventos
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(minutes=5)
        
        # Contar eventos recientes de esta IP
        recent_events = [e for e in self.events 
                        if e.source_ip == source_ip and e.timestamp > cutoff_time]
        
        if len(recent_events) > 50:  # Muchos eventos en poco tiempo
            return SecurityEvent(
                id=f"anomaly_frequency_{int(time.time())}",
                timestamp=current_time,
                source_ip=source_ip,
                dest_ip=dest_ip,
                event_type="FREQUENCY_ANOMALY",
                severity=6,
                description=f"Actividad anómala: {len(recent_events)} eventos en 5 minutos",
                confidence=0.7
            )
        
        # Análisis de patrones de payload
        if payload and len(payload) > 10000:  # Payload muy grande
            return SecurityEvent(
                id=f"anomaly_payload_size_{int(time.time())}",
                timestamp=current_time,
                source_ip=source_ip,
                dest_ip=dest_ip,
                event_type="PAYLOAD_SIZE_ANOMALY",
                severity=5,
                description=f"Payload anómalo: {len(payload)} bytes",
                payload=payload[:200],
                confidence=0.6
            )
        
        # Análisis de patrones de acceso
        if self._is_scanning_behavior(source_ip):
            return SecurityEvent(
                id=f"scanning_behavior_{int(time.time())}",
                timestamp=current_time,
                source_ip=source_ip,
                dest_ip=dest_ip,
                event_type="SCANNING_BEHAVIOR",
                severity=7,
                description="Comportamiento de escaneo detectado",
                confidence=0.8
            )
        
        return None
    
    def _is_scanning_behavior(self, source_ip: str) -> bool:
        """Detectar comportamiento de escaneo"""
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(minutes=10)
        
        # Contar puertos únicos accedidos
        unique_ports = set()
        for event in self.events:
            if (event.source_ip == source_ip and 
                event.timestamp > cutoff_time):
                # Extraer puerto del payload o usar puerto por defecto
                unique_ports.add(80)  # Simplificado
        
        return len(unique_ports) > 20  # Más de 20 puertos únicos en 10 minutos
    
    def _process_event(self, event: SecurityEvent):
        """Procesar evento de seguridad"""
        self.events.append(event)
        
        # Mantener límite de eventos
        if len(self.events) > self.config['max_events']:
            self.events = self.events[-self.config['max_events']:]
        
        # Actualizar contadores
        self.event_counters[event.event_type] += 1
        
        # Guardar en base de datos
        self._save_event_to_db(event)
        
        # Tomar acción según configuración
        if event.action_taken == "block" and self.config['mode'] in ['prevention', 'hybrid']:
            self.block_ip(event.source_ip, f"Regla: {event.event_type}")
        
        # Log del evento
        logger.warning(f"Evento de seguridad: {event.event_type} - {event.description} - IP: {event.source_ip}")
    
    def _save_event_to_db(self, event: SecurityEvent):
        """Guardar evento en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO security_events 
                (id, timestamp, source_ip, dest_ip, event_type, severity, description, 
                 payload, signature_id, action_taken, confidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (event.id, event.timestamp.isoformat(), event.source_ip, event.dest_ip,
                  event.event_type, event.severity, event.description, event.payload,
                  event.signature_id, event.action_taken, event.confidence))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando evento en DB: {e}")
    
    def block_ip(self, ip: str, reason: str, duration: int = None):
        """Bloquear IP"""
        if duration is None:
            duration = self.config['block_duration']
        
        self.blocked_ips.add(ip)
        
        # Guardar en base de datos
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO blocked_ips (ip, timestamp, reason, duration)
                VALUES (?, ?, ?, ?)
            ''', (ip, datetime.now().isoformat(), reason, duration))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando IP bloqueada: {e}")
        
        logger.warning(f"IP bloqueada: {ip} - Razón: {reason}")
    
    def unblock_ip(self, ip: str) -> bool:
        """Desbloquear IP"""
        if ip in self.blocked_ips:
            self.blocked_ips.remove(ip)
            
            # Eliminar de base de datos
            try:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute('DELETE FROM blocked_ips WHERE ip = ?', (ip,))
                conn.commit()
                conn.close()
            except Exception as e:
                logger.error(f"Error eliminando IP bloqueada: {e}")
            
            logger.info(f"IP desbloqueada: {ip}")
            return True
        return False
    
    def add_to_whitelist(self, ip: str):
        """Añadir IP a lista blanca"""
        self.whitelist_ips.add(ip)
        logger.info(f"IP añadida a whitelist: {ip}")
    
    def remove_from_whitelist(self, ip: str):
        """Eliminar IP de lista blanca"""
        if ip in self.whitelist_ips:
            self.whitelist_ips.remove(ip)
            logger.info(f"IP eliminada de whitelist: {ip}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas del IDS"""
        current_time = datetime.now()
        last_hour = current_time - timedelta(hours=1)
        last_day = current_time - timedelta(days=1)
        
        # Eventos por período
        events_last_hour = [e for e in self.events if e.timestamp > last_hour]
        events_last_day = [e for e in self.events if e.timestamp > last_day]
        
        # Eventos por severidad
        severity_counts = defaultdict(int)
        for event in self.events:
            severity_counts[event.severity] += 1
        
        return {
            'total_events': len(self.events),
            'events_last_hour': len(events_last_hour),
            'events_last_day': len(events_last_day),
            'blocked_ips': len(self.blocked_ips),
            'whitelisted_ips': len(self.whitelist_ips),
            'active_rules': len([r for r in self.rules.values() if r.enabled]),
            'severity_distribution': dict(severity_counts),
            'top_event_types': dict(sorted(self.event_counters.items(), 
                                          key=lambda x: x[1], reverse=True)[:10])
        }
    
    def cleanup_old_data(self):
        """Limpiar datos antiguos"""
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(days=7)
        
        # Limpiar eventos antiguos
        self.events = [e for e in self.events if e.timestamp > cutoff_time]
        
        # Limpiar IPs bloqueadas expiradas
        expired_ips = set()
        for ip in self.blocked_ips:
            # Verificar si ha expirado (simplificado)
            expired_ips.add(ip)
        
        for ip in expired_ips:
            self.unblock_ip(ip)
        
        self.last_cleanup = current_time
        logger.info("Limpieza de datos completada")
    
    def start_monitoring(self):
        """Iniciar monitoreo"""
        self.running = True
        logger.info("Monitoreo IDS iniciado")
        
        # Iniciar hilo de limpieza
        cleanup_thread = threading.Thread(target=self._cleanup_loop)
        cleanup_thread.daemon = True
        cleanup_thread.start()
    
    def stop_monitoring(self):
        """Detener monitoreo"""
        self.running = False
        logger.info("Monitoreo IDS detenido")
    
    def _cleanup_loop(self):
        """Bucle de limpieza automática"""
        while self.running:
            time.sleep(self.config['cleanup_interval'])
            self.cleanup_old_data()

# Función principal para integración con lucIA
def run_ids_analysis(target_data: str = None) -> str:
    """Función principal para integración con lucIA"""
    try:
        ids_manager = IDSManager()
        ids_manager.start_monitoring()
        
        if target_data:
            # Simular análisis de datos
            event = ids_manager.analyze_packet(
                source_ip="192.168.1.100",
                dest_ip="10.0.0.1",
                payload=target_data
            )
            
            if event:
                return f"Intrusión detectada: {event.event_type} - Severidad: {event.severity}"
            else:
                return "Análisis completado: No se detectaron amenazas"
        else:
            stats = ids_manager.get_statistics()
            return f"IDS activo. Eventos totales: {stats['total_events']}, IPs bloqueadas: {stats['blocked_ips']}"
    
    except Exception as e:
        return f"Error en análisis IDS: {e}"

if __name__ == "__main__":
    # Ejemplo de uso
    result = run_ids_analysis()
    print(result) 