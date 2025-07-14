#!/usr/bin/env node

/**
 * Version Manager para Workflows del Metaverso
 * Sistema de gestión de versiones para workflows de CI/CD
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

class WorkflowVersionManager {
    constructor() {
        this.workflowsDir = path.join(__dirname, '..');
        this.versionsDir = path.join(__dirname, 'versions');
        this.metadataFile = path.join(__dirname, 'version-metadata.json');
        this.config = {
            maxVersions: 10,
            autoBackup: true,
            compression: true
        };
        
        this.init();
    }

    init() {
        // Crear directorio de versiones si no existe
        if (!fs.existsSync(this.versionsDir)) {
            fs.mkdirSync(this.versionsDir, { recursive: true });
        }
        
        // Crear archivo de metadatos si no existe
        if (!fs.existsSync(this.metadataFile)) {
            this.saveMetadata({});
        }
        
        this.log('Version Manager iniciado');
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        const logFile = path.join(__dirname, 'version-manager.log');
        
        fs.appendFileSync(logFile, logEntry);
        console.log(logEntry.trim());
    }

    getMetadata() {
        try {
            return JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
        } catch (error) {
            this.log(`Error cargando metadatos: ${error.message}`, 'ERROR');
            return {};
        }
    }

    saveMetadata(metadata) {
        try {
            fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
        } catch (error) {
            this.log(`Error guardando metadatos: ${error.message}`, 'ERROR');
        }
    }

    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    createVersion(workflowName, version, description = '', tags = []) {
        try {
            const workflowPath = path.join(this.workflowsDir, `${workflowName}.yml`);
            
            if (!fs.existsSync(workflowPath)) {
                throw new Error(`Workflow ${workflowName} no encontrado`);
            }

            const content = fs.readFileSync(workflowPath, 'utf8');
            const hash = this.generateHash(content);
            const timestamp = new Date().toISOString();
            
            const versionData = {
                version,
                description,
                tags,
                hash,
                timestamp,
                author: process.env.USER || 'unknown',
                size: content.length,
                workflow: workflowName
            };

            // Crear directorio para el workflow si no existe
            const workflowVersionsDir = path.join(this.versionsDir, workflowName);
            if (!fs.existsSync(workflowVersionsDir)) {
                fs.mkdirSync(workflowVersionsDir, { recursive: true });
            }

            // Guardar versión
            const versionPath = path.join(workflowVersionsDir, `${version}.yml`);
            fs.writeFileSync(versionPath, content);

            // Guardar metadatos de la versión
            const metadataPath = path.join(workflowVersionsDir, `${version}.json`);
            fs.writeFileSync(metadataPath, JSON.stringify(versionData, null, 2));

            // Actualizar metadatos globales
            const metadata = this.getMetadata();
            if (!metadata[workflowName]) {
                metadata[workflowName] = [];
            }
            
            // Verificar si la versión ya existe
            const existingIndex = metadata[workflowName].findIndex(v => v.version === version);
            if (existingIndex >= 0) {
                metadata[workflowName][existingIndex] = versionData;
            } else {
                metadata[workflowName].push(versionData);
            }

            // Ordenar por timestamp (más reciente primero)
            metadata[workflowName].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Limitar número de versiones
            if (metadata[workflowName].length > this.config.maxVersions) {
                const toRemove = metadata[workflowName].slice(this.config.maxVersions);
                toRemove.forEach(v => {
                    const oldVersionPath = path.join(workflowVersionsDir, `${v.version}.yml`);
                    const oldMetadataPath = path.join(workflowVersionsDir, `${v.version}.json`);
                    
                    if (fs.existsSync(oldVersionPath)) fs.unlinkSync(oldVersionPath);
                    if (fs.existsSync(oldMetadataPath)) fs.unlinkSync(oldMetadataPath);
                });
                
                metadata[workflowName] = metadata[workflowName].slice(0, this.config.maxVersions);
            }

            this.saveMetadata(metadata);
            
            this.log(`Versión ${version} creada para ${workflowName}`);
            return versionData;
        } catch (error) {
            this.log(`Error creando versión: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    listVersions(workflowName = null) {
        try {
            const metadata = this.getMetadata();
            
            if (workflowName) {
                return metadata[workflowName] || [];
            }
            
            return metadata;
        } catch (error) {
            this.log(`Error listando versiones: ${error.message}`, 'ERROR');
            return {};
        }
    }

    getVersion(workflowName, version) {
        try {
            const versionPath = path.join(this.versionsDir, workflowName, `${version}.yml`);
            const metadataPath = path.join(this.versionsDir, workflowName, `${version}.json`);
            
            if (!fs.existsSync(versionPath)) {
                throw new Error(`Versión ${version} de ${workflowName} no encontrada`);
            }

            const content = fs.readFileSync(versionPath, 'utf8');
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            
            return {
                content,
                metadata
            };
        } catch (error) {
            this.log(`Error obteniendo versión: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    restoreVersion(workflowName, version) {
        try {
            const versionData = this.getVersion(workflowName, version);
            const workflowPath = path.join(this.workflowsDir, `${workflowName}.yml`);
            
            // Crear backup de la versión actual
            if (this.config.autoBackup && fs.existsSync(workflowPath)) {
                const currentContent = fs.readFileSync(workflowPath, 'utf8');
                const currentHash = this.generateHash(currentContent);
                const backupVersion = `backup-${Date.now()}`;
                
                this.createVersion(workflowName, backupVersion, 'Backup automático antes de restaurar', ['backup']);
            }
            
            // Restaurar versión
            fs.writeFileSync(workflowPath, versionData.content);
            
            this.log(`Versión ${version} restaurada para ${workflowName}`);
            return versionData.metadata;
        } catch (error) {
            this.log(`Error restaurando versión: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    compareVersions(workflowName, version1, version2) {
        try {
            const v1Data = this.getVersion(workflowName, version1);
            const v2Data = this.getVersion(workflowName, version2);
            
            const lines1 = v1Data.content.split('\n');
            const lines2 = v2Data.content.split('\n');
            
            const diff = {
                workflow: workflowName,
                version1: {
                    version: version1,
                    timestamp: v1Data.metadata.timestamp,
                    size: v1Data.metadata.size
                },
                version2: {
                    version: version2,
                    timestamp: v2Data.metadata.timestamp,
                    size: v2Data.metadata.size
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
            
            // Comparación simple línea por línea
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
        } catch (error) {
            this.log(`Error comparando versiones: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    deleteVersion(workflowName, version) {
        try {
            const metadata = this.getMetadata();
            
            if (!metadata[workflowName]) {
                throw new Error(`Workflow ${workflowName} no encontrado`);
            }
            
            const versionIndex = metadata[workflowName].findIndex(v => v.version === version);
            if (versionIndex === -1) {
                throw new Error(`Versión ${version} no encontrada`);
            }
            
            // Eliminar archivos
            const versionPath = path.join(this.versionsDir, workflowName, `${version}.yml`);
            const metadataPath = path.join(this.versionsDir, workflowName, `${version}.json`);
            
            if (fs.existsSync(versionPath)) fs.unlinkSync(versionPath);
            if (fs.existsSync(metadataPath)) fs.unlinkSync(metadataPath);
            
            // Actualizar metadatos
            metadata[workflowName].splice(versionIndex, 1);
            this.saveMetadata(metadata);
            
            this.log(`Versión ${version} eliminada de ${workflowName}`);
        } catch (error) {
            this.log(`Error eliminando versión: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    exportVersion(workflowName, version, format = 'yaml') {
        try {
            const versionData = this.getVersion(workflowName, version);
            
            switch (format.toLowerCase()) {
                case 'yaml':
                case 'yml':
                    return versionData.content;
                case 'json':
                    return JSON.stringify({
                        metadata: versionData.metadata,
                        content: versionData.content
                    }, null, 2);
                case 'metadata':
                    return JSON.stringify(versionData.metadata, null, 2);
                default:
                    throw new Error(`Formato ${format} no soportado`);
            }
        } catch (error) {
            this.log(`Error exportando versión: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    getVersionHistory(workflowName) {
        try {
            const metadata = this.getMetadata();
            const versions = metadata[workflowName] || [];
            
            return versions.map(v => ({
                version: v.version,
                description: v.description,
                timestamp: v.timestamp,
                author: v.author,
                tags: v.tags,
                size: v.size
            }));
        } catch (error) {
            this.log(`Error obteniendo historial: ${error.message}`, 'ERROR');
            return [];
        }
    }

    searchVersions(query, workflowName = null) {
        try {
            const metadata = this.getMetadata();
            const results = [];
            
            Object.entries(metadata).forEach(([wfName, versions]) => {
                if (workflowName && wfName !== workflowName) return;
                
                versions.forEach(version => {
                    const searchText = `${wfName} ${version.version} ${version.description} ${version.tags.join(' ')}`.toLowerCase();
                    
                    if (searchText.includes(query.toLowerCase())) {
                        results.push({
                            workflow: wfName,
                            ...version
                        });
                    }
                });
            });
            
            return results;
        } catch (error) {
            this.log(`Error buscando versiones: ${error.message}`, 'ERROR');
            return [];
        }
    }
}

// CLI Interface
if (require.main === module) {
    const manager = new WorkflowVersionManager();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'create':
            const workflow = args[1];
            const version = args[2];
            const description = args[3] || '';
            const tags = args[4] ? args[4].split(',') : [];
            
            if (workflow && version) {
                try {
                    const result = manager.createVersion(workflow, version, description, tags);
                    console.log(`✅ Versión creada: ${JSON.stringify(result, null, 2)}`);
                } catch (error) {
                    console.error(`❌ Error: ${error.message}`);
                }
            } else {
                console.log('Uso: node version-manager.js create <workflow> <version> [description] [tags]');
            }
            break;
            
        case 'list':
            const targetWorkflow = args[1];
            const versions = manager.listVersions(targetWorkflow);
            
            if (targetWorkflow) {
                console.log(`Versiones de ${targetWorkflow}:`);
                versions.forEach(v => {
                    console.log(`  ${v.version} - ${v.description} (${v.timestamp})`);
                });
            } else {
                console.log('Workflows con versiones:');
                Object.entries(versions).forEach(([wf, vers]) => {
                    console.log(`  ${wf}: ${vers.length} versiones`);
                });
            }
            break;
            
        case 'restore':
            const restoreWorkflow = args[1];
            const restoreVersion = args[2];
            
            if (restoreWorkflow && restoreVersion) {
                try {
                    const result = manager.restoreVersion(restoreWorkflow, restoreVersion);
                    console.log(`✅ Versión restaurada: ${JSON.stringify(result, null, 2)}`);
                } catch (error) {
                    console.error(`❌ Error: ${error.message}`);
                }
            } else {
                console.log('Uso: node version-manager.js restore <workflow> <version>');
            }
            break;
            
        case 'compare':
            const compareWorkflow = args[1];
            const v1 = args[2];
            const v2 = args[3];
            
            if (compareWorkflow && v1 && v2) {
                try {
                    const diff = manager.compareVersions(compareWorkflow, v1, v2);
                    console.log(`Comparación entre ${v1} y ${v2}:`);
                    console.log(JSON.stringify(diff.summary, null, 2));
                } catch (error) {
                    console.error(`❌ Error: ${error.message}`);
                }
            } else {
                console.log('Uso: node version-manager.js compare <workflow> <version1> <version2>');
            }
            break;
            
        case 'delete':
            const deleteWorkflow = args[1];
            const deleteVersion = args[2];
            
            if (deleteWorkflow && deleteVersion) {
                try {
                    manager.deleteVersion(deleteWorkflow, deleteVersion);
                    console.log(`✅ Versión eliminada`);
                } catch (error) {
                    console.error(`❌ Error: ${error.message}`);
                }
            } else {
                console.log('Uso: node version-manager.js delete <workflow> <version>');
            }
            break;
            
        case 'search':
            const query = args[1];
            const searchWorkflow = args[2];
            
            if (query) {
                const results = manager.searchVersions(query, searchWorkflow);
                console.log(`Resultados de búsqueda para "${query}":`);
                results.forEach(r => {
                    console.log(`  ${r.workflow}@${r.version} - ${r.description}`);
                });
            } else {
                console.log('Uso: node version-manager.js search <query> [workflow]');
            }
            break;
            
        default:
            console.log(`
Version Manager - Comandos disponibles:
  create <workflow> <version> [desc] [tags]  - Crear nueva versión
  list [workflow]                           - Listar versiones
  restore <workflow> <version>              - Restaurar versión
  compare <workflow> <v1> <v2>              - Comparar versiones
  delete <workflow> <version>               - Eliminar versión
  search <query> [workflow]                 - Buscar versiones
            `);
    }
}

module.exports = WorkflowVersionManager;

// ============================================================================
// SISTEMA AVANZADO DE ANÁLISIS Y OPTIMIZACIÓN DE VERSIONES
// ============================================================================

class VersionAnalyzer {
    constructor() {
        this.analysisCache = new Map();
        this.performanceMetrics = new Map();
        this.dependencyGraph = new Map();
    }

    analyzeVersion(workflowName, version, content) {
        const analysis = {
            complexity: this.calculateComplexity(content),
            dependencies: this.extractDependencies(content),
            security: this.analyzeSecurity(content),
            performance: this.analyzePerformance(content),
            maintainability: this.calculateMaintainability(content),
            risks: this.identifyRisks(content),
            recommendations: []
        };

        // Generar recomendaciones basadas en el análisis
        if (analysis.complexity > 10) {
            analysis.recommendations.push({
                type: 'complexity',
                priority: 'high',
                description: 'Workflow complexity is too high, consider splitting into smaller workflows',
                impact: 'maintainability'
            });
        }

        if (analysis.security.vulnerabilities.length > 0) {
            analysis.recommendations.push({
                type: 'security',
                priority: 'critical',
                description: `Security vulnerabilities detected: ${analysis.security.vulnerabilities.join(', ')}`,
                impact: 'security'
            });
        }

        if (analysis.performance.estimatedDuration > 300) {
            analysis.recommendations.push({
                type: 'performance',
                priority: 'medium',
                description: 'Workflow execution time is too long, consider optimization',
                impact: 'performance'
            });
        }

        this.analysisCache.set(`${workflowName}@${version}`, analysis);
        return analysis;
    }

    calculateComplexity(content) {
        // Análisis de complejidad ciclomática
        const lines = content.split('\n');
        let complexity = 0;
        
        lines.forEach(line => {
            if (line.includes('if') || line.includes('when') || line.includes('condition')) complexity++;
            if (line.includes('for') || line.includes('foreach')) complexity++;
            if (line.includes('while') || line.includes('loop')) complexity++;
            if (line.includes('try') || line.includes('catch')) complexity++;
        });

        return complexity;
    }

    extractDependencies(content) {
        const dependencies = {
            actions: [],
            services: [],
            external: [],
            internal: []
        };

        // Extraer dependencias de GitHub Actions
        const actionMatches = content.match(/uses:\s*([^\s]+)/g) || [];
        dependencies.actions = actionMatches.map(match => match.replace('uses:', '').trim());

        // Extraer servicios externos
        const serviceMatches = content.match(/(https?:\/\/[^\s]+)/g) || [];
        dependencies.external = serviceMatches;

        // Extraer dependencias internas
        const internalMatches = content.match(/\.\/[^\s]+/g) || [];
        dependencies.internal = internalMatches;

        return dependencies;
    }

    analyzeSecurity(content) {
        const vulnerabilities = [];
        const securityScore = 100;

        // Detectar patrones inseguros
        if (content.includes('password') && !content.includes('${{ secrets.')) {
            vulnerabilities.push('Hardcoded password detected');
        }

        if (content.includes('token') && !content.includes('${{ secrets.')) {
            vulnerabilities.push('Hardcoded token detected');
        }

        if (content.includes('sudo') || content.includes('root')) {
            vulnerabilities.push('Privileged execution detected');
        }

        if (content.includes('curl') && content.includes('http://')) {
            vulnerabilities.push('Insecure HTTP connection detected');
        }

        return {
            score: securityScore - (vulnerabilities.length * 10),
            vulnerabilities,
            recommendations: vulnerabilities.length > 0 ? [
                'Use secrets for sensitive data',
                'Avoid privileged execution',
                'Use HTTPS for external connections'
            ] : []
        };
    }

    analyzePerformance(content) {
        const lines = content.split('\n');
        let estimatedDuration = 0;
        let resourceUsage = { cpu: 0, memory: 0, disk: 0 };

        lines.forEach(line => {
            if (line.includes('timeout-minutes')) {
                const timeoutMatch = line.match(/timeout-minutes:\s*(\d+)/);
                if (timeoutMatch) {
                    estimatedDuration = Math.max(estimatedDuration, parseInt(timeoutMatch[1]));
                }
            }

            if (line.includes('runs-on')) {
                if (line.includes('ubuntu-latest')) {
                    resourceUsage.cpu += 2;
                    resourceUsage.memory += 4;
                } else if (line.includes('windows-latest')) {
                    resourceUsage.cpu += 2;
                    resourceUsage.memory += 8;
                }
            }
        });

        return {
            estimatedDuration,
            resourceUsage,
            efficiency: estimatedDuration > 0 ? 100 / estimatedDuration : 100
        };
    }

    calculateMaintainability(content) {
        const lines = content.split('\n');
        const totalLines = lines.length;
        const commentLines = lines.filter(line => line.trim().startsWith('#')).length;
        const emptyLines = lines.filter(line => line.trim() === '').length;
        const codeLines = totalLines - commentLines - emptyLines;

        const maintainabilityIndex = Math.max(0, 171 - 5.2 * Math.log(codeLines) - 0.23 * this.calculateComplexity(content) - 16.2 * Math.log(totalLines));

        return {
            index: maintainabilityIndex,
            score: maintainabilityIndex > 65 ? 'A' : maintainabilityIndex > 50 ? 'B' : maintainabilityIndex > 35 ? 'C' : 'D',
            metrics: {
                totalLines,
                codeLines,
                commentLines,
                commentRatio: commentLines / totalLines
            }
        };
    }

    identifyRisks(content) {
        const risks = [];

        if (content.includes('delete') || content.includes('rm -rf')) {
            risks.push({
                type: 'destructive',
                severity: 'high',
                description: 'Destructive operations detected'
            });
        }

        if (content.includes('sudo') || content.includes('root')) {
            risks.push({
                type: 'privilege',
                severity: 'medium',
                description: 'Privileged operations detected'
            });
        }

        if (content.includes('curl') && content.includes('| bash')) {
            risks.push({
                type: 'security',
                severity: 'critical',
                description: 'Remote code execution detected'
            });
        }

        return risks;
    }

    getAnalysis(workflowName, version) {
        return this.analysisCache.get(`${workflowName}@${version}`) || null;
    }

    generateReport(workflowName) {
        const versions = this.analysisCache.keys()
            .filter(key => key.startsWith(workflowName))
            .map(key => key.split('@')[1]);

        const analyses = versions.map(v => this.getAnalysis(workflowName, v));
        
        return {
            workflowName,
            totalVersions: versions.length,
            averageComplexity: analyses.reduce((sum, a) => sum + a.complexity, 0) / analyses.length,
            averageSecurityScore: analyses.reduce((sum, a) => sum + a.security.score, 0) / analyses.length,
            averageMaintainability: analyses.reduce((sum, a) => sum + a.maintainability.index, 0) / analyses.length,
            totalVulnerabilities: analyses.reduce((sum, a) => sum + a.security.vulnerabilities.length, 0),
            recommendations: analyses.flatMap(a => a.recommendations)
        };
    }
}

// Extender WorkflowVersionManager con análisis
WorkflowVersionManager.prototype.analyzer = new VersionAnalyzer();

// Sobrescribir createVersion para incluir análisis
const originalCreateVersion = WorkflowVersionManager.prototype.createVersion;
WorkflowVersionManager.prototype.createVersion = function(workflowName, version, description = '', tags = []) {
    const result = originalCreateVersion.call(this, workflowName, version, description, tags);
    
    // Analizar la versión creada
    const analysis = this.analyzer.analyzeVersion(workflowName, version, result.content);
    
    this.log(`Análisis de versión ${version}: Complejidad=${analysis.complexity}, Seguridad=${analysis.security.score}, Mantenibilidad=${analysis.maintainability.score}`);
    
    return result;
};

// Añadir métodos de análisis al VersionManager
WorkflowVersionManager.prototype.getVersionAnalysis = function(workflowName, version) {
    return this.analyzer.getAnalysis(workflowName, version);
};

WorkflowVersionManager.prototype.generateAnalysisReport = function(workflowName) {
    return this.analyzer.generateReport(workflowName);
};

WorkflowVersionManager.prototype.analyzeAllVersions = function(workflowName) {
    const versions = this.listVersions(workflowName);
    
    versions.forEach(version => {
        const versionData = this.getVersion(workflowName, version.version);
        this.analyzer.analyzeVersion(workflowName, version.version, versionData.content);
    });
    
    this.log(`Análisis completado para ${versions.length} versiones de ${workflowName}`);
}; 