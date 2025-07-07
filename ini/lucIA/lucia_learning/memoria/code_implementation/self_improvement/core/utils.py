#!/usr/bin/env python3
"""
Utils - Utilidades del Sistema de Auto-mejora de LucIA
Funciones auxiliares para el sistema de auto-mejora integrado
"""

import ast
import re
import logging
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import json
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

def extract_keywords(text: str) -> List[str]:
    """Extrae palabras clave del texto"""
    # Palabras de parada en español
    stop_words = {
        "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", "da", "su", "por", "son", "con", "para", "al", "del", "los", "las", "una", "como", "pero", "sus", "me", "hasta", "hay", "donde", "han", "quien", "están", "estado", "desde", "todo", "nos", "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual", "poco", "ella", "estar", "estas", "algunas", "algo", "nosotros", "mi", "mis", "tú", "te", "ti", "tu", "tus", "ellas", "nosotras", "vosotros", "vosotras", "os", "mío", "mía", "míos", "mías", "tuyo", "tuya", "tuyos", "tuyas", "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra", "nuestros", "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "esos", "esas", "estoy", "estás", "está", "estamos", "estáis", "están", "esté", "estés", "estemos", "estéis", "estén", "estaré", "estarás", "estará", "estaremos", "estaréis", "estarán", "estaría", "estarías", "estaríamos", "estaríais", "estarían", "estaba", "estabas", "estábamos", "estabais", "estaban", "estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron", "estuviera", "estuvieras", "estuviéramos", "estuvierais", "estuvieran", "estuviese", "estuvieses", "estuviésemos", "estuvieseis", "estuviesen", "estando", "estado", "estada", "estados", "estadas", "estad", "he", "has", "ha", "hemos", "habéis", "han", "haya", "hayas", "hayamos", "hayáis", "hayan", "habré", "habrás", "habrá", "habremos", "habréis", "habrán", "habría", "habrías", "habríamos", "habríais", "habrían", "había", "habías", "habíamos", "habíais", "habían", "hube", "hubiste", "hubo", "hubimos", "hubisteis", "hubieron", "hubiera", "hubieras", "hubiéramos", "hubierais", "hubieran", "hubiese", "hubieses", "hubiésemos", "hubieseis", "hubiesen", "habiendo", "habido", "habida", "habidos", "habidas", "soy", "eres", "es", "somos", "sois", "son", "sea", "seas", "seamos", "seáis", "sean", "seré", "serás", "será", "seremos", "seréis", "serán", "sería", "serías", "seríamos", "seríais", "serían", "era", "eras", "éramos", "erais", "eran", "fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron", "fuera", "fueras", "fuéramos", "fuerais", "fueran", "fuese", "fueses", "fuésemos", "fueseis", "fuesen", "sintiendo", "sentido", "sentida", "sentidos", "sentidas", "siente", "sentid", "tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen", "tenga", "tengas", "tengamos", "tengáis", "tengan", "tendré", "tendrás", "tendrá", "tendremos", "tendréis", "tendrán", "tendría", "tendrías", "tendríamos", "tendríais", "tendrían", "tenía", "tenías", "teníamos", "teníais", "tenían", "tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron", "tuviera", "tuvieras", "tuviéramos", "tuvierais", "tuvieran", "tuviese", "tuvieses", "tuviésemos", "tuvieseis", "tuviesen", "teniendo", "tenido", "tenida", "tenidos", "tenidas", "tened", "más", "pero", "si", "yo", "él", "ella", "nosotros", "vosotros", "ellos", "ellas", "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "aquellos", "aquellas", "ser", "estar", "tener", "hacer", "decir", "poder", "ir", "ver", "dar", "saber", "querer", "llegar", "pasar", "deber", "poner", "parecer", "quedar", "creer", "hablar", "llevar", "dejar", "seguir", "encontrar", "llamar", "venir", "pensar", "salir", "volver", "tomar", "conocer", "vivir", "sentir", "tratar", "mirar", "contar", "empezar", "esperar", "buscar", "existir", "entrar", "trabajar", "escribir", "perder", "producir", "ocurrir", "entender", "pedir", "recibir", "recordar", "terminar", "permitir", "aparecer", "conseguir", "comenzar", "servir", "sacar", "necesitar", "mantener", "resultar", "leer", "caer", "cambiar", "presentar", "crear", "abrir", "considerar", "oír", "puede", "podría", "debería", "haría", "sería", "estaría", "tendría", "vendría"
    }
    
    # Limpiar texto
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    words = text.split()
    
    # Filtrar palabras
    keywords = []
    for word in words:
        if (len(word) > 2 and 
            word not in stop_words and 
            not word.isdigit() and 
            word.isalpha()):
            keywords.append(word)
    
    return list(dict.fromkeys(keywords))

def calculate_code_hash(content: str) -> str:
    """Calcula hash del código para detectar cambios"""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def parse_python_file(file_path: Path) -> Optional[ast.AST]:
    """Parsea un archivo Python y retorna el AST"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return ast.parse(content)
    except Exception as e:
        logger.error(f"Error parseando {file_path}: {e}")
        return None

def count_functions(tree: ast.AST) -> int:
    """Cuenta el número de funciones en un AST"""
    return len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)])

def count_classes(tree: ast.AST) -> int:
    """Cuenta el número de clases en un AST"""
    return len([node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)])

def calculate_cyclomatic_complexity(tree: ast.AST) -> int:
    """Calcula la complejidad ciclomática de un AST"""
    complexity = 1
    
    for node in ast.walk(tree):
        if isinstance(node, (ast.If, ast.While, ast.For, ast.AsyncFor)):
            complexity += 1
        elif isinstance(node, ast.ExceptHandler):
            complexity += 1
        elif isinstance(node, ast.With):
            complexity += 1
        elif isinstance(node, ast.AsyncWith):
            complexity += 1
        elif isinstance(node, ast.Assert):
            complexity += 1
        elif isinstance(node, ast.BoolOp):
            complexity += len(node.values) - 1
            
    return complexity

def calculate_max_nesting_depth(tree: ast.AST) -> int:
    """Calcula la profundidad máxima de anidamiento"""
    max_depth = 0
    current_depth = 0
    
    def visit_node(node, depth):
        nonlocal max_depth
        max_depth = max(max_depth, depth)
        
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.Try, ast.With)):
                visit_node(child, depth + 1)
            else:
                visit_node(child, depth)
                
    visit_node(tree, 0)
    return max_depth

def calculate_documentation_coverage(content: str) -> float:
    """Calcula la cobertura de documentación"""
    lines = content.split('\n')
    doc_lines = 0
    code_lines = 0
    
    for line in lines:
        line = line.strip()
        if line:
            if line.startswith('#') or line.startswith('"""') or line.startswith("'''"):
                doc_lines += 1
            elif not line.startswith('import') and not line.startswith('from'):
                code_lines += 1
                
    return (doc_lines / (doc_lines + code_lines) * 100) if (doc_lines + code_lines) > 0 else 0

def calculate_code_duplication(content: str) -> float:
    """Calcula el porcentaje de duplicación de código"""
    lines = content.split('\n')
    line_hashes = {}
    duplicates = 0
    
    for i, line in enumerate(lines):
        line = line.strip()
        if line and not line.startswith('#'):
            line_hash = hash(line)
            if line_hash in line_hashes:
                duplicates += 1
            else:
                line_hashes[line_hash] = i
                
    total_lines = len([line for line in lines if line.strip() and not line.strip().startswith('#')])
    return (duplicates / total_lines * 100) if total_lines > 0 else 0

def detect_magic_numbers(content: str) -> List[Tuple[str, int]]:
    """Detecta números mágicos en el código"""
    magic_numbers = []
    
    # Patrón para números mágicos
    pattern = r'\b(\d{2,})\b'
    matches = re.finditer(pattern, content)
    
    for match in matches:
        number = match.group(1)
        line_number = content[:match.start()].count('\n') + 1
        magic_numbers.append((number, line_number))
        
    return magic_numbers

def detect_long_functions(tree: ast.AST, threshold: int = 50) -> List[Dict[str, Any]]:
    """Detecta funciones largas"""
    long_functions = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            if len(node.body) > threshold:
                long_functions.append({
                    'name': node.name,
                    'line_number': node.lineno,
                    'length': len(node.body),
                    'threshold': threshold
                })
                
    return long_functions

def detect_many_parameters(tree: ast.AST, threshold: int = 7) -> List[Dict[str, Any]]:
    """Detecta funciones con muchos parámetros"""
    many_params = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            param_count = len(node.args.args)
            if param_count > threshold:
                many_params.append({
                    'name': node.name,
                    'line_number': node.lineno,
                    'parameter_count': param_count,
                    'threshold': threshold
                })
                
    return many_params

def detect_unused_imports(tree: ast.AST) -> List[Dict[str, Any]]:
    """Detecta imports no utilizados (simplificado)"""
    imports = []
    used_names = set()
    
    # Recopilar imports
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append({
                    'name': alias.name,
                    'line_number': node.lineno,
                    'type': 'import'
                })
        elif isinstance(node, ast.ImportFrom):
            imports.append({
                'name': node.module or '',
                'line_number': node.lineno,
                'type': 'from_import'
            })
        elif isinstance(node, ast.Name):
            used_names.add(node.id)
            
    # Filtrar imports no utilizados
    unused_imports = []
    for imp in imports:
        if imp['name'] and imp['name'] not in used_names:
            unused_imports.append(imp)
            
    return unused_imports

def generate_improvement_suggestions(issues: List[Dict[str, Any]]) -> List[str]:
    """Genera sugerencias de mejora basadas en problemas detectados"""
    suggestions = []
    
    for issue in issues:
        issue_type = issue.get('type', '')
        
        if issue_type == 'long_function':
            suggestions.append(f"Dividir función '{issue.get('name', '')}' en funciones más pequeñas")
        elif issue_type == 'many_parameters':
            suggestions.append(f"Usar clase o estructura de datos para agrupar parámetros en '{issue.get('name', '')}'")
        elif issue_type == 'high_complexity':
            suggestions.append("Simplificar lógica condicional usando early returns")
        elif issue_type == 'deep_nesting':
            suggestions.append("Extraer funciones para reducir anidamiento")
        elif issue_type == 'magic_numbers':
            suggestions.append("Definir constantes con nombres descriptivos")
        elif issue_type == 'unused_imports':
            suggestions.append("Eliminar imports no utilizados")
        elif issue_type == 'low_documentation':
            suggestions.append("Añadir docstrings y comentarios explicativos")
            
    return suggestions

def calculate_maintainability_index(loc: int, cc: int, complexity: float) -> float:
    """Calcula el índice de mantenibilidad"""
    # Fórmula simplificada del índice de mantenibilidad
    # MI = 171 - 5.2 * ln(HV) - 0.23 * (CC) - 16.2 * ln(LOC)
    
    # Estimación simplificada
    hv_factor = 5.2 * complexity  # Halstead Volume aproximado
    cc_factor = 0.23 * cc
    loc_factor = 16.2 * (loc ** 0.5)  # Log aproximado
    
    mi = 171 - hv_factor - cc_factor - loc_factor
    return max(0, min(100, mi))  # Normalizar entre 0 y 100

def format_improvement_report(results: Dict[str, Any]) -> str:
    """Formatea reporte de mejoras"""
    report = f"""
📊 Reporte de Auto-mejora de LucIA
{'='*50}

📁 Archivos analizados: {results.get('analysis', {}).get('files_analyzed', 0)}
💡 Oportunidades encontradas: {len(results.get('opportunities', []))}
🛠️ Mejoras generadas: {len(results.get('improvements', []))}
✅ Mejoras válidas: {sum(1 for v in results.get('validation', []) if v.get('is_valid', False))}

📈 Métricas actuales:
"""
    
    metrics = results.get('analysis', {}).get('general_metrics', {})
    if metrics:
        report += f"   • Líneas de código: {metrics.get('lines_of_code', 0)}\n"
        report += f"   • Funciones: {metrics.get('functions', 0)}\n"
        report += f"   • Clases: {metrics.get('classes', 0)}\n"
        report += f"   • Complejidad promedio: {metrics.get('average_complexity', 0):.1f}\n"
        report += f"   • Documentación: {metrics.get('average_documentation_coverage', 0):.1f}%\n"
        
    report += "\n🚨 Problemas detectados:\n"
    issues = results.get('analysis', {}).get('issues_found', [])
    for issue in issues[:5]:  # Top 5
        report += f"   • {issue.get('description', 'Sin descripción')}\n"
        
    report += "\n💡 Oportunidades de mejora:\n"
    opportunities = results.get('opportunities', [])
    for opp in opportunities[:3]:  # Top 3
        report += f"   • {opp.get('description', 'Sin descripción')} (Prioridad: {opp.get('priority', 'N/A')})\n"
        
    return report

def save_analysis_results(results: Dict[str, Any], output_dir: Path) -> str:
    """Guarda resultados del análisis"""
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Guardar como JSON
        json_file = output_dir / f'analysis_results_{timestamp}.json'
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
            
        # Guardar reporte como texto
        report_file = output_dir / f'analysis_report_{timestamp}.txt'
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(format_improvement_report(results))
            
        return f"Resultados guardados en: {output_dir}"
        
    except Exception as e:
        logger.error(f"Error guardando resultados: {e}")
        return f"Error guardando resultados: {e}"

def validate_code_syntax(code: str) -> Tuple[bool, List[str]]:
    """Valida sintaxis del código Python"""
    errors = []
    
    try:
        ast.parse(code)
        return True, []
    except SyntaxError as e:
        errors.append(f"Error de sintaxis en línea {e.lineno}: {e.msg}")
        return False, errors
    except Exception as e:
        errors.append(f"Error parseando código: {e}")
        return False, errors

def check_code_quality(code: str) -> Dict[str, Any]:
    """Evalúa la calidad del código"""
    try:
        tree = ast.parse(code)
        
        quality_metrics = {
            'functions': count_functions(tree),
            'classes': count_classes(tree),
            'complexity': calculate_cyclomatic_complexity(tree),
            'nesting_depth': calculate_max_nesting_depth(tree),
            'documentation_coverage': calculate_documentation_coverage(code),
            'code_duplication': calculate_code_duplication(code),
            'long_functions': detect_long_functions(tree),
            'many_parameters': detect_many_parameters(tree),
            'magic_numbers': detect_magic_numbers(code)
        }
        
        # Calcular puntuación de calidad
        score = 100
        
        # Penalizar por complejidad alta
        if quality_metrics['complexity'] > 10:
            score -= (quality_metrics['complexity'] - 10) * 2
            
        # Penalizar por anidamiento profundo
        if quality_metrics['nesting_depth'] > 5:
            score -= (quality_metrics['nesting_depth'] - 5) * 3
            
        # Penalizar por documentación baja
        if quality_metrics['documentation_coverage'] < 30:
            score -= (30 - quality_metrics['documentation_coverage']) * 0.5
            
        # Penalizar por funciones largas
        score -= len(quality_metrics['long_functions']) * 2
        
        # Penalizar por muchos parámetros
        score -= len(quality_metrics['many_parameters']) * 1
        
        quality_metrics['quality_score'] = max(0, score)
        quality_metrics['quality_level'] = 'excellent' if score >= 80 else 'good' if score >= 60 else 'fair' if score >= 40 else 'poor'
        
        return quality_metrics
        
    except Exception as e:
        logger.error(f"Error evaluando calidad del código: {e}")
        return {'error': str(e)}

def generate_code_suggestions(quality_metrics: Dict[str, Any]) -> List[str]:
    """Genera sugerencias basadas en métricas de calidad"""
    suggestions = []
    
    if quality_metrics.get('complexity', 0) > 10:
        suggestions.append("Simplificar lógica condicional usando early returns")
        
    if quality_metrics.get('nesting_depth', 0) > 5:
        suggestions.append("Extraer funciones para reducir anidamiento")
        
    if quality_metrics.get('documentation_coverage', 0) < 30:
        suggestions.append("Añadir docstrings y comentarios explicativos")
        
    if quality_metrics.get('long_functions'):
        suggestions.append("Dividir funciones largas en funciones más pequeñas")
        
    if quality_metrics.get('many_parameters'):
        suggestions.append("Usar clases o estructuras de datos para agrupar parámetros")
        
    if quality_metrics.get('magic_numbers'):
        suggestions.append("Definir constantes con nombres descriptivos")
        
    return suggestions 