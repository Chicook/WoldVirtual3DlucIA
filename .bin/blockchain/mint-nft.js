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