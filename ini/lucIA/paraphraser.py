"""
Sistema de parafraseo para LucIA - IA de la Plataforma Metaverso
"""

import re
import random
from typing import List, Dict, Optional
from dataclasses import dataclass
import logging
from config import config, PersonalityType

logger = logging.getLogger(__name__)

@dataclass
class ParaphraseConfig:
    """Configuración para el parafraseo"""
    personality: PersonalityType
    confidence_threshold: float = 0.8
    max_attempts: int = 3
    preserve_meaning: bool = True
    add_personality: bool = True

class Paraphraser:
    """Sistema de parafraseo inteligente"""
    
    def __init__(self, config: ParaphraseConfig):
        self.config = config
        self._load_paraphrase_patterns()
        
    def _load_paraphrase_patterns(self):
        """Carga patrones de parafraseo según la personalidad"""
        self.personality_patterns = {
            PersonalityType.FRIENDLY: {
                "greetings": ["¡Hola!", "¡Hola! 😊", "¡Ey!", "¡Saludos!"],
                "connectors": ["Además", "También", "Por otro lado", "Asimismo"],
                "endings": ["¡Espero que te ayude!", "¡Que tengas un buen día!", "¡Cualquier cosa me dices!"],
                "emojis": ["😊", "🤗", "✨", "🌟", "💫"]
            },
            PersonalityType.PROFESSIONAL: {
                "greetings": ["Buenos días.", "Saludos.", "Estimado usuario."],
                "connectors": ["Adicionalmente", "Asimismo", "Por consiguiente", "En consecuencia"],
                "endings": ["Espero que esta información sea útil.", "Quedo a su disposición.", "Saludos cordiales."],
                "emojis": ["📋", "💼", "🔍", "📊"]
            },
            PersonalityType.CREATIVE: {
                "greetings": ["¡Hola, creativos!", "¡Saludos artísticos!", "¡Hola, soñadores!"],
                "connectors": ["Imagina que", "Visualiza", "Piensa en", "Considera"],
                "endings": ["¡Que la creatividad te guíe!", "¡Inspírate y crea!", "¡El arte está en ti!"],
                "emojis": ["🎨", "✨", "💡", "🚀", "🌈"]
            },
            PersonalityType.ANALYTICAL: {
                "greetings": ["Análisis iniciado.", "Procesando consulta.", "Evaluando información."],
                "connectors": ["Según los datos", "Basándome en", "Analizando", "Considerando"],
                "endings": ["Análisis completado.", "Datos procesados.", "Evaluación finalizada."],
                "emojis": ["📊", "🔬", "📈", "🧮"]
            },
            PersonalityType.HUMOROUS: {
                "greetings": ["¡Ey!", "¡Hola, cómico!", "¡Saludos divertidos!"],
                "connectors": ["Y aquí viene lo bueno", "Pero espera", "Ahora la parte divertida"],
                "endings": ["¡Espero que te haya sacado una sonrisa!", "¡Hasta la próxima risa!", "¡Que el humor te acompañe!"],
                "emojis": ["😄", "😂", "🎭", "🎪", "🤪"]
            },
            PersonalityType.EMPATHETIC: {
                "greetings": ["Hola 💝", "Saludos con cariño", "Hola, amigo"],
                "connectors": ["Entiendo que", "Comprendo que", "Sé que", "Reconozco que"],
                "endings": ["Espero que esto te ayude 💝", "Estoy aquí para ti", "Con mucho cariño"],
                "emojis": ["💝", "🤲", "🌸", "🕊️", "💕"]
            },
            PersonalityType.METAVERSE: {
                "greetings": ["🌐 ¡Bienvenido al metaverso!", "🚀 ¡Hola, explorador digital!", "🎮 ¡Saludos virtuales!"],
                "connectors": ["En este mundo virtual", "Dentro del metaverso", "En el espacio digital", "En la realidad virtual"],
                "endings": ["¡Explora sin límites!", "¡El metaverso te espera!", "¡Que tu aventura digital sea increíble!"],
                "emojis": ["🌐", "🚀", "🎮", "🕶️", "🎨", "₿", "🖼️", "👤", "🗺️", "🛠️"]
            }
        }
        
        # Patrones de sinónimos y reemplazos
        self.synonym_patterns = {
            "puedo": ["puedes", "es posible", "se puede", "tienes la opción de"],
            "ayudar": ["asistir", "apoyar", "facilitar", "colaborar", "contribuir"],
            "información": ["datos", "conocimiento", "detalles", "información", "contenido"],
            "crear": ["construir", "desarrollar", "generar", "producir", "elaborar"],
            "explorar": ["descubrir", "investigar", "examinar", "analizar", "estudiar"],
            "conectar": ["unir", "enlazar", "relacionar", "comunicar", "interactuar"],
            "mundo": ["universo", "espacio", "ambiente", "entorno", "realidad"],
            "virtual": ["digital", "electrónico", "simulado", "informatizado"],
            "experiencia": ["vivencia", "aventura", "viaje", "travesía", "recorrido"],
            "tecnología": ["innovación", "avance", "desarrollo", "progreso", "evolución"]
        }
        
    def paraphrase(self, original_text: str, source_api: str = "unknown") -> str:
        """Parafrasea el texto original manteniendo el significado"""
        if not original_text or not self.config.preserve_meaning:
            return original_text
            
        try:
            # Limpiar el texto
            cleaned_text = self._clean_text(original_text)
            
            # Aplicar parafraseo básico
            paraphrased = self._apply_basic_paraphrasing(cleaned_text)
            
            # Aplicar personalidad
            if self.config.add_personality:
                paraphrased = self._apply_personality(paraphrased)
                
            # Verificar calidad
            if self._is_quality_paraphrase(original_text, paraphrased):
                return paraphrased
            else:
                # Si no es de buena calidad, intentar de nuevo
                for _ in range(self.config.max_attempts - 1):
                    paraphrased = self._apply_basic_paraphrasing(cleaned_text)
                    if self.config.add_personality:
                        paraphrased = self._apply_personality(paraphrased)
                    if self._is_quality_paraphrase(original_text, paraphrased):
                        return paraphrased
                        
                # Si no se logra buena calidad, devolver original con personalidad
                return self._apply_personality(original_text)
                
        except Exception as e:
            logger.error(f"Error en parafraseo: {e}")
            return original_text
    
    def paraphrase_from_memory(self, prompt: str, max_length: int = 500) -> str:
        """
        Genera una respuesta parafraseada basándose en la memoria almacenada
        """
        try:
            # Buscar respuestas similares en memoria
            similar_responses = self._find_similar_responses(prompt)
            
            if similar_responses:
                # Seleccionar una respuesta base
                base_response = random.choice(similar_responses)
                
                # Parafrasear la respuesta base
                paraphrased = self.paraphrase(base_response)
                
                # Ajustar longitud
                if len(paraphrased) > max_length:
                    paraphrased = self._truncate_response(paraphrased, max_length)
                
                return paraphrased
            else:
                # Si no hay respuestas similares, generar una respuesta genérica
                return self._generate_generic_response(prompt)
                
        except Exception as e:
            logger.error(f"Error en parafraseo desde memoria: {e}")
            return self._generate_generic_response(prompt)
    
    def _find_similar_responses(self, prompt: str, limit: int = 5) -> List[str]:
        """Busca respuestas similares en la memoria"""
        try:
            import sqlite3
            from pathlib import Path
            
            memory_db_path = Path("lucia_learning/lucia_memory.db")
            
            if not memory_db_path.exists():
                return []
                
            conn = sqlite3.connect(memory_db_path)
            cursor = conn.cursor()
            
            # Buscar respuestas recientes con buena confianza
            query = """
                SELECT original_response, paraphrased_response, confidence 
                FROM memory_entries 
                WHERE confidence > 0.6
                ORDER BY RANDOM()
                LIMIT ?
            """
            
            cursor.execute(query, (limit,))
            results = cursor.fetchall()
            
            responses = []
            for original, paraphrased, confidence in results:
                # Usar la respuesta parafraseada si existe, sino la original
                response = paraphrased if paraphrased else original
                responses.append(response)
            
            conn.close()
            return responses
            
        except Exception as e:
            logger.error(f"Error buscando respuestas similares: {e}")
            return []
    
    def _truncate_response(self, response: str, max_length: int) -> str:
        """Trunca la respuesta a una longitud máxima"""
        if len(response) <= max_length:
            return response
        
        # Buscar un punto cercano al límite
        truncated = response[:max_length]
        last_period = truncated.rfind('.')
        
        if last_period > max_length * 0.7:  # Si hay un punto en el 70% final
            return truncated[:last_period + 1]
        else:
            return truncated + "..."
    
    def _generate_generic_response(self, prompt: str) -> str:
        """Genera una respuesta genérica cuando no hay memoria disponible"""
        keywords = self._extract_keywords(prompt)
        
        if "código" in prompt.lower() or "programación" in prompt.lower():
            return "💻 Entiendo que necesitas ayuda con código. Te sugiero revisar la documentación y considerar las mejores prácticas de desarrollo."
        elif "metaverso" in prompt.lower():
            return "🌐 El metaverso es un espacio virtual fascinante. ¿En qué aspecto específico necesitas ayuda?"
        elif "memoria" in prompt.lower():
            return "🧠 Mi sistema de memoria está funcionando correctamente. ¿Hay algo específico que quieras consultar?"
        else:
            return "🤖 Entiendo tu consulta. ¿Podrías ser más específico para poder ayudarte mejor?"
    
    def paraphrase_code(self, original_code: str, language: str = "python") -> str:
        """
        Parafrasea código manteniendo la funcionalidad pero cambiando la estructura
        """
        if not original_code:
            return original_code
            
        try:
            # Detectar lenguaje si no se especifica
            if not language:
                language = self._detect_code_language(original_code)
            
            # Limpiar el código
            cleaned_code = self._clean_code(original_code)
            
            # Aplicar parafraseo de código
            paraphrased_code = self._apply_code_paraphrasing(cleaned_code, language)
            
            # Validar y corregir errores comunes
            validated_code = self._validate_and_fix_code(paraphrased_code, language)
            
            return validated_code
                
        except Exception as e:
            logger.error(f"Error en parafraseo de código: {e}")
            return original_code
    
    def _validate_and_fix_code(self, code: str, language: str) -> str:
        """Valida y corrige errores comunes en el código parafraseado"""
        try:
            # Detectar errores específicos
            errors = self._detect_common_errors(code, language)
            
            if errors:
                logger.info(f"Errores detectados en código {language}: {errors}")
                
                # Aplicar correcciones específicas del lenguaje
                if language == "python":
                    code = self._fix_python_errors(code)
                elif language == "javascript":
                    code = self._fix_javascript_errors(code)
                elif language == "java":
                    code = self._fix_java_errors(code)
                elif language == "cpp":
                    code = self._fix_cpp_errors(code)
                
                # Aplicar correcciones basadas en errores detectados
                code = self._apply_error_corrections(code, errors, language)
            
            # Validar sintaxis básica
            if not self._validate_syntax(code, language):
                logger.warning(f"Sintaxis inválida detectada en {language}, aplicando corrección automática")
                # Si falla la validación, intentar corrección automática
                code = self._auto_fix_syntax(code, language)
                
                # Validar nuevamente después de la corrección
                if not self._validate_syntax(code, language):
                    logger.error(f"No se pudo corregir la sintaxis del código {language}")
            
            return code
            
        except Exception as e:
            logger.error(f"Error en validación de código: {e}")
            return code
    
    def _fix_python_errors(self, code: str) -> str:
        """Corrige errores comunes en Python"""
        # Corregir indentación
        lines = code.split('\n')
        fixed_lines = []
        indent_level = 0
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                fixed_lines.append('')
                continue
                
            # Detectar cambios de nivel de indentación
            if stripped.startswith('def ') or stripped.startswith('class ') or stripped.startswith('if ') or stripped.startswith('for ') or stripped.startswith('while ') or stripped.startswith('try:') or stripped.startswith('except:') or stripped.startswith('else:') or stripped.startswith('elif '):
                # Mantener nivel actual
                pass
            elif stripped.startswith('return ') or stripped.startswith('break ') or stripped.startswith('continue ') or stripped.startswith('pass'):
                # Reducir indentación
                indent_level = max(0, indent_level - 1)
            elif stripped.endswith(':'):
                # Aumentar indentación para la siguiente línea
                indent_level += 1
            
            # Aplicar indentación correcta
            fixed_line = '    ' * indent_level + stripped
            fixed_lines.append(fixed_line)
        
        code = '\n'.join(fixed_lines)
        
        # Corregir errores de sintaxis comunes
        code = self._fix_common_python_syntax(code)
        
        return code
    
    def _fix_javascript_errors(self, code: str) -> str:
        """Corrige errores comunes en JavaScript"""
        # Corregir declaraciones de variables
        code = re.sub(r'\b(var|let|const)\s+(\w+)\s*=\s*(\w+)', r'\1 \2 = \3', code)
        
        # Corregir funciones
        code = re.sub(r'function\s+(\w+)\s*\(\s*\)\s*{', r'function \1() {', code)
        
        # Corregir clases
        code = re.sub(r'class\s+(\w+)\s*{', r'class \1 {', code)
        
        # Corregir métodos de clase
        code = re.sub(r'(\w+)\s*\(\s*\)\s*{', r'\1() {', code)
        
        # Añadir punto y coma faltantes
        lines = code.split('\n')
        fixed_lines = []
        
        for line in lines:
            stripped = line.strip()
            if (stripped and 
                not stripped.endswith(';') and 
                not stripped.endswith('{') and 
                not stripped.endswith('}') and
                not stripped.startswith('//') and
                not stripped.startswith('/*') and
                not stripped.startswith('*') and
                not stripped.startswith('*/') and
                not stripped.startswith('if ') and
                not stripped.startswith('for ') and
                not stripped.startswith('while ') and
                not stripped.startswith('function ') and
                not stripped.startswith('class ') and
                not stripped.startswith('return ') and
                not stripped.startswith('break ') and
                not stripped.startswith('continue ')):
                line = line.rstrip() + ';'
            fixed_lines.append(line)
        
        code = '\n'.join(fixed_lines)
        
        return code
    
    def _fix_java_errors(self, code: str) -> str:
        """Corrige errores comunes en Java"""
        # Corregir declaraciones de clase
        code = re.sub(r'public\s+class\s+(\w+)\s*{', r'public class \1 {', code)
        
        # Corregir métodos
        code = re.sub(r'public\s+(\w+)\s+(\w+)\s*\(\s*\)\s*{', r'public \1 \2() {', code)
        
        # Corregir variables
        code = re.sub(r'(\w+)\s+(\w+)\s*=\s*(\w+)', r'\1 \2 = \3', code)
        
        # Añadir punto y coma faltantes
        lines = code.split('\n')
        fixed_lines = []
        
        for line in lines:
            stripped = line.strip()
            if (stripped and 
                not stripped.endswith(';') and 
                not stripped.endswith('{') and 
                not stripped.endswith('}') and
                not stripped.startswith('//') and
                not stripped.startswith('/*') and
                not stripped.startswith('*') and
                not stripped.startswith('*/') and
                not stripped.startswith('if ') and
                not stripped.startswith('for ') and
                not stripped.startswith('while ') and
                not stripped.startswith('public ') and
                not stripped.startswith('private ') and
                not stripped.startswith('return ') and
                not stripped.startswith('break ') and
                not stripped.startswith('continue ')):
                line = line.rstrip() + ';'
            fixed_lines.append(line)
        
        code = '\n'.join(fixed_lines)
        
        return code
    
    def _fix_cpp_errors(self, code: str) -> str:
        """Corrige errores comunes en C++"""
        # Corregir includes
        code = re.sub(r'#include\s+<(\w+)>', r'#include <\1>', code)
        
        # Corregir declaraciones de función
        code = re.sub(r'(\w+)\s+(\w+)\s*\(\s*\)\s*{', r'\1 \2() {', code)
        
        # Corregir variables
        code = re.sub(r'(\w+)\s+(\w+)\s*=\s*(\w+)', r'\1 \2 = \3', code)
        
        # Añadir punto y coma faltantes
        lines = code.split('\n')
        fixed_lines = []
        
        for line in lines:
            stripped = line.strip()
            if (stripped and 
                not stripped.endswith(';') and 
                not stripped.endswith('{') and 
                not stripped.endswith('}') and
                not stripped.startswith('//') and
                not stripped.startswith('/*') and
                not stripped.startswith('*') and
                not stripped.startswith('*/') and
                not stripped.startswith('#') and
                not stripped.startswith('if ') and
                not stripped.startswith('for ') and
                not stripped.startswith('while ') and
                not stripped.startswith('return ') and
                not stripped.startswith('break ') and
                not stripped.startswith('continue ')):
                line = line.rstrip() + ';'
            fixed_lines.append(line)
        
        code = '\n'.join(fixed_lines)
        
        return code
    
    def _fix_common_python_syntax(self, code: str) -> str:
        """Corrige errores de sintaxis comunes en Python"""
        # Corregir espacios alrededor de operadores
        code = re.sub(r'(\w+)=(\w+)', r'\1 = \2', code)
        code = re.sub(r'(\w+)==(\w+)', r'\1 == \2', code)
        code = re.sub(r'(\w+)!=(\w+)', r'\1 != \2', code)
        code = re.sub(r'(\w+)>(\w+)', r'\1 > \2', code)
        code = re.sub(r'(\w+)<(\w+)', r'\1 < \2', code)
        code = re.sub(r'(\w+)>=(\w+)', r'\1 >= \2', code)
        code = re.sub(r'(\w+)<=(\w+)', r'\1 <= \2', code)
        
        # Corregir paréntesis en funciones
        code = re.sub(r'(\w+)\s*\(\s*\)', r'\1()', code)
        
        # Corregir espacios después de comas
        code = re.sub(r',(\w+)', r', \1', code)
        
        # Corregir espacios después de dos puntos
        code = re.sub(r':(\w+)', r': \1', code)
        
        return code
    
    def _validate_syntax(self, code: str, language: str) -> bool:
        """Valida la sintaxis básica del código"""
        try:
            if language == "python":
                # Usar ast para validar Python
                import ast
                ast.parse(code)
                return True
            elif language == "javascript":
                # Validación básica de JavaScript
                return self._validate_javascript_syntax(code)
            else:
                # Para otros lenguajes, validación básica
                return len(code.strip()) > 0
        except:
            return False
    
    def _validate_javascript_syntax(self, code: str) -> bool:
        """Valida sintaxis básica de JavaScript"""
        # Verificar paréntesis balanceados
        if code.count('(') != code.count(')'):
            return False
        
        # Verificar llaves balanceadas
        if code.count('{') != code.count('}'):
            return False
        
        # Verificar corchetes balanceados
        if code.count('[') != code.count(']'):
            return False
        
        # Verificar que las funciones tengan llaves
        if 'function' in code and '{' not in code:
            return False
        
        # Verificar que las clases tengan llaves
        if 'class' in code and '{' not in code:
            return False
        
        return True
    
    def _auto_fix_syntax(self, code: str, language: str) -> str:
        """Intenta corregir automáticamente errores de sintaxis"""
        try:
            if language == "python":
                return self._auto_fix_python_syntax(code)
            elif language == "javascript":
                return self._auto_fix_javascript_syntax(code)
            else:
                return code
        except:
            return code
    
    def _auto_fix_python_syntax(self, code: str) -> str:
        """Corrige automáticamente errores de sintaxis en Python"""
        # Añadir dos puntos faltantes después de if, for, while, def, class
        code = re.sub(r'(if|for|while|def|class)\s+([^:]+)$', r'\1 \2:', code, flags=re.MULTILINE)
        
        # Añadir return faltante en funciones
        lines = code.split('\n')
        fixed_lines = []
        in_function = False
        
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('def '):
                in_function = True
            elif stripped.startswith('class ') or stripped.startswith('def '):
                in_function = False
            
            # Si estamos en una función y la línea no tiene return, break, continue, pass
            if (in_function and stripped and 
                not stripped.startswith('def ') and 
                not stripped.startswith('if ') and 
                not stripped.startswith('for ') and 
                not stripped.startswith('while ') and 
                not stripped.startswith('return ') and 
                not stripped.startswith('break ') and 
                not stripped.startswith('continue ') and 
                not stripped.startswith('pass') and
                not stripped.endswith(':') and
                not stripped.endswith('return')):
                # Añadir return implícito
                line = line.rstrip() + '\n    return ' + stripped
        
        return '\n'.join(fixed_lines)
    
    def _auto_fix_javascript_syntax(self, code: str) -> str:
        """Corrige automáticamente errores de sintaxis en JavaScript"""
        # Añadir llaves faltantes en funciones
        code = re.sub(r'function\s+(\w+)\s*\([^)]*\)\s*([^{])', r'function \1() {\n    \2', code)
        
        # Añadir llaves faltantes en clases
        code = re.sub(r'class\s+(\w+)\s*([^{])', r'class \1 {\n    \2', code)
        
        # Añadir return faltante en funciones
        if 'function' in code and 'return' not in code:
            lines = code.split('\n')
            fixed_lines = []
            in_function = False
            
            for line in lines:
                stripped = line.strip()
                if stripped.startswith('function '):
                    in_function = True
                elif stripped.startswith('class ') or stripped.startswith('function '):
                    in_function = False
                
                if in_function and stripped and not stripped.startswith('return '):
                    line = line.rstrip() + '\n    return ' + stripped
            
            code = '\n'.join(fixed_lines)
        
        return code
    
    def _detect_common_errors(self, code: str, language: str) -> List[str]:
        """Detecta errores comunes en el código"""
        errors = []
        
        if language == "python":
            errors.extend(self._detect_python_errors(code))
        elif language == "javascript":
            errors.extend(self._detect_javascript_errors(code))
        elif language == "java":
            errors.extend(self._detect_java_errors(code))
        elif language == "cpp":
            errors.extend(self._detect_cpp_errors(code))
        
        return errors
    
    def _detect_python_errors(self, code: str) -> List[str]:
        """Detecta errores específicos de Python"""
        errors = []
        
        # Detectar indentación incorrecta
        lines = code.split('\n')
        expected_indent = 0
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped:
                continue
            
            # Calcular indentación actual
            current_indent = len(line) - len(line.lstrip())
            
            # Verificar si la indentación es correcta
            if current_indent != expected_indent * 4:
                errors.append(f"Línea {i+1}: Indentación incorrecta")
            
            # Actualizar indentación esperada
            if stripped.endswith(':'):
                expected_indent += 1
            elif stripped.startswith('return ') or stripped.startswith('break ') or stripped.startswith('continue ') or stripped.startswith('pass'):
                expected_indent = max(0, expected_indent - 1)
        
        # Detectar variables no definidas
        import re
        variables = re.findall(r'\b(\w+)\s*=', code)
        for var in variables:
            if var in ['if', 'for', 'while', 'def', 'class', 'import', 'from', 'return', 'break', 'continue', 'pass']:
                continue
            if not re.search(rf'\b{var}\b.*=', code):
                errors.append(f"Variable '{var}' posiblemente no definida")
        
        # Detectar funciones sin return
        functions = re.findall(r'def\s+(\w+)\s*\([^)]*\):', code)
        for func in functions:
            if 'return' not in code:
                errors.append(f"Función '{func}' posiblemente sin return")
        
        return errors
    
    def _detect_javascript_errors(self, code: str) -> List[str]:
        """Detecta errores específicos de JavaScript"""
        errors = []
        
        # Detectar punto y coma faltantes
        lines = code.split('\n')
        for i, line in enumerate(lines):
            stripped = line.strip()
            if (stripped and 
                not stripped.endswith(';') and 
                not stripped.endswith('{') and 
                not stripped.endswith('}') and
                not stripped.startswith('//') and
                not stripped.startswith('/*') and
                not stripped.startswith('*') and
                not stripped.startswith('*/') and
                not stripped.startswith('if ') and
                not stripped.startswith('for ') and
                not stripped.startswith('while ') and
                not stripped.startswith('function ') and
                not stripped.startswith('class ') and
                not stripped.startswith('return ') and
                not stripped.startswith('break ') and
                not stripped.startswith('continue ')):
                errors.append(f"Línea {i+1}: Punto y coma faltante")
        
        # Detectar variables no declaradas
        import re
        variables = re.findall(r'\b(\w+)\s*=', code)
        for var in variables:
            if var in ['if', 'for', 'while', 'function', 'class', 'return', 'break', 'continue']:
                continue
            if not re.search(rf'\b(var|let|const)\s+{var}\b', code):
                errors.append(f"Variable '{var}' posiblemente no declarada")
        
        # Detectar funciones sin return
        functions = re.findall(r'function\s+(\w+)\s*\([^)]*\)', code)
        for func in functions:
            if 'return' not in code:
                errors.append(f"Función '{func}' posiblemente sin return")
        
        return errors
    
    def _detect_java_errors(self, code: str) -> List[str]:
        """Detecta errores específicos de Java"""
        errors = []
        
        # Detectar punto y coma faltantes
        lines = code.split('\n')
        for i, line in enumerate(lines):
            stripped = line.strip()
            if (stripped and 
                not stripped.endswith(';') and 
                not stripped.endswith('{') and 
                not stripped.endswith('}') and
                not stripped.startswith('//') and
                not stripped.startswith('/*') and
                not stripped.startswith('*') and
                not stripped.startswith('*/') and
                not stripped.startswith('if ') and
                not stripped.startswith('for ') and
                not stripped.startswith('while ') and
                not stripped.startswith('public ') and
                not stripped.startswith('private ') and
                not stripped.startswith('return ') and
                not stripped.startswith('break ') and
                not stripped.startswith('continue ')):
                errors.append(f"Línea {i+1}: Punto y coma faltante")
        
        # Detectar variables no declaradas
        import re
        variables = re.findall(r'\b(\w+)\s*=', code)
        for var in variables:
            if var in ['if', 'for', 'while', 'public', 'private', 'return', 'break', 'continue']:
                continue
            if not re.search(rf'\b(int|String|boolean|double|float|long|char)\s+{var}\b', code):
                errors.append(f"Variable '{var}' posiblemente no declarada")
        
        return errors
    
    def _detect_cpp_errors(self, code: str) -> List[str]:
        """Detecta errores específicos de C++"""
        errors = []
        
        # Detectar punto y coma faltantes
        lines = code.split('\n')
        for i, line in enumerate(lines):
            stripped = line.strip()
            if (stripped and 
                not stripped.endswith(';') and 
                not stripped.endswith('{') and 
                not stripped.endswith('}') and
                not stripped.startswith('//') and
                not stripped.startswith('/*') and
                not stripped.startswith('*') and
                not stripped.startswith('*/') and
                not stripped.startswith('#') and
                not stripped.startswith('if ') and
                not stripped.startswith('for ') and
                not stripped.startswith('while ') and
                not stripped.startswith('return ') and
                not stripped.startswith('break ') and
                not stripped.startswith('continue ')):
                errors.append(f"Línea {i+1}: Punto y coma faltante")
        
        # Detectar variables no declaradas
        import re
        variables = re.findall(r'\b(\w+)\s*=', code)
        for var in variables:
            if var in ['if', 'for', 'while', 'return', 'break', 'continue']:
                continue
            if not re.search(rf'\b(int|string|bool|double|float|long|char)\s+{var}\b', code):
                errors.append(f"Variable '{var}' posiblemente no declarada")
        
        return errors
    
    def _apply_error_corrections(self, code: str, errors: List[str], language: str) -> str:
        """Aplica correcciones basadas en errores detectados"""
        corrected_code = code
        
        for error in errors:
            if "Indentación incorrecta" in error:
                corrected_code = self._fix_python_errors(corrected_code)
            elif "Punto y coma faltante" in error:
                corrected_code = self._fix_javascript_errors(corrected_code)
            elif "Variable" in error and "no definida" in error:
                corrected_code = self._fix_undefined_variables(corrected_code, language)
            elif "Función" in error and "sin return" in error:
                corrected_code = self._fix_missing_returns(corrected_code, language)
        
        return corrected_code
    
    def _fix_undefined_variables(self, code: str, language: str) -> str:
        """Corrige variables no definidas"""
        import re
        
        if language == "python":
            # Añadir declaraciones de variables
            variables = re.findall(r'\b(\w+)\s*=', code)
            for var in variables:
                if var not in ['if', 'for', 'while', 'def', 'class', 'import', 'from', 'return', 'break', 'continue', 'pass']:
                    # Buscar si ya está declarada
                    if not re.search(rf'\b{var}\s*=', code):
                        # Añadir declaración
                        code = f"{var} = None\n{code}"
        
        elif language == "javascript":
            # Añadir declaraciones de variables
            variables = re.findall(r'\b(\w+)\s*=', code)
            for var in variables:
                if var not in ['if', 'for', 'while', 'function', 'class', 'return', 'break', 'continue']:
                    # Buscar si ya está declarada
                    if not re.search(rf'\b(var|let|const)\s+{var}\b', code):
                        # Añadir declaración
                        code = f"let {var};\n{code}"
        
        return code
    
    def _fix_missing_returns(self, code: str, language: str) -> str:
        """Corrige funciones sin return"""
        import re
        
        if language == "python":
            # Buscar funciones sin return
            functions = re.findall(r'def\s+(\w+)\s*\([^)]*\):', code)
            for func in functions:
                if 'return' not in code:
                    # Añadir return al final de la función
                    lines = code.split('\n')
                    fixed_lines = []
                    in_function = False
                    
                    for line in lines:
                        stripped = line.strip()
                        if stripped.startswith(f'def {func}'):
                            in_function = True
                        elif stripped.startswith('def ') and func not in stripped:
                            in_function = False
                        
                        fixed_lines.append(line)
                        
                        # Si estamos al final de la función y no hay return
                        if in_function and stripped and not stripped.startswith('    '):
                            fixed_lines.append('    return None')
                    
                    code = '\n'.join(fixed_lines)
        
        elif language == "javascript":
            # Buscar funciones sin return
            functions = re.findall(r'function\s+(\w+)\s*\([^)]*\)', code)
            for func in functions:
                if 'return' not in code:
                    # Añadir return al final de la función
                    lines = code.split('\n')
                    fixed_lines = []
                    in_function = False
                    
                    for line in lines:
                        stripped = line.strip()
                        if stripped.startswith(f'function {func}'):
                            in_function = True
                        elif stripped.startswith('function ') and func not in stripped:
                            in_function = False
                        
                        fixed_lines.append(line)
                        
                        # Si estamos al final de la función y no hay return
                        if in_function and stripped and not stripped.startswith('    '):
                            fixed_lines.append('    return null;')
                    
                    code = '\n'.join(fixed_lines)
        
        return code
    
    def _detect_code_language(self, code: str) -> str:
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
        paraphrased = self._change_code_variable_names(paraphrased, language)
        
        # Cambiar nombres de funciones
        paraphrased = self._change_code_function_names(paraphrased, language)
        
        # Reestructurar lógica
        paraphrased = self._restructure_code_logic(paraphrased, language)
        
        # Modificar estilo
        paraphrased = self._modify_code_style(paraphrased, language)
        
        # Añadir comentarios
        paraphrased = self._add_code_comments(paraphrased, language)
        
        return paraphrased
    
    def _change_code_variable_names(self, code: str, language: str) -> str:
        """Cambia nombres de variables en el código"""
        variable_patterns = {
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
        }
        
        for old_name, alternatives in variable_patterns.items():
            if old_name in code:
                new_name = random.choice(alternatives)
                # Reemplazar manteniendo mayúsculas
                pattern = re.compile(r'\b' + re.escape(old_name) + r'\b', re.IGNORECASE)
                code = pattern.sub(new_name, code)
        
        return code
    
    def _change_code_function_names(self, code: str, language: str) -> str:
        """Cambia nombres de funciones en el código"""
        function_patterns = {
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
        }
        
        for prefix, alternatives in function_patterns.items():
            if prefix in code:
                new_prefix = random.choice(alternatives)
                # Reemplazar prefijos de funciones
                pattern = re.compile(r'\b' + re.escape(prefix), re.IGNORECASE)
                code = pattern.sub(new_prefix, code)
        
        return code
    
    def _restructure_code_logic(self, code: str, language: str) -> str:
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
            pattern = r'\[(.*?)\s+for\s+(.*?)\s+in\s+(.*?)\]'
            match = re.search(pattern, code)
            if match:
                expression = match.group(1)
                variable = match.group(2)
                iterable = match.group(3)
                
                new_code = f"result = []\nfor {variable} in {iterable}:\n    result.append({expression})\n"
                return code.replace(match.group(0), "result")
        
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
    
    def _modify_code_style(self, code: str, language: str) -> str:
        """Modifica el estilo del código"""
        # Cambiar indentación
        if language == "python":
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
    
    def _add_code_comments(self, code: str, language: str) -> str:
        """Añade comentarios al código"""
        comment_patterns = [
            "Process the given data",
            "Handle the input information",
            "Manage the provided content",
            "Work with the specified elements",
            "Operate on the input data"
        ]
        
        comment = random.choice(comment_patterns)
        
        if language == "python":
            return f"# {comment}\n{code}"
        elif language in ["javascript", "java", "cpp"]:
            return f"// {comment}\n{code}"
        
        return code
    
    def generate_code_from_memory(self, prompt: str, language: str = "python") -> str:
        """
        Genera código basándose en la memoria pero con estructura original
        """
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
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrae palabras clave del texto"""
        # Palabras comunes a ignorar
        stop_words = {
            "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", "da", "su", "por", "son", 
            "con", "para", "al", "una", "me", "tu", "como", "qué", "cómo", "dónde", "cuándo", "por", "qué", "muy", 
            "más", "pero", "si", "yo", "él", "ella", "nosotros", "vosotros", "ellos", "ellas"
        }
        
        # Limpiar texto
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text.split()
        
        # Filtrar palabras
        keywords = []
        for word in words:
            if (len(word) > 2 and 
                word not in stop_words and 
                word.isalpha()):
                keywords.append(word)
        
        return keywords[:10]  # Máximo 10 palabras clave
            
    def _clean_text(self, text: str) -> str:
        """Limpia el texto para parafraseo"""
        # Remover emojis y caracteres especiales que puedan interferir
        text = re.sub(r'[^\w\s\.,!?¿¡]', ' ', text)
        # Normalizar espacios
        text = re.sub(r'\s+', ' ', text).strip()
        return text
        
    def _apply_basic_paraphrasing(self, text: str) -> str:
        """Aplica parafraseo básico usando sinónimos y reestructuración"""
        paraphrased = text
        
        # Aplicar sinónimos
        for word, synonyms in self.synonym_patterns.items():
            if word in paraphrased.lower():
                synonym = random.choice(synonyms)
                # Reemplazar manteniendo mayúsculas
                pattern = re.compile(re.escape(word), re.IGNORECASE)
                paraphrased = pattern.sub(synonym, paraphrased)
                
        # Reestructurar oraciones simples
        paraphrased = self._restructure_sentences(paraphrased)
        
        return paraphrased
        
    def _restructure_sentences(self, text: str) -> str:
        """Reestructura oraciones para variar la sintaxis"""
        sentences = re.split(r'[.!?]+', text)
        restructured = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Patrones de reestructuración
            if sentence.lower().startswith('puedes'):
                # Cambiar "Puedes hacer X" por "Es posible hacer X"
                restructured.append(sentence.replace('Puedes', 'Es posible', 1).replace('puedes', 'es posible', 1))
            elif sentence.lower().startswith('el metaverso'):
                # Variar introducciones sobre el metaverso
                alternatives = [
                    "En el metaverso",
                    "Dentro del mundo virtual",
                    "En este espacio digital",
                    "En la realidad virtual"
                ]
                restructured.append(sentence.replace('El metaverso', random.choice(alternatives), 1).replace('el metaverso', random.choice(alternatives).lower(), 1))
            elif sentence.lower().startswith('los avatares'):
                # Variar descripciones de avatares
                alternatives = [
                    "Tu representación digital",
                    "Tu personaje virtual",
                    "Tu identidad en el metaverso"
                ]
                restructured.append(sentence.replace('Los avatares', random.choice(alternatives), 1).replace('los avatares', random.choice(alternatives).lower(), 1))
            else:
                restructured.append(sentence)
                
        return '. '.join(restructured) + ('.' if text.endswith('.') else '')
        
    def _apply_personality(self, text: str) -> str:
        """Aplica la personalidad configurada al texto"""
        personality = self.personality_patterns.get(self.config.personality, self.personality_patterns[PersonalityType.FRIENDLY])
        
        # Añadir emoji aleatorio al inicio
        emoji = random.choice(personality["emojis"])
        
        # Añadir saludo ocasional (30% de probabilidad)
        if random.random() < 0.3:
            greeting = random.choice(personality["greetings"])
            text = f"{greeting} {text}"
        else:
            text = f"{emoji} {text}"
            
        # Añadir final ocasional (20% de probabilidad)
        if random.random() < 0.2:
            ending = random.choice(personality["endings"])
            text = f"{text} {ending}"
            
        return text
        
    def _is_quality_paraphrase(self, original: str, paraphrased: str) -> bool:
        """Verifica si el parafraseo es de buena calidad"""
        # Verificar que no sea demasiado similar
        similarity = self._calculate_similarity(original, paraphrased)
        if similarity > 0.9:
            return False
            
        # Verificar que no sea demasiado diferente
        if similarity < 0.3:
            return False
            
        # Verificar longitud razonable
        original_words = len(original.split())
        paraphrased_words = len(paraphrased.split())
        
        if paraphrased_words < original_words * 0.5 or paraphrased_words > original_words * 2:
            return False
            
        return True
        
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calcula similitud entre dos textos"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
            
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
        
    def create_metaverse_response(self, base_response: str, context: str = "") -> str:
        """Crea una respuesta específica para el metaverso"""
        personality = self.personality_patterns[PersonalityType.METAVERSE]
        
        # Añadir contexto del metaverso
        metaverse_contexts = [
            "En el metaverso, cada experiencia es única y personalizada.",
            "El mundo virtual te ofrece posibilidades infinitas.",
            "La tecnología blockchain asegura la propiedad de tus activos digitales.",
            "Los NFTs te permiten poseer piezas únicas del metaverso.",
            "La realidad virtual te sumerge en experiencias inmersivas.",
            "Los avatares son tu identidad digital en este nuevo mundo."
        ]
        
        # Seleccionar contexto relevante
        if context:
            relevant_context = random.choice(metaverse_contexts)
            base_response = f"{relevant_context} {base_response}"
            
        # Aplicar personalidad del metaverso
        emoji = random.choice(personality["emojis"])
        greeting = random.choice(personality["greetings"])
        ending = random.choice(personality["endings"])
        
        return f"{greeting} {emoji} {base_response} {ending}"
        
    def enhance_with_keywords(self, text: str, keywords: List[str]) -> str:
        """Mejora el texto incorporando palabras clave relevantes"""
        if not keywords:
            return text
            
        # Buscar oportunidades para incorporar palabras clave
        enhanced_text = text
        
        for keyword in keywords[:3]:  # Máximo 3 palabras clave
            if keyword.lower() not in enhanced_text.lower():
                # Añadir palabra clave de forma natural
                connectors = ["Además", "También", "Específicamente", "En particular"]
                connector = random.choice(connectors)
                enhanced_text = f"{enhanced_text} {connector}, {keyword} es un aspecto importante a considerar."
                
        return enhanced_text 