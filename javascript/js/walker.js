/**
 * Sistema Avanzado de Navegación y Exploración - Metaverso Crypto World Virtual 3D
 * Walker avanzado para exploración del metaverso
 */

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Walker = void 0;
const path_1 = require("path");
const utils_1 = require("fdir/dist/utils");
const joinPath = __importStar(require("../api/functions/join-path"));
const pushDirectory = __importStar(require("../api/functions/push-directory"));
const pushFile = __importStar(require("../api/functions/push-file"));
const getArray = __importStar(require("../api/functions/get-array"));
const groupFiles = __importStar(require("../api/functions/group-files"));
const resolveSymlink = __importStar(require("../api/functions/resolve-symlink"));
const invokeCallback = __importStar(require("../api/functions/invoke-callback"));
const walkDirectory = __importStar(require("../api/functions/walk-directory"));
const queue_1 = require("../api/queue");
const counter_1 = require("../api/counter");
class AdvancedWalker {
    root;
    options;
    callback;
    states;
    metrics;
    processingQueue;
    maxConcurrent;
    activeOperations;
    cache;
    cacheSize;
    events;
    constructor(root, options = {}, callback) {
        this.root = root;
        this.options = {
            maxDepth: 10,
            filters: [],
            exclude: null,
            maxFiles: null,
            resolveSymlinks: false,
            excludeSymlinks: false,
            useRealPaths: false,
            pathSeparator: '/',
            signal: null,
            ...options
        };
        this.callback = callback;
        
        // Estados del walker
        this.states = {
            isWalking: false,
            isPaused: false,
            currentDepth: 0,
            currentPath: '',
            processedItems: 0,
            totalItems: 0
        };
        
        // Métricas
        this.metrics = {
            filesFound: 0,
            directoriesFound: 0,
            symlinksFound: 0,
            errors: 0,
            startTime: 0,
            endTime: 0
        };
        
        // Cola de procesamiento
        this.processingQueue = [];
        this.maxConcurrent = 5;
        this.activeOperations = 0;
        
        // Cache de resultados
        this.cache = new Map();
        this.cacheSize = 1000;
        
        // Eventos
        this.events = new EventTarget();
        
        console.log('🚶 Walker Avanzado inicializado');
    }
    
    /**
     * Iniciar exploración
     */
    async start() {
        this.states.isWalking = true;
        this.metrics.startTime = performance.now();
        
        try {
            const results = await this.walkDirectory(this.root, 0);
            
            this.metrics.endTime = performance.now();
            this.states.isWalking = false;
            
            this.events.dispatchEvent(new CustomEvent('walk-completed', {
                detail: { results, metrics: this.getMetrics() }
            }));
            
            if (this.callback) {
                this.callback(null, results);
            }
            
            return results;
            
        } catch (error) {
            this.metrics.errors++;
            this.states.isWalking = false;
            
            this.events.dispatchEvent(new CustomEvent('walk-error', {
                detail: { error }
            }));
            
            if (this.callback) {
                this.callback(error);
            }
            
            throw error;
        }
    }
    
    /**
     * Explorar directorio recursivamente
     */
    async walkDirectory(path, depth) {
        if (depth > this.options.maxDepth) {
            return [];
        }
        
        this.states.currentDepth = depth;
        this.states.currentPath = path;
        
        try {
            const entries = await this.readDirectory(path);
            const results = [];
            
            for (const entry of entries) {
                if (this.states.isPaused) {
                    await this.waitForResume();
                }
                
                const entryPath = this.joinPath(path, entry.name);
                
                if (entry.isFile()) {
                    const fileResult = await this.processFile(entryPath, entry);
                    if (fileResult) results.push(fileResult);
                } else if (entry.isDirectory()) {
                    const dirResult = await this.processDirectory(entryPath, entry);
                    if (dirResult) results.push(dirResult);
                    
                    // Explorar subdirectorio
                    const subResults = await this.walkDirectory(entryPath, depth + 1);
                    results.push(...subResults);
                } else if (entry.isSymbolicLink()) {
                    const symlinkResult = await this.processSymlink(entryPath, entry);
                    if (symlinkResult) results.push(symlinkResult);
                }
                
                this.states.processedItems++;
            }
            
            return results;
            
        } catch (error) {
            this.metrics.errors++;
            console.error(`Error explorando directorio ${path}:`, error);
            return [];
        }
    }
    
    /**
     * Leer directorio
     */
    async readDirectory(path) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            fs.readdir(path, { withFileTypes: true }, (err, entries) => {
                if (err) reject(err);
                else resolve(entries);
            });
        });
    }
    
    /**
     * Procesar archivo
     */
    async processFile(path, entry) {
        this.metrics.filesFound++;
        
        const fileInfo = {
            type: 'file',
            path: path,
            name: entry.name,
            size: await this.getFileSize(path),
            extension: this.getFileExtension(entry.name),
            metadata: await this.getFileMetadata(path)
        };
        
        // Aplicar filtros
        if (this.shouldInclude(fileInfo)) {
            this.events.dispatchEvent(new CustomEvent('file-found', {
                detail: { file: fileInfo }
            }));
            
            return fileInfo;
        }
        
        return null;
    }
    
    /**
     * Procesar directorio
     */
    async processDirectory(path, entry) {
        this.metrics.directoriesFound++;
        
        const dirInfo = {
            type: 'directory',
            path: path,
            name: entry.name,
            metadata: await this.getDirectoryMetadata(path)
        };
        
        // Aplicar filtros
        if (this.shouldInclude(dirInfo)) {
            this.events.dispatchEvent(new CustomEvent('directory-found', {
                detail: { directory: dirInfo }
            }));
            
            return dirInfo;
        }
        
        return null;
    }
    
    /**
     * Procesar enlace simbólico
     */
    async processSymlink(path, entry) {
        this.metrics.symlinksFound++;
        
        const symlinkInfo = {
            type: 'symlink',
            path: path,
            name: entry.name,
            target: await this.getSymlinkTarget(path),
            metadata: await this.getSymlinkMetadata(path)
        };
        
        // Aplicar filtros
        if (this.shouldInclude(symlinkInfo)) {
            this.events.dispatchEvent(new CustomEvent('symlink-found', {
                detail: { symlink: symlinkInfo }
            }));
            
            return symlinkInfo;
        }
        
        return null;
    }
    
    /**
     * Obtener tamaño de archivo
     */
    async getFileSize(path) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            fs.stat(path, (err, stats) => {
                if (err) reject(err);
                else resolve(stats.size);
            });
        });
    }
    
    /**
     * Obtener extensión de archivo
     */
    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    }
    
    /**
     * Obtener metadatos de archivo
     */
    async getFileMetadata(path) {
        try {
            const fs = require('fs');
            const stats = await new Promise((resolve, reject) => {
                fs.stat(path, (err, stats) => {
                    if (err) reject(err);
                    else resolve(stats);
                });
            });
            
            return {
                created: stats.birthtime,
                modified: stats.mtime,
                accessed: stats.atime,
                permissions: stats.mode,
                owner: stats.uid,
                group: stats.gid
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Obtener metadatos de directorio
     */
    async getDirectoryMetadata(path) {
        try {
            const fs = require('fs');
            const stats = await new Promise((resolve, reject) => {
                fs.stat(path, (err, stats) => {
                    if (err) reject(err);
                    else resolve(stats);
                });
            });
            
            return {
                created: stats.birthtime,
                modified: stats.mtime,
                accessed: stats.atime,
                permissions: stats.mode,
                owner: stats.uid,
                group: stats.gid
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Obtener objetivo de enlace simbólico
     */
    async getSymlinkTarget(path) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            fs.readlink(path, (err, target) => {
                if (err) reject(err);
                else resolve(target);
            });
        });
    }
    
    /**
     * Obtener metadatos de enlace simbólico
     */
    async getSymlinkMetadata(path) {
        try {
            const fs = require('fs');
            const stats = await new Promise((resolve, reject) => {
                fs.lstat(path, (err, stats) => {
                    if (err) reject(err);
                    else resolve(stats);
                });
            });
            
            return {
                created: stats.birthtime,
                modified: stats.mtime,
                accessed: stats.atime,
                permissions: stats.mode
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Verificar si debe incluir el elemento
     */
    shouldInclude(item) {
        // Aplicar filtros
        if (this.options.filters.length > 0) {
            const shouldInclude = this.options.filters.some(filter => {
                if (typeof filter === 'function') {
                    return filter(item);
                } else if (typeof filter === 'string') {
                    return item.name.includes(filter);
                } else if (filter instanceof RegExp) {
                    return filter.test(item.name);
                }
                return false;
            });
            
            if (!shouldInclude) return false;
        }
        
        // Aplicar exclusión
        if (this.options.exclude) {
            if (typeof this.options.exclude === 'function') {
                if (this.options.exclude(item.name, item.path)) {
                    return false;
                }
            } else if (typeof this.options.exclude === 'string') {
                if (item.name.includes(this.options.exclude)) {
                    return false;
                }
            } else if (this.options.exclude instanceof RegExp) {
                if (this.options.exclude.test(item.name)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Unir rutas
     */
    joinPath(base, name) {
        return base.endsWith(this.options.pathSeparator) 
            ? base + name 
            : base + this.options.pathSeparator + name;
    }
    
    /**
     * Esperar a que se reanude
     */
    async waitForResume() {
        return new Promise(resolve => {
            const checkResume = () => {
                if (!this.states.isPaused) {
                    resolve();
                } else {
                    setTimeout(checkResume, 100);
                }
            };
            checkResume();
        });
    }
    
    /**
     * Pausar exploración
     */
    pause() {
        this.states.isPaused = true;
        this.events.dispatchEvent(new CustomEvent('walk-paused'));
    }
    
    /**
     * Reanudar exploración
     */
    resume() {
        this.states.isPaused = false;
        this.events.dispatchEvent(new CustomEvent('walk-resumed'));
    }
    
    /**
     * Detener exploración
     */
    stop() {
        this.states.isWalking = false;
        this.states.isPaused = false;
        this.events.dispatchEvent(new CustomEvent('walk-stopped'));
    }
    
    /**
     * Obtener estado del walker
     */
    getState() {
        return this.states;
    }
    
    /**
     * Obtener métricas
     */
    getMetrics() {
        return {
            ...this.metrics,
            duration: this.metrics.endTime - this.metrics.startTime,
            processedItems: this.states.processedItems,
            isWalking: this.states.isWalking,
            isPaused: this.states.isPaused
        };
    }
    
    /**
     * Crear walker especializado para modelos 3D
     */
    createModelWalker(root, options = {}) {
        const modelFilters = [
            '.gltf', '.glb', '.obj', '.fbx', '.dae', '.ply', '.stl'
        ];
        
        return new AdvancedWalker(root, {
            ...options,
            filters: [
                ...modelFilters,
                ...(options.filters || [])
            ]
        });
    }
    
    /**
     * Crear walker especializado para texturas
     */
    createTextureWalker(root, options = {}) {
        const textureFilters = [
            '.jpg', '.jpeg', '.png', '.bmp', '.tga', '.hdr', '.exr'
        ];
        
        return new AdvancedWalker(root, {
            ...options,
            filters: [
                ...textureFilters,
                ...(options.filters || [])
            ]
        });
    }
    
    /**
     * Crear walker especializado para audio
     */
    createAudioWalker(root, options = {}) {
        const audioFilters = [
            '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'
        ];
        
        return new AdvancedWalker(root, {
            ...options,
            filters: [
                ...audioFilters,
                ...(options.filters || [])
            ]
        });
    }
    
    /**
     * Crear walker especializado para shaders
     */
    createShaderWalker(root, options = {}) {
        const shaderFilters = [
            '.vert', '.frag', '.glsl', '.shader'
        ];
        
        return new AdvancedWalker(root, {
            ...options,
            filters: [
                ...shaderFilters,
                ...(options.filters || [])
            ]
        });
    }
    
    /**
     * Crear walker especializado para blockchain
     */
    createBlockchainWalker(root, options = {}) {
        const blockchainFilters = [
            '.json', '.abi', '.bin', '.sol', '.vy'
        ];
        
        return new AdvancedWalker(root, {
            ...options,
            filters: [
                ...blockchainFilters,
                ...(options.filters || [])
            ]
        });
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        this.stop();
        this.cache.clear();
        this.processingQueue = [];
        this.events = null;
        
        console.log('🧹 Walker Avanzado limpiado');
    }
}

// Clase de compatibilidad con el código original
class Walker extends AdvancedWalker {
    constructor(root, options, callback) {
        super(root, options, callback);
        console.log('🚶 Walker básico inicializado (compatibilidad)');
    }
    
    start() {
        return super.start();
    }
}

// Exportar para uso global
window.AdvancedWalker = AdvancedWalker;
window.Walker = Walker;

// Exportar para módulos
if (typeof exports !== 'undefined') {
    exports.Walker = Walker;
    exports.AdvancedWalker = AdvancedWalker;
}
