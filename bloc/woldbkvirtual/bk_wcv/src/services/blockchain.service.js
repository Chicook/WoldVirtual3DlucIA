const { ethers } = require("ethers");
const winston = require("winston");
const path = require("path");

/**
 * Servicio principal de blockchain para la red WCV
 */
class BlockchainService {
    constructor() {
        this.provider = null;
        this.network = null;
        this.accounts = [];
        this.isInitialized = false;
        this.logger = winston.createLogger({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    /**
     * Inicializar el servicio de blockchain
     */
    async initialize() {
        try {
            this.logger.info("Inicializando BlockchainService...");
            
            // Configurar provider según el entorno
            const rpcUrl = process.env.WCV_DEV_RPC || "http://127.0.0.1:8545";
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            
            // Obtener información de la red
            this.network = await this.provider.getNetwork();
            this.logger.info(`Conectado a red: ${this.network.name} (Chain ID: ${this.network.chainId})`);
            
            // Verificar conexión
            const blockNumber = await this.provider.getBlockNumber();
            this.logger.info(`Block actual: ${blockNumber}`);
            
            // Obtener cuentas disponibles
            await this.loadAccounts();
            
            this.isInitialized = true;
            this.logger.info("✅ BlockchainService inicializado correctamente");
            
        } catch (error) {
            this.logger.error("❌ Error inicializando BlockchainService:", error);
            throw error;
        }
    }

    /**
     * Cargar cuentas disponibles
     */
    async loadAccounts() {
        try {
            // Obtener cuentas del provider
            const accounts = await this.provider.listAccounts();
            this.accounts = accounts;
            
            this.logger.info(`Cargadas ${accounts.length} cuentas`);
            
            // Mostrar información de las cuentas
            for (let i = 0; i < Math.min(accounts.length, 5); i++) {
                const balance = await this.provider.getBalance(accounts[i]);
                this.logger.info(`Cuenta ${i}: ${accounts[i]} - ${ethers.formatEther(balance)} ETH`);
            }
            
        } catch (error) {
            this.logger.error("Error cargando cuentas:", error);
            this.accounts = [];
        }
    }

    /**
     * Obtener información de la blockchain
     */
    async getBlockchainInfo() {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }

        try {
            const [blockNumber, gasPrice, network] = await Promise.all([
                this.provider.getBlockNumber(),
                this.provider.getFeeData(),
                this.provider.getNetwork()
            ]);

            return {
                network: {
                    name: network.name,
                    chainId: network.chainId,
                    ensAddress: network.ensAddress
                },
                block: {
                    number: blockNumber,
                    gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, "gwei") : "0",
                    maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, "gwei") : "0",
                    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, "gwei") : "0"
                },
                accounts: this.accounts.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo información de blockchain:", error);
            throw error;
        }
    }

    /**
     * Obtener información de un bloque específico
     */
    async getBlockInfo(blockNumber) {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }

        try {
            const block = await this.provider.getBlock(blockNumber, true);
            
            if (!block) {
                throw new Error("Bloque no encontrado");
            }

            return {
                number: block.number,
                hash: block.hash,
                parentHash: block.parentHash,
                timestamp: new Date(block.timestamp * 1000).toISOString(),
                transactions: block.transactions.length,
                gasLimit: block.gasLimit.toString(),
                gasUsed: block.gasUsed.toString(),
                miner: block.miner,
                difficulty: block.difficulty.toString(),
                totalDifficulty: block.totalDifficulty.toString(),
                size: block.size,
                baseFeePerGas: block.baseFeePerGas ? ethers.formatUnits(block.baseFeePerGas, "gwei") : "0"
            };
        } catch (error) {
            this.logger.error("Error obteniendo información del bloque:", error);
            throw error;
        }
    }

    /**
     * Obtener información de una transacción
     */
    async getTransactionInfo(txHash) {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }

        try {
            const [tx, receipt] = await Promise.all([
                this.provider.getTransaction(txHash),
                this.provider.getTransactionReceipt(txHash)
            ]);

            if (!tx) {
                throw new Error("Transacción no encontrada");
            }

            return {
                hash: tx.hash,
                blockNumber: tx.blockNumber,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value),
                gasPrice: ethers.formatUnits(tx.gasPrice, "gwei"),
                gasLimit: tx.gasLimit.toString(),
                gasUsed: receipt ? receipt.gasUsed.toString() : "0",
                nonce: tx.nonce,
                data: tx.data,
                status: receipt ? (receipt.status === 1 ? "success" : "failed") : "pending",
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo información de la transacción:", error);
            throw error;
        }
    }

    /**
     * Obtener balance de una dirección
     */
    async getBalance(address) {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }

        try {
            const balance = await this.provider.getBalance(address);
            return {
                address: address,
                balance: ethers.formatEther(balance),
                balanceWei: balance.toString(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo balance:", error);
            throw error;
        }
    }

    /**
     * Obtener transacciones pendientes
     */
    async getPendingTransactions() {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }

        try {
            // Nota: No todos los providers soportan esto
            const pending = await this.provider.send("txpool_content", []);
            
            const pendingTxs = [];
            for (const [from, txs] of Object.entries(pending.pending || {})) {
                for (const [nonce, tx] of Object.entries(txs)) {
                    pendingTxs.push({
                        from: from,
                        to: tx.to,
                        value: ethers.formatEther(tx.value),
                        gasPrice: ethers.formatUnits(tx.gasPrice, "gwei"),
                        nonce: parseInt(nonce),
                        hash: tx.hash
                    });
                }
            }

            return {
                pending: pendingTxs,
                count: pendingTxs.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.warn("No se pudieron obtener transacciones pendientes:", error.message);
            return {
                pending: [],
                count: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Obtener estadísticas de la red
     */
    async getNetworkStats() {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }

        try {
            const [blockNumber, gasPrice, accounts] = await Promise.all([
                this.provider.getBlockNumber(),
                this.provider.getFeeData(),
                this.loadAccounts()
            ]);

            // Obtener información de los últimos 10 bloques
            const recentBlocks = [];
            for (let i = 0; i < 10; i++) {
                const blockNumber = await this.provider.getBlockNumber();
                const block = await this.provider.getBlock(blockNumber - i);
                if (block) {
                    recentBlocks.push({
                        number: block.number,
                        timestamp: new Date(block.timestamp * 1000).toISOString(),
                        transactions: block.transactions.length,
                        gasUsed: block.gasUsed.toString()
                    });
                }
            }

            return {
                network: {
                    name: this.network.name,
                    chainId: this.network.chainId
                },
                currentBlock: blockNumber,
                gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, "gwei") : "0",
                accounts: this.accounts.length,
                recentBlocks: recentBlocks,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo estadísticas de red:", error);
            throw error;
        }
    }

    /**
     * Enviar transacción
     */
    async sendTransaction(signedTx) {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }

        try {
            const tx = await this.provider.broadcastTransaction(signedTx);
            this.logger.info(`Transacción enviada: ${tx.hash}`);
            
            return {
                hash: tx.hash,
                status: "sent",
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error enviando transacción:", error);
            throw error;
        }
    }

    /**
     * Esperar confirmación de transacción
     */
    async waitForTransaction(txHash, confirmations = 1) {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }

        try {
            const receipt = await this.provider.waitForTransaction(txHash, confirmations);
            
            return {
                hash: receipt.hash,
                blockNumber: receipt.blockNumber,
                status: receipt.status === 1 ? "confirmed" : "failed",
                gasUsed: receipt.gasUsed.toString(),
                confirmations: receipt.confirmations,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error esperando confirmación:", error);
            throw error;
        }
    }

    /**
     * Obtener provider
     */
    getProvider() {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }
        return this.provider;
    }

    /**
     * Obtener red
     */
    getNetwork() {
        if (!this.isInitialized) {
            throw new Error("BlockchainService no inicializado");
        }
        return this.network;
    }

    /**
     * Obtener cuentas
     */
    getAccounts() {
        return this.accounts;
    }

    /**
     * Verificar si está inicializado
     */
    isServiceInitialized() {
        return this.isInitialized;
    }

    /**
     * Obtener estado del servicio
     */
    getServiceStatus() {
        return {
            initialized: this.isInitialized,
            network: this.network ? this.network.name : "unknown",
            chainId: this.network ? this.network.chainId : 0,
            accounts: this.accounts.length,
            provider: this.provider ? "connected" : "disconnected",
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = BlockchainService; 