"""
Sistema de Integración de Avatar para Lucía
Combina aprendizaje Three.js, diseño de avatar y almacenamiento de código
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, List, Optional, Any

# Importar sistemas
from lucia_threejs_learning import LuciaThreeJSLearning
from lucia_core import LucIACore
from config import PersonalityType
from avatar_design_system import AvatarDesignSystem, AvatarStyle, SkinTone
from code_storage_system import CodeCategory, CodeLanguage

class LuciaAvatarIntegration:
    """Sistema integrado para que Lucía aprenda y diseñe su avatar"""
    
    def __init__(self):
        # Inicializar sistemas
        self.lucia_core = LucIACore(
            name="Lucía",
            personality=PersonalityType.CREATIVE,
            enable_memory=True,
            enable_paraphrasing=True
        )
        
        self.learning_system = LuciaThreeJSLearning(self.lucia_core)
        self.avatar_system = AvatarDesignSystem()
        
        # Archivo de progreso integrado
        self.integration_file = Path(__file__).parent / "avatar_integration_progress.json"
        self.integration_file.parent.mkdir(exist_ok=True)
        
        # Cargar progreso
        self.progress = self._load_progress()
    
    def _load_progress(self) -> Dict[str, Any]:
        """Carga el progreso de integración"""
        if self.integration_file.exists():
            try:
                with open(self.integration_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"❌ Error cargando progreso: {e}")
        
        return {
            'current_phase': 1,
            'phases_completed': [],
            'avatar_versions': [],
            'code_snippets_learned': [],
            'design_iterations': [],
            'last_updated': asyncio.get_event_loop().time()
        }
    
    def _save_progress(self):
        """Guarda el progreso de integración"""
        try:
            self.progress['last_updated'] = asyncio.get_event_loop().time()
            
            with open(self.integration_file, 'w', encoding='utf-8') as f:
                json.dump(self.progress, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"❌ Error guardando progreso: {e}")
    
    async def start_avatar_creation_journey(self) -> Dict[str, Any]:
        """Inicia el viaje completo de creación del avatar de Lucía"""
        print("🎭 VIAJE DE CREACIÓN DEL AVATAR DE LUCÍA")
        print("=" * 60)
        
        results = {}
        
        # Fase 1: Aprendizaje Three.js básico
        print("\n📚 FASE 1: APRENDIZAJE THREE.JS BÁSICO")
        print("-" * 40)
        
        # Aprender geometrías básicas
        basic_response = await self.learning_system.ask_specific_question(
            "¿Cómo crear geometrías básicas para un avatar humano en Three.js?"
        )
        results['basic_learning'] = basic_response
        
        # Aprender materiales y texturas
        materials_response = await self.learning_system.ask_specific_question(
            "¿Cómo aplicar materiales y texturas realistas a un avatar 3D?"
        )
        results['materials_learning'] = materials_response
        
        # Fase 2: Diseño del avatar
        print("\n🎨 FASE 2: DISEÑO DEL AVATAR")
        print("-" * 40)
        
        # Generar avatar base
        avatar_result = await self.avatar_system.design_avatar_step_by_step()
        results['avatar_design'] = avatar_result
        
        # Fase 3: Integración y personalización
        print("\n🔗 FASE 3: INTEGRACIÓN Y PERSONALIZACIÓN")
        print("-" * 40)
        
        # Aprender animaciones
        animation_response = await self.learning_system.ask_specific_question(
            "¿Cómo crear animaciones faciales y corporales para un avatar 3D?"
        )
        results['animation_learning'] = animation_response
        
        # Personalizar diseño
        custom_design = self.avatar_system.customize_design(
            hair_color="blonde",
            eye_color="blue",
            clothing_style="elegant",
            accessories=["glasses", "necklace"]
        )
        results['custom_design'] = custom_design
        
        # Fase 4: Generación de código final
        print("\n💻 FASE 4: GENERACIÓN DE CÓDIGO FINAL")
        print("-" * 40)
        
        final_code = self.avatar_system.create_threejs_avatar_code(
            custom_design, 
            avatar_result['avatar_url']
        )
        results['final_code'] = final_code
        
        # Actualizar progreso
        self.progress['phases_completed'].append(4)
        self.progress['avatar_versions'].append({
            'version': len(self.progress['avatar_versions']) + 1,
            'design': {
                'style': custom_design.style.value,
                'skin_tone': custom_design.skin_tone.value,
                'hair_color': custom_design.hair_color,
                'eye_color': custom_design.eye_color
            },
            'timestamp': asyncio.get_event_loop().time()
        })
        self._save_progress()
        
        print(f"\n🎉 ¡VIAJE COMPLETADO!")
        print(f"✅ Fases completadas: {len(self.progress['phases_completed'])}")
        print(f"🎭 Versiones de avatar: {len(self.progress['avatar_versions'])}")
        print(f"💻 Código generado: {len(final_code)} caracteres")
        
        return results
    
    async def learn_avatar_specific_skills(self) -> Dict[str, str]:
        """Aprende habilidades específicas para el avatar"""
        print("🎓 APRENDIZAJE DE HABILIDADES ESPECÍFICAS")
        print("=" * 50)
        
        skills = {}
        
        # Habilidades básicas
        skills_list = [
            "¿Cómo crear un sistema de huesos (skeleton) para animaciones de avatar?",
            "¿Cómo implementar controles de cámara para ver el avatar desde diferentes ángulos?",
            "¿Cómo añadir efectos de iluminación para que el avatar se vea realista?",
            "¿Cómo crear un sistema de gestos y expresiones faciales?",
            "¿Cómo optimizar el rendimiento del avatar para el metaverso?",
            "¿Cómo integrar el avatar con sistemas de física para movimientos realistas?",
            "¿Cómo crear un sistema de vestimenta intercambiable?",
            "¿Cómo implementar animaciones de caminar, correr y saltar?"
        ]
        
        for i, question in enumerate(skills_list, 1):
            print(f"\n📚 Aprendiendo habilidad {i}/{len(skills_list)}...")
            response = await self.learning_system.ask_specific_question(question)
            skills[f'skill_{i}'] = response
            
            # Pequeña pausa para no sobrecargar la API
            await asyncio.sleep(1)
        
        return skills
    
    async def create_avatar_showcase(self) -> str:
        """Crea una demostración completa del avatar"""
        print("🎪 CREANDO DEMOSTRACIÓN DEL AVATAR")
        print("=" * 50)
        
        # Generar código de demostración
        showcase_code = f"""// Demostración del Avatar de Lucía
import * as THREE from 'three';
import {{ LuciaAvatar }} from './LuciaAvatar.js';
import {{ OrbitControls }} from 'three/examples/jsm/controls/OrbitControls.js';

class LuciaAvatarShowcase {{
    constructor() {{
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({{ antialias: true }});
        this.avatar = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }}
    
    init() {{
        // Configurar renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Color de cielo
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // Configurar cámara
        this.camera.position.set(0, 1.5, 3);
        
        // Configurar controles
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Configurar iluminación
        this.setupLighting();
        
        // Configurar escena
        this.setupScene();
        
        // Crear avatar
        this.avatar = new LuciaAvatar(this.scene);
        
        // Configurar eventos
        this.setupEvents();
        
        // Iniciar animación
        this.animate();
    }}
    
    setupLighting() {{
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direccional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);
    }}
    
    setupScene() {{
        // Suelo
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshLambertMaterial({{ color: 0x90EE90 }});
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Elementos decorativos
        this.addDecorations();
    }}
    
    addDecorations() {{
        // Árboles
        for (let i = 0; i < 5; i++) {{
            const treeGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 8);
            const treeMaterial = new THREE.MeshLambertMaterial({{ color: 0x8B4513 }});
            const trunk = new THREE.Mesh(treeGeometry, treeMaterial);
            
            const leavesGeometry = new THREE.SphereGeometry(0.8, 8, 8);
            const leavesMaterial = new THREE.MeshLambertMaterial({{ color: 0x228B22 }});
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 1.5;
            
            trunk.position.set(
                (Math.random() - 0.5) * 8,
                1,
                (Math.random() - 0.5) * 8
            );
            leaves.position.copy(trunk.position);
            leaves.position.y += 1.5;
            
            trunk.castShadow = true;
            leaves.castShadow = true;
            
            this.scene.add(trunk);
            this.scene.add(leaves);
        }}
    }}
    
    setupEvents() {{
        // Controles de teclado
        document.addEventListener('keydown', (event) => {{
            switch(event.key) {{
                case '1':
                    this.avatar.playAnimation('idle');
                    break;
                case '2':
                    this.avatar.playAnimation('walk');
                    break;
                case '3':
                    this.avatar.playAnimation('wave');
                    break;
                case '4':
                    this.avatar.playAnimation('dance');
                    break;
            }}
        }});
        
        // Redimensionar ventana
        window.addEventListener('resize', () => {{
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }});
    }}
    
    animate() {{
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Actualizar controles
        this.controls.update();
        
        // Actualizar avatar
        if (this.avatar) {{
            this.avatar.update(deltaTime);
        }}
        
        // Renderizar
        this.renderer.render(this.scene, this.camera);
    }}
}}

// Inicializar demostración
const showcase = new LuciaAvatarShowcase();

// Instrucciones para el usuario
console.log('🎭 Demostración del Avatar de Lucía');
console.log('📱 Controles:');
console.log('   - Ratón: Rotar cámara');
console.log('   - Rueda: Zoom');
console.log('   - Teclas 1-4: Cambiar animaciones');
"""
        
        return showcase_code
    
    def export_complete_avatar_project(self) -> Dict[str, Any]:
        """Exporta el proyecto completo del avatar"""
        print("📦 EXPORTANDO PROYECTO COMPLETO")
        print("=" * 40)
        
        # Obtener estadísticas
        learning_stats = self.learning_system.get_learning_statistics()
        avatar_design = self.avatar_system.current_design
        
        # Crear estructura del proyecto
        project = {
            'metadata': {
                'name': 'Lucia Avatar Project',
                'version': '1.0.0',
                'description': 'Proyecto completo del avatar 3D de Lucía',
                'created_by': 'Lucía AI',
                'last_updated': asyncio.get_event_loop().time()
            },
            'avatar_design': {
                'style': avatar_design.style.value,
                'skin_tone': avatar_design.skin_tone.value,
                'hair_style': avatar_design.hair_style,
                'hair_color': avatar_design.hair_color,
                'eye_color': avatar_design.eye_color,
                'clothing_style': avatar_design.clothing_style,
                'accessories': avatar_design.accessories,
                'height': avatar_design.height,
                'body_type': avatar_design.body_type,
                'personality_traits': avatar_design.personality_traits
            },
            'learning_progress': learning_stats,
            'integration_progress': self.progress,
            'files': {
                'avatar_class': 'LuciaAvatar.js',
                'showcase': 'LuciaAvatarShowcase.js',
                'design_config': 'avatar_design.json',
                'learning_data': 'learning_progress.json'
            }
        }
        
        return project

# Instancia global
avatar_integration = LuciaAvatarIntegration()

async def main():
    """Función principal de demostración"""
    print("🎭 SISTEMA INTEGRADO DE AVATAR PARA LUCÍA")
    print("=" * 60)
    
    # Iniciar viaje de creación
    results = await avatar_integration.start_avatar_creation_journey()
    
    # Aprender habilidades específicas
    skills = await avatar_integration.learn_avatar_specific_skills()
    
    # Crear demostración
    showcase = await avatar_integration.create_avatar_showcase()
    
    # Exportar proyecto
    project = avatar_integration.export_complete_avatar_project()
    
    print(f"\n🎉 ¡PROYECTO COMPLETO EXPORTADO!")
    print(f"📁 Archivos generados:")
    print(f"   - LuciaAvatar.js ({len(results.get('final_code', ''))} caracteres)")
    print(f"   - LuciaAvatarShowcase.js ({len(showcase)} caracteres)")
    print(f"   - avatar_design.json")
    print(f"   - learning_progress.json")
    print(f"📊 Estadísticas:")
    print(f"   - Habilidades aprendidas: {len(skills)}")
    print(f"   - Fragmentos de código: {project['learning_progress'].get('total_learned_snippets', 0)}")
    print(f"   - Versiones de avatar: {len(project['integration_progress']['avatar_versions'])}")

if __name__ == "__main__":
    asyncio.run(main())
