"""
LucIA - IA Inteligente para la Plataforma Metaverso Crypto World Virtual 3D
Versión 2.0.0 - Arquitectura Modular Refactorizada

Características principales:
- Sistema de rotación automática de APIs
- Memoria persistente con parafraseo inteligente
- Personalidades configurables
- Gestión de costos y límites
- Fallback a memoria cuando las APIs se agotan
"""

import asyncio
import os
import sys
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lucia_pro.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('LucIA_Pro')

# Importar módulos de la nueva arquitectura
try:
    from config import config, PersonalityType, APIType
    from lucia_core import LucIACore
    from memory import MemoryManager
    from api_manager import APIManager
    from paraphraser import Paraphraser
    from lucia_learning.languages import LanguageManager
except ImportError as e:
    logger.error(f"Error importando módulos: {e}")
    print("❌ Error: Asegúrate de que todos los archivos de la nueva arquitectura estén presentes.")
    sys.exit(1)

class LucIAInterface:
    """Interfaz principal de LucIA"""
    
    def __init__(self):
        self.lucia: Optional[LucIACore] = None
        self.running = False
        self.language_manager = LanguageManager()
        
    async def initialize(self):
        """Inicializa LucIA"""
        try:
            print("🚀 Inicializando LucIA Pro...")
            
            # Crear instancia principal
            self.lucia = LucIACore(
                name=config.platform.ai_name,
                personality=config.platform.default_personality,
                enable_memory=config.platform.enable_memory_learning,
                enable_paraphrasing=config.platform.enable_paraphrasing
            )
            
            # Configurar APIs adicionales si están disponibles
            await self._setup_apis()
            
            self.running = True
            print("✅ LucIA Pro inicializado correctamente")
                        
        except Exception as e:
            logger.error(f"Error inicializando LucIA: {e}")
            print(f"❌ Error de inicialización: {e}")
            return False
            
        return True
        
    async def _setup_apis(self):
        """Configura APIs adicionales desde variables de entorno"""
        # OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            config.add_api(
                name="openai_pro",
                api_type=APIType.OPENAI,
                api_key=openai_key,
                endpoint="https://api.openai.com/v1/chat/completions",
                model="gpt-3.5-turbo",
                daily_limit=1000,
                priority=1,
                cost_per_request=0.002
            )
            print("✅ API OpenAI configurada")
            
        # Anthropic
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        if anthropic_key:
            config.add_api(
                name="anthropic_pro",
                api_type=APIType.ANTHROPIC,
                api_key=anthropic_key,
                endpoint="https://api.anthropic.com/v1/messages",
                model="claude-3-sonnet-20240229",
                daily_limit=1000,
                priority=2,
                cost_per_request=0.015
            )
            print("✅ API Anthropic configurada")
            
        # Gemini
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            config.add_api(
                name="gemini_pro",
                api_type=APIType.GEMINI,
                api_key=gemini_key,
                endpoint="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                model="gemini-pro",
                daily_limit=1000,
                priority=3,
                cost_per_request=0.0  # Gratuito hasta ciertos límites
            )
            print("✅ API Gemini configurada")
            
        # HuggingFace (gratuita)
        huggingface_key = os.getenv("HUGGINGFACE_API_KEY")
        if huggingface_key:
            config.add_api(
                name="huggingface_free",
                api_type=APIType.HUGGINGFACE,
                api_key=huggingface_key,
                endpoint="https://api-inference.huggingface.co/models/",
                model="microsoft/DialoGPT-medium",
                daily_limit=1000,
                priority=4,
                cost_per_request=0.0
            )
            print("✅ API HuggingFace configurada")
            
    def show_help(self):
        """Muestra la ayuda de comandos"""
        print("\n" + "="*60)
        print("🎯 COMANDOS DISPONIBLES:")
        print("="*60)
        print("💬 Conversación:")
        print("  • Escribe cualquier mensaje para chatear")
        print("  • 'salir' o 'exit': Terminar la conversación")
        print()
        print("📊 Información:")
        print("  • 'stats': Ver estadísticas detalladas")
        print("  • 'apis': Ver estado de APIs")
        print("  • 'memoria': Ver estadísticas de memoria")
        print()
        print("🎭 Personalidad:")
        print("  • 'personalidad [tipo]': Cambiar personalidad")
        print("  • Tipos: friendly, professional, creative, analytical, humorous, empathetic, metaverse")
        print()
        print("💾 Gestión de datos:")
        print("  • 'export json/txt': Exportar historial")
        print("  • 'backup': Crear backup completo")
        print("  • 'buscar [término]': Buscar en conversaciones")
        print()
        print("🔄 Sistema:")
        print("  • 'feedback positivo/negativo/neutral [comentario]': Dar retroalimentación")
        print("  • 'limpiar': Limpiar pantalla")
        print("  • 'ayuda': Mostrar esta ayuda")
        print("  • 'reset': Resetear límites diarios")
        print("="*60)
        
    async def run_chat_loop(self):
        """Ejecuta el bucle principal de chat"""
        if not self.lucia:
            print("❌ LucIA no está inicializado")
            return
            
        print(f"\n🌟 ¡Hola! Soy {self.lucia.name}, tu asistente de IA para el metaverso.")
        print(f"🎭 Personalidad actual: {self.lucia.personality.value}")
        print("💡 Escribe 'ayuda' para ver todos los comandos disponibles.")
        
        while self.running:
            try:
                user_input = input(f"\n🌟 Tú: ").strip()
                
                if not user_input:
                    continue
                    
                # Procesar comandos especiales
                if await self._handle_special_commands(user_input):
                    continue
                    
                # Conversación normal
                response = await self.lucia.chat(user_input)
                
                # Mostrar respuesta
                if response.used_memory:
                    print(f"\n🤖 {self.lucia.name} (Memoria): {response.paraphrased_response}")
                else:
                    print(f"\n🤖 {self.lucia.name} ({response.source_api}): {response.paraphrased_response}")
                    
                # Mostrar información adicional
                if response.confidence < 0.7:
                    print(f"⚠️  Confianza baja: {response.confidence:.2f}")
                    
            except KeyboardInterrupt:
                print(f"\n\n👋 ¡Conversación interrumpida!")
                break
            except Exception as e:
                logger.error(f"Error en chat loop: {e}")
                print(f"\n❌ Error: {e}")
                
        # Crear backup al salir
        if self.lucia:
            backup_path = self.lucia.create_backup()
            print(f"💾 Backup creado: {backup_path}")
            
    async def _handle_special_commands(self, user_input: str) -> bool:
        """Maneja comandos especiales"""
        input_lower = user_input.lower()
        
        # Comandos de salida
        if input_lower in ['salir', 'exit', 'quit']:
            self.running = False
            return True
            
        # Comando de ayuda
        if input_lower == 'ayuda':
            self.show_help()
            return True
            
        # Estadísticas
        if input_lower == 'stats':
            await self._show_stats()
            return True
            
        # Estado de APIs
        if input_lower == 'apis':
            await self._show_api_status()
            return True
            
        # Estadísticas de memoria
        if input_lower == 'memoria':
            await self._show_memory_stats()
            return True
            
        # Exportar historial
        if input_lower.startswith('export'):
            await self._handle_export(user_input)
            return True
            
        # Backup
        if input_lower == 'backup':
            await self._handle_backup()
            return True
            
        # Cambiar personalidad
        if input_lower.startswith('personalidad'):
            await self._handle_personality_change(user_input)
            return True
            
        # Feedback
        if input_lower.startswith('feedback'):
            await self._handle_feedback(user_input)
            return True
            
        # Buscar conversaciones
        if input_lower.startswith('buscar'):
            await self._handle_search(user_input)
            return True
            
        # Limpiar pantalla
        if input_lower == 'limpiar':
            os.system('cls' if os.name == 'nt' else 'clear')
            return True
            
        # Resetear límites
        if input_lower == 'reset':
            result = self.lucia.reset_daily_limits()
            print(f"\n🔄 {result}")
            return True
            
        # Comando: analizar archivo multi-lenguaje
        if input_lower.startswith('analiza '):
            file_path = user_input.split(' ', 1)[1].strip()
            if os.path.exists(file_path):
                result = self.language_manager.analyze(file_path)
                print(f"\n🔎 Análisis de {file_path}:\n{result}")
            else:
                print(f"\n❌ Archivo no encontrado: {file_path}")
            return True
        
        # Comando: refactorizar archivo multi-lenguaje
        if input_lower.startswith('refactoriza '):
            file_path = user_input.split(' ', 1)[1].strip()
            if os.path.exists(file_path):
                result = self.language_manager.refactor(file_path)
                print(f"\n🛠️ Refactorización de {file_path}:\n{result}")
            else:
                print(f"\n❌ Archivo no encontrado: {file_path}")
            return True
        
        # Comando: generar código multi-lenguaje
        if input_lower.startswith('genera '):
            parts = user_input.split(' ', 2)
            if len(parts) >= 3:
                lang = parts[1].strip().lower()
                prompt = parts[2].strip()
                result = self.language_manager.generate(lang, prompt)
                print(f"\n⚡ Código generado en {lang}:\n{result}")
            else:
                print("\n❌ Uso: genera [lenguaje] [prompt]")
            return True
            
        return False
        
    async def _show_stats(self):
        """Muestra estadísticas completas"""
        stats = self.lucia.get_stats()
        
        print(f"\n📊 ESTADÍSTICAS DE {stats['name']}:")
        print(f"┌─────────────────────────────────────────┐")
        print(f"│ Plataforma: {stats['platform']:<25} │")
        print(f"│ Personalidad: {stats['personality']:<25} │")
        print(f"│ Total de peticiones: {stats['core_stats']['total_requests']:<15} │")
        print(f"│ Peticiones API: {stats['core_stats']['api_requests']:<20} │")
        print(f"│ Peticiones memoria: {stats['core_stats']['memory_requests']:<17} │")
        print(f"│ Tiempo promedio: {stats['core_stats']['total_processing_time']/max(stats['core_stats']['total_requests'], 1):>18.2f}s │")
        print(f"│ Confianza promedio: {stats['core_stats']['average_confidence']:>17.2f} │")
        print(f"└─────────────────────────────────────────┘")
        
        # Estadísticas de memoria
        memory_stats = stats['memory_stats']
        print(f"\n🧠 MEMORIA:")
        print(f"  • Entradas totales: {memory_stats.get('total_memory_entries', 0)}")
        print(f"  • Conversaciones: {memory_stats.get('total_conversations', 0)}")
        print(f"  • Efectividad promedio: {memory_stats.get('avg_effectiveness', 0):.2f}")
        print(f"  • Tamaño cache: {memory_stats.get('cache_size', 0)}")
        
    async def _show_api_status(self):
        """Muestra el estado de las APIs"""
        api_status = self.lucia._get_api_status()
        
        print(f"\n📡 ESTADO DE APIs:")
        for api_name, info in api_status.items():
            status_icon = "✅" if info["can_use"] else "❌"
            enabled_icon = "🟢" if info["enabled"] else "🔴"
            print(f"  {enabled_icon} {api_name}:")
            print(f"    {status_icon} Uso: {info['usage_today']}/{info['daily_limit']} (Restantes: {info['remaining']})")
            print(f"    💰 Costo por petición: ${info['cost_per_request']:.4f}")
            print(f"    🎯 Prioridad: {info['priority']}")
            print(f"    🔧 Tipo: {info['api_type']}")
            
    async def _show_memory_stats(self):
        """Muestra estadísticas detalladas de memoria"""
        memory_stats = self.lucia.memory_manager.get_memory_stats()
        
        print(f"\n🧠 ESTADÍSTICAS DE MEMORIA:")
        print(f"  • Entradas totales: {memory_stats.get('total_memory_entries', 0)}")
        print(f"  • Conversaciones: {memory_stats.get('total_conversations', 0)}")
        print(f"  • Efectividad promedio: {memory_stats.get('avg_effectiveness', 0):.2f}")
        print(f"  • Tamaño cache: {memory_stats.get('cache_size', 0)}")
        print(f"  • Historial conversaciones: {memory_stats.get('conversation_history_size', 0)}")
        
        # Distribución por fuente
        source_dist = memory_stats.get('source_distribution', {})
        if source_dist:
            print(f"\n📊 DISTRIBUCIÓN POR FUENTE:")
            for source, count in source_dist.items():
                print(f"  • {source}: {count} entradas")
                
    async def _handle_export(self, user_input: str):
        """Maneja la exportación de datos"""
        parts = user_input.split()
        format_type = parts[1] if len(parts) > 1 else "json"
        
        try:
            result = self.lucia.export_conversation_history(format_type)
            print(f"\n📄 {result}")
        except Exception as e:
            print(f"\n❌ Error exportando: {e}")
            
    async def _handle_backup(self):
        """Maneja la creación de backup"""
        try:
            result = self.lucia.create_backup()
            print(f"\n💾 {result}")
        except Exception as e:
            print(f"\n❌ Error creando backup: {e}")
            
    async def _handle_personality_change(self, user_input: str):
        """Maneja el cambio de personalidad"""
        parts = user_input.split()
        if len(parts) > 1:
            personality_map = {
                "friendly": PersonalityType.FRIENDLY,
                "professional": PersonalityType.PROFESSIONAL,
                "creative": PersonalityType.CREATIVE,
                "analytical": PersonalityType.ANALYTICAL,
                "humorous": PersonalityType.HUMOROUS,
                "empathetic": PersonalityType.EMPATHETIC,
                "metaverse": PersonalityType.METAVERSE
            }
            new_personality = personality_map.get(parts[1].lower())
            if new_personality:
                result = self.lucia.change_personality(new_personality)
                print(f"\n{result}")
            else:
                print(f"\n❌ Personalidad no reconocida. Opciones: {', '.join(personality_map.keys())}")
        else:
            print(f"\n🎭 Personalidad actual: {self.lucia.personality.value}")

    async def _handle_feedback(self, user_input: str):
        """Maneja el feedback del usuario"""
        parts = user_input.split(maxsplit=2)
        feedback_type = parts[1] if len(parts) > 1 else "neutral"
        comment = parts[2] if len(parts) > 2 else ""
        
        try:
            result = self.lucia.provide_feedback(feedback_type, 3, comment)
            print(f"\n👍 {result}")
        except Exception as e:
            print(f"\n❌ Error procesando feedback: {e}")
            
    async def _handle_search(self, user_input: str):
        """Maneja la búsqueda en conversaciones"""
        query = user_input[6:].strip()
        if query:
            try:
                results = self.lucia.search_conversations(query)
                print(f"\n🔍 Encontradas {len(results)} conversaciones:")
                for i, result in enumerate(results[:5], 1):
                    print(f"\n{i}. [{result['timestamp']}] ({result['source']})")
                    print(f"   👤: {result['user_input'][:100]}...")
                    print(f"   🤖: {result['lucia_response'][:100]}...")
            except Exception as e:
                print(f"\n❌ Error en búsqueda: {e}")
        else:
            print(f"\n❌ Especifica un término de búsqueda")

async def main():
    """Función principal"""
    print("🚀 Iniciando LucIA Pro - IA del Metaverso")
    print("=" * 50)
    
    # Crear interfaz
    interface = LucIAInterface()
    
    # Inicializar
    if not await interface.initialize():
        print("❌ Error en la inicialización. Saliendo...")
        return
        
    # Ejecutar bucle de chat
    await interface.run_chat_loop()
    
    print("\n👋 ¡Gracias por usar LucIA Pro!")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 ¡Programa interrumpido por el usuario!")
    except Exception as e:
        logger.error(f"Error en programa principal: {e}")
        print(f"\n❌ Error crítico: {e}")
        print("💡 Verifica que todos los archivos de la nueva arquitectura estén presentes.")