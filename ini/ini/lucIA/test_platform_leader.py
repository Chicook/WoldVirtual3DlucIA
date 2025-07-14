#!/usr/bin/env python3
"""
Script de prueba para LucIA Platform Leader
Demuestra las capacidades de liderazgo técnico de LucIA
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from lucia_platform_leader import LucIAPlatformLeader, SystemType, TaskPriority, ProjectStatus
import asyncio
import json

async def test_platform_leadership():
    """Prueba las capacidades de liderazgo de LucIA"""
    
    print("🚀 Probando LucIA Platform Leader...")
    print("=" * 70)
    
    # Crear instancia del líder de plataforma
    leader = LucIAPlatformLeader()
    
    # ==================== 1. GESTIÓN DE PROYECTOS ====================
    print("\n📋 1. Gestión de Proyectos")
    print("-" * 40)
    
    # Crear proyectos estratégicos
    projects = {
        "avatar_system": leader.create_project(
            name="Sistema de Avatares 3D",
            description="Sistema completo de generación, personalización y gestión de avatares 3D",
            system_type=SystemType.THREE_D,
            priority=TaskPriority.HIGH,
            budget=75000
        ),
        "blockchain_integration": leader.create_project(
            name="Integración Blockchain",
            description="Sistema de contratos inteligentes para transacciones del metaverso",
            system_type=SystemType.BLOCKCHAIN,
            priority=TaskPriority.CRITICAL,
            budget=100000
        ),
        "ai_optimization": leader.create_project(
            name="Optimización de IA",
            description="Reducción de costes de APIs externas mediante IA local",
            system_type=SystemType.AI,
            priority=TaskPriority.HIGH,
            budget=50000
        ),
        "security_framework": leader.create_project(
            name="Framework de Seguridad",
            description="Sistema de seguridad integral para la plataforma",
            system_type=SystemType.SECURITY,
            priority=TaskPriority.CRITICAL,
            budget=80000
        )
    }
    
    print(f"✅ Proyectos creados: {len(projects)}")
    for name, project in projects.items():
        print(f"   • {project.name} ({project.system_type.value}) - ${project.budget:,.0f}")
    
    # ==================== 2. GESTIÓN DE TAREAS ====================
    print("\n✅ 2. Gestión de Tareas")
    print("-" * 40)
    
    # Crear tareas específicas para cada proyecto
    tasks = {}
    
    # Tareas para Sistema de Avatares
    avatar_tasks = [
        ("Generador de Avatares", "Sistema de generación automática de avatares 3D", 40),
        ("Editor de Personalización", "Interfaz para personalizar avatares", 60),
        ("Sistema de Animaciones", "Animaciones y movimientos de avatares", 80),
        ("Optimización de Rendimiento", "Optimización de renderizado 3D", 30)
    ]
    
    for task_name, description, hours in avatar_tasks:
        task = leader.create_task(
            project_id=projects["avatar_system"].id,
            name=task_name,
            description=description,
            priority=TaskPriority.HIGH,
            estimated_hours=hours
        )
        tasks[f"avatar_{task_name.lower().replace(' ', '_')}"] = task
    
    # Tareas para Blockchain
    blockchain_tasks = [
        ("Smart Contracts", "Desarrollo de contratos inteligentes", 50),
        ("Wallet Integration", "Integración de wallets", 40),
        ("Transaction System", "Sistema de transacciones", 60),
        ("Security Audit", "Auditoría de seguridad", 30)
    ]
    
    for task_name, description, hours in blockchain_tasks:
        task = leader.create_task(
            project_id=projects["blockchain_integration"].id,
            name=task_name,
            description=description,
            priority=TaskPriority.CRITICAL,
            estimated_hours=hours
        )
        tasks[f"blockchain_{task_name.lower().replace(' ', '_')}"] = task
    
    print(f"✅ Tareas creadas: {len(tasks)}")
    
    # ==================== 3. GENERACIÓN DE CÓDIGO INTELIGENTE ====================
    print("\n💻 3. Generación de Código Inteligente")
    print("-" * 40)
    
    # Generar código para diferentes tipos de tareas
    code_examples = {}
    
    # Código para sistema 3D
    avatar_code = leader.generate_code_for_task(tasks["avatar_generador_de_avatares"].id, "python")
    code_examples["3D System"] = avatar_code
    
    # Código para blockchain
    blockchain_code = leader.generate_code_for_task(tasks["blockchain_smart_contracts"].id, "javascript")
    code_examples["Blockchain"] = blockchain_code
    
    print("💻 Código generado automáticamente:")
    for system_type, code in code_examples.items():
        print(f"\n🔧 {system_type}:")
        print(code[:200] + "..." if len(code) > 200 else code)
    
    # ==================== 4. MONITOREO DE SISTEMAS ====================
    print("\n🔍 4. Monitoreo de Sistemas")
    print("-" * 40)
    
    # Simular monitoreo de diferentes sistemas
    systems = [
        ("Frontend", "healthy", 99.8, 95.0, 0.1, [], []),
        ("Backend", "healthy", 99.9, 98.0, 0.05, [], []),
        ("Database", "warning", 99.5, 85.0, 0.5, ["Lentitud en consultas"], ["Optimizar índices"]),
        ("Blockchain", "critical", 95.0, 60.0, 2.0, ["Transacciones fallidas", "Alta latencia"], ["Escalar nodos", "Optimizar contratos"]),
        ("3D Engine", "healthy", 99.7, 90.0, 0.2, [], [])
    ]
    
    for system_name, status, uptime, performance, error_rate, issues, recommendations in systems:
        leader.update_system_health(
            system_name=system_name,
            status=status,
            uptime=uptime,
            performance_score=performance,
            error_rate=error_rate,
            issues=issues,
            recommendations=recommendations
        )
    
    health_summary = leader.get_system_health_summary()
    print(f"📊 Estado de Sistemas:")
    print(f"   • Total: {health_summary['total_systems']}")
    print(f"   • Saludables: {health_summary['healthy']}")
    print(f"   • Advertencia: {health_summary['warning']}")
    print(f"   • Críticos: {health_summary['critical']}")
    print(f"   • Salud General: {health_summary['overall_health']:.1f}%")
    
    # ==================== 5. ANÁLISIS DE COSTES ====================
    print("\n💰 5. Análisis de Costes")
    print("-" * 40)
    
    # Simular registro de costes
    api_costs = {
        "OpenAI": 2500,
        "Gemini": 800,
        "Claude": 1200,
        "Azure": 1500
    }
    
    leader.record_cost(
        period="Enero 2024",
        api_costs=api_costs,
        infrastructure_costs=3000,
        development_costs=15000
    )
    
    # Segundo período con optimización
    optimized_api_costs = {
        "OpenAI": 1200,  # Reducido por uso de LucIA
        "Gemini": 400,   # Reducido
        "Claude": 600,   # Reducido
        "Azure": 800     # Reducido
    }
    
    leader.record_cost(
        period="Febrero 2024",
        api_costs=optimized_api_costs,
        infrastructure_costs=2500,  # Optimizado
        development_costs=12000     # Optimizado
    )
    
    cost_summary = leader.get_cost_summary()
    print(f"💰 Análisis de Costes:")
    print(f"   • Total gastado: ${cost_summary['total_spent']:,.2f}")
    print(f"   • Ahorros logrados: ${cost_summary['total_savings']:,.2f}")
    print(f"   • Porcentaje de ahorro: {cost_summary['savings_percentage']:.1f}%")
    
    print(f"\n📈 APIs con mayor coste:")
    for api, cost in cost_summary['top_cost_apis']:
        print(f"   • {api}: ${cost:,.2f}")
    
    print(f"\n🎯 Oportunidades de optimización:")
    for opportunity in cost_summary['optimization_opportunities']:
        print(f"   • {opportunity}")
    
    # ==================== 6. ACTUALIZACIÓN DE PROGRESO ====================
    print("\n📈 6. Actualización de Progreso")
    print("-" * 40)
    
    # Simular progreso en tareas
    progress_updates = [
        ("avatar_generador_de_avatares", 85, 35, True, True, False),
        ("avatar_editor_de_personalizacion", 60, 40, True, False, False),
        ("blockchain_smart_contracts", 90, 45, True, True, True),
        ("blockchain_wallet_integration", 75, 30, True, False, False)
    ]
    
    for task_key, progress, hours, code_gen, tests, docs in progress_updates:
        if task_key in tasks:
            leader.update_task_progress(
                task_id=tasks[task_key].id,
                progress=progress,
                actual_hours=hours,
                code_generated=code_gen,
                tests_passed=tests,
                documentation_complete=docs
            )
            print(f"   • {tasks[task_key].name}: {progress}% completado")
    
    # ==================== 7. REPORTE FINAL ====================
    print("\n📊 7. Reporte Final de Plataforma")
    print("-" * 40)
    
    final_report = leader.generate_platform_report()
    
    print("🎯 Estado General de la Plataforma:")
    print(f"   • Proyectos activos: {final_report['projects']['total']}")
    print(f"   • Tareas en progreso: {final_report['tasks']['in_progress']}")
    print(f"   • Tareas completadas: {final_report['tasks']['completed']}")
    print(f"   • Salud del sistema: {final_report['system_health']['overall_health']:.1f}%")
    
    print(f"\n📋 Proyectos por Estado:")
    for status, count in final_report['projects']['by_status'].items():
        if count > 0:
            print(f"   • {status}: {count}")
    
    print(f"\n🔧 Proyectos por Sistema:")
    for system, count in final_report['projects']['by_system'].items():
        if count > 0:
            print(f"   • {system}: {count}")
    
    print(f"\n💡 Recomendaciones de LucIA:")
    for recommendation in final_report['recommendations']:
        print(f"   • {recommendation}")
    
    print("\n" + "=" * 70)
    print("✅ Prueba de LucIA Platform Leader completada!")
    print("\n🎯 Capacidades demostradas:")
    print("   • 📋 Gestión completa de proyectos")
    print("   • ✅ Coordinación de tareas")
    print("   • 💻 Generación inteligente de código")
    print("   • 🔍 Monitoreo de sistemas")
    print("   • 💰 Análisis y optimización de costes")
    print("   • 📊 Reportes ejecutivos")
    print("   • 🎯 Recomendaciones estratégicas")
    print("\n🚀 LucIA está listo para liderar la plataforma Metaverso Crypto World Virtual 3D!")

if __name__ == "__main__":
    asyncio.run(test_platform_leadership()) 