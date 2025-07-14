#!/usr/bin/env python3
"""
soar_connector.py
Conector SOAR para integración con plataformas externas de lucIA
Integra con SOAR, SIEM, ticketing y herramientas de seguridad externas

Funcionalidades:
- Integración con plataformas SOAR (Splunk, IBM QRadar, etc.)
- Conexión con sistemas de ticketing (Jira, ServiceNow, etc.)
- Integración con SIEM (ELK Stack, Splunk, etc.)
- Automatización de flujos de trabajo
- Sincronización de incidentes y casos
- Envío de datos a herramientas de análisis
- Integración con APIs de seguridad externas
"""

import json
import logging
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
import threading
import time
import hashlib

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SOARPlatform(Enum):
    """Plataformas SOAR soportadas"""
    SPLUNK_SOAR = "splunk_soar"
    IBM_QRADAR = "ibm_qradar"
    MICROSOFT_SENTINEL = "microsoft_sentinel"
    PALO_ALTO_CORTEX = "palo_alto_cortex"
    DEMISTO = "demisto"
    CUSTOM = "custom"

class TicketSystem(Enum):
    """Sistemas de ticketing soportados"""
    JIRA = "jira"
    SERVICENOW = "servicenow"
    ZENDESK = "zendesk"
    FRESHDESK = "freshdesk"
    CUSTOM = "custom"

class SIEMPlatform(Enum):
    """Plataformas SIEM soportadas"""
    SPLUNK = "splunk"
    ELK_STACK = "elk_stack"
    IBM_QRADAR = "ibm_qradar"
    MICROSOFT_SENTINEL = "microsoft_sentinel"
    CUSTOM = "custom"

class IntegrationStatus(Enum):
    """Estados de integración"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    CONFIGURING = "configuring"

@dataclass
class SOARConnection:
    """Conexión a plataforma SOAR"""
    id: str
    platform: SOARPlatform
    name: str
    url: str
    api_key: str
    username: Optional[str] = None
    password: Optional[str] = None
    status: IntegrationStatus = IntegrationStatus.DISCONNECTED
    last_sync: Optional[datetime] = None
    config: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TicketSystemConnection:
    """Conexión a sistema de ticketing"""
    id: str
    system: TicketSystem
    name: str
    url: str
    api_key: str
    username: Optional[str] = None
    password: Optional[str] = None
    project_key: str = ""
    status: IntegrationStatus = IntegrationStatus.DISCONNECTED
    last_sync: Optional[datetime] = None
    config: Dict[str, Any] = field(default_factory=dict)

@dataclass
class SIEMConnection:
    """Conexión a plataforma SIEM"""
    id: str
    platform: SIEMPlatform
    name: str
    url: str
    api_key: str
    username: Optional[str] = None
    password: Optional[str] = None
    status: IntegrationStatus = IntegrationStatus.DISCONNECTED
    last_sync: Optional[datetime] = None
    config: Dict[str, Any] = field(default_factory=dict)

@dataclass
class SOARTicket:
    """Ticket de SOAR"""
    id: str
    title: str
    description: str
    severity: str
    status: str
    created_at: datetime
    updated_at: datetime
    assignee: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class IntegrationEvent:
    """Evento de integración"""
    id: str
    type: str  # "incident_created", "ticket_updated", "data_sent", etc.
    source: str
    target: str
    data: Dict[str, Any]
    status: str  # "success", "failed", "pending"
    timestamp: datetime
    error_message: Optional[str] = None

class SOARConnector:
    """Conector principal para integraciones SOAR"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.soar_connections: Dict[str, SOARConnection] = {}
        self.ticket_connections: Dict[str, TicketSystemConnection] = {}
        self.siem_connections: Dict[str, SIEMConnection] = {}
        self.integration_events: List[IntegrationEvent] = []
        
        # Cargar conexiones por defecto
        self._load_default_connections()
        
        # Inicializar conexiones
        self._initialize_connections()
        
        logger.info("SOAR Connector inicializado")
    
    def _load_default_connections(self):
        """Cargar conexiones por defecto"""
        # Conexiones SOAR por defecto
        default_soar = self.config.get('soar_connections', [])
        for conn_data in default_soar:
            connection = SOARConnection(
                id=conn_data.get('id', f"soar_{len(self.soar_connections)}"),
                platform=SOARPlatform(conn_data.get('platform', 'custom')),
                name=conn_data.get('name', 'Default SOAR'),
                url=conn_data.get('url', ''),
                api_key=conn_data.get('api_key', ''),
                username=conn_data.get('username'),
                password=conn_data.get('password'),
                config=conn_data.get('config', {})
            )
            self.soar_connections[connection.id] = connection
        
        # Conexiones de ticketing por defecto
        default_tickets = self.config.get('ticket_connections', [])
        for conn_data in default_tickets:
            connection = TicketSystemConnection(
                id=conn_data.get('id', f"ticket_{len(self.ticket_connections)}"),
                system=TicketSystem(conn_data.get('system', 'custom')),
                name=conn_data.get('name', 'Default Ticket System'),
                url=conn_data.get('url', ''),
                api_key=conn_data.get('api_key', ''),
                username=conn_data.get('username'),
                password=conn_data.get('password'),
                project_key=conn_data.get('project_key', ''),
                config=conn_data.get('config', {})
            )
            self.ticket_connections[connection.id] = connection
        
        # Conexiones SIEM por defecto
        default_siem = self.config.get('siem_connections', [])
        for conn_data in default_siem:
            connection = SIEMConnection(
                id=conn_data.get('id', f"siem_{len(self.siem_connections)}"),
                platform=SIEMPlatform(conn_data.get('platform', 'custom')),
                name=conn_data.get('name', 'Default SIEM'),
                url=conn_data.get('url', ''),
                api_key=conn_data.get('api_key', ''),
                username=conn_data.get('username'),
                password=conn_data.get('password'),
                config=conn_data.get('config', {})
            )
            self.siem_connections[connection.id] = connection
    
    def _initialize_connections(self):
        """Inicializar todas las conexiones"""
        for conn_id, connection in self.soar_connections.items():
            self._test_soar_connection(connection)
        
        for conn_id, connection in self.ticket_connections.items():
            self._test_ticket_connection(connection)
        
        for conn_id, connection in self.siem_connections.items():
            self._test_siem_connection(connection)
    
    def _test_soar_connection(self, connection: SOARConnection) -> bool:
        """Probar conexión a SOAR"""
        try:
            # Simular prueba de conexión
            logger.info(f"Probando conexión SOAR: {connection.name}")
            
            # Aquí iría la implementación real de prueba de conexión
            # usando la API específica de cada plataforma
            
            connection.status = IntegrationStatus.CONNECTED
            connection.last_sync = datetime.now()
            return True
            
        except Exception as e:
            logger.error(f"Error probando conexión SOAR {connection.name}: {e}")
            connection.status = IntegrationStatus.ERROR
            return False
    
    def _test_ticket_connection(self, connection: TicketSystemConnection) -> bool:
        """Probar conexión a sistema de ticketing"""
        try:
            # Simular prueba de conexión
            logger.info(f"Probando conexión de ticketing: {connection.name}")
            
            # Aquí iría la implementación real de prueba de conexión
            
            connection.status = IntegrationStatus.CONNECTED
            connection.last_sync = datetime.now()
            return True
            
        except Exception as e:
            logger.error(f"Error probando conexión de ticketing {connection.name}: {e}")
            connection.status = IntegrationStatus.ERROR
            return False
    
    def _test_siem_connection(self, connection: SIEMConnection) -> bool:
        """Probar conexión a SIEM"""
        try:
            # Simular prueba de conexión
            logger.info(f"Probando conexión SIEM: {connection.name}")
            
            # Aquí iría la implementación real de prueba de conexión
            
            connection.status = IntegrationStatus.CONNECTED
            connection.last_sync = datetime.now()
            return True
            
        except Exception as e:
            logger.error(f"Error probando conexión SIEM {connection.name}: {e}")
            connection.status = IntegrationStatus.ERROR
            return False
    
    def create_ticket(self, incident: Any, actions: List[Any], remediation_status: str) -> str:
        """Crear ticket en sistema de ticketing"""
        try:
            # Seleccionar conexión de ticketing
            if not self.ticket_connections:
                logger.warning("No hay conexiones de ticketing configuradas")
                return "no_ticket_system"
            
            # Usar la primera conexión disponible
            connection = next(iter(self.ticket_connections.values()))
            
            if connection.status != IntegrationStatus.CONNECTED:
                logger.error(f"Conexión de ticketing no disponible: {connection.name}")
                return "connection_failed"
            
            # Crear ticket
            ticket_id = self._create_ticket_in_system(connection, incident, actions, remediation_status)
            
            # Registrar evento
            self._record_integration_event(
                "ticket_created",
                "lucIA",
                connection.name,
                {
                    "ticket_id": ticket_id,
                    "incident_id": incident.id,
                    "status": "success"
                }
            )
            
            logger.info(f"Ticket creado: {ticket_id} en {connection.name}")
            return ticket_id
            
        except Exception as e:
            logger.error(f"Error creando ticket: {e}")
            
            # Registrar evento de error
            self._record_integration_event(
                "ticket_created",
                "lucIA",
                "ticket_system",
                {
                    "incident_id": incident.id,
                    "status": "failed"
                },
                error_message=str(e)
            )
            
            return "error"
    
    def _create_ticket_in_system(self, connection: TicketSystemConnection, 
                                incident: Any, actions: List[Any], 
                                remediation_status: str) -> str:
        """Crear ticket en sistema específico"""
        try:
            # Preparar datos del ticket
            ticket_data = self._prepare_ticket_data(incident, actions, remediation_status)
            
            # Crear ticket según el sistema
            if connection.system == TicketSystem.JIRA:
                return self._create_jira_ticket(connection, ticket_data)
            elif connection.system == TicketSystem.SERVICENOW:
                return self._create_servicenow_ticket(connection, ticket_data)
            elif connection.system == TicketSystem.ZENDESK:
                return self._create_zendesk_ticket(connection, ticket_data)
            else:
                return self._create_custom_ticket(connection, ticket_data)
                
        except Exception as e:
            logger.error(f"Error creando ticket en {connection.system.value}: {e}")
            raise
    
    def _prepare_ticket_data(self, incident: Any, actions: List[Any], 
                           remediation_status: str) -> Dict[str, Any]:
        """Preparar datos para el ticket"""
        # Preparar resumen de acciones
        actions_summary = []
        for action in actions:
            if hasattr(action, 'type') and hasattr(action, 'target'):
                actions_summary.append(f"- {action.type.value}: {action.target}")
        
        return {
            'title': f"Incidente de Seguridad: {incident.type.value} - {incident.id}",
            'description': f"""
            **Descripción del Incidente:**
            {incident.description}
            
            **Tipo:** {incident.type.value}
            **Severidad:** {incident.severity.name}
            **Fuente:** {incident.source}
            **Activos Afectados:** {', '.join(incident.affected_assets) if incident.affected_assets else 'N/A'}
            
            **Acciones Automáticas Ejecutadas:**
            {chr(10).join(actions_summary) if actions_summary else 'Ninguna acción automática'}
            
            **Estado de Remediación:** {remediation_status}
            
            **Timestamp:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """,
            'severity': incident.severity.name.lower(),
            'priority': self._map_severity_to_priority(incident.severity.value),
            'labels': [incident.type.value, 'security', 'automated'],
            'assignee': 'security-team',
            'project': 'SEC'
        }
    
    def _map_severity_to_priority(self, severity: int) -> str:
        """Mapear severidad a prioridad del ticket"""
        if severity >= 9:
            return "Critical"
        elif severity >= 7:
            return "High"
        elif severity >= 5:
            return "Medium"
        else:
            return "Low"
    
    def _create_jira_ticket(self, connection: TicketSystemConnection, 
                          ticket_data: Dict[str, Any]) -> str:
        """Crear ticket en Jira"""
        try:
            # Simular creación de ticket en Jira
            logger.info(f"Creando ticket Jira: {ticket_data['title']}")
            
            # Aquí iría la implementación real usando la API de Jira
            # Ejemplo:
            # response = requests.post(
            #     f"{connection.url}/rest/api/2/issue",
            #     headers={"Authorization": f"Bearer {connection.api_key}"},
            #     json={
            #         "fields": {
            #             "project": {"key": connection.project_key},
            #             "summary": ticket_data['title'],
            #             "description": ticket_data['description'],
            #             "priority": {"name": ticket_data['priority']},
            #             "labels": ticket_data['labels']
            #         }
            #     }
            # )
            
            # Generar ID simulado
            ticket_id = f"SEC-{int(datetime.now().timestamp())}"
            
            return ticket_id
            
        except Exception as e:
            logger.error(f"Error creando ticket Jira: {e}")
            raise
    
    def _create_servicenow_ticket(self, connection: TicketSystemConnection, 
                                ticket_data: Dict[str, Any]) -> str:
        """Crear ticket en ServiceNow"""
        try:
            # Simular creación de ticket en ServiceNow
            logger.info(f"Creando ticket ServiceNow: {ticket_data['title']}")
            
            # Aquí iría la implementación real usando la API de ServiceNow
            
            # Generar ID simulado
            ticket_id = f"INC{int(datetime.now().timestamp())}"
            
            return ticket_id
            
        except Exception as e:
            logger.error(f"Error creando ticket ServiceNow: {e}")
            raise
    
    def _create_zendesk_ticket(self, connection: TicketSystemConnection, 
                             ticket_data: Dict[str, Any]) -> str:
        """Crear ticket en Zendesk"""
        try:
            # Simular creación de ticket en Zendesk
            logger.info(f"Creando ticket Zendesk: {ticket_data['title']}")
            
            # Aquí iría la implementación real usando la API de Zendesk
            
            # Generar ID simulado
            ticket_id = f"TICKET-{int(datetime.now().timestamp())}"
            
            return ticket_id
            
        except Exception as e:
            logger.error(f"Error creando ticket Zendesk: {e}")
            raise
    
    def _create_custom_ticket(self, connection: TicketSystemConnection, 
                            ticket_data: Dict[str, Any]) -> str:
        """Crear ticket en sistema personalizado"""
        try:
            # Simular creación de ticket personalizado
            logger.info(f"Creando ticket personalizado: {ticket_data['title']}")
            
            # Aquí iría la implementación personalizada
            
            # Generar ID simulado
            ticket_id = f"CUSTOM-{int(datetime.now().timestamp())}"
            
            return ticket_id
            
        except Exception as e:
            logger.error(f"Error creando ticket personalizado: {e}")
            raise
    
    def send_to_soar(self, incident: Any, actions: List[Any]) -> bool:
        """Enviar datos a plataforma SOAR"""
        try:
            if not self.soar_connections:
                logger.warning("No hay conexiones SOAR configuradas")
                return False
            
            # Enviar a todas las conexiones SOAR
            success = False
            for conn_id, connection in self.soar_connections.items():
                if connection.status == IntegrationStatus.CONNECTED:
                    try:
                        soar_success = self._send_to_soar_platform(connection, incident, actions)
                        if soar_success:
                            success = True
                            
                            # Registrar evento
                            self._record_integration_event(
                                "data_sent",
                                "lucIA",
                                connection.name,
                                {
                                    "incident_id": incident.id,
                                    "status": "success"
                                }
                            )
                    except Exception as e:
                        logger.error(f"Error enviando a SOAR {connection.name}: {e}")
                        
                        # Registrar evento de error
                        self._record_integration_event(
                            "data_sent",
                            "lucIA",
                            connection.name,
                            {
                                "incident_id": incident.id,
                                "status": "failed"
                            },
                            error_message=str(e)
                        )
            
            return success
            
        except Exception as e:
            logger.error(f"Error enviando a SOAR: {e}")
            return False
    
    def _send_to_soar_platform(self, connection: SOARConnection, 
                              incident: Any, actions: List[Any]) -> bool:
        """Enviar datos a plataforma SOAR específica"""
        try:
            # Preparar datos para SOAR
            soar_data = self._prepare_soar_data(incident, actions)
            
            # Enviar según la plataforma
            if connection.platform == SOARPlatform.SPLUNK_SOAR:
                return self._send_to_splunk_soar(connection, soar_data)
            elif connection.platform == SOARPlatform.IBM_QRADAR:
                return self._send_to_ibm_qradar(connection, soar_data)
            elif connection.platform == SOARPlatform.MICROSOFT_SENTINEL:
                return self._send_to_microsoft_sentinel(connection, soar_data)
            else:
                return self._send_to_custom_soar(connection, soar_data)
                
        except Exception as e:
            logger.error(f"Error enviando a SOAR {connection.platform.value}: {e}")
            return False
    
    def _prepare_soar_data(self, incident: Any, actions: List[Any]) -> Dict[str, Any]:
        """Preparar datos para SOAR"""
        return {
            'incident_id': incident.id,
            'type': incident.type.value,
            'severity': incident.severity.value,
            'source': incident.source,
            'description': incident.description,
            'affected_assets': incident.affected_assets,
            'indicators': incident.indicators if hasattr(incident, 'indicators') else [],
            'evidence': incident.evidence if hasattr(incident, 'evidence') else {},
            'actions': [
                {
                    'type': action.type.value,
                    'target': action.target,
                    'status': action.status.value if hasattr(action, 'status') else 'completed'
                }
                for action in actions
            ],
            'timestamp': datetime.now().isoformat(),
            'source_system': 'lucIA'
        }
    
    def _send_to_splunk_soar(self, connection: SOARConnection, data: Dict[str, Any]) -> bool:
        """Enviar datos a Splunk SOAR"""
        try:
            # Simular envío a Splunk SOAR
            logger.info(f"Enviando a Splunk SOAR: {data['incident_id']}")
            
            # Aquí iría la implementación real usando la API de Splunk SOAR
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a Splunk SOAR: {e}")
            return False
    
    def _send_to_ibm_qradar(self, connection: SOARConnection, data: Dict[str, Any]) -> bool:
        """Enviar datos a IBM QRadar"""
        try:
            # Simular envío a IBM QRadar
            logger.info(f"Enviando a IBM QRadar: {data['incident_id']}")
            
            # Aquí iría la implementación real usando la API de IBM QRadar
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a IBM QRadar: {e}")
            return False
    
    def _send_to_microsoft_sentinel(self, connection: SOARConnection, data: Dict[str, Any]) -> bool:
        """Enviar datos a Microsoft Sentinel"""
        try:
            # Simular envío a Microsoft Sentinel
            logger.info(f"Enviando a Microsoft Sentinel: {data['incident_id']}")
            
            # Aquí iría la implementación real usando la API de Microsoft Sentinel
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a Microsoft Sentinel: {e}")
            return False
    
    def _send_to_custom_soar(self, connection: SOARConnection, data: Dict[str, Any]) -> bool:
        """Enviar datos a SOAR personalizado"""
        try:
            # Simular envío a SOAR personalizado
            logger.info(f"Enviando a SOAR personalizado: {data['incident_id']}")
            
            # Aquí iría la implementación personalizada
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a SOAR personalizado: {e}")
            return False
    
    def send_to_siem(self, incident: Any, actions: List[Any]) -> bool:
        """Enviar datos a SIEM"""
        try:
            if not self.siem_connections:
                logger.warning("No hay conexiones SIEM configuradas")
                return False
            
            # Enviar a todas las conexiones SIEM
            success = False
            for conn_id, connection in self.siem_connections.items():
                if connection.status == IntegrationStatus.CONNECTED:
                    try:
                        siem_success = self._send_to_siem_platform(connection, incident, actions)
                        if siem_success:
                            success = True
                            
                            # Registrar evento
                            self._record_integration_event(
                                "data_sent",
                                "lucIA",
                                connection.name,
                                {
                                    "incident_id": incident.id,
                                    "status": "success"
                                }
                            )
                    except Exception as e:
                        logger.error(f"Error enviando a SIEM {connection.name}: {e}")
                        
                        # Registrar evento de error
                        self._record_integration_event(
                            "data_sent",
                            "lucIA",
                            connection.name,
                            {
                                "incident_id": incident.id,
                                "status": "failed"
                            },
                            error_message=str(e)
                        )
            
            return success
            
        except Exception as e:
            logger.error(f"Error enviando a SIEM: {e}")
            return False
    
    def _send_to_siem_platform(self, connection: SIEMConnection, 
                              incident: Any, actions: List[Any]) -> bool:
        """Enviar datos a plataforma SIEM específica"""
        try:
            # Preparar datos para SIEM
            siem_data = self._prepare_siem_data(incident, actions)
            
            # Enviar según la plataforma
            if connection.platform == SIEMPlatform.SPLUNK:
                return self._send_to_splunk(connection, siem_data)
            elif connection.platform == SIEMPlatform.ELK_STACK:
                return self._send_to_elk(connection, siem_data)
            elif connection.platform == SIEMPlatform.IBM_QRADAR:
                return self._send_to_ibm_qradar_siem(connection, siem_data)
            else:
                return self._send_to_custom_siem(connection, siem_data)
                
        except Exception as e:
            logger.error(f"Error enviando a SIEM {connection.platform.value}: {e}")
            return False
    
    def _prepare_siem_data(self, incident: Any, actions: List[Any]) -> Dict[str, Any]:
        """Preparar datos para SIEM"""
        return {
            'event_type': 'security_incident',
            'incident_id': incident.id,
            'incident_type': incident.type.value,
            'severity': incident.severity.value,
            'source': incident.source,
            'description': incident.description,
            'affected_assets': incident.affected_assets,
            'actions_taken': [
                {
                    'action_type': action.type.value,
                    'target': action.target,
                    'timestamp': datetime.now().isoformat()
                }
                for action in actions
            ],
            'timestamp': datetime.now().isoformat(),
            'source_system': 'lucIA'
        }
    
    def _send_to_splunk(self, connection: SIEMConnection, data: Dict[str, Any]) -> bool:
        """Enviar datos a Splunk"""
        try:
            # Simular envío a Splunk
            logger.info(f"Enviando a Splunk: {data['incident_id']}")
            
            # Aquí iría la implementación real usando la API de Splunk
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a Splunk: {e}")
            return False
    
    def _send_to_elk(self, connection: SIEMConnection, data: Dict[str, Any]) -> bool:
        """Enviar datos a ELK Stack"""
        try:
            # Simular envío a ELK Stack
            logger.info(f"Enviando a ELK Stack: {data['incident_id']}")
            
            # Aquí iría la implementación real usando la API de Elasticsearch
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a ELK Stack: {e}")
            return False
    
    def _send_to_ibm_qradar_siem(self, connection: SIEMConnection, data: Dict[str, Any]) -> bool:
        """Enviar datos a IBM QRadar SIEM"""
        try:
            # Simular envío a IBM QRadar SIEM
            logger.info(f"Enviando a IBM QRadar SIEM: {data['incident_id']}")
            
            # Aquí iría la implementación real usando la API de IBM QRadar
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a IBM QRadar SIEM: {e}")
            return False
    
    def _send_to_custom_siem(self, connection: SIEMConnection, data: Dict[str, Any]) -> bool:
        """Enviar datos a SIEM personalizado"""
        try:
            # Simular envío a SIEM personalizado
            logger.info(f"Enviando a SIEM personalizado: {data['incident_id']}")
            
            # Aquí iría la implementación personalizada
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a SIEM personalizado: {e}")
            return False
    
    def _record_integration_event(self, event_type: str, source: str, target: str, 
                                data: Dict[str, Any], error_message: Optional[str] = None):
        """Registrar evento de integración"""
        event = IntegrationEvent(
            id=f"event_{int(datetime.now().timestamp())}",
            type=event_type,
            source=source,
            target=target,
            data=data,
            status="failed" if error_message else "success",
            timestamp=datetime.now(),
            error_message=error_message
        )
        
        self.integration_events.append(event)
    
    def get_integration_status(self) -> Dict[str, Any]:
        """Obtener estado de todas las integraciones"""
        return {
            'soar_connections': {
                conn_id: {
                    'name': conn.name,
                    'platform': conn.platform.value,
                    'status': conn.status.value,
                    'last_sync': conn.last_sync.isoformat() if conn.last_sync else None
                }
                for conn_id, conn in self.soar_connections.items()
            },
            'ticket_connections': {
                conn_id: {
                    'name': conn.name,
                    'system': conn.system.value,
                    'status': conn.status.value,
                    'last_sync': conn.last_sync.isoformat() if conn.last_sync else None
                }
                for conn_id, conn in self.ticket_connections.items()
            },
            'siem_connections': {
                conn_id: {
                    'name': conn.name,
                    'platform': conn.platform.value,
                    'status': conn.status.value,
                    'last_sync': conn.last_sync.isoformat() if conn.last_sync else None
                }
                for conn_id, conn in self.siem_connections.items()
            }
        }
    
    def get_integration_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Obtener eventos de integración recientes"""
        events = []
        
        for event in self.integration_events[-limit:]:
            events.append({
                'id': event.id,
                'type': event.type,
                'source': event.source,
                'target': event.target,
                'status': event.status,
                'timestamp': event.timestamp.isoformat(),
                'error_message': event.error_message
            })
        
        return events
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de integración"""
        total_events = len(self.integration_events)
        successful_events = len([e for e in self.integration_events if e.status == "success"])
        failed_events = len([e for e in self.integration_events if e.status == "failed"])
        
        return {
            'total_events': total_events,
            'successful_events': successful_events,
            'failed_events': failed_events,
            'success_rate': (successful_events / total_events * 100) if total_events > 0 else 0,
            'soar_connections': len(self.soar_connections),
            'ticket_connections': len(self.ticket_connections),
            'siem_connections': len(self.siem_connections)
        }

# Función de integración con lucIA
def integrate_with_external_systems(incident_data: Dict[str, Any], actions_data: List[Dict[str, Any]], remediation_status: str) -> Dict[str, Any]:
    """Función principal para integración con lucIA"""
    try:
        connector = SOARConnector()
        
        # Crear objeto incidente simulado
        class MockIncident:
            def __init__(self, data):
                self.id = data.get('id', 'inc_001')
                self.type = type('MockType', (), {'value': data.get('type', 'malware')})()
                self.severity = type('MockSeverity', (), {'value': data.get('severity', 8)})()
                self.source = data.get('source', 'unknown')
                self.description = data.get('description', 'Incidente de seguridad')
                self.affected_assets = data.get('affected_assets', [])
        
        incident = MockIncident(incident_data)
        
        # Crear objetos de acción simulados
        class MockAction:
            def __init__(self, data):
                self.type = type('MockType', (), {'value': data.get('type', 'isolate_endpoint')})()
                self.target = data.get('target', 'unknown')
                self.status = type('MockStatus', (), {'value': 'completed'})()
        
        actions = [MockAction(action) for action in actions_data]
        
        # Crear ticket
        ticket_id = connector.create_ticket(incident, actions, remediation_status)
        
        # Enviar a SOAR
        soar_success = connector.send_to_soar(incident, actions)
        
        # Enviar a SIEM
        siem_success = connector.send_to_siem(incident, actions)
        
        return {
            'ticket_id': ticket_id,
            'soar_integration': 'success' if soar_success else 'failed',
            'siem_integration': 'success' if siem_success else 'failed',
            'integration_status': connector.get_integration_status()
        }
        
    except Exception as e:
        logger.error(f"Error en integración con sistemas externos: {e}")
        return {
            'ticket_id': 'error',
            'soar_integration': 'failed',
            'siem_integration': 'failed',
            'error': str(e)
        }

if __name__ == "__main__":
    # Ejemplo de uso
    test_incident = {
        'id': 'inc_001',
        'type': 'ransomware',
        'severity': 10,
        'source': 'endpoint_42',
        'description': 'Ransomware detectado en endpoint',
        'affected_assets': ['endpoint_42', 'file_server']
    }
    
    test_actions = [
        {'type': 'isolate_endpoint', 'target': 'endpoint_42'},
        {'type': 'block_user', 'target': 'alice'}
    ]
    
    results = integrate_with_external_systems(test_incident, test_actions, "in_progress")
    print("Resultados de integración:", results) 