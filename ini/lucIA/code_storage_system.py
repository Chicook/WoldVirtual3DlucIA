"""
Sistema de Almacenamiento de Código para Lucía
Permite a Lucía almacenar, organizar y recuperar código en formato adecuado
"""

import os
import json
import hashlib
import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

class CodeCategory(Enum):
    """Categorías de código para organizar el almacenamiento"""
    THREEJS_BASICS = "threejs_basics"
    THREEJS_AVATAR = "threejs_avatar"
    THREEJS_ANIMATION = "threejs_animation"
    THREEJS_ENVIRONMENT = "threejs_environment"
    WEB3_INTEGRATION = "web3_integration"
    BLOCKCHAIN = "blockchain"
    NFT_SYSTEM = "nft_system"
    SMART_CONTRACTS = "smart_contracts"
    UI_COMPONENTS = "ui_components"
    UTILITIES = "utilities"
    LEARNING_EXAMPLES = "learning_examples"
    METAVERSE_CORE = "metaverse_core"

class CodeLanguage(Enum):
    """Lenguajes de programación soportados"""
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    PYTHON = "python"
    SOLIDITY = "solidity"
    HTML = "html"
    CSS = "css"
    GLSL = "glsl"
    JSON = "json"
    YAML = "yaml"

@dataclass
class CodeSnippet:
    """Estructura para almacenar un fragmento de código"""
    id: str
    title: str
    description: str
    category: CodeCategory
    language: CodeLanguage
    code: str
    tags: List[str]
    author: str = "Lucía"
    created_at: str = ""
    updated_at: str = ""
    version: str = "1.0.0"
    dependencies: List[str] = None
    usage_examples: List[str] = None
    performance_notes: str = ""
    difficulty_level: str = "intermediate"
    is_verified: bool = False
    test_coverage: float = 0.0
    
    def __post_init__(self):
        if self.created_at == "":
            self.created_at = datetime.datetime.now().isoformat()
        if self.updated_at == "":
            self.updated_at = self.created_at
        if self.dependencies is None:
            self.dependencies = []
        if self.usage_examples is None:
            self.usage_examples = []

class CodeStorageManager:
    """Gestor principal del sistema de almacenamiento de código"""
    
    def __init__(self, storage_path: Optional[str] = None):
        self.storage_path = Path(storage_path) if storage_path else Path(__file__).parent / "code_storage"
        self.storage_path.mkdir(exist_ok=True)
        
        # Subdirectorios por categoría
        for category in CodeCategory:
            category_path = self.storage_path / category.value
            category_path.mkdir(exist_ok=True)
        
        # Archivo de índice
        self.index_file = self.storage_path / "code_index.json"
        self.code_snippets: Dict[str, CodeSnippet] = {}
        self._load_index()
    
    def _load_index(self):
        """Carga el índice de código almacenado"""
        if self.index_file.exists():
            try:
                with open(self.index_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                for snippet_data in data.get('snippets', []):
                    snippet = CodeSnippet(
                        id=snippet_data['id'],
                        title=snippet_data['title'],
                        description=snippet_data['description'],
                        category=CodeCategory(snippet_data['category']),
                        language=CodeLanguage(snippet_data['language']),
                        code=snippet_data['code'],
                        tags=snippet_data['tags'],
                        author=snippet_data.get('author', 'Lucía'),
                        created_at=snippet_data.get('created_at', ''),
                        updated_at=snippet_data.get('updated_at', ''),
                        version=snippet_data.get('version', '1.0.0'),
                        dependencies=snippet_data.get('dependencies', []),
                        usage_examples=snippet_data.get('usage_examples', []),
                        performance_notes=snippet_data.get('performance_notes', ''),
                        difficulty_level=snippet_data.get('difficulty_level', 'intermediate'),
                        is_verified=snippet_data.get('is_verified', False),
                        test_coverage=snippet_data.get('test_coverage', 0.0)
                    )
                    self.code_snippets[snippet.id] = snippet
                    
                print(f"✅ Índice cargado: {len(self.code_snippets)} fragmentos de código")
                
            except Exception as e:
                print(f"❌ Error cargando índice: {e}")
    
    def _save_index(self):
        """Guarda el índice de código"""
        try:
            data = {
                'metadata': {
                    'total_snippets': len(self.code_snippets),
                    'last_updated': datetime.datetime.now().isoformat(),
                    'version': '1.0.0'
                },
                'snippets': []
            }
            
            # Convertir snippets a diccionarios serializables
            for snippet in self.code_snippets.values():
                snippet_dict = asdict(snippet)
                # Convertir enums a strings para serialización JSON
                snippet_dict['category'] = snippet.category.value
                snippet_dict['language'] = snippet.language.value
                data['snippets'].append(snippet_dict)
            
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"❌ Error guardando índice: {e}")
    
    def _generate_id(self, title: str, category: CodeCategory) -> str:
        """Genera un ID único para un fragmento de código"""
        base = f"{category.value}_{title.lower().replace(' ', '_')}"
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{base}_{timestamp}"
    
    def store_code(self, 
                   title: str,
                   description: str,
                   category: CodeCategory,
                   language: CodeLanguage,
                   code: str,
                   tags: List[str] = None,
                   dependencies: List[str] = None,
                   usage_examples: List[str] = None,
                   performance_notes: str = "",
                   difficulty_level: str = "intermediate") -> str:
        """Almacena un nuevo fragmento de código"""
        
        # Generar ID único
        snippet_id = self._generate_id(title, category)
        
        # Crear fragmento de código
        snippet = CodeSnippet(
            id=snippet_id,
            title=title,
            description=description,
            category=category,
            language=language,
            code=code,
            tags=tags or [],
            dependencies=dependencies or [],
            usage_examples=usage_examples or [],
            performance_notes=performance_notes,
            difficulty_level=difficulty_level
        )
        
        # Guardar en memoria
        self.code_snippets[snippet_id] = snippet
        
        # Guardar archivo individual
        self._save_snippet_file(snippet)
        
        # Actualizar índice
        self._save_index()
        
        print(f"✅ Código almacenado: {snippet_id}")
        print(f"   📁 Categoría: {category.value}")
        print(f"   🔤 Lenguaje: {language.value}")
        print(f"   📝 Título: {title}")
        
        return snippet_id
    
    def _save_snippet_file(self, snippet: CodeSnippet):
        """Guarda un fragmento de código en archivo individual"""
        try:
            # Crear archivo con extensión apropiada
            extensions = {
                CodeLanguage.JAVASCRIPT: ".js",
                CodeLanguage.TYPESCRIPT: ".ts",
                CodeLanguage.PYTHON: ".py",
                CodeLanguage.SOLIDITY: ".sol",
                CodeLanguage.HTML: ".html",
                CodeLanguage.CSS: ".css",
                CodeLanguage.GLSL: ".glsl",
                CodeLanguage.JSON: ".json",
                CodeLanguage.YAML: ".yml"
            }
            
            ext = extensions.get(snippet.language, ".txt")
            filename = f"{snippet.id}{ext}"
            filepath = self.storage_path / snippet.category.value / filename
            
            # Crear contenido del archivo
            content = f"""/*
 * {snippet.title}
 * {snippet.description}
 * 
 * ID: {snippet.id}
 * Categoría: {snippet.category.value}
 * Lenguaje: {snippet.language.value}
 * Autor: {snippet.author}
 * Versión: {snippet.version}
 * Creado: {snippet.created_at}
 * Actualizado: {snippet.updated_at}
 * 
 * Tags: {', '.join(snippet.tags)}
 * Dependencias: {', '.join(snippet.dependencies)}
 * Nivel: {snippet.difficulty_level}
 * Verificado: {'Sí' if snippet.is_verified else 'No'}
 * Cobertura de tests: {snippet.test_coverage}%
 */

"""
            
            if snippet.performance_notes:
                content += f"/*\n * Notas de rendimiento:\n * {snippet.performance_notes}\n */\n\n"
            
            if snippet.usage_examples:
                content += "/*\n * Ejemplos de uso:\n"
                for i, example in enumerate(snippet.usage_examples, 1):
                    content += f" * {i}. {example}\n"
                content += " */\n\n"
            
            content += snippet.code
            
            # Guardar archivo
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
                
        except Exception as e:
            print(f"❌ Error guardando archivo: {e}")
    
    def get_code(self, snippet_id: str) -> Optional[CodeSnippet]:
        """Recupera un fragmento de código por ID"""
        return self.code_snippets.get(snippet_id)
    
    def search_code(self, 
                   query: str = "",
                   category: Optional[CodeCategory] = None,
                   language: Optional[CodeLanguage] = None,
                   tags: List[str] = None,
                   difficulty_level: str = None) -> List[CodeSnippet]:
        """Busca fragmentos de código según criterios"""
        results = []
        
        for snippet in self.code_snippets.values():
            # Filtro por categoría
            if category and snippet.category != category:
                continue
                
            # Filtro por lenguaje
            if language and snippet.language != language:
                continue
                
            # Filtro por nivel de dificultad
            if difficulty_level and snippet.difficulty_level != difficulty_level:
                continue
                
            # Filtro por tags
            if tags:
                if not any(tag.lower() in [t.lower() for t in snippet.tags] for tag in tags):
                    continue
            
            # Búsqueda por texto
            if query:
                query_lower = query.lower()
                if (query_lower in snippet.title.lower() or
                    query_lower in snippet.description.lower() or
                    query_lower in snippet.code.lower() or
                    any(query_lower in tag.lower() for tag in snippet.tags)):
                    results.append(snippet)
            else:
                results.append(snippet)
        
        return results
    
    def update_code(self, snippet_id: str, **kwargs) -> bool:
        """Actualiza un fragmento de código existente"""
        if snippet_id not in self.code_snippets:
            print(f"❌ Fragmento no encontrado: {snippet_id}")
            return False
        
        snippet = self.code_snippets[snippet_id]
        
        # Actualizar campos permitidos
        allowed_fields = ['title', 'description', 'code', 'tags', 'dependencies', 
                         'usage_examples', 'performance_notes', 'difficulty_level', 
                         'version', 'is_verified', 'test_coverage']
        
        for field, value in kwargs.items():
            if field in allowed_fields and hasattr(snippet, field):
                setattr(snippet, field, value)
        
        # Actualizar timestamp
        snippet.updated_at = datetime.datetime.now().isoformat()
        
        # Guardar cambios
        self._save_snippet_file(snippet)
        self._save_index()
        
        print(f"✅ Fragmento actualizado: {snippet_id}")
        return True
    
    def delete_code(self, snippet_id: str) -> bool:
        """Elimina un fragmento de código"""
        if snippet_id not in self.code_snippets:
            print(f"❌ Fragmento no encontrado: {snippet_id}")
            return False
        
        snippet = self.code_snippets[snippet_id]
        
        # Eliminar archivo
        try:
            extensions = {
                CodeLanguage.JAVASCRIPT: ".js",
                CodeLanguage.TYPESCRIPT: ".ts",
                CodeLanguage.PYTHON: ".py",
                CodeLanguage.SOLIDITY: ".sol",
                CodeLanguage.HTML: ".html",
                CodeLanguage.CSS: ".css",
                CodeLanguage.GLSL: ".glsl",
                CodeLanguage.JSON: ".json",
                CodeLanguage.YAML: ".yml"
            }
            
            ext = extensions.get(snippet.language, ".txt")
            filename = f"{snippet.id}{ext}"
            filepath = self.storage_path / snippet.category.value / filename
            
            if filepath.exists():
                filepath.unlink()
                
        except Exception as e:
            print(f"❌ Error eliminando archivo: {e}")
        
        # Eliminar de memoria
        del self.code_snippets[snippet_id]
        self._save_index()
        
        print(f"✅ Fragmento eliminado: {snippet_id}")
        return True
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtiene estadísticas del almacenamiento de código"""
        stats = {
            'total_snippets': len(self.code_snippets),
            'categories': {},
            'languages': {},
            'difficulty_levels': {},
            'verified_snippets': 0,
            'average_test_coverage': 0.0
        }
        
        total_coverage = 0.0
        
        for snippet in self.code_snippets.values():
            # Contar por categoría
            cat = snippet.category.value
            stats['categories'][cat] = stats['categories'].get(cat, 0) + 1
            
            # Contar por lenguaje
            lang = snippet.language.value
            stats['languages'][lang] = stats['languages'].get(lang, 0) + 1
            
            # Contar por nivel de dificultad
            level = snippet.difficulty_level
            stats['difficulty_levels'][level] = stats['difficulty_levels'].get(level, 0) + 1
            
            # Contar verificados
            if snippet.is_verified:
                stats['verified_snippets'] += 1
            
            # Sumar cobertura de tests
            total_coverage += snippet.test_coverage
        
        if stats['total_snippets'] > 0:
            stats['average_test_coverage'] = total_coverage / stats['total_snippets']
        
        return stats
    
    def export_code(self, category: Optional[CodeCategory] = None, format: str = "json") -> str:
        """Exporta código en diferentes formatos"""
        snippets = self.code_snippets.values()
        
        if category:
            snippets = [s for s in snippets if s.category == category]
        
        if format.lower() == "json":
            return json.dumps([asdict(s) for s in snippets], indent=2, ensure_ascii=False)
        elif format.lower() == "markdown":
            return self._export_markdown(snippets)
        else:
            return "Formato no soportado"
    
    def _export_markdown(self, snippets: List[CodeSnippet]) -> str:
        """Exporta código en formato Markdown"""
        md = "# Biblioteca de Código de Lucía\n\n"
        
        for snippet in snippets:
            md += f"## {snippet.title}\n\n"
            md += f"**ID:** `{snippet.id}`\n\n"
            md += f"**Descripción:** {snippet.description}\n\n"
            md += f"**Categoría:** {snippet.category.value}\n\n"
            md += f"**Lenguaje:** {snippet.language.value}\n\n"
            md += f"**Tags:** {', '.join(snippet.tags)}\n\n"
            md += f"**Nivel:** {snippet.difficulty_level}\n\n"
            
            if snippet.usage_examples:
                md += "**Ejemplos de uso:**\n"
                for i, example in enumerate(snippet.usage_examples, 1):
                    md += f"{i}. {example}\n"
                md += "\n"
            
            md += f"```{snippet.language.value}\n{snippet.code}\n```\n\n"
            md += "---\n\n"
        
        return md

# Instancia global del gestor
code_manager = CodeStorageManager()

def main():
    """Función de prueba del sistema"""
    print("🧠 SISTEMA DE ALMACENAMIENTO DE CÓDIGO DE LUCÍA")
    print("=" * 50)
    
    # Ejemplo de almacenamiento
    example_code = """// Ejemplo básico de Three.js
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();"""
    
    snippet_id = code_manager.store_code(
        title="Cubo Rotatorio Three.js",
        description="Ejemplo básico de un cubo que rota en Three.js",
        category=CodeCategory.THREEJS_BASICS,
        language=CodeLanguage.JAVASCRIPT,
        code=example_code,
        tags=["threejs", "básico", "rotación", "cubo"],
        dependencies=["three"],
        usage_examples=["Aprender conceptos básicos de Three.js", "Crear primera escena 3D"],
        difficulty_level="beginner"
    )
    
    # Mostrar estadísticas
    stats = code_manager.get_statistics()
    print(f"\n📊 Estadísticas:")
    print(f"   Total de fragmentos: {stats['total_snippets']}")
    print(f"   Categorías: {len(stats['categories'])}")
    print(f"   Lenguajes: {len(stats['languages'])}")
    print(f"   Fragmentos verificados: {stats['verified_snippets']}")

if __name__ == "__main__":
    main() 