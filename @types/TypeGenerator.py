#!/usr/bin/env python3
"""
🔧 TypeGenerator - Generador de Tipos TypeScript en Python
==========================================================

Responsabilidades:
- Análisis y generación automática de tipos TypeScript
- Validación de esquemas de tipos
- Generación de interfaces desde código Python
- Análisis de dependencias entre tipos
- Optimización de definiciones de tipos
- Generación de documentación de tipos

Fortalezas de Python aprovechadas:
- Análisis de código con ast
- Procesamiento de texto avanzado
- Generación de código estructurado
- Validación de esquemas
- Análisis de dependencias
"""

import ast
import json
import re
import os
from typing import Dict, List, Set, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TypeDefinition:
    """Definición de un tipo TypeScript"""
    name: str
    kind: str  # 'interface', 'type', 'enum', 'class'
    properties: Dict[str, str]
    extends: Optional[str] = None
    implements: List[str] = None
    generics: List[str] = None
    description: str = ""
    examples: List[str] = None
    deprecated: bool = False
    version: str = "1.0.0"
    
    def __post_init__(self):
        if self.implements is None:
            self.implements = []
        if self.generics is None:
            self.generics = []
        if self.examples is None:
            self.examples = []

@dataclass
class ModuleTypeInfo:
    """Información de tipos de un módulo"""
    module_name: str
    types: List[TypeDefinition]
    dependencies: Set[str]
    exports: List[str]
    imports: List[str]
    file_path: str
    last_modified: float

class TypeScriptTypeGenerator:
    """Generador de tipos TypeScript desde Python"""
    
    def __init__(self, base_path: str = "@types"):
        self.base_path = Path(base_path)
        self.type_registry: Dict[str, TypeDefinition] = {}
        self.module_info: Dict[str, ModuleTypeInfo] = {}
        self.dependency_graph: Dict[str, Set[str]] = {}
        
    def analyze_python_code(self, file_path: str) -> List[TypeDefinition]:
        """Analiza código Python y genera tipos TypeScript"""
        logger.info(f"Analizando código Python: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            types = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    types.append(self._extract_class_type(node))
                elif isinstance(node, ast.FunctionDef):
                    types.append(self._extract_function_type(node))
                elif isinstance(node, ast.Assign):
                    types.extend(self._extract_assignment_types(node))
            
            return types
            
        except Exception as e:
            logger.error(f"Error analizando {file_path}: {e}")
            return []
    
    def _extract_class_type(self, node: ast.ClassDef) -> TypeDefinition:
        """Extrae tipo de una clase Python"""
        properties = {}
        extends = None
        implements = []
        
        # Analizar bases de la clase
        for base in node.bases:
            if isinstance(base, ast.Name):
                extends = base.id
            elif isinstance(base, ast.Attribute):
                extends = f"{base.value.id}.{base.attr}"
        
        # Analizar decoradores para interfaces
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Name) and decorator.id == 'interface':
                implements.append('Interface')
        
        # Analizar atributos de clase
        for item in node.body:
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        properties[target.id] = self._infer_type_from_value(item.value)
            elif isinstance(item, ast.AnnAssign):
                if isinstance(item.target, ast.Name):
                    properties[item.target.id] = self._extract_annotation_type(item.annotation)
        
        return TypeDefinition(
            name=node.name,
            kind='interface',
            properties=properties,
            extends=extends,
            implements=implements,
            description=self._extract_docstring(node)
        )
    
    def _extract_function_type(self, node: ast.FunctionDef) -> TypeDefinition:
        """Extrae tipo de una función Python"""
        properties = {}
        
        # Analizar parámetros
        for arg in node.args.args:
            if arg.annotation:
                properties[arg.arg] = self._extract_annotation_type(arg.annotation)
            else:
                properties[arg.arg] = 'any'
        
        # Analizar tipo de retorno
        if node.returns:
            properties['return'] = self._extract_annotation_type(node.returns)
        
        return TypeDefinition(
            name=f"{node.name}Function",
            kind='type',
            properties=properties,
            description=self._extract_docstring(node)
        )
    
    def _extract_assignment_types(self, node: ast.Assign) -> List[TypeDefinition]:
        """Extrae tipos de asignaciones"""
        types = []
        
        for target in node.targets:
            if isinstance(target, ast.Name):
                type_name = self._infer_type_from_value(node.value)
                types.append(TypeDefinition(
                    name=target.id,
                    kind='type',
                    properties={'value': type_name},
                    description=f"Type alias for {target.id}"
                ))
        
        return types
    
    def _infer_type_from_value(self, node: ast.AST) -> str:
        """Infiere tipo TypeScript desde valor Python"""
        if isinstance(node, ast.Str):
            return 'string'
        elif isinstance(node, ast.Num):
            if isinstance(node.n, int):
                return 'number'
            elif isinstance(node.n, float):
                return 'number'
        elif isinstance(node, ast.List):
            return 'any[]'
        elif isinstance(node, ast.Dict):
            return 'Record<string, any>'
        elif isinstance(node, ast.NameConstant):
            if node.value is True or node.value is False:
                return 'boolean'
            elif node.value is None:
                return 'null'
        elif isinstance(node, ast.Name):
            return 'any'
        
        return 'any'
    
    def _extract_annotation_type(self, node: ast.AST) -> str:
        """Extrae tipo desde anotación Python"""
        if isinstance(node, ast.Name):
            return self._map_python_type_to_ts(node.id)
        elif isinstance(node, ast.Attribute):
            return f"{node.value.id}.{node.attr}"
        elif isinstance(node, ast.Subscript):
            base_type = self._extract_annotation_type(node.value)
            if isinstance(node.slice, ast.Index):
                slice_type = self._extract_annotation_type(node.slice.value)
                return f"{base_type}<{slice_type}>"
        elif isinstance(node, ast.Constant):
            return self._infer_type_from_value(node)
        
        return 'any'
    
    def _map_python_type_to_ts(self, python_type: str) -> str:
        """Mapea tipos Python a TypeScript"""
        type_mapping = {
            'str': 'string',
            'int': 'number',
            'float': 'number',
            'bool': 'boolean',
            'list': 'any[]',
            'dict': 'Record<string, any>',
            'tuple': 'any[]',
            'set': 'Set<any>',
            'Optional': 'any',
            'Union': 'any',
            'List': 'any[]',
            'Dict': 'Record<string, any>',
            'Tuple': 'any[]',
            'Set': 'Set<any>',
            'Any': 'any',
            'None': 'null'
        }
        
        return type_mapping.get(python_type, 'any')
    
    def _extract_docstring(self, node: ast.AST) -> str:
        """Extrae docstring de un nodo"""
        if hasattr(node, 'body') and node.body:
            first_item = node.body[0]
            if isinstance(first_item, ast.Expr) and isinstance(first_item.value, ast.Str):
                return first_item.value.s.strip()
        return ""
    
    def generate_typescript_definition(self, type_def: TypeDefinition) -> str:
        """Genera definición TypeScript desde TypeDefinition"""
        lines = []
        
        # Comentario de documentación
        if type_def.description:
            lines.append(f"/**")
            lines.append(f" * {type_def.description}")
            lines.append(f" */")
        
        # Definición del tipo
        if type_def.kind == 'interface':
            extends_part = f" extends {type_def.extends}" if type_def.extends else ""
            implements_part = f" implements {', '.join(type_def.implements)}" if type_def.implements else ""
            lines.append(f"export interface {type_def.name}{extends_part}{implements_part} {{")
            
            for prop_name, prop_type in type_def.properties.items():
                lines.append(f"  {prop_name}: {prop_type};")
            
            lines.append("}")
            
        elif type_def.kind == 'type':
            if len(type_def.properties) == 1 and 'value' in type_def.properties:
                lines.append(f"export type {type_def.name} = {type_def.properties['value']};")
            else:
                lines.append(f"export type {type_def.name} = {{")
                for prop_name, prop_type in type_def.properties.items():
                    lines.append(f"  {prop_name}: {prop_type};")
                lines.append("};")
        
        elif type_def.kind == 'enum':
            lines.append(f"export enum {type_def.name} {{")
            for prop_name, prop_type in type_def.properties.items():
                lines.append(f"  {prop_name} = '{prop_name}',")
            lines.append("}")
        
        return "\n".join(lines)
    
    def generate_module_file(self, module_name: str, types: List[TypeDefinition]) -> str:
        """Genera archivo completo de módulo TypeScript"""
        lines = [
            f"/**",
            f" * {module_name} - Tipos generados automáticamente",
            f" *",
            f" * Generado por TypeGenerator.py",
            f" * Fecha: {self._get_current_timestamp()}",
            f" */",
            "",
            "// ============================================================================",
            f"// TIPOS DEL MÓDULO {module_name.upper()}",
            "// ============================================================================",
            ""
        ]
        
        for type_def in types:
            lines.append(self.generate_typescript_definition(type_def))
            lines.append("")
        
        return "\n".join(lines)
    
    def _get_current_timestamp(self) -> str:
        """Obtiene timestamp actual"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def scan_and_generate(self) -> Dict[str, str]:
        """Escanea directorios y genera tipos TypeScript"""
        logger.info("Iniciando escaneo y generación de tipos...")
        
        generated_files = {}
        
        for py_file in self.base_path.rglob("*.py"):
            if py_file.name != "TypeGenerator.py":
                types = self.analyze_python_code(str(py_file))
                
                if types:
                    module_name = py_file.stem
                    ts_content = self.generate_module_file(module_name, types)
                    
                    # Guardar archivo TypeScript
                    ts_file = py_file.with_suffix('.d.ts')
                    with open(ts_file, 'w', encoding='utf-8') as f:
                        f.write(ts_content)
                    
                    generated_files[str(ts_file)] = ts_content
                    logger.info(f"Generado: {ts_file}")
        
        return generated_files
    
    def validate_types(self, types: List[TypeDefinition]) -> List[str]:
        """Valida tipos generados"""
        errors = []
        
        for type_def in types:
            # Validar nombre
            if not re.match(r'^[A-Z][a-zA-Z0-9]*$', type_def.name):
                errors.append(f"Nombre inválido: {type_def.name}")
            
            # Validar propiedades
            for prop_name, prop_type in type_def.properties.items():
                if not re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', prop_name):
                    errors.append(f"Propiedad inválida: {prop_name}")
                
                if prop_type not in ['string', 'number', 'boolean', 'any', 'null', 'undefined'] and not re.match(r'^[A-Z][a-zA-Z0-9]*(\[\]|<\w+>)?$', prop_type):
                    errors.append(f"Tipo inválido: {prop_type}")
        
        return errors

def main():
    """Función principal"""
    generator = TypeScriptTypeGenerator()
    
    print("🔧 TypeGenerator - Generando tipos TypeScript...")
    
    try:
        generated_files = generator.scan_and_generate()
        
        print(f"✅ Generados {len(generated_files)} archivos de tipos:")
        for file_path in generated_files.keys():
            print(f"  📄 {file_path}")
        
        print("\n🎯 Proceso completado exitosamente!")
        
    except Exception as e:
        print(f"❌ Error durante la generación: {e}")
        logger.error(f"Error en main: {e}")

if __name__ == "__main__":
    main() 