#!/usr/bin/env python3
"""
threat_intel_manager.py
Gestor de Threat Intelligence para lucIA
Integra feeds de amenazas, analiza IOCs y correlaciona amenazas globales
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
import hashlib
import requests
import sqlite3
from pathlib import Path
import yaml
import xml.etree.ElementTree as ET
from urllib.parse import urlparse
import ipaddress
import re

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ThreatIndicator:
    """Indicador de Compromiso (IOC)"""
    id: str
    type: str  # "ip", "domain", "url", "hash", "email"
    value: str
    confidence: float  # 0.0 - 1.0
    severity: int  # 1-10
    first_seen: datetime
    last_seen: datetime
    tags: List[str]
    description: str
    source: str
    tlp: str  # "WHITE", "GREEN", "AMBER", "RED"
    status: str  # "active", "expired", "false_positive"

@dataclass
class ThreatFeed:
    """Feed de Threat Intelligence"""
    id: str
    name: str
    description: str
    url: str
    format: str  # "json", "xml", "csv", "stix"
    update_interval: int  # minutos
    last_update: Optional[datetime] = None
    enabled: bool = True
    api_key: Optional[str] = None
    headers: Dict[str, str] = None
    parser_config: Dict[str, Any] = None

@dataclass
class ThreatCampaign:
    """Campaña de amenazas"""
    id: str
    name: str
    description: str
    threat_actors: List[str]
    targets: List[str]
    techniques: List[str]
    indicators: List[str]
    first_seen: datetime
    last_seen: datetime
    status: str  # "active", "inactive", "resolved"
    confidence: float
    severity: int

@dataclass
class RiskScore:
    """Puntuación de riesgo"""
    entity_id: str
    entity_type: str  # "ip", "domain", "user", "system"
    score: float  # 0.0 - 100.0
    factors: List[str]
    timestamp: datetime
    confidence: float
    trend: str  # "increasing", "decreasing", "stable"

class ThreatIntelManager:
    """Gestor principal de Threat Intelligence"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.indicators: Dict[str, ThreatIndicator] = {}
        self.feeds: Dict[str, ThreatFeed] = {}
        self.campaigns: Dict[str, ThreatCampaign] = {}
        self.risk_scores: Dict[str, RiskScore] = {}
        self.db_path = "threat_intel.db"
        
        # Inicializar base de datos
        self._init_database()
        
        # Cargar configuración por defecto
        self._load_default_feeds()
        
        # Inicializar monitoreo
        self.running = False
        self.monitoring_thread = None
        
        logger.info("Threat Intelligence Manager inicializado")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Cargar configuración de threat intelligence"""
        default_config = {
            'update_interval': 30,  # minutos
            'max_indicators': 100000,
            'confidence_threshold': 0.7,
            'severity_threshold': 5,
            'enable_auto_correlation': True,
            'enable_risk_scoring': True,
            'enable_community_sharing': True,
            'max_feed_age': 24,  # horas
            'retention_period': 90,  # días
            'api_timeout': 30,  # segundos
            'max_retries': 3,
            'cache_enabled': True,
            'cache_ttl': 3600,  # segundos
            'default_tlp': 'AMBER',
            'enable_stix_import': True,
            'enable_misp_export': True,
            'misp_url': 'https://misp.example.com',
            'misp_api_key': None
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
            
            # Tabla de indicadores
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS threat_indicators (
                    id TEXT PRIMARY KEY,
                    type TEXT,
                    value TEXT,
                    confidence REAL,
                    severity INTEGER,
                    first_seen TEXT,
                    last_seen TEXT,
                    tags TEXT,
                    description TEXT,
                    source TEXT,
                    tlp TEXT,
                    status TEXT
                )
            ''')
            
            # Tabla de feeds
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS threat_feeds (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    url TEXT,
                    format TEXT,
                    update_interval INTEGER,
                    last_update TEXT,
                    enabled INTEGER,
                    api_key TEXT,
                    headers TEXT,
                    parser_config TEXT
                )
            ''')
            
            # Tabla de campañas
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS threat_campaigns (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    threat_actors TEXT,
                    targets TEXT,
                    techniques TEXT,
                    indicators TEXT,
                    first_seen TEXT,
                    last_seen TEXT,
                    status TEXT,
                    confidence REAL,
                    severity INTEGER
                )
            ''')
            
            # Tabla de puntuaciones de riesgo
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS risk_scores (
                    entity_id TEXT,
                    entity_type TEXT,
                    score REAL,
                    factors TEXT,
                    timestamp TEXT,
                    confidence REAL,
                    trend TEXT,
                    PRIMARY KEY (entity_id, entity_type, timestamp)
                )
            ''')
            
            # Tabla de correlaciones
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS correlations (
                    id TEXT PRIMARY KEY,
                    indicator_id TEXT,
                    related_indicators TEXT,
                    correlation_strength REAL,
                    timestamp TEXT,
                    evidence TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
    
    def _load_default_feeds(self):
        """Cargar feeds de threat intelligence por defecto"""
        default_feeds = [
            ThreatFeed(
                id="abuseipdb",
                name="AbuseIPDB",
                description="Feed de IPs maliciosas",
                url="https://api.abuseipdb.com/api/v2/blacklist",
                format="json",
                update_interval=60,
                parser_config={
                    "data_path": "data",
                    "indicator_field": "ipAddress",
                    "confidence_field": "abuseConfidenceScore",
                    "tags_field": "countryCode"
                }
            ),
            ThreatFeed(
                id="virustotal",
                name="VirusTotal",
                description="Feed de hashes maliciosos",
                url="https://www.virustotal.com/vtapi/v2/file/report",
                format="json",
                update_interval=120,
                parser_config={
                    "data_path": "positives",
                    "total_field": "total",
                    "scanners_field": "scans"
                }
            ),
            ThreatFeed(
                id="phishtank",
                name="PhishTank",
                description="Feed de URLs de phishing",
                url="https://data.phishtank.com/data/online-valid.json",
                format="json",
                update_interval=30,
                parser_config={
                    "data_path": "url",
                    "phish_id_field": "phish_id",
                    "submission_time_field": "submission_time"
                }
            ),
            ThreatFeed(
                id="malware_bazaar",
                name="Malware Bazaar",
                description="Feed de malware",
                url="https://bazaar.abuse.ch/export/txt/recent/",
                format="txt",
                update_interval=60,
                parser_config={
                    "separator": "\n",
                    "comment_prefix": "#"
                }
            ),
            ThreatFeed(
                id="tor_exit_nodes",
                name="Tor Exit Nodes",
                description="Nodos de salida de Tor",
                url="https://check.torproject.org/exit-addresses",
                format="txt",
                update_interval=180,
                parser_config={
                    "prefix": "ExitAddress",
                    "ip_field": 1
                }
            )
        ]
        
        for feed in default_feeds:
            self.add_feed(feed)
    
    def add_feed(self, feed: ThreatFeed) -> bool:
        """Añadir nuevo feed de threat intelligence"""
        try:
            self.feeds[feed.id] = feed
            self._save_feed_to_db(feed)
            
            logger.info(f"Feed añadido: {feed.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo feed: {e}")
            return False
    
    def remove_feed(self, feed_id: str) -> bool:
        """Eliminar feed de threat intelligence"""
        try:
            if feed_id in self.feeds:
                feed = self.feeds[feed_id]
                del self.feeds[feed_id]
                self._remove_feed_from_db(feed_id)
                
                logger.info(f"Feed eliminado: {feed.name}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error eliminando feed: {e}")
            return False
    
    def update_feeds(self) -> Dict[str, Any]:
        """Actualizar todos los feeds habilitados"""
        results = {
            'total_feeds': len(self.feeds),
            'updated_feeds': 0,
            'failed_feeds': 0,
            'new_indicators': 0,
            'errors': []
        }
        
        for feed_id, feed in self.feeds.items():
            if not feed.enabled:
                continue
            
            try:
                # Verificar si es necesario actualizar
                if feed.last_update:
                    time_since_update = datetime.now() - feed.last_update
                    if time_since_update.total_seconds() < feed.update_interval * 60:
                        continue
                
                # Actualizar feed
                indicators_added = self._update_single_feed(feed)
                results['updated_feeds'] += 1
                results['new_indicators'] += indicators_added
                
                # Actualizar timestamp
                feed.last_update = datetime.now()
                self._update_feed_in_db(feed)
                
                logger.info(f"Feed actualizado: {feed.name} - {indicators_added} indicadores")
                
            except Exception as e:
                results['failed_feeds'] += 1
                results['errors'].append(f"Error actualizando {feed.name}: {e}")
                logger.error(f"Error actualizando feed {feed.name}: {e}")
        
        return results
    
    def _update_single_feed(self, feed: ThreatFeed) -> int:
        """Actualizar un feed específico"""
        try:
            # Realizar request al feed
            headers = feed.headers or {}
            if feed.api_key:
                headers['Authorization'] = f'Bearer {feed.api_key}'
            
            response = requests.get(
                feed.url,
                headers=headers,
                timeout=self.config['api_timeout']
            )
            response.raise_for_status()
            
            # Parsear respuesta según el formato
            if feed.format == 'json':
                data = response.json()
                indicators = self._parse_json_feed(data, feed)
            elif feed.format == 'xml':
                root = ET.fromstring(response.text)
                indicators = self._parse_xml_feed(root, feed)
            elif feed.format == 'csv':
                indicators = self._parse_csv_feed(response.text, feed)
            elif feed.format == 'txt':
                indicators = self._parse_txt_feed(response.text, feed)
            else:
                raise ValueError(f"Formato no soportado: {feed.format}")
            
            # Añadir indicadores
            added_count = 0
            for indicator in indicators:
                if self._add_indicator(indicator):
                    added_count += 1
            
            return added_count
            
        except Exception as e:
            logger.error(f"Error actualizando feed {feed.name}: {e}")
            raise
    
    def _parse_json_feed(self, data: Dict[str, Any], feed: ThreatFeed) -> List[ThreatIndicator]:
        """Parsear feed en formato JSON"""
        indicators = []
        config = feed.parser_config or {}
        
        # Obtener datos según configuración
        data_path = config.get('data_path', 'data')
        if data_path:
            if isinstance(data, dict) and data_path in data:
                items = data[data_path]
            else:
                items = data
        else:
            items = data
        
        if not isinstance(items, list):
            items = [items]
        
        for item in items:
            try:
                # Extraer campos según configuración
                value = item.get(config.get('indicator_field', 'value'), '')
                confidence = item.get(config.get('confidence_field', 'confidence'), 0.5)
                severity = item.get('severity', 5)
                description = item.get('description', f'Indicador de {feed.name}')
                tags = item.get(config.get('tags_field', 'tags'), [])
                
                if isinstance(tags, str):
                    tags = [tags]
                
                # Crear indicador
                indicator = ThreatIndicator(
                    id=f"{feed.id}_{hashlib.md5(value.encode()).hexdigest()}",
                    type=self._detect_indicator_type(value),
                    value=value,
                    confidence=float(confidence),
                    severity=int(severity),
                    first_seen=datetime.now(),
                    last_seen=datetime.now(),
                    tags=tags,
                    description=description,
                    source=feed.name,
                    tlp=self.config['default_tlp'],
                    status="active"
                )
                
                indicators.append(indicator)
                
            except Exception as e:
                logger.warning(f"Error parseando item en {feed.name}: {e}")
        
        return indicators
    
    def _parse_xml_feed(self, root: ET.Element, feed: ThreatFeed) -> List[ThreatIndicator]:
        """Parsear feed en formato XML"""
        indicators = []
        config = feed.parser_config or {}
        
        # Buscar elementos según configuración
        for item in root.findall(config.get('item_path', './/item')):
            try:
                value = item.find(config.get('indicator_field', 'value')).text
                confidence = float(item.find(config.get('confidence_field', 'confidence')).text or 0.5)
                severity = int(item.find('severity').text or 5)
                description = item.find('description').text or f'Indicador de {feed.name}'
                
                indicator = ThreatIndicator(
                    id=f"{feed.id}_{hashlib.md5(value.encode()).hexdigest()}",
                    type=self._detect_indicator_type(value),
                    value=value,
                    confidence=confidence,
                    severity=severity,
                    first_seen=datetime.now(),
                    last_seen=datetime.now(),
                    tags=[],
                    description=description,
                    source=feed.name,
                    tlp=self.config['default_tlp'],
                    status="active"
                )
                
                indicators.append(indicator)
                
            except Exception as e:
                logger.warning(f"Error parseando XML item en {feed.name}: {e}")
        
        return indicators
    
    def _parse_csv_feed(self, csv_data: str, feed: ThreatFeed) -> List[ThreatIndicator]:
        """Parsear feed en formato CSV"""
        indicators = []
        config = feed.parser_config or {}
        
        lines = csv_data.strip().split('\n')
        if not lines:
            return indicators
        
        # Obtener headers
        headers = lines[0].split(',')
        value_index = headers.index(config.get('indicator_field', 'value'))
        confidence_index = headers.index(config.get('confidence_field', 'confidence')) if config.get('confidence_field', 'confidence') in headers else None
        severity_index = headers.index('severity') if 'severity' in headers else None
        
        for line in lines[1:]:
            try:
                values = line.split(',')
                value = values[value_index]
                confidence = float(values[confidence_index]) if confidence_index and confidence_index < len(values) else 0.5
                severity = int(values[severity_index]) if severity_index and severity_index < len(values) else 5
                
                indicator = ThreatIndicator(
                    id=f"{feed.id}_{hashlib.md5(value.encode()).hexdigest()}",
                    type=self._detect_indicator_type(value),
                    value=value,
                    confidence=confidence,
                    severity=severity,
                    first_seen=datetime.now(),
                    last_seen=datetime.now(),
                    tags=[],
                    description=f'Indicador de {feed.name}',
                    source=feed.name,
                    tlp=self.config['default_tlp'],
                    status="active"
                )
                
                indicators.append(indicator)
                
            except Exception as e:
                logger.warning(f"Error parseando CSV item en {feed.name}: {e}")
        
        return indicators
    
    def _parse_txt_feed(self, txt_data: str, feed: ThreatFeed) -> List[ThreatIndicator]:
        """Parsear feed en formato TXT"""
        indicators = []
        config = feed.parser_config or {}
        
        lines = txt_data.strip().split('\n')
        prefix = config.get('prefix', '')
        separator = config.get('separator', ' ')
        comment_prefix = config.get('comment_prefix', '#')
        
        for line in lines:
            try:
                # Ignorar comentarios
                if line.startswith(comment_prefix):
                    continue
                
                # Filtrar por prefijo si está configurado
                if prefix and not line.startswith(prefix):
                    continue
                
                # Extraer valor
                parts = line.split(separator)
                if prefix:
                    parts = parts[1:]  # Remover prefijo
                
                if not parts:
                    continue
                
                value = parts[0].strip()
                if not value:
                    continue
                
                indicator = ThreatIndicator(
                    id=f"{feed.id}_{hashlib.md5(value.encode()).hexdigest()}",
                    type=self._detect_indicator_type(value),
                    value=value,
                    confidence=0.8,  # Valor por defecto para feeds TXT
                    severity=5,
                    first_seen=datetime.now(),
                    last_seen=datetime.now(),
                    tags=[],
                    description=f'Indicador de {feed.name}',
                    source=feed.name,
                    tlp=self.config['default_tlp'],
                    status="active"
                )
                
                indicators.append(indicator)
                
            except Exception as e:
                logger.warning(f"Error parseando TXT item en {feed.name}: {e}")
        
        return indicators
    
    def _detect_indicator_type(self, value: str) -> str:
        """Detectar tipo de indicador basado en el valor"""
        value = value.strip().lower()
        
        # IP address
        try:
            ipaddress.ip_address(value)
            return "ip"
        except ValueError:
            pass
        
        # Domain
        if re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$', value):
            return "domain"
        
        # URL
        if value.startswith(('http://', 'https://', 'ftp://')):
            return "url"
        
        # Email
        if re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            return "email"
        
        # Hash (MD5, SHA1, SHA256)
        if re.match(r'^[a-fA-F0-9]{32}$', value):
            return "hash"  # MD5
        elif re.match(r'^[a-fA-F0-9]{40}$', value):
            return "hash"  # SHA1
        elif re.match(r'^[a-fA-F0-9]{64}$', value):
            return "hash"  # SHA256
        
        # Default
        return "unknown"
    
    def _add_indicator(self, indicator: ThreatIndicator) -> bool:
        """Añadir indicador a la base de datos"""
        try:
            # Verificar si ya existe
            if indicator.id in self.indicators:
                # Actualizar último visto
                existing = self.indicators[indicator.id]
                existing.last_seen = datetime.now()
                self._update_indicator_in_db(existing)
                return False
            
            # Verificar umbrales
            if (indicator.confidence < self.config['confidence_threshold'] or 
                indicator.severity < self.config['severity_threshold']):
                return False
            
            # Añadir indicador
            self.indicators[indicator.id] = indicator
            self._save_indicator_to_db(indicator)
            
            # Correlación automática si está habilitada
            if self.config['enable_auto_correlation']:
                self._correlate_indicator(indicator)
            
            # Actualizar puntuación de riesgo si está habilitada
            if self.config['enable_risk_scoring']:
                self._update_risk_score(indicator)
            
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo indicador: {e}")
            return False
    
    def _correlate_indicator(self, indicator: ThreatIndicator):
        """Correlacionar indicador con otros existentes"""
        try:
            related_indicators = []
            
            # Buscar indicadores relacionados por tipo
            for other_id, other in self.indicators.items():
                if other_id == indicator.id:
                    continue
                
                correlation_strength = 0.0
                evidence = []
                
                # Correlación por fuente
                if other.source == indicator.source:
                    correlation_strength += 0.3
                    evidence.append(f"Misma fuente: {indicator.source}")
                
                # Correlación por tags
                common_tags = set(indicator.tags) & set(other.tags)
                if common_tags:
                    correlation_strength += 0.2
                    evidence.append(f"Tags comunes: {', '.join(common_tags)}")
                
                # Correlación por severidad similar
                if abs(other.severity - indicator.severity) <= 2:
                    correlation_strength += 0.1
                    evidence.append("Severidad similar")
                
                # Correlación por tiempo (mismo período)
                time_diff = abs((other.last_seen - indicator.last_seen).total_seconds())
                if time_diff < 3600:  # 1 hora
                    correlation_strength += 0.2
                    evidence.append("Tiempo cercano")
                
                if correlation_strength > 0.3:
                    related_indicators.append({
                        'id': other_id,
                        'strength': correlation_strength,
                        'evidence': evidence
                    })
            
            # Guardar correlación
            if related_indicators:
                correlation_id = f"corr_{indicator.id}_{int(time.time())}"
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO correlations (id, indicator_id, related_indicators, 
                                             correlation_strength, timestamp, evidence)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (correlation_id, indicator.id, json.dumps(related_indicators),
                      max(r['strength'] for r in related_indicators),
                      datetime.now().isoformat(), json.dumps(evidence)))
                conn.commit()
                conn.close()
                
        except Exception as e:
            logger.error(f"Error correlacionando indicador: {e}")
    
    def _update_risk_score(self, indicator: ThreatIndicator):
        """Actualizar puntuación de riesgo para la entidad"""
        try:
            entity_id = indicator.value
            entity_type = indicator.type
            
            # Calcular puntuación base
            base_score = indicator.severity * 10 * indicator.confidence
            
            # Factores adicionales
            factors = [f"Indicador de {indicator.source}"]
            
            # Penalizar por múltiples indicadores
            similar_indicators = [i for i in self.indicators.values() 
                                if i.value == indicator.value and i.id != indicator.id]
            if similar_indicators:
                base_score *= (1 + len(similar_indicators) * 0.2)
                factors.append(f"Múltiples indicadores: {len(similar_indicators) + 1}")
            
            # Penalizar por alta severidad
            if indicator.severity >= 8:
                base_score *= 1.5
                factors.append("Alta severidad")
            
            # Limitar puntuación máxima
            final_score = min(base_score, 100.0)
            
            # Determinar tendencia
            trend = "stable"
            if entity_id in self.risk_scores:
                old_score = self.risk_scores[entity_id].score
                if final_score > old_score + 10:
                    trend = "increasing"
                elif final_score < old_score - 10:
                    trend = "decreasing"
            
            # Crear puntuación de riesgo
            risk_score = RiskScore(
                entity_id=entity_id,
                entity_type=entity_type,
                score=final_score,
                factors=factors,
                timestamp=datetime.now(),
                confidence=indicator.confidence,
                trend=trend
            )
            
            self.risk_scores[entity_id] = risk_score
            self._save_risk_score_to_db(risk_score)
            
        except Exception as e:
            logger.error(f"Error actualizando puntuación de riesgo: {e}")
    
    def check_indicator(self, value: str, indicator_type: Optional[str] = None) -> Optional[ThreatIndicator]:
        """Verificar si un valor es un indicador de amenaza"""
        try:
            # Detectar tipo si no se proporciona
            if not indicator_type:
                indicator_type = self._detect_indicator_type(value)
            
            # Buscar indicador exacto
            for indicator in self.indicators.values():
                if indicator.value.lower() == value.lower() and indicator.type == indicator_type:
                    return indicator
            
            # Buscar indicadores similares
            similar_indicators = []
            for indicator in self.indicators.values():
                if indicator.type == indicator_type:
                    similarity = self._calculate_similarity(value, indicator.value)
                    if similarity > 0.8:
                        similar_indicators.append((indicator, similarity))
            
            if similar_indicators:
                # Retornar el más similar
                return max(similar_indicators, key=lambda x: x[1])[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Error verificando indicador: {e}")
            return None
    
    def _calculate_similarity(self, value1: str, value2: str) -> float:
        """Calcular similitud entre dos valores"""
        try:
            # Normalizar valores
            v1 = value1.lower().strip()
            v2 = value2.lower().strip()
            
            if v1 == v2:
                return 1.0
            
            # Similitud de Levenshtein para dominios
            if '.' in v1 and '.' in v2:
                return self._levenshtein_similarity(v1, v2)
            
            # Similitud de prefijo para IPs
            if self._detect_indicator_type(v1) == "ip":
                return self._ip_similarity(v1, v2)
            
            return 0.0
            
        except Exception:
            return 0.0
    
    def _levenshtein_similarity(self, s1: str, s2: str) -> float:
        """Calcular similitud usando distancia de Levenshtein"""
        if len(s1) < len(s2):
            return self._levenshtein_similarity(s2, s1)
        
        if len(s2) == 0:
            return 0.0
        
        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        distance = previous_row[-1]
        max_len = max(len(s1), len(s2))
        return 1.0 - (distance / max_len)
    
    def _ip_similarity(self, ip1: str, ip2: str) -> float:
        """Calcular similitud entre IPs"""
        try:
            ip1_obj = ipaddress.ip_address(ip1)
            ip2_obj = ipaddress.ip_address(ip2)
            
            # Misma red
            if ip1_obj.version == ip2_obj.version:
                # Calcular distancia
                distance = abs(int(ip1_obj) - int(ip2_obj))
                max_distance = 2**32 if ip1_obj.version == 4 else 2**128
                return 1.0 - (distance / max_distance)
            
            return 0.0
            
        except Exception:
            return 0.0
    
    def get_risk_score(self, entity_id: str, entity_type: str) -> Optional[RiskScore]:
        """Obtener puntuación de riesgo de una entidad"""
        key = f"{entity_id}_{entity_type}"
        return self.risk_scores.get(key)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de threat intelligence"""
        current_time = datetime.now()
        last_24h = current_time - timedelta(hours=24)
        
        # Indicadores por tipo
        indicators_by_type = defaultdict(int)
        for indicator in self.indicators.values():
            indicators_by_type[indicator.type] += 1
        
        # Indicadores por severidad
        indicators_by_severity = defaultdict(int)
        for indicator in self.indicators.values():
            indicators_by_severity[indicator.severity] += 1
        
        # Indicadores recientes
        recent_indicators = [i for i in self.indicators.values() if i.last_seen > last_24h]
        
        # Feeds activos
        active_feeds = [f for f in self.feeds.values() if f.enabled]
        
        return {
            'total_indicators': len(self.indicators),
            'active_feeds': len(active_feeds),
            'total_feeds': len(self.feeds),
            'recent_indicators_24h': len(recent_indicators),
            'indicators_by_type': dict(indicators_by_type),
            'indicators_by_severity': dict(indicators_by_severity),
            'total_campaigns': len(self.campaigns),
            'total_risk_scores': len(self.risk_scores),
            'average_confidence': sum(i.confidence for i in self.indicators.values()) / len(self.indicators) if self.indicators else 0
        }
    
    def _save_indicator_to_db(self, indicator: ThreatIndicator):
        """Guardar indicador en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO threat_indicators 
                (id, type, value, confidence, severity, first_seen, last_seen,
                 tags, description, source, tlp, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (indicator.id, indicator.type, indicator.value, indicator.confidence,
                  indicator.severity, indicator.first_seen.isoformat(), indicator.last_seen.isoformat(),
                  json.dumps(indicator.tags), indicator.description, indicator.source,
                  indicator.tlp, indicator.status))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando indicador en DB: {e}")
    
    def _save_feed_to_db(self, feed: ThreatFeed):
        """Guardar feed en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO threat_feeds 
                (id, name, description, url, format, update_interval, last_update,
                 enabled, api_key, headers, parser_config)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (feed.id, feed.name, feed.description, feed.url, feed.format,
                  feed.update_interval, feed.last_update.isoformat() if feed.last_update else None,
                  feed.enabled, feed.api_key, json.dumps(feed.headers or {}),
                  json.dumps(feed.parser_config or {})))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando feed en DB: {e}")
    
    def _save_risk_score_to_db(self, risk_score: RiskScore):
        """Guardar puntuación de riesgo en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO risk_scores 
                (entity_id, entity_type, score, factors, timestamp, confidence, trend)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (risk_score.entity_id, risk_score.entity_type, risk_score.score,
                  json.dumps(risk_score.factors), risk_score.timestamp.isoformat(),
                  risk_score.confidence, risk_score.trend))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando puntuación de riesgo en DB: {e}")
    
    def _update_indicator_in_db(self, indicator: ThreatIndicator):
        """Actualizar indicador en base de datos"""
        self._save_indicator_to_db(indicator)
    
    def _update_feed_in_db(self, feed: ThreatFeed):
        """Actualizar feed en base de datos"""
        self._save_feed_to_db(feed)
    
    def _remove_feed_from_db(self, feed_id: str):
        """Eliminar feed de base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM threat_feeds WHERE id = ?', (feed_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error eliminando feed de DB: {e}")
    
    def start_monitoring(self):
        """Iniciar monitoreo de feeds"""
        self.running = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()
        logger.info("Monitoreo de threat intelligence iniciado")
    
    def stop_monitoring(self):
        """Detener monitoreo de feeds"""
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
        logger.info("Monitoreo de threat intelligence detenido")
    
    def _monitoring_loop(self):
        """Bucle de monitoreo"""
        while self.running:
            try:
                # Actualizar feeds
                results = self.update_feeds()
                
                # Limpiar indicadores antiguos
                self._cleanup_old_indicators()
                
                # Log de resultados
                if results['updated_feeds'] > 0:
                    logger.info(f"Feeds actualizados: {results['updated_feeds']}, "
                              f"Nuevos indicadores: {results['new_indicators']}")
                
                time.sleep(self.config['update_interval'] * 60)
                
            except Exception as e:
                logger.error(f"Error en bucle de monitoreo: {e}")
                time.sleep(60)
    
    def _cleanup_old_indicators(self):
        """Limpiar indicadores antiguos"""
        try:
            cutoff_date = datetime.now() - timedelta(days=self.config['retention_period'])
            indicators_to_remove = []
            
            for indicator in self.indicators.values():
                if indicator.last_seen < cutoff_date:
                    indicators_to_remove.append(indicator.id)
            
            for indicator_id in indicators_to_remove:
                del self.indicators[indicator_id]
            
            if indicators_to_remove:
                logger.info(f"Limpiados {len(indicators_to_remove)} indicadores antiguos")
                
        except Exception as e:
            logger.error(f"Error limpiando indicadores antiguos: {e}")

# Función principal para integración con lucIA
def run_threat_intel_analysis(target_data: str = None) -> str:
    """Función principal para integración con lucIA"""
    try:
        intel_manager = ThreatIntelManager()
        intel_manager.start_monitoring()
        
        if target_data:
            # Verificar si el dato es un indicador de amenaza
            indicator = intel_manager.check_indicator(target_data)
            if indicator:
                return f"Amenaza detectada: {indicator.type} - Severidad: {indicator.severity} - Confianza: {indicator.confidence}"
            else:
                return "Análisis completado: No se detectaron amenazas conocidas"
        else:
            stats = intel_manager.get_statistics()
            return f"Threat Intelligence activo. Indicadores: {stats['total_indicators']}, Feeds: {stats['active_feeds']}"
    
    except Exception as e:
        return f"Error en análisis de threat intelligence: {e}"

if __name__ == "__main__":
    # Ejemplo de uso
    result = run_threat_intel_analysis()
    print(result) 