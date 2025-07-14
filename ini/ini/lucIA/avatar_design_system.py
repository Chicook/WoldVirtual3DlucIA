"""
Sistema de Diseño de Avatar para Lucía
Permite a Lucía diseñarse a sí misma usando Three.js, APIs de avatar e IA generativa
"""

import asyncio
import json
import aiohttp
import base64
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

class AvatarStyle(Enum):
    """Estilos de avatar disponibles"""
    REALISTIC = "realistic"
    ANIME = "anime"
    CARTOON = "cartoon"
    CYBERPUNK = "cyberpunk"
    FANTASY = "fantasy"
    MINIMALIST = "minimalist"

class SkinTone(Enum):
    """Tonos de piel disponibles"""
    VERY_FAIR = "very_fair"
    FAIR = "fair"
    MEDIUM = "medium"
    OLIVE = "olive"
    DARK = "dark"
    VERY_DARK = "very_dark"

@dataclass
class AvatarDesign:
    """Configuración de diseño del avatar"""
    style: AvatarStyle
    skin_tone: SkinTone
    hair_style: str
    hair_color: str
    eye_color: str
    clothing_style: str
    accessories: List[str]
    height: float
    body_type: str
    facial_features: Dict[str, Any]
    personality_traits: List[str]

class AvatarDesignSystem:
    """Sistema principal de diseño de avatar"""
    
    def __init__(self):
        self.design_file = Path(__file__).parent / "avatar_design.json"
        self.assets_path = Path(__file__).parent / "avatar_assets"
        self.assets_path.mkdir(exist_ok=True)
        
        # APIs configuradas
        self.ready_player_me_api = "https://api.readyplayer.me/v1"
        self.stable_diffusion_api = "https://api.stability.ai/v1/generation"
        self.vrm_api = "https://vrm.dev/api"
        
        # Cargar diseño actual
        self.current_design = self._load_current_design()
    
    def _load_current_design(self) -> AvatarDesign:
        """Carga el diseño actual del avatar"""
        if self.design_file.exists():
            try:
                with open(self.design_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                return AvatarDesign(
                    style=AvatarStyle(data.get('style', 'realistic')),
                    skin_tone=SkinTone(data.get('skin_tone', 'medium')),
                    hair_style=data.get('hair_style', 'long_straight'),
                    hair_color=data.get('hair_color', 'brown'),
                    eye_color=data.get('eye_color', 'brown'),
                    clothing_style=data.get('clothing_style', 'casual'),
                    accessories=data.get('accessories', []),
                    height=data.get('height', 1.65),
                    body_type=data.get('body_type', 'average'),
                    facial_features=data.get('facial_features', {}),
                    personality_traits=data.get('personality_traits', ['creative', 'intelligent'])
                )
            except Exception as e:
                print(f"❌ Error cargando diseño: {e}")
        
        # Diseño por defecto
        return AvatarDesign(
            style=AvatarStyle.REALISTIC,
            skin_tone=SkinTone.MEDIUM,
            hair_style="long_straight",
            hair_color="brown",
            eye_color="brown",
            clothing_style="casual",
            accessories=[],
            height=1.65,
            body_type="average",
            facial_features={},
            personality_traits=["creative", "intelligent", "friendly"]
        )
    
    def save_design(self, design: AvatarDesign):
        """Guarda el diseño del avatar"""
        try:
            data = {
                'style': design.style.value,
                'skin_tone': design.skin_tone.value,
                'hair_style': design.hair_style,
                'hair_color': design.hair_color,
                'eye_color': design.eye_color,
                'clothing_style': design.clothing_style,
                'accessories': design.accessories,
                'height': design.height,
                'body_type': design.body_type,
                'facial_features': design.facial_features,
                'personality_traits': design.personality_traits,
                'last_updated': asyncio.get_event_loop().time()
            }
            
            with open(self.design_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            self.current_design = design
            print(f"✅ Diseño guardado: {design.style.value}")
            
        except Exception as e:
            print(f"❌ Error guardando diseño: {e}")
    
    async def generate_avatar_with_ready_player_me(self, design: AvatarDesign) -> Optional[str]:
        """Genera avatar usando Ready Player Me API"""
        try:
            # Crear configuración para Ready Player Me
            config = {
                "style": design.style.value,
                "skinTone": design.skin_tone.value,
                "hairStyle": design.hair_style,
                "hairColor": design.hair_color,
                "eyeColor": design.eye_color,
                "clothing": design.clothing_style,
                "accessories": design.accessories
            }
            
            # En un entorno real, aquí harías la llamada a la API
            # Por ahora simulamos la respuesta
            print(f"🎭 Generando avatar con Ready Player Me...")
            print(f"   Estilo: {design.style.value}")
            print(f"   Piel: {design.skin_tone.value}")
            print(f"   Cabello: {design.hair_style} ({design.hair_color})")
            
            # Simular URL del avatar generado
            avatar_url = f"https://models.readyplayer.me/lucia_avatar_{design.style.value}.glb"
            
            return avatar_url
            
        except Exception as e:
            print(f"❌ Error generando avatar: {e}")
            return None
    
    async def generate_textures_with_stable_diffusion(self, prompt: str, style: str) -> Optional[str]:
        """Genera texturas usando Stable Diffusion"""
        try:
            # Prompt mejorado para texturas
            enhanced_prompt = f"high quality texture, {prompt}, {style} style, seamless, 4k resolution"
            
            print(f"🎨 Generando textura con Stable Diffusion...")
            print(f"   Prompt: {enhanced_prompt}")
            
            # En un entorno real, aquí harías la llamada a la API
            # Por ahora simulamos la respuesta
            texture_url = f"https://textures.stability.ai/lucia_{style}_{hash(prompt) % 1000}.png"
            
            return texture_url
            
        except Exception as e:
            print(f"❌ Error generando textura: {e}")
            return None
    
    def create_threejs_avatar_code(self, design: AvatarDesign, avatar_url: str = None) -> str:
        """Genera código Three.js para el avatar"""
        
        code = f"""// Avatar de Lucía - Generado automáticamente
import * as THREE from 'three';
import {{ GLTFLoader }} from 'three/examples/jsm/loaders/GLTFLoader.js';

class LuciaAvatar {{
    constructor(scene) {{
        this.scene = scene;
        this.avatar = null;
        this.mixer = null;
        this.animations = {{}};
        
        // Configuración del avatar
        this.config = {{
            style: '{design.style.value}',
            skinTone: '{design.skin_tone.value}',
            hairStyle: '{design.hair_style}',
            hairColor: '{design.hair_color}',
            eyeColor: '{design.eye_color}',
            height: {design.height},
            bodyType: '{design.body_type}'
        }};
        
        this.init();
    }}
    
    async init() {{
        // Cargar modelo 3D
        const loader = new GLTFLoader();
        
        try {{
            const gltf = await loader.loadAsync('{avatar_url or "models/lucia_avatar.glb"}');
            this.avatar = gltf.scene;
            
            // Configurar materiales según el diseño
            this.setupMaterials();
            
            // Configurar animaciones
            this.setupAnimations(gltf);
            
            // Añadir a la escena
            this.scene.add(this.avatar);
            
            console.log('✅ Avatar de Lucía cargado exitosamente');
            
        }} catch (error) {{
            console.error('❌ Error cargando avatar:', error);
            this.createBasicAvatar();
        }}
    }}
    
    setupMaterials() {{
        // Aplicar tono de piel
        const skinMaterial = new THREE.MeshStandardMaterial({{
            color: this.getSkinColor(),
            roughness: 0.8,
            metalness: 0.1
        }});
        
        // Aplicar color de cabello
        const hairMaterial = new THREE.MeshStandardMaterial({{
            color: this.getHairColor(),
            roughness: 0.9,
            metalness: 0.0
        }});
        
        // Aplicar materiales a las partes correspondientes
        this.avatar.traverse((child) => {{
            if (child.isMesh) {{
                if (child.name.includes('skin') || child.name.includes('body')) {{
                    child.material = skinMaterial;
                }} else if (child.name.includes('hair')) {{
                    child.material = hairMaterial;
                }}
            }}
        }});
    }}
    
    getSkinColor() {{
        const skinColors = {{
            'very_fair': 0xffdbac,
            'fair': 0xf1c27d,
            'medium': 0xe0ac69,
            'olive': 0xc68642,
            'dark': 0x8d5524,
            'very_dark': 0x3c1f0a
        }};
        return skinColors[this.config.skinTone] || 0xe0ac69;
    }}
    
    getHairColor() {{
        const hairColors = {{
            'black': 0x000000,
            'brown': 0x8B4513,
            'blonde': 0xFFD700,
            'red': 0x8B0000,
            'white': 0xFFFFFF,
            'gray': 0x808080
        }};
        return hairColors[this.config.hairColor] || 0x8B4513;
    }}
    
    setupAnimations(gltf) {{
        if (gltf.animations && gltf.animations.length > 0) {{
            this.mixer = new THREE.AnimationMixer(this.avatar);
            
            gltf.animations.forEach((clip) => {{
                const action = this.mixer.clipAction(clip);
                this.animations[clip.name] = action;
            }});
            
            // Reproducir animación idle por defecto
            if (this.animations['idle']) {{
                this.animations['idle'].play();
            }}
        }}
    }}
    
    createBasicAvatar() {{
        // Crear avatar básico con geometrías simples
        const group = new THREE.Group();
        
        // Cabeza
        const headGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({{
            color: this.getSkinColor()
        }});
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.6;
        group.add(head);
        
        // Torso
        const torsoGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.4, 8);
        const torsoMaterial = new THREE.MeshStandardMaterial({{
            color: this.getSkinColor()
        }});
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 1.3;
        group.add(torso);
        
        // Brazos
        const armGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
        const armMaterial = new THREE.MeshStandardMaterial({{
            color: this.getSkinColor()
        }});
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.2, 1.3, 0);
        leftArm.rotation.z = Math.PI / 2;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.2, 1.3, 0);
        rightArm.rotation.z = -Math.PI / 2;
        group.add(rightArm);
        
        // Piernas
        const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
        const legMaterial = new THREE.MeshStandardMaterial({{
            color: this.getSkinColor()
        }});
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.08, 0.8, 0);
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.08, 0.8, 0);
        group.add(rightLeg);
        
        this.avatar = group;
        this.scene.add(this.avatar);
        
        console.log('✅ Avatar básico creado');
    }}
    
    update(deltaTime) {{
        if (this.mixer) {{
            this.mixer.update(deltaTime);
        }}
    }}
    
    playAnimation(name) {{
        if (this.animations[name]) {{
            // Detener todas las animaciones
            Object.values(this.animations).forEach(action => action.stop());
            // Reproducir la animación solicitada
            this.animations[name].play();
        }}
    }}
    
    setPosition(x, y, z) {{
        if (this.avatar) {{
            this.avatar.position.set(x, y, z);
        }}
    }}
    
    setRotation(y) {{
        if (this.avatar) {{
            this.avatar.rotation.y = y;
        }}
    }}
}}

// Exportar la clase
export {{ LuciaAvatar }};
"""
        
        return code
    
    async def design_avatar_step_by_step(self) -> Dict[str, Any]:
        """Diseña el avatar paso a paso usando IA"""
        print("🎨 INICIANDO DISEÑO DE AVATAR PARA LUCÍA")
        print("=" * 50)
        
        # Paso 1: Generar avatar base
        print("1️⃣ Generando avatar base...")
        avatar_url = await self.generate_avatar_with_ready_player_me(self.current_design)
        
        # Paso 2: Generar texturas personalizadas
        print("2️⃣ Generando texturas personalizadas...")
        skin_texture = await self.generate_textures_with_stable_diffusion(
            f"realistic skin texture, {self.current_design.skin_tone.value} tone",
            self.current_design.style.value
        )
        
        hair_texture = await self.generate_textures_with_stable_diffusion(
            f"hair texture, {self.current_design.hair_style} style, {self.current_design.hair_color} color",
            self.current_design.style.value
        )
        
        # Paso 3: Generar código Three.js
        print("3️⃣ Generando código Three.js...")
        threejs_code = self.create_threejs_avatar_code(self.current_design, avatar_url)
        
        # Paso 4: Guardar diseño
        print("4️⃣ Guardando diseño...")
        self.save_design(self.current_design)
        
        return {
            'avatar_url': avatar_url,
            'skin_texture': skin_texture,
            'hair_texture': hair_texture,
            'threejs_code': threejs_code,
            'design': self.current_design
        }
    
    def customize_design(self, **kwargs) -> AvatarDesign:
        """Personaliza el diseño del avatar"""
        current_data = {
            'style': self.current_design.style,
            'skin_tone': self.current_design.skin_tone,
            'hair_style': self.current_design.hair_style,
            'hair_color': self.current_design.hair_color,
            'eye_color': self.current_design.eye_color,
            'clothing_style': self.current_design.clothing_style,
            'accessories': self.current_design.accessories,
            'height': self.current_design.height,
            'body_type': self.current_design.body_type,
            'facial_features': self.current_design.facial_features,
            'personality_traits': self.current_design.personality_traits
        }
        
        # Actualizar con nuevos valores
        for key, value in kwargs.items():
            if hasattr(self.current_design, key):
                current_data[key] = value
        
        # Crear nuevo diseño
        new_design = AvatarDesign(**current_data)
        
        # Guardar
        self.save_design(new_design)
        
        print(f"✅ Diseño personalizado guardado")
        return new_design

# Instancia global
avatar_system = AvatarDesignSystem()

async def main():
    """Función de prueba del sistema"""
    print("🎭 SISTEMA DE DISEÑO DE AVATAR PARA LUCÍA")
    print("=" * 50)
    
    # Diseñar avatar paso a paso
    result = await avatar_system.design_avatar_step_by_step()
    
    print(f"\n🎉 ¡AVATAR DISEÑADO EXITOSAMENTE!")
    print(f"📁 URL del avatar: {result['avatar_url']}")
    print(f"🎨 Textura de piel: {result['skin_texture']}")
    print(f"💇 Textura de cabello: {result['hair_texture']}")
    print(f"💻 Código Three.js generado: {len(result['threejs_code'])} caracteres")
    
    # Personalizar diseño
    print(f"\n🎨 Personalizando diseño...")
    new_design = avatar_system.customize_design(
        hair_color="blonde",
        eye_color="blue",
        clothing_style="elegant"
    )
    
    print(f"✅ Nuevo diseño aplicado")

if __name__ == "__main__":
    asyncio.run(main()) 