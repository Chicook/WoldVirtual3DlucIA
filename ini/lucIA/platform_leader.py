#!/usr/bin/env python3
"""
LucIA Platform Leader - Sistema de Liderazgo Técnico
LucIA como director técnico de la plataforma Metaverso Crypto World Virtual 3D
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
import sqlite3
import hashlib
import re

logger = logging.getLogger(__name__)

class ProjectStatus(Enum):
    """Estados de proyectos"""
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"

class TaskPriority(Enum):
    """Prioridades de tareas"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class SystemType(Enum):
    """Tipos de sistemas"""
    FRONTEND = "frontend"
    BACKEND = "backend"
    BLOCKCHAIN = "blockchain"
    DATABASE = "database"
    SECURITY = "security"
    THREE_D = "3d"
    AVATAR = "avatar"
    AI = "ai"
    INFRASTRUCTURE = "infrastructure"

@dataclass
class Project:
    """Proyecto de la plataforma"""
    id: str
    name: str
    description: str
    status: ProjectStatus
    priority: TaskPriority
    system_type: SystemType
    created_at: datetime
    updated_at: datetime
    deadline: Optional[datetime]
    budget: float
    cost_so_far: float
    team_size: int
    dependencies: List[str]
    progress: float
    risks: List[str]
    success_metrics: Dict[str, Any]

@dataclass
class Task:
    """Tarea específica"""
    id: str
    project_id: str
    name: str
    description: str
    status: ProjectStatus
    priority: TaskPriority
    assigned_to: str
    created_at: datetime
    updated_at: datetime
    deadline: Optional[datetime]
    estimated_hours: float
    actual_hours: float
    dependencies: List[str]
    progress: float
    code_generated: bool
    tests_passed: bool
    documentation_complete: bool

@dataclass
class SystemHealth:
    """Salud del sistema"""
    system_name: str
    status: str  # "healthy", "warning", "critical"
    uptime: float
    performance_score: float
    error_rate: float
    last_check: datetime
    issues: List[str]
    recommendations: List[str]

@dataclass
class CostAnalysis:
    """Análisis de costes"""
    period: str
    total_spent: float
    api_costs: Dict[str, float]
    infrastructure_costs: float
    development_costs: float
    savings_achieved: float
    optimization_opportunities: List[str]

class LucIAPlatformLeader:
    """LucIA como líder técnico de la plataforma"""
    
    def __init__(self, db_path: str = "lucia_platform.db"):
        self.db_path = db_path
        self.projects: Dict[str, Project] = {}
        self.tasks: Dict[str, Task] = {}
        self.system_health: Dict[str, SystemHealth] = {}
        self.cost_analytics: List[CostAnalysis] = []
        
        self._init_database()
        self._load_existing_data()
        
        logger.info("🚀 LucIA Platform Leader inicializado")
    
    def _init_database(self):
        """Inicializa la base de datos de la plataforma"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de proyectos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL,
                priority TEXT NOT NULL,
                system_type TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                deadline TEXT,
                budget REAL,
                cost_so_far REAL DEFAULT 0,
                team_size INTEGER DEFAULT 1,
                dependencies TEXT,
                progress REAL DEFAULT 0,
                risks TEXT,
                success_metrics TEXT
            )
        ''')
        
        # Tabla de tareas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL,
                priority TEXT NOT NULL,
                assigned_to TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                deadline TEXT,
                estimated_hours REAL,
                actual_hours REAL DEFAULT 0,
                dependencies TEXT,
                progress REAL DEFAULT 0,
                code_generated BOOLEAN DEFAULT FALSE,
                tests_passed BOOLEAN DEFAULT FALSE,
                documentation_complete BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        ''')
        
        # Tabla de salud del sistema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_health (
                system_name TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                uptime REAL,
                performance_score REAL,
                error_rate REAL,
                last_check TEXT NOT NULL,
                issues TEXT,
                recommendations TEXT
            )
        ''')
        
        # Tabla de análisis de costes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cost_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                period TEXT NOT NULL,
                total_spent REAL,
                api_costs TEXT,
                infrastructure_costs REAL,
                development_costs REAL,
                savings_achieved REAL,
                optimization_opportunities TEXT,
                created_at TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def _load_existing_data(self):
        """Carga datos existentes de la base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Cargar proyectos
        cursor.execute('SELECT * FROM projects')
        for row in cursor.fetchall():
            project = Project(
                id=row[0],
                name=row[1],
                description=row[2],
                status=ProjectStatus(row[3]),
                priority=TaskPriority(row[4]),
                system_type=SystemType(row[5]),
                created_at=datetime.fromisoformat(row[6]),
                updated_at=datetime.fromisoformat(row[7]),
                deadline=datetime.fromisoformat(row[8]) if row[8] else None,
                budget=row[9] or 0,
                cost_so_far=row[10] or 0,
                team_size=row[11] or 1,
                dependencies=json.loads(row[12]) if row[12] else [],
                progress=row[13] or 0,
                risks=json.loads(row[14]) if row[14] else [],
                success_metrics=json.loads(row[15]) if row[15] else {}
            )
            self.projects[project.id] = project
        
        # Cargar tareas
        cursor.execute('SELECT * FROM tasks')
        for row in cursor.fetchall():
            task = Task(
                id=row[0],
                project_id=row[1],
                name=row[2],
                description=row[3],
                status=ProjectStatus(row[4]),
                priority=TaskPriority(row[5]),
                assigned_to=row[6],
                created_at=datetime.fromisoformat(row[7]),
                updated_at=datetime.fromisoformat(row[8]),
                deadline=datetime.fromisoformat(row[9]) if row[9] else None,
                estimated_hours=row[10] or 0,
                actual_hours=row[11] or 0,
                dependencies=json.loads(row[12]) if row[12] else [],
                progress=row[13] or 0,
                code_generated=bool(row[14]),
                tests_passed=bool(row[15]),
                documentation_complete=bool(row[16])
            )
            self.tasks[task.id] = task
        
        conn.close()
    
    # ==================== GESTIÓN DE PROYECTOS ====================
    
    def create_project(self, name: str, description: str, system_type: SystemType, 
                      priority: TaskPriority = TaskPriority.MEDIUM, 
                      budget: float = 0, deadline: Optional[datetime] = None) -> Project:
        """Crea un nuevo proyecto"""
        project_id = hashlib.md5(f"{name}_{datetime.now()}".encode()).hexdigest()[:8]
        
        project = Project(
            id=project_id,
            name=name,
            description=description,
            status=ProjectStatus.PLANNING,
            priority=priority,
            system_type=system_type,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            deadline=deadline,
            budget=budget,
            cost_so_far=0,
            team_size=1,
            dependencies=[],
            progress=0,
            risks=[],
            success_metrics={}
        )
        
        self.projects[project_id] = project
        self._save_project(project)
        
        logger.info(f"📋 Proyecto creado: {name} ({project_id})")
        return project
    
    def update_project_status(self, project_id: str, status: ProjectStatus, 
                            progress: float = None, cost_so_far: float = None):
        """Actualiza el estado de un proyecto"""
        if project_id not in self.projects:
            raise ValueError(f"Proyecto {project_id} no encontrado")
        
        project = self.projects[project_id]
        project.status = status
        project.updated_at = datetime.now()
        
        if progress is not None:
            project.progress = progress
        if cost_so_far is not None:
            project.cost_so_far = cost_so_far
        
        self._save_project(project)
        logger.info(f"📊 Proyecto {project.name} actualizado: {status.value} ({progress}%)")
    
    def get_projects_by_status(self, status: ProjectStatus) -> List[Project]:
        """Obtiene proyectos por estado"""
        return [p for p in self.projects.values() if p.status == status]
    
    def get_projects_by_system(self, system_type: SystemType) -> List[Project]:
        """Obtiene proyectos por tipo de sistema"""
        return [p for p in self.projects.values() if p.system_type == system_type]
    
    # ==================== GESTIÓN DE TAREAS ====================
    
    def create_task(self, project_id: str, name: str, description: str,
                   priority: TaskPriority = TaskPriority.MEDIUM,
                   estimated_hours: float = 0, deadline: Optional[datetime] = None) -> Task:
        """Crea una nueva tarea"""
        task_id = hashlib.md5(f"{project_id}_{name}_{datetime.now()}".encode()).hexdigest()[:8]
        
        task = Task(
            id=task_id,
            project_id=project_id,
            name=name,
            description=description,
            status=ProjectStatus.PLANNING,
            priority=priority,
            assigned_to="LucIA",  # Por defecto asignado a LucIA
            created_at=datetime.now(),
            updated_at=datetime.now(),
            deadline=deadline,
            estimated_hours=estimated_hours,
            actual_hours=0,
            dependencies=[],
            progress=0,
            code_generated=False,
            tests_passed=False,
            documentation_complete=False
        )
        
        self.tasks[task_id] = task
        self._save_task(task)
        
        logger.info(f"✅ Tarea creada: {name} en proyecto {project_id}")
        return task
    
    def update_task_progress(self, task_id: str, progress: float, 
                           actual_hours: float = None, code_generated: bool = None,
                           tests_passed: bool = None, documentation_complete: bool = None):
        """Actualiza el progreso de una tarea"""
        if task_id not in self.tasks:
            raise ValueError(f"Tarea {task_id} no encontrada")
        
        task = self.tasks[task_id]
        task.progress = progress
        task.updated_at = datetime.now()
        
        if actual_hours is not None:
            task.actual_hours = actual_hours
        if code_generated is not None:
            task.code_generated = code_generated
        if tests_passed is not None:
            task.tests_passed = tests_passed
        if documentation_complete is not None:
            task.documentation_complete = documentation_complete
        
        # Actualizar estado basado en progreso
        if progress >= 100:
            task.status = ProjectStatus.COMPLETED
        elif progress > 0:
            task.status = ProjectStatus.IN_PROGRESS
        
        self._save_task(task)
        
        # Actualizar progreso del proyecto
        self._update_project_progress_from_tasks(task.project_id)
        
        logger.info(f"📈 Tarea {task.name} actualizada: {progress}%")
    
    def get_tasks_by_project(self, project_id: str) -> List[Task]:
        """Obtiene tareas por proyecto"""
        return [t for t in self.tasks.values() if t.project_id == project_id]
    
    def get_tasks_by_status(self, status: ProjectStatus) -> List[Task]:
        """Obtiene tareas por estado"""
        return [t for t in self.tasks.values() if t.status == status]
    
    # ==================== MONITOREO DE SISTEMAS ====================
    
    def update_system_health(self, system_name: str, status: str, uptime: float,
                           performance_score: float, error_rate: float,
                           issues: List[str] = None, recommendations: List[str] = None):
        """Actualiza la salud de un sistema"""
        health = SystemHealth(
            system_name=system_name,
            status=status,
            uptime=uptime,
            performance_score=performance_score,
            error_rate=error_rate,
            last_check=datetime.now(),
            issues=issues or [],
            recommendations=recommendations or []
        )
        
        self.system_health[system_name] = health
        self._save_system_health(health)
        
        if status == "critical":
            logger.error(f"🚨 Sistema crítico: {system_name}")
        elif status == "warning":
            logger.warning(f"⚠️ Sistema en advertencia: {system_name}")
        else:
            logger.info(f"✅ Sistema saludable: {system_name}")
    
    def get_system_health_summary(self) -> Dict[str, Any]:
        """Obtiene resumen de salud de todos los sistemas"""
        total_systems = len(self.system_health)
        healthy = sum(1 for h in self.system_health.values() if h.status == "healthy")
        warning = sum(1 for h in self.system_health.values() if h.status == "warning")
        critical = sum(1 for h in self.system_health.values() if h.status == "critical")
        
        return {
            "total_systems": total_systems,
            "healthy": healthy,
            "warning": warning,
            "critical": critical,
            "overall_health": (healthy / total_systems * 100) if total_systems > 0 else 0,
            "systems": {name: asdict(health) for name, health in self.system_health.items()}
        }
    
    # ==================== ANÁLISIS DE COSTES ====================
    
    def record_cost(self, period: str, api_costs: Dict[str, float],
                   infrastructure_costs: float = 0, development_costs: float = 0):
        """Registra costes de la plataforma"""
        total_spent = sum(api_costs.values()) + infrastructure_costs + development_costs
        
        # Calcular ahorros (comparar con costes estimados)
        estimated_costs = total_spent * 1.2  # 20% más que lo actual
        savings_achieved = estimated_costs - total_spent
        
        # Identificar oportunidades de optimización
        optimization_opportunities = []
        if sum(api_costs.values()) > total_spent * 0.5:
            optimization_opportunities.append("Reducir uso de APIs externas")
        if infrastructure_costs > total_spent * 0.3:
            optimization_opportunities.append("Optimizar infraestructura")
        
        cost_analysis = CostAnalysis(
            period=period,
            total_spent=total_spent,
            api_costs=api_costs,
            infrastructure_costs=infrastructure_costs,
            development_costs=development_costs,
            savings_achieved=savings_achieved,
            optimization_opportunities=optimization_opportunities
        )
        
        self.cost_analytics.append(cost_analysis)
        self._save_cost_analysis(cost_analysis)
        
        logger.info(f"💰 Costes registrados para {period}: ${total_spent:.2f} (Ahorro: ${savings_achieved:.2f})")
    
    def get_cost_summary(self, periods: int = 12) -> Dict[str, Any]:
        """Obtiene resumen de costes"""
        recent_costs = self.cost_analytics[-periods:] if self.cost_analytics else []
        
        if not recent_costs:
            return {"message": "No hay datos de costes disponibles"}
        
        total_spent = sum(c.total_spent for c in recent_costs)
        total_savings = sum(c.savings_achieved for c in recent_costs)
        
        # Agregar costes de APIs
        all_api_costs = {}
        for cost in recent_costs:
            for api, amount in cost.api_costs.items():
                all_api_costs[api] = all_api_costs.get(api, 0) + amount
        
        return {
            "total_spent": total_spent,
            "total_savings": total_savings,
            "savings_percentage": (total_savings / total_spent * 100) if total_spent > 0 else 0,
            "api_costs": all_api_costs,
            "top_cost_apis": sorted(all_api_costs.items(), key=lambda x: x[1], reverse=True)[:5],
            "optimization_opportunities": list(set([opp for c in recent_costs for opp in c.optimization_opportunities]))
        }
    
    # ==================== GENERACIÓN DE CÓDIGO INTELIGENTE ====================
    
    def generate_code_for_task(self, task_id: str, language: str = "python") -> str:
        """Genera código para una tarea específica"""
        if task_id not in self.tasks:
            raise ValueError(f"Tarea {task_id} no encontrada")
        
        task = self.tasks[task_id]
        project = self.projects[task.project_id]
        
        # Generar código basado en el tipo de sistema y tarea
        code_template = self._get_code_template(project.system_type, task.name, language)
        
        # Marcar como código generado
        self.update_task_progress(task_id, task.progress, code_generated=True)
        
        logger.info(f"💻 Código generado para tarea: {task.name}")
        return code_template
    
    def _get_code_template(self, system_type: SystemType, task_name: str, language: str) -> str:
        """Obtiene plantilla de código según el tipo de sistema"""
        templates = {
            SystemType.FRONTEND: {
                "python": '''# Frontend Component
class FrontendComponent:
    def __init__(self):
        self.state = {}
    
    def render(self):
        """Renderiza el componente"""
        return self.state
    
    def update_state(self, new_state):
        """Actualiza el estado"""
        self.state.update(new_state)''',
                "javascript": '''// Frontend Component
class FrontendComponent {
    constructor() {
        this.state = {};
    }
    
    render() {
        // Renderiza el componente
        return this.state;
    }
    
    updateState(newState) {
        // Actualiza el estado
        this.state = { ...this.state, ...newState };
    }
}'''
            },
            SystemType.BACKEND: {
                "python": '''# Backend Service
class BackendService:
    def __init__(self):
        self.database = None
    
    def connect_database(self):
        """Conecta a la base de datos"""
        pass
    
    def process_request(self, request):
        """Procesa una petición"""
        return {"status": "success", "data": request}''',
                "javascript": '''// Backend Service
class BackendService {
    constructor() {
        this.database = null;
    }
    
    connectDatabase() {
        // Conecta a la base de datos
    }
    
    processRequest(request) {
        // Procesa una petición
        return { status: "success", data: request };
    }
}'''
            },
            SystemType.BLOCKCHAIN: {
                "python": '''# Blockchain Service
class BlockchainService:
    def __init__(self):
        self.contracts = {}
    
    def deploy_contract(self, contract_code):
        """Despliega un contrato inteligente"""
        contract_id = self._generate_contract_id()
        self.contracts[contract_id] = contract_code
        return contract_id
    
    def execute_transaction(self, contract_id, function_name, params):
        """Ejecuta una transacción"""
        if contract_id in self.contracts:
            return {"success": True, "result": f"Executed {function_name}"}
        return {"success": False, "error": "Contract not found"}''',
                "javascript": '''// Blockchain Service
class BlockchainService {
    constructor() {
        this.contracts = {};
    }
    
    deployContract(contractCode) {
        // Despliega un contrato inteligente
        const contractId = this._generateContractId();
        this.contracts[contractId] = contractCode;
        return contractId;
    }
    
    executeTransaction(contractId, functionName, params) {
        // Ejecuta una transacción
        if (this.contracts[contractId]) {
            return { success: true, result: `Executed ${functionName}` };
        }
        return { success: false, error: "Contract not found" };
    }
}'''
            },
            SystemType.THREE_D: {
                "python": '''# 3D System
class ThreeDSystem:
    def __init__(self):
        self.scenes = {}
        self.objects = {}
    
    def create_scene(self, scene_name):
        """Crea una nueva escena 3D"""
        scene_id = self._generate_scene_id()
        self.scenes[scene_id] = {"name": scene_name, "objects": []}
        return scene_id
    
    def add_object(self, scene_id, object_type, position):
        """Añade un objeto a la escena"""
        if scene_id in self.scenes:
            object_id = self._generate_object_id()
            self.scenes[scene_id]["objects"].append({
                "id": object_id,
                "type": object_type,
                "position": position
            })
            return object_id
        return None''',
                "javascript": '''// 3D System
class ThreeDSystem {
    constructor() {
        this.scenes = {};
        this.objects = {};
    }
    
    createScene(sceneName) {
        // Crea una nueva escena 3D
        const sceneId = this._generateSceneId();
        this.scenes[sceneId] = { name: sceneName, objects: [] };
        return sceneId;
    }
    
    addObject(sceneId, objectType, position) {
        // Añade un objeto a la escena
        if (this.scenes[sceneId]) {
            const objectId = this._generateObjectId();
            this.scenes[sceneId].objects.push({
                id: objectId,
                type: objectType,
                position: position
            });
            return objectId;
        }
        return null;
    }
}'''
            }
        }
        
        return templates.get(system_type, {}).get(language, f"# {task_name}\n# Implementación pendiente")
    
    # ==================== MÉTODOS DE PERSISTENCIA ====================
    
    def _save_project(self, project: Project):
        """Guarda un proyecto en la base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO projects 
            (id, name, description, status, priority, system_type, created_at, updated_at,
             deadline, budget, cost_so_far, team_size, dependencies, progress, risks, success_metrics)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            project.id, project.name, project.description, project.status.value,
            project.priority.value, project.system_type.value, project.created_at.isoformat(),
            project.updated_at.isoformat(), project.deadline.isoformat() if project.deadline else None,
            project.budget, project.cost_so_far, project.team_size,
            json.dumps(project.dependencies), project.progress,
            json.dumps(project.risks), json.dumps(project.success_metrics)
        ))
        
        conn.commit()
        conn.close()
    
    def _save_task(self, task: Task):
        """Guarda una tarea en la base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO tasks 
            (id, project_id, name, description, status, priority, assigned_to, created_at, updated_at,
             deadline, estimated_hours, actual_hours, dependencies, progress, code_generated, tests_passed, documentation_complete)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            task.id, task.project_id, task.name, task.description, task.status.value,
            task.priority.value, task.assigned_to, task.created_at.isoformat(),
            task.updated_at.isoformat(), task.deadline.isoformat() if task.deadline else None,
            task.estimated_hours, task.actual_hours, json.dumps(task.dependencies),
            task.progress, task.code_generated, task.tests_passed, task.documentation_complete
        ))
        
        conn.commit()
        conn.close()
    
    def _save_system_health(self, health: SystemHealth):
        """Guarda la salud del sistema en la base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO system_health 
            (system_name, status, uptime, performance_score, error_rate, last_check, issues, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            health.system_name, health.status, health.uptime, health.performance_score,
            health.error_rate, health.last_check.isoformat(),
            json.dumps(health.issues), json.dumps(health.recommendations)
        ))
        
        conn.commit()
        conn.close()
    
    def _save_cost_analysis(self, cost: CostAnalysis):
        """Guarda análisis de costes en la base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO cost_analytics 
            (period, total_spent, api_costs, infrastructure_costs, development_costs, 
             savings_achieved, optimization_opportunities, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            cost.period, cost.total_spent, json.dumps(cost.api_costs),
            cost.infrastructure_costs, cost.development_costs, cost.savings_achieved,
            json.dumps(cost.optimization_opportunities), datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
    
    def _update_project_progress_from_tasks(self, project_id: str):
        """Actualiza el progreso del proyecto basado en sus tareas"""
        project_tasks = self.get_tasks_by_project(project_id)
        if project_tasks:
            total_progress = sum(task.progress for task in project_tasks)
            average_progress = total_progress / len(project_tasks)
            self.update_project_status(project_id, self.projects[project_id].status, average_progress)
    
    # ==================== REPORTES Y ANÁLISIS ====================
    
    def generate_platform_report(self) -> Dict[str, Any]:
        """Genera un reporte completo de la plataforma"""
        return {
            "timestamp": datetime.now().isoformat(),
            "projects": {
                "total": len(self.projects),
                "by_status": {status.value: len(self.get_projects_by_status(status)) for status in ProjectStatus},
                "by_system": {system.value: len(self.get_projects_by_system(system)) for system in SystemType}
            },
            "tasks": {
                "total": len(self.tasks),
                "by_status": {status.value: len(self.get_tasks_by_status(status)) for status in ProjectStatus},
                "completed": len(self.get_tasks_by_status(ProjectStatus.COMPLETED)),
                "in_progress": len(self.get_tasks_by_status(ProjectStatus.IN_PROGRESS))
            },
            "system_health": self.get_system_health_summary(),
            "cost_analysis": self.get_cost_summary(),
            "recommendations": self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Genera recomendaciones basadas en el estado actual"""
        recommendations = []
        
        # Análisis de proyectos
        blocked_projects = self.get_projects_by_status(ProjectStatus.BLOCKED)
        if blocked_projects:
            recommendations.append(f"Resolver {len(blocked_projects)} proyectos bloqueados")
        
        # Análisis de costes
        cost_summary = self.get_cost_summary()
        if cost_summary.get("optimization_opportunities"):
            recommendations.extend(cost_summary["optimization_opportunities"])
        
        # Análisis de salud del sistema
        health_summary = self.get_system_health_summary()
        if health_summary["critical"] > 0:
            recommendations.append(f"Atender {health_summary['critical']} sistemas críticos")
        
        return recommendations

# Función de utilidad para crear instancia
def create_platform_leader() -> LucIAPlatformLeader:
    """Crea una instancia del líder de plataforma"""
    return LucIAPlatformLeader()

if __name__ == "__main__":
    # Prueba básica del sistema
    leader = create_platform_leader()
    
    # Crear un proyecto de ejemplo
    project = leader.create_project(
        name="Sistema de Avatares 3D",
        description="Sistema completo de generación y gestión de avatares 3D",
        system_type=SystemType.THREE_D,
        priority=TaskPriority.HIGH,
        budget=50000
    )
    
    # Crear tareas
    task1 = leader.create_task(
        project_id=project.id,
        name="Generador de Avatares",
        description="Crear sistema de generación automática de avatares",
        priority=TaskPriority.HIGH,
        estimated_hours=40
    )
    
    # Generar código
    code = leader.generate_code_for_task(task1.id, "python")
    print("💻 Código generado:")
    print(code)
    
    # Actualizar progreso
    leader.update_task_progress(task1.id, 75, actual_hours=30, code_generated=True)
    
    # Generar reporte
    report = leader.generate_platform_report()
    print("\n📊 Reporte de Plataforma:")
    print(json.dumps(report, indent=2, default=str)) 