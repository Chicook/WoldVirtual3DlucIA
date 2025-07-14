#!/usr/bin/env python3
"""
behavioral_analysis_manager.py
Gestor de Análisis Comportamental para lucIA
Monitorea patrones de usuario, detecta comportamientos sospechosos y genera perfiles
"""

import os
import sys
import json
import time
import logging
import threading
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import numpy as np
import pandas as pd
from pathlib import Path
import hashlib
import re
from enum import Enum

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BehaviorType(Enum):
    """Tipos de comportamiento"""
    NORMAL = "normal"
    SUSPICIOUS = "suspicious"
    MALICIOUS = "malicious"
    ANOMALOUS = "anomalous"
    UNKNOWN = "unknown"

class EventType(Enum):
    """Tipos de eventos"""
    LOGIN = "login"
    LOGOUT = "logout"
    FILE_ACCESS = "file_access"
    NETWORK_CONNECTION = "network_connection"
    COMMAND_EXECUTION = "command_execution"
    DATA_TRANSFER = "data_transfer"
    SYSTEM_ACCESS = "system_access"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    CONFIGURATION_CHANGE = "configuration_change"
    PROCESS_CREATION = "process_creation"

@dataclass
class UserEvent:
    """Evento de usuario"""
    id: str
    user_id: str
    event_type: EventType
    timestamp: datetime
    source_ip: str
    destination_ip: Optional[str]
    resource: str
    action: str
    result: str
    metadata: Dict[str, Any]
    session_id: Optional[str] = None

@dataclass
class BehaviorPattern:
    """Patrón de comportamiento"""
    id: str
    user_id: str
    pattern_type: str
    description: str
    events: List[str]
    frequency: int
    time_window: timedelta
    confidence: float
    risk_score: float
    first_seen: datetime
    last_seen: datetime
    status: str  # "active", "inactive", "investigating"

@dataclass
class UserProfile:
    """Perfil de usuario"""
    user_id: str
    username: str
    department: str
    role: str
    risk_level: str  # "low", "medium", "high", "critical"
    normal_patterns: List[str]
    suspicious_patterns: List[str]
    last_activity: datetime
    session_count: int
    total_events: int
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]

@dataclass
class BehavioralAlert:
    """Alerta comportamental"""
    id: str
    user_id: str
    alert_type: str
    severity: int  # 1-10
    description: str
    evidence: List[str]
    timestamp: datetime
    status: str  # "new", "investigating", "resolved", "false_positive"
    risk_score: float
    confidence: float
    metadata: Dict[str, Any]

@dataclass
class SessionAnalysis:
    """Análisis de sesión"""
    session_id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime]
    duration: Optional[timedelta]
    event_count: int
    unique_resources: int
    unique_actions: int
    risk_indicators: List[str]
    behavior_score: float
    status: str  # "active", "completed", "suspicious"

class BehavioralAnalysisManager:
    """Gestor principal de Análisis Comportamental"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.events: Dict[str, UserEvent] = {}
        self.patterns: Dict[str, BehaviorPattern] = {}
        self.profiles: Dict[str, UserProfile] = {}
        self.alerts: List[BehavioralAlert] = []
        self.sessions: Dict[str, SessionAnalysis] = {}
        
        # Colas de eventos para procesamiento en tiempo real
        self.event_queue = deque(maxlen=10000)
        self.alert_queue = deque(maxlen=1000)
        
        # Base de datos
        self.db_path = "behavioral_analysis.db"
        self._init_database()
        
        # Procesamiento en tiempo real
        self.running = False
        self.processing_thread = None
        
        # Métricas de comportamiento
        self.behavior_metrics = defaultdict(lambda: {
            'event_count': 0,
            'pattern_count': 0,
            'alert_count': 0,
            'risk_score': 0.0
        })
        
        logger.info("Behavioral Analysis Manager inicializado")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Cargar configuración de análisis comportamental"""
        default_config = {
            'event_retention_days': 90,
            'pattern_detection_window': 3600,  # segundos
            'session_timeout': 1800,  # segundos
            'risk_threshold': 0.7,
            'alert_threshold': 0.8,
            'pattern_confidence_threshold': 0.6,
            'enable_real_time_analysis': True,
            'enable_session_tracking': True,
            'enable_pattern_detection': True,
            'enable_risk_scoring': True,
            'max_events_per_user': 10000,
            'max_patterns_per_user': 100,
            'enable_ml_integration': True,
            'enable_threat_intel_integration': True,
            'enable_peer_comparison': True,
            'enable_temporal_analysis': True,
            'enable_geographic_analysis': True,
            'enable_device_fingerprinting': True,
            'enable_behavioral_baseline': True,
            'baseline_learning_period': 30,  # días
            'enable_adaptive_thresholds': True,
            'enable_behavioral_correlation': True
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
        """Inicializar base de datos para análisis comportamental"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Tabla de eventos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_events (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    event_type TEXT,
                    timestamp TEXT,
                    source_ip TEXT,
                    destination_ip TEXT,
                    resource TEXT,
                    action TEXT,
                    result TEXT,
                    metadata TEXT,
                    session_id TEXT
                )
            ''')
            
            # Tabla de patrones
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS behavior_patterns (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    pattern_type TEXT,
                    description TEXT,
                    events TEXT,
                    frequency INTEGER,
                    time_window INTEGER,
                    confidence REAL,
                    risk_score REAL,
                    first_seen TEXT,
                    last_seen TEXT,
                    status TEXT
                )
            ''')
            
            # Tabla de perfiles
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_profiles (
                    user_id TEXT PRIMARY KEY,
                    username TEXT,
                    department TEXT,
                    role TEXT,
                    risk_level TEXT,
                    normal_patterns TEXT,
                    suspicious_patterns TEXT,
                    last_activity TEXT,
                    session_count INTEGER,
                    total_events INTEGER,
                    created_at TEXT,
                    updated_at TEXT,
                    metadata TEXT
                )
            ''')
            
            # Tabla de alertas
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS behavioral_alerts (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    alert_type TEXT,
                    severity INTEGER,
                    description TEXT,
                    evidence TEXT,
                    timestamp TEXT,
                    status TEXT,
                    risk_score REAL,
                    confidence REAL,
                    metadata TEXT
                )
            ''')
            
            # Tabla de sesiones
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    user_id TEXT,
                    start_time TEXT,
                    end_time TEXT,
                    duration INTEGER,
                    event_count INTEGER,
                    unique_resources INTEGER,
                    unique_actions INTEGER,
                    risk_indicators TEXT,
                    behavior_score REAL,
                    status TEXT
                )
            ''')
            
            # Índices para optimizar consultas
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_user_time ON user_events(user_id, timestamp)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_patterns_user ON behavior_patterns(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_user_time ON behavioral_alerts(user_id, timestamp)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
    
    def add_event(self, event: UserEvent) -> bool:
        """Añadir evento de usuario"""
        try:
            # Validar evento
            if not self._validate_event(event):
                return False
            
            # Generar ID si no existe
            if not event.id:
                event.id = self._generate_event_id(event)
            
            # Añadir a memoria
            self.events[event.id] = event
            
            # Añadir a cola de procesamiento
            self.event_queue.append(event)
            
            # Guardar en base de datos
            self._save_event_to_db(event)
            
            # Actualizar perfil de usuario
            self._update_user_profile(event)
            
            # Actualizar sesión
            if event.session_id:
                self._update_session(event)
            
            # Análisis en tiempo real si está habilitado
            if self.config['enable_real_time_analysis']:
                self._analyze_event_realtime(event)
            
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo evento: {e}")
            return False
    
    def _validate_event(self, event: UserEvent) -> bool:
        """Validar evento de usuario"""
        try:
            # Verificar campos requeridos
            if not event.user_id or not event.event_type or not event.timestamp:
                return False
            
            # Verificar tipo de evento válido
            if not isinstance(event.event_type, EventType):
                return False
            
            # Verificar timestamp válido
            if not isinstance(event.timestamp, datetime):
                return False
            
            # Verificar IP válida
            if event.source_ip and not self._is_valid_ip(event.source_ip):
                return False
            
            return True
            
        except Exception:
            return False
    
    def _is_valid_ip(self, ip: str) -> bool:
        """Verificar si una IP es válida"""
        try:
            import ipaddress
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False
    
    def _generate_event_id(self, event: UserEvent) -> str:
        """Generar ID único para evento"""
        data = f"{event.user_id}_{event.event_type.value}_{event.timestamp.isoformat()}_{event.source_ip}"
        return hashlib.md5(data.encode()).hexdigest()
    
    def _analyze_event_realtime(self, event: UserEvent):
        """Analizar evento en tiempo real"""
        try:
            # Detectar patrones sospechosos
            suspicious_patterns = self._detect_suspicious_patterns(event)
            
            # Calcular puntuación de riesgo
            risk_score = self._calculate_risk_score(event)
            
            # Verificar umbrales de alerta
            if risk_score > self.config['alert_threshold']:
                self._create_behavioral_alert(event, risk_score, suspicious_patterns)
            
            # Actualizar métricas
            self.behavior_metrics[event.user_id]['event_count'] += 1
            self.behavior_metrics[event.user_id]['risk_score'] = risk_score
            
        except Exception as e:
            logger.error(f"Error en análisis en tiempo real: {e}")
    
    def _detect_suspicious_patterns(self, event: UserEvent) -> List[str]:
        """Detectar patrones sospechosos en el evento"""
        suspicious_patterns = []
        
        try:
            # Patrón 1: Múltiples intentos de login fallidos
            if event.event_type == EventType.LOGIN and event.result == "failed":
                recent_failed_logins = self._count_recent_events(
                    event.user_id, EventType.LOGIN, "failed", minutes=15
                )
                if recent_failed_logins >= 5:
                    suspicious_patterns.append("multiple_failed_logins")
            
            # Patrón 2: Acceso a recursos sensibles fuera de horario
            if event.event_type == EventType.FILE_ACCESS:
                hour = event.timestamp.hour
                if hour < 6 or hour > 22:  # Fuera de horario laboral
                    if "sensitive" in event.resource.lower() or "admin" in event.resource.lower():
                        suspicious_patterns.append("after_hours_sensitive_access")
            
            # Patrón 3: Conexiones desde IPs no habituales
            if event.event_type == EventType.NETWORK_CONNECTION:
                if not self._is_usual_ip(event.user_id, event.source_ip):
                    suspicious_patterns.append("unusual_source_ip")
            
            # Patrón 4: Múltiples comandos de sistema
            if event.event_type == EventType.COMMAND_EXECUTION:
                recent_commands = self._count_recent_events(
                    event.user_id, EventType.COMMAND_EXECUTION, minutes=5
                )
                if recent_commands >= 10:
                    suspicious_patterns.append("command_flood")
            
            # Patrón 5: Transferencias de datos grandes
            if event.event_type == EventType.DATA_TRANSFER:
                data_size = event.metadata.get('size', 0)
                if data_size > 100 * 1024 * 1024:  # 100MB
                    suspicious_patterns.append("large_data_transfer")
            
            # Patrón 6: Escalación de privilegios
            if event.event_type == EventType.PRIVILEGE_ESCALATION:
                suspicious_patterns.append("privilege_escalation")
            
            # Patrón 7: Cambios de configuración del sistema
            if event.event_type == EventType.CONFIGURATION_CHANGE:
                if "system" in event.resource.lower() or "security" in event.resource.lower():
                    suspicious_patterns.append("system_config_change")
            
            # Patrón 8: Creación de procesos sospechosos
            if event.event_type == EventType.PROCESS_CREATION:
                process_name = event.metadata.get('process_name', '').lower()
                suspicious_processes = ['cmd', 'powershell', 'bash', 'python', 'perl']
                if any(sp in process_name for sp in suspicious_processes):
                    suspicious_patterns.append("suspicious_process_creation")
            
        except Exception as e:
            logger.error(f"Error detectando patrones sospechosos: {e}")
        
        return suspicious_patterns
    
    def _count_recent_events(self, user_id: str, event_type: EventType, 
                           result: str = None, minutes: int = 60) -> int:
        """Contar eventos recientes de un usuario"""
        try:
            cutoff_time = datetime.now() - timedelta(minutes=minutes)
            count = 0
            
            for event in self.events.values():
                if (event.user_id == user_id and 
                    event.event_type == event_type and
                    event.timestamp > cutoff_time):
                    if result is None or event.result == result:
                        count += 1
            
            return count
            
        except Exception as e:
            logger.error(f"Error contando eventos recientes: {e}")
            return 0
    
    def _is_usual_ip(self, user_id: str, ip: str) -> bool:
        """Verificar si una IP es usual para un usuario"""
        try:
            # Obtener IPs habituales del usuario
            user_ips = set()
            for event in self.events.values():
                if event.user_id == user_id and event.source_ip:
                    user_ips.add(event.source_ip)
            
            # Si es una IP nueva y el usuario tiene historial, es sospechosa
            if len(user_ips) > 3 and ip not in user_ips:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error verificando IP usual: {e}")
            return True
    
    def _calculate_risk_score(self, event: UserEvent) -> float:
        """Calcular puntuación de riesgo para un evento"""
        try:
            base_score = 0.0
            
            # Factores de riesgo por tipo de evento
            risk_factors = {
                EventType.LOGIN: 0.1,
                EventType.LOGOUT: 0.0,
                EventType.FILE_ACCESS: 0.2,
                EventType.NETWORK_CONNECTION: 0.3,
                EventType.COMMAND_EXECUTION: 0.4,
                EventType.DATA_TRANSFER: 0.5,
                EventType.SYSTEM_ACCESS: 0.6,
                EventType.PRIVILEGE_ESCALATION: 0.8,
                EventType.CONFIGURATION_CHANGE: 0.7,
                EventType.PROCESS_CREATION: 0.3
            }
            
            base_score += risk_factors.get(event.event_type, 0.1)
            
            # Factor por resultado
            if event.result == "failed":
                base_score += 0.2
            elif event.result == "denied":
                base_score += 0.3
            
            # Factor por recurso sensible
            if "admin" in event.resource.lower() or "root" in event.resource.lower():
                base_score += 0.3
            elif "sensitive" in event.resource.lower() or "confidential" in event.resource.lower():
                base_score += 0.2
            
            # Factor por hora del día
            hour = event.timestamp.hour
            if hour < 6 or hour > 22:  # Fuera de horario laboral
                base_score += 0.2
            
            # Factor por frecuencia de eventos
            recent_events = self._count_recent_events(event.user_id, event.event_type, minutes=15)
            if recent_events > 20:
                base_score += 0.3
            elif recent_events > 10:
                base_score += 0.2
            
            # Normalizar puntuación
            return min(base_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculando puntuación de riesgo: {e}")
            return 0.0
    
    def _create_behavioral_alert(self, event: UserEvent, risk_score: float, 
                               suspicious_patterns: List[str]):
        """Crear alerta comportamental"""
        try:
            alert_id = f"alert_{event.user_id}_{int(time.time())}"
            
            # Determinar tipo de alerta
            alert_type = "suspicious_behavior"
            if "privilege_escalation" in suspicious_patterns:
                alert_type = "privilege_escalation"
            elif "multiple_failed_logins" in suspicious_patterns:
                alert_type = "brute_force"
            elif "unusual_source_ip" in suspicious_patterns:
                alert_type = "unusual_access"
            
            # Determinar severidad
            severity = 5
            if risk_score > 0.9:
                severity = 10
            elif risk_score > 0.8:
                severity = 8
            elif risk_score > 0.7:
                severity = 6
            
            # Crear alerta
            alert = BehavioralAlert(
                id=alert_id,
                user_id=event.user_id,
                alert_type=alert_type,
                severity=severity,
                description=f"Comportamiento sospechoso detectado: {', '.join(suspicious_patterns)}",
                evidence=suspicious_patterns,
                timestamp=datetime.now(),
                status="new",
                risk_score=risk_score,
                confidence=min(risk_score + 0.1, 1.0),
                metadata={
                    'event_id': event.id,
                    'event_type': event.event_type.value,
                    'source_ip': event.source_ip,
                    'resource': event.resource
                }
            )
            
            # Añadir alerta
            self.alerts.append(alert)
            self.alert_queue.append(alert)
            
            # Guardar en base de datos
            self._save_alert_to_db(alert)
            
            # Actualizar métricas
            self.behavior_metrics[event.user_id]['alert_count'] += 1
            
            logger.info(f"Alerta comportamental creada: {alert_id} - Usuario: {event.user_id}")
            
        except Exception as e:
            logger.error(f"Error creando alerta comportamental: {e}")
    
    def _update_user_profile(self, event: UserEvent):
        """Actualizar perfil de usuario"""
        try:
            user_id = event.user_id
            
            if user_id not in self.profiles:
                # Crear nuevo perfil
                profile = UserProfile(
                    user_id=user_id,
                    username=event.metadata.get('username', user_id),
                    department=event.metadata.get('department', 'unknown'),
                    role=event.metadata.get('role', 'user'),
                    risk_level='low',
                    normal_patterns=[],
                    suspicious_patterns=[],
                    last_activity=event.timestamp,
                    session_count=1,
                    total_events=1,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    metadata={}
                )
                self.profiles[user_id] = profile
            else:
                # Actualizar perfil existente
                profile = self.profiles[user_id]
                profile.last_activity = event.timestamp
                profile.total_events += 1
                profile.updated_at = datetime.now()
                
                # Actualizar nivel de riesgo
                profile.risk_level = self._calculate_risk_level(user_id)
            
            # Guardar perfil en base de datos
            self._save_profile_to_db(profile)
            
        except Exception as e:
            logger.error(f"Error actualizando perfil de usuario: {e}")
    
    def _calculate_risk_level(self, user_id: str) -> str:
        """Calcular nivel de riesgo de un usuario"""
        try:
            metrics = self.behavior_metrics[user_id]
            risk_score = metrics['risk_score']
            alert_count = metrics['alert_count']
            
            if risk_score > 0.8 or alert_count > 10:
                return 'critical'
            elif risk_score > 0.6 or alert_count > 5:
                return 'high'
            elif risk_score > 0.4 or alert_count > 2:
                return 'medium'
            else:
                return 'low'
                
        except Exception as e:
            logger.error(f"Error calculando nivel de riesgo: {e}")
            return 'low'
    
    def _update_session(self, event: UserEvent):
        """Actualizar análisis de sesión"""
        try:
            session_id = event.session_id
            if not session_id:
                return
            
            if session_id not in self.sessions:
                # Crear nueva sesión
                session = SessionAnalysis(
                    session_id=session_id,
                    user_id=event.user_id,
                    start_time=event.timestamp,
                    end_time=None,
                    duration=None,
                    event_count=1,
                    unique_resources=1,
                    unique_actions=1,
                    risk_indicators=[],
                    behavior_score=0.0,
                    status="active"
                )
                self.sessions[session_id] = session
            else:
                # Actualizar sesión existente
                session = self.sessions[session_id]
                session.event_count += 1
                
                # Actualizar recursos únicos
                if event.resource not in [e.resource for e in self.events.values() if e.session_id == session_id]:
                    session.unique_resources += 1
                
                # Actualizar acciones únicas
                if event.action not in [e.action for e in self.events.values() if e.session_id == session_id]:
                    session.unique_actions += 1
                
                # Verificar timeout de sesión
                if event.timestamp - session.start_time > timedelta(seconds=self.config['session_timeout']):
                    session.status = "completed"
                    session.end_time = event.timestamp
                    session.duration = session.end_time - session.start_time
            
            # Guardar sesión en base de datos
            self._save_session_to_db(session)
            
        except Exception as e:
            logger.error(f"Error actualizando sesión: {e}")
    
    def detect_patterns(self, user_id: str = None, time_window: timedelta = None) -> List[BehaviorPattern]:
        """Detectar patrones de comportamiento"""
        try:
            if not time_window:
                time_window = timedelta(hours=1)
            
            cutoff_time = datetime.now() - time_window
            patterns = []
            
            # Filtrar eventos por usuario y tiempo
            user_events = []
            for event in self.events.values():
                if event.timestamp > cutoff_time:
                    if user_id is None or event.user_id == user_id:
                        user_events.append(event)
            
            if not user_events:
                return patterns
            
            # Agrupar eventos por tipo
            events_by_type = defaultdict(list)
            for event in user_events:
                events_by_type[event.event_type].append(event)
            
            # Detectar patrones por tipo de evento
            for event_type, events in events_by_type.items():
                if len(events) >= 3:  # Mínimo 3 eventos para considerar patrón
                    pattern = self._create_pattern_from_events(user_id or events[0].user_id, 
                                                             event_type, events)
                    if pattern:
                        patterns.append(pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error detectando patrones: {e}")
            return []
    
    def _create_pattern_from_events(self, user_id: str, event_type: EventType, 
                                  events: List[UserEvent]) -> Optional[BehaviorPattern]:
        """Crear patrón a partir de eventos"""
        try:
            if len(events) < 3:
                return None
            
            # Calcular frecuencia
            time_span = events[-1].timestamp - events[0].timestamp
            frequency = len(events) / max(time_span.total_seconds() / 3600, 1)  # eventos por hora
            
            # Determinar tipo de patrón
            pattern_type = "normal"
            if frequency > 100:  # Muy alta frecuencia
                pattern_type = "flood"
            elif frequency > 50:  # Alta frecuencia
                pattern_type = "burst"
            elif frequency < 1:  # Baja frecuencia
                pattern_type = "sparse"
            
            # Calcular confianza
            confidence = min(frequency / 10, 1.0)  # Normalizar confianza
            
            # Calcular puntuación de riesgo
            risk_score = self._calculate_pattern_risk(events)
            
            # Crear patrón
            pattern = BehaviorPattern(
                id=f"pattern_{user_id}_{event_type.value}_{int(time.time())}",
                user_id=user_id,
                pattern_type=pattern_type,
                description=f"Patrón de {event_type.value}: {len(events)} eventos en {time_span}",
                events=[e.id for e in events],
                frequency=int(frequency),
                time_window=time_span,
                confidence=confidence,
                risk_score=risk_score,
                first_seen=events[0].timestamp,
                last_seen=events[-1].timestamp,
                status="active"
            )
            
            # Guardar patrón
            self.patterns[pattern.id] = pattern
            self._save_pattern_to_db(pattern)
            
            return pattern
            
        except Exception as e:
            logger.error(f"Error creando patrón: {e}")
            return None
    
    def _calculate_pattern_risk(self, events: List[UserEvent]) -> float:
        """Calcular puntuación de riesgo de un patrón"""
        try:
            total_risk = 0.0
            
            for event in events:
                risk_score = self._calculate_risk_score(event)
                total_risk += risk_score
            
            return total_risk / len(events)
            
        except Exception as e:
            logger.error(f"Error calculando riesgo de patrón: {e}")
            return 0.0
    
    def get_user_behavior_summary(self, user_id: str) -> Dict[str, Any]:
        """Obtener resumen de comportamiento de un usuario"""
        try:
            if user_id not in self.profiles:
                return {"error": "Usuario no encontrado"}
            
            profile = self.profiles[user_id]
            metrics = self.behavior_metrics[user_id]
            
            # Obtener eventos recientes
            recent_events = [e for e in self.events.values() 
                           if e.user_id == user_id and 
                           e.timestamp > datetime.now() - timedelta(days=7)]
            
            # Obtener alertas recientes
            recent_alerts = [a for a in self.alerts 
                           if a.user_id == user_id and 
                           a.timestamp > datetime.now() - timedelta(days=7)]
            
            # Obtener patrones activos
            active_patterns = [p for p in self.patterns.values() 
                             if p.user_id == user_id and p.status == "active"]
            
            # Obtener sesiones activas
            active_sessions = [s for s in self.sessions.values() 
                             if s.user_id == user_id and s.status == "active"]
            
            return {
                'user_profile': asdict(profile),
                'metrics': dict(metrics),
                'recent_events_count': len(recent_events),
                'recent_alerts_count': len(recent_alerts),
                'active_patterns_count': len(active_patterns),
                'active_sessions_count': len(active_sessions),
                'risk_level': profile.risk_level,
                'last_activity': profile.last_activity.isoformat(),
                'total_events': profile.total_events,
                'session_count': profile.session_count
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo resumen de comportamiento: {e}")
            return {"error": str(e)}
    
    def _save_event_to_db(self, event: UserEvent):
        """Guardar evento en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO user_events 
                (id, user_id, event_type, timestamp, source_ip, destination_ip,
                 resource, action, result, metadata, session_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (event.id, event.user_id, event.event_type.value, event.timestamp.isoformat(),
                  event.source_ip, event.destination_ip, event.resource, event.action,
                  event.result, json.dumps(event.metadata), event.session_id))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando evento en DB: {e}")
    
    def _save_pattern_to_db(self, pattern: BehaviorPattern):
        """Guardar patrón en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO behavior_patterns 
                (id, user_id, pattern_type, description, events, frequency,
                 time_window, confidence, risk_score, first_seen, last_seen, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (pattern.id, pattern.user_id, pattern.pattern_type, pattern.description,
                  json.dumps(pattern.events), pattern.frequency, pattern.time_window.total_seconds(),
                  pattern.confidence, pattern.risk_score, pattern.first_seen.isoformat(),
                  pattern.last_seen.isoformat(), pattern.status))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando patrón en DB: {e}")
    
    def _save_profile_to_db(self, profile: UserProfile):
        """Guardar perfil en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO user_profiles 
                (user_id, username, department, role, risk_level, normal_patterns,
                 suspicious_patterns, last_activity, session_count, total_events,
                 created_at, updated_at, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (profile.user_id, profile.username, profile.department, profile.role,
                  profile.risk_level, json.dumps(profile.normal_patterns),
                  json.dumps(profile.suspicious_patterns), profile.last_activity.isoformat(),
                  profile.session_count, profile.total_events, profile.created_at.isoformat(),
                  profile.updated_at.isoformat(), json.dumps(profile.metadata)))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando perfil en DB: {e}")
    
    def _save_alert_to_db(self, alert: BehavioralAlert):
        """Guardar alerta en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO behavioral_alerts 
                (id, user_id, alert_type, severity, description, evidence,
                 timestamp, status, risk_score, confidence, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (alert.id, alert.user_id, alert.alert_type, alert.severity,
                  alert.description, json.dumps(alert.evidence), alert.timestamp.isoformat(),
                  alert.status, alert.risk_score, alert.confidence, json.dumps(alert.metadata)))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando alerta en DB: {e}")
    
    def _save_session_to_db(self, session: SessionAnalysis):
        """Guardar sesión en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO sessions 
                (session_id, user_id, start_time, end_time, duration, event_count,
                 unique_resources, unique_actions, risk_indicators, behavior_score, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (session.session_id, session.user_id, session.start_time.isoformat(),
                  session.end_time.isoformat() if session.end_time else None,
                  session.duration.total_seconds() if session.duration else None,
                  session.event_count, session.unique_resources, session.unique_actions,
                  json.dumps(session.risk_indicators), session.behavior_score, session.status))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando sesión en DB: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de análisis comportamental"""
        return {
            'total_events': len(self.events),
            'total_patterns': len(self.patterns),
            'total_profiles': len(self.profiles),
            'total_alerts': len(self.alerts),
            'active_sessions': len([s for s in self.sessions.values() if s.status == "active"]),
            'users_by_risk_level': {
                'low': len([p for p in self.profiles.values() if p.risk_level == 'low']),
                'medium': len([p for p in self.profiles.values() if p.risk_level == 'medium']),
                'high': len([p for p in self.profiles.values() if p.risk_level == 'high']),
                'critical': len([p for p in self.profiles.values() if p.risk_level == 'critical'])
            },
            'alerts_by_type': defaultdict(int),
            'events_by_type': defaultdict(int)
        }

# Función principal para integración con lucIA
def run_behavioral_analysis(user_data: Dict[str, Any] = None) -> str:
    """Función principal para integración con lucIA"""
    try:
        behavioral_manager = BehavioralAnalysisManager()
        
        if not user_data:
            stats = behavioral_manager.get_statistics()
            return f"Análisis comportamental activo. Eventos: {stats['total_events']}, Alertas: {stats['total_alerts']}"
        
        # Crear evento de usuario
        event = UserEvent(
            id=user_data.get('id'),
            user_id=user_data['user_id'],
            event_type=EventType(user_data['event_type']),
            timestamp=datetime.fromisoformat(user_data['timestamp']),
            source_ip=user_data.get('source_ip'),
            destination_ip=user_data.get('destination_ip'),
            resource=user_data.get('resource', ''),
            action=user_data.get('action', ''),
            result=user_data.get('result', 'success'),
            metadata=user_data.get('metadata', {}),
            session_id=user_data.get('session_id')
        )
        
        # Añadir evento
        success = behavioral_manager.add_event(event)
        
        if success:
            # Obtener resumen de comportamiento
            summary = behavioral_manager.get_user_behavior_summary(user_data['user_id'])
            return f"Evento procesado. Nivel de riesgo: {summary.get('risk_level', 'unknown')}"
        else:
            return "Error procesando evento"
    
    except Exception as e:
        return f"Error en análisis comportamental: {e}"

if __name__ == "__main__":
    # Ejemplo de uso
    test_event = {
        'user_id': 'test_user',
        'event_type': 'login',
        'timestamp': datetime.now().isoformat(),
        'source_ip': '192.168.1.100',
        'resource': '/login',
        'action': 'authenticate',
        'result': 'success',
        'metadata': {'username': 'test_user', 'department': 'IT'}
    }
    
    result = run_behavioral_analysis(test_event)
    print(result) 