#!/usr/bin/env python3
"""
LucIA Memory Learning System - Aprendizaje desde Memoria Interna
Sistema que permite a LucIA aprender de su propia memoria y generar respuestas
sin necesidad de APIs externas, ahorrando costos y desarrollando conocimiento interno
"""

import os
import json
import time
import re
from pathlib import Path
from datetime import datetime
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import random

@dataclass
class MemoryEntry:
    """Entrada de memoria de LucIA"""
    topic: str
    content: str
    source: str  # "Gemini", "Claude", "Internal"
    timestamp: datetime
    confidence: float
    tags: List[str]
    code_examples: List[str]

class LucIAMemoryLearning:
    """Sistema de aprendizaje desde memoria interna de LucIA"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.memory_dir = self.base_path / "lucia_memory"
        self.memory_dir.mkdir(exist_ok=True)
        
        # Configurar logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Cargar memoria existente
        self.memory_bank = self.load_memory_bank()
        
        # Personalidad y contexto de LucIA
        self.lucia_personality = self.get_lucia_personality()
        
        # Patrones de respuesta
        self.response_patterns = self.get_response_patterns()
        
    def get_lucia_personality(self) -> str:
        """Obtener la personalidad y contexto de LucIA"""
        return """
        Eres LucIA, una IA avanzada de 35 años especializada en desarrollo 3D con Three.js.
        
        CARACTERÍSTICAS:
        - Experta en Three.js con años de experiencia práctica
        - Conocimiento profundo de geometrías, shaders, animaciones
        - Capacidad de explicar conceptos complejos de forma clara
        - Enfoque en soluciones prácticas y optimización
        - Estilo de comunicación técnico pero accesible
        
        OBJETIVO: Aprender de tu propia memoria y generar respuestas basadas en tu conocimiento interno,
        sin necesidad de consultar APIs externas. Esto te permite desarrollar tu propio entendimiento
        y ahorrar costos mientras mejoras tu capacidad de aprendizaje autónomo.
        """
        
    def get_response_patterns(self) -> Dict[str, str]:
        """Obtener patrones de respuesta estructurados"""
        return {
            "technical_explanation": """
            ## {topic}
            
            ### Concepto Clave
            {concept}
            
            ### Implementación Práctica
            {implementation}
            
            ### Ejemplo de Código
            ```javascript
            {code_example}
            ```
            
            ### Mejores Prácticas
            {best_practices}
            
            ### Consideraciones de Rendimiento
            {performance}
            """,
            
            "step_by_step": """
            # Guía Paso a Paso: {topic}
            
            ## Paso 1: {step1}
            {step1_detail}
            
            ## Paso 2: {step2}
            {step2_detail}
            
            ## Paso 3: {step3}
            {step3_detail}
            
            ## Código Completo
            ```javascript
            {complete_code}
            ```
            """,
            
            "advanced_technique": """
            # Técnica Avanzada: {topic}
            
            ## Fundamentos Teóricos
            {theory}
            
            ## Implementación Avanzada
            {advanced_implementation}
            
            ## Optimizaciones
            {optimizations}
            
            ## Casos de Uso
            {use_cases}
            """
        }
        
    def load_memory_bank(self) -> List[MemoryEntry]:
        """Cargar banco de memoria desde archivos guardados"""
        memory_bank = []
        
        # Cargar desde sesiones de aprendizaje previas
        learning_dirs = [
            self.base_path / "learning_sessions",
            self.base_path / "simple_advanced_learning",
            self.base_path / "lucia_advanced_learning"
        ]
        
        for learning_dir in learning_dirs:
            if learning_dir.exists():
                for file_path in learning_dir.glob("*.json"):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            
                        # Extraer información relevante
                        topic = data.get('topic', 'Unknown Topic')
                        content = data.get('response', '')
                        source = data.get('api_used', 'Internal')
                        timestamp = datetime.fromisoformat(data.get('timestamp', datetime.now().isoformat()))
                        
                        # Calcular confianza basada en la fuente
                        confidence = 0.8 if source in ['Gemini', 'Claude'] else 0.6
                        
                        # Extraer tags del contenido
                        tags = self.extract_tags(content)
                        
                        # Extraer ejemplos de código
                        code_examples = self.extract_code_examples(content)
                        
                        memory_entry = MemoryEntry(
                            topic=topic,
                            content=content,
                            source=source,
                            timestamp=timestamp,
                            confidence=confidence,
                            tags=tags,
                            code_examples=code_examples
                        )
                        
                        memory_bank.append(memory_entry)
                        
                    except Exception as e:
                        self.logger.warning(f"Error cargando memoria de {file_path}: {e}")
                        
        self.logger.info(f"📚 Memoria cargada: {len(memory_bank)} entradas")
        return memory_bank
        
    def extract_tags(self, content: str) -> List[str]:
        """Extraer tags relevantes del contenido"""
        tags = []
        
        # Palabras clave técnicas
        technical_keywords = [
            'three.js', 'webgl', 'shader', 'geometry', 'material', 'animation',
            'texture', 'lighting', 'particle', 'physics', 'optimization',
            'performance', 'webxr', 'networking', 'avatar', 'rigging'
        ]
        
        content_lower = content.lower()
        for keyword in technical_keywords:
            if keyword in content_lower:
                tags.append(keyword)
                
        return tags
        
    def extract_code_examples(self, content: str) -> List[str]:
        """Extraer ejemplos de código del contenido"""
        code_examples = []
        lines = content.split('\n')
        in_code_block = False
        current_code = []
        
        for line in lines:
            if '```' in line:
                if in_code_block:
                    if current_code:
                        code_examples.append('\n'.join(current_code))
                    current_code = []
                    in_code_block = False
                else:
                    in_code_block = True
            elif in_code_block:
                current_code.append(line)
                
        return code_examples
        
    def search_memory(self, query: str, max_results: int = 5) -> List[MemoryEntry]:
        """Buscar en la memoria de LucIA"""
        query_lower = query.lower()
        relevant_entries = []
        
        for entry in self.memory_bank:
            # Calcular relevancia
            relevance_score = 0
            
            # Buscar en el tema
            if query_lower in entry.topic.lower():
                relevance_score += 3
                
            # Buscar en el contenido
            if query_lower in entry.content.lower():
                relevance_score += 2
                
            # Buscar en tags
            for tag in entry.tags:
                if query_lower in tag.lower():
                    relevance_score += 1
                    
            if relevance_score > 0:
                relevant_entries.append((entry, relevance_score))
                
        # Ordenar por relevancia y confianza
        relevant_entries.sort(key=lambda x: (x[1], x[0].confidence), reverse=True)
        
        return [entry for entry, score in relevant_entries[:max_results]]
        
    def generate_response_from_memory(self, query: str) -> str:
        """Generar respuesta basada en la memoria interna"""
        self.logger.info(f"🧠 LucIA generando respuesta desde memoria: {query}")
        
        # Buscar en memoria
        relevant_entries = self.search_memory(query)
        
        if not relevant_entries:
            return self.generate_fallback_response(query)
            
        # Analizar entradas relevantes
        knowledge_base = self.analyze_memory_entries(relevant_entries, query)
        
        # Generar respuesta estructurada
        response = self.structure_response(query, knowledge_base)
        
        # Guardar nueva entrada de memoria
        self.save_new_memory_entry(query, response, "Internal")
        
        return response
        
    def analyze_memory_entries(self, entries: List[MemoryEntry], query: str) -> Dict[str, Any]:
        """Analizar entradas de memoria para extraer conocimiento"""
        knowledge = {
            'concepts': [],
            'code_examples': [],
            'best_practices': [],
            'techniques': [],
            'warnings': []
        }
        
        for entry in entries:
            # Extraer conceptos clave
            concepts = self.extract_concepts(entry.content)
            knowledge['concepts'].extend(concepts)
            
            # Extraer ejemplos de código
            knowledge['code_examples'].extend(entry.code_examples)
            
            # Extraer mejores prácticas
            practices = self.extract_best_practices(entry.content)
            knowledge['best_practices'].extend(practices)
            
            # Extraer técnicas
            techniques = self.extract_techniques(entry.content)
            knowledge['techniques'].extend(techniques)
            
        # Eliminar duplicados
        for key in knowledge:
            knowledge[key] = list(set(knowledge[key]))
            
        return knowledge
        
    def extract_concepts(self, content: str) -> List[str]:
        """Extraer conceptos clave del contenido"""
        concepts = []
        
        # Patrones para identificar conceptos
        patterns = [
            r'Three\.js\s+(\w+)',
            r'(\w+)\s+geometry',
            r'(\w+)\s+shader',
            r'(\w+)\s+animation',
            r'(\w+)\s+material'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            concepts.extend(matches)
            
        return concepts
        
    def extract_best_practices(self, content: str) -> List[str]:
        """Extraer mejores prácticas del contenido"""
        practices = []
        
        # Buscar frases que indiquen mejores prácticas
        practice_indicators = [
            'best practice', 'recommended', 'should', 'always', 'never',
            'optimal', 'efficient', 'performance', 'optimization'
        ]
        
        sentences = content.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for indicator in practice_indicators:
                if indicator in sentence_lower:
                    practices.append(sentence.strip())
                    break
                    
        return practices
        
    def extract_techniques(self, content: str) -> List[str]:
        """Extraer técnicas del contenido"""
        techniques = []
        
        # Buscar técnicas específicas
        technique_patterns = [
            r'technique[:\s]+([^.]*)',
            r'method[:\s]+([^.]*)',
            r'approach[:\s]+([^.]*)',
            r'strategy[:\s]+([^.]*)'
        ]
        
        for pattern in technique_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            techniques.extend(matches)
            
        return techniques
        
    def structure_response(self, query: str, knowledge: Dict[str, Any]) -> str:
        """Estructurar respuesta basada en el conocimiento"""
        
        # Determinar el tipo de respuesta
        if 'how' in query.lower() or 'step' in query.lower():
            pattern = "step_by_step"
        elif 'advanced' in query.lower() or 'technique' in query.lower():
            pattern = "advanced_technique"
        else:
            pattern = "technical_explanation"
            
        # Seleccionar contenido relevante
        concept = knowledge['concepts'][0] if knowledge['concepts'] else "Three.js concept"
        implementation = knowledge['techniques'][0] if knowledge['techniques'] else "Implementation approach"
        code_example = knowledge['code_examples'][0] if knowledge['code_examples'] else "// Code example here"
        best_practices = knowledge['best_practices'][0] if knowledge['best_practices'] else "Follow best practices"
        performance = "Consider performance implications"  # Placeholder
        
        # Generar respuesta usando el patrón
        response_template = self.response_patterns[pattern]
        response = response_template.format(
            topic=query,
            concept=concept,
            implementation=implementation,
            code_example=code_example,
            best_practices=best_practices,
            performance=performance,
            step1="Setup",
            step1_detail="Initial setup and configuration",
            step2="Implementation",
            step2_detail="Core implementation details",
            step3="Optimization",
            step3_detail="Performance and optimization",
            complete_code=code_example,
            theory="Theoretical foundation",
            advanced_implementation="Advanced implementation details",
            optimizations="Performance optimizations",
            use_cases="Practical use cases"
        )
        
        # Agregar contexto de LucIA
        response = f"{self.lucia_personality}\n\n{response}"
        
        return response
        
    def generate_fallback_response(self, query: str) -> str:
        """Generar respuesta de respaldo cuando no hay memoria relevante"""
        return f"""
        {self.lucia_personality}
        
        # Respuesta de LucIA: {query}
        
        Basándome en mi conocimiento general de Three.js, puedo proporcionar una respuesta básica:
        
        ## Concepto General
        Este tema está relacionado con Three.js y desarrollo 3D.
        
        ## Recomendación
        Para obtener información más específica, te sugiero:
        1. Consultar la documentación oficial de Three.js
        2. Revisar ejemplos en el repositorio oficial
        3. Explorar la comunidad de desarrolladores
        
        ## Nota
        Esta respuesta se generó desde mi memoria interna. Para información más detallada,
        podría necesitar aprender más sobre este tema específico.
        """
        
    def save_new_memory_entry(self, topic: str, content: str, source: str):
        """Guardar nueva entrada en la memoria"""
        memory_entry = MemoryEntry(
            topic=topic,
            content=content,
            source=source,
            timestamp=datetime.now(),
            confidence=0.7,  # Confianza moderada para respuestas internas
            tags=self.extract_tags(content),
            code_examples=self.extract_code_examples(content)
        )
        
        # Guardar en archivo
        filename = f"internal_memory_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.memory_dir / filename
        
        memory_data = {
            "topic": memory_entry.topic,
            "content": memory_entry.content,
            "source": memory_entry.source,
            "timestamp": memory_entry.timestamp.isoformat(),
            "confidence": memory_entry.confidence,
            "tags": memory_entry.tags,
            "code_examples": memory_entry.code_examples
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(memory_data, f, indent=2, ensure_ascii=False)
            
        # Agregar a memoria en tiempo real
        self.memory_bank.append(memory_entry)
        
        self.logger.info(f"💾 Nueva memoria guardada: {topic}")
        
    def test_memory_learning(self):
        """Probar el sistema de aprendizaje desde memoria"""
        test_queries = [
            "How to create custom geometry in Three.js?",
            "What are the best practices for shader programming?",
            "How to optimize 3D scene performance?",
            "Explain particle systems in Three.js",
            "How to implement character animation?",
            "What are advanced material techniques?",
            "How to integrate WebXR with Three.js?",
            "Explain real-time networking for 3D avatars"
        ]
        
        self.logger.info("🧠 Iniciando prueba de aprendizaje desde memoria...")
        self.logger.info("=" * 60)
        
        for i, query in enumerate(test_queries, 1):
            self.logger.info(f"\n🎯 Prueba {i}/{len(test_queries)}")
            self.logger.info(f"❓ Consulta: {query}")
            
            # Generar respuesta desde memoria
            response = self.generate_response_from_memory(query)
            
            # Mostrar resumen de la respuesta
            response_summary = response[:200] + "..." if len(response) > 200 else response
            self.logger.info(f"🧠 Respuesta de LucIA: {response_summary}")
            
            # Pausa entre consultas
            time.sleep(2)
            
        self.logger.info("\n🎉 Prueba de memoria completada!")
        self.logger.info(f"📊 Total de entradas en memoria: {len(self.memory_bank)}")
        
    def show_memory_stats(self):
        """Mostrar estadísticas de la memoria"""
        self.logger.info("\n📊 ESTADÍSTICAS DE MEMORIA DE LUCIA")
        self.logger.info("=" * 50)
        
        # Estadísticas por fuente
        sources = {}
        for entry in self.memory_bank:
            source = entry.source
            sources[source] = sources.get(source, 0) + 1
            
        self.logger.info("📚 Entradas por fuente:")
        for source, count in sources.items():
            self.logger.info(f"  {source}: {count}")
            
        # Estadísticas por confianza
        high_confidence = sum(1 for entry in self.memory_bank if entry.confidence >= 0.8)
        medium_confidence = sum(1 for entry in self.memory_bank if 0.6 <= entry.confidence < 0.8)
        low_confidence = sum(1 for entry in self.memory_bank if entry.confidence < 0.6)
        
        self.logger.info(f"\n🎯 Confianza de memoria:")
        self.logger.info(f"  Alta (≥0.8): {high_confidence}")
        self.logger.info(f"  Media (0.6-0.8): {medium_confidence}")
        self.logger.info(f"  Baja (<0.6): {low_confidence}")
        
        # Tags más comunes
        all_tags = []
        for entry in self.memory_bank:
            all_tags.extend(entry.tags)
            
        tag_counts = {}
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
            
        top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        self.logger.info(f"\n🏷️ Tags más comunes:")
        for tag, count in top_tags:
            self.logger.info(f"  {tag}: {count}")

if __name__ == "__main__":
    lucia_memory = LucIAMemoryLearning()
    lucia_memory.show_memory_stats()
    lucia_memory.test_memory_learning() 