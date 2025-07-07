#!/usr/bin/env python3
"""
playbook_engine.py
Motor de playbooks de respuesta automatizada para lucIA
Gestiona flujos de decisión automáticos y selección de playbooks basados en incidentes

Funcionalidades:
- Selección automática de playbooks basada en tipo de incidente
- Gestión de flujos de decisión y lógica condicional
- Coordinación de acciones secuenciales y paralelas
- Integración con threat intelligence para contexto
- Aprendizaje automático de efectividad de playbooks
- Personalización de playbooks por organización
"""

import json
import logging
import yaml
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict
import re

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlaybookType(Enum):
    """Tipos de playbooks"""
    MALWARE_RESPONSE = "malware_response"
    INTRUSION_RESPONSE = "intrusion_response"
    DATA_BREACH_RESPONSE = "data_breach_response"
    DOS_RESPONSE = "dos_response"
    PHISHING_RESPONSE = "phishing_response"
    RANSOMWARE_RESPONSE = "ransomware_response"
    INSIDER_THREAT_RESPONSE = "insider_threat_response"
    PRIVILEGE_ESCALATION_RESPONSE = "privilege_escalation_response"
    APT_RESPONSE = "apt_response"
    GENERAL_RESPONSE = "general_response"

class ConditionType(Enum):
    """Tipos de condiciones para playbooks"""
    SEVERITY_GREATER_THAN = "severity_greater_than"
    SEVERITY_LESS_THAN = "severity_less_than"
    ASSET_CRITICALITY = "asset_criticality"
    TIME_OF_DAY = "time_of_day"
    USER_ROLE = "user_role"
    THREAT_INTEL_MATCH = "threat_intel_match"
    BEHAVIORAL_ANOMALY = "behavioral_anomaly"
    CUSTOM_RULE = "custom_rule"

@dataclass
class PlaybookCondition:
    """Condición para ejecución de playbook"""
    type: ConditionType
    parameter: str
    value: Any
    operator: str = "equals"  # equals, greater_than, less_than, contains, regex

@dataclass
class PlaybookStep:
    """Paso de un playbook"""
    id: str
    name: str
    action_type: str
    target: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    conditions: List[PlaybookCondition] = field(default_factory=list)
    timeout: int = 300
    retry_count: int = 3
    parallel: bool = False
    required: bool = True

@dataclass
class Playbook:
    """Definición de un playbook"""
    id: str
    name: str
    description: str
    type: PlaybookType
    version: str
    author: str
    created_at: datetime
    updated_at: datetime
    steps: List[PlaybookStep] = field(default_factory=list)
    conditions: List[PlaybookCondition] = field(default_factory=list)
    priority: int = 5
    enabled: bool = True
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PlaybookExecution:
    """Ejecución de un playbook"""
    id: str
    playbook_id: str
    incident_id: str
    status: str  # running, completed, failed, cancelled
    start_time: datetime
    end_time: Optional[datetime] = None
    steps_completed: List[str] = field(default_factory=list)
    steps_failed: List[str] = field(default_factory=list)
    results: Dict[str, Any] = field(default_factory=dict)
    error_message: Optional[str] = None

class PlaybookEngine:
    """Motor principal de playbooks"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.playbooks: Dict[str, Playbook] = {}
        self.executions: Dict[str, PlaybookExecution] = {}
        self.playbook_templates = self._load_playbook_templates()
        self.execution_history = defaultdict(list)
        
        # Cargar playbooks por defecto
        self._load_default_playbooks()
        
        logger.info("Playbook Engine inicializado")
    
    def _load_playbook_templates(self) -> Dict[str, Dict[str, Any]]:
        """Cargar plantillas de playbooks"""
        return {
            "malware_response": {
                "name": "Respuesta a Malware",
                "description": "Playbook para responder a incidentes de malware",
                "steps": [
                    {
                        "id": "notify_team",
                        "name": "Notificar Equipo",
                        "action_type": "notify_team",
                        "target": "security_team",
                        "required": True
                    },
                    {
                        "id": "isolate_endpoint",
                        "name": "Aislar Endpoint",
                        "action_type": "isolate_endpoint",
                        "target": "affected_endpoint",
                        "required": True
                    },
                    {
                        "id": "quarantine_file",
                        "name": "Cuarentena Archivo",
                        "action_type": "quarantine_file",
                        "target": "malware_file",
                        "required": False
                    },
                    {
                        "id": "scan_system",
                        "name": "Escanear Sistema",
                        "action_type": "scan_system",
                        "target": "affected_system",
                        "required": False
                    }
                ]
            },
            "intrusion_response": {
                "name": "Respuesta a Intrusión",
                "description": "Playbook para responder a intrusiones",
                "steps": [
                    {
                        "id": "notify_team",
                        "name": "Notificar Equipo",
                        "action_type": "notify_team",
                        "target": "security_team",
                        "required": True
                    },
                    {
                        "id": "block_ip",
                        "name": "Bloquear IP",
                        "action_type": "block_ip",
                        "target": "source_ip",
                        "required": True
                    },
                    {
                        "id": "update_firewall",
                        "name": "Actualizar Firewall",
                        "action_type": "update_firewall",
                        "target": "intrusion_rules",
                        "required": False
                    }
                ]
            },
            "ransomware_response": {
                "name": "Respuesta a Ransomware",
                "description": "Playbook para responder a ransomware",
                "steps": [
                    {
                        "id": "notify_team",
                        "name": "Notificar Equipo",
                        "action_type": "notify_team",
                        "target": "security_team",
                        "required": True
                    },
                    {
                        "id": "isolate_endpoint",
                        "name": "Aislar Endpoint",
                        "action_type": "isolate_endpoint",
                        "target": "affected_endpoint",
                        "required": True
                    },
                    {
                        "id": "backup_data",
                        "name": "Backup de Datos",
                        "action_type": "backup_data",
                        "target": "unaffected_data",
                        "required": True
                    },
                    {
                        "id": "kill_process",
                        "name": "Matar Procesos",
                        "action_type": "kill_process",
                        "target": "ransomware_processes",
                        "required": True
                    },
                    {
                        "id": "rollback_config",
                        "name": "Rollback Configuración",
                        "action_type": "rollback_config",
                        "target": "recent_changes",
                        "required": False
                    }
                ]
            },
            "data_breach_response": {
                "name": "Respuesta a Brecha de Datos",
                "description": "Playbook para responder a brechas de datos",
                "steps": [
                    {
                        "id": "notify_team",
                        "name": "Notificar Equipo",
                        "action_type": "notify_team",
                        "target": "security_team",
                        "required": True
                    },
                    {
                        "id": "backup_data",
                        "name": "Backup de Datos",
                        "action_type": "backup_data",
                        "target": "critical_data",
                        "required": True
                    },
                    {
                        "id": "isolate_systems",
                        "name": "Aislar Sistemas",
                        "action_type": "isolate_endpoint",
                        "target": "affected_systems",
                        "required": True
                    },
                    {
                        "id": "disable_accounts",
                        "name": "Deshabilitar Cuentas",
                        "action_type": "disable_account",
                        "target": "compromised_accounts",
                        "required": False
                    }
                ]
            }
        }
    
    def _load_default_playbooks(self):
        """Cargar playbooks por defecto"""
        for playbook_id, template in self.playbook_templates.items():
            playbook = self._create_playbook_from_template(playbook_id, template)
            self.playbooks[playbook_id] = playbook
    
    def _create_playbook_from_template(self, playbook_id: str, template: Dict[str, Any]) -> Playbook:
        """Crear playbook desde plantilla"""
        steps = []
        for step_data in template.get('steps', []):
            step = PlaybookStep(
                id=step_data['id'],
                name=step_data['name'],
                action_type=step_data['action_type'],
                target=step_data['target'],
                parameters=step_data.get('parameters', {}),
                required=step_data.get('required', True)
            )
            steps.append(step)
        
        return Playbook(
            id=playbook_id,
            name=template['name'],
            description=template['description'],
            type=PlaybookType(playbook_id),
            version="1.0.0",
            author="lucIA System",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            steps=steps,
            enabled=True
        )
    
    def select_playbook(self, incident: Any) -> str:
        """Seleccionar playbook apropiado para un incidente"""
        try:
            # Mapeo directo por tipo de incidente
            incident_type = incident.type.value
            
            playbook_mapping = {
                "malware": "malware_response",
                "intrusion": "intrusion_response",
                "data_breach": "data_breach_response",
                "dos_attack": "dos_response",
                "phishing": "phishing_response",
                "ransomware": "ransomware_response",
                "insider_threat": "insider_threat_response",
                "privilege_escalation": "privilege_escalation_response",
                "apt": "apt_response"
            }
            
            # Buscar playbook específico
            if incident_type in playbook_mapping:
                playbook_id = playbook_mapping[incident_type]
                if playbook_id in self.playbooks and self.playbooks[playbook_id].enabled:
                    return playbook_id
            
            # Si no hay playbook específico, usar general
            if "general_response" in self.playbooks:
                return "general_response"
            
            # Fallback al primer playbook disponible
            for playbook_id, playbook in self.playbooks.items():
                if playbook.enabled:
                    return playbook_id
            
            return "malware_response"  # Fallback por defecto
            
        except Exception as e:
            logger.error(f"Error seleccionando playbook: {e}")
            return "malware_response"
    
    def create_playbook(self, playbook_data: Dict[str, Any]) -> str:
        """Crear nuevo playbook personalizado"""
        try:
            playbook_id = playbook_data.get('id', f"custom_{int(datetime.now().timestamp())}")
            
            # Crear pasos
            steps = []
            for step_data in playbook_data.get('steps', []):
                step = PlaybookStep(
                    id=step_data['id'],
                    name=step_data['name'],
                    action_type=step_data['action_type'],
                    target=step_data['target'],
                    parameters=step_data.get('parameters', {}),
                    required=step_data.get('required', True)
                )
                steps.append(step)
            
            # Crear playbook
            playbook = Playbook(
                id=playbook_id,
                name=playbook_data['name'],
                description=playbook_data.get('description', ''),
                type=PlaybookType(playbook_data.get('type', 'general_response')),
                version=playbook_data.get('version', '1.0.0'),
                author=playbook_data.get('author', 'lucIA User'),
                created_at=datetime.now(),
                updated_at=datetime.now(),
                steps=steps,
                enabled=playbook_data.get('enabled', True),
                tags=playbook_data.get('tags', [])
            )
            
            self.playbooks[playbook_id] = playbook
            logger.info(f"Playbook creado: {playbook_id}")
            
            return playbook_id
            
        except Exception as e:
            logger.error(f"Error creando playbook: {e}")
            raise
    
    def update_playbook(self, playbook_id: str, updates: Dict[str, Any]) -> bool:
        """Actualizar playbook existente"""
        try:
            if playbook_id not in self.playbooks:
                raise ValueError(f"Playbook no encontrado: {playbook_id}")
            
            playbook = self.playbooks[playbook_id]
            
            # Actualizar campos
            for field, value in updates.items():
                if hasattr(playbook, field):
                    setattr(playbook, field, value)
            
            playbook.updated_at = datetime.now()
            
            logger.info(f"Playbook actualizado: {playbook_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error actualizando playbook: {e}")
            return False
    
    def delete_playbook(self, playbook_id: str) -> bool:
        """Eliminar playbook"""
        try:
            if playbook_id not in self.playbooks:
                return False
            
            del self.playbooks[playbook_id]
            logger.info(f"Playbook eliminado: {playbook_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error eliminando playbook: {e}")
            return False
    
    def get_playbook(self, playbook_id: str) -> Optional[Playbook]:
        """Obtener playbook por ID"""
        return self.playbooks.get(playbook_id)
    
    def list_playbooks(self, enabled_only: bool = False) -> List[Dict[str, Any]]:
        """Listar playbooks disponibles"""
        playbooks = []
        
        for playbook_id, playbook in self.playbooks.items():
            if enabled_only and not playbook.enabled:
                continue
            
            playbooks.append({
                'id': playbook_id,
                'name': playbook.name,
                'description': playbook.description,
                'type': playbook.type.value,
                'version': playbook.version,
                'enabled': playbook.enabled,
                'steps_count': len(playbook.steps),
                'created_at': playbook.created_at.isoformat(),
                'updated_at': playbook.updated_at.isoformat()
            })
        
        return playbooks
    
    def execute_playbook(self, playbook_id: str, incident: Any) -> PlaybookExecution:
        """Ejecutar un playbook completo"""
        try:
            if playbook_id not in self.playbooks:
                raise ValueError(f"Playbook no encontrado: {playbook_id}")
            
            playbook = self.playbooks[playbook_id]
            
            # Crear ejecución
            execution_id = f"exec_{playbook_id}_{incident.id}_{int(datetime.now().timestamp())}"
            execution = PlaybookExecution(
                id=execution_id,
                playbook_id=playbook_id,
                incident_id=incident.id,
                status="running",
                start_time=datetime.now()
            )
            
            self.executions[execution_id] = execution
            
            # Ejecutar pasos
            for step in playbook.steps:
                try:
                    # Verificar condiciones
                    if not self._evaluate_step_conditions(step, incident):
                        logger.info(f"Paso {step.id} omitido por condiciones")
                        continue
                    
                    # Ejecutar paso
                    result = self._execute_step(step, incident)
                    
                    if result:
                        execution.steps_completed.append(step.id)
                        execution.results[step.id] = result
                    else:
                        execution.steps_failed.append(step.id)
                        
                        # Si el paso es requerido, detener ejecución
                        if step.required:
                            execution.status = "failed"
                            execution.error_message = f"Paso requerido falló: {step.id}"
                            break
                
                except Exception as e:
                    logger.error(f"Error ejecutando paso {step.id}: {e}")
                    execution.steps_failed.append(step.id)
                    
                    if step.required:
                        execution.status = "failed"
                        execution.error_message = str(e)
                        break
            
            # Finalizar ejecución
            if execution.status == "running":
                execution.status = "completed"
            
            execution.end_time = datetime.now()
            
            # Guardar en historial
            self.execution_history[playbook_id].append(execution)
            
            logger.info(f"Playbook ejecutado: {playbook_id} - Estado: {execution.status}")
            
            return execution
            
        except Exception as e:
            logger.error(f"Error ejecutando playbook: {e}")
            raise
    
    def _evaluate_step_conditions(self, step: PlaybookStep, incident: Any) -> bool:
        """Evaluar condiciones de un paso"""
        try:
            for condition in step.conditions:
                if not self._evaluate_condition(condition, incident):
                    return False
            return True
            
        except Exception as e:
            logger.error(f"Error evaluando condiciones: {e}")
            return True  # Por defecto, permitir ejecución
    
    def _evaluate_condition(self, condition: PlaybookCondition, incident: Any) -> bool:
        """Evaluar una condición específica"""
        try:
            if condition.type == ConditionType.SEVERITY_GREATER_THAN:
                return incident.severity.value > int(condition.value)
            
            elif condition.type == ConditionType.SEVERITY_LESS_THAN:
                return incident.severity.value < int(condition.value)
            
            elif condition.type == ConditionType.ASSET_CRITICALITY:
                # Verificar si algún activo afectado tiene la criticidad especificada
                for asset in incident.affected_assets:
                    if condition.value in asset.lower():
                        return True
                return False
            
            elif condition.type == ConditionType.TIME_OF_DAY:
                hour = incident.timestamp.hour
                if condition.value == "business_hours":
                    return 6 <= hour <= 22
                elif condition.value == "after_hours":
                    return hour < 6 or hour > 22
            
            elif condition.type == ConditionType.USER_ROLE:
                # Verificar rol de usuario en evidencia
                user_info = incident.evidence.get('details', {}).get('user_info', {})
                return user_info.get('role') == condition.value
            
            elif condition.type == ConditionType.THREAT_INTEL_MATCH:
                # Verificar si hay coincidencias en threat intelligence
                indicators = incident.indicators
                return any(condition.value in indicator for indicator in indicators)
            
            elif condition.type == ConditionType.BEHAVIORAL_ANOMALY:
                # Verificar si hay anomalías comportamentales
                return incident.confidence > float(condition.value)
            
            elif condition.type == ConditionType.CUSTOM_RULE:
                # Evaluar regla personalizada
                return self._evaluate_custom_rule(condition.parameter, incident)
            
            return True
            
        except Exception as e:
            logger.error(f"Error evaluando condición: {e}")
            return True
    
    def _evaluate_custom_rule(self, rule: str, incident: Any) -> bool:
        """Evaluar regla personalizada"""
        try:
            # Implementar lógica para reglas personalizadas
            # Por ahora, retornar True
            return True
            
        except Exception as e:
            logger.error(f"Error evaluando regla personalizada: {e}")
            return True
    
    def _execute_step(self, step: PlaybookStep, incident: Any) -> Optional[Dict[str, Any]]:
        """Ejecutar un paso del playbook"""
        try:
            # Simular ejecución de paso
            logger.info(f"Ejecutando paso: {step.name} ({step.action_type})")
            
            # Aquí se integraría con el ActionExecutor
            result = {
                "step_id": step.id,
                "action_type": step.action_type,
                "target": step.target,
                "status": "completed",
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error ejecutando paso {step.id}: {e}")
            return None
    
    def get_execution_history(self, playbook_id: str = None) -> List[Dict[str, Any]]:
        """Obtener historial de ejecuciones"""
        history = []
        
        if playbook_id:
            executions = self.execution_history.get(playbook_id, [])
        else:
            executions = []
            for exec_list in self.execution_history.values():
                executions.extend(exec_list)
        
        for execution in executions:
            history.append({
                'id': execution.id,
                'playbook_id': execution.playbook_id,
                'incident_id': execution.incident_id,
                'status': execution.status,
                'start_time': execution.start_time.isoformat(),
                'end_time': execution.end_time.isoformat() if execution.end_time else None,
                'steps_completed': len(execution.steps_completed),
                'steps_failed': len(execution.steps_failed),
                'error_message': execution.error_message
            })
        
        return history
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de playbooks"""
        total_playbooks = len(self.playbooks)
        enabled_playbooks = len([p for p in self.playbooks.values() if p.enabled])
        
        total_executions = sum(len(execs) for execs in self.execution_history.values())
        successful_executions = sum(
            len([e for e in execs if e.status == "completed"])
            for execs in self.execution_history.values()
        )
        
        return {
            'total_playbooks': total_playbooks,
            'enabled_playbooks': enabled_playbooks,
            'total_executions': total_executions,
            'successful_executions': successful_executions,
            'success_rate': (successful_executions / total_executions * 100) if total_executions > 0 else 0,
            'playbooks_by_type': defaultdict(int)
        }

# Función de integración con lucIA
def select_automation_playbook(incident_data: Dict[str, Any]) -> str:
    """Función principal para integración con lucIA"""
    try:
        engine = PlaybookEngine()
        
        # Crear objeto incidente simulado
        class MockIncident:
            def __init__(self, data):
                self.id = data.get('id', 'inc_001')
                self.type = type('MockType', (), {'value': data.get('type', 'malware')})()
                self.severity = type('MockSeverity', (), {'value': data.get('severity', 8)})()
                self.affected_assets = data.get('affected_assets', [])
                self.evidence = data.get('evidence', {})
                self.indicators = data.get('indicators', [])
                self.confidence = data.get('confidence', 0.8)
                self.timestamp = datetime.fromisoformat(data.get('timestamp', datetime.now().isoformat()))
        
        incident = MockIncident(incident_data)
        
        # Seleccionar playbook
        playbook_id = engine.select_playbook(incident)
        
        return playbook_id
        
    except Exception as e:
        logger.error(f"Error seleccionando playbook: {e}")
        return "malware_response"

if __name__ == "__main__":
    # Ejemplo de uso
    test_incident = {
        'id': 'inc_001',
        'type': 'ransomware',
        'severity': 10,
        'affected_assets': ['endpoint_42'],
        'evidence': {
            'details': {
                'file': 'ransomware.exe',
                'user': 'alice'
            }
        },
        'indicators': ['malware_hash_123'],
        'confidence': 0.9,
        'timestamp': datetime.now().isoformat()
    }
    
    playbook = select_automation_playbook(test_incident)
    print("Playbook seleccionado:", playbook) 