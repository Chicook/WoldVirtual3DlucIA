const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const NETWORKS = ['mainnet', 'rinkeby', 'goerli', 'sepolia', 'localhost'];
const CONTRACTS_DIR = path.join(__dirname, '../contracts');
const LOG_FILE = path.join(__dirname, 'deploy-log.txt');

function log(message) {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`);
}

function listContracts() {
    return fs.readdirSync(CONTRACTS_DIR)
        .filter(file => file.endsWith('.sol'))
        .map(file => file.replace('.sol', ''));
}

function promptUser(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function selectNetwork() {
    console.log('Redes disponibles:');
    NETWORKS.forEach((net, i) => console.log(`${i + 1}. ${net}`));
    const idx = await promptUser('Selecciona la red (número): ');
    return NETWORKS[parseInt(idx) - 1] || 'rinkeby';
}

async function selectContract() {
    const contracts = listContracts();
    console.log('Contratos disponibles:');
    contracts.forEach((c, i) => console.log(`${i + 1}. ${c}`));
    const idx = await promptUser('Selecciona el contrato a desplegar (número, enter para todos): ');
    if (!idx) return null;
    return contracts[parseInt(idx) - 1];
}

function deployContract(network, contract) {
    const script = contract
        ? `npx hardhat run scripts/deploy.js --contract ${contract} --network ${network}`
        : `npx hardhat run scripts/deploy.js --network ${network}`;
    try {
        execSync(script, { stdio: 'inherit' });
        log(`Contrato${contract ? ` ${contract}` : 's'} desplegado(s) en ${network}`);
        console.log('¡Contratos desplegados exitosamente!');
    } catch (error) {
        log(`Error al desplegar: ${error.message}`);
        console.error('Error al desplegar contratos:', error.message);
        process.exit(1);
    }
}

function verifyOnEtherscan(network, contract) {
    try {
        execSync(`npx hardhat verify --network ${network} <direccion_del_contrato>`, { stdio: 'inherit' });
        log(`Contrato ${contract} verificado en Etherscan (${network})`);
        console.log('¡Contrato verificado en Etherscan!');
    } catch (error) {
        log(`Error al verificar: ${error.message}`);
        console.error('Error al verificar contrato:', error.message);
    }
}

async function main() {
    const network = await selectNetwork();
    const contract = await selectContract();
    deployContract(network, contract);

    const verify = await promptUser('¿Deseas verificar el contrato en Etherscan? (s/n): ');
    if (verify.toLowerCase() === 's' && contract) {
        verifyOnEtherscan(network, contract);
    }
}

main();