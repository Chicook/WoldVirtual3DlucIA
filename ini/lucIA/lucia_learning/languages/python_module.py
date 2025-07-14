import ast

class PythonLanguageModule:
    """Módulo de análisis y refactorización para Python"""
    def analyze(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        try:
            tree = ast.parse(code)
            functions = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
            imports = [n.names[0].name for n in ast.walk(tree) if isinstance(n, ast.Import)]
            return {
                'functions': functions,
                'imports': imports,
                'lines': len(code.splitlines()),
                'summary': f"Funciones: {len(functions)}, Imports: {len(imports)}, Líneas: {len(code.splitlines())}"
            }
        except Exception as e:
            return {'error': str(e)}

    def refactor(self, file_path):
        # Ejemplo: añadir docstrings a funciones sin docstring
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        tree = ast.parse(code)
        new_code = code
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and ast.get_docstring(node) is None:
                start = node.lineno - 1
                lines = code.splitlines()
                indent = ' ' * (len(lines[start]) - len(lines[start].lstrip()))
                doc = f'{indent}"""Función auto-documentada: {node.name}"""'
                lines.insert(start + 1, doc)
                new_code = '\n'.join(lines)
        return new_code

    def generate(self, prompt):
        # Generación simple de función Python a partir de un prompt
        return f'def funcion_generada():\n    """{prompt}"""\n    pass\n' 