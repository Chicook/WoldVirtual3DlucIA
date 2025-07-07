import os
import shutil
import datetime
import importlib.util
import traceback
import ast
import re
import json

SELF_IMPROVEMENT_DIR = os.path.join(os.path.dirname(__file__), 'memoria', 'self_improvement')
PRUEBAS_DIR = os.path.join(SELF_IMPROVEMENT_DIR, 'pruebas')
LOGS_DIR = os.path.join(SELF_IMPROVEMENT_DIR, 'logs')
LOG_FILE = os.path.join(LOGS_DIR, 'experiment_results.log')
TREE_FILE = os.path.join(LOGS_DIR, 'experiment_tree.json')
DASHBOARD_FILE = os.path.join(LOGS_DIR, 'dashboard.md')
BEST_FILE = os.path.join(LOGS_DIR, 'best_versions.json')

# =============================
# Utilidades de gestión de carpetas
# =============================
def ensure_dirs():
    os.makedirs(PRUEBAS_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)

# =============================
# Análisis avanzado de código
# =============================
def find_unused_imports_and_functions(code):
    """
    Analiza el código y retorna una lista de imports y funciones no usadas.
    """
    tree = ast.parse(code)
    imports = set()
    used_names = set()
    unused_funcs = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name)
        elif isinstance(node, ast.ImportFrom):
            for alias in node.names:
                imports.add(alias.name)
        elif isinstance(node, ast.Name):
            used_names.add(node.id)
        elif isinstance(node, ast.FunctionDef):
            unused_funcs.add(node.name)
    unused_imports = [imp for imp in imports if imp not in used_names]
    unused_functions = [func for func in unused_funcs if func not in used_names]
    return unused_imports, unused_functions

# =============================
# Refactorización automática de docstrings
# =============================
def add_or_update_docstrings(code):
    """
    Añade docstrings a funciones que no los tengan.
    """
    def docstring_for_func(name):
        return f'"""Función auto-documentada: {name}"""'
    pattern = re.compile(r'(def\s+([a-zA-Z0-9_]+)\s*\([^)]*\):\n)(\s+)(?!""")')
    def replacer(match):
        header, name, indent = match.groups()
        return f'{header}{indent}{docstring_for_func(name)}\n{indent}'
    return pattern.sub(replacer, code)

# =============================
# Escaneo y sugerencia de mejoras avanzadas
# =============================
def scan_and_suggest_improvements(target_file):
    with open(target_file, 'r', encoding='utf-8') as f:
        code = f.read()
    unused_imports, unused_functions = find_unused_imports_and_functions(code)
    code = add_or_update_docstrings(code)
    summary = []
    if unused_imports:
        summary.append(f'Remover imports no usados: {unused_imports}')
    if unused_functions:
        summary.append(f'Remover funciones no usadas: {unused_functions}')
    if not summary:
        summary.append('No se detectaron mejoras automáticas.')
    # Agregar comentario resumen al inicio
    suggestion = f'# Mejora automática avanzada: {"; ".join(summary)}\n' + code
    return suggestion, summary

# =============================
# Crear copia de prueba y registrar árbol de versiones
# =============================
def create_test_copy(target_file, summary):
    ensure_dirs()
    base = os.path.basename(target_file)
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    test_file = os.path.join(PRUEBAS_DIR, f'{timestamp}_{base}')
    shutil.copy2(target_file, test_file)
    # Registrar en árbol de versiones
    tree = {}
    if os.path.exists(TREE_FILE):
        with open(TREE_FILE, 'r', encoding='utf-8') as f:
            try:
                tree = json.load(f)
            except Exception:
                tree = {}
    node = {
        'file': test_file,
        'timestamp': timestamp,
        'summary': summary,
        'parent': base,
    }
    tree[timestamp] = node
    with open(TREE_FILE, 'w', encoding='utf-8') as f:
        json.dump(tree, f, indent=2)
    return test_file, timestamp

# =============================
# Aplicar mejora/refactor
# =============================
def apply_refactor(test_file, suggestion):
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(suggestion)

# =============================
# Ejecutar tests (simulado)
# =============================
def run_self_tests(test_file):
    try:
        spec = importlib.util.spec_from_file_location('test_module', test_file)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return True, 'Importación exitosa'
    except Exception as e:
        return False, f'Error: {e}\n{traceback.format_exc()}'

# =============================
# Registrar resultado y resumen
# =============================
def log_experiment(test_file, result, details, summary, timestamp):
    ensure_dirs()
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(f'{datetime.datetime.now().isoformat()} | {os.path.basename(test_file)} | {result} | {details} | {summary} | {timestamp}\n')

# =============================
# Comparar versiones y seleccionar la mejor
# =============================
def compare_versions_and_select_best():
    """
    Analiza los logs y selecciona la mejor versión (más éxitos, menos fallos, más reciente).
    """
    if not os.path.exists(LOG_FILE):
        return None
    results = {}
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('|')
            if len(parts) < 6:
                continue
            _, file, result, details, summary, timestamp = [p.strip() for p in parts]
            if file not in results:
                results[file] = {'success': 0, 'fail': 0, 'last': timestamp, 'summary': summary}
            if 'ÉXITO' in result:
                results[file]['success'] += 1
            else:
                results[file]['fail'] += 1
            results[file]['last'] = timestamp
    # Seleccionar la mejor versión por más éxitos y más reciente
    best = sorted(results.items(), key=lambda x: (x[1]['success'], -int(x[1]['last'].replace('_',''))), reverse=True)
    best_versions = {b[0]: b[1] for b in best[:3]}
    with open(BEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(best_versions, f, indent=2)
    return best_versions

# =============================
# Limpieza inteligente de experimentos
# =============================
def clean_old_experiments(keep_last=5):
    """
    Mantiene solo los últimos N experimentos exitosos por archivo.
    """
    if not os.path.exists(LOG_FILE):
        return
    lines = []
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    # Agrupar por archivo
    by_file = {}
    for line in lines:
        parts = line.strip().split('|')
        if len(parts) < 6:
            continue
        _, file, result, details, summary, timestamp = [p.strip() for p in parts]
        if file not in by_file:
            by_file[file] = []
        by_file[file].append((timestamp, line))
    # Mantener solo los últimos N
    new_lines = []
    for file, entries in by_file.items():
        entries = sorted(entries, key=lambda x: x[0], reverse=True)
        new_lines.extend([e[1] for e in entries[:keep_last]])
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    # Limpiar archivos de pruebas antiguos
    all_files = set(os.listdir(PRUEBAS_DIR))
    keep_files = set([l.strip().split('|')[1].strip() for l in new_lines if 'ÉXITO' in l])
    for f in all_files:
        if f not in keep_files:
            try:
                os.remove(os.path.join(PRUEBAS_DIR, f))
            except Exception:
                pass

# =============================
# Generar dashboard de logs en Markdown
# =============================
def generate_dashboard():
    if not os.path.exists(LOG_FILE):
        return
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    md = ['# Dashboard de Experimentos de Auto-Mejora de lucIA\n']
    md.append('| Timestamp | Archivo | Resultado | Resumen | |\n|---|---|---|---|---|')
    for line in lines:
        parts = line.strip().split('|')
        if len(parts) < 6:
            continue
        ts, file, result, details, summary, timestamp = [p.strip() for p in parts]
        md.append(f'| {ts} | {file} | {result} | {summary} | |')
    with open(DASHBOARD_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))

# =============================
# Ciclo principal de auto-mejora avanzada
# =============================
def self_improvement_cycle(target_file):
    print(f'Iniciando ciclo de auto-mejora avanzada para: {target_file}')
    suggestion, summary = scan_and_suggest_improvements(target_file)
    test_file, timestamp = create_test_copy(target_file, summary)
    apply_refactor(test_file, suggestion)
    success, details = run_self_tests(test_file)
    log_experiment(test_file, 'ÉXITO' if success else 'FALLO', details, summary, timestamp)
    print(f'Resultado: {"ÉXITO" if success else "FALLO"}. Detalles: {details}')
    print(f'Resumen de cambios: {summary}')
    # Ampliación: comparar versiones, limpiar y generar dashboard
    compare_versions_and_select_best()
    clean_old_experiments()
    generate_dashboard()
    return success

# =============================
# Ejemplo de uso (solo para pruebas internas)
# =============================
if __name__ == '__main__':
    archivo_objetivo = os.path.join(os.path.dirname(__file__), '..', 'context_manager.py')
    archivo_objetivo = os.path.abspath(archivo_objetivo)
    self_improvement_cycle(archivo_objetivo) 