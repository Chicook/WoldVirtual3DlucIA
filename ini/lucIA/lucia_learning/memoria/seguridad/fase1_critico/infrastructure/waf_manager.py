#!/usr/bin/env python3
"""
WAF Manager - Gestión de Web Application Firewall
Implementa protección avanzada contra ataques web
"""

import logging
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class WAFManager:
    """Gestor de Web Application Firewall"""
    
    def __init__(self):
        self.rules = self._load_default_rules()
        self.blocked_ips = set()
        self.request_log = []
        self.attack_patterns = self._load_attack_patterns()
        
    def _load_default_rules(self) -> List[Dict[str, Any]]:
        """Carga reglas por defecto del WAF"""
        return [
            {
                'id': 'SQL_INJECTION_001',
                'name': 'SQL Injection Detection',
                'pattern': r'(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(from|into|where|table|database)\b)',
                'action': 'block',
                'severity': 'critical',
                'description': 'Detecta intentos de SQL injection'
            },
            {
                'id': 'XSS_001',
                'name': 'Cross-Site Scripting Detection',
                'pattern': r'(<script|javascript:|vbscript:|onload=|onerror=|onclick=)',
                'action': 'block',
                'severity': 'high',
                'description': 'Detecta intentos de XSS'
            },
            {
                'id': 'PATH_TRAVERSAL_001',
                'name': 'Path Traversal Detection',
                'pattern': r'(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)',
                'action': 'block',
                'severity': 'high',
                'description': 'Detecta intentos de path traversal'
            },
            {
                'id': 'COMMAND_INJECTION_001',
                'name': 'Command Injection Detection',
                'pattern': r'(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)',
                'action': 'block',
                'severity': 'critical',
                'description': 'Detecta intentos de command injection'
            },
            {
                'id': 'LFI_001',
                'name': 'Local File Inclusion Detection',
                'pattern': r'(include|require|include_once|require_once).*[\'"][^"\']*\.\.',
                'action': 'block',
                'severity': 'high',
                'description': 'Detecta intentos de LFI'
            }
        ]
        
    def _load_attack_patterns(self) -> Dict[str, List[str]]:
        """Carga patrones de ataque conocidos"""
        return {
            'sql_injection': [
                "' OR '1'='1",
                "'; DROP TABLE users; --",
                "' UNION SELECT * FROM users --",
                "admin'--",
                "1' OR '1' = '1' --"
            ],
            'xss': [
                "<script>alert('XSS')</script>",
                "javascript:alert('XSS')",
                "<img src=x onerror=alert('XSS')>",
                "';alert('XSS');//"
            ],
            'path_traversal': [
                "../../../etc/passwd",
                "..\\..\\..\\windows\\system32\\config\\sam",
                "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
            ],
            'command_injection': [
                "; ls -la",
                "| cat /etc/passwd",
                "& whoami",
                "`id`"
            ]
        }
        
    def analyze_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analiza una petición HTTP para detectar amenazas
        
        Args:
            request_data: Datos de la petición HTTP
            
        Returns:
            Dict con resultado del análisis
        """
        result = {
            'allowed': True,
            'threats_detected': [],
            'action_taken': 'allow',
            'ip_blocked': False,
            'timestamp': datetime.now().isoformat()
        }
        
        # Verificar IP bloqueada
        client_ip = request_data.get('client_ip', '')
        if client_ip in self.blocked_ips:
            result['allowed'] = False
            result['action_taken'] = 'block'
            result['ip_blocked'] = True
            result['threats_detected'].append('IP bloqueada')
            return result
            
        # Analizar URL
        url = request_data.get('url', '')
        url_threats = self._analyze_url(url)
        result['threats_detected'].extend(url_threats)
        
        # Analizar headers
        headers = request_data.get('headers', {})
        header_threats = self._analyze_headers(headers)
        result['threats_detected'].extend(header_threats)
        
        # Analizar body
        body = request_data.get('body', '')
        body_threats = self._analyze_body(body)
        result['threats_detected'].extend(body_threats)
        
        # Analizar parámetros
        params = request_data.get('params', {})
        param_threats = self._analyze_parameters(params)
        result['threats_detected'].extend(param_threats)
        
        # Determinar acción
        if result['threats_detected']:
            result['allowed'] = False
            result['action_taken'] = 'block'
            
            # Bloquear IP si hay amenazas críticas
            critical_threats = [t for t in result['threats_detected'] if 'critical' in t.lower()]
            if critical_threats:
                self.blocked_ips.add(client_ip)
                result['ip_blocked'] = True
                
        # Registrar petición
        self._log_request(request_data, result)
        
        return result
        
    def _analyze_url(self, url: str) -> List[str]:
        """Analiza URL en busca de amenazas"""
        threats = []
        
        for rule in self.rules:
            if re.search(rule['pattern'], url, re.IGNORECASE):
                threats.append(f"{rule['name']} ({rule['severity']})")
                
        return threats
        
    def _analyze_headers(self, headers: Dict[str, str]) -> List[str]:
        """Analiza headers en busca de amenazas"""
        threats = []
        
        # Verificar User-Agent sospechoso
        user_agent = headers.get('User-Agent', '').lower()
        suspicious_agents = ['sqlmap', 'nikto', 'nmap', 'w3af', 'burp']
        for agent in suspicious_agents:
            if agent in user_agent:
                threats.append(f"Suspicious User-Agent: {agent}")
                
        # Verificar Referer malicioso
        referer = headers.get('Referer', '')
        if referer and not referer.startswith(('http://', 'https://')):
            threats.append("Malicious Referer header")
            
        return threats
        
    def _analyze_body(self, body: str) -> List[str]:
        """Analiza body de la petición en busca de amenazas"""
        threats = []
        
        for rule in self.rules:
            if re.search(rule['pattern'], body, re.IGNORECASE):
                threats.append(f"{rule['name']} in body ({rule['severity']})")
                
        return threats
        
    def _analyze_parameters(self, params: Dict[str, str]) -> List[str]:
        """Analiza parámetros en busca de amenazas"""
        threats = []
        
        for param_name, param_value in params.items():
            for rule in self.rules:
                if re.search(rule['pattern'], param_value, re.IGNORECASE):
                    threats.append(f"{rule['name']} in parameter '{param_name}' ({rule['severity']})")
                    
        return threats
        
    def _log_request(self, request_data: Dict[str, Any], result: Dict[str, Any]):
        """Registra la petición y su resultado"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'client_ip': request_data.get('client_ip', ''),
            'method': request_data.get('method', ''),
            'url': request_data.get('url', ''),
            'allowed': result['allowed'],
            'threats_detected': result['threats_detected'],
            'action_taken': result['action_taken']
        }
        
        self.request_log.append(log_entry)
        
        # Mantener solo las últimas 1000 entradas
        if len(self.request_log) > 1000:
            self.request_log = self.request_log[-1000:]
            
    def add_custom_rule(self, rule: Dict[str, Any]) -> bool:
        """
        Añade una regla personalizada al WAF
        
        Args:
            rule: Regla a añadir
            
        Returns:
            bool: True si se añadió correctamente
        """
        try:
            # Validar regla
            required_fields = ['id', 'name', 'pattern', 'action', 'severity']
            for field in required_fields:
                if field not in rule:
                    logger.error(f"Campo requerido faltante: {field}")
                    return False
                    
            # Verificar que el patrón es válido
            try:
                re.compile(rule['pattern'])
            except re.error as e:
                logger.error(f"Patrón regex inválido: {e}")
                return False
                
            # Añadir regla
            self.rules.append(rule)
            logger.info(f"Regla personalizada añadida: {rule['name']}")
            return True
            
        except Exception as e:
            logger.error(f"Error añadiendo regla personalizada: {e}")
            return False
            
    def remove_rule(self, rule_id: str) -> bool:
        """
        Elimina una regla del WAF
        
        Args:
            rule_id: ID de la regla a eliminar
            
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            original_count = len(self.rules)
            self.rules = [rule for rule in self.rules if rule['id'] != rule_id]
            
            if len(self.rules) < original_count:
                logger.info(f"Regla eliminada: {rule_id}")
                return True
            else:
                logger.warning(f"Regla no encontrada: {rule_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error eliminando regla: {e}")
            return False
            
    def get_statistics(self) -> Dict[str, Any]:
        """Obtiene estadísticas del WAF"""
        total_requests = len(self.request_log)
        blocked_requests = len([r for r in self.request_log if not r['allowed']])
        allowed_requests = total_requests - blocked_requests
        
        # Contar amenazas por tipo
        threat_counts = {}
        for request in self.request_log:
            for threat in request['threats_detected']:
                threat_type = threat.split(' (')[0]
                threat_counts[threat_type] = threat_counts.get(threat_type, 0) + 1
                
        return {
            'total_requests': total_requests,
            'blocked_requests': blocked_requests,
            'allowed_requests': allowed_requests,
            'block_rate': (blocked_requests / total_requests * 100) if total_requests > 0 else 0,
            'blocked_ips': len(self.blocked_ips),
            'active_rules': len(self.rules),
            'threat_counts': threat_counts,
            'last_activity': self.request_log[-1]['timestamp'] if self.request_log else None
        }
        
    def unblock_ip(self, ip_address: str) -> bool:
        """
        Desbloquea una IP
        
        Args:
            ip_address: IP a desbloquear
            
        Returns:
            bool: True si se desbloqueó correctamente
        """
        try:
            if ip_address in self.blocked_ips:
                self.blocked_ips.remove(ip_address)
                logger.info(f"IP desbloqueada: {ip_address}")
                return True
            else:
                logger.warning(f"IP no estaba bloqueada: {ip_address}")
                return False
                
        except Exception as e:
            logger.error(f"Error desbloqueando IP: {e}")
            return False
            
    def export_configuration(self) -> Dict[str, Any]:
        """Exporta configuración del WAF"""
        return {
            'rules': self.rules,
            'blocked_ips': list(self.blocked_ips),
            'attack_patterns': self.attack_patterns,
            'statistics': self.get_statistics(),
            'export_timestamp': datetime.now().isoformat()
        }
        
    def import_configuration(self, config: Dict[str, Any]) -> bool:
        """
        Importa configuración del WAF
        
        Args:
            config: Configuración a importar
            
        Returns:
            bool: True si se importó correctamente
        """
        try:
            if 'rules' in config:
                self.rules = config['rules']
                
            if 'blocked_ips' in config:
                self.blocked_ips = set(config['blocked_ips'])
                
            if 'attack_patterns' in config:
                self.attack_patterns = config['attack_patterns']
                
            logger.info("Configuración del WAF importada correctamente")
            return True
            
        except Exception as e:
            logger.error(f"Error importando configuración: {e}")
            return False

def main():
    """Función de prueba"""
    waf = WAFManager()
    
    # Ejemplo de petición normal
    normal_request = {
        'client_ip': '192.168.1.100',
        'method': 'GET',
        'url': '/api/users',
        'headers': {'User-Agent': 'Mozilla/5.0'},
        'body': '',
        'params': {}
    }
    
    result = waf.analyze_request(normal_request)
    print(f"Petición normal: {result['allowed']}")
    
    # Ejemplo de petición maliciosa
    malicious_request = {
        'client_ip': '192.168.1.200',
        'method': 'POST',
        'url': '/api/login',
        'headers': {'User-Agent': 'sqlmap'},
        'body': '',
        'params': {'username': "admin' OR '1'='1"}
    }
    
    result = waf.analyze_request(malicious_request)
    print(f"Petición maliciosa: {result['allowed']}")
    print(f"Amenazas detectadas: {result['threats_detected']}")
    
    # Mostrar estadísticas
    stats = waf.get_statistics()
    print(f"Estadísticas: {stats}")

if __name__ == "__main__":
    main() 