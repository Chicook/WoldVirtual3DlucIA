#!/usr/bin/env python3
"""
Sistema de Parafraseo Mejorado para LucIA
Genera respuestas variadas basándose en la memoria almacenada
"""

import random
import re
import sqlite3
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json

@dataclass
class ParaphraseConfig:
    """Configuración para el parafraseo"""
    personality: str = "metaverso"
    confidence_threshold: float = 0.8
    max_variations: int = 5
    use_memory: bool = True
    creativity_level: float = 0.7

class AdvancedParaphraser:
    """Sistema de parafraseo avanzado con memoria"""
    
    def __init__(self, config: ParaphraseConfig):
        self.config = config
        self.memory_db_path = Path("lucia_learning/lucia_memory.db")
        
        # Patrones de parafraseo por personalidad
        self.paraphrase_patterns = {
            "metaverso": {
                "greetings": [
                    "🌐 ¡Bienvenido al metaverso!",
                    "🎮 ¡Hola, explorador digital!",
                    "🚀 ¡Saludos desde el mundo virtual!",
                    "🌟 ¡Hola, viajero del ciberespacio!"
                ],
                "confirmations": [
                    "✅ Perfecto, entiendo perfectamente",
                    "🎯 Exacto, tienes razón",
                    "👍 ¡Excelente observación!",
                    "💡 ¡Muy buena pregunta!"
                ],
                "thinking": [
                    "🤔 Déjame analizar esto...",
                    "🧠 Procesando la información...",
                    "💭 Reflexionando sobre tu consulta...",
                    "🔍 Investigando en mi memoria..."
                ],
                "suggestions": [
                    "💡 Te sugiero que",
                    "🎯 Mi recomendación es",
                    "🚀 Te propongo",
                    "🌟 Considera que"
                ]
            },
            "desarrollador": {
                "greetings": [
                    "💻 ¡Hola, desarrollador!",
                    "🔧 ¡Saludos, programador!",
                    "⚡ ¡Hola, coder!",
                    "🎯 ¡Bienvenido, developer!"
                ],
                "confirmations": [
                    "✅ Código correcto",
                    "🎯 Implementación adecuada",
                    "👍 Buena práctica",
                    "💡 Excelente enfoque"
                ],
                "thinking": [
                    "🔍 Analizando el código...",
                    "⚙️ Revisando la implementación...",
                    "🧠 Evaluando la arquitectura...",
                    "💭 Pensando en la optimización..."
                ],
                "suggestions": [
                    "🔧 Te recomiendo refactorizar",
                    "⚡ Optimiza con",
                    "🎯 Implementa usando",
                    "💻 Considera usar"
                ]
            }
        }
        
        # Conectores para variar respuestas
        self.connectors = [
            "Además,", "Por otro lado,", "También,", "Asimismo,", 
            "Igualmente,", "Del mismo modo,", "De igual forma,", "Similarmente,"
        ]
        
        # Frases de transición
        self.transitions = [
            "Pasando al siguiente punto,", "Continuando con,", "Ahora bien,", 
            "En cuanto a,", "Respecto a,", "Sobre,", "En relación con,"
        ]
        
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
                paraphrased = self._paraphrase_response(base_response)
                
                # Ajustar longitud
                if len(paraphrased) > max_length:
                    paraphrased = self._truncate_response(paraphrased, max_length)
                
                return paraphrased
            else:
                # Si no hay respuestas similares, generar una respuesta genérica
                return self._generate_generic_response(prompt)
                
        except Exception as e:
            print(f"Error en parafraseo desde memoria: {e}")
            return self._generate_generic_response(prompt)
    
    def _find_similar_responses(self, prompt: str, limit: int = 5) -> List[str]:
        """Busca respuestas similares en la memoria"""
        if not self.memory_db_path.exists():
            return []
            
        try:
            conn = sqlite3.connect(self.memory_db_path)
            cursor = conn.cursor()
            
            # Extraer palabras clave del prompt
            keywords = self._extract_keywords(prompt)
            
            # Buscar respuestas que contengan palabras clave similares
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
            print(f"Error buscando respuestas similares: {e}")
            return []
    
    def _paraphrase_response(self, response: str) -> str:
        """Parafrasea una respuesta específica"""
        # Aplicar patrones de personalidad
        response = self._apply_personality_patterns(response)
        
        # Variar conectores
        response = self._vary_connectors(response)
        
        # Añadir emojis apropiados
        response = self._add_emojis(response)
        
        # Variar estructura de frases
        response = self._vary_sentence_structure(response)
        
        return response
    
    def _apply_personality_patterns(self, response: str) -> str:
        """Aplica patrones de personalidad a la respuesta"""
        patterns = self.paraphrase_patterns.get(self.config.personality, {})
        
        # Añadir saludo si no tiene uno
        if not any(greeting in response for greeting in patterns.get("greetings", [])):
            if random.random() < 0.3:  # 30% de probabilidad
                greeting = random.choice(patterns.get("greetings", ["¡Hola!"]))
                response = f"{greeting} {response}"
        
        # Añadir confirmación ocasional
        if random.random() < 0.2:  # 20% de probabilidad
            confirmation = random.choice(patterns.get("confirmations", ["Entiendo."]))
            response = f"{response} {confirmation}"
        
        return response
    
    def _vary_connectors(self, response: str) -> str:
        """Varía los conectores en la respuesta"""
        # Reemplazar conectores comunes
        connector_replacements = {
            "Además,": random.choice(self.connectors),
            "También,": random.choice(self.connectors),
            "Por otro lado,": random.choice(self.connectors)
        }
        
        for old, new in connector_replacements.items():
            if old in response and random.random() < 0.5:
                response = response.replace(old, new, 1)
        
        return response
    
    def _add_emojis(self, response: str) -> str:
        """Añade emojis apropiados a la respuesta"""
        emoji_mappings = {
            "código": "💻",
            "metaverso": "🌐",
            "blockchain": "⛓️",
            "crypto": "₿",
            "3D": "🎮",
            "desarrollo": "🔧",
            "optimización": "⚡",
            "seguridad": "🔒",
            "creatividad": "🎨",
            "innovación": "🚀",
            "solución": "💡",
            "problema": "🔍",
            "éxito": "✅",
            "error": "❌",
            "ayuda": "🤝",
            "aprendizaje": "📚"
        }
        
        # Añadir emojis basándose en palabras clave
        for word, emoji in emoji_mappings.items():
            if word.lower() in response.lower() and random.random() < 0.3:
                # Añadir emoji al inicio de la frase que contiene la palabra
                sentences = response.split('.')
                for i, sentence in enumerate(sentences):
                    if word.lower() in sentence.lower():
                        if not sentence.strip().startswith(emoji):
                            sentences[i] = f"{emoji} {sentence.strip()}"
                        break
                response = '.'.join(sentences)
        
        return response
    
    def _vary_sentence_structure(self, response: str) -> str:
        """Varía la estructura de las frases"""
        sentences = response.split('.')
        
        # Ocasionalmente cambiar el orden de las frases
        if len(sentences) > 2 and random.random() < 0.3:
            # Mover la segunda frase al final
            if len(sentences) >= 3:
                sentences = [sentences[0]] + sentences[2:] + [sentences[1]]
        
        # Añadir frases de transición
        if len(sentences) > 1 and random.random() < 0.2:
            transition = random.choice(self.transitions)
            sentences.insert(1, transition)
        
        return '.'.join(sentences)
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrae palabras clave del texto"""
        # Palabras comunes a ignorar
        stop_words = {
            "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", "da", "su", "por", "son", 
            "con", "para", "al", "una", "me", "tu", "como", "qué", "cómo", "dónde", "cuándo", "por", "qué", "muy", 
            "más", "pero", "si", "yo", "él", "ella", "nosotros", "vosotros", "ellos", "ellas"
        }
        
        # Limpiar texto
        import re
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

# Función de utilidad para usar el parafraseador
def create_paraphraser(personality: str = "metaverso") -> AdvancedParaphraser:
    """Crea una instancia del parafraseador avanzado"""
    config = ParaphraseConfig(
        personality=personality,
        confidence_threshold=0.8,
        max_variations=5,
        use_memory=True,
        creativity_level=0.7
    )
    return AdvancedParaphraser(config)

if __name__ == "__main__":
    # Prueba del parafraseador
    paraphraser = create_paraphraser("metaverso")
    
    test_prompt = "¿Cómo puedo mejorar el rendimiento de mi código?"
    
    print("🔄 Probando parafraseo desde memoria...")
    response = paraphraser.paraphrase_from_memory(test_prompt)
    print(f"Respuesta: {response}") 