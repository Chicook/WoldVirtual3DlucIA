#!/usr/bin/env node

/**
 * 🔍 Vulnerability Scanner - Metaverso Web3
 * Escanea vulnerabilidades en código, dependencias y configuraciones
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { performance } = require('perf_hooks');

// Configuración
const CONFIG = {
    scanTypes: {
        dependencies: true,
        code: true,
        config: true,
        secrets: true,
        permissions: true
    },
    outputFile: `vulnerability-scan-${new Date().toISOString().split('T')[0]}.json`,
    severityLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
};

// Colores para consola
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

class VulnerabilityScanner {
    constructor() {
        this.vulnerabilities = [];
        this.scanResults = {
            timestamp: new Date().toISOString(),
            duration: 0,
            totalVulnerabilities: 0,
            bySeverity: {
                CRITICAL: 0,
                HIGH: 0,
                MEDIUM: 0,
                LOW: 0
            },
            byType: {
                dependencies: 0,
                code: 0,
                config: 0,
                secrets: 0,
                permissions: 0
            }
        };
        this.startTime = performance.now();
    }

    log(message, color = 'reset', level = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`${colors[color]}[${timestamp}] [${level}] ${message}${colors.reset}`);
    }

    // Escanear dependencias
    async scanDependencies() {
        this.log('🔍 Escaneando dependencias...', 'blue');
        
        const results = [];

        try {
            // npm audit
            if (fs.existsSync('package.json')) {
                try {
                    const auditOutput = execSync('npm audit --json', { encoding: 'utf8', stdio: 'pipe' });
                    const auditData = JSON.parse(auditOutput);
                    
                    if (auditData.vulnerabilities) {
                        Object.keys(auditData.vulnerabilities).forEach(pkg => {
                            const vuln = auditData.vulnerabilities[pkg];
                            vuln.forEach(v => {
                                results.push({
                                    type: 'dependency',
                                    severity: v.severity.toUpperCase(),
                                    title: v.title,
                                    description: v.description,
                                    package: pkg,
                                    version: v.version,
                                    recommendation: v.recommendation,
                                    file: 'package.json'
                                });
                            });
                        });
                    }
                } catch (error) {
                    this.log(`Error en npm audit: ${error.message}`, 'yellow');
                }
            }

            // Verificar dependencias desactualizadas
            try {
                const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8', stdio: 'pipe' });
                const outdatedData = JSON.parse(outdatedOutput);
                
                Object.keys(outdatedData).forEach(pkg => {
                    const data = outdatedData[pkg];
                    results.push({
                        type: 'dependency',
                        severity: 'MEDIUM',
                        title: `Dependencia desactualizada: ${pkg}`,
                        description: `La dependencia ${pkg} está desactualizada. Actual: ${data.current}, Última: ${data.latest}`,
                        package: pkg,
                        version: data.current,
                        recommendation: `Actualizar a la versión ${data.latest}`,
                        file: 'package.json'
                    });
                });
            } catch (error) {
                // npm outdated falla si no hay dependencias desactualizadas
            }

        } catch (error) {
            this.log(`Error escaneando dependencias: ${error.message}`, 'red');
        }

        return results;
    }

    // Escanear código
    async scanCode() {
        this.log('🔍 Escaneando código...', 'blue');
        
        const results = [];
        const codePatterns = [
            {
                pattern: /eval\s*\(/g,
                severity: 'CRITICAL',
                title: 'Uso de eval()',
                description: 'eval() puede ejecutar código arbitrario y es una vulnerabilidad de seguridad crítica'
            },
            {
                pattern: /innerHTML\s*=/g,
                severity: 'HIGH',
                title: 'Uso de innerHTML',
                description: 'innerHTML puede causar XSS si se usa con contenido no confiable'
            },
            {
                pattern: /document\.write\s*\(/g,
                severity: 'HIGH',
                title: 'Uso de document.write()',
                description: 'document.write() puede causar XSS si se usa con contenido no confiable'
            },
            {
                pattern: /localStorage\s*\.\s*setItem\s*\(/g,
                severity: 'MEDIUM',
                title: 'Uso de localStorage',
                description: 'localStorage no es seguro para datos sensibles'
            },
            {
                pattern: /sessionStorage\s*\.\s*setItem\s*\(/g,
                severity: 'MEDIUM',
                title: 'Uso de sessionStorage',
                description: 'sessionStorage no es seguro para datos sensibles'
            },
            {
                pattern: /console\.log\s*\(/g,
                severity: 'LOW',
                title: 'Uso de console.log()',
                description: 'console.log() puede exponer información sensible en producción'
            }
        ];

        const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html'];
        
        function scanDirectory(dir) {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    scanDirectory(filePath);
                } else if (stat.isFile() && fileExtensions.some(ext => file.endsWith(ext))) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        codePatterns.forEach(pattern => {
                            const matches = content.match(pattern.pattern);
                            if (matches) {
                                results.push({
                                    type: 'code',
                                    severity: pattern.severity,
                                    title: pattern.title,
                                    description: pattern.description,
                                    file: filePath,
                                    line: content.split('\n').findIndex(line => line.match(pattern.pattern)) + 1,
                                    matches: matches.length
                                });
                            }
                        });
                    } catch (error) {
                        this.log(`Error leyendo archivo ${filePath}: ${error.message}`, 'yellow');
                    }
                }
            });
        }

        scanDirectory('.');
        return results;
    }

    // Escanear configuraciones
    async scanConfig() {
        this.log('🔍 Escaneando configuraciones...', 'blue');
        
        const results = [];
        const configFiles = [
            'package.json',
            'hardhat.config.js',
            'truffle-config.js',
            'webpack.config.js',
            'vite.config.js',
            '.env',
            '.env.local',
            '.env.production'
        ];

        configFiles.forEach(configFile => {
            if (fs.existsSync(configFile)) {
                try {
                    const content = fs.readFileSync(configFile, 'utf8');
                    
                    // Verificar configuraciones inseguras
                    const insecurePatterns = [
                        {
                            pattern: /"debug":\s*true/g,
                            severity: 'HIGH',
                            title: 'Modo debug habilitado',
                            description: 'El modo debug puede exponer información sensible'
                        },
                        {
                            pattern: /"dev":\s*true/g,
                            severity: 'MEDIUM',
                            title: 'Modo desarrollo en producción',
                            description: 'El modo desarrollo puede exponer información de debugging'
                        },
                        {
                            pattern: /NODE_ENV\s*=\s*['"]development['"]/g,
                            severity: 'MEDIUM',
                            title: 'NODE_ENV en desarrollo',
                            description: 'NODE_ENV debería ser production en entornos de producción'
                        }
                    ];

                    insecurePatterns.forEach(pattern => {
                        const matches = content.match(pattern.pattern);
                        if (matches) {
                            results.push({
                                type: 'config',
                                severity: pattern.severity,
                                title: pattern.title,
                                description: pattern.description,
                                file: configFile,
                                line: content.split('\n').findIndex(line => line.match(pattern.pattern)) + 1
                            });
                        }
                    });
                } catch (error) {
                    this.log(`Error leyendo archivo ${configFile}: ${error.message}`, 'yellow');
                }
            }
        });

        return results;
    }

    // Escanear secretos
    async scanSecrets() {
        this.log('🔍 Escaneando secretos...', 'blue');
        
        const results = [];
        const secretPatterns = [
            {
                pattern: /(?:api[_-]?key|secret[_-]?key|private[_-]?key|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
                severity: 'CRITICAL',
                title: 'Secreto expuesto',
                description: 'Se encontró un posible secreto en el código'
            },
            {
                pattern: /(?:0x[a-fA-F0-9]{64})/g,
                severity: 'CRITICAL',
                title: 'Clave privada expuesta',
                description: 'Se encontró una posible clave privada de blockchain'
            },
            {
                pattern: /(?:mongodb|postgresql|mysql):\/\/[^@]+@[^/]+/g,
                severity: 'HIGH',
                title: 'Credenciales de base de datos expuestas',
                description: 'Se encontraron credenciales de base de datos en el código'
            }
        ];

        const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.env', '.json', '.yaml', '.yml'];
        
        function scanDirectoryForSecrets(dir) {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    scanDirectoryForSecrets(filePath);
                } else if (stat.isFile() && fileExtensions.some(ext => file.endsWith(ext))) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        
                        secretPatterns.forEach(pattern => {
                            const matches = content.match(pattern.pattern);
                            if (matches) {
                                results.push({
                                    type: 'secrets',
                                    severity: pattern.severity,
                                    title: pattern.title,
                                    description: pattern.description,
                                    file: filePath,
                                    line: content.split('\n').findIndex(line => line.match(pattern.pattern)) + 1,
                                    matches: matches.length
                                });
                            }
                        });
                    } catch (error) {
                        this.log(`Error leyendo archivo ${filePath}: ${error.message}`, 'yellow');
                    }
                }
            });
        }

        scanDirectoryForSecrets('.');
        return results;
    }

    // Escanear permisos
    async scanPermissions() {
        this.log('🔍 Escaneando permisos...', 'blue');
        
        const results = [];

        try {
            // Verificar permisos de archivos sensibles
            const sensitiveFiles = [
                '.env',
                '.env.local',
                '.env.production',
                '*.pem',
                '*.key',
                '*.crt'
            ];

            sensitiveFiles.forEach(pattern => {
                const files = this.findFiles(pattern);
                files.forEach(file => {
                    try {
                        const stats = fs.statSync(file);
                        const perms = stats.mode & 0o777;
                        
                        if (perms !== 0o600 && perms !== 0o400) {
                            results.push({
                                type: 'permissions',
                                severity: 'HIGH',
                                title: 'Permisos inseguros',
                                description: `El archivo ${file} tiene permisos inseguros (${perms.toString(8)})`,
                                file: file,
                                currentPerms: perms.toString(8),
                                recommendedPerms: '600'
                            });
                        }
                    } catch (error) {
                        this.log(`Error verificando permisos de ${file}: ${error.message}`, 'yellow');
                    }
                });
            });
        } catch (error) {
            this.log(`Error escaneando permisos: ${error.message}`, 'red');
        }

        return results;
    }

    // Función auxiliar para encontrar archivos
    findFiles(pattern) {
        const results = [];
        
        function scanDirectory(dir) {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    scanDirectory(filePath);
                } else if (stat.isFile()) {
                    if (pattern.includes('*')) {
                        const regex = new RegExp(pattern.replace('*', '.*'));
                        if (regex.test(file)) {
                            results.push(filePath);
                        }
                    } else if (file === pattern) {
                        results.push(filePath);
                    }
                }
            });
        }

        scanDirectory('.');
        return results;
    }

    // Ejecutar escaneo completo
    async runScan() {
        this.log('🚀 Iniciando escaneo de vulnerabilidades...', 'green');
        
        const allResults = [];

        if (CONFIG.scanTypes.dependencies) {
            const depResults = await this.scanDependencies();
            allResults.push(...depResults);
        }

        if (CONFIG.scanTypes.code) {
            const codeResults = await this.scanCode();
            allResults.push(...codeResults);
        }

        if (CONFIG.scanTypes.config) {
            const configResults = await this.scanConfig();
            allResults.push(...configResults);
        }

        if (CONFIG.scanTypes.secrets) {
            const secretResults = await this.scanSecrets();
            allResults.push(...secretResults);
        }

        if (CONFIG.scanTypes.permissions) {
            const permResults = await this.scanPermissions();
            allResults.push(...permResults);
        }

        // Procesar resultados
        this.vulnerabilities = allResults;
        this.scanResults.duration = ((performance.now() - this.startTime) / 1000).toFixed(2);
        this.scanResults.totalVulnerabilities = allResults.length;

        // Contar por severidad
        allResults.forEach(vuln => {
            this.scanResults.bySeverity[vuln.severity]++;
            this.scanResults.byType[vuln.type]++;
        });

        return this.scanResults;
    }

    // Mostrar resultados
    displayResults() {
        console.log(`\n${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}║                🔍 VULNERABILITY SCAN RESULTS                  ║${colors.reset}`);
        console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

        console.log(`${colors.blue}📊 SUMMARY:${colors.reset}`);
        console.log(`   Total vulnerabilities: ${this.scanResults.totalVulnerabilities}`);
        console.log(`   Duration: ${this.scanResults.duration}s`);
        console.log(`   Critical: ${colors.red}${this.scanResults.bySeverity.CRITICAL}${colors.reset}`);
        console.log(`   High: ${colors.red}${this.scanResults.bySeverity.HIGH}${colors.reset}`);
        console.log(`   Medium: ${colors.yellow}${this.scanResults.bySeverity.MEDIUM}${colors.reset}`);
        console.log(`   Low: ${colors.green}${this.scanResults.bySeverity.LOW}${colors.reset}`);

        if (this.vulnerabilities.length > 0) {
            console.log(`\n${colors.blue}🚨 VULNERABILITIES FOUND:${colors.reset}`);
            
            this.vulnerabilities.forEach((vuln, index) => {
                const color = vuln.severity === 'CRITICAL' ? 'red' : 
                             vuln.severity === 'HIGH' ? 'red' : 
                             vuln.severity === 'MEDIUM' ? 'yellow' : 'green';
                
                console.log(`\n${colors[color]}${index + 1}. ${vuln.title} (${vuln.severity})${colors.reset}`);
                console.log(`   File: ${vuln.file}${vuln.line ? `:${vuln.line}` : ''}`);
                console.log(`   Description: ${vuln.description}`);
                if (vuln.recommendation) {
                    console.log(`   Recommendation: ${vuln.recommendation}`);
                }
            });
        } else {
            console.log(`\n${colors.green}✅ No vulnerabilities found!${colors.reset}`);
        }
    }

    // Guardar resultados
    saveResults() {
        const report = {
            ...this.scanResults,
            vulnerabilities: this.vulnerabilities
        };

        fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
        this.log(`📄 Reporte guardado en: ${CONFIG.outputFile}`, 'green');
    }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('\n\n🛑 Escaneo interrumpido por el usuario');
    process.exit(0);
});

// Iniciar si es el script principal
if (require.main === module) {
    const scanner = new VulnerabilityScanner();
    
    scanner.runScan()
        .then(() => {
            scanner.displayResults();
            scanner.saveResults();
            
            const criticalCount = scanner.scanResults.bySeverity.CRITICAL;
            const highCount = scanner.scanResults.bySeverity.HIGH;
            
            if (criticalCount > 0 || highCount > 0) {
                console.log(`\n${colors.red}⚠️  Se encontraron vulnerabilidades críticas o altas!${colors.reset}`);
                process.exit(1);
            } else {
                console.log(`\n${colors.green}✅ Escaneo completado sin vulnerabilidades críticas${colors.reset}`);
                process.exit(0);
            }
        })
        .catch(error => {
            console.error(`${colors.red}❌ Error durante el escaneo: ${error.message}${colors.reset}`);
            process.exit(1);
        });
}

module.exports = VulnerabilityScanner; 