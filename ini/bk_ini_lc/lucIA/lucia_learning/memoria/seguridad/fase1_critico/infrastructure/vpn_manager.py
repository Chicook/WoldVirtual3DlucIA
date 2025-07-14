#!/usr/bin/env python3
"""
vpn_manager.py
Gestor de VPN para lucIA
Gestiona conexiones VPN seguras, autenticación y políticas de acceso remoto
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
import hashlib
import secrets
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class VPNConnection:
    """Conexión VPN"""
    id: str
    user_id: str
    username: str
    ip_address: str
    public_ip: str
    protocol: str  # "OpenVPN", "WireGuard", "IPSec"
    status: str  # "connected", "disconnected", "connecting", "error"
    connected_at: datetime
    disconnected_at: Optional[datetime] = None
    bytes_sent: int = 0
    bytes_received: int = 0
    session_duration: int = 0
    client_info: Dict[str, Any] = None

@dataclass
class VPNUser:
    """Usuario VPN"""
    id: str
    username: str
    email: str
    full_name: str
    role: str  # "admin", "user", "guest"
    status: str  # "active", "inactive", "suspended"
    created_at: datetime
    last_login: Optional[datetime] = None
    failed_attempts: int = 0
    locked_until: Optional[datetime] = None
    allowed_networks: List[str] = None
    max_sessions: int = 1
    session_timeout: int = 3600  # segundos

@dataclass
class VPNPolicy:
    """Política de VPN"""
    id: str
    name: str
    description: str
    user_roles: List[str]
    allowed_protocols: List[str]
    allowed_networks: List[str]
    max_sessions: int
    session_timeout: int
    bandwidth_limit: int  # MB/s
    enabled: bool = True
    priority: int = 100

class VPNManager:
    """Gestor principal de VPN"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.connections: Dict[str, VPNConnection] = {}
        self.users: Dict[str, VPNUser] = {}
        self.policies: Dict[str, VPNPolicy] = {}
        self.active_sessions: Dict[str, List[str]] = defaultdict(list)  # user_id -> connection_ids
        self.failed_attempts: Dict[str, int] = defaultdict(int)
        self.blocked_ips: Set[str] = set()
        self.db_path = "vpn_manager.db"
        
        # Inicializar base de datos
        self._init_database()
        
        # Cargar configuración por defecto
        self._load_default_users()
        self._load_default_policies()
        
        # Inicializar monitoreo
        self.running = False
        self.monitoring_thread = None
        
        logger.info("VPN Manager inicializado")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Cargar configuración de VPN"""
        default_config = {
            'vpn_server_ip': '0.0.0.0',
            'vpn_server_port': 1194,
            'vpn_protocol': 'OpenVPN',
            'max_connections': 100,
            'session_timeout': 3600,  # 1 hora
            'idle_timeout': 1800,     # 30 minutos
            'max_failed_attempts': 5,
            'lockout_duration': 1800,  # 30 minutos
            'enable_mfa': True,
            'enable_audit_log': True,
            'backup_config_interval': 3600,  # 1 hora
            'monitoring_interval': 30,       # 30 segundos
            'allowed_protocols': ['OpenVPN', 'WireGuard'],
            'default_bandwidth_limit': 10,   # MB/s
            'enable_geo_blocking': True,
            'blocked_countries': ['CN', 'RU', 'IR', 'KP'],
            'enable_dns_protection': True,
            'dns_servers': ['8.8.8.8', '1.1.1.1'],
            'enable_kill_switch': True,
            'split_tunneling': False
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
            
            # Tabla de usuarios VPN
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS vpn_users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE,
                    email TEXT,
                    full_name TEXT,
                    role TEXT,
                    status TEXT,
                    created_at TEXT,
                    last_login TEXT,
                    failed_attempts INTEGER,
                    locked_until TEXT,
                    allowed_networks TEXT,
                    max_sessions INTEGER,
                    session_timeout INTEGER
                )
            ''')
            
            # Tabla de conexiones VPN
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS vpn_connections (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    username TEXT,
                    ip_address TEXT,
                    public_ip TEXT,
                    protocol TEXT,
                    status TEXT,
                    connected_at TEXT,
                    disconnected_at TEXT,
                    bytes_sent INTEGER,
                    bytes_received INTEGER,
                    session_duration INTEGER,
                    client_info TEXT
                )
            ''')
            
            # Tabla de políticas VPN
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS vpn_policies (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    user_roles TEXT,
                    allowed_protocols TEXT,
                    allowed_networks TEXT,
                    max_sessions INTEGER,
                    session_timeout INTEGER,
                    bandwidth_limit INTEGER,
                    enabled INTEGER,
                    priority INTEGER
                )
            ''')
            
            # Tabla de intentos fallidos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS failed_attempts (
                    id TEXT PRIMARY KEY,
                    username TEXT,
                    ip_address TEXT,
                    timestamp TEXT,
                    reason TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
    
    def _load_default_users(self):
        """Cargar usuarios VPN por defecto"""
        default_users = [
            VPNUser(
                id="admin_001",
                username="admin",
                email="admin@lucia.local",
                full_name="Administrador del Sistema",
                role="admin",
                status="active",
                created_at=datetime.now(),
                allowed_networks=["0.0.0.0/0"],
                max_sessions=5,
                session_timeout=7200
            ),
            VPNUser(
                id="user_001",
                username="usuario1",
                email="usuario1@lucia.local",
                full_name="Usuario Ejemplo",
                role="user",
                status="active",
                created_at=datetime.now(),
                allowed_networks=["10.0.0.0/8", "192.168.0.0/16"],
                max_sessions=2,
                session_timeout=3600
            )
        ]
        
        for user in default_users:
            self.add_user(user)
    
    def _load_default_policies(self):
        """Cargar políticas VPN por defecto"""
        default_policies = [
            VPNPolicy(
                id="admin_policy",
                name="Política de Administradores",
                description="Política para usuarios administradores",
                user_roles=["admin"],
                allowed_protocols=["OpenVPN", "WireGuard"],
                allowed_networks=["0.0.0.0/0"],
                max_sessions=5,
                session_timeout=7200,
                bandwidth_limit=50,
                priority=200
            ),
            VPNPolicy(
                id="user_policy",
                name="Política de Usuarios",
                description="Política para usuarios regulares",
                user_roles=["user"],
                allowed_protocols=["OpenVPN"],
                allowed_networks=["10.0.0.0/8", "192.168.0.0/16"],
                max_sessions=2,
                session_timeout=3600,
                bandwidth_limit=10,
                priority=100
            ),
            VPNPolicy(
                id="guest_policy",
                name="Política de Invitados",
                description="Política para usuarios invitados",
                user_roles=["guest"],
                allowed_protocols=["OpenVPN"],
                allowed_networks=["10.0.0.0/8"],
                max_sessions=1,
                session_timeout=1800,
                bandwidth_limit=5,
                priority=50
            )
        ]
        
        for policy in default_policies:
            self.add_policy(policy)
    
    def add_user(self, user: VPNUser) -> bool:
        """Añadir nuevo usuario VPN"""
        try:
            # Validar datos del usuario
            if not user.username or not user.email:
                raise ValueError("Username y email son requeridos")
            
            # Verificar que el username no existe
            if any(u.username == user.username for u in self.users.values()):
                raise ValueError(f"Username ya existe: {user.username}")
            
            user.created_at = user.created_at or datetime.now()
            user.allowed_networks = user.allowed_networks or ["10.0.0.0/8"]
            
            self.users[user.id] = user
            
            # Guardar en base de datos
            self._save_user_to_db(user)
            
            # Generar certificados si es necesario
            self._generate_user_certificates(user)
            
            logger.info(f"Usuario VPN añadido: {user.username}")
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo usuario VPN: {e}")
            return False
    
    def remove_user(self, user_id: str) -> bool:
        """Eliminar usuario VPN"""
        try:
            if user_id in self.users:
                user = self.users[user_id]
                
                # Verificar que no hay conexiones activas
                active_connections = self.active_sessions.get(user_id, [])
                if active_connections:
                    logger.warning(f"No se puede eliminar usuario {user_id}: tiene {len(active_connections)} conexiones activas")
                    return False
                
                del self.users[user_id]
                
                # Eliminar de base de datos
                self._remove_user_from_db(user_id)
                
                # Revocar certificados
                self._revoke_user_certificates(user)
                
                logger.info(f"Usuario VPN eliminado: {user.username}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error eliminando usuario VPN: {e}")
            return False
    
    def add_policy(self, policy: VPNPolicy) -> bool:
        """Añadir nueva política VPN"""
        try:
            self.policies[policy.id] = policy
            
            # Guardar en base de datos
            self._save_policy_to_db(policy)
            
            logger.info(f"Política VPN añadida: {policy.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo política VPN: {e}")
            return False
    
    def remove_policy(self, policy_id: str) -> bool:
        """Eliminar política VPN"""
        try:
            if policy_id in self.policies:
                policy = self.policies[policy_id]
                del self.policies[policy_id]
                
                # Eliminar de base de datos
                self._remove_policy_from_db(policy_id)
                
                logger.info(f"Política VPN eliminada: {policy.name}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error eliminando política VPN: {e}")
            return False
    
    def authenticate_user(self, username: str, password: str, client_ip: str) -> Tuple[bool, str, Optional[VPNUser]]:
        """Autenticar usuario VPN"""
        try:
            # Buscar usuario
            user = None
            for u in self.users.values():
                if u.username == username:
                    user = u
                    break
            
            if not user:
                self._log_failed_attempt(username, client_ip, "Usuario no encontrado")
                return False, "Credenciales inválidas", None
            
            # Verificar si el usuario está bloqueado
            if user.status == "suspended":
                return False, "Usuario suspendido", None
            
            if user.locked_until and user.locked_until > datetime.now():
                return False, f"Usuario bloqueado hasta {user.locked_until}", None
            
            # Verificar IP bloqueada
            if client_ip in self.blocked_ips:
                return False, "IP bloqueada", None
            
            # Verificar geolocalización si está habilitado
            if self.config['enable_geo_blocking']:
                if not self._check_geo_access(client_ip):
                    return False, "Acceso denegado por ubicación geográfica", None
            
            # Verificar intentos fallidos
            if user.failed_attempts >= self.config['max_failed_attempts']:
                user.locked_until = datetime.now() + timedelta(seconds=self.config['lockout_duration'])
                user.status = "suspended"
                self._update_user_in_db(user)
                return False, "Demasiados intentos fallidos", None
            
            # Aquí se implementaría la verificación real de contraseña
            # Por simplicidad, asumimos que la autenticación es exitosa
            password_valid = self._verify_password(username, password)
            
            if not password_valid:
                user.failed_attempts += 1
                self._update_user_in_db(user)
                self._log_failed_attempt(username, client_ip, "Contraseña incorrecta")
                return False, "Credenciales inválidas", None
            
            # Autenticación exitosa
            user.failed_attempts = 0
            user.last_login = datetime.now()
            user.status = "active"
            self._update_user_in_db(user)
            
            logger.info(f"Autenticación exitosa: {username} desde {client_ip}")
            return True, "Autenticación exitosa", user
            
        except Exception as e:
            logger.error(f"Error en autenticación: {e}")
            return False, "Error interno", None
    
    def establish_connection(self, user: VPNUser, client_ip: str, protocol: str = "OpenVPN") -> Optional[VPNConnection]:
        """Establecer conexión VPN"""
        try:
            # Verificar límite de sesiones
            active_sessions = self.active_sessions.get(user.id, [])
            if len(active_sessions) >= user.max_sessions:
                logger.warning(f"Límite de sesiones alcanzado para {user.username}")
                return None
            
            # Verificar política de usuario
            policy = self._get_user_policy(user)
            if not policy or not policy.enabled:
                logger.warning(f"No hay política válida para {user.username}")
                return None
            
            if protocol not in policy.allowed_protocols:
                logger.warning(f"Protocolo {protocol} no permitido para {user.username}")
                return None
            
            # Asignar IP
            vpn_ip = self._assign_vpn_ip(user)
            if not vpn_ip:
                logger.error(f"No se pudo asignar IP VPN para {user.username}")
                return None
            
            # Crear conexión
            connection = VPNConnection(
                id=f"conn_{int(time.time())}_{user.id}",
                user_id=user.id,
                username=user.username,
                ip_address=vpn_ip,
                public_ip=client_ip,
                protocol=protocol,
                status="connected",
                connected_at=datetime.now(),
                client_info={
                    "ip": client_ip,
                    "user_agent": "VPN Client",
                    "protocol": protocol
                }
            )
            
            self.connections[connection.id] = connection
            self.active_sessions[user.id].append(connection.id)
            
            # Guardar en base de datos
            self._save_connection_to_db(connection)
            
            # Aplicar políticas de red
            self._apply_connection_policies(connection, policy)
            
            logger.info(f"Conexión VPN establecida: {user.username} ({vpn_ip})")
            return connection
            
        except Exception as e:
            logger.error(f"Error estableciendo conexión VPN: {e}")
            return None
    
    def disconnect_user(self, user_id: str, connection_id: Optional[str] = None):
        """Desconectar usuario VPN"""
        try:
            if connection_id:
                # Desconectar conexión específica
                if connection_id in self.connections:
                    connection = self.connections[connection_id]
                    connection.status = "disconnected"
                    connection.disconnected_at = datetime.now()
                    connection.session_duration = int((connection.disconnected_at - connection.connected_at).total_seconds())
                    
                    # Remover de sesiones activas
                    if user_id in self.active_sessions:
                        self.active_sessions[user_id] = [cid for cid in self.active_sessions[user_id] if cid != connection_id]
                    
                    # Actualizar en base de datos
                    self._update_connection_in_db(connection)
                    
                    logger.info(f"Conexión VPN desconectada: {connection.username}")
            else:
                # Desconectar todas las conexiones del usuario
                active_connections = self.active_sessions.get(user_id, [])
                for conn_id in active_connections:
                    self.disconnect_user(user_id, conn_id)
            
        except Exception as e:
            logger.error(f"Error desconectando usuario VPN: {e}")
    
    def _verify_password(self, username: str, password: str) -> bool:
        """Verificar contraseña del usuario"""
        # Implementación simplificada
        # En un entorno real, se usaría hashing seguro y verificación contra base de datos
        return password == "password123"  # Solo para demostración
    
    def _check_geo_access(self, client_ip: str) -> bool:
        """Verificar acceso geográfico"""
        # Implementación simplificada
        # En un entorno real, se usaría un servicio de geolocalización
        try:
            # Simular verificación de país
            # Por ahora, permitir todo excepto IPs específicas
            blocked_ranges = [
                "203.0.113.0/24",  # Ejemplo de rango bloqueado
                "198.51.100.0/24"  # Otro ejemplo
            ]
            
            client_ip_obj = ipaddress.IPv4Address(client_ip)
            for blocked_range in blocked_ranges:
                if client_ip_obj in ipaddress.IPv4Network(blocked_range):
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error verificando acceso geográfico: {e}")
            return False
    
    def _assign_vpn_ip(self, user: VPNUser) -> Optional[str]:
        """Asignar IP VPN al usuario"""
        try:
            # Implementación simplificada
            # En un entorno real, se usaría un pool de IPs
            base_ip = "10.8.0.0/24"
            network = ipaddress.IPv4Network(base_ip, strict=False)
            
            # Buscar IP disponible
            for i in range(2, 254):  # Evitar .0 y .1
                candidate_ip = str(network.network_address + i)
                if not any(conn.ip_address == candidate_ip for conn in self.connections.values()):
                    return candidate_ip
            
            return None
            
        except Exception as e:
            logger.error(f"Error asignando IP VPN: {e}")
            return None
    
    def _get_user_policy(self, user: VPNUser) -> Optional[VPNPolicy]:
        """Obtener política para el usuario"""
        try:
            applicable_policies = []
            for policy in self.policies.values():
                if user.role in policy.user_roles and policy.enabled:
                    applicable_policies.append(policy)
            
            if not applicable_policies:
                return None
            
            # Retornar política con mayor prioridad
            return max(applicable_policies, key=lambda p: p.priority)
            
        except Exception as e:
            logger.error(f"Error obteniendo política de usuario: {e}")
            return None
    
    def _apply_connection_policies(self, connection: VPNConnection, policy: VPNPolicy):
        """Aplicar políticas de red para la conexión"""
        try:
            # Configurar límites de ancho de banda
            if policy.bandwidth_limit > 0:
                self._set_bandwidth_limit(connection.ip_address, policy.bandwidth_limit)
            
            # Configurar rutas permitidas
            for network in policy.allowed_networks:
                self._add_route(connection.ip_address, network)
            
            # Configurar DNS si está habilitado
            if self.config['enable_dns_protection']:
                for dns_server in self.config['dns_servers']:
                    self._set_dns_server(connection.ip_address, dns_server)
            
            # Configurar kill switch si está habilitado
            if self.config['enable_kill_switch']:
                self._enable_kill_switch(connection.ip_address)
            
        except Exception as e:
            logger.error(f"Error aplicando políticas de conexión: {e}")
    
    def _set_bandwidth_limit(self, ip_address: str, limit_mbps: int):
        """Configurar límite de ancho de banda"""
        # Implementación simplificada
        logger.info(f"Configurando límite de ancho de banda: {ip_address} -> {limit_mbps} MB/s")
    
    def _add_route(self, ip_address: str, network: str):
        """Añadir ruta para la conexión"""
        # Implementación simplificada
        logger.info(f"Añadiendo ruta: {ip_address} -> {network}")
    
    def _set_dns_server(self, ip_address: str, dns_server: str):
        """Configurar servidor DNS"""
        # Implementación simplificada
        logger.info(f"Configurando DNS: {ip_address} -> {dns_server}")
    
    def _enable_kill_switch(self, ip_address: str):
        """Habilitar kill switch"""
        # Implementación simplificada
        logger.info(f"Habilitando kill switch para: {ip_address}")
    
    def _generate_user_certificates(self, user: VPNUser):
        """Generar certificados para el usuario"""
        # Implementación simplificada
        logger.info(f"Generando certificados para: {user.username}")
    
    def _revoke_user_certificates(self, user: VPNUser):
        """Revocar certificados del usuario"""
        # Implementación simplificada
        logger.info(f"Revocando certificados para: {user.username}")
    
    def _log_failed_attempt(self, username: str, ip_address: str, reason: str):
        """Registrar intento fallido"""
        try:
            attempt_id = f"failed_{int(time.time())}_{username}"
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO failed_attempts (id, username, ip_address, timestamp, reason)
                VALUES (?, ?, ?, ?, ?)
            ''', (attempt_id, username, ip_address, datetime.now().isoformat(), reason))
            conn.commit()
            conn.close()
            
            logger.warning(f"Intento fallido: {username} desde {ip_address} - {reason}")
            
        except Exception as e:
            logger.error(f"Error registrando intento fallido: {e}")
    
    def _save_user_to_db(self, user: VPNUser):
        """Guardar usuario en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO vpn_users 
                (id, username, email, full_name, role, status, created_at, last_login, 
                 failed_attempts, locked_until, allowed_networks, max_sessions, session_timeout)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user.id, user.username, user.email, user.full_name, user.role, user.status,
                  user.created_at.isoformat(), user.last_login.isoformat() if user.last_login else None,
                  user.failed_attempts, user.locked_until.isoformat() if user.locked_until else None,
                  json.dumps(user.allowed_networks or []), user.max_sessions, user.session_timeout))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando usuario en DB: {e}")
    
    def _save_connection_to_db(self, connection: VPNConnection):
        """Guardar conexión en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO vpn_connections 
                (id, user_id, username, ip_address, public_ip, protocol, status, connected_at,
                 disconnected_at, bytes_sent, bytes_received, session_duration, client_info)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (connection.id, connection.user_id, connection.username, connection.ip_address,
                  connection.public_ip, connection.protocol, connection.status, connection.connected_at.isoformat(),
                  connection.disconnected_at.isoformat() if connection.disconnected_at else None,
                  connection.bytes_sent, connection.bytes_received, connection.session_duration,
                  json.dumps(connection.client_info or {})))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando conexión en DB: {e}")
    
    def _save_policy_to_db(self, policy: VPNPolicy):
        """Guardar política en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO vpn_policies 
                (id, name, description, user_roles, allowed_protocols, allowed_networks,
                 max_sessions, session_timeout, bandwidth_limit, enabled, priority)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (policy.id, policy.name, policy.description, json.dumps(policy.user_roles),
                  json.dumps(policy.allowed_protocols), json.dumps(policy.allowed_networks),
                  policy.max_sessions, policy.session_timeout, policy.bandwidth_limit,
                  policy.enabled, policy.priority))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando política en DB: {e}")
    
    def _update_user_in_db(self, user: VPNUser):
        """Actualizar usuario en base de datos"""
        self._save_user_to_db(user)
    
    def _update_connection_in_db(self, connection: VPNConnection):
        """Actualizar conexión en base de datos"""
        self._save_connection_to_db(connection)
    
    def _remove_user_from_db(self, user_id: str):
        """Eliminar usuario de base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM vpn_users WHERE id = ?', (user_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error eliminando usuario de DB: {e}")
    
    def _remove_policy_from_db(self, policy_id: str):
        """Eliminar política de base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM vpn_policies WHERE id = ?', (policy_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error eliminando política de DB: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de VPN"""
        active_connections = [conn for conn in self.connections.values() if conn.status == "connected"]
        
        return {
            'total_users': len(self.users),
            'active_users': len([u for u in self.users.values() if u.status == "active"]),
            'total_connections': len(self.connections),
            'active_connections': len(active_connections),
            'total_policies': len(self.policies),
            'blocked_ips': len(self.blocked_ips),
            'connections_by_protocol': {
                protocol: len([conn for conn in active_connections if conn.protocol == protocol])
                for protocol in set(conn.protocol for conn in active_connections)
            },
            'users_by_role': {
                role: len([u for u in self.users.values() if u.role == role])
                for role in set(u.role for u in self.users.values())
            }
        }
    
    def start_monitoring(self):
        """Iniciar monitoreo de VPN"""
        self.running = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
        logger.info("Monitoreo de VPN iniciado")
    
    def stop_monitoring(self):
        """Detener monitoreo de VPN"""
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
        logger.info("Monitoreo de VPN detenido")
    
    def _monitoring_loop(self):
        """Bucle de monitoreo"""
        while self.running:
            try:
                # Verificar timeouts de sesión
                self._check_session_timeouts()
                
                # Limpiar conexiones antiguas
                self._cleanup_old_connections()
                
                # Verificar usuarios bloqueados
                self._check_locked_users()
                
                time.sleep(self.config['monitoring_interval'])
                
            except Exception as e:
                logger.error(f"Error en bucle de monitoreo: {e}")
                time.sleep(60)
    
    def _check_session_timeouts(self):
        """Verificar timeouts de sesión"""
        current_time = datetime.now()
        
        for connection in self.connections.values():
            if connection.status == "connected":
                session_duration = (current_time - connection.connected_at).total_seconds()
                
                # Obtener política del usuario
                user = self.users.get(connection.user_id)
                if user:
                    policy = self._get_user_policy(user)
                    timeout = policy.session_timeout if policy else self.config['session_timeout']
                    
                    if session_duration > timeout:
                        logger.info(f"Timeout de sesión para {connection.username}")
                        self.disconnect_user(connection.user_id, connection.id)
    
    def _cleanup_old_connections(self):
        """Limpiar conexiones antiguas"""
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(days=7)
        
        connections_to_remove = []
        for conn_id, connection in self.connections.items():
            if connection.disconnected_at and connection.disconnected_at < cutoff_time:
                connections_to_remove.append(conn_id)
        
        for conn_id in connections_to_remove:
            del self.connections[conn_id]
    
    def _check_locked_users(self):
        """Verificar usuarios bloqueados"""
        current_time = datetime.now()
        
        for user in self.users.values():
            if user.locked_until and user.locked_until <= current_time:
                user.locked_until = None
                user.status = "active"
                self._update_user_in_db(user)
                logger.info(f"Usuario desbloqueado: {user.username}")

# Función principal para integración con lucIA
def run_vpn_analysis(target_config: str = None) -> str:
    """Función principal para integración con lucIA"""
    try:
        vpn_manager = VPNManager()
        vpn_manager.start_monitoring()
        
        if target_config:
            # Simular configuración de VPN
            stats = vpn_manager.get_statistics()
            return f"VPN configurado. Usuarios: {stats['total_users']}, Conexiones activas: {stats['active_connections']}"
        else:
            stats = vpn_manager.get_statistics()
            return f"VPN activo. Usuarios: {stats['total_users']}, Políticas: {stats['total_policies']}"
    
    except Exception as e:
        return f"Error en análisis de VPN: {e}"

if __name__ == "__main__":
    # Ejemplo de uso
    result = run_vpn_analysis()
    print(result) 