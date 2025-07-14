#!/usr/bin/env python3
"""
incident_detector.py
Detector de incidentes de seguridad para lucIA
Clasifica eventos, determina severidad y genera objetos Incident para automatización

Funcionalidades:
- Clasificación automática de eventos de seguridad
- Determinación de severidad basada en múltiples factores
- Detección de patrones de ataque conocidos
- Correlación de eventos para identificar incidentes complejos
- Integración con threat intelligence para contexto adicional
"""

import re
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IncidentType(Enum):
    """Tipos de incidentes de seguridad"""
    MALWARE = "malware"
    INTRUSION = "intrusion"
    DATA_BREACH = "data_breach"
    DOS_ATTACK = "dos_attack"
    PHISHING = "phishing"
    INSIDER_THREAT = "insider_threat"
    CONFIGURATION_ERROR = "configuration_error"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    DATA_EXFILTRATION = "data_exfiltration"
    RANSOMWARE = "ransomware"
    APT = "apt"  # Advanced Persistent Threat
    UNKNOWN = "unknown"

class SeverityLevel(Enum):
    """Niveles de severidad de incidentes"""
    CRITICAL = 10
    HIGH = 8
    MEDIUM = 5
    LOW = 3
    INFO = 1

@dataclass
class Incident:
    """Objeto de incidente de seguridad"""
    id: str
    type: IncidentType
    severity: SeverityLevel
    title: str
    description: str
    source: str
    timestamp: datetime
    affected_assets: List[str] = field(default_factory=list)
    indicators: List[str] = field(default_factory=list)
    evidence: Dict[str, Any] = field(default_factory=dict)
    status: str = "open"
    confidence: float = 0.0
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

class IncidentDetector:
    """Detector principal de incidentes de seguridad"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.incident_patterns = self._load_incident_patterns()
        self.severity_rules = self._load_severity_rules()
        self.asset_criticality = self._load_asset_criticality()
        self.incident_history = defaultdict(list)
        
        logger.info("Incident Detector inicializado")
    
    def _load_incident_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Cargar patrones de detección de incidentes"""
        return {
            "malware_detected": {
                "type": IncidentType.MALWARE,
                "patterns": [
                    r"malware|virus|trojan|worm|spyware",
                    r"\.exe.*suspicious|\.dll.*malicious",
                    r"antivirus.*detected|security.*alert"
                ],
                "base_severity": SeverityLevel.HIGH,
                "confidence_boost": 0.3
            },
            "intrusion_detected": {
                "type": IncidentType.INTRUSION,
                "patterns": [
                    r"unauthorized.*access|intrusion.*detected",
                    r"failed.*login.*attempts|brute.*force",
                    r"port.*scan|network.*probe"
                ],
                "base_severity": SeverityLevel.MEDIUM,
                "confidence_boost": 0.2
            },
            "data_breach": {
                "type": IncidentType.DATA_BREACH,
                "patterns": [
                    r"data.*breach|personal.*information.*exposed",
                    r"credit.*card.*leaked|ssn.*exposed",
                    r"database.*compromised|records.*stolen"
                ],
                "base_severity": SeverityLevel.CRITICAL,
                "confidence_boost": 0.4
            },
            "dos_attack": {
                "type": IncidentType.DOS_ATTACK,
                "patterns": [
                    r"denial.*of.*service|dos.*attack",
                    r"service.*unavailable|overload.*detected",
                    r"traffic.*spike|bandwidth.*exhaustion"
                ],
                "base_severity": SeverityLevel.HIGH,
                "confidence_boost": 0.3
            },
            "phishing_attempt": {
                "type": IncidentType.PHISHING,
                "patterns": [
                    r"phishing.*email|suspicious.*link",
                    r"credential.*harvesting|fake.*login",
                    r"social.*engineering.*attempt"
                ],
                "base_severity": SeverityLevel.MEDIUM,
                "confidence_boost": 0.2
            },
            "insider_threat": {
                "type": IncidentType.INSIDER_THREAT,
                "patterns": [
                    r"employee.*unauthorized.*access",
                    r"privilege.*abuse|data.*theft.*internal",
                    r"after.*hours.*access.*suspicious"
                ],
                "base_severity": SeverityLevel.HIGH,
                "confidence_boost": 0.3
            },
            "privilege_escalation": {
                "type": IncidentType.PRIVILEGE_ESCALATION,
                "patterns": [
                    r"privilege.*escalation|admin.*rights.*granted",
                    r"sudo.*execution|root.*access.*obtained",
                    r"elevated.*permissions.*unauthorized"
                ],
                "base_severity": SeverityLevel.CRITICAL,
                "confidence_boost": 0.4
            },
            "ransomware": {
                "type": IncidentType.RANSOMWARE,
                "patterns": [
                    r"ransomware.*detected|files.*encrypted",
                    r"ransom.*note|payment.*demand",
                    r"crypto.*locker|file.*extension.*changed"
                ],
                "base_severity": SeverityLevel.CRITICAL,
                "confidence_boost": 0.5
            }
        }
    
    def _load_severity_rules(self) -> Dict[str, Any]:
        """Cargar reglas de severidad"""
        return {
            "asset_criticality_multiplier": {
                "critical": 1.5,
                "high": 1.3,
                "medium": 1.0,
                "low": 0.7
            },
            "time_based_multiplier": {
                "business_hours": 1.0,
                "after_hours": 1.2,
                "weekend": 1.3,
                "holiday": 1.4
            },
            "frequency_multiplier": {
                "first_occurrence": 1.0,
                "repeated": 1.2,
                "frequent": 1.5,
                "persistent": 2.0
            }
        }
    
    def _load_asset_criticality(self) -> Dict[str, str]:
        """Cargar criticidad de activos"""
        return {
            "database": "critical",
            "web_server": "high",
            "file_server": "high",
            "mail_server": "high",
            "dns_server": "critical",
            "firewall": "critical",
            "router": "critical",
            "switch": "medium",
            "workstation": "low",
            "mobile_device": "low"
        }
    
    def detect(self, event: Dict[str, Any]) -> Optional[Incident]:
        """Detectar incidente a partir de un evento"""
        try:
            # Analizar evento
            incident_type = self._classify_event(event)
            if not incident_type:
                return None
            
            # Determinar severidad
            severity = self._calculate_severity(event, incident_type)
            
            # Generar ID único
            incident_id = self._generate_incident_id(event)
            
            # Extraer información relevante
            title = self._generate_title(event, incident_type)
            description = self._generate_description(event, incident_type)
            affected_assets = self._extract_affected_assets(event)
            indicators = self._extract_indicators(event)
            evidence = self._extract_evidence(event)
            confidence = self._calculate_confidence(event, incident_type)
            tags = self._generate_tags(event, incident_type)
            
            # Crear incidente
            incident = Incident(
                id=incident_id,
                type=incident_type,
                severity=severity,
                title=title,
                description=description,
                source=event.get('source', 'unknown'),
                timestamp=datetime.fromisoformat(event.get('timestamp', datetime.now().isoformat())),
                affected_assets=affected_assets,
                indicators=indicators,
                evidence=evidence,
                confidence=confidence,
                tags=tags,
                metadata=event
            )
            
            # Registrar en historial
            self.incident_history[incident_type.value].append(incident)
            
            logger.info(f"Incidente detectado: {incident_id} - {incident_type.value} - Severidad: {severity.name}")
            
            return incident
            
        except Exception as e:
            logger.error(f"Error detectando incidente: {e}")
            return None
    
    def _classify_event(self, event: Dict[str, Any]) -> Optional[IncidentType]:
        """Clasificar tipo de incidente basado en el evento"""
        try:
            event_text = self._normalize_event_text(event)
            
            for pattern_name, pattern_config in self.incident_patterns.items():
                for pattern in pattern_config['patterns']:
                    if re.search(pattern, event_text, re.IGNORECASE):
                        return pattern_config['type']
            
            # Clasificación basada en campos específicos
            event_type = event.get('type', '').lower()
            if 'malware' in event_type:
                return IncidentType.MALWARE
            elif 'intrusion' in event_type:
                return IncidentType.INTRUSION
            elif 'breach' in event_type:
                return IncidentType.DATA_BREACH
            elif 'dos' in event_type or 'ddos' in event_type:
                return IncidentType.DOS_ATTACK
            elif 'phishing' in event_type:
                return IncidentType.PHISHING
            elif 'ransomware' in event_type:
                return IncidentType.RANSOMWARE
            
            return IncidentType.UNKNOWN
            
        except Exception as e:
            logger.error(f"Error clasificando evento: {e}")
            return IncidentType.UNKNOWN
    
    def _normalize_event_text(self, event: Dict[str, Any]) -> str:
        """Normalizar texto del evento para análisis"""
        text_parts = []
        
        # Añadir campos de texto relevantes
        for field in ['message', 'description', 'details', 'summary', 'title']:
            if field in event:
                text_parts.append(str(event[field]))
        
        # Añadir detalles si es un diccionario
        if 'details' in event and isinstance(event['details'], dict):
            for key, value in event['details'].items():
                text_parts.append(f"{key}: {value}")
        
        return " ".join(text_parts).lower()
    
    def _calculate_severity(self, event: Dict[str, Any], incident_type: IncidentType) -> SeverityLevel:
        """Calcular severidad del incidente"""
        try:
            # Severidad base del tipo de incidente
            base_severity = self.incident_patterns.get(
                incident_type.value, {}).get('base_severity', SeverityLevel.MEDIUM)
            
            # Convertir a valor numérico
            severity_value = base_severity.value
            
            # Aplicar multiplicadores
            severity_value *= self._get_asset_criticality_multiplier(event)
            severity_value *= self._get_time_based_multiplier(event)
            severity_value *= self._get_frequency_multiplier(event)
            
            # Severidad explícita del evento
            if 'severity' in event:
                event_severity = int(event['severity'])
                severity_value = max(severity_value, event_severity)
            
            # Normalizar a niveles de severidad
            if severity_value >= 9:
                return SeverityLevel.CRITICAL
            elif severity_value >= 7:
                return SeverityLevel.HIGH
            elif severity_value >= 4:
                return SeverityLevel.MEDIUM
            elif severity_value >= 2:
                return SeverityLevel.LOW
            else:
                return SeverityLevel.INFO
                
        except Exception as e:
            logger.error(f"Error calculando severidad: {e}")
            return SeverityLevel.MEDIUM
    
    def _get_asset_criticality_multiplier(self, event: Dict[str, Any]) -> float:
        """Obtener multiplicador por criticidad del activo"""
        try:
            source = event.get('source', '').lower()
            resource = event.get('resource', '').lower()
            
            # Buscar activo en source o resource
            for asset_type, criticality in self.asset_criticality.items():
                if asset_type in source or asset_type in resource:
                    return self.severity_rules['asset_criticality_multiplier'].get(criticality, 1.0)
            
            return 1.0
            
        except Exception:
            return 1.0
    
    def _get_time_based_multiplier(self, event: Dict[str, Any]) -> float:
        """Obtener multiplicador basado en tiempo"""
        try:
            timestamp = datetime.fromisoformat(event.get('timestamp', datetime.now().isoformat()))
            hour = timestamp.hour
            weekday = timestamp.weekday()
            
            # Después de horas laborales
            if hour < 6 or hour > 22:
                return self.severity_rules['time_based_multiplier']['after_hours']
            
            # Fin de semana
            if weekday >= 5:
                return self.severity_rules['time_based_multiplier']['weekend']
            
            return self.severity_rules['time_based_multiplier']['business_hours']
            
        except Exception:
            return 1.0
    
    def _get_frequency_multiplier(self, event: Dict[str, Any]) -> float:
        """Obtener multiplicador basado en frecuencia"""
        try:
            source = event.get('source', '')
            incident_type = self._classify_event(event)
            
            if not incident_type:
                return 1.0
            
            # Contar incidentes recientes del mismo tipo y fuente
            recent_incidents = [
                inc for inc in self.incident_history[incident_type.value]
                if inc.source == source and 
                inc.timestamp > datetime.now() - timedelta(hours=24)
            ]
            
            count = len(recent_incidents)
            
            if count == 0:
                return self.severity_rules['frequency_multiplier']['first_occurrence']
            elif count < 3:
                return self.severity_rules['frequency_multiplier']['repeated']
            elif count < 10:
                return self.severity_rules['frequency_multiplier']['frequent']
            else:
                return self.severity_rules['frequency_multiplier']['persistent']
                
        except Exception:
            return 1.0
    
    def _generate_incident_id(self, event: Dict[str, Any]) -> str:
        """Generar ID único para el incidente"""
        import hashlib
        
        data = f"{event.get('source', '')}_{event.get('type', '')}_{event.get('timestamp', '')}"
        return f"inc_{hashlib.md5(data.encode()).hexdigest()[:8]}"
    
    def _generate_title(self, event: Dict[str, Any], incident_type: IncidentType) -> str:
        """Generar título del incidente"""
        source = event.get('source', 'Unknown source')
        incident_name = incident_type.value.replace('_', ' ').title()
        
        if 'details' in event and isinstance(event['details'], dict):
            details = event['details']
            if 'file' in details:
                return f"{incident_name} detected on {source} - File: {details['file']}"
            elif 'user' in details:
                return f"{incident_name} detected on {source} - User: {details['user']}"
            elif 'ip' in details:
                return f"{incident_name} detected on {source} - IP: {details['ip']}"
        
        return f"{incident_name} detected on {source}"
    
    def _generate_description(self, event: Dict[str, Any], incident_type: IncidentType) -> str:
        """Generar descripción del incidente"""
        base_description = f"A {incident_type.value.replace('_', ' ')} incident was detected"
        
        if 'message' in event:
            return f"{base_description}. Details: {event['message']}"
        elif 'description' in event:
            return f"{base_description}. {event['description']}"
        
        return base_description
    
    def _extract_affected_assets(self, event: Dict[str, Any]) -> List[str]:
        """Extraer activos afectados del evento"""
        assets = []
        
        # Source como activo
        if 'source' in event:
            assets.append(event['source'])
        
        # Resource como activo
        if 'resource' in event:
            assets.append(event['resource'])
        
        # Assets específicos en details
        if 'details' in event and isinstance(event['details'], dict):
            details = event['details']
            for key in ['target', 'host', 'server', 'endpoint']:
                if key in details:
                    assets.append(details[key])
        
        return list(set(assets))  # Eliminar duplicados
    
    def _extract_indicators(self, event: Dict[str, Any]) -> List[str]:
        """Extraer indicadores de compromiso del evento"""
        indicators = []
        
        # IPs
        if 'source_ip' in event:
            indicators.append(f"Source IP: {event['source_ip']}")
        if 'destination_ip' in event:
            indicators.append(f"Destination IP: {event['destination_ip']}")
        
        # Hashes de archivos
        if 'details' in event and isinstance(event['details'], dict):
            details = event['details']
            for hash_type in ['md5', 'sha1', 'sha256']:
                if hash_type in details:
                    indicators.append(f"{hash_type.upper()}: {details[hash_type]}")
        
        # URLs
        if 'url' in event:
            indicators.append(f"URL: {event['url']}")
        
        return indicators
    
    def _extract_evidence(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Extraer evidencia del evento"""
        evidence = {}
        
        # Copiar campos relevantes
        for field in ['source_ip', 'destination_ip', 'user_agent', 'session_id']:
            if field in event:
                evidence[field] = event[field]
        
        # Añadir detalles completos
        if 'details' in event:
            evidence['details'] = event['details']
        
        # Añadir metadatos
        evidence['raw_event'] = event
        
        return evidence
    
    def _calculate_confidence(self, event: Dict[str, Any], incident_type: IncidentType) -> float:
        """Calcular nivel de confianza de la detección"""
        try:
            confidence = 0.5  # Base
            
            # Boost por patrón de incidente
            pattern_config = self.incident_patterns.get(incident_type.value, {})
            confidence += pattern_config.get('confidence_boost', 0.0)
            
            # Boost por severidad
            severity = self._calculate_severity(event, incident_type)
            confidence += (severity.value - 1) * 0.05
            
            # Boost por evidencia
            if self._extract_indicators(event):
                confidence += 0.1
            
            # Boost por detalles específicos
            if 'details' in event and isinstance(event['details'], dict):
                confidence += 0.1
            
            return min(confidence, 1.0)
            
        except Exception:
            return 0.5
    
    def _generate_tags(self, event: Dict[str, Any], incident_type: IncidentType) -> List[str]:
        """Generar tags para el incidente"""
        tags = [incident_type.value]
        
        # Tags por tipo de activo
        source = event.get('source', '').lower()
        for asset_type in self.asset_criticality.keys():
            if asset_type in source:
                tags.append(asset_type)
                break
        
        # Tags por severidad
        severity = self._calculate_severity(event, incident_type)
        tags.append(f"severity_{severity.name.lower()}")
        
        # Tags por tiempo
        timestamp = datetime.fromisoformat(event.get('timestamp', datetime.now().isoformat()))
        if timestamp.hour < 6 or timestamp.hour > 22:
            tags.append("after_hours")
        
        return tags

# Función de integración con lucIA
def detect_security_incident(event_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Función principal para integración con lucIA"""
    try:
        detector = IncidentDetector()
        incident = detector.detect(event_data)
        
        if incident:
            return {
                'incident_id': incident.id,
                'type': incident.type.value,
                'severity': incident.severity.name,
                'title': incident.title,
                'confidence': incident.confidence,
                'affected_assets': incident.affected_assets,
                'indicators': incident.indicators
            }
        else:
            return None
            
    except Exception as e:
        logger.error(f"Error en detección de incidente: {e}")
        return None

if __name__ == "__main__":
    # Ejemplo de uso
    test_event = {
        'type': 'malware_detected',
        'source': 'endpoint_42',
        'severity': 8,
        'message': 'Antivirus detected suspicious file: ransomware.exe',
        'details': {
            'file': 'ransomware.exe',
            'user': 'alice',
            'md5': 'abc123def456',
            'path': '/home/alice/downloads/'
        },
        'timestamp': datetime.now().isoformat()
    }
    
    result = detect_security_incident(test_event)
    print("Incidente detectado:", result) 