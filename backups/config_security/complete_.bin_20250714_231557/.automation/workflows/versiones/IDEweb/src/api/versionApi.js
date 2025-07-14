// Mock API para simular la conexión con el sistema de versiones
// En producción, esto se conectaría con version-manager.js y version-control.sh

const mockWorkflows = [
  {
    name: 'deploy-metaverso',
    description: 'Workflow de despliegue del metaverso',
    versions: [
      {
        version: 'v1.2.0',
        description: 'Mejoras en validación de seguridad',
        timestamp: '2024-01-15T10:30:00Z',
        author: 'usuario',
        tags: ['stable', 'production', 'security'],
        content: `name: Deploy Metaverso
description: Workflow completo para despliegue del metaverso
triggers: ['push', 'manual', 'schedule']

jobs:
  validate:
    name: Validación Previa
    runs_on: ubuntu-latest
    steps:
      - name: Checkout código
        uses: actions/checkout@v3`
      },
      {
        version: 'v1.1.0',
        description: 'Añadido monitoreo de performance',
        timestamp: '2024-01-10T14:20:00Z',
        author: 'usuario',
        tags: ['beta', 'monitoring'],
        content: `name: Deploy Metaverso
description: Workflow de despliegue con monitoreo
triggers: ['push', 'manual']

jobs:
  deploy:
    name: Despliegue
    runs_on: ubuntu-latest`
      },
      {
        version: 'v1.0.0',
        description: 'Versión inicial',
        timestamp: '2024-01-01T09:00:00Z',
        author: 'usuario',
        tags: ['stable'],
        content: `name: Deploy Metaverso
description: Workflow básico de despliegue
triggers: ['push']

jobs:
  build:
    name: Construcción
    runs_on: ubuntu-latest`
      }
    ]
  },
  {
    name: 'security-audit',
    description: 'Workflow de auditoría de seguridad',
    versions: [
      {
        version: 'v1.0.0',
        description: 'Versión inicial de auditoría',
        timestamp: '2024-01-05T11:15:00Z',
        author: 'usuario',
        tags: ['security', 'stable'],
        content: `name: Security Audit
description: Auditoría de seguridad del metaverso
triggers: ['schedule', 'manual']

jobs:
  audit:
    name: Auditoría
    runs_on: ubuntu-latest`
      }
    ]
  },
  {
    name: 'performance-monitoring',
    description: 'Workflow de monitoreo de rendimiento',
    versions: [
      {
        version: 'v1.0.0',
        description: 'Monitoreo básico de performance',
        timestamp: '2024-01-08T16:45:00Z',
        author: 'usuario',
        tags: ['monitoring', 'beta'],
        content: `name: Performance Monitoring
description: Monitoreo de rendimiento del metaverso
triggers: ['schedule']

jobs:
  monitor:
    name: Monitoreo
    runs_on: ubuntu-latest`
      }
    ]
  }
];

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const versionApi = {
  // Obtener lista de workflows
  async getWorkflows() {
    await delay(300);
    return mockWorkflows.map(wf => ({
      name: wf.name,
      description: wf.description,
      versionCount: wf.versions.length
    }));
  },

  // Obtener versiones de un workflow
  async getWorkflowVersions(workflowName) {
    await delay(200);
    const workflow = mockWorkflows.find(wf => wf.name === workflowName);
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} no encontrado`);
    }
    return workflow.versions;
  },

  // Obtener contenido de una versión específica
  async getVersionContent(workflowName, version) {
    await delay(150);
    const workflow = mockWorkflows.find(wf => wf.name === workflowName);
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} no encontrado`);
    }
    
    const versionData = workflow.versions.find(v => v.version === version);
    if (!versionData) {
      throw new Error(`Versión ${version} no encontrada`);
    }
    
    return versionData;
  },

  // Comparar dos versiones
  async compareVersions(workflowName, version1, version2) {
    await delay(400);
    const v1 = await this.getVersionContent(workflowName, version1);
    const v2 = await this.getVersionContent(workflowName, version2);
    
    // Simular diff básico
    const lines1 = v1.content.split('\n');
    const lines2 = v2.content.split('\n');
    
    const diff = {
      workflow: workflowName,
      version1: {
        version: version1,
        timestamp: v1.timestamp,
        size: v1.content.length
      },
      version2: {
        version: version2,
        timestamp: v2.timestamp,
        size: v2.content.length
      },
      changes: {
        added: [],
        removed: [],
        modified: []
      },
      summary: {
        totalLines: Math.max(lines1.length, lines2.length),
        addedLines: 0,
        removedLines: 0,
        modifiedLines: 0
      }
    };
    
    // Comparación simple
    const maxLines = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 !== line2) {
        if (!line1) {
          diff.changes.added.push({ line: i + 1, content: line2 });
          diff.summary.addedLines++;
        } else if (!line2) {
          diff.changes.removed.push({ line: i + 1, content: line1 });
          diff.summary.removedLines++;
        } else {
          diff.changes.modified.push({ 
            line: i + 1, 
            old: line1, 
            new: line2 
          });
          diff.summary.modifiedLines++;
        }
      }
    }
    
    return diff;
  },

  // Restaurar una versión
  async restoreVersion(workflowName, version) {
    await delay(500);
    const versionData = await this.getVersionContent(workflowName, version);
    
    // Simular éxito
    return {
      success: true,
      message: `Versión ${version} restaurada exitosamente`,
      restoredVersion: versionData
    };
  },

  // Crear nueva versión
  async createVersion(workflowName, version, description, tags = []) {
    await delay(600);
    
    // Simular creación
    const newVersion = {
      version,
      description,
      tags,
      timestamp: new Date().toISOString(),
      author: 'usuario',
      content: '# Nuevo workflow\n\nContenido inicial...'
    };
    
    return {
      success: true,
      message: `Versión ${version} creada exitosamente`,
      version: newVersion
    };
  },

  // Buscar versiones
  async searchVersions(query, workflowName = null) {
    await delay(250);
    const results = [];
    
    mockWorkflows.forEach(workflow => {
      if (workflowName && workflow.name !== workflowName) return;
      
      workflow.versions.forEach(version => {
        const searchText = `${workflow.name} ${version.version} ${version.description} ${version.tags.join(' ')}`.toLowerCase();
        
        if (searchText.includes(query.toLowerCase())) {
          results.push({
            workflow: workflow.name,
            ...version
          });
        }
      });
    });
    
    return results;
  }
};

export default versionApi; 