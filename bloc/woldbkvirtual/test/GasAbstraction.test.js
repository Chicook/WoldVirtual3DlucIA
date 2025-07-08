const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gas Abstraction System", function () {
  let BSWCV, bswcv;
  let GasFeeManager, gasFeeManager;
  let WCVGasProxy, wcvGasProxy;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy BSWCV
    BSWCV = await ethers.getContractFactory("BSWCV");
    bswcv = await BSWCV.deploy();
    await bswcv.deployed();
    
    // Deploy GasFeeManager
    GasFeeManager = await ethers.getContractFactory("GasFeeManager");
    gasFeeManager = await GasFeeManager.deploy();
    await gasFeeManager.deployed();
    
    // Deploy WCVGasProxy
    WCVGasProxy = await ethers.getContractFactory("WCVGasProxy");
    wcvGasProxy = await WCVGasProxy.deploy(gasFeeManager.address, bswcv.address);
    await wcvGasProxy.deployed();
    
    // Configurar BSWCV
    await bswcv.addBurner(gasFeeManager.address);
    await bswcv.depositBNB({ value: ethers.utils.parseEther("1") });
    
    // Configurar GasFeeManager
    await gasFeeManager.registerNetwork("BSC", bswcv.address, 100, true);
    await gasFeeManager.updateServiceNetworkFee("publish_island", "BSC", 1);
    await gasFeeManager.updateServiceNetworkFee("create_avatar", "BSC", 5);
    
    // Distribuir BSWCV para testing
    await bswcv.transfer(user1.address, ethers.utils.parseUnits("1000", 3));
    await bswcv.transfer(user2.address, ethers.utils.parseUnits("1000", 3));
  });

  describe("BSWCV", function () {
    it("Should have correct name and symbol", async function () {
      expect(await bswcv.name()).to.equal("Wrapped WCV");
      expect(await bswcv.symbol()).to.equal("BSWCV");
      expect(await bswcv.decimals()).to.equal(3);
    });

    it("Should allow gas fee payment", async function () {
      const serviceName = "publish_island";
      const transactionId = ethers.utils.id("test-transaction");
      
      const initialBalance = await bswcv.balanceOf(user1.address);
      const initialBNBBalance = await ethers.provider.getBalance(bswcv.address);
      
      await bswcv.connect(user1).payGasFee(serviceName, transactionId);
      
      const finalBalance = await bswcv.balanceOf(user1.address);
      const finalBNBBalance = await ethers.provider.getBalance(bswcv.address);
      
      expect(finalBalance).to.equal(initialBalance.sub(1)); // 1 WCV fee
      expect(finalBNBBalance).to.be.lt(initialBNBBalance); // BNB spent
    });

    it("Should register services correctly", async function () {
      const serviceName = "test_service";
      const gasFee = 10;
      
      await bswcv.registerService(serviceName, gasFee, true);
      
      const service = await bswcv.getServiceInfo(serviceName);
      expect(service.gasFee).to.equal(gasFee);
      expect(service.active).to.be.true;
    });

    it("Should handle multiple service payments", async function () {
      const serviceNames = ["publish_island", "publish_house"];
      const transactionId = ethers.utils.id("test-multiple");
      
      const initialBalance = await bswcv.balanceOf(user1.address);
      
      await bswcv.connect(user1).payMultipleGasFees(serviceNames, transactionId);
      
      const finalBalance = await bswcv.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(2)); // 2 WCV total
    });
  });

  describe("GasFeeManager", function () {
    it("Should register networks correctly", async function () {
      const networkName = "ETH";
      const gasToken = ethers.constants.AddressZero;
      const gasMultiplier = 150;
      
      await gasFeeManager.registerNetwork(networkName, gasToken, gasMultiplier, true);
      
      const network = await gasFeeManager.getNetworkInfo(networkName);
      expect(network.name).to.equal(networkName);
      expect(network.gasMultiplier).to.equal(gasMultiplier);
      expect(network.active).to.be.true;
    });

    it("Should calculate fees correctly", async function () {
      const serviceFee = await gasFeeManager.getServiceFee("publish_island", "BSC");
      expect(serviceFee).to.equal(1); // 0.001 WCV
    });

    it("Should calculate cross-chain fees", async function () {
      // Registrar ETH como red adicional
      await gasFeeManager.registerNetwork("ETH", ethers.constants.AddressZero, 150, true);
      await gasFeeManager.updateServiceNetworkFee("publish_island", "ETH", 2);
      
      const crossChainFee = await gasFeeManager.getCrossChainFee("publish_island", "BSC", "ETH");
      expect(crossChainFee).to.equal(2); // 1 (BSC) + 50% of 2 (ETH) = 2
    });

    it("Should handle gas fee payments", async function () {
      const serviceName = "publish_island";
      const networkName = "BSC";
      const transactionId = ethers.utils.id("test-gas-fee");
      
      const initialBalance = await bswcv.balanceOf(user1.address);
      
      await gasFeeManager.connect(user1).payGasFee(serviceName, networkName, transactionId);
      
      const finalBalance = await bswcv.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(1));
    });
  });

  describe("WCVGasProxy", function () {
    it("Should publish island correctly", async function () {
      const islandName = "Test Island";
      const metadata = '{"type":"island","size":"medium"}';
      const transactionId = ethers.utils.id("test-island");
      
      const initialBalance = await bswcv.balanceOf(user1.address);
      
      const assetId = await wcvGasProxy.connect(user1).publishIsland(
        "BSC",
        islandName,
        metadata,
        transactionId
      );
      
      const finalBalance = await bswcv.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(1));
      
      const asset = await wcvGasProxy.getAssetInfo(assetId);
      expect(asset.owner).to.equal(user1.address);
      expect(asset.assetType).to.equal("island");
      expect(asset.network).to.equal("BSC");
    });

    it("Should create avatar correctly", async function () {
      const avatarName = "Test Avatar";
      const appearance = '{"hair":"black","eyes":"brown"}';
      const transactionId = ethers.utils.id("test-avatar");
      
      const initialBalance = await bswcv.balanceOf(user1.address);
      
      const avatarId = await wcvGasProxy.connect(user1).createAvatar(
        "BSC",
        avatarName,
        appearance,
        transactionId
      );
      
      const finalBalance = await bswcv.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(5)); // 5 WCV fee
      
      const avatar = await wcvGasProxy.getAvatarInfo(avatarId);
      expect(avatar.owner).to.equal(user1.address);
      expect(avatar.name).to.equal(avatarName);
      expect(avatar.network).to.equal("BSC");
    });

    it("Should create world correctly", async function () {
      const worldName = "Test World";
      const description = "A test world";
      const maxPlayers = 100;
      const transactionId = ethers.utils.id("test-world");
      
      const initialBalance = await bswcv.balanceOf(user1.address);
      
      const worldId = await wcvGasProxy.connect(user1).createWorld(
        "BSC",
        worldName,
        description,
        maxPlayers,
        transactionId
      );
      
      const finalBalance = await bswcv.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(50)); // 50 WCV fee
      
      const world = await wcvGasProxy.getWorldInfo(worldId);
      expect(world.creator).to.equal(user1.address);
      expect(world.name).to.equal(worldName);
      expect(world.maxPlayers).to.equal(maxPlayers);
    });

    it("Should join metaverse correctly", async function () {
      const transactionId = ethers.utils.id("test-join");
      
      const initialBalance = await bswcv.balanceOf(user1.address);
      
      await wcvGasProxy.connect(user1).joinMetaverse("BSC", transactionId);
      
      const finalBalance = await bswcv.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(1)); // 1 WCV fee
    });

    it("Should transfer assets correctly", async function () {
      // Primero crear un asset
      const assetName = "Test Asset";
      const metadata = '{"type":"house","size":"large"}';
      const createTxId = ethers.utils.id("create-asset");
      
      const assetId = await wcvGasProxy.connect(user1).publishHouse(
        "BSC",
        assetName,
        metadata,
        createTxId
      );
      
      // Luego transferirlo
      const transferTxId = ethers.utils.id("transfer-asset");
      const initialBalance = await bswcv.balanceOf(user1.address);
      
      await wcvGasProxy.connect(user1).transferAsset(
        assetId,
        user2.address,
        "BSC",
        transferTxId
      );
      
      const finalBalance = await bswcv.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(2)); // 2 WCV transfer fee
      
      const asset = await wcvGasProxy.getAssetInfo(assetId);
      expect(asset.owner).to.equal(user2.address);
    });

    it("Should get user assets correctly", async function () {
      const islandName = "My Island";
      const houseName = "My House";
      const islandTxId = ethers.utils.id("island-1");
      const houseTxId = ethers.utils.id("house-1");
      
      await wcvGasProxy.connect(user1).publishIsland("BSC", islandName, "", islandTxId);
      await wcvGasProxy.connect(user1).publishHouse("BSC", houseName, "", houseTxId);
      
      const userAssets = await wcvGasProxy.getUserAssets(user1.address);
      expect(userAssets.length).to.equal(2);
    });

    it("Should handle insufficient balance", async function () {
      const transactionId = ethers.utils.id("insufficient-balance");
      
      // Usuario sin BSWCV
      await expect(
        wcvGasProxy.connect(user2).publishIsland("BSC", "Test", "", transactionId)
      ).to.be.revertedWith("Gas fee payment failed");
    });

    it("Should handle invalid actions", async function () {
      const transactionId = ethers.utils.id("invalid-action");
      
      // Deshabilitar acción
      await wcvGasProxy.setAction("publish_island", 1, false);
      
      await expect(
        wcvGasProxy.connect(user1).publishIsland("BSC", "Test", "", transactionId)
      ).to.be.revertedWith("Action not allowed");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete metaverse workflow", async function () {
      // 1. Usuario se une al metaverso
      const joinTxId = ethers.utils.id("join-metaverse");
      await wcvGasProxy.connect(user1).joinMetaverse("BSC", joinTxId);
      
      // 2. Usuario crea avatar
      const avatarTxId = ethers.utils.id("create-avatar");
      const avatarId = await wcvGasProxy.connect(user1).createAvatar(
        "BSC",
        "My Avatar",
        '{"hair":"brown"}',
        avatarTxId
      );
      
      // 3. Usuario crea mundo
      const worldTxId = ethers.utils.id("create-world");
      const worldId = await wcvGasProxy.connect(user1).createWorld(
        "BSC",
        "My World",
        "A beautiful world",
        50,
        worldTxId
      );
      
      // 4. Usuario publica isla en su mundo
      const islandTxId = ethers.utils.id("publish-island");
      const assetId = await wcvGasProxy.connect(user1).publishIsland(
        "BSC",
        "My Island",
        '{"worldId":"' + worldId + '"}',
        islandTxId
      );
      
      // 5. Usuario publica casa en su isla
      const houseTxId = ethers.utils.id("publish-house");
      const houseId = await wcvGasProxy.connect(user1).publishHouse(
        "BSC",
        "My House",
        '{"islandId":"' + assetId + '"}',
        houseTxId
      );
      
      // Verificar que todo se creó correctamente
      const userAssets = await wcvGasProxy.getUserAssets(user1.address);
      const userWorlds = await wcvGasProxy.getUserWorlds(user1.address);
      const userAvatars = await wcvGasProxy.getUserAvatars(user1.address);
      
      expect(userAssets.length).to.equal(2); // isla + casa
      expect(userWorlds.length).to.equal(1); // mundo
      expect(userAvatars.length).to.equal(1); // avatar
      
      // Verificar estadísticas
      const stats = await wcvGasProxy.getContractStats();
      expect(stats.totalAssets).to.equal(2);
      expect(stats.totalWorlds).to.equal(1);
      expect(stats.totalAvatars).to.equal(1);
    });

    it("Should handle cross-chain operations", async function () {
      // Registrar ETH como red adicional
      await gasFeeManager.registerNetwork("ETH", ethers.constants.AddressZero, 150, true);
      await gasFeeManager.updateServiceNetworkFee("publish_island", "ETH", 2);
      
      const crossChainTxId = ethers.utils.id("cross-chain");
      
      // Usuario paga fee cross-chain
      await gasFeeManager.connect(user1).payCrossChainGasFee(
        "publish_island",
        "BSC",
        "ETH",
        crossChainTxId
      );
      
      // Verificar que se registró la transacción cross-chain
      const stats = await gasFeeManager.getContractStats();
      expect(stats.totalCrossChainFees).to.be.gt(0);
    });
  });
}); 