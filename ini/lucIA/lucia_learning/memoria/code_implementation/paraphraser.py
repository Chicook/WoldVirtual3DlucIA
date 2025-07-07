#!/usr/bin/env python3
"""
Paraphraser - Sistema de Parafraseo Mejorado de LucIA
Versión para auto-análisis y mejora
"""

import re
import random
import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime

import config

logger = logging.getLogger(__name__)

class PersonalityType(Enum):
    """Tipos de personalidad para el parafraseo"""
    FRIENDLY = "friendly"
    PROFESSIONAL = "professional"
    CREATIVE = "creative"
    TECHNICAL = "technical"
    CASUAL = "casual"

@dataclass
class ParaphraseConfig:
    """Configuración del paraphraser"""
    personality: PersonalityType = PersonalityType.FRIENDLY
    confidence_threshold: float = 0.8
    max_paraphrase_length: int = 500
    enable_code_paraphrasing: bool = True
    enable_emoji: bool = True
    enable_formal_tone: bool = False

class Paraphraser:
    """Sistema de parafraseo inteligente"""
    
    def __init__(self, config: ParaphraseConfig = None):
        self.config = config or ParaphraseConfig()
        self._load_paraphrase_patterns()
        self._load_personality_templates()
        
    def _load_paraphrase_patterns(self):
        """Carga patrones de parafraseo"""
        self.paraphrase_patterns = {
            # Patrones de saludo
            "saludos": {
                "hola": ["¡Hola!", "¡Hola! ¿Cómo estás?", "¡Hola! ¿Qué tal?", "¡Hola! ¿Cómo va todo?"],
                "buenos_dias": ["¡Buenos días!", "¡Buenos días! ¿Cómo amaneciste?", "¡Buenos días! ¿Qué tal el día?"],
                "buenas_tardes": ["¡Buenas tardes!", "¡Buenas tardes! ¿Cómo va el día?", "¡Buenas tardes! ¿Qué tal?"],
                "buenas_noches": ["¡Buenas noches!", "¡Buenas noches! ¿Cómo fue tu día?", "¡Buenas noches! ¿Qué tal?"]
            },
            
            # Patrones de respuesta positiva
            "respuestas_positivas": {
                "excelente": ["¡Excelente!", "¡Fantástico!", "¡Genial!", "¡Perfecto!", "¡Maravilloso!"],
                "muy_bien": ["¡Muy bien!", "¡Perfecto!", "¡Genial!", "¡Excelente!", "¡Fantástico!"],
                "perfecto": ["¡Perfecto!", "¡Excelente!", "¡Genial!", "¡Fantástico!", "¡Maravilloso!"],
                "genial": ["¡Genial!", "¡Fantástico!", "¡Excelente!", "¡Perfecto!", "¡Maravilloso!"]
            },
            
            # Patrones de explicación
            "explicaciones": {
                "te_explico": ["Te explico", "Te cuento", "Te detallo", "Te aclaro", "Te explico paso a paso"],
                "es_decir": ["Es decir", "O sea", "En otras palabras", "Dicho de otra manera", "Para que entiendas"],
                "por_ejemplo": ["Por ejemplo", "Como ejemplo", "A modo de ejemplo", "Como muestra", "Para ilustrar"]
            },
            
            # Patrones de transición
            "transiciones": {
                "ademas": ["Además", "Por otro lado", "También", "Asimismo", "Igualmente"],
                "sin_embargo": ["Sin embargo", "No obstante", "Aunque", "Pero", "A pesar de"],
                "por_lo_tanto": ["Por lo tanto", "Por consiguiente", "En consecuencia", "Así que", "De ahí que"]
            },
            
            # Patrones de pregunta
            "preguntas": {
                "que_te_gustaria": ["¿Qué te gustaría?", "¿Qué prefieres?", "¿Qué opción prefieres?", "¿Cuál te parece mejor?"],
                "como_te_parece": ["¿Cómo te parece?", "¿Qué opinas?", "¿Qué te parece?", "¿Cómo lo ves?"],
                "te_gusta": ["¿Te gusta?", "¿Te parece bien?", "¿Te parece adecuado?", "¿Te parece correcto?"]
            }
        }
        
    def _load_personality_templates(self):
        """Carga plantillas según la personalidad"""
        self.personality_templates = {
            PersonalityType.FRIENDLY: {
                "emoji_frequency": 0.3,
                "formal_tone": False,
                "sentence_endings": ["😊", "👍", "✨", "🌟", "💫"],
                "greetings": ["¡Hola!", "¡Hola! ¿Cómo estás?", "¡Hola! ¿Qué tal?"],
                "farewells": ["¡Que tengas un buen día!", "¡Hasta luego!", "¡Nos vemos!"],
                "agreements": ["¡Perfecto!", "¡Genial!", "¡Excelente!", "¡Fantástico!"],
                "clarifications": ["Te explico", "Te cuento", "Te detallo"]
            },
            
            PersonalityType.PROFESSIONAL: {
                "emoji_frequency": 0.1,
                "formal_tone": True,
                "sentence_endings": ["", ".", ""],
                "greetings": ["Buenos días", "Buenas tardes", "Saludos"],
                "farewells": ["Que tenga un buen día", "Hasta luego", "Saludos cordiales"],
                "agreements": ["Perfecto", "Excelente", "Muy bien", "De acuerdo"],
                "clarifications": ["Le explico", "Le detallo", "Le aclaro"]
            },
            
            PersonalityType.CREATIVE: {
                "emoji_frequency": 0.5,
                "formal_tone": False,
                "sentence_endings": ["✨", "🎨", "🚀", "💡", "🌟", "🎭", "🎪"],
                "greetings": ["¡Hola creativo!", "¡Hola artista!", "¡Hola innovador!"],
                "farewells": ["¡Que la creatividad te acompañe!", "¡Hasta la próxima aventura!", "¡Nos vemos en el universo creativo!"],
                "agreements": ["¡Brillante!", "¡Increíble!", "¡Espectacular!", "¡Maravilloso!"],
                "clarifications": ["Te explico con creatividad", "Te cuento de forma artística", "Te detallo con imaginación"]
            },
            
            PersonalityType.TECHNICAL: {
                "emoji_frequency": 0.05,
                "formal_tone": True,
                "sentence_endings": ["", ".", ""],
                "greetings": ["Saludos", "Hola", "Buenos días"],
                "farewells": ["Hasta luego", "Que tenga un buen día", "Saludos"],
                "agreements": ["Correcto", "Adecuado", "Apropiado", "Satisfactorio"],
                "clarifications": ["Específicamente", "Técnicamente", "En términos técnicos", "Desde el punto de vista técnico"]
            },
            
            PersonalityType.CASUAL: {
                "emoji_frequency": 0.4,
                "formal_tone": False,
                "sentence_endings": ["😄", "👍", "👌", "🔥", "💯", "😎"],
                "greetings": ["¡Hola!", "¡Qué tal!", "¡Hola!", "¡Hey!"],
                "farewells": ["¡Nos vemos!", "¡Hasta luego!", "¡Chao!", "¡Bye!"],
                "agreements": ["¡Genial!", "¡Perfecto!", "¡Cool!", "¡Chévere!"],
                "clarifications": ["Te explico", "Te cuento", "Mira", "Fíjate"]
            }
        }
        
    def paraphrase_from_memory(self, text: str) -> str:
        """Parafrasea texto basado en patrones de memoria"""
        if not text or len(text.strip()) == 0:
            return text
            
        try:
            # Aplicar parafraseo básico
            paraphrased = self._apply_basic_paraphrasing(text)
            
            # Aplicar parafraseo de personalidad
            paraphrased = self._apply_personality_paraphrasing(paraphrased)
            
            # Aplicar parafraseo de código si es necesario
            if self.config.enable_code_paraphrasing and self._contains_code(text):
                paraphrased = self._apply_code_paraphrasing(paraphrased)
                
            # Limitar longitud
            if len(paraphrased) > self.config.max_paraphrase_length:
                paraphrased = paraphrased[:self.config.max_paraphrase_length] + "..."
                
            return paraphrased
            
        except Exception as e:
            logger.error(f"Error en parafraseo: {e}")
            return text
            
    def _apply_basic_paraphrasing(self, text: str) -> str:
        """Aplica parafraseo básico basado en patrones"""
        paraphrased = text
        
        # Aplicar patrones de saludo
        for category, patterns in self.paraphrase_patterns.items():
            for pattern, alternatives in patterns.items():
                if pattern in paraphrased.lower():
                    alternative = random.choice(alternatives)
                    paraphrased = re.sub(
                        rf'\b{re.escape(pattern)}\b', 
                        alternative, 
                        paraphrased, 
                        flags=re.IGNORECASE
                    )
                    
        # Aplicar sinónimos comunes
        synonyms = {
            "puedo": ["puedo", "soy capaz de", "tengo la capacidad de"],
            "ayudar": ["ayudar", "asistir", "apoyar", "colaborar"],
            "crear": ["crear", "desarrollar", "construir", "generar"],
            "mejorar": ["mejorar", "optimizar", "perfeccionar", "refinar"],
            "explicar": ["explicar", "detallar", "aclarar", "especificar"],
            "mostrar": ["mostrar", "exhibir", "presentar", "demostrar"],
            "funcionar": ["funcionar", "operar", "trabajar", "ejecutar"],
            "sistema": ["sistema", "plataforma", "infraestructura", "arquitectura"]
        }
        
        for word, alternatives in synonyms.items():
            if word in paraphrased.lower():
                alternative = random.choice(alternatives)
                paraphrased = re.sub(
                    rf'\b{re.escape(word)}\b', 
                    alternative, 
                    paraphrased, 
                    flags=re.IGNORECASE
                )
                
        return paraphrased
        
    def _apply_personality_paraphrasing(self, text: str) -> str:
        """Aplica parafraseo según la personalidad"""
        template = self.personality_templates.get(self.config.personality, 
                                                self.personality_templates[PersonalityType.FRIENDLY])
        
        paraphrased = text
        
        # Aplicar emojis según frecuencia
        if self.config.enable_emoji and random.random() < template["emoji_frequency"]:
            ending = random.choice(template["sentence_endings"])
            if ending and not paraphrased.endswith(ending):
                paraphrased += f" {ending}"
                
        # Aplicar tono formal si es necesario
        if template["formal_tone"] and not self.config.enable_formal_tone:
            paraphrased = self._make_formal(paraphrased)
        elif not template["formal_tone"] and self.config.enable_formal_tone:
            paraphrased = self._make_informal(paraphrased)
            
        return paraphrased
        
    def _apply_code_paraphrasing(self, text: str) -> str:
        """Aplica parafraseo específico para código"""
        # Detectar bloques de código
        code_blocks = re.findall(r'```[\w]*\n(.*?)\n```', text, re.DOTALL)
        
        for code_block in code_blocks:
            # Parafrasear comentarios en el código
            paraphrased_code = self._paraphrase_code_comments(code_block)
            
            # Reemplazar en el texto original
            text = text.replace(code_block, paraphrased_code)
            
        return text
        
    def _paraphrase_code_comments(self, code: str) -> str:
        """Parafrasea comentarios en código"""
        # Patrones de comentarios en diferentes lenguajes
        comment_patterns = [
            r'#\s*(.+)',  # Python, Ruby, etc.
            r'//\s*(.+)',  # JavaScript, C++, Java, etc.
            r'/\*\s*(.*?)\s*\*/',  # Comentarios multilínea
            r'<!--\s*(.*?)\s*-->',  # HTML
            r'/\*\*\s*(.*?)\s*\*/',  # JSDoc
        ]
        
        paraphrased_code = code
        
        for pattern in comment_patterns:
            matches = re.finditer(pattern, paraphrased_code, re.DOTALL)
            for match in matches:
                comment = match.group(1).strip()
                if comment:
                    paraphrased_comment = self._paraphrase_comment(comment)
                    paraphrased_code = paraphrased_code.replace(match.group(0), 
                                                               match.group(0).replace(comment, paraphrased_comment))
                    
        return paraphrased_code
        
    def _paraphrase_comment(self, comment: str) -> str:
        """Parafrasea un comentario específico"""
        # Sinónimos para comentarios técnicos
        comment_synonyms = {
            "función": ["función", "método", "procedimiento", "rutina"],
            "variable": ["variable", "dato", "valor", "elemento"],
            "clase": ["clase", "tipo", "estructura", "entidad"],
            "objeto": ["objeto", "instancia", "elemento", "entidad"],
            "array": ["array", "lista", "colección", "arreglo"],
            "string": ["string", "texto", "cadena", "caracteres"],
            "número": ["número", "valor numérico", "dato numérico"],
            "booleano": ["booleano", "valor lógico", "verdadero/falso"],
            "retorna": ["retorna", "devuelve", "regresa", "proporciona"],
            "recibe": ["recibe", "acepta", "toma", "obtiene"],
            "procesa": ["procesa", "maneja", "gestiona", "trata"],
            "valida": ["valida", "verifica", "comprueba", "confirma"],
            "crea": ["crea", "genera", "construye", "establece"],
            "elimina": ["elimina", "borra", "quita", "remueve"],
            "actualiza": ["actualiza", "modifica", "cambia", "ajusta"]
        }
        
        paraphrased_comment = comment
        
        for word, alternatives in comment_synonyms.items():
            if word in paraphrased_comment.lower():
                alternative = random.choice(alternatives)
                paraphrased_comment = re.sub(
                    rf'\b{re.escape(word)}\b', 
                    alternative, 
                    paraphrased_comment, 
                    flags=re.IGNORECASE
                )
                
        return paraphrased_comment
        
    def _contains_code(self, text: str) -> bool:
        """Detecta si el texto contiene código"""
        code_indicators = [
            r'```[\w]*\n',  # Bloques de código
            r'def\s+\w+\s*\(',  # Definiciones de función Python
            r'function\s+\w+\s*\(',  # Definiciones de función JavaScript
            r'class\s+\w+',  # Definiciones de clase
            r'import\s+',  # Imports
            r'from\s+',  # Imports Python
            r'const\s+',  # Declaraciones JavaScript
            r'let\s+',  # Declaraciones JavaScript
            r'var\s+',  # Declaraciones JavaScript
            r'public\s+',  # Modificadores Java/C#
            r'private\s+',  # Modificadores Java/C#
            r'protected\s+',  # Modificadores Java/C#
            r'if\s*\(',  # Condicionales
            r'for\s*\(',  # Bucles
            r'while\s*\(',  # Bucles
            r'try\s*{',  # Manejo de errores
            r'catch\s*\(',  # Manejo de errores
        ]
        
        for pattern in code_indicators:
            if re.search(pattern, text, re.IGNORECASE):
                return True
                
        return False
        
    def _make_formal(self, text: str) -> str:
        """Convierte texto a tono formal"""
        formal_replacements = {
            r'\bte\b': "le",
            r'\btu\b': "su",
            r'\btus\b': "sus",
            r'\bte\s+ayudo\b': "le ayudo",
            r'\bte\s+explico\b': "le explico",
            r'\bte\s+cuento\b': "le cuento",
            r'\bte\s+detallo\b': "le detallo",
            r'\bte\s+aclaro\b': "le aclaro",
            r'\bte\s+muestro\b': "le muestro",
            r'\bte\s+enseño\b': "le enseño",
            r'\bte\s+guío\b': "le guío",
            r'\bte\s+acompaño\b': "le acompaño"
        }
        
        paraphrased = text
        for pattern, replacement in formal_replacements.items():
            paraphrased = re.sub(pattern, replacement, paraphrased, flags=re.IGNORECASE)
            
        return paraphrased
        
    def _make_informal(self, text: str) -> str:
        """Convierte texto a tono informal"""
        informal_replacements = {
            r'\ble\b': "te",
            r'\bsu\b': "tu",
            r'\bsus\b': "tus",
            r'\ble\s+ayudo\b': "te ayudo",
            r'\ble\s+explico\b': "te explico",
            r'\ble\s+cuento\b': "te cuento",
            r'\ble\s+detallo\b': "te detallo",
            r'\ble\s+aclaro\b': "te aclaro",
            r'\ble\s+muestro\b': "te muestro",
            r'\ble\s+enseño\b': "te enseño",
            r'\ble\s+guío\b': "te guío",
            r'\ble\s+acompaño\b': "te acompaño"
        }
        
        paraphrased = text
        for pattern, replacement in informal_replacements.items():
            paraphrased = re.sub(pattern, replacement, paraphrased, flags=re.IGNORECASE)
            
        return paraphrased
        
    def change_personality(self, new_personality: PersonalityType):
        """Cambia la personalidad del paraphraser"""
        old_personality = self.config.personality
        self.config.personality = new_personality
        
        logger.info(f"Personalidad cambiada de {old_personality.value} a {new_personality.value}")
        return f"Personalidad cambiada de {old_personality.value} a {new_personality.value}"
        
    def get_paraphrase_stats(self) -> Dict[str, any]:
        """Obtiene estadísticas del paraphraser"""
        return {
            "personality": self.config.personality.value,
            "confidence_threshold": self.config.confidence_threshold,
            "max_paraphrase_length": self.config.max_paraphrase_length,
            "enable_code_paraphrasing": self.config.enable_code_paraphrasing,
            "enable_emoji": self.config.enable_emoji,
            "enable_formal_tone": self.config.enable_formal_tone,
            "patterns_loaded": len(self.paraphrase_patterns),
            "personality_templates": len(self.personality_templates)
        }
        
    def add_custom_pattern(self, category: str, pattern: str, alternatives: List[str]):
        """Añade un patrón personalizado"""
        if category not in self.paraphrase_patterns:
            self.paraphrase_patterns[category] = {}
            
        self.paraphrase_patterns[category][pattern] = alternatives
        logger.info(f"Patrón personalizado añadido: {category}.{pattern}")
        
    def remove_pattern(self, category: str, pattern: str):
        """Elimina un patrón"""
        if category in self.paraphrase_patterns and pattern in self.paraphrase_patterns[category]:
            del self.paraphrase_patterns[category][pattern]
            logger.info(f"Patrón eliminado: {category}.{pattern}")
            
    def get_available_patterns(self) -> Dict[str, List[str]]:
        """Obtiene todos los patrones disponibles"""
        patterns = {}
        for category, category_patterns in self.paraphrase_patterns.items():
            patterns[category] = list(category_patterns.keys())
        return patterns 