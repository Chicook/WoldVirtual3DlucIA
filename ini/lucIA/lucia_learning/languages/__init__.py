import os
from .python_module import PythonLanguageModule
from .mojo_module import MojoLanguageModule

class LanguageManager:
    """Gestor multi-lenguaje para lucIA"""
    def __init__(self):
        self.modules = {
            'python': PythonLanguageModule(),
            'py': PythonLanguageModule(),
            'mojo': MojoLanguageModule(),
            '🔥': MojoLanguageModule(),
        }

    def detect_language(self, file_path):
        ext = os.path.splitext(file_path)[1].lower().replace('.', '')
        if ext in self.modules:
            return ext
        # Detección por contenido (simple)
        with open(file_path, 'r', encoding='utf-8') as f:
            first_line = f.readline().lower()
            if 'mojo' in first_line or '🔥' in first_line:
                return 'mojo'
            if 'python' in first_line:
                return 'python'
        return ext if ext in self.modules else None

    def get_module(self, lang):
        return self.modules.get(lang)

    def analyze(self, file_path):
        lang = self.detect_language(file_path)
        module = self.get_module(lang)
        if module:
            return module.analyze(file_path)
        return f"Lenguaje no soportado: {lang}"

    def refactor(self, file_path):
        lang = self.detect_language(file_path)
        module = self.get_module(lang)
        if module:
            return module.refactor(file_path)
        return f"Lenguaje no soportado: {lang}"

    def generate(self, lang, prompt):
        module = self.get_module(lang)
        if module:
            return module.generate(prompt)
        return f"Lenguaje no soportado: {lang}" 