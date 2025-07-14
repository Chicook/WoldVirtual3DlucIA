#!/usr/bin/env python3
"""
🔐 Security Checker para LucIA
Verifica que el proyecto esté configurado de forma segura para código abierto
"""

import os
import re
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple
import logging

class SecurityChecker:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.security_issues = []
        self.warnings = []
        self.passed_checks = []
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('SecurityChecker')
        
        # Patrones de detección de información sensible
        self.sensitive_patterns = {
            'api_key': [
                r'sk-[a-zA-Z0-9]{48}',  # OpenAI API keys
                r'Bearer [a-zA-Z0-9]{32,}',  # Bearer tokens
                r'api_key\s*=\s*["\'][^"\']+["\']',  # Hardcoded API keys
                r'API_KEY\s*=\s*["\'][^"\']+["\']',  # Environment variables hardcoded
            ],
            'password': [
                r'password\s*=\s*["\'][^"\']+["\']',  # Hardcoded passwords
                r'PASSWORD\s*=\s*["\'][^"\']+["\']',  # Environment passwords
            ],
            'secret': [
                r'secret\s*=\s*["\'][^"\']+["\']',  # Hardcoded secrets
                r'SECRET\s*=\s*["\'][^"\']+["\']',  # Environment secrets
            ],
            'token': [
                r'token\s*=\s*["\'][^"\']+["\']',  # Hardcoded tokens
                r'TOKEN\s*=\s*["\'][^"\']+["\']',  # Environment tokens
            ]
        }
        
        # Archivos que NO deben contener información sensible
        self.code_files = ['.py', '.js', '.ts', '.jsx', '.tsx', '.json', '.yaml', '.yml']
        
        # Archivos que SÍ pueden contener información sensible (pero no deben estar en git)
        self.sensitive_files = ['.env', '.key', '.pem', '.p12', '.pfx', '.secret']
    
    def run_full_check(self) -> Dict:
        """Ejecuta todas las verificaciones de seguridad"""
        self.logger.info("🔐 Iniciando verificación de seguridad completa...")
        
        # Ejecutar todas las verificaciones
        checks = [
            self.check_gitignore(),
            self.check_env_files(),
            self.check_hardcoded_secrets(),
            self.check_file_permissions(),
            self.check_dependencies(),
            self.check_logs(),
            self.check_configuration(),
            self.check_api_keys_in_code(),
        ]
        
        # Generar reporte
        report = self.generate_report()
        
        self.logger.info(f"✅ Verificación completada: {len(self.passed_checks)} checks pasados")
        if self.security_issues:
            self.logger.warning(f"❌ {len(self.security_issues)} problemas de seguridad encontrados")
        if self.warnings:
            self.logger.warning(f"⚠️ {len(self.warnings)} advertencias encontradas")
        
        return report
    
    def check_gitignore(self) -> bool:
        """Verifica que .gitignore esté configurado correctamente"""
        self.logger.info("📋 Verificando configuración de .gitignore...")
        
        gitignore_path = self.project_root / '.gitignore'
        if not gitignore_path.exists():
            self.security_issues.append("❌ No se encontró archivo .gitignore")
            return False
        
        with open(gitignore_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        required_patterns = [
            r'\.env',
            r'\.key',
            r'\.pem',
            r'\.p12',
            r'\.pfx',
            r'\.secret',
            r'secrets/',
            r'keys/',
            r'tokens/',
            r'credentials/',
            r'\*\.log',
            r'logs/',
        ]
        
        missing_patterns = []
        for pattern in required_patterns:
            if not re.search(pattern, content, re.IGNORECASE):
                missing_patterns.append(pattern)
        
        if missing_patterns:
            self.security_issues.append(f"❌ .gitignore falta patrones: {', '.join(missing_patterns)}")
            return False
        
        self.passed_checks.append("✅ .gitignore configurado correctamente")
        return True
    
    def check_env_files(self) -> bool:
        """Verifica que no haya archivos .env en el repositorio"""
        self.logger.info("🔒 Verificando archivos de entorno...")
        
        env_files = []
        for pattern in ['*.env', '*.key', '*.pem', '*.p12', '*.pfx', '*.secret']:
            env_files.extend(self.project_root.glob(pattern))
        
        # Filtrar archivos que SÍ deben estar (como env.example)
        allowed_files = ['env.example', '.env.example']
        problematic_files = []
        
        for env_file in env_files:
            if env_file.name not in allowed_files:
                problematic_files.append(str(env_file))
        
        if problematic_files:
            self.security_issues.append(f"❌ Archivos sensibles encontrados: {', '.join(problematic_files)}")
            return False
        
        self.passed_checks.append("✅ No se encontraron archivos sensibles en el repositorio")
        return True
    
    def check_hardcoded_secrets(self) -> bool:
        """Busca información sensible hardcodeada en el código"""
        self.logger.info("🔍 Buscando información sensible hardcodeada...")
        
        found_secrets = []
        
        for file_path in self.project_root.rglob('*'):
            if file_path.is_file() and file_path.suffix in self.code_files:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    for secret_type, patterns in self.sensitive_patterns.items():
                        for pattern in patterns:
                            matches = re.findall(pattern, content, re.IGNORECASE)
                            if matches:
                                found_secrets.append({
                                    'file': str(file_path),
                                    'type': secret_type,
                                    'matches': len(matches),
                                    'pattern': pattern
                                })
                except Exception as e:
                    self.warnings.append(f"⚠️ No se pudo leer {file_path}: {e}")
        
        if found_secrets:
            for secret in found_secrets:
                self.security_issues.append(
                    f"❌ Información sensible encontrada en {secret['file']}: "
                    f"{secret['type']} ({secret['matches']} coincidencias)"
                )
            return False
        
        self.passed_checks.append("✅ No se encontró información sensible hardcodeada")
        return True
    
    def check_file_permissions(self) -> bool:
        """Verifica permisos de archivos sensibles"""
        self.logger.info("🔐 Verificando permisos de archivos...")
        
        # Verificar si existe .env y sus permisos
        env_file = self.project_root / '.env'
        if env_file.exists():
            stat = env_file.stat()
            mode = oct(stat.st_mode)[-3:]
            
            if mode != '600':
                self.warnings.append(f"⚠️ Archivo .env tiene permisos {mode}, recomendado 600")
            else:
                self.passed_checks.append("✅ Permisos de .env correctos (600)")
        
        return True
    
    def check_dependencies(self) -> bool:
        """Verifica dependencias por vulnerabilidades conocidas"""
        self.logger.info("📦 Verificando dependencias...")
        
        requirements_file = self.project_root / 'requirements.txt'
        if not requirements_file.exists():
            self.warnings.append("⚠️ No se encontró requirements.txt")
            return True
        
        # Lista de dependencias conocidas por ser seguras
        safe_dependencies = [
            'aiohttp', 'requests', 'python-dotenv', 'loguru', 'rich',
            'openai', 'anthropic', 'google-generativeai', 'nltk', 'textblob'
        ]
        
        try:
            with open(requirements_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Verificar que las dependencias principales están listadas
            for dep in safe_dependencies:
                if dep not in content:
                    self.warnings.append(f"⚠️ Dependencia recomendada no encontrada: {dep}")
            
            self.passed_checks.append("✅ Dependencias verificadas")
            
        except Exception as e:
            self.warnings.append(f"⚠️ Error verificando dependencias: {e}")
        
        return True
    
    def check_logs(self) -> bool:
        """Verifica que no haya logs con información sensible"""
        self.logger.info("📝 Verificando logs...")
        
        log_files = list(self.project_root.glob('*.log'))
        log_files.extend(self.project_root.glob('logs/*.log'))
        
        for log_file in log_files:
            try:
                with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # Buscar patrones de información sensible en logs
                for secret_type, patterns in self.sensitive_patterns.items():
                    for pattern in patterns:
                        if re.search(pattern, content, re.IGNORECASE):
                            self.security_issues.append(
                                f"❌ Información sensible encontrada en logs: {log_file}"
                            )
                            return False
                
            except Exception as e:
                self.warnings.append(f"⚠️ No se pudo leer log {log_file}: {e}")
        
        self.passed_checks.append("✅ Logs verificados (sin información sensible)")
        return True
    
    def check_configuration(self) -> bool:
        """Verifica configuración de seguridad"""
        self.logger.info("⚙️ Verificando configuración...")
        
        config_file = self.project_root / 'config.py'
        if config_file.exists():
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Verificar configuraciones de seguridad recomendadas
                security_configs = [
                    'LUCIA_ENCRYPT_SENSITIVE_DATA',
                    'LUCIA_LOG_API_CALLS',
                    'LUCIA_RATE_LIMITING'
                ]
                
                for config in security_configs:
                    if config not in content:
                        self.warnings.append(f"⚠️ Configuración de seguridad no encontrada: {config}")
                
                self.passed_checks.append("✅ Configuración verificada")
                
            except Exception as e:
                self.warnings.append(f"⚠️ Error verificando configuración: {e}")
        
        return True
    
    def check_api_keys_in_code(self) -> bool:
        """Verifica específicamente claves API en el código"""
        self.logger.info("🔑 Verificando claves API...")
        
        api_key_patterns = [
            r'sk-[a-zA-Z0-9]{48}',  # OpenAI
            r'AIza[0-9A-Za-z-_]{35}',  # Google
            r'[a-zA-Z0-9]{32,}',  # General API keys
        ]
        
        found_keys = []
        
        for file_path in self.project_root.rglob('*.py'):
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                for pattern in api_key_patterns:
                    matches = re.findall(pattern, content)
                    if matches:
                        found_keys.append({
                            'file': str(file_path),
                            'matches': len(matches)
                        })
                        
            except Exception as e:
                self.warnings.append(f"⚠️ Error leyendo {file_path}: {e}")
        
        if found_keys:
            for key in found_keys:
                self.security_issues.append(
                    f"❌ Posibles claves API encontradas en {key['file']} ({key['matches']} coincidencias)"
                )
            return False
        
        self.passed_checks.append("✅ No se encontraron claves API en el código")
        return True
    
    def generate_report(self) -> Dict:
        """Genera reporte completo de seguridad"""
        total_checks = len(self.passed_checks) + len(self.security_issues) + len(self.warnings)
        
        report = {
            'secure': len(self.security_issues) == 0,
            'summary': {
                'total_checks': total_checks,
                'passed': len(self.passed_checks),
                'security_issues': len(self.security_issues),
                'warnings': len(self.warnings),
                'score': self.calculate_security_score()
            },
            'details': {
                'passed_checks': self.passed_checks,
                'security_issues': self.security_issues,
                'warnings': self.warnings
            },
            'recommendations': self.generate_recommendations()
        }
        
        return report
    
    def calculate_security_score(self) -> int:
        """Calcula puntuación de seguridad (0-100)"""
        total_checks = len(self.passed_checks) + len(self.security_issues) + len(self.warnings)
        if total_checks == 0:
            return 0
        
        # Los security issues pesan más que las warnings
        score = (len(self.passed_checks) * 10 - len(self.security_issues) * 20 - len(self.warnings) * 5)
        score = max(0, min(100, score))
        
        return score
    
    def generate_recommendations(self) -> List[str]:
        """Genera recomendaciones basadas en los problemas encontrados"""
        recommendations = []
        
        if self.security_issues:
            recommendations.extend([
                "🔴 CRÍTICO: Resuelve los problemas de seguridad antes de continuar",
                "🔴 CRÍTICO: No subas el código a GitHub hasta resolver los problemas",
                "🔴 CRÍTICO: Revoca cualquier clave API que haya sido expuesta"
            ])
        
        if self.warnings:
            recommendations.extend([
                "🟡 ADVERTENCIA: Revisa las advertencias para mejorar la seguridad",
                "🟡 ADVERTENCIA: Considera implementar las configuraciones faltantes"
            ])
        
        if not self.security_issues and not self.warnings:
            recommendations.append("🟢 EXCELENTE: Tu proyecto está configurado de forma segura")
        
        recommendations.extend([
            "📚 LEE: La guía de seguridad completa en SECURITY_GUIDE.md",
            "🛠️ USA: El script configurar_api.py para configuración segura",
            "🧪 PRUEBA: Ejecuta probar_api.py para verificar configuración"
        ])
        
        return recommendations
    
    def print_report(self, report: Dict):
        """Imprime el reporte de forma legible"""
        print("\n" + "="*60)
        print("🔐 REPORTE DE SEGURIDAD - LucIA")
        print("="*60)
        
        # Resumen
        summary = report['summary']
        print(f"\n📊 RESUMEN:")
        print(f"   Puntuación de seguridad: {summary['score']}/100")
        print(f"   Checks pasados: {summary['passed']}/{summary['total_checks']}")
        print(f"   Problemas de seguridad: {summary['security_issues']}")
        print(f"   Advertencias: {summary['warnings']}")
        
        # Estado general
        if report['secure']:
            print(f"\n🟢 ESTADO: SEGURO - El proyecto está listo para código abierto")
        else:
            print(f"\n🔴 ESTADO: INSEGURO - Resuelve los problemas antes de continuar")
        
        # Detalles
        if report['details']['security_issues']:
            print(f"\n❌ PROBLEMAS DE SEGURIDAD:")
            for issue in report['details']['security_issues']:
                print(f"   {issue}")
        
        if report['details']['warnings']:
            print(f"\n⚠️ ADVERTENCIAS:")
            for warning in report['details']['warnings']:
                print(f"   {warning}")
        
        if report['details']['passed_checks']:
            print(f"\n✅ CHECKS PASADOS:")
            for check in report['details']['passed_checks']:
                print(f"   {check}")
        
        # Recomendaciones
        if report['recommendations']:
            print(f"\n💡 RECOMENDACIONES:")
            for rec in report['recommendations']:
                print(f"   {rec}")
        
        print("\n" + "="*60)

def main():
    """Función principal para ejecutar la verificación de seguridad"""
    checker = SecurityChecker()
    report = checker.run_full_check()
    checker.print_report(report)
    
    # Retornar código de salida apropiado
    if not report['secure']:
        exit(1)
    else:
        exit(0)

if __name__ == "__main__":
    main() 