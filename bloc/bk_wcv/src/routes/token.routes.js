const express = require("express");
const router = express.Router();
const Joi = require("joi");

// Middleware para validación
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: {
                    message: "Datos de entrada inválidos",
                    details: error.details.map(detail => detail.message)
                }
            });
        }
        next();
    };
};

// Esquemas de validación
const addressSchema = Joi.object({
    address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
});

const transferSchema = Joi.object({
    from: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    to: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    amount: Joi.string().pattern(/^\d+(\.\d{1,3})?$/).required()
});

const mintSchema = Joi.object({
    to: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    amount: Joi.string().pattern(/^\d+(\.\d{1,3})?$/).required(),
    mintingFee: Joi.string().pattern(/^\d+(\.\d{18})?$/).required()
});

const burnSchema = Joi.object({
    from: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    amount: Joi.string().pattern(/^\d+(\.\d{1,3})?$/).required()
});

const allowanceSchema = Joi.object({
    owner: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    spender: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
});

/**
 * @route GET /api/token/info
 * @desc Obtener información básica del token WCV
 * @access Public
 */
router.get("/info", async (req, res) => {
    try {
        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const tokenInfo = await tokenService.getTokenInfo();
        
        res.json({
            success: true,
            data: tokenInfo
        });
    } catch (error) {
        console.error("Error obteniendo información del token:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route GET /api/token/stats
 * @desc Obtener estadísticas del token WCV
 * @access Public
 */
router.get("/stats", async (req, res) => {
    try {
        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const stats = await tokenService.getTokenStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Error obteniendo estadísticas del token:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route GET /api/token/fees
 * @desc Obtener configuración de fees del token
 * @access Public
 */
router.get("/fees", async (req, res) => {
    try {
        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const fees = await tokenService.getFeeConfiguration();
        
        res.json({
            success: true,
            data: fees
        });
    } catch (error) {
        console.error("Error obteniendo configuración de fees:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route GET /api/token/balance/:address
 * @desc Obtener balance de WCV de una dirección
 * @access Public
 */
router.get("/balance/:address", async (req, res) => {
    try {
        const { address } = req.params;
        
        // Validar dirección
        const { error } = addressSchema.validate({ address });
        if (error) {
            return res.status(400).json({
                error: {
                    message: "Dirección inválida",
                    details: error.details.map(detail => detail.message)
                }
            });
        }

        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const balance = await tokenService.getBalance(address);
        
        res.json({
            success: true,
            data: balance
        });
    } catch (error) {
        console.error("Error obteniendo balance:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route GET /api/token/status/:address
 * @desc Obtener estado de una dirección (blacklist, whitelist, etc.)
 * @access Public
 */
router.get("/status/:address", async (req, res) => {
    try {
        const { address } = req.params;
        
        // Validar dirección
        const { error } = addressSchema.validate({ address });
        if (error) {
            return res.status(400).json({
                error: {
                    message: "Dirección inválida",
                    details: error.details.map(detail => detail.message)
                }
            });
        }

        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const status = await tokenService.getAddressStatus(address);
        
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error("Error obteniendo estado de dirección:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route GET /api/token/allowance
 * @desc Obtener allowance entre dos direcciones
 * @access Public
 */
router.get("/allowance", async (req, res) => {
    try {
        const { owner, spender } = req.query;
        
        // Validar parámetros
        const { error } = allowanceSchema.validate({ owner, spender });
        if (error) {
            return res.status(400).json({
                error: {
                    message: "Parámetros inválidos",
                    details: error.details.map(detail => detail.message)
                }
            });
        }

        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const allowance = await tokenService.getAllowance(owner, spender);
        
        res.json({
            success: true,
            data: allowance
        });
    } catch (error) {
        console.error("Error obteniendo allowance:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route POST /api/token/transfer/tx
 * @desc Crear transacción de transferencia (sin enviar)
 * @access Public
 */
router.post("/transfer/tx", validateRequest(transferSchema), async (req, res) => {
    try {
        const { from, to, amount } = req.body;

        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const transaction = await tokenService.createTransferTransaction(from, to, amount);
        
        res.json({
            success: true,
            data: {
                transaction: transaction,
                message: "Transacción creada. Firma y envía la transacción para completar la transferencia."
            }
        });
    } catch (error) {
        console.error("Error creando transacción de transferencia:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route POST /api/token/mint/tx
 * @desc Crear transacción de minting (sin enviar)
 * @access Public
 */
router.post("/mint/tx", validateRequest(mintSchema), async (req, res) => {
    try {
        const { to, amount, mintingFee } = req.body;

        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const transaction = await tokenService.createMintTransaction(to, amount, mintingFee);
        
        res.json({
            success: true,
            data: {
                transaction: transaction,
                message: "Transacción de minting creada. Firma y envía la transacción para acuñar tokens."
            }
        });
    } catch (error) {
        console.error("Error creando transacción de minting:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route POST /api/token/burn/tx
 * @desc Crear transacción de burning (sin enviar)
 * @access Public
 */
router.post("/burn/tx", validateRequest(burnSchema), async (req, res) => {
    try {
        const { from, amount } = req.body;

        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService || !tokenService.isServiceInitialized()) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const transaction = await tokenService.createBurnTransaction(from, amount);
        
        res.json({
            success: true,
            data: {
                transaction: transaction,
                message: "Transacción de burning creada. Firma y envía la transacción para quemar tokens."
            }
        });
    } catch (error) {
        console.error("Error creando transacción de burning:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

/**
 * @route GET /api/token/status
 * @desc Obtener estado del servicio de token
 * @access Public
 */
router.get("/status", async (req, res) => {
    try {
        const tokenService = req.app.locals.tokenService;
        
        if (!tokenService) {
            return res.status(503).json({
                error: {
                    message: "Servicio de token no disponible",
                    status: 503
                }
            });
        }

        const status = tokenService.getServiceStatus();
        
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error("Error obteniendo estado del servicio:", error);
        res.status(500).json({
            error: {
                message: "Error interno del servidor",
                status: 500
            }
        });
    }
});

module.exports = router; 