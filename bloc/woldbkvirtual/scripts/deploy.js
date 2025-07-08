const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deployment de contratos WoldVirtual3D...");

  // Obtener signers
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // 1. Deploy WCV Token
  console.log("\n📦 Deploying WCV Token...");
  const WCVToken = await ethers.getContractFactory("WCVToken");
  const wcvToken = await WCVToken.deploy();
  await wcvToken.deployed();
  console.log("✅ WCV Token deployed to:", wcvToken.address);

  // 2. Deploy Staking Contract
  console.log("\n📦 Deploying WCV Staking Contract...");
  const WCVStaking = await ethers.getContractFactory("WCVStaking");
  const wcvStaking = await WCVStaking.deploy(wcvToken.address);
  await wcvStaking.deployed();
  console.log("✅ WCV Staking deployed to:", wcvStaking.address);

  // 3. Deploy Governance Contract
  console.log("\n📦 Deploying WCV Governance Contract...");
  const WCVGovernance = await ethers.getContractFactory("WCVGovernance");
  const wcvGovernance = await WCVGovernance.deploy(wcvToken.address, wcvStaking.address);
  await wcvGovernance.deployed();
  console.log("✅ WCV Governance deployed to:", wcvGovernance.address);

  // 4. Deploy Bridge Contract
  console.log("\n📦 Deploying WoldVirtual Bridge Contract...");
  const WoldVirtualBridge = await ethers.getContractFactory("WoldVirtualBridge");
  const woldVirtualBridge = await WoldVirtualBridge.deploy(wcvToken.address);
  await woldVirtualBridge.deployed();
  console.log("✅ WoldVirtual Bridge deployed to:", woldVirtualBridge.address);

  // 5. Configurar permisos
  console.log("\n⚙️ Configurando permisos...");
  
  // Configurar staking contract como minter/burner
  await wcvToken.addMinter(wcvStaking.address);
  await wcvToken.addBurner(wcvStaking.address);
  console.log("✅ Staking contract configurado como minter/burner");

  // Configurar bridge contract como minter/burner
  await wcvToken.addMinter(woldVirtualBridge.address);
  await wcvToken.addBurner(woldVirtualBridge.address);
  console.log("✅ Bridge contract configurado como minter/burner");

  // Configurar bridge contract en el token
  await wcvToken.setBridgeContract(woldVirtualBridge.address);
  console.log("✅ Bridge contract configurado en WCV Token");

  // 6. Configurar parámetros iniciales
  console.log("\n⚙️ Configurando parámetros iniciales...");
  
  // Configurar staking
  await wcvStaking.setParameters(
    5, // 5% APY
    1000, // 1 WCV min stake
    1000000000, // 1B WCV max stake
    30 * 24 * 60 * 60, // 30 días lock
    10000000 // 10M WCV para validador
  );
  console.log("✅ Parámetros de staking configurados");

  // Configurar bridge
  await woldVirtualBridge.setLimits(
    1000, // 1 WCV min transfer
    1000000000, // 1B WCV max transfer
    10000000000 // 10B WCV daily limit
  );
  await woldVirtualBridge.setTransferFee(100); // 0.1 WCV fee
  console.log("✅ Parámetros de bridge configurados");

  // Configurar gobernanza
  await wcvGovernance.setParameters(
    10000000, // 10M WCV min proposal stake
    7 * 24 * 60 * 60, // 7 días voting period
    100000000, // 100M WCV quorum
    5000000 // 5M WCV proposal threshold
  );
  console.log("✅ Parámetros de gobernanza configurados");

  // 7. Distribuir tokens iniciales
  console.log("\n💰 Distribuyendo tokens iniciales...");
  
  // Transferir tokens al staking contract para recompensas
  await wcvToken.transfer(wcvStaking.address, ethers.utils.parseUnits("1000000", 3)); // 1M WCV
  console.log("✅ 1M WCV transferidos al staking contract");

  // Transferir tokens al bridge contract para liquidez
  await wcvToken.transfer(woldVirtualBridge.address, ethers.utils.parseUnits("500000", 3)); // 500K WCV
  console.log("✅ 500K WCV transferidos al bridge contract");

  // 8. Verificar contratos
  console.log("\n🔍 Verificando contratos...");
  
  const wcvBalance = await wcvToken.balanceOf(deployer.address);
  const stakingBalance = await wcvToken.balanceOf(wcvStaking.address);
  const bridgeBalance = await wcvToken.balanceOf(woldVirtualBridge.address);
  
  console.log("💰 Balance deployer:", ethers.utils.formatUnits(wcvBalance, 3), "WCV");
  console.log("💰 Balance staking:", ethers.utils.formatUnits(stakingBalance, 3), "WCV");
  console.log("💰 Balance bridge:", ethers.utils.formatUnits(bridgeBalance, 3), "WCV");

  // 9. Guardar direcciones
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      wcvToken: wcvToken.address,
      wcvStaking: wcvStaking.address,
      wcvGovernance: wcvGovernance.address,
      woldVirtualBridge: woldVirtualBridge.address
    },
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  fs.writeFileSync(
    `deployment-${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Información de deployment guardada");

  console.log("\n🎉 Deployment completado exitosamente!");
  console.log("\n📋 Resumen de contratos:");
  console.log("   WCV Token:", wcvToken.address);
  console.log("   WCV Staking:", wcvStaking.address);
  console.log("   WCV Governance:", wcvGovernance.address);
  console.log("   WoldVirtual Bridge:", woldVirtualBridge.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en deployment:", error);
    process.exit(1);
  }); 