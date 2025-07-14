const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // Dirección del contrato NFT
const ABI = require('./NFT_ABI.json'); // ABI del contrato
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Clave privada del minter
const PROVIDER_URL = process.env.PROVIDER_URL; // URL del nodo (Infura, Alchemy, etc.)

// Inicializa el proveedor y la wallet
function getProvider() {
    return new ethers.JsonRpcProvider(PROVIDER_URL);
}

function getWallet(provider) {
    return new ethers.Wallet(PRIVATE_KEY, provider);
}

// Obtiene la instancia del contrato
function getContract(wallet) {
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

// Mintea un NFT
async function mintNFT(to, tokenURI) {
    const provider = getProvider();
    const wallet = getWallet(provider);
    const contract = getContract(wallet);

    console.log(`Minting NFT to ${to} with tokenURI: ${tokenURI}`);
    const tx = await contract.mintNFT(to, tokenURI);
    await tx.wait();
    console.log('NFT minted! Tx Hash:', tx.hash);
}

// Consulta el balance de NFTs de una dirección
async function getNFTBalance(address) {
    const provider = getProvider();
    const wallet = getWallet(provider);
    const contract = getContract(wallet);

    const balance = await contract.balanceOf(address);
    console.log(`Address ${address} owns ${balance} NFTs`);
    return balance;
}

// Ejemplo de uso
(async () => {
    const to = '0x...'; // Dirección del destinatario
    const tokenURI = 'https://...'; // URI de los metadatos del NFT

    await mintNFT(to, tokenURI);
    await getNFTBalance(to);
})();

// ============================================================================
// SISTEMA AVANZADO DE NFT MANAGEMENT Y BATCH OPERATIONS
// ============================================================================

class NFTBatchManager {
    constructor() {
        this.batchQueue = [];
        this.mintingHistory = new Map();
        this.gasOptimizer = new GasOptimizer();
        this.metadataManager = new MetadataManager();
    }

    async batchMintNFTs(recipients, metadataURIs, batchSize = 10) {
        console.log(`🚀 Iniciando batch mint de ${recipients.length} NFTs...`);
        
        const batches = this.createBatches(recipients, metadataURIs, batchSize);
        const results = [];
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`📦 Procesando batch ${i + 1}/${batches.length} (${batch.length} NFTs)`);
            
            const batchResult = await this.processBatch(batch);
            results.push(batchResult);
            
            // Pausa entre batches para evitar rate limiting
            if (i < batches.length - 1) {
                await this.delay(2000);
            }
        }
        
        this.saveBatchResults(results);
        return results;
    }

    createBatches(recipients, metadataURIs, batchSize) {
        const batches = [];
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = [];
            for (let j = 0; j < batchSize && i + j < recipients.length; j++) {
                batch.push({
                    recipient: recipients[i + j],
                    metadataURI: metadataURIs[i + j],
                    tokenId: i + j + 1
                });
            }
            batches.push(batch);
        }
        return batches;
    }

    async processBatch(batch) {
        const provider = getProvider();
        const wallet = getWallet(provider);
        const contract = getContract(wallet);
        
        const batchResults = [];
        
        for (const item of batch) {
            try {
                const gasEstimate = await this.gasOptimizer.estimateMintGas(contract, item.recipient, item.metadataURI);
                const optimizedGas = this.gasOptimizer.optimizeGasLimit(gasEstimate);
                
                const tx = await contract.mintNFT(item.recipient, item.metadataURI, {
                    gasLimit: optimizedGas
                });
                
                const receipt = await tx.wait();
                
                const result = {
                    tokenId: item.tokenId,
                    recipient: item.recipient,
                    txHash: tx.hash,
                    gasUsed: receipt.gasUsed.toString(),
                    status: 'success',
                    timestamp: new Date()
                };
                
                batchResults.push(result);
                this.mintingHistory.set(item.tokenId, result);
                
                console.log(`✅ NFT ${item.tokenId} minted to ${item.recipient}`);
                
            } catch (error) {
                console.error(`❌ Error minting NFT ${item.tokenId}:`, error.message);
                batchResults.push({
                    tokenId: item.tokenId,
                    recipient: item.recipient,
                    error: error.message,
                    status: 'failed',
                    timestamp: new Date()
                });
            }
        }
        
        return batchResults;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    saveBatchResults(results) {
        const resultsFile = path.join(__dirname, 'batch-mint-results.json');
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log(`💾 Resultados guardados en ${resultsFile}`);
    }
}

class GasOptimizer {
    constructor() {
        this.gasHistory = new Map();
        this.networkGasPrices = new Map();
    }

    async estimateMintGas(contract, recipient, metadataURI) {
        try {
            const gasEstimate = await contract.mintNFT.estimateGas(recipient, metadataURI);
            return gasEstimate;
        } catch (error) {
            console.warn('Error estimando gas, usando valor por defecto:', error.message);
            return 300000; // Gas por defecto para mint
        }
    }

    optimizeGasLimit(estimatedGas) {
        const buffer = 1.2; // 20% buffer
        return Math.floor(estimatedGas * buffer);
    }

    async updateNetworkGasPrice(network) {
        const provider = getProvider();
        const gasPrice = await provider.getFeeData();
        this.networkGasPrices.set(network, gasPrice);
        return gasPrice;
    }
}

class MetadataManager {
    constructor() {
        this.metadataCache = new Map();
        this.ipfsGateway = 'https://ipfs.io/ipfs/';
    }

    async uploadMetadata(metadata) {
        // Simulación de upload a IPFS
        const ipfsHash = this.generateIPFSHash(metadata);
        const ipfsURI = `${this.ipfsGateway}${ipfsHash}`;
        
        this.metadataCache.set(ipfsHash, metadata);
        return ipfsURI;
    }

    generateIPFSHash(metadata) {
        // Simulación de hash IPFS
        const metadataString = JSON.stringify(metadata);
        const hash = require('crypto').createHash('sha256').update(metadataString).digest('hex');
        return `Qm${hash.substring(0, 44)}`;
    }

    async validateMetadata(metadataURI) {
        try {
            const response = await fetch(metadataURI);
            const metadata = await response.json();
            
            const requiredFields = ['name', 'description', 'image'];
            const isValid = requiredFields.every(field => metadata[field]);
            
            return {
                isValid,
                metadata,
                missingFields: requiredFields.filter(field => !metadata[field])
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }
}

// Instancia global del batch manager
const nftBatchManager = new NFTBatchManager();

// Función extendida para batch minting
async function batchMintNFTs(recipients, metadataURIs, batchSize = 10) {
    return await nftBatchManager.batchMintNFTs(recipients, metadataURIs, batchSize);
}

// Función para validar metadata antes del mint
async function validateAndMintNFT(to, metadata) {
    const metadataManager = new MetadataManager();
    const validation = await metadataManager.validateMetadata(metadata);
    
    if (!validation.isValid) {
        throw new Error(`Metadata inválida: ${validation.missingFields.join(', ')}`);
    }
    
    return await mintNFT(to, metadata);
}

// Exportar funciones extendidas
module.exports = {
    mintNFT,
    getNFTBalance,
    batchMintNFTs,
    validateAndMintNFT,
    nftBatchManager
};