#!/usr/bin/env node

/**
 * Workflow Manager para Metaverso
 * Gestor dinámico de workflows personalizables
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class WorkflowManager {
    constructor() {
        this.workflowsDir = path.join(__dirname, 'workflows');
        this.customWorkflowsDir = path.join(__dirname, 'custom-workflows');
        this.templatesDir = path.join(__dirname, 'templates');
        
        this.init();
    }

    init() {
        // Crear directorios necesarios
        [this.customWorkflowsDir, this.templatesDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
        
        this.createDefaultTemplates();
    }

    createDefaultTemplates() {
        const templates = {
            'deploy-template.yml': {
                name: 'Deploy Template',
                description: 'Template para despliegues automáticos',
                triggers: ['push', 'manual'],
                jobs: {
                    deploy: {
                        runs_on: 'ubuntu-latest',
                        steps: [
                            { name: 'Checkout', uses: 'actions/checkout@v3' },
                            { name: 'Setup Node.js', uses: 'actions/setup-node@v3' },
                            { name: 'Install dependencies', run: 'npm install' },
                            { name: 'Build', run: 'npm run build' },
                            { name: 'Deploy', run: 'npm run deploy' }
                        ]
                    }
                }
            },
            'test-template.yml': {
                name: 'Test Template',
                description: 'Template para ejecución de tests',
                triggers: ['push', 'pull_request'],
                jobs: {
                    test: {
                        runs_on: 'ubuntu-latest',
                        steps: [
                            { name: 'Checkout', uses: 'actions/checkout@v3' },
                            { name: 'Setup Node.js', uses: 'actions/setup-node@v3' },
                            { name: 'Install dependencies', run: 'npm install' },
                            { name: 'Run tests', run: 'npm test' },
                            { name: 'Generate coverage', run: 'npm run coverage' }
                        ]
                    }
                }
            },
            'security-template.yml': {
                name: 'Security Template',
                description: 'Template para auditorías de seguridad',
                triggers: ['schedule', 'manual'],
                jobs: {
                    security_audit: {
                        runs_on: 'ubuntu-latest',
                        steps: [
                            { name: 'Checkout', uses: 'actions/checkout@v3' },
                            { name: 'Run security scan', run: 'npm audit' },
                            { name: 'Run vulnerability scan', run: './security/scan-vulnerabilities.js' }
                        ]
                    }
                }
            }
        };

        Object.entries(templates).forEach(([filename, template]) => {
            const filepath = path.join(this.templatesDir, filename);
            if (!fs.existsSync(filepath)) {
                fs.writeFileSync(filepath, yaml.dump(template));
            }
        });
    }

    createWorkflow(name, template = 'deploy-template.yml', customizations = {}) {
        try {
            const templatePath = path.join(this.templatesDir, template);
            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template ${template} no encontrado`);
            }

            const templateContent = yaml.load(fs.readFileSync(templatePath, 'utf8'));
            const workflow = this.customizeWorkflow(templateContent, customizations);
            
            const workflowPath = path.join(this.customWorkflowsDir, `${name}.yml`);
            fs.writeFileSync(workflowPath, yaml.dump(workflow));
            
            console.log(`Workflow ${name} creado exitosamente en ${workflowPath}`);
            return workflowPath;
        } catch (error) {
            console.error(`Error creando workflow: ${error.message}`);
            throw error;
        }
    }

    customizeWorkflow(template, customizations) {
        const workflow = JSON.parse(JSON.stringify(template));
        
        // Personalizar nombre y descripción
        if (customizations.name) workflow.name = customizations.name;
        if (customizations.description) workflow.description = customizations.description;
        
        // Personalizar triggers
        if (customizations.triggers) {
            workflow.triggers = customizations.triggers;
        }
        
        // Personalizar jobs
        if (customizations.jobs) {
            Object.entries(customizations.jobs).forEach(([jobName, jobConfig]) => {
                if (workflow.jobs[jobName]) {
                    workflow.jobs[jobName] = { ...workflow.jobs[jobName], ...jobConfig };
                } else {
                    workflow.jobs[jobName] = jobConfig;
                }
            });
        }
        
        return workflow;
    }

    listWorkflows() {
        const workflows = [];
        
        // Workflows estándar
        if (fs.existsSync(this.workflowsDir)) {
            const standardWorkflows = fs.readdirSync(this.workflowsDir)
                .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
                .map(file => ({
                    name: file,
                    path: path.join(this.workflowsDir, file),
                    type: 'standard'
                }));
            workflows.push(...standardWorkflows);
        }
        
        // Workflows personalizados
        if (fs.existsSync(this.customWorkflowsDir)) {
            const customWorkflows = fs.readdirSync(this.customWorkflowsDir)
                .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
                .map(file => ({
                    name: file,
                    path: path.join(this.customWorkflowsDir, file),
                    type: 'custom'
                }));
            workflows.push(...customWorkflows);
        }
        
        return workflows;
    }

    getWorkflow(name) {
        const workflows = this.listWorkflows();
        const workflow = workflows.find(w => w.name === name || w.name === `${name}.yml`);
        
        if (!workflow) {
            throw new Error(`Workflow ${name} no encontrado`);
        }
        
        return {
            ...workflow,
            content: yaml.load(fs.readFileSync(workflow.path, 'utf8'))
        };
    }

    updateWorkflow(name, updates) {
        try {
            const workflow = this.getWorkflow(name);
            const updatedContent = { ...workflow.content, ...updates };
            
            fs.writeFileSync(workflow.path, yaml.dump(updatedContent));
            console.log(`Workflow ${name} actualizado exitosamente`);
            
            return workflow.path;
        } catch (error) {
            console.error(`Error actualizando workflow: ${error.message}`);
            throw error;
        }
    }

    deleteWorkflow(name) {
        try {
            const workflow = this.getWorkflow(name);
            
            if (workflow.type === 'standard') {
                throw new Error('No se pueden eliminar workflows estándar');
            }
            
            fs.unlinkSync(workflow.path);
            console.log(`Workflow ${name} eliminado exitosamente`);
        } catch (error) {
            console.error(`Error eliminando workflow: ${error.message}`);
            throw error;
        }
    }

    validateWorkflow(name) {
        try {
            const workflow = this.getWorkflow(name);
            const content = workflow.content;
            
            const errors = [];
            
            // Validaciones básicas
            if (!content.name) errors.push('Workflow debe tener un nombre');
            if (!content.jobs || Object.keys(content.jobs).length === 0) {
                errors.push('Workflow debe tener al menos un job');
            }
            
            // Validar estructura de jobs
            Object.entries(content.jobs).forEach(([jobName, job]) => {
                if (!job.runs_on) {
                    errors.push(`Job ${jobName} debe especificar runs_on`);
                }
                if (!job.steps || job.steps.length === 0) {
                    errors.push(`Job ${jobName} debe tener al menos un step`);
                }
            });
            
            if (errors.length > 0) {
                throw new Error(`Errores de validación: ${errors.join(', ')}`);
            }
            
            console.log(`Workflow ${name} es válido`);
            return true;
        } catch (error) {
            console.error(`Error validando workflow: ${error.message}`);
            throw error;
        }
    }

    exportWorkflow(name, format = 'yaml') {
        try {
            const workflow = this.getWorkflow(name);
            
            switch (format.toLowerCase()) {
                case 'yaml':
                case 'yml':
                    return yaml.dump(workflow.content);
                case 'json':
                    return JSON.stringify(workflow.content, null, 2);
                default:
                    throw new Error(`Formato ${format} no soportado`);
            }
        } catch (error) {
            console.error(`Error exportando workflow: ${error.message}`);
            throw error;
        }
    }
}

// CLI Interface
if (require.main === module) {
    const manager = new WorkflowManager();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'create':
            const name = args[1];
            const template = args[2] || 'deploy-template.yml';
            if (name) {
                manager.createWorkflow(name, template);
            } else {
                console.log('Uso: node workflow-manager.js create <workflow-name> [template]');
            }
            break;
            
        case 'list':
            const workflows = manager.listWorkflows();
            console.log('Workflows disponibles:');
            workflows.forEach(w => {
                console.log(`  ${w.type}: ${w.name}`);
            });
            break;
            
        case 'show':
            const workflowName = args[1];
            if (workflowName) {
                try {
                    const workflow = manager.getWorkflow(workflowName);
                    console.log(yaml.dump(workflow.content));
                } catch (error) {
                    console.error(error.message);
                }
            } else {
                console.log('Uso: node workflow-manager.js show <workflow-name>');
            }
            break;
            
        case 'validate':
            const validateName = args[1];
            if (validateName) {
                try {
                    manager.validateWorkflow(validateName);
                } catch (error) {
                    console.error(error.message);
                }
            } else {
                console.log('Uso: node workflow-manager.js validate <workflow-name>');
            }
            break;
            
        case 'delete':
            const deleteName = args[1];
            if (deleteName) {
                try {
                    manager.deleteWorkflow(deleteName);
                } catch (error) {
                    console.error(error.message);
                }
            } else {
                console.log('Uso: node workflow-manager.js delete <workflow-name>');
            }
            break;
            
        default:
            console.log(`
Workflow Manager - Comandos disponibles:
  create <name> [template]  - Crear nuevo workflow
  list                     - Listar workflows disponibles
  show <name>              - Mostrar contenido de workflow
  validate <name>          - Validar workflow
  delete <name>            - Eliminar workflow personalizado
            `);
    }
}

module.exports = WorkflowManager; 