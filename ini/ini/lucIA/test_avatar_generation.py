#!/usr/bin/env python3
"""
Script de prueba para verificar la generación de avatares 3D femeninos
Especialmente para confirmar que LucIA use su conocimiento de Three.js
"""

import asyncio
import sys
import os
from pathlib import Path

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from lucia_core import LucIACore
from config import PersonalityType

async def test_avatar_generation():
    """Prueba la generación de avatares 3D femeninos"""
    
    print("🎭 INICIANDO PRUEBAS DE GENERACIÓN DE AVATARES 3D")
    print("=" * 60)
    
    # Inicializar LucIA
    lucia = LucIACore(
        name="LucIA",
        personality=PersonalityType.METAVERSE,
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    # Preguntas específicas sobre generación de avatares
    avatar_questions = [
        {
            "question": "Genera código Three.js para crear un avatar 3D femenino completo",
            "expected": "Código Three.js específico para avatar femenino",
            "category": "Generación de código"
        },
        {
            "question": "¿Cómo creo un avatar femenino en Three.js con geometrías básicas?",
            "expected": "Explicación técnica con código Three.js",
            "category": "Explicación técnica"
        },
        {
            "question": "Muéstrame el código para crear la cabeza de un avatar femenino en Three.js",
            "expected": "Código específico para cabeza femenina",
            "category": "Componente específico"
        },
        {
            "question": "Necesito crear un avatar 3D femenino con pelo largo, ¿cómo lo hago en Three.js?",
            "expected": "Código para avatar con pelo largo",
            "category": "Características específicas"
        },
        {
            "question": "¿Puedes generar un avatar femenino completo con animaciones en Three.js?",
            "expected": "Código completo con animaciones",
            "category": "Avatar completo con animaciones"
        }
    ]
    
    results = []
    
    for i, test in enumerate(avatar_questions, 1):
        print(f"\n🎨 PRUEBA {i}: {test['category']}")
        print(f"Pregunta: {test['question']}")
        print(f"Esperado: {test['expected']}")
        print("-" * 40)
        
        try:
            # Obtener respuesta de LucIA
            response = await lucia.chat(test['question'])
            
            print(f"Respuesta de LucIA:")
            print(f"📝 Original: {response.original_response[:200]}...")
            print(f"🔄 Parafraseada: {response.paraphrased_response[:200]}...")
            print(f"🎯 Confianza: {response.confidence:.2f}")
            print(f"⚡ Tiempo: {response.processing_time:.2f}s")
            print(f"🔗 API: {response.source_api}")
            
            # Evaluar la respuesta
            evaluation = evaluate_avatar_response(test['question'], response.paraphrased_response, test['expected'])
            results.append({
                "test": i,
                "category": test['category'],
                "question": test['question'],
                "response": response.paraphrased_response,
                "evaluation": evaluation,
                "confidence": response.confidence
            })
            
            print(f"✅ Evaluación: {evaluation['score']}/10 - {evaluation['comment']}")
            
            # Mostrar código si está presente
            if "THREE." in response.paraphrased_response or "new THREE" in response.paraphrased_response:
                print("🎯 ¡CÓDIGO THREE.JS DETECTADO!")
            else:
                print("⚠️ No se detectó código Three.js específico")
            
        except Exception as e:
            print(f"❌ Error en prueba {i}: {e}")
            results.append({
                "test": i,
                "category": test['category'],
                "question": test['question'],
                "response": f"Error: {e}",
                "evaluation": {"score": 0, "comment": "Error en la prueba"},
                "confidence": 0
            })
    
    # Resumen de resultados
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS DE AVATARES")
    print("=" * 60)
    
    total_score = 0
    total_tests = len(results)
    code_detected = 0
    
    for result in results:
        score = result['evaluation']['score']
        total_score += score
        status = "✅" if score >= 7 else "⚠️" if score >= 5 else "❌"
        
        print(f"{status} Prueba {result['test']} ({result['category']}): {score}/10")
        print(f"   Pregunta: {result['question']}")
        
        # Verificar si contiene código Three.js
        if "THREE." in result['response'] or "new THREE" in result['response']:
            print(f"   🎯 CÓDIGO THREE.JS: ✅")
            code_detected += 1
        else:
            print(f"   🎯 CÓDIGO THREE.JS: ❌")
        
        print(f"   Evaluación: {result['evaluation']['comment']}")
        print()
    
    average_score = total_score / total_tests if total_tests > 0 else 0
    code_percentage = (code_detected / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"🎯 PUNTAJE PROMEDIO: {average_score:.1f}/10")
    print(f"🎨 CÓDIGO THREE.JS GENERADO: {code_detected}/{total_tests} ({code_percentage:.1f}%)")
    
    if average_score >= 8 and code_percentage >= 80:
        print("🌟 EXCELENTE: LucIA genera código Three.js correctamente")
    elif average_score >= 6 and code_percentage >= 60:
        print("👍 BUENO: LucIA genera código Three.js adecuadamente")
    elif average_score >= 4 and code_percentage >= 40:
        print("⚠️ REGULAR: LucIA necesita mejorar en generación de código")
    else:
        print("❌ DEFICIENTE: LucIA no está aplicando su conocimiento de Three.js")
    
    return results

def evaluate_avatar_response(question: str, response: str, expected: str) -> dict:
    """Evalúa la calidad de una respuesta sobre avatares"""
    
    # Convertir a minúsculas para comparación
    question_lower = question.lower()
    response_lower = response.lower()
    expected_lower = expected.lower()
    
    score = 10
    comments = []
    
    # Verificar presencia de código Three.js
    threejs_indicators = [
        "three.", "new three", "geometry", "material", "mesh", 
        "scene.add", "position.set", "rotation", "scale"
    ]
    
    code_present = any(indicator in response_lower for indicator in threejs_indicators)
    
    if not code_present:
        score -= 4
        comments.append("No contiene código Three.js")
    else:
        score += 2
        comments.append("Contiene código Three.js")
    
    # Verificar que sea específico para avatares femeninos
    if "femenino" in question_lower or "mujer" in question_lower:
        if "femenino" in response_lower or "mujer" in response_lower:
            score += 1
            comments.append("Menciona características femeninas")
        else:
            score -= 1
            comments.append("No especifica características femeninas")
    
    # Verificar que responda a la pregunta
    if "avatar" in question_lower and "avatar" not in response_lower:
        score -= 2
        comments.append("No menciona avatares")
    
    # Verificar que sea específico para Three.js
    if "three.js" in question_lower and "three" not in response_lower:
        score -= 3
        comments.append("No menciona Three.js")
    
    # Verificar longitud y detalle
    if len(response) < 100:
        score -= 2
        comments.append("Respuesta muy corta")
    
    if len(response) > 1000:
        score += 1
        comments.append("Respuesta detallada")
    
    # Verificar que no sea genérica
    generic_phrases = [
        "no puedo", "no es posible", "no tengo", "no puedo generar",
        "no puedo crear", "no puedo hacer", "no puedo proporcionar"
    ]
    
    if any(phrase in response_lower for phrase in generic_phrases):
        score -= 3
        comments.append("Respuesta genérica o evasiva")
    
    # Ajustar puntaje final
    score = max(0, min(10, score))
    
    if score >= 8:
        comment = "Excelente respuesta con código Three.js específico"
    elif score >= 6:
        comment = "Buena respuesta, código Three.js presente"
    elif score >= 4:
        comment = "Respuesta aceptable, código Three.js limitado"
    else:
        comment = "Respuesta deficiente, sin código Three.js específico"
    
    if comments:
        comment += f" ({', '.join(comments)})"
    
    return {
        "score": score,
        "comment": comment,
        "details": comments,
        "code_present": code_present
    }

async def main():
    """Función principal"""
    try:
        results = await test_avatar_generation()
        
        # Guardar resultados
        import json
        from datetime import datetime
        
        results_file = Path("test_results_avatar_generation.json")
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "results": results
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: {results_file}")
        
    except Exception as e:
        print(f"❌ Error en las pruebas: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main()) 