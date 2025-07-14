# Mejora automática avanzada: Remover imports no usados: ['time', 'asdict', 'Tuple']; Remover funciones no usadas: ['get_context_for_response', 'add_message', '__init__', '_extract_technical_terms', 'load_context', 'save_context', 'add_context_entry', 'get_conversation_summary', 'get_relevant_context', '_update_context_from_message', '_detect_mood', '_detect_topic', 'create_session', '_cleanup_expired_context', '_rank_by_relevance', '_detect_technical_level', '_extract_user_preferences']
"""
Sistema de gestión de contexto inteligente para LucIA
Mantiene el contexto de conversación y mejora la coherencia
"""

import time
import json
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import deque
import re
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class ContextType(Enum):
    """Tipos de contexto"""
    CONVERSATION = "conversation"
    TOPIC = "topic"
    USER_PREFERENCE = "user_preference"
    TECHNICAL = "technical"
    EMOTIONAL = "emotional"

@dataclass
class ContextEntry:
    """Entrada de contexto"""
    type: ContextType
    content: str
    timestamp: datetime
    importance: float  # 0.0 a 1.0
    expires_at: Optional[datetime] = None
    metadata: Dict[str, Any] = None

@dataclass
class ConversationContext:
    """Contexto de una conversación"""
    session_id: str
    start_time: datetime
    last_activity: datetime
    topic: str
    mood: str
    technical_level: str
    context_entries: List[ContextEntry]
    conversation_history: deque
    user_preferences: Dict[str, Any]

class ContextManager:
    """Gestor de contexto inteligente"""
    
    def __init__(self, max_context_entries: int = 50, max_history: int = 20):
        """Función auto-documentada: __init__"""
        self.max_context_entries = max_context_entries
        self.max_history = max_history
        self.active_contexts: Dict[str, ConversationContext] = {}
        self.global_context: List[ContextEntry] = []
        
        # Configuración de expiración
        self.context_expiration = {
            ContextType.CONVERSATION: timedelta(hours=2),
            ContextType.TOPIC: timedelta(hours=6),
            ContextType.USER_PREFERENCE: timedelta(days=7),
            ContextType.TECHNICAL: timedelta(hours=4),
            ContextType.EMOTIONAL: timedelta(hours=1)
        }
        
        # Patrones para detectar temas
        self.topic_patterns = {
            "programación": [
                r"\b(código|programar|desarrollar|implementar|debug|error)\b",
                r"\b(python|javascript|java|c\+\+|html|css|sql)\b",
                r"\b(función|clase|variable|objeto|método)\b"
            ],
            "metaverso": [
                r"\b(metaverso|3d|virtual|avatar|escena|three\.js)\b",
                r"\b(mundo virtual|realidad virtual|inmersivo)\b",
                r"\b(blockchain|nft|crypto|token)\b"
            ],
            "diseño": [
                r"\b(diseño|ui|ux|interfaz|usuario|experiencia)\b",
                r"\b(creativo|artístico|visual|estético)\b",
                r"\b(color|tipografía|layout|wireframe)\b"
            ],
            "análisis": [
                r"\b(analizar|datos|métricas|estadísticas|reporte)\b",
                r"\b(performance|rendimiento|optimización|eficiencia)\b",
                r"\b(problema|solución|diagnóstico|evaluación)\b"
            ]
        }
        
        # Patrones para detectar estado emocional
        self.emotion_patterns = {
            "frustrado": [
                r"\b(frustrado|molesto|enojado|irritado|fastidiado)\b",
                r"\b(no funciona|error|problema|difícil|complicado)\b",
                r"\b(😤|😠|😡|🤬|😒)"
            ],
            "confundido": [
                r"\b(confundido|perdido|no entiendo|no sé|duda)\b",
                r"\b(complicado|difícil|complejo|no claro)\b",
                r"\b(🤔|😕|😟|😵|❓)"
            ],
            "entusiasmado": [
                r"\b(genial|increíble|fantástico|excelente|maravilloso)\b",
                r"\b(emocionado|entusiasmado|feliz|contento)\b",
                r"\b(😊|😄|🤩|🎉|✨)"
            ],
            "neutral": [
                r"\b(ok|bien|normal|regular|aceptable)\b",
                r"\b(gracias|por favor|saludos|hola)\b",
                r"\b(😐|🙂|👋|👍)"
            ]
        }
        
    def create_session(self, session_id: str, initial_message: str = "") -> ConversationContext:
        """Crea una nueva sesión de conversación"""
        topic = self._detect_topic(initial_message) if initial_message else "general"
        mood = self._detect_mood(initial_message) if initial_message else "neutral"
        technical_level = self._detect_technical_level(initial_message) if initial_message else "intermedio"
        
        context = ConversationContext(
            session_id=session_id,
            start_time=datetime.now(),
            last_activity=datetime.now(),
            topic=topic,
            mood=mood,
            technical_level=technical_level,
            context_entries=[],
            conversation_history=deque(maxlen=self.max_history),
            user_preferences={}
        )
        
        self.active_contexts[session_id] = context
        
        # Añadir contexto inicial
        self.add_context_entry(session_id, ContextType.CONVERSATION, 
                              f"Iniciando conversación sobre {topic}", 0.8)
        
        logger.info(f"Nueva sesión creada: {session_id} - Tema: {topic}")
        return context
    
    def add_message(self, session_id: str, message: str, is_user: bool = True) -> None:
        """Añade un mensaje al historial de conversación"""
        if session_id not in self.active_contexts:
            self.create_session(session_id, message)
        
        context = self.active_contexts[session_id]
        context.last_activity = datetime.now()
        
        # Añadir al historial
        context.conversation_history.append({
            "message": message,
            "is_user": is_user,
            "timestamp": datetime.now(),
            "topic": self._detect_topic(message),
            "mood": self._detect_mood(message)
        })
        
        # Actualizar contexto
        self._update_context_from_message(session_id, message, is_user)
        
        # Limpiar contexto expirado
        self._cleanup_expired_context(session_id)
    
    def add_context_entry(self, session_id: str, context_type: ContextType, 
                         content: str, importance: float, 
                         metadata: Dict[str, Any] = None) -> None:
        """Añade una entrada de contexto"""
        if session_id not in self.active_contexts:
            return
        
        context = self.active_contexts[session_id]
        
        # Calcular expiración
        expiration = datetime.now() + self.context_expiration.get(context_type, timedelta(hours=1))
        
        entry = ContextEntry(
            type=context_type,
            content=content,
            timestamp=datetime.now(),
            importance=importance,
            expires_at=expiration,
            metadata=metadata or {}
        )
        
        context.context_entries.append(entry)
        
        # Mantener límite de entradas
        if len(context.context_entries) > self.max_context_entries:
            # Eliminar la entrada menos importante
            context.context_entries.sort(key=lambda x: x.importance)
            context.context_entries.pop(0)
    
    def get_relevant_context(self, session_id: str, current_message: str = "", 
                           limit: int = 10) -> List[ContextEntry]:
        """Obtiene el contexto más relevante para el mensaje actual"""
        if session_id not in self.active_contexts:
            return []
        
        context = self.active_contexts[session_id]
        
        # Filtrar entradas expiradas
        valid_entries = [
            entry for entry in context.context_entries
            if not entry.expires_at or entry.expires_at > datetime.now()
        ]
        
        # Ordenar por relevancia
        if current_message:
            relevant_entries = self._rank_by_relevance(valid_entries, current_message)
        else:
            relevant_entries = sorted(valid_entries, 
                                    key=lambda x: (x.importance, x.timestamp), 
                                    reverse=True)
        
        return relevant_entries[:limit]
    
    def get_conversation_summary(self, session_id: str) -> Dict[str, Any]:
        """Obtiene un resumen de la conversación"""
        if session_id not in self.active_contexts:
            return {}
        
        context = self.active_contexts[session_id]
        
        # Analizar historial
        topics = {}
        moods = {}
        technical_terms = []
        
        for entry in context.conversation_history:
            # Contar temas
            topic = entry.get("topic", "general")
            topics[topic] = topics.get(topic, 0) + 1
            
            # Contar estados de ánimo
            mood = entry.get("mood", "neutral")
            moods[mood] = moods.get(mood, 0) + 1
            
            # Extraer términos técnicos
            if entry.get("is_user", True):
                technical_terms.extend(self._extract_technical_terms(entry["message"]))
        
        # Tema principal
        main_topic = max(topics.items(), key=lambda x: x[1])[0] if topics else "general"
        
        # Estado de ánimo predominante
        main_mood = max(moods.items(), key=lambda x: x[1])[0] if moods else "neutral"
        
        return {
            "session_id": session_id,
            "duration": (datetime.now() - context.start_time).total_seconds(),
            "message_count": len(context.conversation_history),
            "main_topic": main_topic,
            "main_mood": main_mood,
            "topics": topics,
            "moods": moods,
            "technical_terms": list(set(technical_terms)),
            "user_preferences": context.user_preferences
        }
    
    def _detect_topic(self, message: str) -> str:
        """Detecta el tema principal del mensaje"""
        message_lower = message.lower()
        
        for topic, patterns in self.topic_patterns.items():
            for pattern in patterns:
                if re.search(pattern, message_lower, re.IGNORECASE):
                    return topic
        
        return "general"
    
    def _detect_mood(self, message: str) -> str:
        """Detecta el estado de ánimo del mensaje"""
        message_lower = message.lower()
        
        for mood, patterns in self.emotion_patterns.items():
            for pattern in patterns:
                if re.search(pattern, message_lower, re.IGNORECASE):
                    return mood
        
        return "neutral"
    
    def _detect_technical_level(self, message: str) -> str:
        """Detecta el nivel técnico del mensaje"""
        technical_terms = self._extract_technical_terms(message)
        
        if len(technical_terms) > 5:
            return "avanzado"
        elif len(technical_terms) > 2:
            return "intermedio"
        else:
            return "básico"
    
    def _extract_technical_terms(self, message: str) -> List[str]:
        """Extrae términos técnicos del mensaje"""
        technical_patterns = [
            r'\b[A-Z]{2,}\b',  # Acrónimos
            r'\b\w+\.\w+\b',   # Nombres con puntos
            r'\b(function|class|method|variable|object)\b',
            r'\b(api|sdk|framework|library|database)\b',
            r'\b(algorithm|protocol|interface|architecture)\b'
        ]
        
        terms = []
        for pattern in technical_patterns:
            matches = re.findall(pattern, message, re.IGNORECASE)
            terms.extend(matches)
        
        return terms
    
    def _update_context_from_message(self, session_id: str, message: str, is_user: bool) -> None:
        """Actualiza el contexto basándose en el mensaje"""
        context = self.active_contexts[session_id]
        
        # Detectar tema
        topic = self._detect_topic(message)
        if topic != context.topic:
            context.topic = topic
            self.add_context_entry(session_id, ContextType.TOPIC, 
                                  f"Cambio de tema a: {topic}", 0.7)
        
        # Detectar estado de ánimo
        mood = self._detect_mood(message)
        if mood != context.mood:
            context.mood = mood
            self.add_context_entry(session_id, ContextType.EMOTIONAL, 
                                  f"Estado de ánimo: {mood}", 0.6)
        
        # Detectar preferencias del usuario
        if is_user:
            self._extract_user_preferences(session_id, message)
        
        # Detectar nivel técnico
        technical_level = self._detect_technical_level(message)
        if technical_level != context.technical_level:
            context.technical_level = technical_level
            self.add_context_entry(session_id, ContextType.TECHNICAL, 
                                  f"Nivel técnico: {technical_level}", 0.8)
    
    def _extract_user_preferences(self, session_id: str, message: str) -> None:
        """Extrae preferencias del usuario del mensaje"""
        context = self.active_contexts[session_id]
        
        # Detectar preferencias de comunicación
        if re.search(r'\b(corto|breve|conciso)\b', message, re.IGNORECASE):
            context.user_preferences["communication_style"] = "concise"
        elif re.search(r'\b(detallado|completo|exhaustivo)\b', message, re.IGNORECASE):
            context.user_preferences["communication_style"] = "detailed"
        
        # Detectar preferencias de formato
        if re.search(r'\b(código|ejemplo|implementación)\b', message, re.IGNORECASE):
            context.user_preferences["prefer_code_examples"] = True
        
        if re.search(r'\b(explicación|concepto|teoría)\b', message, re.IGNORECASE):
            context.user_preferences["prefer_explanations"] = True
    
    def _rank_by_relevance(self, entries: List[ContextEntry], message: str) -> List[ContextEntry]:
        """Ordena entradas por relevancia al mensaje actual"""
        message_lower = message.lower()
        
        def relevance_score(entry: ContextEntry) -> float:
            score = entry.importance
            
            # Bonus por coincidencia de palabras
            entry_words = set(re.findall(r'\b\w+\b', entry.content.lower()))
            message_words = set(re.findall(r'\b\w+\b', message_lower))
            common_words = entry_words.intersection(message_words)
            
            if common_words:
                score += len(common_words) * 0.1
            
            # Bonus por recencia
            age_hours = (datetime.now() - entry.timestamp).total_seconds() / 3600
            score += max(0, 1 - age_hours / 24) * 0.2
            
            return score
        
        return sorted(entries, key=relevance_score, reverse=True)
    
    def _cleanup_expired_context(self, session_id: str) -> None:
        """Limpia contexto expirado"""
        if session_id not in self.active_contexts:
            return
        
        context = self.active_contexts[session_id]
        current_time = datetime.now()
        
        # Eliminar entradas expiradas
        context.context_entries = [
            entry for entry in context.context_entries
            if not entry.expires_at or entry.expires_at > current_time
        ]
    
    def get_context_for_response(self, session_id: str, message: str) -> Dict[str, Any]:
        """Obtiene contexto optimizado para generar respuesta"""
        if session_id not in self.active_contexts:
            return {}
        
        context = self.active_contexts[session_id]
        relevant_entries = self.get_relevant_context(session_id, message, 5)
        
        return {
            "session_id": session_id,
            "topic": context.topic,
            "mood": context.mood,
            "technical_level": context.technical_level,
            "user_preferences": context.user_preferences,
            "relevant_context": [entry.content for entry in relevant_entries],
            "conversation_length": len(context.conversation_history),
            "session_duration": (datetime.now() - context.start_time).total_seconds()
        }
    
    def save_context(self, session_id: str, filepath: str) -> bool:
        """Guarda el contexto en un archivo"""
        try:
            if session_id not in self.active_contexts:
                return False
            
            context = self.active_contexts[session_id]
            
            # Convertir a formato serializable
            context_data = {
                "session_id": context.session_id,
                "start_time": context.start_time.isoformat(),
                "last_activity": context.last_activity.isoformat(),
                "topic": context.topic,
                "mood": context.mood,
                "technical_level": context.technical_level,
                "context_entries": [
                    {
                        "type": entry.type.value,
                        "content": entry.content,
                        "timestamp": entry.timestamp.isoformat(),
                        "importance": entry.importance,
                        "expires_at": entry.expires_at.isoformat() if entry.expires_at else None,
                        "metadata": entry.metadata
                    }
                    for entry in context.context_entries
                ],
                "conversation_history": list(context.conversation_history),
                "user_preferences": context.user_preferences
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(context_data, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            logger.error(f"Error guardando contexto: {e}")
            return False
    
    def load_context(self, filepath: str) -> bool:
        """Carga contexto desde un archivo"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                context_data = json.load(f)
            
            # Reconstruir contexto
            context = ConversationContext(
                session_id=context_data["session_id"],
                start_time=datetime.fromisoformat(context_data["start_time"]),
                last_activity=datetime.fromisoformat(context_data["last_activity"]),
                topic=context_data["topic"],
                mood=context_data["mood"],
                technical_level=context_data["technical_level"],
                context_entries=[],
                conversation_history=deque(context_data["conversation_history"], 
                                         maxlen=self.max_history),
                user_preferences=context_data["user_preferences"]
            )
            
            # Reconstruir entradas de contexto
            for entry_data in context_data["context_entries"]:
                entry = ContextEntry(
                    type=ContextType(entry_data["type"]),
                    content=entry_data["content"],
                    timestamp=datetime.fromisoformat(entry_data["timestamp"]),
                    importance=entry_data["importance"],
                    expires_at=datetime.fromisoformat(entry_data["expires_at"]) 
                              if entry_data["expires_at"] else None,
                    metadata=entry_data["metadata"]
                )
                context.context_entries.append(entry)
            
            self.active_contexts[context.session_id] = context
            return True
            
        except Exception as e:
            logger.error(f"Error cargando contexto: {e}")
            return False 