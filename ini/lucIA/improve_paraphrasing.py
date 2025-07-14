#!/usr/bin/env python3
"""
🚀 Mejora del Sistema de Parafraseo - LucIA
Integración de prompts profesionales para respuestas más coherentes y lógicas
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

class ParaphrasingImprover:
    """Sistema mejorado de parafraseo con prompts profesionales"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.prompts_path = self.project_root / "lucia_learning" / "memoria" / "pronts_base"
        self.professional_prompts = {}
        self.advanced_prompts = {}
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('ParaphrasingImprover')
        
        # Cargar prompts profesionales
        self._load_professional_prompts()
        
    def _load_professional_prompts(self):
        """Carga todos los prompts profesionales"""
        try:
            # Cargar prompts básicos
            basic_prompts_file = self.prompts_path / "professional_prompts.json"
            if basic_prompts_file.exists():
                with open(basic_prompts_file, 'r', encoding='utf-8') as f:
                    self.professional_prompts = json.load(f)
                self.logger.info("✅ Prompts profesionales básicos cargados")
            
            # Cargar prompts avanzados
            advanced_prompts_file = self.prompts_path / "advanced_prompts.json"
            if advanced_prompts_file.exists():
                with open(advanced_prompts_file, 'r', encoding='utf-8') as f:
                    self.advanced_prompts = json.load(f)
                self.logger.info("✅ Prompts avanzados cargados")
                
        except Exception as e:
            self.logger.error(f"❌ Error cargando prompts: {e}")
    
    def improve_response(self, original_response: str, query_type: str = "general", 
                        personality: str = "professional") -> str:
        """
        Mejora una respuesta usando prompts profesionales
        
        Args:
            original_response: Respuesta original a mejorar
            query_type: Tipo de consulta (general, technical, educational, creative)
            personality: Personalidad a aplicar (professional, friendly, analytical, etc.)
        
        Returns:
            str: Respuesta mejorada
        """
        try:
            # 1. Analizar la respuesta original
            analysis = self._analyze_response(original_response)
            
            # 2. Seleccionar prompt apropiado
            selected_prompt = self._select_prompt(query_type, personality)
            
            # 3. Aplicar mejora estructural
            improved_response = self._apply_structural_improvement(
                original_response, selected_prompt, analysis
            )
            
            # 4. Validar calidad
            if self._validate_response_quality(improved_response):
                return improved_response
            else:
                # Si no pasa validación, aplicar mejora básica
                return self._apply_basic_improvement(original_response, personality)
                
        except Exception as e:
            self.logger.error(f"❌ Error mejorando respuesta: {e}")
            return original_response
    
    def _analyze_response(self, response: str) -> Dict:
        """Analiza la respuesta para determinar mejoras necesarias"""
        analysis = {
            "length": len(response),
            "has_structure": bool(re.search(r'\n\d+\.|\n\*\*|\n-', response)),
            "has_conclusion": bool(re.search(r'en resumen|en conclusión|finalmente', response, re.IGNORECASE)),
            "has_transitions": bool(re.search(r'además|por otro lado|sin embargo|por lo tanto', response, re.IGNORECASE)),
            "clarity_score": self._calculate_clarity_score(response),
            "coherence_score": self._calculate_coherence_score(response)
        }
        
        return analysis
    
    def _select_prompt(self, query_type: str, personality: str) -> Dict:
        """Selecciona el prompt más apropiado según el tipo de consulta y personalidad"""
        
        # Seleccionar prompt base según tipo de consulta
        if query_type == "technical":
            base_prompt = self.advanced_prompts.get("expert_prompts", {}).get("technical_expert", {})
        elif query_type == "educational":
            base_prompt = self.professional_prompts.get("context_prompts", {}).get("educational", {})
        elif query_type == "creative":
            base_prompt = self.professional_prompts.get("context_prompts", {}).get("creative", {})
        else:
            base_prompt = self.professional_prompts.get("context_prompts", {}).get("general", {})
        
        # Aplicar personalidad
        personality_prompt = self.professional_prompts.get("personality_prompts", {}).get(personality, {})
        
        # Combinar prompts
        combined_prompt = {
            "system_prompt": base_prompt.get("system_prompt", ""),
            "response_template": base_prompt.get("response_template", ""),
            "personality_pattern": personality_prompt.get("response_pattern", ""),
            "key_phrases": base_prompt.get("key_phrases", []) + personality_prompt.get("keywords", [])
        }
        
        return combined_prompt
    
    def _apply_structural_improvement(self, response: str, prompt: Dict, analysis: Dict) -> str:
        """Aplica mejoras estructurales usando el prompt seleccionado"""
        
        # Si la respuesta es muy corta, aplicar template básico
        if analysis["length"] < 100:
            return self._apply_basic_template(response, prompt)
        
        # Si no tiene estructura, aplicar framework estructurado
        if not analysis["has_structure"]:
            return self._apply_structured_framework(response, prompt)
        
        # Si no tiene conclusiones, añadir una
        if not analysis["has_conclusion"]:
            return self._add_conclusion(response, prompt)
        
        # Si no tiene transiciones, mejorarlas
        if not analysis["has_transitions"]:
            return self._improve_transitions(response, prompt)
        
        # Aplicar mejoras generales
        return self._apply_general_improvements(response, prompt)
    
    def _apply_basic_template(self, response: str, prompt: Dict) -> str:
        """Aplica template básico para respuestas cortas"""
        template = prompt.get("response_template", "{response}")
        
        # Extraer tema principal
        topic = self._extract_main_topic(response)
        
        # Aplicar template
        improved = template.format(
            topic=topic,
            response=response
        )
        
        return improved
    
    def _apply_structured_framework(self, response: str, prompt: Dict) -> str:
        """Aplica framework estructurado para respuestas complejas"""
        
        # Seleccionar framework apropiado
        frameworks = self.advanced_prompts.get("response_frameworks", {})
        
        if "problem" in response.lower() or "solución" in response.lower():
            framework = frameworks.get("problem_solution", {})
        elif "comparar" in response.lower() or "diferencias" in response.lower():
            framework = frameworks.get("comparative_analysis", {})
        else:
            framework = frameworks.get("structured_response", {})
        
        template = framework.get("template", "{response}")
        
        # Estructurar la respuesta
        structured_response = self._structure_response(response, template)
        
        return structured_response
    
    def _structure_response(self, response: str, template: str) -> str:
        """Estructura una respuesta usando un template"""
        
        # Dividir la respuesta en partes
        sentences = response.split('. ')
        
        if len(sentences) < 3:
            return response
        
        # Crear estructura básica
        context = sentences[0] if sentences else ""
        analysis = '. '.join(sentences[1:-1]) if len(sentences) > 2 else ""
        solution = sentences[-1] if sentences else ""
        
        # Aplicar template
        structured = template.format(
            topic=self._extract_main_topic(response),
            context=context,
            analysis=analysis,
            solution=solution,
            additional_considerations="",
            conclusion=solution
        )
        
        return structured
    
    def _add_conclusion(self, response: str, prompt: Dict) -> str:
        """Añade una conclusión apropiada a la respuesta"""
        
        # Seleccionar frase de conclusión apropiada
        conclusion_phrases = self.advanced_prompts.get("professional_phrases", {}).get("conclusion", [])
        
        if conclusion_phrases:
            conclusion_phrase = conclusion_phrases[0]  # Usar la primera disponible
        else:
            conclusion_phrase = "En resumen,"
        
        # Extraer punto principal
        main_point = self._extract_main_point(response)
        
        # Añadir conclusión
        conclusion = f"\n\n{conclusion_phrase} {main_point}"
        
        return response + conclusion
    
    def _improve_transitions(self, response: str, prompt: Dict) -> str:
        """Mejora las transiciones en la respuesta"""
        
        # Obtener frases de transición
        transition_phrases = self.advanced_prompts.get("professional_phrases", {}).get("transition", [])
        
        if not transition_phrases:
            return response
        
        # Dividir en párrafos
        paragraphs = response.split('\n\n')
        
        if len(paragraphs) < 2:
            return response
        
        # Añadir transiciones
        improved_paragraphs = [paragraphs[0]]
        
        for i, paragraph in enumerate(paragraphs[1:], 1):
            transition = transition_phrases[i % len(transition_phrases)]
            improved_paragraphs.append(f"{transition} {paragraph}")
        
        return '\n\n'.join(improved_paragraphs)
    
    def _apply_general_improvements(self, response: str, prompt: Dict) -> str:
        """Aplica mejoras generales a la respuesta"""
        
        # Añadir frases profesionales de introducción si es necesario
        if not self._has_professional_introduction(response):
            intro_phrases = self.advanced_prompts.get("professional_phrases", {}).get("introduction", [])
            if intro_phrases:
                introduction = intro_phrases[0]
                response = f"{introduction} {response}"
        
        # Mejorar claridad
        response = self._improve_clarity(response)
        
        # Añadir contexto si es necesario
        response = self._add_context_if_needed(response, prompt)
        
        return response
    
    def _apply_basic_improvement(self, response: str, personality: str) -> str:
        """Aplica mejora básica cuando fallan las mejoras avanzadas"""
        
        # Obtener patrones de personalidad
        personality_patterns = self.professional_prompts.get("personality_prompts", {}).get(personality, {})
        
        # Aplicar patrón de respuesta
        pattern = personality_patterns.get("response_pattern", "{response}")
        
        improved = pattern.format(
            response=response,
            topic=self._extract_main_topic(response),
            benefit="proporciona información útil"
        )
        
        return improved
    
    def _validate_response_quality(self, response: str) -> bool:
        """Valida la calidad de la respuesta mejorada"""
        
        # Verificar longitud mínima
        if len(response) < 50:
            return False
        
        # Verificar que no esté vacía
        if not response.strip():
            return False
        
        # Verificar que tenga contenido útil
        if response.lower() in ["error", "no disponible", "sin información"]:
            return False
        
        # Verificar coherencia básica
        if not self._is_coherent(response):
            return False
        
        return True
    
    def _calculate_clarity_score(self, text: str) -> float:
        """Calcula un score de claridad del texto"""
        # Implementación básica - se puede mejorar
        sentences = text.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        
        # Score más alto para oraciones de longitud moderada
        if 10 <= avg_sentence_length <= 25:
            return 0.9
        elif 5 <= avg_sentence_length <= 30:
            return 0.7
        else:
            return 0.5
    
    def _calculate_coherence_score(self, text: str) -> float:
        """Calcula un score de coherencia del texto"""
        # Verificar presencia de conectores lógicos
        connectors = ['por lo tanto', 'además', 'sin embargo', 'en consecuencia', 'así que']
        connector_count = sum(1 for connector in connectors if connector in text.lower())
        
        return min(1.0, connector_count * 0.2)
    
    def _extract_main_topic(self, text: str) -> str:
        """Extrae el tema principal del texto"""
        # Implementación básica - se puede mejorar con NLP
        words = text.lower().split()
        common_words = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'una', 'como', 'más', 'pero', 'sus', 'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'están', 'estado', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros']
        
        # Filtrar palabras comunes y obtener las más frecuentes
        meaningful_words = [word for word in words if word not in common_words and len(word) > 3]
        
        if meaningful_words:
            return meaningful_words[0]
        else:
            return "el tema"
    
    def _extract_main_point(self, text: str) -> str:
        """Extrae el punto principal del texto"""
        sentences = text.split('.')
        if sentences:
            return sentences[-1].strip()
        return text.strip()
    
    def _has_professional_introduction(self, text: str) -> bool:
        """Verifica si el texto tiene una introducción profesional"""
        intro_indicators = [
            'basándome en',
            'según',
            'considerando',
            'para responder',
            'desde una perspectiva'
        ]
        
        return any(indicator in text.lower() for indicator in intro_indicators)
    
    def _improve_clarity(self, text: str) -> str:
        """Mejora la claridad del texto"""
        # Reemplazar frases confusas
        replacements = {
            'es importante mencionar que es importante': 'es importante mencionar que',
            'además además': 'además',
            'por lo tanto por lo tanto': 'por lo tanto'
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    def _add_context_if_needed(self, text: str, prompt: Dict) -> str:
        """Añade contexto si es necesario"""
        # Si el texto es muy técnico, añadir contexto
        technical_terms = ['api', 'blockchain', 'smart contract', 'web3', 'nft']
        
        if any(term in text.lower() for term in technical_terms):
            context_phrase = "En el contexto de las tecnologías emergentes, "
            if not text.startswith(context_phrase):
                text = context_phrase + text
        
        return text
    
    def _is_coherent(self, text: str) -> bool:
        """Verifica si el texto es coherente"""
        # Verificación básica de coherencia
        sentences = text.split('.')
        
        if len(sentences) < 2:
            return True
        
        # Verificar que las oraciones tengan sentido
        for sentence in sentences:
            if len(sentence.split()) < 3:  # Oración muy corta
                continue
            if not sentence.strip():
                continue
            
            # Verificar que tenga verbo (implementación básica)
            if not any(word in sentence.lower() for word in ['es', 'son', 'está', 'están', 'puede', 'pueden', 'tiene', 'tienen']):
                return False
        
        return True

def main():
    """Función principal para probar el sistema mejorado"""
    improver = ParaphrasingImprover()
    
    # Ejemplo de uso
    original_response = "El metaverso es una tecnología nueva. Permite crear mundos virtuales. Los usuarios pueden interactuar."
    
    print("🔧 Mejorando sistema de parafraseo...")
    print(f"Respuesta original: {original_response}")
    
    improved_response = improver.improve_response(
        original_response, 
        query_type="technical", 
        personality="professional"
    )
    
    print(f"Respuesta mejorada: {improved_response}")
    print("✅ Sistema de parafraseo mejorado exitosamente!")

if __name__ == "__main__":
    main() 