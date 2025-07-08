/**
 * Ejemplo básico de uso de WCV Blockchain
 * 
 * Este archivo muestra cómo:
 * 1. Conectar a la blockchain WCV
 * 2. Interactuar con el token WCV
 * 3. Usar el bridge para transferir tokens
 * 4. Obtener información de la red
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Configuración
const CONFIG = {
    rpcUrl: "http://127.0.0.1:8545",
    chainId: 31337,
    privateKey: process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"
};

class WCVExample {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.wcvToken = null;
        this.wcvBridge = null;
        this.deploymentInfo = null;
    }

    /**
     * Inicializar conexión
     */
    async initialize() {
        console.log("🚀 Inicializando WCV Blockchain Example...");
        
        try {
            // Conectar al provider
            this.provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
            console.log("✅ Conectado al provider");
            
            // Crear wallet
            this.wallet = new ethers.Wallet(CONFIG.privateKey, this.provider);
            console.log(`✅ Wallet creado: ${this.wallet.address}`);
            
            // Cargar información de deployment
            await this.loadDeploymentInfo();
            
            // Crear instancias de contratos
            await this.createContractInstances();
            
            console.log("✅ Inicialización completada");
            
        } catch (error) {
            console.error("❌ Error en inicialización:", error);
            throw error;
        }
    }

    /**
     * Cargar información de deployment
     */
    async loadDeploymentInfo() {
        try {
            const deploymentFile = path.join(__dirname, "../deployments/wcvLocal.json");
            
            if (fs.existsSync(deploymentFile)) {
                this.deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
                console.log("✅ Información de deployment cargada");
            } else {
                console.warn("⚠️ Archivo de deployment no encontrado, usando valores por defecto");
                this.deploymentInfo = {
                    contracts: {
                        WCVToken: { address: "0x0000000000000000000000000000000000000000" },
                        WCVBridge: { address: "0x0000000000000000000000000000000000000000" }
                    }
                };
            }
        } catch (error) {
            console.error("Error cargando deployment info:", error);
            throw error;
        }
    }

    /**
     * Crear instancias de contratos
     */
    async createContractInstances() {
        try {
            // ABI básico para el token
            const tokenABI = [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function decimals() view returns (uint8)",
                "function totalSupply() view returns (uint256)",
                "function balanceOf(address) view returns (uint256)",
                "function transfer(address, uint256) returns (bool)",
                "function mint(address, uint256) payable",
                "function burn(uint256)",
                "function getTokenStats() view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)"
            ];

            // ABI básico para el bridge
            const bridgeABI = [
                "function getBridgeStats() view returns (uint256, uint256, uint256, uint256, uint256)",
                "function bridgeToBSC(address, uint256) payable",
                "function createBSCToWCVRequest(address, address, uint256, bytes32)"
            ];

            // Crear instancia del token
            this.wcvToken = new ethers.Contract(
                this.deploymentInfo.contracts.WCVToken.address,
                tokenABI,
                this.wallet
            );

            // Crear instancia del bridge
            this.wcvBridge = new ethers.Contract(
                this.deploymentInfo.contracts.WCVBridge.address,
                bridgeABI,
                this.wallet
            );

            console.log("✅ Instancias de contratos creadas");
        } catch (error) {
            console.error("Error creando instancias de contratos:", error);
            throw error;
        }
    }

    /**
     * Obtener información de la red
     */
    async getNetworkInfo() {
        try {
            console.log("\n📊 Información de la Red:");
            
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            const balance = await this.provider.getBalance(this.wallet.address);
            
            console.log(`   Chain ID: ${network.chainId}`);
            console.log(`   Block Number: ${blockNumber}`);
            console.log(`   Wallet Balance: ${ethers.formatEther(balance)} ETH`);
            
            return { network, blockNumber, balance };
        } catch (error) {
            console.error("Error obteniendo información de red:", error);
            throw error;
        }
    }

    /**
     * Obtener información del token
     */
    async getTokenInfo() {
        try {
            console.log("\n🪙 Información del Token WCV:");
            
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                this.wcvToken.name(),
                this.wcvToken.symbol(),
                this.wcvToken.decimals(),
                this.wcvToken.totalSupply()
            ]);
            
            console.log(`   Nombre: ${name}`);
            console.log(`   Símbolo: ${symbol}`);
            console.log(`   Decimales: ${decimals}`);
            console.log(`   Supply Total: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
            
            return { name, symbol, decimals, totalSupply };
        } catch (error) {
            console.error("Error obteniendo información del token:", error);
            throw error;
        }
    }

    /**
     * Obtener balance del token
     */
    async getTokenBalance(address = null) {
        try {
            const targetAddress = address || this.wallet.address;
            const balance = await this.wcvToken.balanceOf(targetAddress);
            const decimals = await this.wcvToken.decimals();
            const symbol = await this.wcvToken.symbol();
            
            console.log(`\n💰 Balance de ${symbol}:`);
            console.log(`   Dirección: ${targetAddress}`);
            console.log(`   Balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
            
            return { address: targetAddress, balance, symbol, decimals };
        } catch (error) {
            console.error("Error obteniendo balance del token:", error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas del token
     */
    async getTokenStats() {
        try {
            console.log("\n📈 Estadísticas del Token:");
            
            const stats = await this.wcvToken.getTokenStats();
            const decimals = await this.wcvToken.decimals();
            const symbol = await this.wcvToken.symbol();
            
            console.log(`   Supply Total: ${ethers.formatUnits(stats[0], decimals)} ${symbol}`);
            console.log(`   Total Minted: ${ethers.formatUnits(stats[1], decimals)} ${symbol}`);
            console.log(`   Total Burned: ${ethers.formatUnits(stats[2], decimals)} ${symbol}`);
            console.log(`   Transacciones: ${stats[3]}`);
            console.log(`   Fee de Minting: ${ethers.formatEther(stats[4])} ETH`);
            console.log(`   Fee de Transferencia: ${stats[5]} basis points`);
            console.log(`   Límite Máximo: ${ethers.formatUnits(stats[6], decimals)} ${symbol}`);
            
            return stats;
        } catch (error) {
            console.error("Error obteniendo estadísticas del token:", error);
            throw error;
        }
    }

    /**
     * Transferir tokens
     */
    async transferTokens(to, amount) {
        try {
            console.log(`\n🔄 Transferiendo ${amount} WCV a ${to}...`);
            
            const decimals = await this.wcvToken.decimals();
            const amountWei = ethers.parseUnits(amount, decimals);
            
            const tx = await this.wcvToken.transfer(to, amountWei);
            console.log(`   Transacción enviada: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`   Transacción confirmada en bloque: ${receipt.blockNumber}`);
            
            return { tx, receipt };
        } catch (error) {
            console.error("Error transfiriendo tokens:", error);
            throw error;
        }
    }

    /**
     * Acuñar tokens (solo si es minter)
     */
    async mintTokens(to, amount) {
        try {
            console.log(`\n🪙 Acuñando ${amount} WCV para ${to}...`);
            
            const decimals = await this.wcvToken.decimals();
            const amountWei = ethers.parseUnits(amount, decimals);
            const mintingFee = ethers.parseEther("0.001"); // 0.001 ETH
            
            const tx = await this.wcvToken.mint(to, amountWei, { value: mintingFee });
            console.log(`   Transacción enviada: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`   Tokens acuñados en bloque: ${receipt.blockNumber}`);
            
            return { tx, receipt };
        } catch (error) {
            console.error("Error acuñando tokens:", error);
            throw error;
        }
    }

    /**
     * Quemar tokens
     */
    async burnTokens(amount) {
        try {
            console.log(`\n🔥 Quemando ${amount} WCV...`);
            
            const decimals = await this.wcvToken.decimals();
            const amountWei = ethers.parseUnits(amount, decimals);
            
            const tx = await this.wcvToken.burn(amountWei);
            console.log(`   Transacción enviada: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`   Tokens quemados en bloque: ${receipt.blockNumber}`);
            
            return { tx, receipt };
        } catch (error) {
            console.error("Error quemando tokens:", error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas del bridge
     */
    async getBridgeStats() {
        try {
            console.log("\n🌉 Estadísticas del Bridge:");
            
            const stats = await this.wcvBridge.getBridgeStats();
            
            console.log(`   Total Requests: ${stats[0]}`);
            console.log(`   Current Daily Amount: ${ethers.formatUnits(stats[1], 3)} WCV`);
            console.log(`   Daily Limit: ${ethers.formatUnits(stats[2], 3)} WCV`);
            console.log(`   Bridge Fee: ${ethers.formatEther(stats[3])} ETH`);
            console.log(`   Last Reset: ${new Date(stats[4] * 1000).toISOString()}`);
            
            return stats;
        } catch (error) {
            console.error("Error obteniendo estadísticas del bridge:", error);
            throw error;
        }
    }

    /**
     * Ejecutar ejemplo completo
     */
    async runExample() {
        try {
            console.log("🎯 Ejecutando ejemplo completo de WCV Blockchain...\n");
            
            // 1. Obtener información de la red
            await this.getNetworkInfo();
            
            // 2. Obtener información del token
            await this.getTokenInfo();
            
            // 3. Obtener balance inicial
            await this.getTokenBalance();
            
            // 4. Obtener estadísticas del token
            await this.getTokenStats();
            
            // 5. Obtener estadísticas del bridge
            await this.getBridgeStats();
            
            // 6. Ejemplo de transferencia (comentado para evitar errores)
            // const recipient = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
            // await this.transferTokens(recipient, "100");
            
            // 7. Ejemplo de minting (comentado para evitar errores)
            // await this.mintTokens(this.wallet.address, "1000");
            
            // 8. Ejemplo de burning (comentado para evitar errores)
            // await this.burnTokens("100");
            
            console.log("\n✅ Ejemplo completado exitosamente!");
            console.log("\n💡 Para ejecutar transferencias, minting o burning:");
            console.log("   1. Descomenta las líneas correspondientes");
            console.log("   2. Asegúrate de tener suficiente ETH para gas");
            console.log("   3. Verifica que tengas permisos de minter si vas a acuñar");
            
        } catch (error) {
            console.error("❌ Error ejecutando ejemplo:", error);
        }
    }
}

// Función principal
async function main() {
    const example = new WCVExample();
    
    try {
        await example.initialize();
        await example.runExample();
    } catch (error) {
        console.error("❌ Error en el ejemplo:", error);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main();
}

module.exports = { WCVExample }; 