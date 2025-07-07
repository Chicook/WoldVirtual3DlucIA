#!/usr/bin/env python3
"""
Script de prueba para el sistema de parafraseo de código
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from paraphraser import Paraphraser, ParaphraseConfig, PersonalityType
from memory import MemoryManager
from lucia_core import LucIACore
import asyncio

async def test_code_paraphraser():
    """Prueba el sistema de parafraseo de código"""
    
    print("🧪 Probando sistema de parafraseo de código...")
    print("=" * 60)
    
    # Crear instancia del parafraseador
    paraphraser = Paraphraser(ParaphraseConfig(
        personality=PersonalityType.FRIENDLY,
        confidence_threshold=0.7
    ))
    
    # Códigos de prueba
    test_codes = {
        "python": '''
def get_data():
    data = []
    for i in range(10):
        data.append(i * 2)
    return data

class DataProcessor:
    def __init__(self):
        self.config = {}
    
    def process_items(self, items):
        result = []
        for item in items:
            if item > 0:
                result.append(item * 2)
        return result
''',
        "javascript": '''
function getData() {
    const data = [];
    for (let i = 0; i < 10; i++) {
        data.push(i * 2);
    }
    return data;
}

class DataProcessor {
    constructor() {
        this.config = {};
    }
    
    processItems(items) {
        const result = [];
        for (const item of items) {
            if (item > 0) {
                result.push(item * 2);
            }
        }
        return result;
    }
}
''',
        "mixed_response": '''
Aquí tienes una función para procesar datos:

```python
def get_data():
    data = []
    for i in range(10):
        data.append(i * 2)
    return data
```

Y también una clase en JavaScript:

```javascript
class DataProcessor {
    constructor() {
        this.config = {};
    }
    
    processItems(items) {
        const result = [];
        for (const item of items) {
            if (item > 0) {
                result.push(item * 2);
            }
        }
        return result;
    }
}
```

Esto te permitirá manejar los datos de manera eficiente.
'''
    }
    
    # Probar parafraseo directo de código
    print("1️⃣ Probando parafraseo directo de código Python:")
    print("-" * 40)
    original_python = test_codes["python"]
    print("Código original:")
    print(original_python)
    
    paraphrased_python = paraphraser.paraphrase_code(original_python, "python")
    print("\nCódigo parafraseado:")
    print(paraphrased_python)
    print("\n" + "=" * 60)
    
    # Probar parafraseo de código JavaScript
    print("2️⃣ Probando parafraseo directo de código JavaScript:")
    print("-" * 40)
    original_js = test_codes["javascript"]
    print("Código original:")
    print(original_js)
    
    paraphrased_js = paraphraser.paraphrase_code(original_js, "javascript")
    print("\nCódigo parafraseado:")
    print(paraphrased_js)
    print("\n" + "=" * 60)
    
    # Probar detección de código en respuestas mixtas
    print("3️⃣ Probando detección y parafraseo en respuestas mixtas:")
    print("-" * 40)
    mixed_response = test_codes["mixed_response"]
    print("Respuesta original:")
    print(mixed_response)
    
    # Crear memoria manager para probar la detección
    memory_manager = MemoryManager()
    
    # Simular entrada de memoria
    from datetime import datetime
    from memory import MemoryEntry
    
    memory_entry = MemoryEntry(
        id=None,
        original_prompt="¿Cómo puedo procesar datos?",
        original_response=mixed_response,
        paraphrased_response=mixed_response,
        source_api="gemini",
        timestamp=datetime.now(),
        confidence=0.9,
        keywords=["datos", "procesar", "función"],
        context="programación",
        usage_count=0,
        effectiveness_score=0.8
    )
    
    # Almacenar con parafraseo de código
    memory_manager.store_memory_entry(memory_entry, paraphraser)
    
    print("\nRespuesta con código parafraseado:")
    print(memory_entry.paraphrased_response)
    print("\n" + "=" * 60)
    
    # Probar generación de código desde memoria
    print("4️⃣ Probando generación de código desde memoria:")
    print("-" * 40)
    
    # Generar código para diferentes prompts
    prompts = [
        "Necesito un sistema de memoria",
        "Quiero hacer peticiones a una API",
        "Procesar una lista de datos"
    ]
    
    for prompt in prompts:
        print(f"\nPrompt: {prompt}")
        code_python = paraphraser.generate_code_from_memory(prompt, "python")
        print("Código Python generado:")
        print(code_python)
        
        code_js = paraphraser.generate_code_from_memory(prompt, "javascript")
        print("Código JavaScript generado:")
        print(code_js)
        print("-" * 30)
    
    print("\n" + "=" * 60)
    
    # Probar integración con LucIA
    print("5️⃣ Probando integración con LucIA:")
    print("-" * 40)
    
    lucia = LucIACore(
        name="LucIA",
        personality=PersonalityType.FRIENDLY,
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    # Simular una conversación con código
    test_prompt = "Muéstrame cómo crear una función para procesar datos en Python"
    
    print(f"Prompt: {test_prompt}")
    
    # Simular respuesta de API con código
    api_response = '''
Aquí tienes una función para procesar datos en Python:

```python
def process_data(data_list):
    result = []
    for item in data_list:
        if isinstance(item, (int, float)):
            result.append(item * 2)
        elif isinstance(item, str):
            result.append(item.upper())
    return result
```

Esta función procesa diferentes tipos de datos y los transforma según su tipo.
'''
    
    # Crear entrada de memoria con código
    memory_entry = MemoryEntry(
        id=None,
        original_prompt=test_prompt,
        original_response=api_response,
        paraphrased_response=api_response,
        source_api="gemini",
        timestamp=datetime.now(),
        confidence=0.95,
        keywords=["función", "procesar", "datos", "python"],
        context="programación",
        usage_count=0,
        effectiveness_score=0.9
    )
    
    # Almacenar con parafraseo de código
    lucia.memory_manager.store_memory_entry(memory_entry, lucia.paraphraser)
    
    print("Respuesta original con código:")
    print(memory_entry.original_response)
    
    print("\nRespuesta parafraseada con código:")
    print(memory_entry.paraphrased_response)
    
    print("\n✅ Pruebas completadas!")
    print("\n🎯 Beneficios del sistema de parafraseo de código:")
    print("   • Protección legal: No almacena código literal de APIs")
    print("   • Originalidad: Genera código con estructura diferente")
    print("   • Funcionalidad: Mantiene el mismo objetivo")
    print("   • Variedad: Ofrece múltiples formas de resolver el mismo problema")
    print("   • Seguridad: Evita posibles conflictos con proveedores de IA")

if __name__ == "__main__":
    asyncio.run(test_code_paraphraser()) 