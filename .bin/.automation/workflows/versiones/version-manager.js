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