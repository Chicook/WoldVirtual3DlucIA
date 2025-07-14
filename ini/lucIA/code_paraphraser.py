#!/usr/bin/env python3
"""
Sistema de Parafraseo de Código para LucIA
Genera código original con el mismo objetivo pero diferente estructura
"""

import re
import random
import ast
from typing import List, Dict, Optional, Tuple, Any
from dataclasses import dataclass
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

@dataclass
class CodeParaphraseConfig:
    """Configuración para el parafraseo de código"""
    target_language: str = "python"
    preserve_functionality: bool = True
    change_variable_names: bool = True
    restructure_logic: bool = True
    add_comments: bool = True
    modify_style: bool = True

class CodeParaphraser:
    """Sistema de parafraseo de código inteligente"""
    
    def __init__(self, config: CodeParaphraseConfig):
        self.config = config
        
        # Patrones de reemplazo para diferentes lenguajes
        self.language_patterns = {
            "python": {
                "variable_patterns": {
                    "data": ["information", "content", "items", "elements", "records"],
                    "result": ["output", "response", "answer", "solution", "outcome"],
                    "value": ["item", "element", "entry", "piece", "component"],
                    "list": ["array", "collection", "sequence", "set", "group"],
                    "dict": ["mapping", "hashmap", "table", "dictionary", "key_value"],
                    "function": ["method", "procedure", "routine", "operation", "handler"],
                    "class": ["type", "object", "entity", "structure", "model"],
                    "file": ["document", "resource", "asset", "data_file", "input"],
                    "user": ["person", "client", "customer", "end_user", "individual"],
                    "config": ["settings", "parameters", "options", "preferences", "configuration"]
                },
                "function_patterns": {
                    "get_": ["retrieve_", "fetch_", "obtain_", "extract_", "collect_"],
                    "set_": ["assign_", "update_", "modify_", "change_", "establish_"],
                    "create_": ["build_", "generate_", "make_", "construct_", "form_"],
                    "check_": ["verify_", "validate_", "test_", "examine_", "inspect_"],
                    "process_": ["handle_", "manage_", "treat_", "work_with_", "operate_on_"],
                    "save_": ["store_", "persist_", "write_", "record_", "archive_"],
                    "load_": ["read_", "import_", "load_", "retrieve_", "fetch_"],
                    "delete_": ["remove_", "erase_", "clear_", "eliminate_", "purge_"],
                    "find_": ["search_", "locate_", "discover_", "identify_", "detect_"],
                    "update_": ["modify_", "change_", "alter_", "adjust_", "revise_"]
                },
                "comment_patterns": [
                    "Process the given data",
                    "Handle the input information",
                    "Manage the provided content",
                    "Work with the specified elements",
                    "Operate on the input data"
                ]
            },
            "javascript": {
                "variable_patterns": {
                    "data": ["information", "content", "items", "elements", "records"],
                    "result": ["output", "response", "answer", "solution", "outcome"],
                    "value": ["item", "element", "entry", "piece", "component"],
                    "array": ["list", "collection", "sequence", "set", "group"],
                    "object": ["mapping", "hashmap", "table", "dictionary", "key_value"],
                    "function": ["method", "procedure", "routine", "operation", "handler"],
                    "class": ["type", "object", "entity", "structure", "model"],
                    "file": ["document", "resource", "asset", "data_file", "input"],
                    "user": ["person", "client", "customer", "end_user", "individual"],
                    "config": ["settings", "parameters", "options", "preferences", "configuration"]
                },
                "function_patterns": {
                    "get": ["retrieve", "fetch", "obtain", "extract", "collect"],
                    "set": ["assign", "update", "modify", "change", "establish"],
                    "create": ["build", "generate", "make", "construct", "form"],
                    "check": ["verify", "validate", "test", "examine", "inspect"],
                    "process": ["handle", "manage", "treat", "workWith", "operateOn"],
                    "save": ["store", "persist", "write", "record", "archive"],
                    "load": ["read", "import", "load", "retrieve", "fetch"],
                    "delete": ["remove", "erase", "clear", "eliminate", "purge"],
                    "find": ["search", "locate", "discover", "identify", "detect"],
                    "update": ["modify", "change", "alter", "adjust", "revise"]
                }
            }
        }
        
        # Patrones de reestructuración
        self.restructure_patterns = {
            "if_else_to_switch": True,
            "for_to_while": True,
            "list_comprehension_to_loop": True,
            "function_to_class": True,
            "inline_to_separate": True
        }
    
    def paraphrase_code(self, original_code: str, language: str = None) -> str:
        """
        Parafrasea código manteniendo la funcionalidad pero cambiando la estructura
        """
        if not original_code or not self.config.preserve_functionality:
            return original_code
            
        try:
            # Detectar lenguaje si no se especifica
            if not language:
                language = self._detect_language(original_code)
            
            # Limpiar el código
            cleaned_code = self._clean_code(original_code)
            
            # Aplicar parafraseo
            paraphrased_code = self._apply_code_paraphrasing(cleaned_code, language)
            
            # Verificar que el código es válido
            if self._is_valid_code(paraphrased_code, language):
                return paraphrased_code
            else:
                # Si no es válido, intentar parafraseo más conservador
                return self._apply_conservative_paraphrasing(original_code, language)
                
        except Exception as e:
            logger.error(f"Error en parafraseo de código: {e}")
            return original_code
    
    def _detect_language(self, code: str) -> str:
        """Detecta el lenguaje de programación del código"""
        code_lower = code.lower()
        
        if "def " in code_lower or "import " in code_lower or "class " in code_lower:
            return "python"
        elif "function " in code_lower or "var " in code_lower or "const " in code_lower or "let " in code_lower:
            return "javascript"
        elif "public " in code_lower or "private " in code_lower or "class " in code_lower:
            return "java"
        elif "#include" in code_lower or "int main" in code_lower:
            return "cpp"
        else:
            return "python"  # Por defecto
    
    def _clean_code(self, code: str) -> str:
        """Limpia el código para parafraseo"""
        # Remover comentarios existentes para evitar conflictos
        code = re.sub(r'#.*$', '', code, flags=re.MULTILINE)  # Python
        code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)  # JavaScript/Java/C++
        code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)  # Comentarios multilínea
        
        # Normalizar espacios
        code = re.sub(r'\s+', ' ', code)
        return code.strip()
    
    def _apply_code_paraphrasing(self, code: str, language: str) -> str:
        """Aplica parafraseo al código"""
        paraphrased = code
        
        # Cambiar nombres de variables
        if self.config.change_variable_names:
            paraphrased = self._change_variable_names(paraphrased, language)
        
        # Cambiar nombres de funciones
        paraphrased = self._change_function_names(paraphrased, language)
        
        # Reestructurar lógica
        if self.config.restructure_logic:
            paraphrased = self._restructure_logic(paraphrased, language)
        
        # Modificar estilo
        if self.config.modify_style:
            paraphrased = self._modify_style(paraphrased, language)
        
        # Añadir comentarios
        if self.config.add_comments:
            paraphrased = self._add_comments(paraphrased, language)
        
        return paraphrased
    
    def _change_variable_names(self, code: str, language: str) -> str:
        """Cambia nombres de variables"""
        patterns = self.language_patterns.get(language, {}).get("variable_patterns", {})
        
        for old_name, alternatives in patterns.items():
            if old_name in code:
                new_name = random.choice(alternatives)
                # Reemplazar manteniendo mayúsculas
                pattern = re.compile(r'\b' + re.escape(old_name) + r'\b', re.IGNORECASE)
                code = pattern.sub(new_name, code)
        
        return code
    
    def _change_function_names(self, code: str, language: str) -> str:
        """Cambia nombres de funciones"""
        patterns = self.language_patterns.get(language, {}).get("function_patterns", {})
        
        for prefix, alternatives in patterns.items():
            if prefix in code:
                new_prefix = random.choice(alternatives)
                # Reemplazar prefijos de funciones
                pattern = re.compile(r'\b' + re.escape(prefix), re.IGNORECASE)
                code = pattern.sub(new_prefix, code)
        
        return code
    
    def _restructure_logic(self, code: str, language: str) -> str:
        """Reestructura la lógica del código"""
        if language == "python":
            return self._restructure_python_logic(code)
        elif language == "javascript":
            return self._restructure_javascript_logic(code)
        else:
            return code
    
    def _restructure_python_logic(self, code: str) -> str:
        """Reestructura lógica específica de Python"""
        # Convertir list comprehension a loop
        if "[" in code and "for" in code and "]" in code:
            # Patrón simple para list comprehension
            pattern = r'\[(.*?)\s+for\s+(.*?)\s+in\s+(.*?)\]'
            match = re.search(pattern, code)
            if match:
                expression = match.group(1)
                variable = match.group(2)
                iterable = match.group(3)
                
                new_code = f"result = []\nfor {variable} in {iterable}:\n    result.append({expression})\n"
                return code.replace(match.group(0), "result")
        
        # Convertir if-elif-else a diccionario de funciones
        if "elif" in code:
            # Patrón simple para if-elif-else
            lines = code.split('\n')
            new_lines = []
            for line in lines:
                if line.strip().startswith('if '):
                    new_lines.append(line.replace('if ', 'if '))
                elif line.strip().startswith('elif '):
                    new_lines.append(line.replace('elif ', 'elif '))
                else:
                    new_lines.append(line)
            return '\n'.join(new_lines)
        
        return code
    
    def _restructure_javascript_logic(self, code: str) -> str:
        """Reestructura lógica específica de JavaScript"""
        # Convertir for...of a for tradicional
        if "for " in code and " of " in code:
            pattern = r'for\s+(\w+)\s+of\s+(\w+)'
            match = re.search(pattern, code)
            if match:
                variable = match.group(1)
                array = match.group(2)
                new_code = f"for (let i = 0; i < {array}.length; i++) {{\n    const {variable} = {array}[i];\n"
                return code.replace(match.group(0), new_code)
        
        return code
    
    def _modify_style(self, code: str, language: str) -> str:
        """Modifica el estilo del código"""
        # Cambiar indentación
        if language == "python":
            # Cambiar entre 2 y 4 espacios
            if "    " in code:
                code = code.replace("    ", "  ")
            elif "  " in code:
                code = code.replace("  ", "    ")
        
        # Cambiar comillas
        if '"' in code:
            code = code.replace('"', "'")
        elif "'" in code:
            code = code.replace("'", '"')
        
        return code
    
    def _add_comments(self, code: str, language: str) -> str:
        """Añade comentarios al código"""
        patterns = self.language_patterns.get(language, {}).get("comment_patterns", [])
        
        if patterns:
            comment = random.choice(patterns)
            
            if language == "python":
                return f"# {comment}\n{code}"
            elif language in ["javascript", "java", "cpp"]:
                return f"// {comment}\n{code}"
        
        return code
    
    def _is_valid_code(self, code: str, language: str) -> bool:
        """Verifica si el código es válido"""
        try:
            if language == "python":
                ast.parse(code)
                return True
            else:
                # Para otros lenguajes, verificación básica
                return len(code.strip()) > 0
        except:
            return False
    
    def _apply_conservative_paraphrasing(self, code: str, language: str) -> str:
        """Aplica parafraseo conservador que mantiene la estructura"""
        paraphrased = code
        
        # Solo cambiar comentarios y estilo
        paraphrased = self._add_comments(paraphrased, language)
        paraphrased = self._modify_style(paraphrased, language)
        
        return paraphrased
    
    def generate_code_from_memory(self, prompt: str, language: str = "python") -> str:
        """
        Genera código basándose en la memoria pero con estructura original
        """
        # Aquí se implementaría la lógica para generar código desde memoria
        # Por ahora, devuelve un template básico
        return self._generate_template_code(prompt, language)
    
    def _generate_template_code(self, prompt: str, language: str) -> str:
        """Genera código template basándose en el prompt"""
        if "memoria" in prompt.lower() or "storage" in prompt.lower():
            if language == "python":
                return '''# Sistema de gestión de memoria
class MemoryManager:
    def __init__(self):
        self.storage = {}
    
    def store_data(self, key, value):
        """Almacena información en memoria"""
        self.storage[key] = value
        return True
    
    def retrieve_data(self, key):
        """Recupera información de memoria"""
        return self.storage.get(key, None)'''
            elif language == "javascript":
                return '''// Sistema de gestión de memoria
class MemoryManager {
    constructor() {
        this.storage = {};
    }
    
    storeData(key, value) {
        // Almacena información en memoria
        this.storage[key] = value;
        return true;
    }
    
    retrieveData(key) {
        // Recupera información de memoria
        return this.storage[key] || null;
    }
}'''
        
        elif "api" in prompt.lower() or "request" in prompt.lower():
            if language == "python":
                return '''# Gestor de APIs
import requests

class APIManager:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def make_request(self, endpoint, method="GET"):
        """Realiza petición a API"""
        url = f"{self.base_url}/{endpoint}"
        response = requests.request(method, url)
        return response.json()'''
            elif language == "javascript":
                return '''// Gestor de APIs
class APIManager {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    async makeRequest(endpoint, method = "GET") {
        // Realiza petición a API
        const url = `${this.baseUrl}/${endpoint}`;
        const response = await fetch(url, { method });
        return response.json();
    }
}'''
        
        else:
            # Template genérico
            if language == "python":
                return '''# Función genérica
def process_data(input_data):
    """Procesa los datos de entrada"""
    result = []
    for item in input_data:
        processed_item = transform_item(item)
        result.append(processed_item)
    return result

def transform_item(item):
    """Transforma un elemento individual"""
    return item.upper() if isinstance(item, str) else item'''
            elif language == "javascript":
                return '''// Función genérica
function processData(inputData) {
    // Procesa los datos de entrada
    const result = [];
    for (const item of inputData) {
        const processedItem = transformItem(item);
        result.push(processedItem);
    }
    return result;
}

function transformItem(item) {
    // Transforma un elemento individual
    return typeof item === 'string' ? item.toUpperCase() : item;
}'''

# Función de utilidad
def create_code_paraphraser(language: str = "python") -> CodeParaphraser:
    """Crea una instancia del parafraseador de código"""
    config = CodeParaphraseConfig(
        target_language=language,
        preserve_functionality=True,
        change_variable_names=True,
        restructure_logic=True,
        add_comments=True,
        modify_style=True
    )
    return CodeParaphraser(config)

if __name__ == "__main__":
    # Prueba del parafraseador de código
    paraphraser = create_code_paraphraser("python")
    
    test_code = '''
def get_data():
    data = []
    for i in range(10):
        data.append(i * 2)
    return data
'''
    
    print("🧪 Probando parafraseo de código...")
    print(f"Código original:\n{test_code}")
    
    paraphrased = paraphraser.paraphrase_code(test_code, "python")
    print(f"Código parafraseado:\n{paraphrased}") 