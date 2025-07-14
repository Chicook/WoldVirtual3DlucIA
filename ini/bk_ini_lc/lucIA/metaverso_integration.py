"""
Sistema de integración con el metaverso para LucIA
Conecta la IA con el editor 3D y el mundo virtual
"""

import json
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
from datetime import datetime
import re

logger = logging.getLogger(__name__)

@dataclass
class SceneObject:
    """Objeto en la escena 3D"""
    id: str
    name: str
    type: str  # 'geometry', 'light', 'camera', 'group'
    position: Dict[str, float]  # x, y, z
    rotation: Dict[str, float]  # x, y, z
    scale: Dict[str, float]  # x, y, z
    properties: Dict[str, Any]
    parent_id: Optional[str] = None

@dataclass
class SceneState:
    """Estado actual de la escena 3D"""
    scene_id: str
    objects: List[SceneObject]
    camera_position: Dict[str, float]
    camera_target: Dict[str, float]
    lighting: Dict[str, Any]
    environment: Dict[str, Any]
    timestamp: datetime

@dataclass
class MetaversoCommand:
    """Comando para el metaverso"""
    command_type: str  # 'create', 'modify', 'delete', 'move', 'rotate', 'scale'
    target_id: Optional[str] = None
    parameters: Dict[str, Any] = None
    priority: int = 1  # 1-10, mayor = más importante

class MetaversoIntegration:
    """Sistema de integración con el metaverso"""
    
    def __init__(self, metaverso_path: str = "../"):
        self.metaverso_path = Path(metaverso_path)
        self.scene_state: Optional[SceneState] = None
        self.command_queue: List[MetaversoCommand] = []
        self.threejs_templates = self._load_threejs_templates()
        
        # Configuración de integración
        self.integration_config = {
            "auto_sync": True,
            "command_timeout": 5.0,
            "max_objects": 1000,
            "supported_types": ["cube", "sphere", "cylinder", "plane", "light", "camera"]
        }
        
        # Patrones para detectar comandos del metaverso
        self.command_patterns = {
            "create": [
                r"\b(crear|crea|añadir|agregar|generar)\b.*\b(cubo|esfera|cilindro|plano|luz|cámara)\b",
                r"\b(nuevo|nueva)\b.*\b(objeto|elemento|figura|forma)\b"
            ],
            "modify": [
                r"\b(modificar|cambiar|ajustar|mover|rotar|escalar)\b",
                r"\b(posición|rotación|tamaño|color|textura)\b"
            ],
            "delete": [
                r"\b(eliminar|borrar|quitar|remover)\b",
                r"\b(borra|quita|remueve)\b"
            ],
            "analyze": [
                r"\b(analizar|revisar|examinar|ver)\b.*\b(escena|objetos|elementos)\b",
                r"\b(qué|que hay|cuántos|dónde)\b.*\b(objetos|elementos)\b"
            ]
        }
        
        logger.info("Sistema de integración con metaverso inicializado")
    
    def _load_threejs_templates(self) -> Dict[str, str]:
        """Carga plantillas de código Three.js"""
        templates = {
            "cube": """
const geometry = new THREE.BoxGeometry({width}, {height}, {depth});
const material = new THREE.MeshBasicMaterial({{ color: '{color}' }});
const cube = new THREE.Mesh(geometry, material);
cube.position.set({x}, {y}, {z});
scene.add(cube);
""",
            "sphere": """
const geometry = new THREE.SphereGeometry({radius}, {segments}, {segments});
const material = new THREE.MeshBasicMaterial({{ color: '{color}' }});
const sphere = new THREE.Mesh(geometry, material);
sphere.position.set({x}, {y}, {z});
scene.add(sphere);
""",
            "cylinder": """
const geometry = new THREE.CylinderGeometry({radiusTop}, {radiusBottom}, {height}, {segments});
const material = new THREE.MeshBasicMaterial({{ color: '{color}' }});
const cylinder = new THREE.Mesh(geometry, material);
cylinder.position.set({x}, {y}, {z});
scene.add(cylinder);
""",
            "plane": """
const geometry = new THREE.PlaneGeometry({width}, {height});
const material = new THREE.MeshBasicMaterial({{ color: '{color}' }});
const plane = new THREE.Mesh(geometry, material);
plane.position.set({x}, {y}, {z});
scene.add(plane);
""",
            "light": """
const light = new THREE.DirectionalLight(0xffffff, {intensity});
light.position.set({x}, {y}, {z});
scene.add(light);
""",
            "camera": """
const camera = new THREE.PerspectiveCamera({fov}, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set({x}, {y}, {z});
camera.lookAt({targetX}, {targetY}, {targetZ});
"""
        }
        return templates
    
    async def analyze_scene(self, scene_data: Dict[str, Any] = None) -> SceneState:
        """Analiza el estado actual de la escena"""
        try:
            if scene_data:
                # Usar datos proporcionados
                return self._parse_scene_data(scene_data)
            else:
                # Intentar leer desde archivo de estado
                return await self._read_scene_state()
                
        except Exception as e:
            logger.error(f"Error analizando escena: {e}")
            return self._create_default_scene()
    
    def _parse_scene_data(self, scene_data: Dict[str, Any]) -> SceneState:
        """Parsea datos de escena"""
        objects = []
        
        for obj_data in scene_data.get("objects", []):
            obj = SceneObject(
                id=obj_data.get("id", f"obj_{len(objects)}"),
                name=obj_data.get("name", "Objeto"),
                type=obj_data.get("type", "geometry"),
                position=obj_data.get("position", {"x": 0, "y": 0, "z": 0}),
                rotation=obj_data.get("rotation", {"x": 0, "y": 0, "z": 0}),
                scale=obj_data.get("scale", {"x": 1, "y": 1, "z": 1}),
                properties=obj_data.get("properties", {}),
                parent_id=obj_data.get("parent_id")
            )
            objects.append(obj)
        
        return SceneState(
            scene_id=scene_data.get("scene_id", "default"),
            objects=objects,
            camera_position=scene_data.get("camera", {}).get("position", {"x": 0, "y": 0, "z": 5}),
            camera_target=scene_data.get("camera", {}).get("target", {"x": 0, "y": 0, "z": 0}),
            lighting=scene_data.get("lighting", {}),
            environment=scene_data.get("environment", {}),
            timestamp=datetime.now()
        )
    
    async def _read_scene_state(self) -> SceneState:
        """Lee el estado de la escena desde archivo"""
        scene_file = self.metaverso_path / "data" / "metaverso" / "worlds" / "current_scene.json"
        
        if scene_file.exists():
            try:
                with open(scene_file, 'r', encoding='utf-8') as f:
                    scene_data = json.load(f)
                return self._parse_scene_data(scene_data)
            except Exception as e:
                logger.error(f"Error leyendo archivo de escena: {e}")
        
        return self._create_default_scene()
    
    def _create_default_scene(self) -> SceneState:
        """Crea una escena por defecto"""
        return SceneState(
            scene_id="default",
            objects=[],
            camera_position={"x": 0, "y": 0, "z": 5},
            camera_target={"x": 0, "y": 0, "z": 0},
            lighting={"ambient": True, "directional": True},
            environment={"background": "#000000"},
            timestamp=datetime.now()
        )
    
    def detect_metaverso_commands(self, message: str) -> List[MetaversoCommand]:
        """Detecta comandos del metaverso en un mensaje"""
        commands = []
        message_lower = message.lower()
        
        # Detectar comandos de creación
        if any(re.search(pattern, message_lower) for pattern in self.command_patterns["create"]):
            object_type = self._extract_object_type(message)
            if object_type:
                commands.append(MetaversoCommand(
                    command_type="create",
                    parameters={
                        "type": object_type,
                        "position": self._extract_position(message),
                        "properties": self._extract_properties(message, object_type)
                    },
                    priority=5
                ))
        
        # Detectar comandos de modificación
        if any(re.search(pattern, message_lower) for pattern in self.command_patterns["modify"]):
            target_id = self._extract_target_id(message)
            if target_id:
                commands.append(MetaversoCommand(
                    command_type="modify",
                    target_id=target_id,
                    parameters={
                        "position": self._extract_position(message),
                        "rotation": self._extract_rotation(message),
                        "scale": self._extract_scale(message),
                        "properties": self._extract_properties(message)
                    },
                    priority=4
                ))
        
        # Detectar comandos de eliminación
        if any(re.search(pattern, message_lower) for pattern in self.command_patterns["delete"]):
            target_id = self._extract_target_id(message)
            if target_id:
                commands.append(MetaversoCommand(
                    command_type="delete",
                    target_id=target_id,
                    priority=6
                ))
        
        # Detectar comandos de análisis
        if any(re.search(pattern, message_lower) for pattern in self.command_patterns["analyze"]):
            commands.append(MetaversoCommand(
                command_type="analyze",
                priority=3
            ))
        
        return commands
    
    def _extract_object_type(self, message: str) -> Optional[str]:
        """Extrae el tipo de objeto del mensaje"""
        type_patterns = {
            "cube": r"\b(cubo|caja|box)\b",
            "sphere": r"\b(esfera|bola|sphere)\b",
            "cylinder": r"\b(cilindro|cylinder)\b",
            "plane": r"\b(plano|plane|superficie)\b",
            "light": r"\b(luz|light|iluminación)\b",
            "camera": r"\b(cámara|camera)\b"
        }
        
        for obj_type, pattern in type_patterns.items():
            if re.search(pattern, message, re.IGNORECASE):
                return obj_type
        
        return None
    
    def _extract_position(self, message: str) -> Dict[str, float]:
        """Extrae posición del mensaje"""
        position = {"x": 0, "y": 0, "z": 0}
        
        # Buscar coordenadas explícitas
        coord_patterns = {
            "x": r"\b(x|coordenada x)\s*[=:]\s*([+-]?\d+\.?\d*)",
            "y": r"\b(y|coordenada y)\s*[=:]\s*([+-]?\d+\.?\d*)",
            "z": r"\b(z|coordenada z)\s*[=:]\s*([+-]?\d+\.?\d*)"
        }
        
        for axis, pattern in coord_patterns.items():
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                position[axis] = float(match.group(2))
        
        # Buscar posiciones relativas
        if "centro" in message.lower() or "origen" in message.lower():
            position = {"x": 0, "y": 0, "z": 0}
        elif "arriba" in message.lower():
            position["y"] = 5
        elif "abajo" in message.lower():
            position["y"] = -5
        elif "izquierda" in message.lower():
            position["x"] = -5
        elif "derecha" in message.lower():
            position["x"] = 5
        elif "adelante" in message.lower() or "frente" in message.lower():
            position["z"] = 5
        elif "atrás" in message.lower() or "detrás" in message.lower():
            position["z"] = -5
        
        return position
    
    def _extract_rotation(self, message: str) -> Dict[str, float]:
        """Extrae rotación del mensaje"""
        rotation = {"x": 0, "y": 0, "z": 0}
        
        # Buscar rotaciones explícitas
        rot_patterns = {
            "x": r"\b(rotar x|rotación x)\s*[=:]\s*([+-]?\d+\.?\d*)",
            "y": r"\b(rotar y|rotación y)\s*[=:]\s*([+-]?\d+\.?\d*)",
            "z": r"\b(rotar z|rotación z)\s*[=:]\s*([+-]?\d+\.?\d*)"
        }
        
        for axis, pattern in rot_patterns.items():
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                rotation[axis] = float(match.group(2))
        
        return rotation
    
    def _extract_scale(self, message: str) -> Dict[str, float]:
        """Extrae escala del mensaje"""
        scale = {"x": 1, "y": 1, "z": 1}
        
        # Buscar escalas explícitas
        scale_patterns = {
            "x": r"\b(escala x|tamaño x)\s*[=:]\s*([+-]?\d+\.?\d*)",
            "y": r"\b(escala y|tamaño y)\s*[=:]\s*([+-]?\d+\.?\d*)",
            "z": r"\b(escala z|tamaño z)\s*[=:]\s*([+-]?\d+\.?\d*)"
        }
        
        for axis, pattern in scale_patterns.items():
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                scale[axis] = float(match.group(2))
        
        # Buscar escalas relativas
        if "grande" in message.lower() or "ampliar" in message.lower():
            scale = {"x": 2, "y": 2, "z": 2}
        elif "pequeño" in message.lower() or "reducir" in message.lower():
            scale = {"x": 0.5, "y": 0.5, "z": 0.5}
        
        return scale
    
    def _extract_properties(self, message: str, object_type: str = None) -> Dict[str, Any]:
        """Extrae propiedades del objeto del mensaje"""
        properties = {}
        
        # Extraer color
        color_patterns = [
            r"\b(color|color)\s*[=:]\s*(\w+)",
            r"\b(rojo|red)\b",
            r"\b(verde|green)\b",
            r"\b(azul|blue)\b",
            r"\b(amarillo|yellow)\b",
            r"\b(negro|black)\b",
            r"\b(blanco|white)\b"
        ]
        
        for pattern in color_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                color = match.group(2) if len(match.groups()) > 1 else match.group(1)
                properties["color"] = self._normalize_color(color)
                break
        
        # Extraer dimensiones específicas por tipo
        if object_type == "cube":
            width_match = re.search(r"\b(ancho|width)\s*[=:]\s*(\d+\.?\d*)", message, re.IGNORECASE)
            height_match = re.search(r"\b(alto|height)\s*[=:]\s*(\d+\.?\d*)", message, re.IGNORECASE)
            depth_match = re.search(r"\b(profundo|depth)\s*[=:]\s*(\d+\.?\d*)", message, re.IGNORECASE)
            
            if width_match:
                properties["width"] = float(width_match.group(2))
            if height_match:
                properties["height"] = float(height_match.group(2))
            if depth_match:
                properties["depth"] = float(depth_match.group(2))
        
        elif object_type == "sphere":
            radius_match = re.search(r"\b(radio|radius)\s*[=:]\s*(\d+\.?\d*)", message, re.IGNORECASE)
            if radius_match:
                properties["radius"] = float(radius_match.group(2))
        
        elif object_type == "light":
            intensity_match = re.search(r"\b(intensidad|intensity)\s*[=:]\s*(\d+\.?\d*)", message, re.IGNORECASE)
            if intensity_match:
                properties["intensity"] = float(intensity_match.group(2))
        
        return properties
    
    def _extract_target_id(self, message: str) -> Optional[str]:
        """Extrae el ID del objeto objetivo"""
        # Buscar IDs explícitos
        id_match = re.search(r"\b(id|objeto)\s*[=:]\s*(\w+)", message, re.IGNORECASE)
        if id_match:
            return id_match.group(2)
        
        # Buscar nombres de objetos
        name_match = re.search(r"\b(objeto|elemento)\s+(\w+)", message, re.IGNORECASE)
        if name_match:
            return name_match.group(2)
        
        return None
    
    def _normalize_color(self, color: str) -> str:
        """Normaliza nombres de colores"""
        color_map = {
            "rojo": "#ff0000",
            "red": "#ff0000",
            "verde": "#00ff00",
            "green": "#00ff00",
            "azul": "#0000ff",
            "blue": "#0000ff",
            "amarillo": "#ffff00",
            "yellow": "#ffff00",
            "negro": "#000000",
            "black": "#000000",
            "blanco": "#ffffff",
            "white": "#ffffff"
        }
        
        return color_map.get(color.lower(), color)
    
    def generate_threejs_code(self, command: MetaversoCommand) -> str:
        """Genera código Three.js para un comando"""
        if command.command_type == "create":
            return self._generate_create_code(command)
        elif command.command_type == "modify":
            return self._generate_modify_code(command)
        elif command.command_type == "delete":
            return self._generate_delete_code(command)
        else:
            return "// Comando no soportado"
    
    def _generate_create_code(self, command: MetaversoCommand) -> str:
        """Genera código para crear objetos"""
        params = command.parameters
        obj_type = params.get("type", "cube")
        position = params.get("position", {"x": 0, "y": 0, "z": 0})
        properties = params.get("properties", {})
        
        if obj_type not in self.threejs_templates:
            return f"// Tipo de objeto '{obj_type}' no soportado"
        
        template = self.threejs_templates[obj_type]
        
        # Preparar parámetros
        template_params = {
            "x": position["x"],
            "y": position["y"],
            "z": position["z"],
            "color": properties.get("color", "#ffffff")
        }
        
        # Añadir parámetros específicos por tipo
        if obj_type == "cube":
            template_params.update({
                "width": properties.get("width", 1),
                "height": properties.get("height", 1),
                "depth": properties.get("depth", 1)
            })
        elif obj_type == "sphere":
            template_params.update({
                "radius": properties.get("radius", 1),
                "segments": 32
            })
        elif obj_type == "cylinder":
            template_params.update({
                "radiusTop": properties.get("radiusTop", 1),
                "radiusBottom": properties.get("radiusBottom", 1),
                "height": properties.get("height", 1),
                "segments": 32
            })
        elif obj_type == "plane":
            template_params.update({
                "width": properties.get("width", 1),
                "height": properties.get("height", 1)
            })
        elif obj_type == "light":
            template_params.update({
                "intensity": properties.get("intensity", 1)
            })
        
        return template.format(**template_params)
    
    def _generate_modify_code(self, command: MetaversoCommand) -> str:
        """Genera código para modificar objetos"""
        target_id = command.target_id
        params = command.parameters or {}
        
        code_lines = []
        
        if "position" in params:
            pos = params["position"]
            code_lines.append(f"{target_id}.position.set({pos['x']}, {pos['y']}, {pos['z']});")
        
        if "rotation" in params:
            rot = params["rotation"]
            code_lines.append(f"{target_id}.rotation.set({rot['x']}, {rot['y']}, {rot['z']});")
        
        if "scale" in params:
            scale = params["scale"]
            code_lines.append(f"{target_id}.scale.set({scale['x']}, {scale['y']}, {scale['z']});")
        
        if "properties" in params:
            props = params["properties"]
            if "color" in props:
                code_lines.append(f"{target_id}.material.color.setHex(0x{props['color'].replace('#', '')});")
        
        return "\n".join(code_lines) if code_lines else f"// No se especificaron modificaciones para {target_id}"
    
    def _generate_delete_code(self, command: MetaversoCommand) -> str:
        """Genera código para eliminar objetos"""
        target_id = command.target_id
        return f"scene.remove({target_id});"
    
    def get_scene_analysis(self) -> Dict[str, Any]:
        """Obtiene análisis de la escena actual"""
        if not self.scene_state:
            return {"error": "No hay escena cargada"}
        
        analysis = {
            "scene_id": self.scene_state.scene_id,
            "total_objects": len(self.scene_state.objects),
            "object_types": {},
            "camera_info": {
                "position": self.scene_state.camera_position,
                "target": self.scene_state.camera_target
            },
            "lighting_info": self.scene_state.lighting,
            "environment_info": self.scene_state.environment,
            "timestamp": self.scene_state.timestamp.isoformat()
        }
        
        # Contar tipos de objetos
        for obj in self.scene_state.objects:
            obj_type = obj.type
            analysis["object_types"][obj_type] = analysis["object_types"].get(obj_type, 0) + 1
        
        return analysis
    
    async def execute_command(self, command: MetaversoCommand) -> Dict[str, Any]:
        """Ejecuta un comando en el metaverso"""
        try:
            # Generar código Three.js
            code = self.generate_threejs_code(command)
            
            # Guardar comando en cola
            self.command_queue.append(command)
            
            # Simular ejecución (en implementación real, se enviaría al editor)
            result = {
                "success": True,
                "command_type": command.command_type,
                "target_id": command.target_id,
                "code": code,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Comando ejecutado: {command.command_type}")
            return result
            
        except Exception as e:
            logger.error(f"Error ejecutando comando: {e}")
            return {
                "success": False,
                "error": str(e),
                "command_type": command.command_type
            }
    
    def save_scene_state(self, filepath: str = None) -> bool:
        """Guarda el estado de la escena"""
        try:
            if not self.scene_state:
                return False
            
            if not filepath:
                filepath = self.metaverso_path / "data" / "metaverso" / "worlds" / "scene_state.json"
            
            scene_data = asdict(self.scene_state)
            scene_data["timestamp"] = scene_data["timestamp"].isoformat()
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(scene_data, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            logger.error(f"Error guardando estado de escena: {e}")
            return False 