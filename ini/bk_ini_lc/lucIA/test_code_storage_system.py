"""
Prueba del Sistema de Almacenamiento de Código de Lucía
Demuestra todas las funcionalidades del sistema
"""

import asyncio
from pathlib import Path
import sys

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from code_storage_system import CodeStorageManager, CodeCategory, CodeLanguage
from lucia_code_learner import LucíaCodeLearner
from lucia_threejs_learning import LuciaThreeJSLearning
from lucIA import LucIACore
from config import PersonalityType

async def test_code_storage_basic():
    """Prueba básica del sistema de almacenamiento"""
    print("🧪 PRUEBA BÁSICA DEL SISTEMA DE ALMACENAMIENTO")
    print("=" * 50)
    
    # Crear gestor de código
    code_manager = CodeStorageManager()
    
    # Ejemplo de código Three.js
    threejs_code = """// Crear escena básica de Three.js
import * as THREE from 'three';

// Configurar escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear geometría
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();"""
    
    # Almacenar código
    snippet_id = code_manager.store_code(
        title="Escena Básica Three.js",
        description="Ejemplo completo de una escena básica con un cubo rotatorio",
        category=CodeCategory.THREEJS_BASICS,
        language=CodeLanguage.JAVASCRIPT,
        code=threejs_code,
        tags=["threejs", "básico", "escena", "cubo", "animación"],
        dependencies=["three"],
        usage_examples=["Aprender conceptos básicos de Three.js", "Crear primera escena 3D"],
        difficulty_level="beginner"
    )
    
    print(f"✅ Código almacenado con ID: {snippet_id}")
    
    # Buscar código
    results = code_manager.search_code(query="cubo", category=CodeCategory.THREEJS_BASICS)
    print(f"🔍 Resultados de búsqueda: {len(results)} fragmentos encontrados")
    
    # Mostrar estadísticas
    stats = code_manager.get_statistics()
    print(f"📊 Estadísticas:")
    print(f"   Total de fragmentos: {stats['total_snippets']}")
    print(f"   Categorías: {len(stats['categories'])}")
    print(f"   Lenguajes: {len(stats['languages'])}")

async def test_code_learner():
    """Prueba del sistema de aprendizaje de código"""
    print("\n🧠 PRUEBA DEL SISTEMA DE APRENDIZAJE")
    print("=" * 50)
    
    # Crear instancia del aprendiz
    learner = LucíaCodeLearner()
    
    # Simular respuesta de Gemini con código
    gemini_response = """
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
    
    Y aquí tienes un ejemplo en Python para procesar datos:
    
    ```python
    import numpy as np
    
    def process_avatar_data(data):
        # Procesar datos del avatar
        processed = np.array(data)
        return processed.mean()
    ```
    """
    
    # Aprender del ejemplo
    stored_ids = learner.learn_from_response(
        gemini_response, 
        "Creación de avatar 3D en Three.js"
    )
    
    print(f"✅ Fragmentos aprendidos: {len(stored_ids)}")
    
    # Buscar código aprendido
    results = learner.search_learned_code("avatar")
    print(f"🔍 Búsqueda 'avatar': {len(results)} resultados")
    
    # Mostrar estadísticas
    stats = learner.get_learning_statistics()
    print(f"📊 Estadísticas de aprendizaje:")
    print(f"   Total aprendido: {stats['total_learned_snippets']}")
    print(f"   Categorías: {stats['categories_learned']}")
    print(f"   Lenguajes: {stats['languages_learned']}")

async def test_integrated_system():
    """Prueba del sistema integrado completo"""
    print("\n🔗 PRUEBA DEL SISTEMA INTEGRADO")
    print("=" * 50)
    
    # Crear instancia de Lucía
    lucia_core = LucIACore(
        name="Lucía",
        personality=PersonalityType.CREATIVE,
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    # Crear sistema de aprendizaje
    learning_system = LuciaThreeJSLearning(lucia_core)
    
    # Mostrar estado inicial
    stats = learning_system.get_learning_statistics()
    print(f"📊 Estado inicial:")
    print(f"   Módulo actual: {stats['current_module']}")
    print(f"   Proyectos completados: {stats['completed_projects']}")
    print(f"   Fragmentos de código: {stats['code_snippets_learned']}")
    
    # Simular una pregunta específica
    question = "¿Cómo funciona el sistema de coordenadas en Three.js?"
    print(f"\n🤔 Pregunta: {question}")
    
    # En un entorno real, esto haría una llamada a Gemini
    # Por ahora simulamos la respuesta
    simulated_response = """
    El sistema de coordenadas en Three.js es fundamental para posicionar objetos en el espacio 3D.
    
    ```javascript
    // Sistema de coordenadas en Three.js
    const scene = new THREE.Scene();
    
    // Posicionar objetos usando coordenadas (x, y, z)
    const cube1 = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    cube1.position.set(0, 0, 0); // Centro
    
    const cube2 = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    cube2.position.set(2, 0, 0); // 2 unidades a la derecha
    
    scene.add(cube1);
    scene.add(cube2);
    ```
    
    Las coordenadas funcionan así:
    - X: izquierda (-) a derecha (+)
    - Y: abajo (-) a arriba (+)
    - Z: atrás (-) a adelante (+)
    """
    
    # Aprender de la respuesta simulada
    stored_ids = learning_system.lucia_learner.learn_from_response(
        simulated_response,
        f"Pregunta: {question}"
    )
    
    print(f"✅ Código almacenado: {len(stored_ids)} fragmentos")
    
    # Buscar código relacionado
    results = learning_system.search_learned_code("coordenadas")
    print(f"🔍 Búsqueda 'coordenadas': {len(results)} resultados")
    
    # Mostrar estadísticas actualizadas
    updated_stats = learning_system.get_learning_statistics()
    print(f"📊 Estado actualizado:")
    print(f"   Fragmentos de código: {updated_stats['code_snippets_learned']}")
    print(f"   Total aprendido: {updated_stats['total_learned_snippets']}")

async def test_export_functionality():
    """Prueba de funcionalidades de exportación"""
    print("\n📤 PRUEBA DE FUNCIONALIDADES DE EXPORTACIÓN")
    print("=" * 50)
    
    # Crear gestor de código
    code_manager = CodeStorageManager()
    
    # Exportar en diferentes formatos
    json_export = code_manager.export_code(format="json")
    markdown_export = code_manager.export_code(format="markdown")
    
    print(f"📄 Exportación JSON: {len(json_export)} caracteres")
    print(f"📄 Exportación Markdown: {len(markdown_export)} caracteres")
    
    # Guardar exportaciones
    export_dir = Path(__file__).parent / "exports"
    export_dir.mkdir(exist_ok=True)
    
    with open(export_dir / "code_export.json", 'w', encoding='utf-8') as f:
        f.write(json_export)
    
    with open(export_dir / "code_export.md", 'w', encoding='utf-8') as f:
        f.write(markdown_export)
    
    print(f"💾 Exportaciones guardadas en: {export_dir}")

async def main():
    """Función principal de pruebas"""
    print("🧪 PRUEBA COMPLETA DEL SISTEMA DE ALMACENAMIENTO DE CÓDIGO")
    print("=" * 60)
    
    try:
        # Prueba básica
        await test_code_storage_basic()
        
        # Prueba del aprendiz
        await test_code_learner()
        
        # Prueba del sistema integrado
        await test_integrated_system()
        
        # Prueba de exportación
        await test_export_functionality()
        
        print("\n🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!")
        print("✅ El sistema de almacenamiento de código está funcionando correctamente")
        print("🚀 Lucía puede ahora aprender y almacenar código automáticamente")
        
    except Exception as e:
        print(f"\n❌ Error en las pruebas: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main()) 