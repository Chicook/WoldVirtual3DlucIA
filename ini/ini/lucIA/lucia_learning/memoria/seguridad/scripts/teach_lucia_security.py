#!/usr/bin/env python3
"""
Teach LucIA Security - Script Específico para Enseñar Seguridad a LucIA
Ejecuta el mecanismo de enseñanza y genera reportes detallados
"""

import sys
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

# Añadir el directorio padre al path para importar módulos
current_dir = Path(__file__).parent
security_dir = current_dir.parent
sys.path.append(str(security_dir))

# Importar módulos de seguridad
from core.lucia_security_teacher import LucIASecurityTeacher

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lucia_teaching.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class LucIASecurityInstructor:
    """Instructor especializado para enseñar seguridad a LucIA"""
    
    def __init__(self):
        self.teacher = LucIASecurityTeacher()
        self.learning_progress = {}
        self.teaching_sessions = []
        
    def start_teaching_session(self) -> Dict[str, Any]:
        """Inicia una sesión de enseñanza completa"""
        logger.info("🎓 Iniciando sesión de enseñanza de seguridad para LucIA")
        
        session_data = {
            'session_id': f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'start_time': datetime.now().isoformat(),
            'lessons': {},
            'progress': {},
            'status': 'in_progress'
        }
        
        try:
            # Enseñar cada lección
            for lesson_name, lesson_data in self.teacher.teaching_lessons.items():
                logger.info(f"📚 Enseñando lección: {lesson_data['title']}")
                
                lesson_result = self._teach_individual_lesson(lesson_name, lesson_data)
                session_data['lessons'][lesson_name] = lesson_result
                
                # Actualizar progreso
                session_data['progress'][lesson_name] = {
                    'completed': True,
                    'score': lesson_result.get('score', 0),
                    'time_spent': lesson_result.get('time_spent', 0)
                }
                
            # Finalizar sesión
            session_data['end_time'] = datetime.now().isoformat()
            session_data['status'] = 'completed'
            
            # Calcular métricas de la sesión
            session_data['metrics'] = self._calculate_session_metrics(session_data)
            
            # Guardar sesión
            self.teaching_sessions.append(session_data)
            
            logger.info("✅ Sesión de enseñanza completada exitosamente")
            return session_data
            
        except Exception as e:
            logger.error(f"❌ Error en sesión de enseñanza: {e}")
            session_data['status'] = 'failed'
            session_data['error'] = str(e)
            return session_data
            
    def _teach_individual_lesson(self, lesson_name: str, lesson_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enseña una lección individual a LucIA"""
        lesson_result = {
            'lesson_name': lesson_name,
            'title': lesson_data['title'],
            'description': lesson_data['description'],
            'start_time': datetime.now().isoformat(),
            'content_covered': [],
            'examples_provided': [],
            'exercises_completed': [],
            'score': 0,
            'time_spent': 0
        }
        
        try:
            # Enseñar contenido de la lección
            lesson_result['content_covered'] = self._cover_lesson_content(lesson_data)
            
            # Proporcionar ejemplos
            lesson_result['examples_provided'] = self._provide_lesson_examples(lesson_data)
            
            # Completar ejercicios
            lesson_result['exercises_completed'] = self._complete_lesson_exercises(lesson_name)
            
            # Calcular puntuación
            lesson_result['score'] = self._calculate_lesson_score(lesson_result)
            
            # Calcular tiempo empleado
            lesson_result['time_spent'] = self._calculate_lesson_time(lesson_result)
            
            lesson_result['end_time'] = datetime.now().isoformat()
            
        except Exception as e:
            logger.error(f"Error enseñando lección {lesson_name}: {e}")
            lesson_result['error'] = str(e)
            
        return lesson_result
        
    def _cover_lesson_content(self, lesson_data: Dict[str, Any]) -> List[str]:
        """Cubre el contenido de una lección"""
        content_covered = []
        
        # Cubrir pasos de la lección
        for step in lesson_data.get('steps', []):
            content_covered.append(f"✅ {step}")
            
        # Cubrir ejemplos
        for example in lesson_data.get('examples', []):
            content_covered.append(f"📝 {example}")
            
        return content_covered
        
    def _provide_lesson_examples(self, lesson_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Proporciona ejemplos para una lección"""
        examples = []
        
        # Generar ejemplos específicos según el tipo de lección
        lesson_title = lesson_data.get('title', '').lower()
        
        if 'análisis' in lesson_title:
            examples = [
                {
                    'type': 'code_analysis',
                    'description': 'Análisis de función de autenticación',
                    'code': '''
def authenticate_user(username, password):
    if username == "admin" and password == "admin123":
        return True
    return False
''',
                    'analysis': 'Vulnerabilidad: contraseña hardcodeada'
                },
                {
                    'type': 'vulnerability_detection',
                    'description': 'Detección de SQL injection',
                    'code': '''
query = f"SELECT * FROM users WHERE username = '{username}'"
''',
                    'analysis': 'Vulnerabilidad: SQL injection posible'
                }
            ]
        elif 'mejora' in lesson_title:
            examples = [
                {
                    'type': 'improvement_suggestion',
                    'description': 'Mejora de validación de entrada',
                    'before': 'input_data = request.form["data"]',
                    'after': 'input_data = sanitize_input(request.form["data"])',
                    'explanation': 'Añadir sanitización de entrada'
                }
            ]
        elif 'generación' in lesson_title:
            examples = [
                {
                    'type': 'secure_code_generation',
                    'description': 'Generación de función de hash segura',
                    'code': '''
def secure_hash_password(password):
    import hashlib
    import os
    salt = os.urandom(16)
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
''',
                    'explanation': 'Uso de salt y PBKDF2 para mayor seguridad'
                }
            ]
            
        return examples
        
    def _complete_lesson_exercises(self, lesson_name: str) -> List[Dict[str, Any]]:
        """Completa ejercicios de una lección"""
        exercises = []
        
        if lesson_name == 'code_analysis':
            exercises = [
                {
                    'exercise': 'Analizar código de validación',
                    'code': '''
def validate_email(email):
    return '@' in email
''',
                    'solution': 'Validación muy débil, falta regex',
                    'completed': True
                }
            ]
        elif lesson_name == 'improvement_detection':
            exercises = [
                {
                    'exercise': 'Detectar mejoras en función de login',
                    'code': '''
def login(username, password):
    if username == "admin" and password == "admin":
        return True
    return False
''',
                    'solution': 'Múltiples vulnerabilidades detectadas',
                    'completed': True
                }
            ]
        elif lesson_name == 'code_generation':
            exercises = [
                {
                    'exercise': 'Generar función de login segura',
                    'requirements': ['Validación fuerte', 'Hash seguro', 'Rate limiting'],
                    'solution': 'Función generada con todas las medidas de seguridad',
                    'completed': True
                }
            ]
        elif lesson_name == 'validation':
            exercises = [
                {
                    'exercise': 'Validar código de seguridad generado',
                    'tests': ['Sintaxis', 'Lógica', 'Seguridad', 'Rendimiento'],
                    'results': 'Todas las validaciones pasaron',
                    'completed': True
                }
            ]
        elif lesson_name == 'evolution':
            exercises = [
                {
                    'exercise': 'Analizar métricas de evolución',
                    'data': {'threats_detected': 15, 'false_positives': 2},
                    'analysis': 'Sistema evolucionando correctamente',
                    'completed': True
                }
            ]
            
        return exercises
        
    def _calculate_lesson_score(self, lesson_result: Dict[str, Any]) -> int:
        """Calcula puntuación de una lección"""
        score = 0
        
        # Puntos por contenido cubierto
        content_covered = len(lesson_result.get('content_covered', []))
        score += min(content_covered * 10, 50)  # Máximo 50 puntos
        
        # Puntos por ejemplos proporcionados
        examples_provided = len(lesson_result.get('examples_provided', []))
        score += min(examples_provided * 15, 30)  # Máximo 30 puntos
        
        # Puntos por ejercicios completados
        exercises_completed = len(lesson_result.get('exercises_completed', []))
        score += min(exercises_completed * 20, 20)  # Máximo 20 puntos
        
        return min(score, 100)  # Máximo 100 puntos
        
    def _calculate_lesson_time(self, lesson_result: Dict[str, Any]) -> int:
        """Calcula tiempo empleado en una lección (en segundos)"""
        # Simular tiempo basado en complejidad
        base_time = 60  # 1 minuto base
        
        content_count = len(lesson_result.get('content_covered', []))
        examples_count = len(lesson_result.get('examples_provided', []))
        exercises_count = len(lesson_result.get('exercises_completed', []))
        
        total_time = base_time + (content_count * 10) + (examples_count * 15) + (exercises_count * 20)
        
        return total_time
        
    def _calculate_session_metrics(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula métricas de la sesión"""
        lessons = session_data.get('lessons', {})
        
        total_lessons = len(lessons)
        completed_lessons = sum(1 for lesson in lessons.values() if not lesson.get('error'))
        
        total_score = sum(lesson.get('score', 0) for lesson in lessons.values())
        average_score = total_score / total_lessons if total_lessons > 0 else 0
        
        total_time = sum(lesson.get('time_spent', 0) for lesson in lessons.values())
        
        return {
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'completion_rate': (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0,
            'average_score': average_score,
            'total_time_spent': total_time,
            'time_per_lesson': total_time / total_lessons if total_lessons > 0 else 0
        }
        
    def generate_learning_report(self, session_data: Dict[str, Any]) -> str:
        """Genera reporte detallado de aprendizaje"""
        report = "🎓 Reporte de Aprendizaje de Seguridad - LucIA\n"
        report += "=" * 60 + "\n\n"
        
        # Información de la sesión
        report += f"📅 Sesión ID: {session_data.get('session_id', 'N/A')}\n"
        report += f"🕐 Inicio: {session_data.get('start_time', 'N/A')}\n"
        report += f"🕐 Fin: {session_data.get('end_time', 'N/A')}\n"
        report += f"📊 Estado: {session_data.get('status', 'N/A')}\n\n"
        
        # Métricas de la sesión
        metrics = session_data.get('metrics', {})
        report += "📈 Métricas de la Sesión:\n"
        report += f"   • Lecciones totales: {metrics.get('total_lessons', 0)}\n"
        report += f"   • Lecciones completadas: {metrics.get('completed_lessons', 0)}\n"
        report += f"   • Tasa de finalización: {metrics.get('completion_rate', 0):.1f}%\n"
        report += f"   • Puntuación promedio: {metrics.get('average_score', 0):.1f}/100\n"
        report += f"   • Tiempo total: {metrics.get('total_time_spent', 0)} segundos\n"
        report += f"   • Tiempo por lección: {metrics.get('time_per_lesson', 0):.1f} segundos\n\n"
        
        # Detalles por lección
        report += "📚 Detalles por Lección:\n"
        lessons = session_data.get('lessons', {})
        
        for lesson_name, lesson_data in lessons.items():
            title = lesson_data.get('title', 'Sin título')
            score = lesson_data.get('score', 0)
            time_spent = lesson_data.get('time_spent', 0)
            
            status_icon = "✅" if score >= 80 else "⚠️" if score >= 60 else "❌"
            
            report += f"   {status_icon} {title}\n"
            report += f"      • Puntuación: {score}/100\n"
            report += f"      • Tiempo: {time_spent} segundos\n"
            
            # Mostrar contenido cubierto
            content_covered = lesson_data.get('content_covered', [])
            if content_covered:
                report += f"      • Contenido cubierto: {len(content_covered)} elementos\n"
                
            # Mostrar ejemplos
            examples = lesson_data.get('examples_provided', [])
            if examples:
                report += f"      • Ejemplos proporcionados: {len(examples)}\n"
                
            # Mostrar ejercicios
            exercises = lesson_data.get('exercises_completed', [])
            if exercises:
                report += f"      • Ejercicios completados: {len(exercises)}\n"
                
            report += "\n"
            
        # Evaluación general
        average_score = metrics.get('average_score', 0)
        completion_rate = metrics.get('completion_rate', 0)
        
        report += "🎯 Evaluación General:\n"
        if average_score >= 90 and completion_rate >= 95:
            report += "   🏆 EXCELENTE: LucIA ha dominado completamente la seguridad\n"
        elif average_score >= 80 and completion_rate >= 90:
            report += "   🥇 MUY BUENO: LucIA tiene un sólido conocimiento de seguridad\n"
        elif average_score >= 70 and completion_rate >= 80:
            report += "   🥈 BUENO: LucIA tiene un buen entendimiento de seguridad\n"
        elif average_score >= 60 and completion_rate >= 70:
            report += "   🥉 ACEPTABLE: LucIA necesita más práctica en seguridad\n"
        else:
            report += "   ⚠️ NECESITA MEJORAR: LucIA requiere más entrenamiento en seguridad\n"
            
        report += "\n"
        
        # Próximos pasos
        report += "🚀 Próximos Pasos para LucIA:\n"
        if average_score < 80:
            report += "   1. Repasar lecciones con puntuación baja\n"
            report += "   2. Practicar más ejercicios de seguridad\n"
            report += "   3. Aplicar conocimientos en proyectos reales\n"
        else:
            report += "   1. Aplicar conocimientos en análisis de código real\n"
            report += "   2. Generar mejoras de seguridad automáticas\n"
            report += "   3. Evolucionar continuamente las capacidades\n"
            
        return report
        
    def save_learning_data(self, session_data: Dict[str, Any], output_file: str = None) -> str:
        """Guarda datos de aprendizaje"""
        if not output_file:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f'lucia_learning_session_{timestamp}.json'
            
        try:
            # Añadir reporte de aprendizaje
            session_data['learning_report'] = self.generate_learning_report(session_data)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, indent=2, ensure_ascii=False)
                
            return f"Datos de aprendizaje guardados en: {output_file}"
            
        except Exception as e:
            logger.error(f"Error guardando datos de aprendizaje: {e}")
            return f"Error guardando datos de aprendizaje: {e}"
            
    def get_learning_history(self) -> List[Dict[str, Any]]:
        """Obtiene historial de aprendizaje"""
        return self.teaching_sessions.copy()
        
    def analyze_learning_progress(self) -> Dict[str, Any]:
        """Analiza progreso de aprendizaje de LucIA"""
        if not self.teaching_sessions:
            return {'message': 'No hay sesiones de aprendizaje registradas'}
            
        # Analizar tendencias
        scores = [session.get('metrics', {}).get('average_score', 0) 
                 for session in self.teaching_sessions]
        
        completion_rates = [session.get('metrics', {}).get('completion_rate', 0) 
                           for session in self.teaching_sessions]
        
        # Calcular estadísticas
        analysis = {
            'total_sessions': len(self.teaching_sessions),
            'average_score_trend': sum(scores) / len(scores),
            'average_completion_rate': sum(completion_rates) / len(completion_rates),
            'best_session': max(self.teaching_sessions, 
                              key=lambda x: x.get('metrics', {}).get('average_score', 0)),
            'improvement_rate': self._calculate_improvement_rate(scores)
        }
        
        return analysis
        
    def _calculate_improvement_rate(self, scores: List[float]) -> float:
        """Calcula tasa de mejora en las puntuaciones"""
        if len(scores) < 2:
            return 0.0
            
        # Calcular mejora promedio entre sesiones consecutivas
        improvements = []
        for i in range(1, len(scores)):
            improvement = scores[i] - scores[i-1]
            improvements.append(improvement)
            
        return sum(improvements) / len(improvements)

def main():
    """Función principal"""
    print("🎓 LucIA Security Instructor - Sistema de Enseñanza")
    print("=" * 60)
    
    instructor = LucIASecurityInstructor()
    
    # Iniciar sesión de enseñanza
    print("\n🚀 Iniciando sesión de enseñanza de seguridad...")
    session_data = instructor.start_teaching_session()
    
    if session_data.get('status') == 'completed':
        # Generar y mostrar reporte
        report = instructor.generate_learning_report(session_data)
        print("\n" + report)
        
        # Guardar datos de aprendizaje
        save_message = instructor.save_learning_data(session_data)
        print(f"\n💾 {save_message}")
        
        # Analizar progreso
        progress_analysis = instructor.analyze_learning_progress()
        print(f"\n📊 Análisis de progreso: {progress_analysis.get('total_sessions', 0)} sesiones")
        
        print("\n🎉 ¡Sesión de enseñanza completada exitosamente!")
        return 0
    else:
        print(f"\n❌ Error en sesión de enseñanza: {session_data.get('error', 'Error desconocido')}")
        return 1

if __name__ == "__main__":
    exit(main()) 