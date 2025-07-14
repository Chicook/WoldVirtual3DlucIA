#!/usr/bin/env python3
"""
response_automation_manager.py
Orquestador principal de automatización de respuesta para lucIA
Coordina la detección de incidentes, ejecución de acciones, playbooks, remediación, notificaciones e integración SOAR.

Estructura modular:
- incident_detector.py: Detección y clasificación de incidentes
- action_executor.py: Ejecución de acciones automáticas
- playbook_engine.py: Motor de playbooks y lógica de decisión
- remediation_manager.py: Auto-remediación y restauración
- notifier.py: Notificación y comunicación
- soar_connector.py: Integración con SOAR y sistemas externos

Este orquestador es el punto de entrada y coordinación de todo el sistema de respuesta automatizada.
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

# Importar submódulos (se asume que existen en el mismo directorio)
from .incident_detector import IncidentDetector, Incident
from .action_executor import ActionExecutor, ResponseAction
from .playbook_engine import PlaybookEngine
from .remediation_manager import RemediationManager
from .notifier import Notifier
from .soar_connector import SOARConnector

@dataclass
class AutomationContext:
    """Contexto de automatización para compartir información entre módulos"""
    incident: Optional[Incident]
    actions: list
    playbook: Optional[str]
    remediation_status: Optional[str]
    notifications: list
    soar_ticket: Optional[str]
    timestamp: datetime

class ResponseAutomationManager:
    """Orquestador principal de automatización de respuesta"""
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.incident_detector = IncidentDetector(self.config.get('incident_detector'))
        self.action_executor = ActionExecutor(self.config.get('action_executor'))
        self.playbook_engine = PlaybookEngine(self.config.get('playbook_engine'))
        self.remediation_manager = RemediationManager(self.config.get('remediation_manager'))
        self.notifier = Notifier(self.config.get('notifier'))
        self.soar_connector = SOARConnector(self.config.get('soar_connector'))

    def handle_event(self, event: Dict[str, Any]) -> AutomationContext:
        """Procesa un evento de seguridad y coordina la respuesta automatizada"""
        # 1. Detección de incidente
        incident = self.incident_detector.detect(event)
        if not incident:
            return AutomationContext(
                incident=None, actions=[], playbook=None, remediation_status=None,
                notifications=[], soar_ticket=None, timestamp=datetime.now()
            )
        # 2. Selección de playbook
        playbook = self.playbook_engine.select_playbook(incident)
        # 3. Ejecución de acciones
        actions = self.action_executor.execute(playbook, incident)
        # 4. Auto-remediación
        remediation_status = self.remediation_manager.remediate(incident, actions)
        # 5. Notificación
        notifications = self.notifier.notify(incident, actions, remediation_status)
        # 6. Integración SOAR
        soar_ticket = self.soar_connector.create_ticket(incident, actions, remediation_status)
        # 7. Retornar contexto completo
        return AutomationContext(
            incident=incident,
            actions=actions,
            playbook=playbook,
            remediation_status=remediation_status,
            notifications=notifications,
            soar_ticket=soar_ticket,
            timestamp=datetime.now()
        )

if __name__ == "__main__":
    # Ejemplo de uso
    manager = ResponseAutomationManager()
    ejemplo_evento = {
        'type': 'malware_detected',
        'source': 'endpoint_42',
        'severity': 8,
        'details': {'file': 'ransomware.exe', 'user': 'alice'},
        'timestamp': datetime.now().isoformat()
    }
    resultado = manager.handle_event(ejemplo_evento)
    print("Incidente:", resultado.incident)
    print("Acciones ejecutadas:", resultado.actions)
    print("Playbook:", resultado.playbook)
    print("Remediación:", resultado.remediation_status)
    print("Notificaciones:", resultado.notifications)
    print("Ticket SOAR:", resultado.soar_ticket)
