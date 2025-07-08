const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Cargar variables de entorno
dotenv.config();

// Configurar logging
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: "wcv-blockchain" },
    transports: [
        new winston.transports.File({ 
            filename: path.join(logDir, "error.log"), 
            level: "error" 
        }),
        new winston.transports.File({ 
            filename: path.join(logDir, "combined.log") 
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Crear aplicación Express
const app = express();
const PORT = process.env.API_PORT || 3000;

// Configurar middleware de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Configurar rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
    message: {
        error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Configurar middleware
app.use(compression());
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? ["https://wcv-blockchain.com"] 
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString()
    });
    next();
});

// Importar servicios
const BlockchainService = require("./services/blockchain.service");
const TokenService = require("./services/token.service");
const BridgeService = require("./services/bridge.service");
const MetaMaskService = require("./services/metamask.service");

// Inicializar servicios
let blockchainService, tokenService, bridgeService, metamaskService;

async function initializeServices() {
    try {
        logger.info("Inicializando servicios...");
        
        blockchainService = new BlockchainService();
        await blockchainService.initialize();
        
        tokenService = new TokenService(blockchainService);
        await tokenService.initialize();
        
        bridgeService = new BridgeService(blockchainService, tokenService);
        await bridgeService.initialize();
        
        metamaskService = new MetaMaskService(blockchainService);
        await metamaskService.initialize();
        
        logger.info("✅ Servicios inicializados correctamente");
    } catch (error) {
        logger.error("❌ Error inicializando servicios:", error);
        process.exit(1);
    }
}

// Rutas de salud
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "2.0.0",
        services: {
            blockchain: blockchainService ? "running" : "stopped",
            token: tokenService ? "running" : "stopped",
            bridge: bridgeService ? "running" : "stopped",
            metamask: metamaskService ? "running" : "stopped"
        }
    });
});

app.get("/", (req, res) => {
    res.json({
        name: "WCV Blockchain API",
        version: "2.0.0",
        description: "API para la blockchain personalizada WCV",
        endpoints: {
            health: "/health",
            blockchain: "/api/blockchain",
            token: "/api/token",
            bridge: "/api/bridge",
            metamask: "/api/metamask"
        },
        documentation: "/api/docs"
    });
});

// Rutas de la API
app.use("/api/blockchain", require("./routes/blockchain.routes"));
app.use("/api/token", require("./routes/token.routes"));
app.use("/api/bridge", require("./routes/bridge.routes"));
app.use("/api/metamask", require("./routes/metamask.routes"));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    logger.error("Error no manejado:", err);
    
    res.status(err.status || 500).json({
        error: {
            message: process.env.NODE_ENV === "production" 
                ? "Error interno del servidor" 
                : err.message,
            status: err.status || 500,
            timestamp: new Date().toISOString()
        }
    });
});

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
    res.status(404).json({
        error: {
            message: "Endpoint no encontrado",
            path: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        }
    });
});

// Función para iniciar el servidor
async function startServer() {
    try {
        await initializeServices();
        
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Servidor WCV Blockchain iniciado en puerto ${PORT}`);
            logger.info(`📊 Modo: ${process.env.NODE_ENV || "development"}`);
            logger.info(`🔗 URL: http://localhost:${PORT}`);
            logger.info(`📖 Documentación: http://localhost:${PORT}/api/docs`);
            
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    WCV BLOCKCHAIN SERVER                     ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Servidor iniciado en: http://localhost:${PORT.padEnd(8)} ║
║  📊 Modo: ${(process.env.NODE_ENV || "development").padEnd(20)} ║
║  🔗 Health Check: http://localhost:${PORT}/health${"".padEnd(8)} ║
║  📖 API Docs: http://localhost:${PORT}/api/docs${"".padEnd(8)} ║
║  🌉 Bridge: http://localhost:${PORT}/api/bridge${"".padEnd(8)} ║
║  🪙 Token: http://localhost:${PORT}/api/token${"".padEnd(8)} ║
╚══════════════════════════════════════════════════════════════╝
            `);
        });
        
        // Manejo de cierre graceful
        process.on("SIGTERM", () => {
            logger.info("SIGTERM recibido, cerrando servidor...");
            server.close(() => {
                logger.info("Servidor cerrado");
                process.exit(0);
            });
        });
        
        process.on("SIGINT", () => {
            logger.info("SIGINT recibido, cerrando servidor...");
            server.close(() => {
                logger.info("Servidor cerrado");
                process.exit(0);
            });
        });
        
        // Manejo de errores no capturados
        process.on("uncaughtException", (error) => {
            logger.error("Excepción no capturada:", error);
            process.exit(1);
        });
        
        process.on("unhandledRejection", (reason, promise) => {
            logger.error("Promesa rechazada no manejada:", reason);
            process.exit(1);
        });
        
    } catch (error) {
        logger.error("❌ Error iniciando servidor:", error);
        process.exit(1);
    }
}

// Exportar para testing
module.exports = { app, startServer, logger };

// Iniciar servidor si es el archivo principal
if (require.main === module) {
    startServer();
} 