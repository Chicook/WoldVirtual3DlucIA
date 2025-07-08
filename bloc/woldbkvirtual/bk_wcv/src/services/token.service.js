const { ethers } = require("ethers");
const winston = require("winston");
const path = require("path");

/**
 * Servicio para manejar operaciones del token WCV
 */
class TokenService {
    constructor(blockchainService) {
        this.blockchainService = blockchainService;
        this.provider = null;
        this.tokenContract = null;
        this.tokenAddress = null;
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
     * Inicializar el servicio del token
     */
    async initialize() {
        try {
            this.logger.info("Inicializando TokenService...");
            
            if (!this.blockchainService || !this.blockchainService.isServiceInitialized()) {
                throw new Error("BlockchainService no inicializado");
            }
            
            this.provider = this.blockchainService.getProvider();
            
            // Cargar dirección del token desde deployments
            await this.loadTokenAddress();
            
            if (!this.tokenAddress) {
                throw new Error("Dirección del token WCV no encontrada");
            }
            
            // Crear instancia del contrato
            const tokenABI = await this.loadTokenABI();
            this.tokenContract = new ethers.Contract(this.tokenAddress, tokenABI, this.provider);
            
            // Verificar contrato
            await this.verifyTokenContract();
            
            this.isInitialized = true;
            this.logger.info("✅ TokenService inicializado correctamente");
            
        } catch (error) {
            this.logger.error("❌ Error inicializando TokenService:", error);
            throw error;
        }
    }

    /**
     * Cargar dirección del token desde archivos de deployment
     */
    async loadTokenAddress() {
        try {
            const fs = require("fs");
            const deploymentsDir = path.join(__dirname, "../../deployments");
            
            // Buscar archivo de deployment para la red actual
            const network = this.blockchainService.getNetwork();
            const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
            
            if (fs.existsSync(deploymentFile)) {
                const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
                this.tokenAddress = deployment.contracts.WCVToken.address;
                this.logger.info(`Token WCV cargado desde deployment: ${this.tokenAddress}`);
            } else {
                // Usar dirección por defecto para desarrollo
                this.tokenAddress = process.env.WCV_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
                this.logger.warn("Usando dirección por defecto del token WCV");
            }
        } catch (error) {
            this.logger.error("Error cargando dirección del token:", error);
            throw error;
        }
    }

    /**
     * Cargar ABI del token
     */
    async loadTokenABI() {
        try {
            const fs = require("fs");
            const artifactsDir = path.join(__dirname, "../../artifacts/contracts");
            const tokenArtifactPath = path.join(artifactsDir, "WCVToken.sol/WCVToken.json");
            
            if (fs.existsSync(tokenArtifactPath)) {
                const artifact = JSON.parse(fs.readFileSync(tokenArtifactPath, "utf8"));
                return artifact.abi;
            } else {
                // ABI básico si no existe el artifact
                return [
                    "function name() view returns (string)",
                    "function symbol() view returns (string)",
                    "function decimals() view returns (uint8)",
                    "function totalSupply() view returns (uint256)",
                    "function balanceOf(address) view returns (uint256)",
                    "function transfer(address, uint256) returns (bool)",
                    "function transferFrom(address, address, uint256) returns (bool)",
                    "function approve(address, uint256) returns (bool)",
                    "function allowance(address, address) view returns (uint256)",
                    "function mint(address, uint256) payable",
                    "function burn(uint256)",
                    "function burnFrom(address, uint256)",
                    "function getTokenStats() view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
                    "function mintingFee() view returns (uint256)",
                    "function transferFee() view returns (uint256)",
                    "function maxTransferAmount() view returns (uint256)",
                    "function isBlacklisted(address) view returns (bool)",
                    "function isWhitelisted(address) view returns (bool)",
                    "function isMinter(address) view returns (bool)",
                    "function isExcludedFromFees(address) view returns (bool)",
                    "event Transfer(address indexed from, address indexed to, uint256 value)",
                    "event Approval(address indexed owner, address indexed spender, uint256 value)",
                    "event TokensMinted(address indexed to, uint256 amount, uint256 fee)",
                    "event TokensBurned(address indexed from, uint256 amount)"
                ];
            }
        } catch (error) {
            this.logger.error("Error cargando ABI del token:", error);
            throw error;
        }
    }

    /**
     * Verificar contrato del token
     */
    async verifyTokenContract() {
        try {
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                this.tokenContract.name(),
                this.tokenContract.symbol(),
                this.tokenContract.decimals(),
                this.tokenContract.totalSupply()
            ]);
            
            this.logger.info(`Token verificado: ${name} (${symbol})`);
            this.logger.info(`Decimales: ${decimals}`);
            this.logger.info(`Supply total: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
            
        } catch (error) {
            this.logger.error("Error verificando contrato del token:", error);
            throw error;
        }
    }

    /**
     * Obtener información básica del token
     */
    async getTokenInfo() {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                this.tokenContract.name(),
                this.tokenContract.symbol(),
                this.tokenContract.decimals(),
                this.tokenContract.totalSupply()
            ]);

            return {
                address: this.tokenAddress,
                name: name,
                symbol: symbol,
                decimals: decimals,
                totalSupply: ethers.formatUnits(totalSupply, decimals),
                totalSupplyRaw: totalSupply.toString(),
                network: this.blockchainService.getNetwork().name,
                chainId: this.blockchainService.getNetwork().chainId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo información del token:", error);
            throw error;
        }
    }

    /**
     * Obtener balance de una dirección
     */
    async getBalance(address) {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const balance = await this.tokenContract.balanceOf(address);
            const decimals = await this.tokenContract.decimals();
            const symbol = await this.tokenContract.symbol();

            return {
                address: address,
                balance: ethers.formatUnits(balance, decimals),
                balanceRaw: balance.toString(),
                symbol: symbol,
                decimals: decimals,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo balance del token:", error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas del token
     */
    async getTokenStats() {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const stats = await this.tokenContract.getTokenStats();
            const decimals = await this.tokenContract.decimals();
            const symbol = await this.tokenContract.symbol();

            return {
                totalSupply: ethers.formatUnits(stats[0], decimals),
                totalMinted: ethers.formatUnits(stats[1], decimals),
                totalBurned: ethers.formatUnits(stats[2], decimals),
                transactionCount: stats[3].toString(),
                mintingFee: ethers.formatEther(stats[4]),
                transferFee: stats[5].toString(),
                maxTransferAmount: ethers.formatUnits(stats[6], decimals),
                symbol: symbol,
                decimals: decimals,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo estadísticas del token:", error);
            throw error;
        }
    }

    /**
     * Obtener configuración de fees
     */
    async getFeeConfiguration() {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const [mintingFee, transferFee, maxTransferAmount] = await Promise.all([
                this.tokenContract.mintingFee(),
                this.tokenContract.transferFee(),
                this.tokenContract.maxTransferAmount()
            ]);

            const decimals = await this.tokenContract.decimals();

            return {
                mintingFee: ethers.formatEther(mintingFee),
                transferFee: transferFee.toString(),
                maxTransferAmount: ethers.formatUnits(maxTransferAmount, decimals),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo configuración de fees:", error);
            throw error;
        }
    }

    /**
     * Verificar estado de una dirección
     */
    async getAddressStatus(address) {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const [isBlacklisted, isWhitelisted, isMinter, isExcludedFromFees, balance] = await Promise.all([
                this.tokenContract.isBlacklisted(address),
                this.tokenContract.isWhitelisted(address),
                this.tokenContract.isMinter(address),
                this.tokenContract.isExcludedFromFees(address),
                this.tokenContract.balanceOf(address)
            ]);

            const decimals = await this.tokenContract.decimals();

            return {
                address: address,
                isBlacklisted: isBlacklisted,
                isWhitelisted: isWhitelisted,
                isMinter: isMinter,
                isExcludedFromFees: isExcludedFromFees,
                balance: ethers.formatUnits(balance, decimals),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo estado de dirección:", error);
            throw error;
        }
    }

    /**
     * Obtener allowance entre dos direcciones
     */
    async getAllowance(owner, spender) {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const allowance = await this.tokenContract.allowance(owner, spender);
            const decimals = await this.tokenContract.decimals();

            return {
                owner: owner,
                spender: spender,
                allowance: ethers.formatUnits(allowance, decimals),
                allowanceRaw: allowance.toString(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error obteniendo allowance:", error);
            throw error;
        }
    }

    /**
     * Crear transacción de transferencia
     */
    async createTransferTransaction(from, to, amount) {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const decimals = await this.tokenContract.decimals();
            const amountWei = ethers.parseUnits(amount, decimals);
            
            const tx = await this.tokenContract.transfer.populateTransaction(to, amountWei);
            
            return {
                to: this.tokenAddress,
                data: tx.data,
                value: "0",
                from: from,
                gasLimit: "100000",
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error creando transacción de transferencia:", error);
            throw error;
        }
    }

    /**
     * Crear transacción de minting
     */
    async createMintTransaction(to, amount, mintingFee) {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const decimals = await this.tokenContract.decimals();
            const amountWei = ethers.parseUnits(amount, decimals);
            const feeWei = ethers.parseEther(mintingFee);
            
            const tx = await this.tokenContract.mint.populateTransaction(to, amountWei, {
                value: feeWei
            });
            
            return {
                to: this.tokenAddress,
                data: tx.data,
                value: feeWei.toString(),
                from: to,
                gasLimit: "200000",
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error creando transacción de minting:", error);
            throw error;
        }
    }

    /**
     * Crear transacción de burning
     */
    async createBurnTransaction(from, amount) {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }

        try {
            const decimals = await this.tokenContract.decimals();
            const amountWei = ethers.parseUnits(amount, decimals);
            
            const tx = await this.tokenContract.burn.populateTransaction(amountWei);
            
            return {
                to: this.tokenAddress,
                data: tx.data,
                value: "0",
                from: from,
                gasLimit: "100000",
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error("Error creando transacción de burning:", error);
            throw error;
        }
    }

    /**
     * Obtener contrato del token
     */
    getTokenContract() {
        if (!this.isInitialized) {
            throw new Error("TokenService no inicializado");
        }
        return this.tokenContract;
    }

    /**
     * Obtener dirección del token
     */
    getTokenAddress() {
        return this.tokenAddress;
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
            tokenAddress: this.tokenAddress,
            contract: this.tokenContract ? "loaded" : "not_loaded",
            network: this.blockchainService.getNetwork().name,
            chainId: this.blockchainService.getNetwork().chainId,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = TokenService; 