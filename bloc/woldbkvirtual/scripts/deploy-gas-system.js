const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deployment del sistema de Gas Abstraction...");

  // Obtener signers
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // 1. Deploy BSWCV (Wrapped WCV para BSC)
  console.log("\n📦 Deploying BSWCV (Wrapped WCV for BSC)...");
  const BSWCV = await ethers.getContractFactory("BSWCV");
  const bswcv = await BSWCV.deploy();
  await bswcv.deployed();
  console.log("✅ BSWCV deployed to:", bswcv.address);

  // 2. Deploy GasFeeManager
  console.log("\n📦 Deploying GasFeeManager...");
  const GasFeeManager = await ethers.getContractFactory("GasFeeManager");
  const gasFeeManager = await GasFeeManager.deploy();
  await gasFeeManager.deployed();
  console.log("✅ GasFeeManager deployed to:", gasFeeManager.address);

  // 3. Deploy WCVGasProxy
  console.log("\n📦 Deploying WCVGasProxy...");
  const WCVGasProxy = await ethers.getContractFactory("WCVGasProxy");
  const wcvGasProxy = await WCVGasProxy.deploy(gasFeeManager.address, bswcv.address);
  await wcvGasProxy.deployed();
  console.log("✅ WCVGasProxy deployed to:", wcvGasProxy.address);

  // 4. Configurar BSWCV
  console.log("\n⚙️ Configurando BSWCV...");
  
  // Configurar gas fee manager como burner
  await bswcv.addBurner(gasFeeManager.address);
  console.log("✅ GasFeeManager configurado como burner en BSWCV");

  // Depositar BNB al contrato BSWCV
  const bnbDeposit = ethers.utils.parseEther("1"); // 1 BNB
  await bswcv.depositBNB({ value: bnbDeposit });
  console.log("✅ 1 BNB depositado en BSWCV");

  // 5. Configurar GasFeeManager
  console.log("\n⚙️ Configurando GasFeeManager...");
  
  // Registrar BSWCV como token de gas para BSC
  await gasFeeManager.registerNetwork("BSC", bswcv.address, 100, true);
  console.log("✅ BSC registrada con BSWCV en GasFeeManager");

  // Configurar fees específicos por red
  await gasFeeManager.updateServiceNetworkFee("publish_island", "BSC", 1);
  await gasFeeManager.updateServiceNetworkFee("publish_house", "BSC", 1);
  await gasFeeManager.updateServiceNetworkFee("create_avatar", "BSC", 5);
  await gasFeeManager.updateServiceNetworkFee("create_world", "BSC", 50);
  console.log("✅ Fees específicos configurados para BSC");

  // 6. Configurar WCVGasProxy
  console.log("\n⚙️ Configurando WCVGasProxy...");
  
  // Configurar acciones y fees
  await wcvGasProxy.setAction("publish_island", 1, true);
  await wcvGasProxy.setAction("publish_house", 1, true);
  await wcvGasProxy.setAction("create_avatar", 5, true);
  await wcvGasProxy.setAction("create_world", 50, true);
  await wcvGasProxy.setAction("join_metaverse", 1, true);
  await wcvGasProxy.setAction("transfer_asset", 2, true);
  console.log("✅ Acciones y fees configurados en WCVGasProxy");

  // 7. Distribuir BSWCV para testing
  console.log("\n💰 Distribuyendo BSWCV para testing...");
  
  // Transferir BSWCV al deployer para testing
  const testAmount = ethers.utils.parseUnits("10000", 3); // 10K BSWCV
  await bswcv.transfer(deployer.address, testAmount);
  console.log("✅ 10K BSWCV transferidos al deployer para testing");

  // 8. Verificar configuración
  console.log("\n🔍 Verificando configuración...");
  
  // Verificar BSWCV
  const bswcvBalance = await bswcv.balanceOf(deployer.address);
  const bnbBalance = await ethers.provider.getBalance(bswcv.address);
  
  console.log("💰 BSWCV balance deployer:", ethers.utils.formatUnits(bswcvBalance, 3), "BSWCV");
  console.log("💰 BNB balance BSWCV:", ethers.utils.formatEther(bnbBalance), "BNB");

  // Verificar servicios registrados
  const publishIslandFee = await gasFeeManager.getServiceFee("publish_island", "BSC");
  const createWorldFee = await gasFeeManager.getServiceFee("create_world", "BSC");
  
  console.log("💰 Fee publish_island en BSC:", publishIslandFee.toString(), "WCV");
  console.log("💰 Fee create_world en BSC:", createWorldFee.toString(), "WCV");

  // 9. Ejecutar tests básicos
  console.log("\n🧪 Ejecutando tests básicos...");
  
  // Test: Publicar isla
  const islandName = "Mi Isla Paradisíaca";
  const islandMetadata = '{"type":"island","size":"large","theme":"tropical"}';
  const islandTxId = ethers.utils.id("test-island-" + Date.now());
  
  try {
    const assetId = await wcvGasProxy.publishIsland("BSC", islandName, islandMetadata, islandTxId);
    console.log("✅ Test publishIsland exitoso, Asset ID:", assetId);
  } catch (error) {
    console.log("❌ Test publishIsland falló:", error.message);
  }

  // Test: Crear avatar
  const avatarName = "Mi Avatar";
  const avatarAppearance = '{"hair":"brown","eyes":"blue","height":"tall"}';
  const avatarTxId = ethers.utils.id("test-avatar-" + Date.now());
  
  try {
    const avatarId = await wcvGasProxy.createAvatar("BSC", avatarName, avatarAppearance, avatarTxId);
    console.log("✅ Test createAvatar exitoso, Avatar ID:", avatarId);
  } catch (error) {
    console.log("❌ Test createAvatar falló:", error.message);
  }

  // 10. Guardar direcciones
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      bswcv: bswcv.address,
      gasFeeManager: gasFeeManager.address,
      wcvGasProxy: wcvGasProxy.address
    },
    configuration: {
      bnbDeposited: ethers.utils.formatEther(bnbDeposit),
      bswcvDistributed: ethers.utils.formatUnits(testAmount, 3),
      services: {
        publish_island: 1,
        publish_house: 1,
        create_avatar: 5,
        create_world: 50,
        join_metaverse: 1,
        transfer_asset: 2
      }
    },
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  fs.writeFileSync(
    `gas-system-deployment-${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Información de deployment guardada");

  console.log("\n🎉 Deployment del sistema de Gas Abstraction completado!");
  console.log("\n📋 Resumen de contratos:");
  console.log("   BSWCV (Wrapped WCV):", bswcv.address);
  console.log("   GasFeeManager:", gasFeeManager.address);
  console.log("   WCVGasProxy:", wcvGasProxy.address);
  
  console.log("\n💡 Cómo usar el sistema:");
  console.log("   1. Usuario conecta wallet desde BSC");
  console.log("   2. Usuario tiene BSWCV en su wallet");
  console.log("   3. Usuario llama a WCVGasProxy.publishIsland()");
  console.log("   4. Sistema automáticamente:");
  console.log("      - Quema BSWCV del usuario");
  console.log("      - Paga gas fees en BNB");
  console.log("      - Registra la acción en el metaverso");
  console.log("   5. Usuario solo paga en WCV, no se preocupa por BNB");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en deployment:", error);
    process.exit(1);
  }); 