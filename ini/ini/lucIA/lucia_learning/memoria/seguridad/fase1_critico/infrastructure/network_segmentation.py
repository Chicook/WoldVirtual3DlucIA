#!/usr/bin/env python3
"""
network_segmentation.py
Gestor de segmentación de red para lucIA
Implementa microsegmentación y control de acceso a nivel de red
"""

import os
import sys
import json
import time
import threading
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict
import ipaddress
import subprocess
import sqlite3
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NetworkSegment:
    """Segmento de red"""
    id: str
    name: str
    description: str
    network_range: str
    vlan_id: Optional[int] = None
    security_level: int = 5  # 1-10
    allowed_protocols: List[str] = None
    allowed_ports: List[int] = None
    isolation_level: str = "partial"  # "full", "partial", "none"
    created_at: datetime = None
    updated_at: datetime = None

@dataclass
class AccessRule:
    """Regla de acceso entre segmentos"""
    id: str
    name: str
    source_segment: str
    dest_segment: str
    protocol: str
    port: int
    action: str  # "allow", "deny"
    priority: int = 100
    enabled: bool = True
    description: str = ""

@dataclass
class NetworkDevice:
    """Dispositivo de red"""
    id: str
    name: str
    ip_address: str
    mac_address: str
    segment_id: str
    device_type: str  # "server", "workstation", "iot", "network"
    security_level: int = 5
    last_seen: datetime = None
    status: str = "active"

class NetworkSegmentationManager:
    """Gestor de segmentación de red"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.segments: Dict[str, NetworkSegment] = {}
        self.access_rules: Dict[str, AccessRule] = {}
        self.devices: Dict[str, NetworkDevice] = {}
        self.active_connections: Dict[str, List[Tuple[str, str, int]]] = defaultdict(list)
        self.db_path = "network_segmentation.db"
        
        # Inicializar base de datos
        self._init_database()
        
        # Cargar configuración por defecto
        self._load_default_segments()
        self._load_default_rules()
        
        # Inicializar monitoreo
        self.running = False
        self.monitoring_thread = None
        
        logger.info("Network Segmentation Manager inicializado")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Cargar configuración de segmentación"""
        default_config = {
            'auto_segmentation': True,
            'dynamic_rules': True,
            'monitoring_interval': 30,  # segundos
            'max_segments': 100,
            'default_isolation': 'partial',
            'enable_microsegmentation': True,
            'enable_automated_response': True,
            'log_all_traffic': False,
            'default_security_level': 5,
            'allowed_protocols': ['HTTP', 'HTTPS', 'SSH', 'DNS', 'NTP'],
            'restricted_protocols': ['TELNET', 'FTP', 'SNMP'],
            'high_risk_ports': [22, 23, 3389, 1433, 3306, 5432],
            'monitoring_interfaces': ['eth0', 'eth1'],
            'backup_config_interval': 3600  # 1 hora
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
        """Inicializar base de datos SQLite"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Tabla de segmentos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS network_segments (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    network_range TEXT,
                    vlan_id INTEGER,
                    security_level INTEGER,
                    allowed_protocols TEXT,
                    allowed_ports TEXT,
                    isolation_level TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            ''')
            
            # Tabla de reglas de acceso
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS access_rules (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    source_segment TEXT,
                    dest_segment TEXT,
                    protocol TEXT,
                    port INTEGER,
                    action TEXT,
                    priority INTEGER,
                    enabled INTEGER,
                    description TEXT
                )
            ''')
            
            # Tabla de dispositivos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS network_devices (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    ip_address TEXT,
                    mac_address TEXT,
                    segment_id TEXT,
                    device_type TEXT,
                    security_level INTEGER,
                    last_seen TEXT,
                    status TEXT
                )
            ''')
            
            # Tabla de conexiones activas
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS active_connections (
                    id TEXT PRIMARY KEY,
                    source_device TEXT,
                    dest_device TEXT,
                    protocol TEXT,
                    port INTEGER,
                    timestamp TEXT,
                    status TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
    
    def _load_default_segments(self):
        """Cargar segmentos de red por defecto"""
        default_segments = [
            NetworkSegment(
                id="dmz",
                name="DMZ",
                description="Zona desmilitarizada para servicios públicos",
                network_range="10.0.1.0/24",
                vlan_id=100,
                security_level=3,
                allowed_protocols=["HTTP", "HTTPS", "DNS"],
                allowed_ports=[80, 443, 53],
                isolation_level="partial",
                created_at=datetime.now()
            ),
            NetworkSegment(
                id="internal",
                name="Red Interna",
                description="Red interna para usuarios y servicios",
                network_range="10.0.2.0/24",
                vlan_id=200,
                security_level=7,
                allowed_protocols=["HTTP", "HTTPS", "SSH", "DNS", "NTP"],
                allowed_ports=[80, 443, 22, 53, 123],
                isolation_level="partial",
                created_at=datetime.now()
            ),
            NetworkSegment(
                id="management",
                name="Red de Gestión",
                description="Red para gestión de dispositivos",
                network_range="10.0.3.0/24",
                vlan_id=300,
                security_level=9,
                allowed_protocols=["SSH", "HTTPS"],
                allowed_ports=[22, 443],
                isolation_level="full",
                created_at=datetime.now()
            ),
            NetworkSegment(
                id="iot",
                name="Red IoT",
                description="Red para dispositivos IoT",
                network_range="10.0.4.0/24",
                vlan_id=400,
                security_level=4,
                allowed_protocols=["HTTP", "HTTPS", "MQTT"],
                allowed_ports=[80, 443, 1883],
                isolation_level="full",
                created_at=datetime.now()
            ),
            NetworkSegment(
                id="guest",
                name="Red de Invitados",
                description="Red para invitados",
                network_range="10.0.5.0/24",
                vlan_id=500,
                security_level=2,
                allowed_protocols=["HTTP", "HTTPS", "DNS"],
                allowed_ports=[80, 443, 53],
                isolation_level="full",
                created_at=datetime.now()
            )
        ]
        
        for segment in default_segments:
            self.add_segment(segment)
    
    def _load_default_rules(self):
        """Cargar reglas de acceso por defecto"""
        default_rules = [
            AccessRule(
                id="dmz_to_internal",
                name="DMZ to Internal",
                source_segment="dmz",
                dest_segment="internal",
                protocol="HTTPS",
                port=443,
                action="allow",
                priority=100,
                description="Acceso HTTPS desde DMZ a servicios internos"
            ),
            AccessRule(
                id="internal_to_management",
                name="Internal to Management",
                source_segment="internal",
                dest_segment="management",
                protocol="SSH",
                port=22,
                action="allow",
                priority=90,
                description="Acceso SSH desde red interna a gestión"
            ),
            AccessRule(
                id="deny_guest_to_internal",
                name="Deny Guest to Internal",
                source_segment="guest",
                dest_segment="internal",
                protocol="ANY",
                port=0,
                action="deny",
                priority=200,
                description="Denegar todo acceso desde red de invitados a interna"
            ),
            AccessRule(
                id="iot_isolation",
                name="IoT Isolation",
                source_segment="iot",
                dest_segment="internal",
                protocol="ANY",
                port=0,
                action="deny",
                priority=150,
                description="Aislar dispositivos IoT de la red interna"
            )
        ]
        
        for rule in default_rules:
            self.add_access_rule(rule)
    
    def add_segment(self, segment: NetworkSegment) -> bool:
        """Añadir nuevo segmento de red"""
        try:
            # Validar rango de red
            ipaddress.IPv4Network(segment.network_range, strict=False)
            
            segment.created_at = segment.created_at or datetime.now()
            segment.updated_at = datetime.now()
            
            self.segments[segment.id] = segment
            
            # Guardar en base de datos
            self._save_segment_to_db(segment)
            
            # Aplicar configuración de red si es posible
            self._apply_network_config(segment)
            
            logger.info(f"Segmento añadido: {segment.name} ({segment.network_range})")
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo segmento: {e}")
            return False
    
    def remove_segment(self, segment_id: str) -> bool:
        """Eliminar segmento de red"""
        try:
            if segment_id in self.segments:
                segment = self.segments[segment_id]
                
                # Verificar que no hay dispositivos en el segmento
                devices_in_segment = [d for d in self.devices.values() if d.segment_id == segment_id]
                if devices_in_segment:
                    logger.warning(f"No se puede eliminar segmento {segment_id}: tiene {len(devices_in_segment)} dispositivos")
                    return False
                
                del self.segments[segment_id]
                
                # Eliminar reglas relacionadas
                rules_to_remove = [rule_id for rule_id, rule in self.access_rules.items()
                                 if rule.source_segment == segment_id or rule.dest_segment == segment_id]
                for rule_id in rules_to_remove:
                    self.remove_access_rule(rule_id)
                
                # Eliminar de base de datos
                self._remove_segment_from_db(segment_id)
                
                logger.info(f"Segmento eliminado: {segment_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error eliminando segmento: {e}")
            return False
    
    def add_access_rule(self, rule: AccessRule) -> bool:
        """Añadir regla de acceso"""
        try:
            # Validar que los segmentos existen
            if rule.source_segment not in self.segments:
                raise ValueError(f"Segmento origen no existe: {rule.source_segment}")
            if rule.dest_segment not in self.segments:
                raise ValueError(f"Segmento destino no existe: {rule.dest_segment}")
            
            self.access_rules[rule.id] = rule
            
            # Guardar en base de datos
            self._save_access_rule_to_db(rule)
            
            # Aplicar regla si es posible
            self._apply_access_rule(rule)
            
            logger.info(f"Regla de acceso añadida: {rule.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo regla de acceso: {e}")
            return False
    
    def remove_access_rule(self, rule_id: str) -> bool:
        """Eliminar regla de acceso"""
        try:
            if rule_id in self.access_rules:
                rule = self.access_rules[rule_id]
                del self.access_rules[rule_id]
                
                # Eliminar de base de datos
                self._remove_access_rule_from_db(rule_id)
                
                # Remover regla de red si es posible
                self._remove_access_rule_from_network(rule)
                
                logger.info(f"Regla de acceso eliminada: {rule_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error eliminando regla de acceso: {e}")
            return False
    
    def add_device(self, device: NetworkDevice) -> bool:
        """Añadir dispositivo a la red"""
        try:
            # Validar que el segmento existe
            if device.segment_id not in self.segments:
                raise ValueError(f"Segmento no existe: {device.segment_id}")
            
            # Validar IP
            ipaddress.IPv4Address(device.ip_address)
            
            device.last_seen = datetime.now()
            self.devices[device.id] = device
            
            # Guardar en base de datos
            self._save_device_to_db(device)
            
            # Aplicar políticas de segmento
            self._apply_segment_policies(device)
            
            logger.info(f"Dispositivo añadido: {device.name} ({device.ip_address})")
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo dispositivo: {e}")
            return False
    
    def remove_device(self, device_id: str) -> bool:
        """Eliminar dispositivo de la red"""
        try:
            if device_id in self.devices:
                device = self.devices[device_id]
                del self.devices[device_id]
                
                # Eliminar de base de datos
                self._remove_device_from_db(device_id)
                
                # Limpiar conexiones activas
                self._cleanup_device_connections(device_id)
                
                logger.info(f"Dispositivo eliminado: {device_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error eliminando dispositivo: {e}")
            return False
    
    def check_access(self, source_ip: str, dest_ip: str, protocol: str, port: int) -> bool:
        """Verificar si el acceso está permitido"""
        try:
            # Encontrar segmentos de origen y destino
            source_segment = self._find_device_segment(source_ip)
            dest_segment = self._find_device_segment(dest_ip)
            
            if not source_segment or not dest_segment:
                logger.warning(f"No se pudo determinar segmento para {source_ip} -> {dest_ip}")
                return False
            
            # Si es el mismo segmento, permitir (a menos que esté completamente aislado)
            if source_segment == dest_segment:
                segment = self.segments[source_segment]
                return segment.isolation_level != "full"
            
            # Buscar regla aplicable
            applicable_rules = []
            for rule in self.access_rules.values():
                if not rule.enabled:
                    continue
                
                if (rule.source_segment == source_segment and 
                    rule.dest_segment == dest_segment):
                    
                    # Verificar protocolo y puerto
                    if (rule.protocol == protocol or rule.protocol == "ANY") and \
                       (rule.port == port or rule.port == 0):
                        applicable_rules.append(rule)
            
            if not applicable_rules:
                # Sin reglas específicas, denegar por defecto
                return False
            
            # Ordenar por prioridad (mayor número = mayor prioridad)
            applicable_rules.sort(key=lambda r: r.priority, reverse=True)
            
            # La regla con mayor prioridad determina la acción
            top_rule = applicable_rules[0]
            return top_rule.action == "allow"
            
        except Exception as e:
            logger.error(f"Error verificando acceso: {e}")
            return False
    
    def _find_device_segment(self, ip_address: str) -> Optional[str]:
        """Encontrar el segmento de un dispositivo por IP"""
        try:
            ip = ipaddress.IPv4Address(ip_address)
            
            for segment_id, segment in self.segments.items():
                network = ipaddress.IPv4Network(segment.network_range, strict=False)
                if ip in network:
                    return segment_id
            
            return None
            
        except Exception as e:
            logger.error(f"Error encontrando segmento para IP {ip_address}: {e}")
            return None
    
    def _apply_network_config(self, segment: NetworkSegment):
        """Aplicar configuración de red para el segmento"""
        try:
            # Aquí se implementaría la configuración real de red
            # Por ejemplo, configuración de VLANs, firewalls, etc.
            
            if segment.vlan_id:
                logger.info(f"Configurando VLAN {segment.vlan_id} para segmento {segment.name}")
            
            # Configurar firewall rules
            if segment.isolation_level == "full":
                logger.info(f"Aplicando aislamiento completo para segmento {segment.name}")
            elif segment.isolation_level == "partial":
                logger.info(f"Aplicando aislamiento parcial para segmento {segment.name}")
            
        except Exception as e:
            logger.error(f"Error aplicando configuración de red: {e}")
    
    def _apply_access_rule(self, rule: AccessRule):
        """Aplicar regla de acceso en la red"""
        try:
            # Aquí se implementaría la aplicación real de reglas
            # Por ejemplo, configuración de firewall, ACLs, etc.
            
            if rule.action == "allow":
                logger.info(f"Aplicando regla de acceso: {rule.source_segment} -> {rule.dest_segment} ({rule.protocol}:{rule.port})")
            else:
                logger.info(f"Aplicando regla de denegación: {rule.source_segment} -> {rule.dest_segment} ({rule.protocol}:{rule.port})")
            
        except Exception as e:
            logger.error(f"Error aplicando regla de acceso: {e}")
    
    def _apply_segment_policies(self, device: NetworkDevice):
        """Aplicar políticas del segmento al dispositivo"""
        try:
            segment = self.segments[device.segment_id]
            
            # Aplicar políticas de seguridad según el nivel
            if segment.security_level >= 8:
                logger.info(f"Aplicando políticas de alta seguridad para {device.name}")
            elif segment.security_level >= 5:
                logger.info(f"Aplicando políticas de seguridad media para {device.name}")
            else:
                logger.info(f"Aplicando políticas de seguridad básica para {device.name}")
            
        except Exception as e:
            logger.error(f"Error aplicando políticas de segmento: {e}")
    
    def _save_segment_to_db(self, segment: NetworkSegment):
        """Guardar segmento en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO network_segments 
                (id, name, description, network_range, vlan_id, security_level, 
                 allowed_protocols, allowed_ports, isolation_level, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (segment.id, segment.name, segment.description, segment.network_range,
                  segment.vlan_id, segment.security_level, 
                  json.dumps(segment.allowed_protocols or []),
                  json.dumps(segment.allowed_ports or []),
                  segment.isolation_level, segment.created_at.isoformat(),
                  segment.updated_at.isoformat()))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando segmento en DB: {e}")
    
    def _save_access_rule_to_db(self, rule: AccessRule):
        """Guardar regla de acceso en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO access_rules 
                (id, name, source_segment, dest_segment, protocol, port, action, priority, enabled, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (rule.id, rule.name, rule.source_segment, rule.dest_segment,
                  rule.protocol, rule.port, rule.action, rule.priority, rule.enabled, rule.description))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando regla de acceso en DB: {e}")
    
    def _save_device_to_db(self, device: NetworkDevice):
        """Guardar dispositivo en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO network_devices 
                (id, name, ip_address, mac_address, segment_id, device_type, security_level, last_seen, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (device.id, device.name, device.ip_address, device.mac_address,
                  device.segment_id, device.device_type, device.security_level,
                  device.last_seen.isoformat(), device.status))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando dispositivo en DB: {e}")
    
    def _remove_segment_from_db(self, segment_id: str):
        """Eliminar segmento de base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM network_segments WHERE id = ?', (segment_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error eliminando segmento de DB: {e}")
    
    def _remove_access_rule_from_db(self, rule_id: str):
        """Eliminar regla de acceso de base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM access_rules WHERE id = ?', (rule_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error eliminando regla de acceso de DB: {e}")
    
    def _remove_device_from_db(self, device_id: str):
        """Eliminar dispositivo de base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM network_devices WHERE id = ?', (device_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error eliminando dispositivo de DB: {e}")
    
    def _remove_access_rule_from_network(self, rule: AccessRule):
        """Remover regla de acceso de la red"""
        try:
            # Aquí se implementaría la remoción real de reglas
            logger.info(f"Removiendo regla de acceso: {rule.name}")
        except Exception as e:
            logger.error(f"Error removiendo regla de acceso: {e}")
    
    def _cleanup_device_connections(self, device_id: str):
        """Limpiar conexiones activas del dispositivo"""
        try:
            # Remover conexiones donde el dispositivo es origen o destino
            connections_to_remove = []
            for conn_id, connections in self.active_connections.items():
                connections[:] = [conn for conn in connections 
                                if conn[0] != device_id and conn[1] != device_id]
        except Exception as e:
            logger.error(f"Error limpiando conexiones del dispositivo: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de segmentación"""
        return {
            'total_segments': len(self.segments),
            'total_devices': len(self.devices),
            'total_access_rules': len(self.access_rules),
            'active_connections': sum(len(conns) for conns in self.active_connections.values()),
            'segments_by_isolation': {
                'full': len([s for s in self.segments.values() if s.isolation_level == 'full']),
                'partial': len([s for s in self.segments.values() if s.isolation_level == 'partial']),
                'none': len([s for s in self.segments.values() if s.isolation_level == 'none'])
            },
            'devices_by_type': {
                device_type: len([d for d in self.devices.values() if d.device_type == device_type])
                for device_type in set(d.device_type for d in self.devices.values())
            }
        }
    
    def start_monitoring(self):
        """Iniciar monitoreo de red"""
        self.running = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
        logger.info("Monitoreo de segmentación iniciado")
    
    def stop_monitoring(self):
        """Detener monitoreo de red"""
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
        logger.info("Monitoreo de segmentación detenido")
    
    def _monitoring_loop(self):
        """Bucle de monitoreo"""
        while self.running:
            try:
                # Monitorear conexiones activas
                self._monitor_active_connections()
                
                # Verificar dispositivos inactivos
                self._check_inactive_devices()
                
                # Aplicar políticas automáticas
                if self.config['auto_segmentation']:
                    self._apply_auto_segmentation()
                
                time.sleep(self.config['monitoring_interval'])
                
            except Exception as e:
                logger.error(f"Error en bucle de monitoreo: {e}")
                time.sleep(60)
    
    def _monitor_active_connections(self):
        """Monitorear conexiones activas"""
        # Implementación simplificada
        # En un entorno real, se usarían herramientas como netstat, ss, etc.
        pass
    
    def _check_inactive_devices(self):
        """Verificar dispositivos inactivos"""
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(hours=24)
        
        for device in self.devices.values():
            if device.last_seen and device.last_seen < cutoff_time:
                device.status = "inactive"
                logger.warning(f"Dispositivo inactivo detectado: {device.name}")
    
    def _apply_auto_segmentation(self):
        """Aplicar segmentación automática"""
        # Implementación simplificada
        # En un entorno real, se analizarían patrones de tráfico y comportamiento
        pass

# Función principal para integración con lucIA
def run_network_segmentation_analysis(target_config: str = None) -> str:
    """Función principal para integración con lucIA"""
    try:
        segmentation_manager = NetworkSegmentationManager()
        segmentation_manager.start_monitoring()
        
        if target_config:
            # Simular configuración de segmentación
            stats = segmentation_manager.get_statistics()
            return f"Segmentación configurada. Segmentos: {stats['total_segments']}, Dispositivos: {stats['total_devices']}"
        else:
            stats = segmentation_manager.get_statistics()
            return f"Segmentación activa. Segmentos: {stats['total_segments']}, Reglas: {stats['total_access_rules']}"
    
    except Exception as e:
        return f"Error en análisis de segmentación: {e}"

if __name__ == "__main__":
    # Ejemplo de uso
    result = run_network_segmentation_analysis()
    print(result) 