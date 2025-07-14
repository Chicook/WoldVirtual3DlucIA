#!/usr/bin/env python3
"""
notifier.py
Sistema de notificación automática para lucIA
Implementa comunicación de incidentes a equipos, usuarios y sistemas externos

Funcionalidades:
- Notificaciones automáticas por múltiples canales
- Escalación automática de alertas
- Plantillas personalizables de mensajes
- Integración con sistemas de comunicación externos
- Gestión de destinatarios y grupos
- Seguimiento de entregas y confirmaciones
- Notificaciones adaptativas basadas en severidad
"""

import json
import logging
import smtplib
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
import threading
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotificationChannel(Enum):
    """Canales de notificación"""
    EMAIL = "email"
    SLACK = "slack"
    TEAMS = "teams"
    SMS = "sms"
    WEBHOOK = "webhook"
    DASHBOARD = "dashboard"
    PAGERDUTY = "pagerduty"
    JIRA = "jira"

class NotificationPriority(Enum):
    """Prioridades de notificación"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class NotificationStatus(Enum):
    """Estados de notificación"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    ACKNOWLEDGED = "acknowledged"

@dataclass
class NotificationRecipient:
    """Destinatario de notificación"""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    slack_id: Optional[str] = None
    teams_id: Optional[str] = None
    role: str = "user"
    department: str = "general"
    notification_preferences: Dict[str, List[str]] = field(default_factory=dict)
    active: bool = True

@dataclass
class NotificationGroup:
    """Grupo de destinatarios"""
    id: str
    name: str
    description: str
    members: List[str] = field(default_factory=list)  # Lista de recipient IDs
    escalation_rules: Dict[str, Any] = field(default_factory=dict)
    active: bool = True

@dataclass
class NotificationTemplate:
    """Plantilla de notificación"""
    id: str
    name: str
    description: str
    subject: str
    body: str
    channels: List[NotificationChannel] = field(default_factory=list)
    priority: NotificationPriority = NotificationPriority.MEDIUM
    variables: List[str] = field(default_factory=list)
    active: bool = True

@dataclass
class Notification:
    """Notificación individual"""
    id: str
    template_id: str
    recipients: List[str]  # Lista de recipient IDs o group IDs
    channels: List[NotificationChannel]
    priority: NotificationPriority
    subject: str
    body: str
    variables: Dict[str, Any] = field(default_factory=dict)
    status: NotificationStatus = NotificationStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    retry_count: int = 0
    max_retries: int = 3
    metadata: Dict[str, Any] = field(default_factory=dict)

class Notifier:
    """Sistema principal de notificación"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.recipients: Dict[str, NotificationRecipient] = {}
        self.groups: Dict[str, NotificationGroup] = {}
        self.templates: Dict[str, NotificationTemplate] = {}
        self.notifications: List[Notification] = []
        self.channel_handlers = self._register_channel_handlers()
        
        # Configuración de canales
        self.email_config = self.config.get('email', {})
        self.slack_config = self.config.get('slack', {})
        self.teams_config = self.config.get('teams', {})
        self.webhook_config = self.config.get('webhook', {})
        
        # Cargar configuración por defecto
        self._load_default_configuration()
        
        logger.info("Notifier inicializado")
    
    def _register_channel_handlers(self) -> Dict[NotificationChannel, callable]:
        """Registrar manejadores para cada canal"""
        return {
            NotificationChannel.EMAIL: self._send_email,
            NotificationChannel.SLACK: self._send_slack,
            NotificationChannel.TEAMS: self._send_teams,
            NotificationChannel.SMS: self._send_sms,
            NotificationChannel.WEBHOOK: self._send_webhook,
            NotificationChannel.DASHBOARD: self._send_dashboard,
            NotificationChannel.PAGERDUTY: self._send_pagerduty,
            NotificationChannel.JIRA: self._send_jira
        }
    
    def _load_default_configuration(self):
        """Cargar configuración por defecto"""
        # Cargar destinatarios por defecto
        self._load_default_recipients()
        
        # Cargar grupos por defecto
        self._load_default_groups()
        
        # Cargar plantillas por defecto
        self._load_default_templates()
    
    def _load_default_recipients(self):
        """Cargar destinatarios por defecto"""
        default_recipients = [
            NotificationRecipient(
                id="security_team",
                name="Equipo de Seguridad",
                email="security@company.com",
                role="security_admin",
                department="security",
                notification_preferences={
                    "critical": ["email", "slack", "sms"],
                    "high": ["email", "slack"],
                    "medium": ["email"],
                    "low": ["dashboard"]
                }
            ),
            NotificationRecipient(
                id="system_admin",
                name="Administrador del Sistema",
                email="admin@company.com",
                role="system_admin",
                department="it",
                notification_preferences={
                    "critical": ["email", "slack"],
                    "high": ["email", "slack"],
                    "medium": ["email"],
                    "low": ["dashboard"]
                }
            ),
            NotificationRecipient(
                id="incident_manager",
                name="Gerente de Incidentes",
                email="incidents@company.com",
                role="incident_manager",
                department="security",
                notification_preferences={
                    "critical": ["email", "slack", "sms"],
                    "high": ["email", "slack"],
                    "medium": ["email"],
                    "low": ["dashboard"]
                }
            )
        ]
        
        for recipient in default_recipients:
            self.recipients[recipient.id] = recipient
    
    def _load_default_groups(self):
        """Cargar grupos por defecto"""
        default_groups = [
            NotificationGroup(
                id="security_team_group",
                name="Equipo de Seguridad",
                description="Grupo principal del equipo de seguridad",
                members=["security_team", "incident_manager"],
                escalation_rules={
                    "timeout": 300,  # 5 minutos
                    "escalation_recipients": ["system_admin"]
                }
            ),
            NotificationGroup(
                id="management_group",
                name="Gerencia",
                description="Grupo de gerentes para incidentes críticos",
                members=["incident_manager"],
                escalation_rules={
                    "timeout": 600,  # 10 minutos
                    "escalation_recipients": ["security_team"]
                }
            )
        ]
        
        for group in default_groups:
            self.groups[group.id] = group
    
    def _load_default_templates(self):
        """Cargar plantillas por defecto"""
        default_templates = [
            NotificationTemplate(
                id="incident_alert",
                name="Alerta de Incidente",
                description="Plantilla para alertas de incidentes de seguridad",
                subject="🚨 Alerta de Seguridad: {incident_type}",
                body="""
                **Incidente de Seguridad Detectado**
                
                **Tipo:** {incident_type}
                **Severidad:** {severity}
                **Fuente:** {source}
                **Descripción:** {description}
                **Activos Afectados:** {affected_assets}
                
                **Acciones Tomadas:**
                {actions_taken}
                
                **Estado de Remediación:** {remediation_status}
                
                **Timestamp:** {timestamp}
                
                Por favor, revise inmediatamente este incidente.
                """,
                channels=[NotificationChannel.EMAIL, NotificationChannel.SLACK],
                priority=NotificationPriority.HIGH,
                variables=["incident_type", "severity", "source", "description", "affected_assets", "actions_taken", "remediation_status", "timestamp"]
            ),
            NotificationTemplate(
                id="critical_incident",
                name="Incidente Crítico",
                description="Plantilla para incidentes críticos",
                subject="🚨🚨 INCIDENTE CRÍTICO: {incident_type} 🚨🚨",
                body="""
                ⚠️ **INCIDENTE CRÍTICO DETECTADO** ⚠️
                
                **Tipo:** {incident_type}
                **Severidad:** CRÍTICA
                **Fuente:** {source}
                **Descripción:** {description}
                
                **ACCIÓN INMEDIATA REQUERIDA**
                
                **Activos Afectados:** {affected_assets}
                **Acciones Automáticas:** {actions_taken}
                
                **CONTACTE AL EQUIPO DE SEGURIDAD INMEDIATAMENTE**
                
                Timestamp: {timestamp}
                """,
                channels=[NotificationChannel.EMAIL, NotificationChannel.SLACK, NotificationChannel.SMS],
                priority=NotificationPriority.CRITICAL,
                variables=["incident_type", "source", "description", "affected_assets", "actions_taken", "timestamp"]
            ),
            NotificationTemplate(
                id="remediation_update",
                name="Actualización de Remediación",
                description="Plantilla para actualizaciones de remediación",
                subject="📋 Actualización de Remediación: {incident_id}",
                body="""
                **Actualización de Remediación**
                
                **Incidente:** {incident_id}
                **Estado:** {remediation_status}
                **Progreso:** {progress_percentage}%
                
                **Tareas Completadas:** {completed_tasks}
                **Tareas Pendientes:** {pending_tasks}
                
                **Próximos Pasos:** {next_steps}
                
                Timestamp: {timestamp}
                """,
                channels=[NotificationChannel.EMAIL, NotificationChannel.SLACK],
                priority=NotificationPriority.MEDIUM,
                variables=["incident_id", "remediation_status", "progress_percentage", "completed_tasks", "pending_tasks", "next_steps", "timestamp"]
            )
        ]
        
        for template in default_templates:
            self.templates[template.id] = template
    
    def notify(self, incident: Any, actions: List[Any], remediation_status: str) -> List[Dict[str, Any]]:
        """Enviar notificaciones sobre un incidente"""
        try:
            notifications_sent = []
            
            # Determinar plantilla basada en severidad
            if incident.severity.value >= 9:
                template_id = "critical_incident"
                priority = NotificationPriority.CRITICAL
            else:
                template_id = "incident_alert"
                priority = NotificationPriority.HIGH if incident.severity.value >= 7 else NotificationPriority.MEDIUM
            
            # Preparar variables
            variables = self._prepare_notification_variables(incident, actions, remediation_status)
            
            # Determinar destinatarios
            recipients = self._determine_recipients(incident, priority)
            
            # Enviar notificaciones
            for recipient_id in recipients:
                notification = self._create_notification(
                    template_id, [recipient_id], priority, variables
                )
                
                success = self._send_notification(notification)
                notifications_sent.append({
                    'notification_id': notification.id,
                    'recipient': recipient_id,
                    'template': template_id,
                    'status': notification.status.value,
                    'channels': [ch.value for ch in notification.channels]
                })
            
            # Enviar actualización de remediación si es necesario
            if remediation_status and remediation_status != "pending":
                self._send_remediation_update(incident, remediation_status)
            
            logger.info(f"Notificaciones enviadas: {len(notifications_sent)}")
            return notifications_sent
            
        except Exception as e:
            logger.error(f"Error enviando notificaciones: {e}")
            return []
    
    def _prepare_notification_variables(self, incident: Any, actions: List[Any], remediation_status: str) -> Dict[str, Any]:
        """Preparar variables para la notificación"""
        # Preparar acciones tomadas
        actions_summary = []
        for action in actions:
            if hasattr(action, 'type') and hasattr(action, 'target'):
                actions_summary.append(f"- {action.type.value}: {action.target}")
        
        return {
            'incident_id': incident.id,
            'incident_type': incident.type.value,
            'severity': incident.severity.name,
            'source': incident.source,
            'description': incident.description,
            'affected_assets': ', '.join(incident.affected_assets) if incident.affected_assets else 'N/A',
            'actions_taken': '\n'.join(actions_summary) if actions_summary else 'Ninguna acción automática',
            'remediation_status': remediation_status or 'Pendiente',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def _determine_recipients(self, incident: Any, priority: NotificationPriority) -> List[str]:
        """Determinar destinatarios basado en incidente y prioridad"""
        recipients = []
        
        # Agregar destinatarios basados en prioridad
        if priority == NotificationPriority.CRITICAL:
            recipients.extend(["security_team", "incident_manager", "system_admin"])
        elif priority == NotificationPriority.HIGH:
            recipients.extend(["security_team", "incident_manager"])
        elif priority == NotificationPriority.MEDIUM:
            recipients.extend(["security_team"])
        else:
            recipients.append("security_team")
        
        # Agregar destinatarios específicos basados en tipo de incidente
        if incident.type.value == "data_breach":
            recipients.append("data_protection_officer")
        elif incident.type.value == "ransomware":
            recipients.extend(["management_group"])
        
        # Eliminar duplicados
        return list(set(recipients))
    
    def _create_notification(self, template_id: str, recipients: List[str], 
                           priority: NotificationPriority, variables: Dict[str, Any]) -> Notification:
        """Crear notificación"""
        template = self.templates.get(template_id)
        if not template:
            raise ValueError(f"Plantilla no encontrada: {template_id}")
        
        # Expandir grupos
        expanded_recipients = self._expand_recipients(recipients)
        
        # Determinar canales basados en preferencias
        channels = self._determine_channels(expanded_recipients, priority)
        
        # Renderizar plantilla
        subject = self._render_template(template.subject, variables)
        body = self._render_template(template.body, variables)
        
        notification = Notification(
            id=f"notif_{int(datetime.now().timestamp())}",
            template_id=template_id,
            recipients=expanded_recipients,
            channels=channels,
            priority=priority,
            subject=subject,
            body=body,
            variables=variables
        )
        
        self.notifications.append(notification)
        return notification
    
    def _expand_recipients(self, recipients: List[str]) -> List[str]:
        """Expandir grupos a destinatarios individuales"""
        expanded = []
        
        for recipient_id in recipients:
            if recipient_id in self.groups:
                # Es un grupo, expandir
                group = self.groups[recipient_id]
                expanded.extend(group.members)
            else:
                # Es un destinatario individual
                expanded.append(recipient_id)
        
        return list(set(expanded))  # Eliminar duplicados
    
    def _determine_channels(self, recipients: List[str], priority: NotificationPriority) -> List[NotificationChannel]:
        """Determinar canales basados en preferencias de destinatarios"""
        channels = set()
        
        for recipient_id in recipients:
            recipient = self.recipients.get(recipient_id)
            if recipient and recipient.active:
                preferred_channels = recipient.notification_preferences.get(priority.value, [])
                for channel_name in preferred_channels:
                    try:
                        channels.add(NotificationChannel(channel_name))
                    except ValueError:
                        logger.warning(f"Canal no válido: {channel_name}")
        
        # Fallback a email si no hay canales
        if not channels:
            channels.add(NotificationChannel.EMAIL)
        
        return list(channels)
    
    def _render_template(self, template: str, variables: Dict[str, Any]) -> str:
        """Renderizar plantilla con variables"""
        try:
            return template.format(**variables)
        except KeyError as e:
            logger.warning(f"Variable faltante en plantilla: {e}")
            return template
    
    def _send_notification(self, notification: Notification) -> bool:
        """Enviar notificación por todos los canales configurados"""
        try:
            success = False
            
            for channel in notification.channels:
                handler = self.channel_handlers.get(channel)
                if handler:
                    try:
                        channel_success = handler(notification)
                        if channel_success:
                            success = True
                    except Exception as e:
                        logger.error(f"Error enviando por {channel.value}: {e}")
            
            if success:
                notification.status = NotificationStatus.SENT
                notification.sent_at = datetime.now()
            else:
                notification.status = NotificationStatus.FAILED
            
            return success
            
        except Exception as e:
            logger.error(f"Error enviando notificación: {e}")
            notification.status = NotificationStatus.FAILED
            return False
    
    def _send_email(self, notification: Notification) -> bool:
        """Enviar notificación por email"""
        try:
            if not self.email_config:
                logger.warning("Configuración de email no disponible")
                return False
            
            # Simular envío de email
            logger.info(f"Enviando email: {notification.subject}")
            
            # Aquí iría la implementación real de envío de email
            # usando smtplib o servicios como SendGrid
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando email: {e}")
            return False
    
    def _send_slack(self, notification: Notification) -> bool:
        """Enviar notificación por Slack"""
        try:
            if not self.slack_config:
                logger.warning("Configuración de Slack no disponible")
                return False
            
            # Simular envío a Slack
            logger.info(f"Enviando a Slack: {notification.subject}")
            
            # Aquí iría la implementación real usando la API de Slack
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a Slack: {e}")
            return False
    
    def _send_teams(self, notification: Notification) -> bool:
        """Enviar notificación por Microsoft Teams"""
        try:
            if not self.teams_config:
                logger.warning("Configuración de Teams no disponible")
                return False
            
            # Simular envío a Teams
            logger.info(f"Enviando a Teams: {notification.subject}")
            
            # Aquí iría la implementación real usando la API de Teams
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a Teams: {e}")
            return False
    
    def _send_sms(self, notification: Notification) -> bool:
        """Enviar notificación por SMS"""
        try:
            # Simular envío de SMS
            logger.info(f"Enviando SMS: {notification.subject}")
            
            # Aquí iría la implementación real usando servicios de SMS
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando SMS: {e}")
            return False
    
    def _send_webhook(self, notification: Notification) -> bool:
        """Enviar notificación por webhook"""
        try:
            if not self.webhook_config:
                logger.warning("Configuración de webhook no disponible")
                return False
            
            # Simular envío por webhook
            logger.info(f"Enviando webhook: {notification.subject}")
            
            # Aquí iría la implementación real usando requests
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando webhook: {e}")
            return False
    
    def _send_dashboard(self, notification: Notification) -> bool:
        """Enviar notificación al dashboard"""
        try:
            # Simular envío al dashboard
            logger.info(f"Enviando al dashboard: {notification.subject}")
            
            # Aquí iría la implementación real para el dashboard
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando al dashboard: {e}")
            return False
    
    def _send_pagerduty(self, notification: Notification) -> bool:
        """Enviar notificación a PagerDuty"""
        try:
            # Simular envío a PagerDuty
            logger.info(f"Enviando a PagerDuty: {notification.subject}")
            
            # Aquí iría la implementación real usando la API de PagerDuty
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a PagerDuty: {e}")
            return False
    
    def _send_jira(self, notification: Notification) -> bool:
        """Enviar notificación a Jira"""
        try:
            # Simular envío a Jira
            logger.info(f"Enviando a Jira: {notification.subject}")
            
            # Aquí iría la implementación real usando la API de Jira
            
            return True
            
        except Exception as e:
            logger.error(f"Error enviando a Jira: {e}")
            return False
    
    def _send_remediation_update(self, incident: Any, remediation_status: str):
        """Enviar actualización de remediación"""
        try:
            variables = {
                'incident_id': incident.id,
                'remediation_status': remediation_status,
                'progress_percentage': '75',  # Esto debería calcularse dinámicamente
                'completed_tasks': '3',
                'pending_tasks': '1',
                'next_steps': 'Verificación final del sistema',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            notification = self._create_notification(
                "remediation_update", 
                ["security_team"], 
                NotificationPriority.MEDIUM, 
                variables
            )
            
            self._send_notification(notification)
            
        except Exception as e:
            logger.error(f"Error enviando actualización de remediación: {e}")
    
    def get_notification_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Obtener historial de notificaciones"""
        history = []
        
        for notification in self.notifications[-limit:]:
            history.append({
                'id': notification.id,
                'template_id': notification.template_id,
                'recipients': notification.recipients,
                'channels': [ch.value for ch in notification.channels],
                'priority': notification.priority.value,
                'subject': notification.subject,
                'status': notification.status.value,
                'created_at': notification.created_at.isoformat(),
                'sent_at': notification.sent_at.isoformat() if notification.sent_at else None
            })
        
        return history
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de notificación"""
        total_notifications = len(self.notifications)
        sent_notifications = len([n for n in self.notifications if n.status == NotificationStatus.SENT])
        failed_notifications = len([n for n in self.notifications if n.status == NotificationStatus.FAILED])
        
        return {
            'total_notifications': total_notifications,
            'sent_notifications': sent_notifications,
            'failed_notifications': failed_notifications,
            'success_rate': (sent_notifications / total_notifications * 100) if total_notifications > 0 else 0,
            'total_recipients': len(self.recipients),
            'total_groups': len(self.groups),
            'total_templates': len(self.templates)
        }

# Función de integración con lucIA
def send_security_notifications(incident_data: Dict[str, Any], actions_data: List[Dict[str, Any]], remediation_status: str) -> List[Dict[str, Any]]:
    """Función principal para integración con lucIA"""
    try:
        notifier = Notifier()
        
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
        
        actions = [MockAction(action) for action in actions_data]
        
        # Enviar notificaciones
        results = notifier.notify(incident, actions, remediation_status)
        
        return results
        
    except Exception as e:
        logger.error(f"Error enviando notificaciones: {e}")
        return []

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
    
    results = send_security_notifications(test_incident, test_actions, "in_progress")
    print("Notificaciones enviadas:", results) 