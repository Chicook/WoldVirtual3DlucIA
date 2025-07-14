#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Limpieza de Claves API - WoldVirtual3DlucIA
Limpia todas las claves API sensibles antes del merge
"""

import os
import re
from pathlib import Path

def clean_api_keys():
    """Limpia todas las claves API del proyecto"""
    
    # Patrones de claves API
    api_patterns = {
        'openai': [
            (r'sk-[a-zA-Z0-9]{20,}', 'OPENAI_API_KEY_REMOVED'),
            (r'OPENAI_API_KEY\s*=\s*["\'][^"\']*["\']', 'OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")'),
            (r'openai\.api_key\s*=\s*["\'][^"\']*["\']', 'openai.api_key = os.getenv("OPENAI_API_KEY")')
        ],
        'gemini': [
            (r'AIza[0-9A-Za-z-_]{35}', 'GEMINI_API_KEY_REMOVED'),
            (r'GEMINI_API_KEY\s*=\s*["\'][^"\']*["\']', 'GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")'),
            (r'genai\.configure\(api_key\s*=\s*["\'][^"\']*["\']', 'genai.configure(api_key=os.getenv("GEMINI_API_KEY"))')
        ],
        'claude': [
            (r'sk-ant-[a-zA-Z0-9]{48}', 'CLAUDE_API_KEY_REMOVED'),
            (r'CLAUDE_API_KEY\s*=\s*["\'][^"\']*["\']', 'CLAUDE_API_KEY=os.getenv("CLAUDE_API_KEY")'),
            (r'ANTHROPIC_API_KEY\s*=\s*["\'][^"\']*["\']', 'ANTHROPIC_API_KEY=os.getenv("ANTHROPIC_API_KEY")')
        ]
    }
    
    # Archivos a procesar
    file_extensions = ['.py', '.js', '.ts', '.json', '.env', '.example']
    
    project_root = Path.cwd()
    cleaned_files = []
    
    print("🔍 Buscando y limpiando claves API...")
    
    for ext in file_extensions:
        for file_path in project_root.rglob(f"*{ext}"):
            if file_path.is_file():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    modified = False
                    
                    # Aplicar patrones de limpieza
                    for api_type, patterns in api_patterns.items():
                        for pattern, replacement in patterns:
                            if re.search(pattern, content):
                                content = re.sub(pattern, replacement, content)
                                modified = True
                                print(f"  🧹 Limpiada clave {api_type} en {file_path}")
                    
                    # Guardar archivo si fue modificado
                    if modified:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        cleaned_files.append(str(file_path))
                        
                except Exception as e:
                    print(f"  ⚠️ Error procesando {file_path}: {e}")
    
    print(f"\n✅ Limpieza completada: {len(cleaned_files)} archivos limpiados")
    
    if cleaned_files:
        print("\n📋 Archivos limpiados:")
        for file_path in cleaned_files:
            print(f"  - {file_path}")
    
    return len(cleaned_files) > 0

if __name__ == "__main__":
    clean_api_keys() 