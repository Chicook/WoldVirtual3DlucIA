#!/usr/bin/env python3
"""
🔐 Verificación Rápida de Seguridad - LucIA
Script simple para verificar que el proyecto esté configurado de forma segura
"""

import os
import re
from pathlib import Path

def check_security():
    """Verificación rápida de seguridad"""
    print("🔐 Verificación Rápida de Seguridad - LucIA")
    print("=" * 50)
    
    project_root = Path(__file__).parent
    issues = []
    warnings = []
    passed = []
    
    # 1. Verificar archivo .env
    env_file = project_root / '.env'
    if env_file.exists():
        try:
            with open(env_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Buscar claves API reales
            if 'sk-' in content and 'tu_clave' not in content:
                issues.append("❌ Archivo .env contiene claves API reales")
            else:
                passed.append("✅ Archivo .env configurado correctamente")
        except Exception as e:
            warnings.append(f"⚠️ Error leyendo .env: {e}")
    else:
        passed.append("✅ No se encontró archivo .env (correcto para código abierto)")
    
    # 2. Verificar .gitignore
    gitignore_file = project_root / '.gitignore'
    if gitignore_file.exists():
        with open(gitignore_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '.env' in content:
            passed.append("✅ .gitignore incluye .env")
        else:
            warnings.append("⚠️ .gitignore no incluye .env")
    else:
        warnings.append("⚠️ No se encontró .gitignore")
    
    # 3. Buscar claves hardcodeadas
    found_keys = False
    for file_path in project_root.rglob('*.py'):
        if file_path.name in ['check_security.py', 'security_checker.py']:
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Buscar patrones de claves API
            patterns = [
                r'sk-[a-zA-Z0-9]{48}',  # OpenAI
                r'AIza[0-9A-Za-z-_]{35}',  # Google
                r'api_key\s*=\s*["\'][^"\']+["\']',  # Hardcoded API keys
            ]
            
            for pattern in patterns:
                if re.search(pattern, content):
                    issues.append(f"❌ Posible clave API encontrada en {file_path.name}")
                    found_keys = True
                    break
                    
        except Exception:
            continue
    
    if not found_keys:
        passed.append("✅ No se encontraron claves API hardcodeadas")
    
    # 4. Verificar permisos de .env
    if env_file.exists():
        stat = env_file.stat()
        mode = oct(stat.st_mode)[-3:]
        
        if mode == '600':
            passed.append("✅ Permisos de .env correctos (600)")
        else:
            warnings.append(f"⚠️ Permisos de .env: {mode} (recomendado 600)")
    
    # Mostrar resultados
    print(f"\n📊 RESULTADOS:")
    print(f"   ✅ Pasados: {len(passed)}")
    print(f"   ⚠️ Advertencias: {len(warnings)}")
    print(f"   ❌ Problemas: {len(issues)}")
    
    if passed:
        print(f"\n✅ CHECKS PASADOS:")
        for check in passed:
            print(f"   {check}")
    
    if warnings:
        print(f"\n⚠️ ADVERTENCIAS:")
        for warning in warnings:
            print(f"   {warning}")
    
    if issues:
        print(f"\n❌ PROBLEMAS DE SEGURIDAD:")
        for issue in issues:
            print(f"   {issue}")
    
    # Estado general
    if issues:
        print(f"\n🔴 ESTADO: INSEGURO")
        print("   Resuelve los problemas antes de continuar")
        return False
    elif warnings:
        print(f"\n🟡 ESTADO: SEGURO CON ADVERTENCIAS")
        print("   Revisa las advertencias para mejorar")
        return True
    else:
        print(f"\n🟢 ESTADO: SEGURO")
        print("   Tu proyecto está listo para código abierto")
        return True

if __name__ == "__main__":
    success = check_security()
    exit(0 if success else 1) 