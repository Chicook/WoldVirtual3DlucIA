#!/usr/bin/env python3
"""
Script de prueba para verificar la precisión de LucIA
Especialmente para confirmar que no confunda Gemini API con el exchange de criptomonedas
"""

import asyncio
import sys
import os
from pathlib import Path

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from lucia_core import LucIACore
from config import PersonalityType

async def test_lucia_precision():
    """Prueba la precisión de LucIA con preguntas específicas"""
    
    print("🧪 INICIANDO PRUEBAS DE PRECISIÓN DE LUCIA")
    print("=" * 60)
    
    # Inicializar LucIA
    lucia = LucIACore(
        name="LucIA",
        personality=PersonalityType.METAVERSE,
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    # Preguntas de prueba específicas
    test_questions = [
        {
            "question": "¿Qué es la API de Gemini?",
            "expected": "API de Google para IA, no exchange de criptomonedas",
            "category": "Clarificación API"
        },
        {
            "question": "¿Puedes explicarme qué es Gemini?",
            "expected": "Distinguir entre API de Google y exchange de criptomonedas",
            "category": "Distinción de conceptos"
        },
        {
            "question": "¿Cómo funciona la API de Gemini de Google?",
            "expected": "Explicación técnica de la API de Google",
            "category": "Explicación técnica"
        },
        {
            "question": "¿Qué sabes sobre el exchange Gemini?",
            "expected": "Información sobre el exchange de criptomonedas",
            "category": "Información correcta"
        },
        {
            "question": "¿Estás conectada a Gemini?",
            "expected": "Clarificar que usa la API de Google Gemini",
            "category": "Clarificación de conexión"
        }
    ]
    
    results = []
    
    for i, test in enumerate(test_questions, 1):
        print(f"\n🔍 PRUEBA {i}: {test['category']}")
        print(f"Pregunta: {test['question']}")
        print(f"Esperado: {test['expected']}")
        print("-" * 40)
        
        try:
            # Obtener respuesta de LucIA
            response = await lucia.chat(test['question'])
            
            print(f"Respuesta de LucIA:")
            print(f"📝 Original: {response.original_response}")
            print(f"🔄 Parafraseada: {response.paraphrased_response}")
            print(f"🎯 Confianza: {response.confidence:.2f}")
            print(f"⚡ Tiempo: {response.processing_time:.2f}s")
            print(f"🔗 API: {response.source_api}")
            
            # Evaluar la respuesta
            evaluation = evaluate_response(test['question'], response.paraphrased_response, test['expected'])
            results.append({
                "test": i,
                "category": test['category'],
                "question": test['question'],
                "response": response.paraphrased_response,
                "evaluation": evaluation,
                "confidence": response.confidence
            })
            
            print(f"✅ Evaluación: {evaluation['score']}/10 - {evaluation['comment']}")
            
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
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    total_score = 0
    total_tests = len(results)
    
    for result in results:
        score = result['evaluation']['score']
        total_score += score
        status = "✅" if score >= 7 else "⚠️" if score >= 5 else "❌"
        
        print(f"{status} Prueba {result['test']} ({result['category']}): {score}/10")
        print(f"   Pregunta: {result['question']}")
        print(f"   Respuesta: {result['response'][:100]}...")
        print(f"   Evaluación: {result['evaluation']['comment']}")
        print()
    
    average_score = total_score / total_tests if total_tests > 0 else 0
    print(f"🎯 PUNTAJE PROMEDIO: {average_score:.1f}/10")
    
    if average_score >= 8:
        print("🌟 EXCELENTE: LucIA responde con alta precisión")
    elif average_score >= 6:
        print("👍 BUENO: LucIA responde adecuadamente")
    elif average_score >= 4:
        print("⚠️ REGULAR: LucIA necesita mejoras")
    else:
        print("❌ DEFICIENTE: LucIA necesita correcciones importantes")
    
    return results

def evaluate_response(question: str, response: str, expected: str) -> dict:
    """Evalúa la calidad de una respuesta"""
    
    # Convertir a minúsculas para comparación
    question_lower = question.lower()
    response_lower = response.lower()
    expected_lower = expected.lower()
    
    score = 10
    comments = []
    
    # Verificar confusión entre Gemini API y exchange
    if "gemini" in question_lower:
        if "api" in question_lower and "google" in question_lower:
            # Pregunta sobre API de Google
            if "exchange" in response_lower or "criptomonedas" in response_lower:
                score -= 5
                comments.append("Confunde API de Google con exchange")
            if "google" in response_lower or "api" in response_lower:
                score += 2
                comments.append("Menciona correctamente Google/API")
        elif "exchange" in question_lower or "criptomonedas" in question_lower:
            # Pregunta sobre exchange
            if "google" in response_lower and "api" in response_lower:
                score -= 3
                comments.append("Confunde exchange con API de Google")
    
    # Verificar claridad y precisión
    if len(response) < 20:
        score -= 2
        comments.append("Respuesta muy corta")
    
    if "no estoy seguro" in response_lower or "no sé" in response_lower:
        score -= 1
        comments.append("Expresa incertidumbre")
    
    # Verificar que responda a la pregunta
    if not any(word in response_lower for word in question_lower.split() if len(word) > 3):
        score -= 2
        comments.append("No responde directamente a la pregunta")
    
    # Verificar coherencia
    if "contradicción" in response_lower or "confuso" in response_lower:
        score -= 3
        comments.append("Respuesta confusa o contradictoria")
    
    # Ajustar puntaje final
    score = max(0, min(10, score))
    
    if score >= 8:
        comment = "Excelente respuesta, clara y precisa"
    elif score >= 6:
        comment = "Buena respuesta, algunas mejoras menores"
    elif score >= 4:
        comment = "Respuesta aceptable, necesita clarificación"
    else:
        comment = "Respuesta deficiente, confusa o incorrecta"
    
    if comments:
        comment += f" ({', '.join(comments)})"
    
    return {
        "score": score,
        "comment": comment,
        "details": comments
    }

async def main():
    """Función principal"""
    try:
        results = await test_lucia_precision()
        
        # Guardar resultados
        import json
        from datetime import datetime
        
        results_file = Path("test_results_precision.json")
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