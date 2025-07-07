/**
 * Sistema de Seguridad y Autenticación Avanzado para Metaverso
 * Protección integral, autenticación multi-factor y auditoría
 */

class AdvancedSecurityService {
    constructor() {
        // Configuración del sistema
        this.config = {
            enableRateLimiting: true,
            enableInputValidation: true,
            enableXSSProtection: true,
            enableCSRFProtection: true,
            enableContentSecurityPolicy: true,
            enableSecureHeaders: true,
            enableAuditLogging: true,
            enableSessionManagement: true,
            enableMultiFactorAuth: true,
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutos
            sessionTimeout: 30 * 60 * 1000, // 30 minutos
            passwordMinLength: 8,
            requireSpecialChars: true,
            requireNumbers: true,
            requireUppercase: true
        };
        
        // Gestión de sesiones
        this.sessions = new Map();
        this.activeUsers = new Map();
        this.blockedIPs = new Set();
        this.suspiciousActivities = new Map();
        
        // Rate limiting
        this.rateLimits = new Map();
        this.requestCounts = new Map();
        
        // Autenticación
        this.authTokens = new Map();
        this.refreshTokens = new Map();
        this.passwordHistory = new Map();
        
        // Auditoría
        this.auditLog = [];
        this.securityEvents = [];
        
        // Validación
        this.validators = new Map();
        this.sanitizers = new Map();
        
        // Estados
        this.states = {
            isInitialized: false,
            isEnabled: true,
            isMonitoring: true,
            isLocked: false
        };
        
        // Métricas
        this.metrics = {
            totalRequests: 0,
            blockedRequests: 0,
            failedLogins: 0,
            successfulLogins: 0,
            securityEvents: 0,
            activeSessions: 0,
            blockedIPs: 0
        };
        
        console.log('🔒 Sistema de Seguridad Avanzado inicializado');
    }

    /**
     * Inicializar sistema de seguridad
     */
    async initialize() {
        try {
            // Configurar validadores
            this.setupValidators();
            
            // Configurar sanitizadores
            this.setupSanitizers();
            
            // Configurar headers de seguridad
            this.setupSecurityHeaders();
            
            // Configurar CSP
            this.setupContentSecurityPolicy();
            
            // Configurar rate limiting
            this.setupRateLimiting();
            
            // Configurar auditoría
            this.setupAuditLogging();
            
            // Configurar monitoreo
            this.setupMonitoring();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de Seguridad Avanzado inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de seguridad:', error);
            throw error;
        }
    }

    /**
     * Configurar validadores
     */
    setupValidators() {
        // Validador de email
        this.validators.set('email', (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        });
        
        // Validador de contraseña
        this.validators.set('password', (password) => {
            if (password.length < this.config.passwordMinLength) {
                return { valid: false, error: 'Contraseña demasiado corta' };
            }
            
            if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
                return { valid: false, error: 'Se requiere al menos una mayúscula' };
            }
            
            if (this.config.requireNumbers && !/\d/.test(password)) {
                return { valid: false, error: 'Se requiere al menos un número' };
            }
            
            if (this.config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                return { valid: false, error: 'Se requiere al menos un carácter especial' };
            }
            
            return { valid: true };
        });
        
        // Validador de username
        this.validators.set('username', (username) => {
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            return usernameRegex.test(username);
        });
        
        // Validador de wallet address
        this.validators.set('wallet', (address) => {
            const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
            return ethAddressRegex.test(address);
        });
        
        // Validador de input general
        this.validators.set('input', (input, maxLength = 1000) => {
            if (typeof input !== 'string') return false;
            if (input.length > maxLength) return false;
            if (/<script>/i.test(input)) return false;
            if (/javascript:/i.test(input)) return false;
            return true;
        });
        
        console.log('✅ Validadores configurados');
    }

    /**
     * Configurar sanitizadores
     */
    setupSanitizers() {
        // Sanitizador de HTML
        this.sanitizers.set('html', (html) => {
            const div = document.createElement('div');
            div.textContent = html;
            return div.innerHTML;
        });
        
        // Sanitizador de SQL
        this.sanitizers.set('sql', (input) => {
            return input.replace(/['";\\]/g, '');
        });
        
        // Sanitizador de XSS
        this.sanitizers.set('xss', (input) => {
            return input
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        });
        
        // Sanitizador de URL
        this.sanitizers.set('url', (url) => {
            try {
                const parsed = new URL(url);
                return parsed.toString();
            } catch {
                return '';
            }
        });
        
        console.log('🧹 Sanitizadores configurados');
    }

    /**
     * Configurar headers de seguridad
     */
    setupSecurityHeaders() {
        if (!this.config.enableSecureHeaders) return;
        
        // Headers de seguridad para el navegador
        const securityHeaders = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
        
        // Aplicar headers si es posible
        Object.entries(securityHeaders).forEach(([header, value]) => {
            try {
                if (typeof document !== 'undefined') {
                    // En el cliente, configurar meta tags
                    const meta = document.createElement('meta');
                    meta.setAttribute('http-equiv', header);
                    meta.setAttribute('content', value);
                    document.head.appendChild(meta);
                }
            } catch (error) {
                console.warn(`No se pudo configurar header: ${header}`);
            }
        });
        
        console.log('🛡️ Headers de seguridad configurados');
    }

    /**
     * Configurar Content Security Policy
     */
    setupContentSecurityPolicy() {
        if (!this.config.enableContentSecurityPolicy) return;
        
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://api.metaverso.com wss://",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ');
        
        try {
            const meta = document.createElement('meta');
            meta.setAttribute('http-equiv', 'Content-Security-Policy');
            meta.setAttribute('content', csp);
            document.head.appendChild(meta);
        } catch (error) {
            console.warn('No se pudo configurar CSP');
        }
        
        console.log('📋 CSP configurado');
    }

    /**
     * Configurar rate limiting
     */
    setupRateLimiting() {
        if (!this.config.enableRateLimiting) return;
        
        // Configurar límites por tipo de acción
        this.rateLimits.set('login', { max: 5, window: 15 * 60 * 1000 }); // 5 intentos en 15 min
        this.rateLimits.set('register', { max: 3, window: 60 * 60 * 1000 }); // 3 registros por hora
        this.rateLimits.set('api', { max: 100, window: 60 * 1000 }); // 100 requests por minuto
        this.rateLimits.set('upload', { max: 10, window: 60 * 1000 }); // 10 uploads por minuto
        
        console.log('⏱️ Rate limiting configurado');
    }

    /**
     * Configurar auditoría
     */
    setupAuditLogging() {
        if (!this.config.enableAuditLogging) return;
        
        // Configurar eventos de auditoría
        this.auditEvents = [
            'login_attempt',
            'login_success',
            'login_failure',
            'logout',
            'password_change',
            'profile_update',
            'wallet_connect',
            'transaction',
            'file_upload',
            'admin_action'
        ];
        
        console.log('📝 Auditoría configurada');
    }

    /**
     * Configurar monitoreo
     */
    setupMonitoring() {
        if (!this.states.isMonitoring) return;
        
        // Monitorear eventos de seguridad
        this.monitorSecurityEvents();
        
        // Monitorear actividad sospechosa
        this.monitorSuspiciousActivity();
        
        console.log('👁️ Monitoreo configurado');
    }

    /**
     * Validar entrada
     */
    validateInput(input, type, options = {}) {
        if (!this.config.enableInputValidation) return { valid: true };
        
        const validator = this.validators.get(type);
        if (!validator) {
            return { valid: false, error: `Validador no encontrado: ${type}` };
        }
        
        const result = validator(input, options);
        
        // Registrar evento de validación
        this.logSecurityEvent('input_validation', {
            type,
            valid: result.valid,
            input: this.sanitizeForLog(input)
        });
        
        return result;
    }

    /**
     * Sanitizar entrada
     */
    sanitizeInput(input, type) {
        const sanitizer = this.sanitizers.get(type);
        if (!sanitizer) return input;
        
        return sanitizer(input);
    }

    /**
     * Verificar rate limit
     */
    checkRateLimit(action, identifier) {
        if (!this.config.enableRateLimiting) return { allowed: true };
        
        const limit = this.rateLimits.get(action);
        if (!limit) return { allowed: true };
        
        const key = `${action}:${identifier}`;
        const now = Date.now();
        
        if (!this.requestCounts.has(key)) {
            this.requestCounts.set(key, { count: 0, resetTime: now + limit.window });
        }
        
        const data = this.requestCounts.get(key);
        
        // Resetear contador si ha expirado
        if (now > data.resetTime) {
            data.count = 0;
            data.resetTime = now + limit.window;
        }
        
        // Verificar límite
        if (data.count >= limit.max) {
            this.logSecurityEvent('rate_limit_exceeded', { action, identifier });
            return { allowed: false, retryAfter: data.resetTime - now };
        }
        
        // Incrementar contador
        data.count++;
        
        return { allowed: true, remaining: limit.max - data.count };
    }

    /**
     * Autenticar usuario
     */
    async authenticateUser(credentials) {
        const { email, password, rememberMe = false } = credentials;
        
        // Validar entrada
        const emailValidation = this.validateInput(email, 'email');
        if (!emailValidation.valid) {
            return { success: false, error: emailValidation.error };
        }
        
        const passwordValidation = this.validateInput(password, 'password');
        if (!passwordValidation.valid) {
            return { success: false, error: passwordValidation.error };
        }
        
        // Verificar rate limit
        const rateLimitCheck = this.checkRateLimit('login', email);
        if (!rateLimitCheck.allowed) {
            return { 
                success: false, 
                error: 'Demasiados intentos de login. Intente más tarde.',
                retryAfter: rateLimitCheck.retryAfter
            };
        }
        
        try {
            // Simular autenticación (en producción, esto sería una llamada al backend)
            const user = await this.authenticateWithBackend(email, password);
            
            if (user) {
                // Crear sesión
                const session = this.createSession(user, rememberMe);
                
                // Registrar login exitoso
                this.logSecurityEvent('login_success', {
                    userId: user.id,
                    email: this.sanitizeForLog(email),
                    ip: this.getClientIP()
                });
                
                this.metrics.successfulLogins++;
                
                return {
                    success: true,
                    user,
                    session,
                    token: session.token
                };
            } else {
                // Registrar login fallido
                this.logSecurityEvent('login_failure', {
                    email: this.sanitizeForLog(email),
                    ip: this.getClientIP()
                });
                
                this.metrics.failedLogins++;
                
                return {
                    success: false,
                    error: 'Credenciales inválidas'
                };
            }
            
        } catch (error) {
            console.error('Error en autenticación:', error);
            return {
                success: false,
                error: 'Error interno del servidor'
            };
        }
    }

    /**
     * Autenticar con backend (simulado)
     */
    async authenticateWithBackend(email, password) {
        // Simular llamada al backend
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular validación de credenciales
                if (email === 'test@metaverso.com' && password === 'Test123!') {
                    resolve({
                        id: 'user_123',
                        email: email,
                        username: 'testuser',
                        role: 'user',
                        wallet: '0x1234567890123456789012345678901234567890'
                    });
                } else {
                    resolve(null);
                }
            }, 100);
        });
    }

    /**
     * Crear sesión
     */
    createSession(user, rememberMe = false) {
        const sessionId = this.generateSessionId();
        const token = this.generateAuthToken(user);
        const refreshToken = this.generateRefreshToken(user);
        
        const session = {
            id: sessionId,
            userId: user.id,
            token,
            refreshToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : this.config.sessionTimeout),
            ip: this.getClientIP(),
            userAgent: navigator.userAgent,
            isActive: true
        };
        
        this.sessions.set(sessionId, session);
        this.authTokens.set(token, sessionId);
        this.refreshTokens.set(refreshToken, sessionId);
        this.activeUsers.set(user.id, sessionId);
        
        this.metrics.activeSessions++;
        
        return session;
    }

    /**
     * Verificar token
     */
    verifyToken(token) {
        const sessionId = this.authTokens.get(token);
        if (!sessionId) {
            return { valid: false, error: 'Token inválido' };
        }
        
        const session = this.sessions.get(sessionId);
        if (!session || !session.isActive) {
            return { valid: false, error: 'Sesión expirada' };
        }
        
        if (Date.now() > session.expiresAt) {
            this.invalidateSession(sessionId);
            return { valid: false, error: 'Sesión expirada' };
        }
        
        return { valid: true, session };
    }

    /**
     * Invalidar sesión
     */
    invalidateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
            this.authTokens.delete(session.token);
            this.refreshTokens.delete(session.refreshToken);
            this.activeUsers.delete(session.userId);
            this.metrics.activeSessions--;
        }
    }

    /**
     * Cerrar sesión
     */
    logout(token) {
        const sessionId = this.authTokens.get(token);
        if (sessionId) {
            this.invalidateSession(sessionId);
            this.logSecurityEvent('logout', { sessionId });
        }
    }

    /**
     * Generar ID de sesión
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generar token de autenticación
     */
    generateAuthToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            iat: Date.now(),
            exp: Date.now() + this.config.sessionTimeout
        };
        
        // En producción, esto sería firmado con JWT
        return btoa(JSON.stringify(payload));
    }

    /**
     * Generar refresh token
     */
    generateRefreshToken(user) {
        return 'refresh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obtener IP del cliente
     */
    getClientIP() {
        // En el cliente, esto sería obtenido del servidor
        return '127.0.0.1';
    }

    /**
     * Registrar evento de seguridad
     */
    logSecurityEvent(eventType, data) {
        if (!this.config.enableAuditLogging) return;
        
        const event = {
            id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: eventType,
            timestamp: new Date().toISOString(),
            data: this.sanitizeForLog(data),
            ip: this.getClientIP(),
            userAgent: navigator.userAgent
        };
        
        this.auditLog.push(event);
        this.securityEvents.push(event);
        this.metrics.securityEvents++;
        
        // Limitar tamaño del log
        if (this.auditLog.length > 10000) {
            this.auditLog = this.auditLog.slice(-5000);
        }
        
        // Verificar actividad sospechosa
        this.checkSuspiciousActivity(event);
    }

    /**
     * Sanitizar datos para log
     */
    sanitizeForLog(data) {
        if (typeof data === 'string') {
            return this.sanitizeInput(data, 'xss');
        } else if (typeof data === 'object') {
            const sanitized = {};
            Object.entries(data).forEach(([key, value]) => {
                if (key === 'password' || key === 'token') {
                    sanitized[key] = '[REDACTED]';
                } else {
                    sanitized[key] = this.sanitizeForLog(value);
                }
            });
            return sanitized;
        }
        return data;
    }

    /**
     * Verificar actividad sospechosa
     */
    checkSuspiciousActivity(event) {
        const suspiciousPatterns = [
            { type: 'multiple_failed_logins', threshold: 5, window: 5 * 60 * 1000 },
            { type: 'rapid_requests', threshold: 100, window: 60 * 1000 },
            { type: 'unusual_activity', threshold: 10, window: 60 * 1000 }
        ];
        
        suspiciousPatterns.forEach(pattern => {
            const recentEvents = this.securityEvents.filter(e => 
                e.type === event.type && 
                Date.now() - new Date(e.timestamp).getTime() < pattern.window
            );
            
            if (recentEvents.length >= pattern.threshold) {
                this.flagSuspiciousActivity(pattern.type, event);
            }
        });
    }

    /**
     * Marcar actividad sospechosa
     */
    flagSuspiciousActivity(type, event) {
        const suspiciousActivity = {
            type,
            timestamp: new Date().toISOString(),
            events: this.securityEvents.filter(e => 
                Date.now() - new Date(e.timestamp).getTime() < 5 * 60 * 1000
            ),
            ip: event.ip
        };
        
        this.suspiciousActivities.set(event.ip, suspiciousActivity);
        
        // Bloquear IP si es necesario
        if (type === 'multiple_failed_logins') {
            this.blockIP(event.ip, 'Múltiples intentos de login fallidos');
        }
        
        console.warn(`🚨 Actividad sospechosa detectada: ${type} desde ${event.ip}`);
    }

    /**
     * Bloquear IP
     */
    blockIP(ip, reason) {
        this.blockedIPs.add(ip);
        this.metrics.blockedIPs++;
        
        this.logSecurityEvent('ip_blocked', { ip, reason });
        
        // Remover bloqueo después del tiempo configurado
        setTimeout(() => {
            this.blockedIPs.delete(ip);
            this.metrics.blockedIPs--;
        }, this.config.lockoutDuration);
    }

    /**
     * Verificar si IP está bloqueada
     */
    isIPBlocked(ip) {
        return this.blockedIPs.has(ip);
    }

    /**
     * Monitorear eventos de seguridad
     */
    monitorSecurityEvents() {
        // Monitorear eventos en tiempo real
        setInterval(() => {
            const recentEvents = this.securityEvents.filter(e => 
                Date.now() - new Date(e.timestamp).getTime() < 60 * 1000
            );
            
            if (recentEvents.length > 50) {
                console.warn('⚠️ Alto volumen de eventos de seguridad detectado');
            }
        }, 60000);
    }

    /**
     * Monitorear actividad sospechosa
     */
    monitorSuspiciousActivity() {
        // Limpiar actividades sospechosas antiguas
        setInterval(() => {
            const now = Date.now();
            this.suspiciousActivities.forEach((activity, ip) => {
                if (now - new Date(activity.timestamp).getTime() > 24 * 60 * 60 * 1000) {
                    this.suspiciousActivities.delete(ip);
                }
            });
        }, 60 * 60 * 1000); // Cada hora
    }

    /**
     * Obtener métricas del sistema
     */
    getMetrics() {
        return {
            ...this.metrics,
            states: this.states,
            config: this.config,
            activeSessions: this.sessions.size,
            blockedIPs: this.blockedIPs.size,
            suspiciousActivities: this.suspiciousActivities.size
        };
    }

    /**
     * Obtener log de auditoría
     */
    getAuditLog(limit = 100) {
        return this.auditLog.slice(-limit);
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        // Invalidar todas las sesiones
        this.sessions.forEach((session, sessionId) => {
            this.invalidateSession(sessionId);
        });
        
        // Limpiar arrays
        this.sessions.clear();
        this.activeUsers.clear();
        this.blockedIPs.clear();
        this.suspiciousActivities.clear();
        this.authTokens.clear();
        this.refreshTokens.clear();
        this.rateLimits.clear();
        this.requestCounts.clear();
        this.validators.clear();
        this.sanitizers.clear();
        
        console.log('🧹 Sistema de Seguridad Avanzado limpiado');
    }
}

// Exportar para uso global
window.AdvancedSecurityService = AdvancedSecurityService; 