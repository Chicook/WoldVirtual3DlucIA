"""
Sistema de Parafraseo Mejorado para LucIA
Implementa el flujo: Deepseek (entrada) -> Gemini -> Deepseek (salida)
"""

import asyncio
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime

from config import config, APIType
from api_manager import APIManager, APIResponse
from memory import MemoryManager

logger = logging.getLogger(__name__)

@dataclass
class EnhancedParaphraseResult:
    """Resultado del parafraseo mejorado"""
    original_prompt: str
    paraphrased_prompt: str
    gemini_response: str
    final_response: str
    input_paraphrase_time: float
    gemini_time: float
    output_paraphrase_time: float
    total_time: float
    success: bool
    error_message: Optional[str] = None

class EnhancedParaphraser:
    """
    Sistema de parafraseo mejorado que implementa:
    1. Parafraseo de entrada con Deepseek
    2. Consulta a Gemini
    3. Parafraseo de salida con Deepseek
    """
    
    def __init__(self, memory_manager: MemoryManager):
        self.memory_manager = memory_manager
        self.api_manager = None
        
    async def __aenter__(self):
        """Context manager entry"""
        self.api_manager = APIManager(self.memory_manager)
        await self.api_manager.__aenter__()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        if self.api_manager:
            await self.api_manager.__aexit__(exc_type, exc_val, exc_tb)
            
    async def process_with_enhanced_paraphrasing(self, 
                                               prompt: str, 
                                               context: list = None) -> EnhancedParaphraseResult:
        """
        Procesa una consulta con el flujo de parafraseo mejorado
        
        Args:
            prompt: La consulta original del usuario
            context: Contexto de la conversación
            
        Returns:
            EnhancedParaphraseResult con todos los resultados del proceso
        """
        start_time = datetime.now()
        
        try:
            print("🔄 Iniciando flujo de parafraseo mejorado...")
            
            # PASO 1: Parafraseo de entrada con Deepseek
            print("📝 Paso 1: Parafraseando entrada con Deepseek...")
            input_paraphrase_start = datetime.now()
            
            paraphrased_prompt = await self._paraphrase_input_with_deepseek(prompt)
            input_paraphrase_time = (datetime.now() - input_paraphrase_start).total_seconds()
            
            if not paraphrased_prompt:
                paraphrased_prompt = prompt  # Fallback a prompt original
                print("⚠️ Fallback: usando prompt original")
            else:
                print(f"✅ Entrada parafraseada: {paraphrased_prompt[:100]}...")
            
            # PASO 2: Consulta a Gemini
            print("🤖 Paso 2: Consultando a Gemini...")
            gemini_start = datetime.now()
            
            gemini_response = await self._get_gemini_response(paraphrased_prompt, context)
            gemini_time = (datetime.now() - gemini_start).total_seconds()
            
            if not gemini_response:
                # Fallback a respuesta local
                gemini_response = self._generate_fallback_response(prompt)
                print("⚠️ Fallback: usando respuesta local")
            else:
                print(f"✅ Respuesta de Gemini obtenida en {gemini_time:.2f}s")
            
            # PASO 3: Parafraseo de salida con Deepseek
            print("✨ Paso 3: Mejorando respuesta con Deepseek...")
            output_paraphrase_start = datetime.now()
            
            final_response = await self._paraphrase_output_with_deepseek(gemini_response, prompt)
            output_paraphrase_time = (datetime.now() - output_paraphrase_start).total_seconds()
            
            if not final_response:
                final_response = gemini_response  # Fallback a respuesta de Gemini
                print("⚠️ Fallback: usando respuesta de Gemini")
            else:
                print(f"✅ Respuesta final mejorada en {output_paraphrase_time:.2f}s")
            
            total_time = (datetime.now() - start_time).total_seconds()
            
            print(f"🎉 Proceso completado en {total_time:.2f}s total")
            
            return EnhancedParaphraseResult(
                original_prompt=prompt,
                paraphrased_prompt=paraphrased_prompt,
                gemini_response=gemini_response,
                final_response=final_response,
                input_paraphrase_time=input_paraphrase_time,
                gemini_time=gemini_time,
                output_paraphrase_time=output_paraphrase_time,
                total_time=total_time,
                success=True
            )
            
        except Exception as e:
            total_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"Error en parafraseo mejorado: {e}")
            
            return EnhancedParaphraseResult(
                original_prompt=prompt,
                paraphrased_prompt=prompt,
                gemini_response="",
                final_response=self._generate_fallback_response(prompt),
                input_paraphrase_time=0.0,
                gemini_time=0.0,
                output_paraphrase_time=0.0,
                total_time=total_time,
                success=False,
                error_message=str(e)
            )
    
    async def _paraphrase_input_with_deepseek(self, prompt: str) -> Optional[str]:
        """
        Parafrasea la entrada del usuario usando Deepseek
        para mejorar la claridad y precisión de la consulta
        """
        try:
            # Obtener configuración de Deepseek
            deepseek_config = config.get_api_by_name("deepseek_chat")
            if not deepseek_config or not deepseek_config.enabled:
                return None
                
            # Crear prompt de parafraseo
            paraphrase_prompt = f"""
Eres un experto en mejorar y clarificar consultas. Tu tarea es parafrasear la siguiente pregunta del usuario para que sea más clara, precisa y fácil de entender, manteniendo exactamente el mismo significado.

Pregunta original: "{prompt}"

Por favor, parafrasea esta pregunta para que sea más clara y precisa. Responde SOLO con la pregunta parafraseada, sin explicaciones adicionales.
"""
            
            # Llamar a Deepseek
            response = await self.api_manager._call_deepseek(deepseek_config, paraphrase_prompt)
            
            if response and response.success:
                return response.content.strip()
            else:
                logger.warning(f"Error en parafraseo de entrada: {response.error_message if response else 'Sin respuesta'}")
                return None
                
        except Exception as e:
            logger.error(f"Error en parafraseo de entrada: {e}")
            return None
    
    async def _get_gemini_response(self, prompt: str, context: list = None) -> Optional[str]:
        """
        Obtiene respuesta de Gemini usando el prompt parafraseado
        """
        try:
            # Obtener configuración de Gemini
            gemini_config = config.get_api_by_name("gemini_pro")
            if not gemini_config or not gemini_config.enabled:
                return None
                
            # Llamar a Gemini
            response = await self.api_manager._call_gemini(gemini_config, prompt, context)
            
            if response and response.success:
                return response.content
            else:
                logger.warning(f"Error en respuesta de Gemini: {response.error_message if response else 'Sin respuesta'}")
                return None
                
        except Exception as e:
            logger.error(f"Error obteniendo respuesta de Gemini: {e}")
            return None
    
    async def _paraphrase_output_with_deepseek(self, response: str, original_prompt: str) -> Optional[str]:
        """
        Mejora la respuesta de Gemini usando Deepseek
        para corregir errores y hacer la respuesta más natural
        """
        try:
            # Obtener configuración de Deepseek
            deepseek_config = config.get_api_by_name("deepseek_chat")
            if not deepseek_config or not deepseek_config.enabled:
                return None
                
            # Crear prompt de mejora
            improvement_prompt = f"""
Eres un experto en mejorar respuestas. Tu tarea es mejorar la siguiente respuesta para que sea más clara, natural y libre de errores, manteniendo la información original pero haciéndola más fácil de entender.

Pregunta original: "{original_prompt}"
Respuesta a mejorar: "{response}"

Por favor, mejora esta respuesta para que sea más clara, natural y precisa. Corrige cualquier error gramatical o de redacción. Responde SOLO con la respuesta mejorada, sin explicaciones adicionales.
"""
            
            # Llamar a Deepseek
            api_response = await self.api_manager._call_deepseek(deepseek_config, improvement_prompt)
            
            if api_response and api_response.success:
                return api_response.content.strip()
            else:
                logger.warning(f"Error en parafraseo de salida: {api_response.error_message if api_response else 'Sin respuesta'}")
                return None
                
        except Exception as e:
            logger.error(f"Error en parafraseo de salida: {e}")
            return None
    
    def _generate_fallback_response(self, prompt: str) -> str:
        """
        Genera una respuesta de fallback cuando las APIs fallan
        """
        # Respuestas específicas para el metaverso
        metaverse_responses = {
            "metaverso": "🌐 El metaverso es un espacio virtual 3D donde puedes interactuar, crear y explorar nuevos mundos digitales.",
            "avatar": "👤 Los avatares son tu representación digital en el metaverso. Puedes personalizarlos completamente.",
            "cripto": "₿ Las criptomonedas son la base económica del metaverso, permitiendo transacciones seguras y descentralizadas.",
            "nft": "🖼️ Los NFTs son activos digitales únicos que puedes poseer, intercambiar y usar en el metaverso.",
            "virtual": "🕶️ La realidad virtual te permite sumergirte completamente en experiencias digitales inmersivas.",
            "3d": "🎨 Los mundos 3D del metaverso ofrecen experiencias visuales y espaciales únicas.",
            "juego": "🎮 El metaverso combina gaming, socialización y economía digital en una experiencia completa.",
            "social": "👥 Conecta con personas de todo el mundo en espacios virtuales compartidos.",
            "crear": "🛠️ Construye y diseña tu propio espacio en el metaverso con herramientas creativas.",
            "explorar": "🗺️ Descubre nuevos mundos, experiencias y comunidades en el metaverso."
        }
        
        # Buscar palabras clave en el prompt
        prompt_lower = prompt.lower()
        for keyword, response in metaverse_responses.items():
            if keyword in prompt_lower:
                return response
        
        # Respuesta genérica
        return f"🌟 En el metaverso {config.platform.platform_name}, puedes explorar, crear y conectar en un mundo virtual 3D. ¿Te gustaría saber más sobre algún aspecto específico?"

# Función de conveniencia para usar el parafraseo mejorado
async def process_with_enhanced_paraphrasing(prompt: str, 
                                           context: list = None,
                                           memory_manager: MemoryManager = None) -> EnhancedParaphraseResult:
    """
    Función de conveniencia para usar el parafraseo mejorado
    
    Args:
        prompt: La consulta original del usuario
        context: Contexto de la conversación
        memory_manager: Gestor de memoria (opcional)
        
    Returns:
        EnhancedParaphraseResult con todos los resultados
    """
    if memory_manager is None:
        memory_manager = MemoryManager()
        
    async with EnhancedParaphraser(memory_manager) as enhanced_paraphraser:
        return await enhanced_paraphraser.process_with_enhanced_paraphrasing(prompt, context) 