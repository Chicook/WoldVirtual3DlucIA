"""
Sistema de validación de respuestas para LucIA
Mejora la calidad y coherencia de las respuestas generadas
"""

import re
import time
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import logging
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

class QualityLevel(Enum):
    """Niveles de calidad de respuesta"""
    EXCELLENT = 90
    GOOD = 75
    ACCEPTABLE = 60
    POOR = 40
    UNACCEPTABLE = 20

@dataclass
class ValidationResult:
    """Resultado de la validación de una respuesta"""
    is_valid: bool
    quality_score: float
    issues: List[str]
    suggestions: List[str]
    confidence: float
    processing_time: float

class ResponseValidator:
    """Sistema de validación inteligente de respuestas"""
    
    def __init__(self):
        self.quality_threshold = 60.0
        self.repetition_threshold = 0.8
        self.min_length = 10
        self.max_length = 2000
        
        # Patrones de problemas comunes
        self.problem_patterns = {
            "repetitive": [
                r"(\b\w+\b)(?:\s+\1){2,}",  # Palabras repetidas
                r"([.!?])\s*\1{2,}",  # Puntuación repetida
            ],
            "incoherent": [
                r"\b(no|no es|no puede|no debe)\b.*\b(sí|es|puede|debe)\b",  # Contradicciones
                r"\b(siempre|nunca)\b.*\b(a veces|ocasionalmente)\b",  # Inconsistencias temporales
            ],
            "vague": [
                r"\b(algo|cosas|elementos|aspectos)\b",  # Términos vagos
                r"\b(etcétera|etc\.|\.\.\.)\b",  # Terminaciones vagas
            ],
            "incomplete": [
                r"\b(pero|sin embargo|no obstante)\b$",  # Frases incompletas
                r"\b(por ejemplo|como|tales como)\b$",  # Ejemplos sin completar
            ]
        }
        
        # Palabras de alta calidad
        self.quality_words = {
            "técnico": ["implementar", "optimizar", "integrar", "desarrollar", "configurar"],
            "específico": ["específicamente", "concretamente", "particularmente", "específico"],
            "detallado": ["detalladamente", "minuciosamente", "exhaustivamente", "completamente"],
            "profesional": ["profesionalmente", "técnicamente", "metodológicamente", "sistemáticamente"]
        }
        
    def validate_response(self, 
                         response: str, 
                         original_prompt: str = "", 
                         context: List[str] = None) -> ValidationResult:
        """Valida la calidad de una respuesta"""
        start_time = time.time()
        
        issues = []
        suggestions = []
        quality_score = 100.0
        
        # Validaciones básicas
        basic_validation = self._validate_basic(response)
        issues.extend(basic_validation["issues"])
        quality_score -= basic_validation["penalty"]
        
        # Validación de coherencia
        coherence_validation = self._validate_coherence(response, original_prompt, context)
        issues.extend(coherence_validation["issues"])
        quality_score -= coherence_validation["penalty"]
        
        # Validación de repetición
        repetition_validation = self._validate_repetition(response)
        issues.extend(repetition_validation["issues"])
        quality_score -= repetition_validation["penalty"]
        
        # Validación de contenido
        content_validation = self._validate_content(response)
        issues.extend(content_validation["issues"])
        quality_score -= content_validation["penalty"]
        
        # Generar sugerencias de mejora
        suggestions = self._generate_suggestions(issues, response)
        
        # Calcular confianza
        confidence = self._calculate_confidence(quality_score, len(issues))
        
        # Determinar si es válida
        is_valid = quality_score >= self.quality_threshold and len(issues) < 5
        
        processing_time = time.time() - start_time
        
        return ValidationResult(
            is_valid=is_valid,
            quality_score=max(0, quality_score),
            issues=issues,
            suggestions=suggestions,
            confidence=confidence,
            processing_time=processing_time
        )
    
    def _validate_basic(self, response: str) -> Dict[str, Any]:
        """Validaciones básicas de la respuesta"""
        issues = []
        penalty = 0
        
        # Verificar longitud
        if len(response) < self.min_length:
            issues.append(f"Respuesta demasiado corta ({len(response)} caracteres)")
            penalty += 20
        
        if len(response) > self.max_length:
            issues.append(f"Respuesta demasiado larga ({len(response)} caracteres)")
            penalty += 15
        
        # Verificar que no esté vacía
        if not response.strip():
            issues.append("Respuesta vacía")
            penalty += 50
        
        # Verificar caracteres especiales excesivos
        special_chars = len(re.findall(r'[^\w\s]', response))
        if special_chars > len(response) * 0.3:
            issues.append("Demasiados caracteres especiales")
            penalty += 10
        
        return {"issues": issues, "penalty": penalty}
    
    def _validate_coherence(self, response: str, prompt: str, context: List[str]) -> Dict[str, Any]:
        """Valida la coherencia de la respuesta"""
        issues = []
        penalty = 0
        
        # Verificar que la respuesta no contradiga el prompt
        if prompt and self._has_contradictions(prompt, response):
            issues.append("La respuesta contradice el prompt original")
            penalty += 25
        
        # Verificar coherencia interna
        if self._has_internal_contradictions(response):
            issues.append("La respuesta contiene contradicciones internas")
            penalty += 20
        
        # Verificar que responda al prompt
        if prompt and not self._responds_to_prompt(prompt, response):
            issues.append("La respuesta no aborda directamente el prompt")
            penalty += 15
        
        return {"issues": issues, "penalty": penalty}
    
    def _validate_repetition(self, response: str) -> Dict[str, Any]:
        """Valida la repetición en la respuesta"""
        issues = []
        penalty = 0
        
        # Verificar palabras repetidas
        words = response.lower().split()
        word_counts = {}
        for word in words:
            if len(word) > 3:  # Ignorar palabras cortas
                word_counts[word] = word_counts.get(word, 0) + 1
        
        for word, count in word_counts.items():
            if count > 3:
                issues.append(f"Palabra '{word}' repetida {count} veces")
                penalty += 5
        
        # Verificar frases repetidas
        sentences = re.split(r'[.!?]+', response)
        for i, sentence1 in enumerate(sentences):
            for j, sentence2 in enumerate(sentences[i+1:], i+1):
                similarity = SequenceMatcher(None, sentence1, sentence2).ratio()
                if similarity > self.repetition_threshold:
                    issues.append("Frases muy similares detectadas")
                    penalty += 10
                    break
        
        return {"issues": issues, "penalty": penalty}
    
    def _validate_content(self, response: str) -> Dict[str, Any]:
        """Valida el contenido de la respuesta"""
        issues = []
        penalty = 0
        
        # Verificar patrones problemáticos
        for problem_type, patterns in self.problem_patterns.items():
            for pattern in patterns:
                if re.search(pattern, response, re.IGNORECASE):
                    issues.append(f"Patrón problemático detectado: {problem_type}")
                    penalty += 8
        
        # Verificar terminaciones abruptas
        if response.strip().endswith(('pero', 'sin embargo', 'no obstante', 'por ejemplo')):
            issues.append("Respuesta termina abruptamente")
            penalty += 12
        
        # Verificar uso de términos vagos
        vague_count = len(re.findall(r'\b(algo|cosas|elementos|aspectos|etcétera|etc\.)\b', response, re.IGNORECASE))
        if vague_count > 2:
            issues.append("Demasiados términos vagos")
            penalty += 8
        
        return {"issues": issues, "penalty": penalty}
    
    def _has_contradictions(self, prompt: str, response: str) -> bool:
        """Verifica si hay contradicciones entre prompt y respuesta"""
        # Implementación simple - se puede mejorar
        prompt_negatives = len(re.findall(r'\b(no|no es|no puede|no debe|imposible|error)\b', prompt, re.IGNORECASE))
        response_positives = len(re.findall(r'\b(sí|es|puede|debe|posible|correcto)\b', response, re.IGNORECASE))
        
        return prompt_negatives > 0 and response_positives > 2
    
    def _has_internal_contradictions(self, response: str) -> bool:
        """Verifica contradicciones internas en la respuesta"""
        # Buscar patrones contradictorios
        patterns = [
            (r'\b(siempre|nunca)\b.*\b(a veces|ocasionalmente)\b', re.IGNORECASE),
            (r'\b(imposible|no se puede)\b.*\b(puede|es posible)\b', re.IGNORECASE),
            (r'\b(error|incorrecto)\b.*\b(correcto|acertado)\b', re.IGNORECASE)
        ]
        
        for pattern, flags in patterns:
            if re.search(pattern, response, flags):
                return True
        
        return False
    
    def _responds_to_prompt(self, prompt: str, response: str) -> bool:
        """Verifica si la respuesta aborda el prompt"""
        # Extraer palabras clave del prompt
        prompt_words = set(re.findall(r'\b\w{4,}\b', prompt.lower()))
        response_words = set(re.findall(r'\b\w{4,}\b', response.lower()))
        
        # Calcular intersección
        common_words = prompt_words.intersection(response_words)
        
        # Si hay al menos 30% de palabras en común, considera que responde
        return len(common_words) >= len(prompt_words) * 0.3
    
    def _generate_suggestions(self, issues: List[str], response: str) -> List[str]:
        """Genera sugerencias de mejora basadas en los problemas detectados"""
        suggestions = []
        
        for issue in issues:
            if "corta" in issue:
                suggestions.append("Considera añadir más detalles y ejemplos")
            elif "larga" in issue:
                suggestions.append("Intenta ser más conciso y directo")
            elif "contradice" in issue:
                suggestions.append("Revisa la coherencia con el prompt original")
            elif "repetida" in issue:
                suggestions.append("Usa sinónimos para evitar repeticiones")
            elif "vaga" in issue:
                suggestions.append("Sé más específico y concreto")
            elif "abruptamente" in issue:
                suggestions.append("Completa las ideas antes de terminar")
            elif "caracteres especiales" in issue:
                suggestions.append("Reduce el uso de caracteres especiales")
        
        # Sugerencias generales de mejora
        if len(response) < 100:
            suggestions.append("Desarrolla más la respuesta con ejemplos")
        
        if not re.search(r'\b(por ejemplo|como|tales como)\b', response, re.IGNORECASE):
            suggestions.append("Considera añadir ejemplos para mayor claridad")
        
        return suggestions
    
    def _calculate_confidence(self, quality_score: float, issue_count: int) -> float:
        """Calcula el nivel de confianza en la validación"""
        # Base de confianza en la calidad
        confidence = quality_score / 100.0
        
        # Reducir confianza por número de problemas
        confidence -= issue_count * 0.1
        
        # Asegurar que esté en el rango [0, 1]
        return max(0.0, min(1.0, confidence))
    
    def improve_response(self, response: str, validation_result: ValidationResult) -> str:
        """Mejora una respuesta basándose en los problemas detectados"""
        improved_response = response
        
        # Aplicar mejoras basadas en los problemas
        for issue in validation_result.issues:
            if "repetida" in issue:
                improved_response = self._fix_repetitions(improved_response)
            elif "vaga" in issue:
                improved_response = self._make_more_specific(improved_response)
            elif "abruptamente" in issue:
                improved_response = self._complete_thoughts(improved_response)
        
        return improved_response
    
    def _fix_repetitions(self, response: str) -> str:
        """Arregla repeticiones en la respuesta"""
        # Implementación básica - se puede mejorar
        words = response.split()
        seen_words = set()
        fixed_words = []
        
        for word in words:
            if word.lower() in seen_words and len(word) > 3:
                # Buscar sinónimo o variación
                synonym = self._find_synonym(word)
                # Si synonym es lista, tomar el primer elemento
                if isinstance(synonym, list):
                    synonym = synonym[0]
                fixed_words.append(str(synonym))
            else:
                fixed_words.append(str(word))
                seen_words.add(word.lower())
        # Asegurar que todos los elementos sean str
        fixed_words = [str(w) if not isinstance(w, str) else w for w in fixed_words]
        return " ".join(fixed_words)
    
    def _find_synonym(self, word: str) -> str:
        """Encuentra un sinónimo para una palabra"""
        # Diccionario simple de sinónimos
        synonyms = {
            "puede": ["puede", "es capaz de", "tiene la capacidad de"],
            "hacer": ["realizar", "ejecutar", "llevar a cabo"],
            "crear": ["desarrollar", "construir", "generar"],
            "usar": ["utilizar", "emplear", "aplicar"],
            "ver": ["observar", "examinar", "revisar"]
        }
        
        return synonyms.get(word.lower(), word)
    
    def _make_more_specific(self, response: str) -> str:
        """Hace la respuesta más específica"""
        # Reemplazar términos vagos
        replacements = {
            "algo": "elementos específicos",
            "cosas": "componentes",
            "elementos": "componentes específicos",
            "aspectos": "características particulares"
        }
        
        for vague, specific in replacements.items():
            response = re.sub(rf'\b{vague}\b', specific, response, flags=re.IGNORECASE)
        
        return response
    
    def _complete_thoughts(self, response: str) -> str:
        """Completa pensamientos incompletos"""
        # Completar frases que terminan abruptamente
        if response.strip().endswith(('pero', 'sin embargo', 'no obstante')):
            response += " es importante considerar todas las opciones."
        elif response.strip().endswith(('por ejemplo', 'como', 'tales como')):
            response += " puedes implementar estas mejoras paso a paso."
        
        return response 