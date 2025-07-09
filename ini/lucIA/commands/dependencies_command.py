"""
Comando de Dependencias para LucIA
Permite a LucIA instalar y gestionar dependencias del proyecto automáticamente
"""

import os
import sys
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Agregar el directorio padre al path para importar dependencies_manager
sys.path.append(str(Path(__file__).parent.parent))
from dependencies_manager import DependenciesManager

logger = logging.getLogger(__name__)

class DependenciesCommand:
    """Comando especial de LucIA para gestión de dependencias"""
    
    def __init__(self):
        self.manager = DependenciesManager()
        self.commands = {
            "dependencias": self.handle_dependencies_request,
            "instalar": self.handle_install_request,
            "verificar": self.handle_verify_request,
            "resumen": self.handle_summary_request,
            "ayuda": self.handle_help_request
        }
    
    def process_command(self, user_input: str) -> str:
        """Procesa el comando del usuario"""
        user_input = user_input.lower().strip()
        
        # Detectar palabras clave
        if any(keyword in user_input for keyword in ["dependencia", "npm", "node", "instalar", "setup"]):
            return self.handle_dependencies_request(user_input)
        
        # Comandos específicos
        for command, handler in self.commands.items():
            if command in user_input:
                return handler(user_input)
        
        return self.handle_help_request(user_input)
    
    def handle_dependencies_request(self, user_input: str) -> str:
        """Maneja la solicitud principal de dependencias"""
        response = """
🎯 **¡Hola! Soy LucIA, tu asistente de desarrollo para WoldVirtual3DlucIA**

Veo que quieres configurar las dependencias del proyecto. ¡Perfecto! 

📦 **¿Qué necesitas hacer?**

1. **"Instalar"** - Descargar todas las dependencias automáticamente
2. **"Verificar"** - Comprobar qué dependencias faltan
3. **"Resumen"** - Ver el estado actual del proyecto
4. **"Ayuda"** - Más información sobre el proceso

💡 **Recomendación**: Si es la primera vez que usas el proyecto, 
   escribe **"Instalar"** y yo me encargaré de todo automáticamente.

🚀 **¿Qué prefieres hacer?**
"""
        return response
    
    def handle_install_request(self, user_input: str) -> str:
        """Maneja la solicitud de instalación"""
        try:
            # Verificar requisitos del sistema primero
            system_status = self.manager.check_system_requirements()
            
            response = "🔧 **Verificando requisitos del sistema...**\n\n"
            
            # Mostrar estado del sistema
            response += "📊 **Estado actual:**\n"
            response += f"• Node.js: {'✅' if system_status['node_installed'] else '❌'} {system_status['node_version'] or 'No instalado'}\n"
            response += f"• npm: {'✅' if system_status['npm_installed'] else '❌'} {system_status['npm_version'] or 'No instalado'}\n"
            response += f"• Python: {'✅' if system_status['python_installed'] else '❌'} {system_status['python_version'] or 'No instalado'}\n"
            response += f"• Git: {'✅' if system_status['git_installed'] else '❌'} {system_status['git_version'] or 'No instalado'}\n\n"
            
            # Mostrar recomendaciones si hay problemas
            if system_status["recommendations"]:
                response += "⚠️ **Recomendaciones antes de continuar:**\n"
                for rec in system_status["recommendations"]:
                    response += f"• {rec}\n"
                response += "\n"
            
            # Preguntar si continuar
            if any(not status for status in [system_status['node_installed'], system_status['npm_installed']]):
                response += "❓ **¿Quieres continuar con la instalación de dependencias?**\n"
                response += "   (Algunos requisitos no están instalados, pero puedo intentar)\n\n"
                response += "Escribe **'Sí'** para continuar o **'No'** para cancelar."
                return response
            
            # Si todo está bien, proceder con la instalación
            response += "🚀 **Iniciando instalación automática de dependencias...**\n\n"
            response += "📦 Esto puede tomar varios minutos. Te mantendré informado del progreso.\n\n"
            
            # Realizar instalación
            results = self.manager.install_dependencies()
            
            if results["success"]:
                response += f"✅ **¡Instalación completada exitosamente!**\n\n"
                response += f"📊 **Resumen:**\n"
                response += f"• Tiempo total: {results['total_time']:.2f} segundos\n"
                response += f"• Módulos instalados: {len(results['installed_modules'])}\n"
                response += f"• Módulos fallidos: {len(results['failed_modules'])}\n\n"
                
                if results["installed_modules"]:
                    response += "✅ **Módulos instalados correctamente:**\n"
                    for module in results["installed_modules"][:5]:  # Mostrar solo los primeros 5
                        response += f"• {module}\n"
                    if len(results["installed_modules"]) > 5:
                        response += f"• ... y {len(results['installed_modules']) - 5} más\n"
                    response += "\n"
                
                if results["failed_modules"]:
                    response += "⚠️ **Módulos con problemas:**\n"
                    for module in results["failed_modules"]:
                        response += f"• {module}\n"
                    response += "\n"
                
                response += "🎉 **¡Tu proyecto está listo para desarrollar!**\n\n"
                response += "💡 **Próximos pasos:**\n"
                response += "• Para iniciar el sistema modular: `cd web && npm run dev`\n"
                response += "• Para el editor 3D: `cd .bin/editor3d && npm run dev`\n"
                response += "• Para el motor 3D: `cd client && npm run dev`\n"
                response += "• Para verificar todo: Escribe **'Verificar'**\n"
                
            else:
                response += f"❌ **La instalación encontró algunos problemas:**\n\n"
                response += f"📊 **Resumen:**\n"
                response += f"• Módulos instalados: {len(results['installed_modules'])}\n"
                response += f"• Módulos fallidos: {len(results['failed_modules'])}\n\n"
                
                if results["errors"]:
                    response += "❌ **Errores encontrados:**\n"
                    for error in results["errors"][:3]:  # Mostrar solo los primeros 3 errores
                        response += f"• {error}\n"
                    if len(results["errors"]) > 3:
                        response += f"• ... y {len(results['errors']) - 3} errores más\n"
                    response += "\n"
                
                response += "🔧 **Sugerencias:**\n"
                response += "• Verifica que tienes Node.js 18.x+ instalado\n"
                response += "• Ejecuta: `npm cache clean --force`\n"
                response += "• Intenta instalar módulos individualmente\n"
                response += "• Escribe **'Verificar'** para ver el estado actual\n"
            
            return response
            
        except Exception as e:
            logger.error(f"Error en instalación de dependencias: {e}")
            return f"❌ **Error inesperado durante la instalación:**\n\n{str(e)}\n\n💡 Intenta ejecutar el comando manualmente o escribe **'Ayuda'** para más información."
    
    def handle_verify_request(self, user_input: str) -> str:
        """Maneja la solicitud de verificación"""
        try:
            response = "🔍 **Verificando instalación de dependencias...**\n\n"
            
            verification = self.manager.verify_installation()
            
            if verification["success"]:
                response += "✅ **¡Excelente! Todas las dependencias están instaladas correctamente.**\n\n"
                
                if verification["verified_modules"]:
                    response += "📦 **Módulos verificados:**\n"
                    for module in verification["verified_modules"][:10]:  # Mostrar solo los primeros 10
                        response += f"• {module}\n"
                    if len(verification["verified_modules"]) > 10:
                        response += f"• ... y {len(verification['verified_modules']) - 10} más\n"
                    response += "\n"
                
                response += "🎉 **Tu proyecto está completamente configurado y listo para usar!**\n\n"
                response += "🚀 **Puedes comenzar a desarrollar:**\n"
                response += "• Sistema modular: `cd web && npm run dev`\n"
                response += "• Editor 3D: `cd .bin/editor3d && npm run dev`\n"
                response += "• Motor 3D: `cd client && npm run dev`\n"
                
            else:
                response += "⚠️ **Se encontraron algunos problemas en la instalación:**\n\n"
                
                if verification["missing_dependencies"]:
                    response += "❌ **Dependencias faltantes:**\n"
                    for missing in verification["missing_dependencies"]:
                        response += f"• {missing}\n"
                    response += "\n"
                
                if verification["failed_modules"]:
                    response += "❌ **Módulos con problemas:**\n"
                    for module in verification["failed_modules"]:
                        response += f"• {module}\n"
                    response += "\n"
                
                response += "🔧 **Para solucionar estos problemas:**\n"
                response += "• Escribe **'Instalar'** para reinstalar las dependencias\n"
                response += "• Verifica que tienes Node.js 18.x+ instalado\n"
                response += "• Ejecuta: `npm cache clean --force`\n"
                response += "• Escribe **'Ayuda'** para más información\n"
            
            return response
            
        except Exception as e:
            logger.error(f"Error en verificación de dependencias: {e}")
            return f"❌ **Error durante la verificación:**\n\n{str(e)}\n\n💡 Intenta escribir **'Instalar'** para reinstalar las dependencias."
    
    def handle_summary_request(self, user_input: str) -> str:
        """Maneja la solicitud de resumen"""
        try:
            summary = self.manager.get_installation_summary()
            return f"📊 **Resumen del Proyecto WoldVirtual3DlucIA**\n\n{summary}"
            
        except Exception as e:
            logger.error(f"Error generando resumen: {e}")
            return f"❌ **Error generando resumen:**\n\n{str(e)}"
    
    def handle_help_request(self, user_input: str) -> str:
        """Maneja la solicitud de ayuda"""
        response = """
📚 **Ayuda - Gestión de Dependencias con LucIA**

🎯 **¿Qué puedo hacer por ti?**

**📦 Comandos principales:**
• **"Instalar"** - Descargar todas las dependencias automáticamente
• **"Verificar"** - Comprobar el estado de las dependencias
• **"Resumen"** - Ver información del proyecto y sistema
• **"Ayuda"** - Mostrar esta información

**🔧 Proceso de instalación:**
1. Verifico los requisitos del sistema (Node.js, npm, Python, Git)
2. Analizo la estructura del proyecto
3. Instalo dependencias de npm en cada módulo
4. Instalo dependencias de Python donde sea necesario
5. Verifico que todo esté funcionando correctamente

**📊 Módulos que se instalan:**
• **web/** - Sistema modular principal
• **.bin/editor3d/** - Editor 3D integrado
• **client/** - Motor 3D descentralizado
• **assets/** - Gestión de recursos
• **bloc/** - Integración blockchain
• **components/** - Biblioteca de componentes
• **entities/** - Sistema de entidades
• **fonts/** - Gestión de fuentes
• **helpers/** - Utilidades 3D
• **image/** - Procesamiento de imágenes
• **languages/** - Sistema multiidioma
• **lib/** - Librerías externas
• **middlewares/** - Middleware de comunicación
• **models/** - Modelos de datos
• **package/** - Gestión de paquetes
• **pages/** - Páginas y routing
• **public/** - Assets públicos
• **scripts/** - Scripts de automatización
• **services/** - Servicios backend
• **src/** - Código fuente principal
• **test/** - Testing y QA

**⚠️ Requisitos del sistema:**
• Node.js 18.x o superior
• npm 9.x o superior
• Python 3.11+
• Git

**💡 Consejos:**
• Si tienes problemas, ejecuta: `npm cache clean --force`
• Para desarrollo, usa: `npm run dev` en cada módulo
• Si algo falla, escribe **"Verificar"** para diagnosticar

**🚀 ¿Listo para comenzar?**
Escribe **"Instalar"** y me encargaré de todo automáticamente.
"""
        return response

def create_dependencies_command():
    """Crea una instancia del comando de dependencias"""
    return DependenciesCommand()

# Función para usar desde LucIA
def process_dependencies_command(user_input: str) -> str:
    """Función principal para procesar comandos de dependencias"""
    command = DependenciesCommand()
    return command.process_command(user_input) 