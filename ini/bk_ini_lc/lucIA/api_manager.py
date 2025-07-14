"""
Gestor de APIs para LucIA - IA de la Plataforma Metaverso
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
from dataclasses import dataclass
from config import config, APIType, APIConfig
from memory import MemoryManager

logger = logging.getLogger(__name__)

@dataclass
class APIResponse:
    """Respuesta de una API"""
    content: str
    source_api: str
    confidence: float
    processing_time: float
    cost: float
    success: bool
    error_message: Optional[str] = None

class APIManager:
    """Gestor de APIs con rotación automática"""
    
    def __init__(self, memory_manager: MemoryManager):
        self.memory_manager = memory_manager
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        if self.session:
            await self.session.close()
            
    async def get_response(self, prompt: str, context: List[str] = None) -> Optional[APIResponse]:
        """
        Obtiene respuesta de las APIs disponibles con rotación.
        Siempre intenta primero el motor de mayor prioridad (por ejemplo, Gemini),
        y pasa al siguiente si hay error o cuota agotada.
        Para añadir un nuevo motor, solo hay que:
        1. Añadir la clave y modelo en config.py (self.add_api)
        2. Implementar el método _call_nuevomotor
        3. Añadir el tipo a APIType si es necesario
        4. Ajustar la prioridad en config.py
        """
        enabled_apis = config.get_enabled_apis()
        if not enabled_apis:
            logger.warning("No hay APIs habilitadas")
            return None
        # Intentar cada API en orden de prioridad
        for api_config in enabled_apis:
            if not self.memory_manager.can_use_api(api_config.name, api_config.daily_limit):
                logger.info(f"API {api_config.name} agotada para hoy")
                continue
            try:
                response = await self._call_api(api_config, prompt, context)
                if response and response.success:
                    # Actualizar uso de API
                    self.memory_manager.update_api_usage(api_config.name, response.cost)
                    logger.info(f"Respuesta obtenida de {api_config.name}")
                    return response
                else:
                    logger.warning(f"API {api_config.name} falló: {response.error_message if response else 'Sin respuesta'}")
            except Exception as e:
                logger.error(f"Error en API {api_config.name}: {e}")
                continue
        logger.warning("Todas las APIs agotadas o con error")
        return None
        
    async def _call_api(self, api_config: APIConfig, prompt: str, context: List[str] = None) -> Optional[APIResponse]:
        """Llama a una API específica"""
        start_time = datetime.now()
        
        try:
            if api_config.api_type == APIType.OPENAI:
                return await self._call_openai(api_config, prompt, context)
            elif api_config.api_type == APIType.ANTHROPIC:
                return await self._call_anthropic(api_config, prompt, context)
            elif api_config.api_type == APIType.GEMINI:
                return await self._call_gemini(api_config, prompt, context)
            elif api_config.api_type == APIType.HUGGINGFACE:
                return await self._call_huggingface(api_config, prompt, context)
            elif api_config.api_type == APIType.DEEPSEEK:
                return await self._call_deepseek(api_config, prompt, context)
            elif api_config.api_type == APIType.LOCAL:
                return await self._call_local(api_config, prompt, context)
            else:
                logger.error(f"Tipo de API no soportado: {api_config.api_type}")
                return None
                
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            return APIResponse(
                content="",
                source_api=api_config.name,
                confidence=0.0,
                processing_time=processing_time,
                cost=0.0,
                success=False,
                error_message=str(e)
            )
            
    async def _call_openai(self, api_config: APIConfig, prompt: str, context: List[str] = None) -> APIResponse:
        """Llama a OpenAI API"""
        start_time = datetime.now()
        
        headers = {
            "Authorization": f"Bearer {api_config.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {"role": "system", "content": f"Eres {config.platform.ai_name}, un asistente inteligente para la plataforma {config.platform.platform_name}."}
        ]
        
        if context:
            for ctx in context[-5:]:
                messages.append({"role": "user", "content": ctx})
                
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": api_config.model,
            "messages": messages,
            "max_tokens": api_config.max_tokens,
            "temperature": api_config.temperature
        }
        
        async with self.session.post(
            api_config.endpoint,
            headers=headers,
            json=data,
            timeout=aiohttp.ClientTimeout(total=api_config.response_timeout)
        ) as response:
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            if response.status == 200:
                result = await response.json()
                content = result['choices'][0]['message']['content']
                cost = self._calculate_openai_cost(result, api_config.model)
                
                return APIResponse(
                    content=content,
                    source_api=api_config.name,
                    confidence=0.9,
                    processing_time=processing_time,
                    cost=cost,
                    success=True
                )
            else:
                error_text = await response.text()
                return APIResponse(
                    content="",
                    source_api=api_config.name,
                    confidence=0.0,
                    processing_time=processing_time,
                    cost=0.0,
                    success=False,
                    error_message=f"HTTP {response.status}: {error_text}"
                )
                
    async def _call_anthropic(self, api_config: APIConfig, prompt: str, context: List[str] = None) -> APIResponse:
        """Llama a Anthropic API"""
        start_time = datetime.now()
        
        headers = {
            "x-api-key": api_config.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        # Preparar contexto
        full_prompt = f"Eres {config.platform.ai_name}, un asistente inteligente para la plataforma {config.platform.platform_name}.\n"
        if context:
            full_prompt += "Contexto de conversación anterior:\n" + "\n".join(context[-3:]) + "\n\n"
        full_prompt += f"Responde a: {prompt}"
        
        data = {
            "model": api_config.model,
            "max_tokens": api_config.max_tokens,
            "messages": [{"role": "user", "content": full_prompt}]
        }
        
        async with self.session.post(
            api_config.endpoint,
            headers=headers,
            json=data,
            timeout=aiohttp.ClientTimeout(total=api_config.response_timeout)
        ) as response:
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            if response.status == 200:
                result = await response.json()
                content = result['content'][0]['text']
                cost = self._calculate_anthropic_cost(result, api_config.model)
                
                return APIResponse(
                    content=content,
                    source_api=api_config.name,
                    confidence=0.9,
                    processing_time=processing_time,
                    cost=cost,
                    success=True
                )
            else:
                error_text = await response.text()
                return APIResponse(
                    content="",
                    source_api=api_config.name,
                    confidence=0.0,
                    processing_time=processing_time,
                    cost=0.0,
                    success=False,
                    error_message=f"HTTP {response.status}: {error_text}"
                )
                
    async def _call_gemini(self, api_config: APIConfig, prompt: str, context: List[str] = None) -> APIResponse:
        """Llama a Google Gemini API"""
        start_time = datetime.now()
        
        url = f"{api_config.endpoint}?key={api_config.api_key}"
        
        # Preparar contexto con instrucciones claras
        system_prompt = f"""Eres {config.platform.ai_name}, una IA especializada en el metaverso y desarrollo 3D.

INSTRUCCIONES IMPORTANTES:
- Eres una IA que utiliza la API de Google Gemini (modelo de lenguaje de Google)
- NO confundas esto con Gemini (exchange de criptomonedas)
- Responde con precisión y claridad sobre el metaverso, Three.js, desarrollo 3D y la plataforma {config.platform.platform_name}
- Mantén un tono profesional pero amigable
- Si no estás seguro de algo, dilo claramente
- Usa emojis apropiados para hacer las respuestas más visuales

CONTEXTO DE LA PLATAFORMA:
- Plataforma: {config.platform.platform_name}
- Especialización: Metaverso 3D, avatares, criptomonedas, NFTs
- Tecnologías: Three.js, WebGL, blockchain, realidad virtual

Responde de manera clara y precisa a la siguiente pregunta:"""

        full_prompt = system_prompt
        
        if context:
            full_prompt += "\n\nContexto de conversación anterior:\n" + "\n".join(context[-3:]) + "\n\n"
        
        full_prompt += f"Pregunta del usuario: {prompt}"
        
        data = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": api_config.temperature,
                "maxOutputTokens": api_config.max_tokens,
                "topP": 0.8,
                "topK": 40
            }
        }
        
        async with self.session.post(
            url,
            json=data,
            timeout=aiohttp.ClientTimeout(total=api_config.response_timeout)
        ) as response:
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            if response.status == 200:
                result = await response.json()
                content = result['candidates'][0]['content']['parts'][0]['text']
                cost = self._calculate_gemini_cost(result, api_config.model)
                
                return APIResponse(
                    content=content,
                    source_api=api_config.name,
                    confidence=0.9,
                    processing_time=processing_time,
                    cost=cost,
                    success=True
                )
            else:
                error_text = await response.text()
                return APIResponse(
                    content="",
                    source_api=api_config.name,
                    confidence=0.0,
                    processing_time=processing_time,
                    cost=0.0,
                    success=False,
                    error_message=f"HTTP {response.status}: {error_text}"
                )
                
    async def _call_huggingface(self, api_config: APIConfig, prompt: str, context: List[str] = None) -> APIResponse:
        """Llama a HuggingFace API (gratuita)"""
        start_time = datetime.now()
        
        headers = {
            "Authorization": f"Bearer {api_config.api_key}",
            "Content-Type": "application/json"
        }
        
        # Preparar prompt para HuggingFace
        full_prompt = f"Usuario: {prompt}\n{config.platform.ai_name}:"
        
        data = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": min(api_config.max_tokens, 500),  # Límite para HuggingFace
                "temperature": api_config.temperature,
                "do_sample": True
            }
        }
        
        url = f"{api_config.endpoint}{api_config.model}"
        
        async with self.session.post(
            url,
            headers=headers,
            json=data,
            timeout=aiohttp.ClientTimeout(total=api_config.response_timeout)
        ) as response:
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            if response.status == 200:
                result = await response.json()
                content = result[0]['generated_text']
                # Extraer solo la respuesta de la IA
                if f"{config.platform.ai_name}:" in content:
                    content = content.split(f"{config.platform.ai_name}:")[-1].strip()
                
                return APIResponse(
                    content=content,
                    source_api=api_config.name,
                    confidence=0.7,  # Menor confianza para API gratuita
                    processing_time=processing_time,
                    cost=0.0,  # Gratuita
                    success=True
                )
            else:
                error_text = await response.text()
                return APIResponse(
                    content="",
                    source_api=api_config.name,
                    confidence=0.0,
                    processing_time=processing_time,
                    cost=0.0,
                    success=False,
                    error_message=f"HTTP {response.status}: {error_text}"
                )
                
    async def _call_deepseek(self, api_config: APIConfig, prompt: str, context: List[str] = None) -> APIResponse:
        """Llama a Deepseek API"""
        start_time = datetime.now()
        
        headers = {
            "Authorization": f"Bearer {api_config.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {"role": "system", "content": f"Eres {config.platform.ai_name}, un asistente inteligente para la plataforma {config.platform.platform_name}."}
        ]
        
        if context:
            for ctx in context[-5:]:
                messages.append({"role": "user", "content": ctx})
                
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": api_config.model,
            "messages": messages,
            "max_tokens": api_config.max_tokens,
            "temperature": api_config.temperature
        }
        
        async with self.session.post(
            f"{api_config.endpoint}/chat/completions",
            headers=headers,
            json=data,
            timeout=aiohttp.ClientTimeout(total=api_config.response_timeout)
        ) as response:
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            if response.status == 200:
                result = await response.json()
                content = result['choices'][0]['message']['content']
                # Deepseek tiene costos variables, estimamos 0.0 por ahora
                cost = 0.0
                
                return APIResponse(
                    content=content,
                    source_api=api_config.name,
                    confidence=0.9,
                    processing_time=processing_time,
                    cost=cost,
                    success=True
                )
            else:
                error_text = await response.text()
                return APIResponse(
                    content="",
                    source_api=api_config.name,
                    confidence=0.0,
                    processing_time=processing_time,
                    cost=0.0,
                    success=False,
                    error_message=f"HTTP {response.status}: {error_text}"
                )
                
    async def _call_local(self, api_config: APIConfig, prompt: str, context: List[str] = None) -> APIResponse:
        """Genera respuesta local (fallback)"""
        start_time = datetime.now()
        
        # Buscar en memoria primero
        memory_entry = self.memory_manager.find_similar_memory(prompt)
        
        if memory_entry:
            processing_time = (datetime.now() - start_time).total_seconds()
            return APIResponse(
                content=memory_entry.paraphrased_response,
                source_api=api_config.name,
                confidence=memory_entry.confidence,
                processing_time=processing_time,
                cost=0.0,
                success=True
            )
        
        # Generar respuesta local básica
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Respuesta local inteligente basada en palabras clave
        keywords = self._extract_keywords(prompt)
        local_response = self._generate_local_response(keywords)
        
        return APIResponse(
            content=local_response,
            source_api=api_config.name,
            confidence=0.5,
            processing_time=processing_time,
            cost=0.0,
            success=True
        )
        
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrae palabras clave del texto"""
        import re
        # Palabras comunes a ignorar
        stop_words = {
            "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", "da", "su", "por", "son", 
            "con", "para", "al", "una", "me", "tu", "como", "qué", "cómo", "dónde", "cuándo", "por", "qué", "muy", 
            "más", "pero", "si", "yo", "él", "ella", "nosotros", "vosotros", "ellos", "ellas", "este", "esta", "estos", 
            "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "aquellos", "aquellas", "ser", "estar", "tener", 
            "hacer", "decir", "poder", "ir", "ver", "dar", "saber", "querer", "llegar", "pasar", "deber", "poner", 
            "parecer", "quedar", "creer", "hablar", "llevar", "dejar", "seguir", "encontrar", "llamar", "venir", 
            "pensar", "salir", "volver", "tomar", "conocer", "vivir", "sentir", "tratar", "mirar", "contar", "empezar", 
            "esperar", "buscar", "existir", "entrar", "trabajar", "escribir", "perder", "producir", "ocurrir", "entender", 
            "pedir", "recibir", "recordar", "terminar", "permitir", "aparecer", "conseguir", "comenzar", "servir", 
            "sacar", "necesitar", "mantener", "resultar", "leer", "caer", "cambiar", "presentar", "crear", "abrir", 
            "considerar", "oír", "puede", "podría", "debería", "haría", "sería", "estaría", "tendría", "vendría"
        }
        
        # Limpiar texto
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text.split()
        
        # Filtrar palabras
        keywords = []
        for word in words:
            if (len(word) > 2 and 
                word not in stop_words and 
                not word.isdigit() and 
                word.isalpha()):
                keywords.append(word)
        
        return list(dict.fromkeys(keywords))
        
    def _generate_local_response(self, keywords: List[str]) -> str:
        """Genera respuesta local basada en palabras clave"""
        if not keywords:
            return "🤔 Hmm, necesito más información para ayudarte mejor."
            
        # Respuestas específicas para la plataforma metaverso
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
        
        # Buscar coincidencias
        for keyword in keywords:
            if keyword in metaverse_responses:
                return metaverse_responses[keyword]
                
        # Respuesta genérica para la plataforma
        return f"🌟 En el metaverso {config.platform.platform_name}, puedes explorar, crear y conectar en un mundo virtual 3D. ¿Te gustaría saber más sobre algún aspecto específico?"
        
    def _calculate_openai_cost(self, result: Dict, model: str) -> float:
        """Calcula el costo de una llamada a OpenAI"""
        # Costos aproximados por 1K tokens (pueden variar)
        costs = {
            "gpt-3.5-turbo": 0.002,
            "gpt-4": 0.03,
            "gpt-4-turbo": 0.01
        }
        
        if "usage" in result:
            total_tokens = result["usage"]["total_tokens"]
            cost_per_1k = costs.get(model, 0.002)
            return (total_tokens / 1000) * cost_per_1k
            
        return 0.0
        
    def _calculate_anthropic_cost(self, result: Dict, model: str) -> float:
        """Calcula el costo de una llamada a Anthropic"""
        # Costos aproximados por 1K tokens
        costs = {
            "claude-3-sonnet-20240229": 0.015,
            "claude-3-opus-20240229": 0.075,
            "claude-3-haiku-20240307": 0.0025
        }
        
        if "usage" in result:
            total_tokens = result["usage"]["input_tokens"] + result["usage"]["output_tokens"]
            cost_per_1k = costs.get(model, 0.015)
            return (total_tokens / 1000) * cost_per_1k
            
        return 0.0
        
    def _calculate_gemini_cost(self, result: Dict, model: str) -> float:
        """Calcula el costo de una llamada a Gemini"""
        # Gemini Pro es gratuito hasta ciertos límites
        return 0.0
        
    def get_api_status(self) -> Dict[str, Dict]:
        """Obtiene el estado de todas las APIs"""
        status = {}
        
        for api_name, api_config in config.apis.items():
            usage_today = self.memory_manager.get_api_usage_today(api_name)
            can_use = self.memory_manager.can_use_api(api_name, api_config.daily_limit)
            
            status[api_name] = {
                "enabled": api_config.enabled,
                "usage_today": usage_today,
                "daily_limit": api_config.daily_limit,
                "remaining": api_config.daily_limit - usage_today,
                "can_use": can_use,
                "priority": api_config.priority,
                "cost_per_request": api_config.cost_per_request,
                "api_type": api_config.api_type.value
            }
            
        return status 