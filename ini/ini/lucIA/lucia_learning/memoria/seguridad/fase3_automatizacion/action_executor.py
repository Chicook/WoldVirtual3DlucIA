#!/usr/bin/env python3
"""
action_executor.py
Ejecutor de acciones automáticas de respuesta para lucIA
Implementa aislamiento, bloqueo, notificación, rollback y otras respuestas automáticas

Funcionalidades:
- Ejecución de acciones de respuesta automática
- Aislamiento de endpoints y sistemas comprometidos
- Bloqueo de IPs, usuarios y recursos maliciosos
- Rollback de configuraciones y cambios sospechosos
- Notificaciones automáticas a equipos de seguridad
- Integración con sistemas de red y seguridad
"""

import json
import logging
import subprocess
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import threading
import time

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ActionType(Enum):
    """Tipos de acciones de respuesta"""
    ISOLATE_ENDPOINT = "isolate_endpoint"
    BLOCK_IP = "block_ip"
    BLOCK_USER = "block_user"
    QUARANTINE_FILE = "quarantine_file"
    ROLLBACK_CONFIG = "rollback_config"
    NOTIFY_TEAM = "notify_team"
    KILL_PROCESS = "kill_process"
    DISABLE_ACCOUNT = "disable_account"
    UPDATE_FIREWALL = "update_firewall"
    BACKUP_DATA = "backup_data"
    SCAN_SYSTEM = "scan_system"
    RESTART_SERVICE = "restart_service"

class ActionStatus(Enum):
    """Estados de ejecución de acciones"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"

@dataclass
class ResponseAction:
    """Acción de respuesta automática"""
    id: str
    type: ActionType
    target: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    priority: int = 5  # 1-10, donde 1 es más alta
    timeout: int = 300  # segundos
    status: ActionStatus = ActionStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

class ActionExecutor:
    """Ejecutor principal de acciones de respuesta"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.action_handlers = self._register_action_handlers()
        self.execution_queue = []
        self.running_actions = {}
        self.completed_actions = []
        self.max_concurrent_actions = self.config.get('max_concurrent_actions', 5)
        self.execution_thread = None
        self.running = False
        
        logger.info("Action Executor inicializado")
    
    def _register_action_handlers(self) -> Dict[ActionType, callable]:
        """Registrar manejadores para cada tipo de acción"""
        return {
            ActionType.ISOLATE_ENDPOINT: self._isolate_endpoint,
            ActionType.BLOCK_IP: self._block_ip,
            ActionType.BLOCK_USER: self._block_user,
            ActionType.QUARANTINE_FILE: self._quarantine_file,
            ActionType.ROLLBACK_CONFIG: self._rollback_config,
            ActionType.NOTIFY_TEAM: self._notify_team,
            ActionType.KILL_PROCESS: self._kill_process,
            ActionType.DISABLE_ACCOUNT: self._disable_account,
            ActionType.UPDATE_FIREWALL: self._update_firewall,
            ActionType.BACKUP_DATA: self._backup_data,
            ActionType.SCAN_SYSTEM: self._scan_system,
            ActionType.RESTART_SERVICE: self._restart_service
        }
    
    def execute(self, playbook: str, incident: Any) -> List[ResponseAction]:
        """Ejecutar acciones basadas en playbook e incidente"""
        try:
            # Generar acciones basadas en el playbook
            actions = self._generate_actions_from_playbook(playbook, incident)
            
            # Ordenar por prioridad
            actions.sort(key=lambda x: x.priority)
            
            # Ejecutar acciones
            executed_actions = []
            for action in actions:
                result = self._execute_action(action)
                executed_actions.append(action)
                
                # Si la acción falla y es crítica, detener ejecución
                if action.status == ActionStatus.FAILED and action.priority <= 3:
                    logger.error(f"Acción crítica falló: {action.id}")
                    break
            
            return executed_actions
            
        except Exception as e:
            logger.error(f"Error ejecutando acciones: {e}")
            return []
    
    def _generate_actions_from_playbook(self, playbook: str, incident: Any) -> List[ResponseAction]:
        """Generar acciones basadas en el playbook y tipo de incidente"""
        actions = []
        
        # Acciones comunes para todos los incidentes
        actions.append(ResponseAction(
            id=f"notify_{incident.id}",
            type=ActionType.NOTIFY_TEAM,
            target="security_team",
            parameters={
                "incident_id": incident.id,
                "severity": incident.severity.name,
                "type": incident.type.value
            },
            priority=1
        ))
        
        # Acciones específicas por tipo de incidente
        if incident.type.value == "malware":
            actions.extend(self._generate_malware_actions(incident))
        elif incident.type.value == "intrusion":
            actions.extend(self._generate_intrusion_actions(incident))
        elif incident.type.value == "data_breach":
            actions.extend(self._generate_data_breach_actions(incident))
        elif incident.type.value == "dos_attack":
            actions.extend(self._generate_dos_actions(incident))
        elif incident.type.value == "ransomware":
            actions.extend(self._generate_ransomware_actions(incident))
        
        return actions
    
    def _generate_malware_actions(self, incident: Any) -> List[ResponseAction]:
        """Generar acciones para incidentes de malware"""
        actions = []
        
        # Aislar endpoint si está especificado
        if incident.affected_assets:
            for asset in incident.affected_assets:
                if "endpoint" in asset.lower() or "host" in asset.lower():
                    actions.append(ResponseAction(
                        id=f"isolate_{asset}_{incident.id}",
                        type=ActionType.ISOLATE_ENDPOINT,
                        target=asset,
                        priority=2
                    ))
        
        # Cuarentena archivos si están especificados
        if incident.evidence.get('details', {}).get('file'):
            file_path = incident.evidence['details']['file']
            actions.append(ResponseAction(
                id=f"quarantine_{incident.id}",
                type=ActionType.QUARANTINE_FILE,
                target=file_path,
                priority=2
            ))
        
        # Matar procesos sospechosos
        actions.append(ResponseAction(
            id=f"kill_malware_{incident.id}",
            type=ActionType.KILL_PROCESS,
            target="malware_processes",
            parameters={"pattern": "malware|suspicious"},
            priority=3
        ))
        
        # Escanear sistema
        actions.append(ResponseAction(
            id=f"scan_{incident.id}",
            type=ActionType.SCAN_SYSTEM,
            target=incident.source,
            priority=4
        ))
        
        return actions
    
    def _generate_intrusion_actions(self, incident: Any) -> List[ResponseAction]:
        """Generar acciones para intrusiones"""
        actions = []
        
        # Bloquear IPs sospechosas
        if incident.evidence.get('source_ip'):
            actions.append(ResponseAction(
                id=f"block_ip_{incident.id}",
                type=ActionType.BLOCK_IP,
                target=incident.evidence['source_ip'],
                priority=2
            ))
        
        # Bloquear usuario si está comprometido
        if incident.evidence.get('details', {}).get('user'):
            user = incident.evidence['details']['user']
            actions.append(ResponseAction(
                id=f"block_user_{incident.id}",
                type=ActionType.BLOCK_USER,
                target=user,
                priority=3
            ))
        
        # Actualizar firewall
        actions.append(ResponseAction(
            id=f"firewall_{incident.id}",
            type=ActionType.UPDATE_FIREWALL,
            target="intrusion_rules",
            parameters={"incident_type": "intrusion"},
            priority=3
        ))
        
        return actions
    
    def _generate_data_breach_actions(self, incident: Any) -> List[ResponseAction]:
        """Generar acciones para brechas de datos"""
        actions = []
        
        # Backup de datos críticos
        actions.append(ResponseAction(
            id=f"backup_{incident.id}",
            type=ActionType.BACKUP_DATA,
            target="critical_data",
            priority=1
        ))
        
        # Aislar sistemas afectados
        for asset in incident.affected_assets:
            actions.append(ResponseAction(
                id=f"isolate_breach_{asset}_{incident.id}",
                type=ActionType.ISOLATE_ENDPOINT,
                target=asset,
                priority=2
            ))
        
        # Deshabilitar cuentas comprometidas
        if incident.evidence.get('details', {}).get('user'):
            user = incident.evidence['details']['user']
            actions.append(ResponseAction(
                id=f"disable_{incident.id}",
                type=ActionType.DISABLE_ACCOUNT,
                target=user,
                priority=2
            ))
        
        return actions
    
    def _generate_dos_actions(self, incident: Any) -> List[ResponseAction]:
        """Generar acciones para ataques DoS"""
        actions = []
        
        # Bloquear IPs de ataque
        if incident.evidence.get('source_ip'):
            actions.append(ResponseAction(
                id=f"block_dos_{incident.id}",
                type=ActionType.BLOCK_IP,
                target=incident.evidence['source_ip'],
                priority=1
            ))
        
        # Actualizar reglas de firewall
        actions.append(ResponseAction(
            id=f"firewall_dos_{incident.id}",
            type=ActionType.UPDATE_FIREWALL,
            target="dos_protection",
            parameters={"rate_limit": True},
            priority=2
        ))
        
        # Reiniciar servicios si es necesario
        actions.append(ResponseAction(
            id=f"restart_dos_{incident.id}",
            type=ActionType.RESTART_SERVICE,
            target="web_services",
            priority=3
        ))
        
        return actions
    
    def _generate_ransomware_actions(self, incident: Any) -> List[ResponseAction]:
        """Generar acciones para ransomware"""
        actions = []
        
        # Aislar inmediatamente
        for asset in incident.affected_assets:
            actions.append(ResponseAction(
                id=f"isolate_ransomware_{asset}_{incident.id}",
                type=ActionType.ISOLATE_ENDPOINT,
                target=asset,
                priority=1
            ))
        
        # Backup de datos no afectados
        actions.append(ResponseAction(
            id=f"backup_ransomware_{incident.id}",
            type=ActionType.BACKUP_DATA,
            target="unaffected_data",
            priority=1
        ))
        
        # Matar procesos de ransomware
        actions.append(ResponseAction(
            id=f"kill_ransomware_{incident.id}",
            type=ActionType.KILL_PROCESS,
            target="ransomware_processes",
            parameters={"pattern": "encrypt|ransom"},
            priority=2
        ))
        
        # Rollback de cambios recientes
        actions.append(ResponseAction(
            id=f"rollback_ransomware_{incident.id}",
            type=ActionType.ROLLBACK_CONFIG,
            target="recent_changes",
            priority=2
        ))
        
        return actions
    
    def _execute_action(self, action: ResponseAction) -> bool:
        """Ejecutar una acción específica"""
        try:
            action.status = ActionStatus.RUNNING
            action.started_at = datetime.now()
            
            # Obtener manejador de la acción
            handler = self.action_handlers.get(action.type)
            if not handler:
                raise ValueError(f"No hay manejador para acción: {action.type}")
            
            # Ejecutar acción
            result = handler(action.target, action.parameters)
            
            action.status = ActionStatus.COMPLETED
            action.result = result
            action.completed_at = datetime.now()
            
            logger.info(f"Acción completada: {action.id} - {action.type.value}")
            return True
            
        except Exception as e:
            action.status = ActionStatus.FAILED
            action.error_message = str(e)
            action.completed_at = datetime.now()
            
            logger.error(f"Error ejecutando acción {action.id}: {e}")
            return False
    
    def _isolate_endpoint(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Aislar endpoint de la red"""
        try:
            # Simular aislamiento de endpoint
            logger.info(f"Aislando endpoint: {target}")
            
            # Aquí irían las llamadas reales a APIs de red
            # Por ejemplo: firewall rules, VLAN isolation, etc.
            
            return {
                "status": "isolated",
                "method": "network_isolation",
                "target": target,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error aislando endpoint {target}: {e}")
            raise
    
    def _block_ip(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Bloquear IP maliciosa"""
        try:
            logger.info(f"Bloqueando IP: {target}")
            
            # Simular bloqueo de IP
            # Aquí irían las llamadas a firewall, IDS, etc.
            
            return {
                "status": "blocked",
                "ip": target,
                "method": "firewall_rule",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error bloqueando IP {target}: {e}")
            raise
    
    def _block_user(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Bloquear usuario sospechoso"""
        try:
            logger.info(f"Bloqueando usuario: {target}")
            
            # Simular bloqueo de usuario
            # Aquí irían las llamadas a sistemas de autenticación
            
            return {
                "status": "blocked",
                "user": target,
                "method": "account_lockout",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error bloqueando usuario {target}: {e}")
            raise
    
    def _quarantine_file(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Poner archivo en cuarentena"""
        try:
            logger.info(f"Poniendo en cuarentena: {target}")
            
            # Simular cuarentena de archivo
            # Aquí irían las llamadas al sistema de archivos
            
            return {
                "status": "quarantined",
                "file": target,
                "method": "file_quarantine",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error poniendo en cuarentena {target}: {e}")
            raise
    
    def _rollback_config(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Hacer rollback de configuración"""
        try:
            logger.info(f"Haciendo rollback: {target}")
            
            # Simular rollback de configuración
            # Aquí irían las llamadas a sistemas de configuración
            
            return {
                "status": "rolled_back",
                "target": target,
                "method": "config_restore",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error haciendo rollback {target}: {e}")
            raise
    
    def _notify_team(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Notificar al equipo de seguridad"""
        try:
            logger.info(f"Notificando equipo: {target}")
            
            # Simular notificación
            # Aquí irían las llamadas a sistemas de notificación
            
            return {
                "status": "notified",
                "team": target,
                "method": "email_slack",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error notificando equipo {target}: {e}")
            raise
    
    def _kill_process(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Matar procesos sospechosos"""
        try:
            logger.info(f"Matando procesos: {target}")
            
            # Simular terminación de procesos
            # Aquí irían las llamadas al sistema operativo
            
            return {
                "status": "terminated",
                "target": target,
                "method": "process_kill",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error matando procesos {target}: {e}")
            raise
    
    def _disable_account(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Deshabilitar cuenta de usuario"""
        try:
            logger.info(f"Deshabilitando cuenta: {target}")
            
            # Simular deshabilitación de cuenta
            # Aquí irían las llamadas a sistemas de autenticación
            
            return {
                "status": "disabled",
                "account": target,
                "method": "account_disable",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error deshabilitando cuenta {target}: {e}")
            raise
    
    def _update_firewall(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Actualizar reglas de firewall"""
        try:
            logger.info(f"Actualizando firewall: {target}")
            
            # Simular actualización de firewall
            # Aquí irían las llamadas a sistemas de firewall
            
            return {
                "status": "updated",
                "target": target,
                "method": "firewall_update",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error actualizando firewall {target}: {e}")
            raise
    
    def _backup_data(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Hacer backup de datos críticos"""
        try:
            logger.info(f"Haciendo backup: {target}")
            
            # Simular backup de datos
            # Aquí irían las llamadas a sistemas de backup
            
            return {
                "status": "backed_up",
                "target": target,
                "method": "data_backup",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error haciendo backup {target}: {e}")
            raise
    
    def _scan_system(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Escanear sistema en busca de amenazas"""
        try:
            logger.info(f"Escaneando sistema: {target}")
            
            # Simular escaneo de sistema
            # Aquí irían las llamadas a herramientas de escaneo
            
            return {
                "status": "scanned",
                "target": target,
                "method": "system_scan",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error escaneando sistema {target}: {e}")
            raise
    
    def _restart_service(self, target: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Reiniciar servicio"""
        try:
            logger.info(f"Reiniciando servicio: {target}")
            
            # Simular reinicio de servicio
            # Aquí irían las llamadas al sistema de servicios
            
            return {
                "status": "restarted",
                "target": target,
                "method": "service_restart",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error reiniciando servicio {target}: {e}")
            raise

# Función de integración con lucIA
def execute_response_actions(playbook: str, incident_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Función principal para integración con lucIA"""
    try:
        executor = ActionExecutor()
        
        # Crear objeto incidente simulado
        class MockIncident:
            def __init__(self, data):
                self.id = data.get('id', 'inc_001')
                self.type = type('MockType', (), {'value': data.get('type', 'malware')})()
                self.severity = type('MockSeverity', (), {'name': data.get('severity', 'HIGH')})()
                self.affected_assets = data.get('affected_assets', [])
                self.evidence = data.get('evidence', {})
                self.source = data.get('source', 'unknown')
        
        incident = MockIncident(incident_data)
        
        # Ejecutar acciones
        actions = executor.execute(playbook, incident)
        
        # Convertir a formato de diccionario
        return [
            {
                'id': action.id,
                'type': action.type.value,
                'target': action.target,
                'status': action.status.value,
                'result': action.result,
                'error': action.error_message
            }
            for action in actions
        ]
        
    except Exception as e:
        logger.error(f"Error ejecutando acciones de respuesta: {e}")
        return []

if __name__ == "__main__":
    # Ejemplo de uso
    test_incident = {
        'id': 'inc_001',
        'type': 'malware',
        'severity': 'HIGH',
        'source': 'endpoint_42',
        'affected_assets': ['endpoint_42'],
        'evidence': {
            'source_ip': '192.168.1.100',
            'details': {
                'file': 'malware.exe',
                'user': 'alice'
            }
        }
    }
    
    results = execute_response_actions('malware_response', test_incident)
    print("Acciones ejecutadas:", results) 