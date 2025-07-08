const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Iniciando despliegue de contratos WCV...");
    
    // Obtener cuentas
    const [deployer] = await ethers.getSigners();
    console.log(`📋 Desplegando desde: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
    
    // Verificar que tenemos ETH para gas
    const balance = await deployer.provider.getBalance(deployer.address);
    if (balance < ethers.parseEther("0.1")) {
        throw new Error("❌ Balance insuficiente para el despliegue");
    }
    
    // Desplegar WCVToken
    console.log("\n📦 Desplegando WCVToken...");
    const WCVToken = await ethers.getContractFactory("WCVToken");
    const wcvToken = await WCVToken.deploy(deployer.address);
    await wcvToken.waitForDeployment();
    
    const wcvTokenAddress = await wcvToken.getAddress();
    console.log(`✅ WCVToken desplegado en: ${wcvTokenAddress}`);
    
    // Verificar el token
    const tokenName = await wcvToken.name();
    const tokenSymbol = await wcvToken.symbol();
    const tokenDecimals = await wcvToken.decimals();
    const totalSupply = await wcvToken.totalSupply();
    
    console.log(`📊 Token Info:`);
    console.log(`   Nombre: ${tokenName}`);
    console.log(`   Símbolo: ${tokenSymbol}`);
    console.log(`   Decimales: ${tokenDecimals}`);
    console.log(`   Supply Total: ${ethers.formatUnits(totalSupply, tokenDecimals)} ${tokenSymbol}`);
    
    // Desplegar WCVBridge
    console.log("\n🌉 Desplegando WCVBridge...");
    const WCVBridge = await ethers.getContractFactory("WCVBridge");
    
    // Dirección temporal del contrato BSC (se actualizará después)
    const tempBSCContract = "0x053532E91FFD6b8a21C925Da101C909A01106BBE";
    const tempValidator = deployer.address; // Por ahora el deployer es el validador
    
    const wcvBridge = await WCVBridge.deploy(
        wcvTokenAddress,
        tempBSCContract,
        tempValidator,
        deployer.address
    );
    await wcvBridge.waitForDeployment();
    
    const wcvBridgeAddress = await wcvBridge.getAddress();
    console.log(`✅ WCVBridge desplegado en: ${wcvBridgeAddress}`);
    
    // Configurar el bridge en el token
    console.log("\n⚙️ Configurando permisos...");
    
    // Hacer al bridge un minter del token
    const mintingFee = await wcvToken.mintingFee();
    console.log(`💰 Fee de minting actual: ${ethers.formatEther(mintingFee)} ETH`);
    
    // Configurar exclusiones de fees para el bridge
    await wcvToken.setExcludedFromFees(wcvBridgeAddress, true);
    console.log("✅ Bridge excluido de fees de transferencia");
    
    // Configurar límites del bridge
    await wcvBridge.setExcludedFromLimits(wcvBridgeAddress, true);
    console.log("✅ Bridge excluido de límites diarios");
    
    // Verificar configuración
    console.log("\n🔍 Verificando configuración...");
    
    const bridgeStats = await wcvBridge.getBridgeStats();
    console.log(`📊 Bridge Stats:`);
    console.log(`   Total Requests: ${bridgeStats[0]}`);
    console.log(`   Daily Limit: ${ethers.formatUnits(bridgeStats[2], 3)} WCV`);
    console.log(`   Bridge Fee: ${ethers.formatEther(bridgeStats[3])} ETH`);
    
    const tokenStats = await wcvToken.getTokenStats();
    console.log(`📊 Token Stats:`);
    console.log(`   Total Supply: ${ethers.formatUnits(tokenStats[0], 3)} WCV`);
    console.log(`   Total Minted: ${ethers.formatUnits(tokenStats[1], 3)} WCV`);
    console.log(`   Total Burned: ${ethers.formatUnits(tokenStats[2], 3)} WCV`);
    console.log(`   Transactions: ${tokenStats[3]}`);
    
    // Guardar información del despliegue
    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            WCVToken: {
                address: wcvTokenAddress,
                name: tokenName,
                symbol: tokenSymbol,
                decimals: tokenDecimals,
                totalSupply: ethers.formatUnits(totalSupply, tokenDecimals),
                constructorArgs: [deployer.address]
            },
            WCVBridge: {
                address: wcvBridgeAddress,
                wcvToken: wcvTokenAddress,
                bscContract: tempBSCContract,
                validator: tempValidator,
                constructorArgs: [wcvTokenAddress, tempBSCContract, tempValidator, deployer.address]
            }
        },
        configuration: {
            mintingFee: ethers.formatEther(mintingFee),
            bridgeFee: ethers.formatEther(bridgeStats[3]),
            dailyBridgeLimit: ethers.formatUnits(bridgeStats[2], 3),
            maxTransferAmount: ethers.formatUnits(await wcvToken.maxTransferAmount(), 3)
        }
    };
    
    // Crear directorio de deployments si no existe
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Guardar archivo de deployment
    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n💾 Información de despliegue guardada en: ${deploymentFile}`);
    
    // Mostrar información para MetaMask
    console.log("\n🔗 Configuración para MetaMask:");
    console.log(`   Chain ID: ${hre.network.config.chainId}`);
    console.log(`   RPC URL: ${hre.network.config.url || "http://127.0.0.1:8545"}`);
    console.log(`   Token Address: ${wcvTokenAddress}`);
    console.log(`   Bridge Address: ${wcvBridgeAddress}`);
    
    // Mostrar comandos útiles
    console.log("\n📝 Comandos útiles:");
    console.log(`   # Verificar contratos en BSCScan (si aplica):`);
    console.log(`   npx hardhat verify --network ${hre.network.name} ${wcvTokenAddress} "${deployer.address}"`);
    console.log(`   npx hardhat verify --network ${hre.network.name} ${wcvBridgeAddress} "${wcvTokenAddress}" "${tempBSCContract}" "${tempValidator}" "${deployer.address}"`);
    
    console.log(`\n   # Ejecutar tests:`);
    console.log(`   npm test`);
    
    console.log(`\n   # Interactuar con contratos:`);
    console.log(`   npx hardhat console --network ${hre.network.name}`);
    
    console.log("\n🎉 ¡Despliegue completado exitosamente!");
    
    return {
        wcvToken: wcvTokenAddress,
        wcvBridge: wcvBridgeAddress,
        deployer: deployer.address
    };
}

// Función para manejar errores
function handleError(error) {
    console.error("❌ Error durante el despliegue:");
    console.error(error);
    process.exit(1);
}

// Ejecutar el script
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(handleError);
}

module.exports = { main }; 