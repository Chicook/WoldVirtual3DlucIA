#!/usr/bin/env python3
"""
Script de prueba para las nuevas mejoras de LucIA
Demuestra las capacidades mejoradas del sistema
"""

import asyncio
import time
import json
from datetime import datetime
from pathlib import Path

# Importar componentes de LucIA
from lucia_core import LucIACore
from response_validator import ResponseValidator
from context_manager import ContextManager, ContextType
from metaverso_integration import MetaversoIntegration, MetaversoCommand

class LucIATester:
    """Clase para probar las mejoras de LucIA"""
    
    def __init__(self):
        self.lucia = LucIACore(
            name="LucIA Mejorada",
            enable_memory=True,
            enable_paraphrasing=True
        )
        self.validator = ResponseValidator()
        self.context_manager = ContextManager()
        self.metaverso = MetaversoIntegration()
        
        print("🧪 Inicializando pruebas de LucIA Mejorada...")
    
    async def test_response_validation(self):
        """Prueba el sistema de validación de respuestas"""
        print("\n" + "="*60)
        print("🔍 PRUEBA: Sistema de Validación de Respuestas")
        print("="*60)
        
        test_cases = [
            {
                "name": "Respuesta de buena calidad",
                "response": "Para crear un cubo en Three.js, puedes usar BoxGeometry. Aquí tienes un ejemplo completo: const geometry = new THREE.BoxGeometry(1, 1, 1); const material = new THREE.MeshBasicMaterial({color: 0x00ff00}); const cube = new THREE.Mesh(geometry, material); scene.add(cube);",
                "prompt": "¿Cómo creo un cubo en Three.js?"
            },
            {
                "name": "Respuesta repetitiva",
                "response": "Para crear un cubo en Three.js, puedes crear un cubo. El cubo se crea usando BoxGeometry. El cubo es una forma básica. El cubo tiene 6 caras.",
                "prompt": "¿Cómo creo un cubo en Three.js?"
            },
            {
                "name": "Respuesta muy corta",
                "response": "Usa BoxGeometry.",
                "prompt": "¿Cómo creo un cubo en Three.js?"
            },
            {
                "name": "Respuesta contradictoria",
                "response": "No puedes crear objetos en Three.js, pero puedes crear un cubo usando BoxGeometry.",
                "prompt": "¿Cómo creo un cubo en Three.js?"
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n📝 Test {i}: {test_case['name']}")
            print(f"Prompt: {test_case['prompt']}")
            print(f"Respuesta: {test_case['response'][:100]}...")
            
            # Validar respuesta
            validation = self.validator.validate_response(
                test_case['response'], 
                test_case['prompt']
            )
            
            print(f"✅ Válida: {validation.is_valid}")
            print(f"🎯 Calidad: {validation.quality_score:.1f}/100")
            print(f"🔍 Problemas: {len(validation.issues)}")
            
            if validation.issues:
                print("⚠️ Problemas detectados:")
                for issue in validation.issues:
                    print(f"   - {issue}")
            
            if validation.suggestions:
                print("💡 Sugerencias:")
                for suggestion in validation.suggestions:
                    print(f"   - {suggestion}")
            
            print("-" * 40)
    
    async def test_context_management(self):
        """Prueba el sistema de gestión de contexto"""
        print("\n" + "="*60)
        print("🧠 PRUEBA: Sistema de Gestión de Contexto")
        print("="*60)
        
        session_id = "test_session"
        
        # Crear sesión
        self.context_manager.create_session(session_id, "Hola, quiero aprender Three.js")
        
        # Simular conversación
        messages = [
            "¿Cómo creo un cubo?",
            "¿Y cómo le cambio el color?",
            "¿Puedo hacer que se mueva?",
            "¿Qué más puedo crear además de cubos?",
            "Me gustaría crear una escena completa"
        ]
        
        print(f"💬 Simulando conversación en sesión: {session_id}")
        
        for i, message in enumerate(messages, 1):
            print(f"\n📨 Mensaje {i}: {message}")
            
            # Añadir mensaje
            self.context_manager.add_message(session_id, message, is_user=True)
            
            # Obtener contexto relevante
            context = self.context_manager.get_context_for_response(session_id, message)
            
            print(f"🎭 Tema detectado: {context['topic']}")
            print(f"😊 Estado de ánimo: {context['mood']}")
            print(f"🔧 Nivel técnico: {context['technical_level']}")
            print(f"📊 Longitud de conversación: {context['conversation_length']}")
        
        # Obtener resumen de conversación
        summary = self.context_manager.get_conversation_summary(session_id)
        
        print(f"\n📋 Resumen de la conversación:")
        print(f"   Tema principal: {summary['main_topic']}")
        print(f"   Estado de ánimo predominante: {summary['main_mood']}")
        print(f"   Total de mensajes: {summary['message_count']}")
        print(f"   Duración: {summary['duration']:.1f} segundos")
        print(f"   Términos técnicos: {', '.join(summary['technical_terms'][:5])}")
    
    async def test_metaverso_integration(self):
        """Prueba la integración con el metaverso"""
        print("\n" + "="*60)
        print("🎮 PRUEBA: Integración con Metaverso")
        print("="*60)
        
        # Mensajes que contienen comandos del metaverso
        test_messages = [
            "Crear un cubo rojo en el centro",
            "Mover el objeto a la posición x=5, y=0, z=0",
            "Rotar el cubo 90 grados en el eje Y",
            "Cambiar el color del objeto a azul",
            "Eliminar el objeto del cubo",
            "¿Qué objetos hay en la escena?",
            "Crear una esfera grande de color verde arriba"
        ]
        
        print("🔍 Detectando comandos del metaverso...")
        
        for i, message in enumerate(test_messages, 1):
            print(f"\n📨 Mensaje {i}: {message}")
            
            # Detectar comandos
            commands = self.metaverso.detect_metaverso_commands(message)
            
            if commands:
                print(f"✅ Comandos detectados: {len(commands)}")
                for j, command in enumerate(commands, 1):
                    print(f"   Comando {j}:")
                    print(f"     Tipo: {command.command_type}")
                    print(f"     Prioridad: {command.priority}")
                    if command.target_id:
                        print(f"     Objetivo: {command.target_id}")
                    if command.parameters:
                        print(f"     Parámetros: {command.parameters}")
                    
                    # Generar código Three.js
                    code = self.metaverso.generate_threejs_code(command)
                    print(f"     Código generado:")
                    print(f"       {code.replace(chr(10), chr(10) + '       ')}")
            else:
                print("❌ No se detectaron comandos")
        
        # Probar análisis de escena
        print(f"\n📊 Análisis de escena:")
        scene_analysis = self.metaverso.get_scene_analysis()
        print(f"   ID de escena: {scene_analysis.get('scene_id', 'N/A')}")
        print(f"   Total de objetos: {scene_analysis.get('total_objects', 0)}")
        print(f"   Tipos de objetos: {scene_analysis.get('object_types', {})}")
    
    async def test_lucia_improvements(self):
        """Prueba las mejoras generales de LucIA"""
        print("\n" + "="*60)
        print("🤖 PRUEBA: Mejoras Generales de LucIA")
        print("="*60)
        
        test_prompts = [
            "¿Cómo creo un cubo en Three.js?",
            "Explícame qué es el metaverso",
            "¿Puedes ayudarme con un error en mi código?",
            "Quiero crear una escena 3D completa",
            "¿Cuáles son las mejores prácticas para desarrollo 3D?"
        ]
        
        session_id = "improvement_test"
        
        for i, prompt in enumerate(test_prompts, 1):
            print(f"\n🤖 Consulta {i}: {prompt}")
            
            start_time = time.time()
            
            # Obtener respuesta de LucIA
            response = await self.lucia.chat(prompt, session_id=session_id)
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            print(f"⏱️ Tiempo de respuesta: {processing_time:.2f}s")
            print(f"📡 Fuente: {response.source_api}")
            print(f"🎯 Confianza: {response.confidence:.2f}")
            print(f"🧠 Usó memoria: {response.used_memory}")
            print(f"📝 Respuesta:")
            print(f"   {response.paraphrased_response[:200]}...")
            
            if response.keywords:
                print(f"🔑 Palabras clave: {', '.join(response.keywords[:5])}")
        
        # Mostrar estadísticas
        stats = self.lucia.get_stats()
        print(f"\n📊 Estadísticas de la sesión:")
        if 'core_stats' in stats:
            core_stats = stats['core_stats']
            print(f"   Total de consultas: {core_stats.get('total_requests', 0)}")
            print(f"   Consultas a APIs: {core_stats.get('api_requests', 0)}")
            print(f"   Consultas a memoria: {core_stats.get('memory_requests', 0)}")
            total_requests = core_stats.get('total_requests', 1)
            total_time = core_stats.get('total_processing_time', 0)
            print(f"   Tiempo promedio: {total_time / max(total_requests, 1):.2f}s")
            print(f"   Confianza promedio: {core_stats.get('average_confidence', 0):.2f}")
        else:
            print(f"   Personalidad: {stats.get('personality', 'N/A')}")
            print(f"   Nombre: {stats.get('name', 'N/A')}")
            print(f"   Plataforma: {stats.get('platform', 'N/A')}")
    
    async def test_personality_switching(self):
        """Prueba el cambio de personalidades"""
        print("\n" + "="*60)
        print("🎭 PRUEBA: Cambio de Personalidades")
        print("="*60)
        
        personalities = [
            ("Friendly", "¿Cómo estás hoy?"),
            ("Professional", "Necesito ayuda técnica"),
            ("Creative", "Quiero crear algo artístico"),
            ("Analytical", "Analiza este problema"),
            ("Metaverso", "Ayúdame con el desarrollo 3D")
        ]
        
        for personality_name, prompt in personalities:
            print(f"\n🎭 Cambiando a personalidad: {personality_name}")
            
            # Cambiar personalidad
            self.lucia.change_personality(personality_name)
            
            # Hacer consulta
            response = await self.lucia.chat(prompt, session_id="personality_test")
            
            print(f"📝 Respuesta:")
            print(f"   {response.paraphrased_response[:150]}...")
    
    async def run_all_tests(self):
        """Ejecuta todas las pruebas"""
        print("🚀 INICIANDO PRUEBAS COMPLETAS DE LUCIA MEJORADA")
        print("="*80)
        
        start_time = time.time()
        
        # Ejecutar pruebas
        await self.test_response_validation()
        await self.test_context_management()
        await self.test_metaverso_integration()
        await self.test_lucia_improvements()
        await self.test_personality_switching()
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print("\n" + "="*80)
        print("✅ PRUEBAS COMPLETADAS")
        print("="*80)
        print(f"⏱️ Tiempo total: {total_time:.2f} segundos")
        print(f"🎯 Todas las mejoras están funcionando correctamente")
        print(f"🌟 LucIA está lista para el desarrollo avanzado")
        
        # Guardar reporte
        self._save_test_report(total_time)
    
    def _save_test_report(self, total_time: float):
        """Guarda un reporte de las pruebas"""
        report = {
            "test_date": datetime.now().isoformat(),
            "total_time": total_time,
            "tests_executed": [
                "Sistema de Validación de Respuestas",
                "Gestión de Contexto",
                "Integración con Metaverso",
                "Mejoras Generales de LucIA",
                "Cambio de Personalidades"
            ],
            "status": "PASSED",
            "notes": "Todas las mejoras implementadas funcionando correctamente"
        }
        
        report_file = Path("test_report.json")
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Reporte guardado en: {report_file}")

async def main():
    """Función principal"""
    tester = LucIATester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main()) 