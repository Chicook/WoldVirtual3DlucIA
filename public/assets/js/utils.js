/**
 * Metaverso Utilities
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoUtils {
    constructor() {
        this.isInitialized = false;
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        
        this.init();
    }

    /**
     * Initialize utilities
     */
    init() {
        this.isInitialized = true;
        console.log('🔧 Utilidades inicializadas');
    }

    /**
     * ============ STRING UTILITIES ============
     */

    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert to camelCase
     */
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    /**
     * Convert to kebab-case
     */
    toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Convert to snake_case
     */
    toSnakeCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }

    /**
     * Truncate string
     */
    truncate(str, length = 50, suffix = '...') {
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    }

    /**
     * Generate random string
     */
    randomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    /**
     * Generate UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * ============ NUMBER UTILITIES ============
     */

    /**
     * Format number with commas
     */
    formatNumber(num, decimals = 0) {
        return Number(num).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'USD', locale = 'en-US') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Format percentage
     */
    formatPercentage(value, total, decimals = 2) {
        const percentage = (value / total) * 100;
        return `${percentage.toFixed(decimals)}%`;
    }

    /**
     * Clamp number between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linear interpolation
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    /**
     * Map value from one range to another
     */
    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    /**
     * Generate random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generate random integer between min and max
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * ============ ARRAY UTILITIES ============
     */

    /**
     * Shuffle array
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Remove duplicates from array
     */
    unique(array) {
        return [...new Set(array)];
    }

    /**
     * Group array by key
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    /**
     * Sort array by key
     */
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (order === 'desc') {
                return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
        });
    }

    /**
     * Chunk array into smaller arrays
     */
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Flatten nested array
     */
    flatten(array) {
        return array.reduce((flat, item) => {
            return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
        }, []);
    }

    /**
     * ============ OBJECT UTILITIES ============
     */

    /**
     * Deep clone object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    }

    /**
     * Merge objects
     */
    merge(target, ...sources) {
        sources.forEach(source => {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        target[key] = target[key] || {};
                        this.merge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        });
        return target;
    }

    /**
     * Pick properties from object
     */
    pick(obj, keys) {
        return keys.reduce((result, key) => {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
            return result;
        }, {});
    }

    /**
     * Omit properties from object
     */
    omit(obj, keys) {
        return Object.keys(obj).reduce((result, key) => {
            if (!keys.includes(key)) {
                result[key] = obj[key];
            }
            return result;
        }, {});
    }

    /**
     * Check if object is empty
     */
    isEmpty(obj) {
        if (obj == null) return true;
        if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
        return Object.keys(obj).length === 0;
    }

    /**
     * ============ DATE UTILITIES ============
     */

    /**
     * Format date
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * Get relative time
     */
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
    }

    /**
     * Check if date is today
     */
    isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return today.toDateString() === checkDate.toDateString();
    }

    /**
     * ============ DOM UTILITIES ============
     */

    /**
     * Create element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    /**
     * Get element by selector
     */
    $(selector) {
        return document.querySelector(selector);
    }

    /**
     * Get elements by selector
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * Add event listener with options
     */
    addEventListener(element, event, handler, options = {}) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.addEventListener(event, handler, options);
        }
    }

    /**
     * Remove event listener
     */
    removeEventListener(element, event, handler) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.removeEventListener(event, handler);
        }
    }

    /**
     * Toggle class
     */
    toggleClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.classList.toggle(className);
        }
    }

    /**
     * Add class
     */
    addClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.classList.add(className);
        }
    }

    /**
     * Remove class
     */
    removeClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.classList.remove(className);
        }
    }

    /**
     * Check if element has class
     */
    hasClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        return element ? element.classList.contains(className) : false;
    }

    /**
     * ============ STORAGE UTILITIES ============
     */

    /**
     * Set local storage
     */
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Get local storage
     */
    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove from local storage
     */
    removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    /**
     * Clear local storage
     */
    clearStorage() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    /**
     * ============ CACHE UTILITIES ============
     */

    /**
     * Set cache
     */
    setCache(key, value, ttl = 300000) { // 5 minutes default
        this.cache.set(key, {
            value: value,
            timestamp: Date.now(),
            ttl: ttl
        });
    }

    /**
     * Get cache
     */
    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * ============ ASYNC UTILITIES ============
     */

    /**
     * Debounce function
     */
    debounce(func, delay) {
        const key = func.toString();
        
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * Throttle function
     */
    throttle(func, delay) {
        const key = func.toString();
        
        return (...args) => {
            if (this.throttleTimers.has(key)) {
                return;
            }
            
            func.apply(this, args);
            this.throttleTimers.set(key, true);
            
            setTimeout(() => {
                this.throttleTimers.delete(key);
            }, delay);
        };
    }

    /**
     * Sleep for specified time
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry function
     */
    async retry(func, maxAttempts = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await func();
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
                await this.sleep(delay * attempt);
            }
        }
    }

    /**
     * ============ VALIDATION UTILITIES ============
     */

    /**
     * Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL
     */
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate phone number
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Validate Ethereum address
     */
    isValidEthAddress(address) {
        const ethRegex = /^0x[a-fA-F0-9]{40}$/;
        return ethRegex.test(address);
    }

    /**
     * ============ CRYPTO UTILITIES ============
     */

    /**
     * Generate hash
     */
    async generateHash(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate random bytes
     */
    generateRandomBytes(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * ============ COLOR UTILITIES ============
     */

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Generate random color
     */
    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    /**
     * ============ MATH UTILITIES ============
     */

    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    /**
     * Calculate distance between two 3D points
     */
    distance3D(x1, y1, z1, x2, y2, z2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
    }

    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     */
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * ============ ERROR HANDLING ============
     */

    /**
     * Handle errors gracefully
     */
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // Log to external service if available
        if (window.metaverso && window.metaverso.logError) {
            window.metaverso.logError(error, context);
        }
        
        return {
            error: true,
            message: error.message,
            context: context,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Create error boundary
     */
    createErrorBoundary(fn, fallback = null) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handleError(error, fn.name);
                return fallback;
            }
        };
    }

    /**
     * ============ PERFORMANCE UTILITIES ============
     */

    /**
     * Measure execution time
     */
    measureTime(fn, name = 'Function') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Async measure execution time
     */
    async measureTimeAsync(fn, name = 'Async Function') {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * ============ BROWSER UTILITIES ============
     */

    /**
     * Check if mobile device
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Check if touch device
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Get browser info
     */
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';
        
        if (userAgent.includes('Chrome')) {
            browser = 'Chrome';
            version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
            version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Safari')) {
            browser = 'Safari';
            version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Edge')) {
            browser = 'Edge';
            version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        }
        
        return { browser, version, userAgent };
    }

    /**
     * Check WebGL support
     */
    isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    /**
     * Check Web Audio API support
     */
    isWebAudioSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    /**
     * ============ NETWORK UTILITIES ============
     */

    /**
     * Check online status
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * Get connection info
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
        return null;
    }

    /**
     * ============ EXPORT ============
     */

    /**
     * Export all utilities
     */
    export() {
        return {
            // String utilities
            capitalize: this.capitalize.bind(this),
            toCamelCase: this.toCamelCase.bind(this),
            toKebabCase: this.toKebabCase.bind(this),
            toSnakeCase: this.toSnakeCase.bind(this),
            truncate: this.truncate.bind(this),
            randomString: this.randomString.bind(this),
            generateUUID: this.generateUUID.bind(this),
            
            // Number utilities
            formatNumber: this.formatNumber.bind(this),
            formatCurrency: this.formatCurrency.bind(this),
            formatPercentage: this.formatPercentage.bind(this),
            clamp: this.clamp.bind(this),
            lerp: this.lerp.bind(this),
            map: this.map.bind(this),
            random: this.random.bind(this),
            randomInt: this.randomInt.bind(this),
            
            // Array utilities
            shuffle: this.shuffle.bind(this),
            unique: this.unique.bind(this),
            groupBy: this.groupBy.bind(this),
            sortBy: this.sortBy.bind(this),
            chunk: this.chunk.bind(this),
            flatten: this.flatten.bind(this),
            
            // Object utilities
            deepClone: this.deepClone.bind(this),
            merge: this.merge.bind(this),
            pick: this.pick.bind(this),
            omit: this.omit.bind(this),
            isEmpty: this.isEmpty.bind(this),
            
            // Date utilities
            formatDate: this.formatDate.bind(this),
            getRelativeTime: this.getRelativeTime.bind(this),
            isToday: this.isToday.bind(this),
            
            // DOM utilities
            createElement: this.createElement.bind(this),
            $: this.$.bind(this),
            $$: this.$$.bind(this),
            addEventListener: this.addEventListener.bind(this),
            removeEventListener: this.removeEventListener.bind(this),
            toggleClass: this.toggleClass.bind(this),
            addClass: this.addClass.bind(this),
            removeClass: this.removeClass.bind(this),
            hasClass: this.hasClass.bind(this),
            
            // Storage utilities
            setStorage: this.setStorage.bind(this),
            getStorage: this.getStorage.bind(this),
            removeStorage: this.removeStorage.bind(this),
            clearStorage: this.clearStorage.bind(this),
            
            // Cache utilities
            setCache: this.setCache.bind(this),
            getCache: this.getCache.bind(this),
            clearCache: this.clearCache.bind(this),
            
            // Async utilities
            debounce: this.debounce.bind(this),
            throttle: this.throttle.bind(this),
            sleep: this.sleep.bind(this),
            retry: this.retry.bind(this),
            
            // Validation utilities
            isValidEmail: this.isValidEmail.bind(this),
            isValidURL: this.isValidURL.bind(this),
            isValidPhone: this.isValidPhone.bind(this),
            isValidEthAddress: this.isValidEthAddress.bind(this),
            
            // Crypto utilities
            generateHash: this.generateHash.bind(this),
            generateRandomBytes: this.generateRandomBytes.bind(this),
            
            // Color utilities
            hexToRgb: this.hexToRgb.bind(this),
            rgbToHex: this.rgbToHex.bind(this),
            randomColor: this.randomColor.bind(this),
            
            // Math utilities
            distance: this.distance.bind(this),
            distance3D: this.distance3D.bind(this),
            toRadians: this.toRadians.bind(this),
            toDegrees: this.toDegrees.bind(this),
            
            // Error handling
            handleError: this.handleError.bind(this),
            createErrorBoundary: this.createErrorBoundary.bind(this),
            
            // Performance utilities
            measureTime: this.measureTime.bind(this),
            measureTimeAsync: this.measureTimeAsync.bind(this),
            
            // Browser utilities
            isMobile: this.isMobile.bind(this),
            isTouchDevice: this.isTouchDevice.bind(this),
            getBrowserInfo: this.getBrowserInfo.bind(this),
            isWebGLSupported: this.isWebGLSupported.bind(this),
            isWebAudioSupported: this.isWebAudioSupported.bind(this),
            
            // Network utilities
            isOnline: this.isOnline.bind(this),
            getConnectionInfo: this.getConnectionInfo.bind(this)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoUtils;
} 