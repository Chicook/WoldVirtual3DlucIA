"""
Lucía Code Learner
Sistema que permite a Lucía aprender y almacenar código automáticamente
"""

import re
import asyncio
from typing import List, Dict, Optional
from pathlib import Path

# Importar el sistema de almacenamiento
from code_storage_system import CodeStorageManager, CodeCategory, CodeLanguage

class LucíaCodeLearner:
    """Sistema de aprendizaje de código para Lucía"""
    
    def __init__(self):
        self.code_manager = CodeStorageManager()
        self.extraction_patterns = {
            'javascript': [
                r'```javascript\s*(.*?)\s*```',
                r'```js\s*(.*?)\s*```',
                r'```typescript\s*(.*?)\s*```',
                r'```ts\s*(.*?)\s*```'
            ],
            'python': [
                r'```python\s*(.*?)\s*```',
                r'```py\s*(.*?)\s*```'
            ],
            'solidity': [
                r'```solidity\s*(.*?)\s*```',
                r'```sol\s*(.*?)\s*```'
            ],
            'html': [
                r'```html\s*(.*?)\s*```'
            ],
            'css': [
                r'```css\s*(.*?)\s*```'
            ],
            'glsl': [
                r'```glsl\s*(.*?)\s*```'
            ]
        }
        
        # Mapeo de lenguajes
        self.language_mapping = {
            'javascript': CodeLanguage.JAVASCRIPT,
            'js': CodeLanguage.JAVASCRIPT,
            'typescript': CodeLanguage.TYPESCRIPT,
            'ts': CodeLanguage.TYPESCRIPT,
            'python': CodeLanguage.PYTHON,
            'py': CodeLanguage.PYTHON,
            'solidity': CodeLanguage.SOLIDITY,
            'sol': CodeLanguage.SOLIDITY,
            'html': CodeLanguage.HTML,
            'css': CodeLanguage.CSS,
            'glsl': CodeLanguage.GLSL
        }
        
        # Categorías por palabras clave
        self.category_keywords = {
            CodeCategory.THREEJS_BASICS: ['three.js', 'threejs', 'scene', 'camera', 'renderer', 'geometry', 'material'],
            CodeCategory.THREEJS_AVATAR: ['avatar', 'character', 'model', 'mesh', 'skeleton', 'rigging'],
            CodeCategory.THREEJS_ANIMATION: ['animation', 'animate', 'keyframe', 'tween', 'motion'],
            CodeCategory.THREEJS_ENVIRONMENT: ['environment', 'lighting', 'texture', 'skybox', 'terrain'],
            CodeCategory.WEB3_INTEGRATION: ['web3', 'ethereum', 'wallet', 'metamask', 'blockchain'],
            CodeCategory.BLOCKCHAIN: ['blockchain', 'smart contract', 'solidity', 'nft', 'token'],
            CodeCategory.NFT_SYSTEM: ['nft', 'non-fungible', 'token', 'mint', 'metadata'],
            CodeCategory.SMART_CONTRACTS: ['contract', 'solidity', 'function', 'mapping', 'event'],
            CodeCategory.UI_COMPONENTS: ['ui', 'interface', 'component', 'react', 'vue'],
            CodeCategory.UTILITIES: ['utility', 'helper', 'function', 'tool'],
            CodeCategory.LEARNING_EXAMPLES: ['example', 'tutorial', 'learning', 'basic'],
            CodeCategory.METAVERSE_CORE: ['metaverse', 'virtual world', '3d world', 'environment']
        }
    
    def extract_code_from_response(self, response: str) -> List[Dict]:
        """Extrae código de una respuesta de Gemini"""
        extracted_code = []
        
        for language, patterns in self.extraction_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, response, re.DOTALL | re.IGNORECASE)
                for match in matches:
                    if match.strip():
                        extracted_code.append({
                            'language': language,
                            'code': match.strip(),
                            'pattern_used': pattern
                        })
        
        return extracted_code
    
    def determine_category(self, context: str, code: str) -> CodeCategory:
        """Determina la categoría basándose en el contexto y el código"""
        context_lower = context.lower()
        code_lower = code.lower()
        combined_text = f"{context_lower} {code_lower}"
        
        # Contar coincidencias por categoría
        category_scores = {}
        
        for category, keywords in self.category_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword.lower() in combined_text:
                    score += 1
            if score > 0:
                category_scores[category] = score
        
        # Retornar la categoría con mayor puntuación
        if category_scores:
            return max(category_scores.items(), key=lambda x: x[1])[0]
        
        # Categoría por defecto
        return CodeCategory.UTILITIES
    
    def generate_title(self, context: str, code: str, category: CodeCategory) -> str:
        """Genera un título descriptivo para el código"""
        # Buscar palabras clave en el contexto
        lines = code.split('\n')
        first_line = lines[0].strip()
        
        # Si la primera línea es un comentario, usarla
        if first_line.startswith('//') or first_line.startswith('/*'):
            title = first_line.replace('//', '').replace('/*', '').replace('*/', '').strip()
            if title:
                return title
        
        # Buscar palabras clave en el contexto
        context_words = context.split()
        relevant_words = []
        
        for word in context_words:
            if len(word) > 3 and word.isalpha():
                relevant_words.append(word)
        
        if relevant_words:
            title = f"{' '.join(relevant_words[:3])} - {category.value.replace('_', ' ').title()}"
        else:
            title = f"Code Snippet - {category.value.replace('_', ' ').title()}"
        
        return title
    
    def generate_description(self, context: str, code: str) -> str:
        """Genera una descripción para el código"""
        # Extraer información del contexto
        lines = context.split('\n')
        description_lines = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('```') and len(line) > 10:
                description_lines.append(line)
                if len(description_lines) >= 3:
                    break
        
        if description_lines:
            description = ' '.join(description_lines)
            if len(description) > 200:
                description = description[:200] + "..."
        else:
            description = "Código extraído de conversación con Lucía"
        
        return description
    
    def extract_tags(self, context: str, code: str, category: CodeCategory) -> List[str]:
        """Extrae tags relevantes del contexto y código"""
        tags = []
        
        # Tags basados en la categoría
        tags.append(category.value)
        
        # Buscar palabras clave en el contexto
        context_lower = context.lower()
        code_lower = code.lower()
        
        # Palabras clave comunes
        common_keywords = [
            'three.js', 'threejs', 'avatar', 'animation', 'model', 'scene',
            'camera', 'lighting', 'texture', 'geometry', 'material', 'mesh',
            'web3', 'blockchain', 'nft', 'smart contract', 'solidity',
            'javascript', 'typescript', 'python', 'html', 'css', 'glsl'
        ]
        
        for keyword in common_keywords:
            if keyword in context_lower or keyword in code_lower:
                tags.append(keyword)
        
        # Buscar nombres de funciones o clases
        function_pattern = r'\b(function|class|const|let|var)\s+(\w+)'
        functions = re.findall(function_pattern, code)
        for _, func_name in functions:
            if func_name not in tags:
                tags.append(func_name)
        
        return list(set(tags))  # Eliminar duplicados
    
    def extract_dependencies(self, code: str, language: str) -> List[str]:
        """Extrae dependencias del código"""
        dependencies = []
        
        if language in ['javascript', 'typescript']:
            # Buscar imports
            import_patterns = [
                r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]',
                r'require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)',
                r'import\s+[\'"]([^\'"]+)[\'"]'
            ]
            
            for pattern in import_patterns:
                matches = re.findall(pattern, code)
                dependencies.extend(matches)
        
        elif language == 'python':
            # Buscar imports de Python
            import_patterns = [
                r'import\s+(\w+)',
                r'from\s+(\w+)\s+import',
                r'import\s+(\w+)\s+as'
            ]
            
            for pattern in import_patterns:
                matches = re.findall(pattern, code)
                dependencies.extend(matches)
        
        return list(set(dependencies))
    
    def learn_from_response(self, response: str, context: str = "") -> List[str]:
        """Aprende y almacena código de una respuesta de Gemini"""
        print("🧠 Lucía está aprendiendo código...")
        
        # Extraer código de la respuesta
        extracted_code = self.extract_code_from_response(response)
        
        stored_ids = []
        
        for code_item in extracted_code:
            try:
                language = code_item['language']
                code = code_item['code']
                
                # Determinar categoría
                category = self.determine_category(context, code)
                
                # Generar título y descripción
                title = self.generate_title(context, code, category)
                description = self.generate_description(context, code)
                
                # Extraer tags y dependencias
                tags = self.extract_tags(context, code, category)
                dependencies = self.extract_dependencies(code, language)
                
                # Mapear lenguaje
                code_language = self.language_mapping.get(language, CodeLanguage.JAVASCRIPT)
                
                # Almacenar código
                snippet_id = self.code_manager.store_code(
                    title=title,
                    description=description,
                    category=category,
                    language=code_language,
                    code=code,
                    tags=tags,
                    dependencies=dependencies,
                    difficulty_level="intermediate"
                )
                
                stored_ids.append(snippet_id)
                print(f"   ✅ Aprendido: {title}")
                
            except Exception as e:
                print(f"   ❌ Error procesando código: {e}")
        
        return stored_ids
    
    def search_learned_code(self, query: str = "", category: Optional[CodeCategory] = None) -> List:
        """Busca en el código aprendido"""
        results = self.code_manager.search_code(query=query, category=category)
        return results
    
    def get_learning_statistics(self) -> Dict:
        """Obtiene estadísticas del aprendizaje"""
        stats = self.code_manager.get_statistics()
        
        # Añadir información específica del aprendizaje
        learning_stats = {
            'total_learned_snippets': stats['total_snippets'],
            'categories_learned': len(stats['categories']),
            'languages_learned': len(stats['languages']),
            'most_common_category': max(stats['categories'].items(), key=lambda x: x[1])[0] if stats['categories'] else None,
            'most_common_language': max(stats['languages'].items(), key=lambda x: x[1])[0] if stats['languages'] else None,
            'verified_code': stats['verified_snippets'],
            'average_test_coverage': stats['average_test_coverage']
        }
        
        return learning_stats
    
    def export_learning_report(self, format: str = "markdown") -> str:
        """Exporta un reporte del aprendizaje"""
        stats = self.get_learning_statistics()
        code_snippets = list(self.code_manager.code_snippets.values())
        
        if format == "markdown":
            report = "# 📚 Reporte de Aprendizaje de Código - Lucía\n\n"
            report += f"## 📊 Estadísticas Generales\n\n"
            report += f"- **Total de fragmentos aprendidos:** {stats['total_learned_snippets']}\n"
            report += f"- **Categorías exploradas:** {stats['categories_learned']}\n"
            report += f"- **Lenguajes aprendidos:** {stats['languages_learned']}\n"
            report += f"- **Categoría más común:** {stats['most_common_category']}\n"
            report += f"- **Lenguaje más común:** {stats['most_common_language']}\n"
            report += f"- **Código verificado:** {stats['verified_code']}\n"
            report += f"- **Cobertura de tests promedio:** {stats['average_test_coverage']:.1f}%\n\n"
            
            report += "## 📁 Código por Categoría\n\n"
            for snippet in code_snippets:
                report += f"### {snippet.title}\n"
                report += f"- **Categoría:** {snippet.category.value}\n"
                report += f"- **Lenguaje:** {snippet.language.value}\n"
                report += f"- **Tags:** {', '.join(snippet.tags)}\n"
                report += f"- **Descripción:** {snippet.description}\n\n"
        
        return report

# Instancia global
lucia_learner = LucíaCodeLearner()

def main():
    """Función de prueba del sistema de aprendizaje"""
    print("🧠 SISTEMA DE APRENDIZAJE DE CÓDIGO DE LUCÍA")
    print("=" * 50)
    
    # Ejemplo de respuesta de Gemini
    example_response = """
    Aquí tienes un ejemplo de cómo crear un avatar básico en Three.js:
    
    ```javascript
    // Crear geometría del avatar
    const avatarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const avatarMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    
    // Añadir a la escena
    scene.add(avatar);
    
    // Función de animación
    function animateAvatar() {
        avatar.rotation.y += 0.01;
        requestAnimationFrame(animateAvatar);
    }
    animateAvatar();
    ```
    
    También puedes crear un entorno básico:
    
    ```javascript
    // Crear suelo
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    ```
    """
    
    # Aprender del ejemplo
    stored_ids = lucia_learner.learn_from_response(example_response, "Creación de avatar 3D en Three.js")
    
    print(f"\n📚 Fragmentos almacenados: {len(stored_ids)}")
    
    # Mostrar estadísticas
    stats = lucia_learner.get_learning_statistics()
    print(f"\n📊 Estadísticas de aprendizaje:")
    print(f"   Total aprendido: {stats['total_learned_snippets']}")
    print(f"   Categorías: {stats['categories_learned']}")
    print(f"   Lenguajes: {stats['languages_learned']}")

if __name__ == "__main__":
    main() 