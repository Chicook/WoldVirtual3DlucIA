// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/core/MetaversoCore.sol";
import "../contracts/core/MetaversoToken.sol";
import "../contracts/nfts/MetaversoNFT.sol";
import "../contracts/defi/MetaversoDeFi.sol";
import "../contracts/governance/MetaversoGovernance.sol";

/**
 * @title Deploy
 * @dev Script de despliegue para todos los contratos del metaverso
 * @author Metaverso Crypto World Virtual 3D
 */
contract Deploy is Script {
    // ============ STATE VARIABLES ============

    MetaversoCore public metaversoCore;
    MetaversoToken public metaversoToken;
    MetaversoNFT public metaversoNFT;
    MetaversoDeFi public metaversoDeFi;
    MetaversoGovernance public metaversoGovernance;

    // ============ DEPLOYMENT ADDRESSES ============

    address public deployer;
    address public treasury;
    address public wethAddress;

    // ============ CONFIGURATION ============

    uint256 public constant INITIAL_TOKEN_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant TREASURY_ALLOCATION = 100000000 * 10**18; // 100 million tokens
    uint256 public constant COMMUNITY_ALLOCATION = 200000000 * 10**18; // 200 million tokens
    uint256 public constant TEAM_ALLOCATION = 50000000 * 10**18; // 50 million tokens
    uint256 public constant ECOSYSTEM_ALLOCATION = 150000000 * 10**18; // 150 million tokens

    // ============ EVENTS ============

    event ContractDeployed(string contractName, address contractAddress);
    event ConfigurationSet(string setting, string value);
    event InitializationComplete();

    // ============ MAIN DEPLOYMENT FUNCTION ============

    function run() external {
        // Get deployment parameters
        deployer = msg.sender;
        treasury = vm.envAddress("TREASURY_ADDRESS");
        wethAddress = vm.envAddress("WETH_ADDRESS");

        console.log("🚀 Iniciando despliegue del Metaverso Crypto World Virtual 3D");
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("WETH Address:", wethAddress);

        vm.startBroadcast();

        // Step 1: Deploy MetaversoToken
        console.log("\n📝 Desplegando MetaversoToken...");
        metaversoToken = new MetaversoToken();
        emit ContractDeployed("MetaversoToken", address(metaversoToken));
        console.log("✅ MetaversoToken desplegado en:", address(metaversoToken));

        // Step 2: Deploy MetaversoCore
        console.log("\n🌍 Desplegando MetaversoCore...");
        metaversoCore = new MetaversoCore();
        emit ContractDeployed("MetaversoCore", address(metaversoCore));
        console.log("✅ MetaversoCore desplegado en:", address(metaversoCore));

        // Step 3: Deploy MetaversoNFT
        console.log("\n🎨 Desplegando MetaversoNFT...");
        metaversoNFT = new MetaversoNFT();
        emit ContractDeployed("MetaversoNFT", address(metaversoNFT));
        console.log("✅ MetaversoNFT desplegado en:", address(metaversoNFT));

        // Step 4: Deploy MetaversoDeFi
        console.log("\n💰 Desplegando MetaversoDeFi...");
        metaversoDeFi = new MetaversoDeFi(address(metaversoToken), wethAddress);
        emit ContractDeployed("MetaversoDeFi", address(metaversoDeFi));
        console.log("✅ MetaversoDeFi desplegado en:", address(metaversoDeFi));

        // Step 5: Deploy MetaversoGovernance
        console.log("\n🗳️ Desplegando MetaversoGovernance...");
        metaversoGovernance = new MetaversoGovernance(address(metaversoCore), address(metaversoToken));
        emit ContractDeployed("MetaversoGovernance", address(metaversoGovernance));
        console.log("✅ MetaversoGovernance desplegado en:", address(metaversoGovernance));

        vm.stopBroadcast();

        // Step 6: Configure contracts
        console.log("\n⚙️ Configurando contratos...");
        _configureContracts();

        // Step 7: Initialize token distribution
        console.log("\n🎁 Inicializando distribución de tokens...");
        _initializeTokenDistribution();

        // Step 8: Create initial collections and pools
        console.log("\n🏗️ Creando colecciones y pools iniciales...");
        _createInitialCollections();
        _createInitialPools();

        // Step 9: Set up governance
        console.log("\n🏛️ Configurando gobernanza...");
        _setupGovernance();

        console.log("\n🎉 ¡Despliegue completado exitosamente!");
        emit InitializationComplete();

        // Step 10: Save deployment addresses
        _saveDeploymentAddresses();
    }

    // ============ CONFIGURATION FUNCTIONS ============

    /**
     * @dev Configure all contracts with proper settings
     */
    function _configureContracts() internal {
        vm.startBroadcast();

        // Configure MetaversoCore
        console.log("Configurando MetaversoCore...");
        metaversoCore.addAuthorizedOperator(address(metaversoNFT));
        metaversoCore.addAuthorizedOperator(address(metaversoDeFi));
        metaversoCore.addAuthorizedOperator(address(metaversoGovernance));
        metaversoCore.updateFees(0.01 ether, 0.005 ether, 0.1 ether);
        metaversoCore.updateConfiguration(20, 1000, 10, 100);

        // Configure MetaversoToken
        console.log("Configurando MetaversoToken...");
        metaversoToken.addAuthorizedOperator(address(metaversoDeFi));
        metaversoToken.addAuthorizedOperator(address(metaversoGovernance));
        metaversoToken.updateRewardRate(1e15, 365 days); // 0.001 tokens per second
        metaversoToken.updateGovernanceParams(
            10000 * 10**18, // 10k tokens proposal threshold
            7 days, // 7 days voting period
            100000 * 10**18 // 100k tokens quorum
        );

        // Configure MetaversoNFT
        console.log("Configurando MetaversoNFT...");
        metaversoNFT.addAuthorizedMinter(address(metaversoCore));
        metaversoNFT.updateConfiguration(
            0.01 ether, // mint fee
            1e15, // staking reward rate
            7 days, // auction duration
            0.001 ether, // min auction price
            250, // 2.5% platform fee
            100 // max NFTs per user
        );

        // Configure MetaversoDeFi
        console.log("Configurando MetaversoDeFi...");
        metaversoDeFi.addAuthorizedOperator(address(metaversoCore));
        metaversoDeFi.updateConfiguration(
            30, // 0.3% flash loan fee
            30, // 0.3% liquidity fee
            1000000 * 10**18, // 1M max flash loan
            100 * 10**18, // 100 min stake
            1000000 * 10**18 // 1M max stake
        );

        // Configure MetaversoGovernance
        console.log("Configurando MetaversoGovernance...");
        metaversoGovernance.addCouncilMember(treasury);
        metaversoGovernance.addAuthorizedExecutor(address(metaversoCore));
        metaversoGovernance.updateSettings(
            MetaversoGovernance.GovernanceSettings({
                proposalThreshold: 10000 * 10**18, // 10k tokens
                votingPeriod: 7 days,
                quorumVotes: 100000 * 10**18, // 100k tokens
                executionDelay: 2 days,
                minVotingPower: 100 * 10**18, // 100 tokens
                maxVotingPower: 1000000 * 10**18, // 1M tokens
                allowDelegation: true,
                allowVoteChange: true,
                proposalCooldown: 1 days
            })
        );

        vm.stopBroadcast();

        emit ConfigurationSet("MetaversoCore", "Configured");
        emit ConfigurationSet("MetaversoToken", "Configured");
        emit ConfigurationSet("MetaversoNFT", "Configured");
        emit ConfigurationSet("MetaversoDeFi", "Configured");
        emit ConfigurationSet("MetaversoGovernance", "Configured");
    }

    /**
     * @dev Initialize token distribution
     */
    function _initializeTokenDistribution() internal {
        vm.startBroadcast();

        // Transfer tokens to treasury
        metaversoToken.transfer(treasury, TREASURY_ALLOCATION);
        console.log("✅ Treasury allocation:", TREASURY_ALLOCATION / 10**18, "tokens");

        // Create vesting for team (2 year vesting)
        metaversoToken.createVesting(deployer, TEAM_ALLOCATION, 2 * 365 days);
        console.log("✅ Team vesting created:", TEAM_ALLOCATION / 10**18, "tokens");

        // Create vesting for ecosystem (1 year vesting)
        metaversoToken.createVesting(treasury, ECOSYSTEM_ALLOCATION, 365 days);
        console.log("✅ Ecosystem vesting created:", ECOSYSTEM_ALLOCATION / 10**18, "tokens");

        // Community allocation remains with deployer for distribution
        console.log("✅ Community allocation:", COMMUNITY_ALLOCATION / 10**18, "tokens");

        vm.stopBroadcast();

        emit ConfigurationSet("Token Distribution", "Initialized");
    }

    /**
     * @dev Create initial NFT collections
     */
    function _createInitialCollections() internal {
        vm.startBroadcast();

        // Avatar Collection
        metaversoNFT.createCollection(
            "Metaverso Avatars",
            "Colección oficial de avatares del metaverso",
            "MAV",
            10000, // max supply
            0.01 ether, // mint price
            "ipfs://QmAvatarCollection/"
        );

        // Island Collection
        metaversoNFT.createCollection(
            "Metaverso Islands",
            "Colección oficial de islas del metaverso",
            "MIS",
            1000, // max supply
            0.1 ether, // mint price
            "ipfs://QmIslandCollection/"
        );

        // Equipment Collection
        metaversoNFT.createCollection(
            "Metaverso Equipment",
            "Colección oficial de equipamiento del metaverso",
            "MEQ",
            50000, // max supply
            0.005 ether, // mint price
            "ipfs://QmEquipmentCollection/"
        );

        vm.stopBroadcast();

        console.log("✅ Colecciones iniciales creadas");
        emit ConfigurationSet("Initial Collections", "Created");
    }

    /**
     * @dev Create initial DeFi pools
     */
    function _createInitialPools() internal {
        vm.startBroadcast();

        // META-ETH Staking Pool
        metaversoDeFi.createStakingPool(
            "META-ETH Staking Pool",
            "Pool de staking para tokens META y ETH",
            address(metaversoToken),
            2e15, // 0.002 tokens per second
            1000 * 10**18, // 1k min stake
            1000000 * 10**18, // 1M max stake
            30 days // 30 days lock period
        );

        // META-ETH Liquidity Pool
        metaversoDeFi.createLiquidityPool(
            "META-ETH LP",
            address(metaversoToken),
            wethAddress,
            30 // 0.3% fee
        );

        // META-USDC Liquidity Pool (if USDC address is available)
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0));
        if (usdcAddress != address(0)) {
            metaversoDeFi.createLiquidityPool(
                "META-USDC LP",
                address(metaversoToken),
                usdcAddress,
                30 // 0.3% fee
            );
        }

        // Yield Farm for META-ETH LP
        metaversoDeFi.createYieldFarm(
            "META-ETH Yield Farm",
            "Farm de yield para proveedores de liquidez META-ETH",
            address(metaversoToken), // staking token (LP token would be used in practice)
            address(metaversoToken), // reward token
            1e15, // 0.001 tokens per second
            365 days // 1 year duration
        );

        vm.stopBroadcast();

        console.log("✅ Pools iniciales creados");
        emit ConfigurationSet("Initial Pools", "Created");
    }

    /**
     * @dev Set up governance system
     */
    function _setupGovernance() internal {
        vm.startBroadcast();

        // Create initial governance proposal
        metaversoGovernance.createProposal(
            "Inicialización del Metaverso",
            "Propuesta inicial para establecer los parámetros base del metaverso descentralizado",
            "ipfs://QmInitialProposal/",
            MetaversoGovernance.ProposalType.POLICY_CHANGE
        );

        // Activate the proposal
        metaversoGovernance.activateProposal(1);

        vm.stopBroadcast();

        console.log("✅ Gobernanza inicial configurada");
        emit ConfigurationSet("Initial Governance", "Setup");
    }

    /**
     * @dev Save deployment addresses to file
     */
    function _saveDeploymentAddresses() internal {
        string memory deploymentInfo = string(abi.encodePacked(
            "// Metaverso Crypto World Virtual 3D - Deployment Addresses\n",
            "// Network: ", vm.toString(block.chainid), "\n",
            "// Deployer: ", vm.toString(deployer), "\n",
            "// Treasury: ", vm.toString(treasury), "\n",
            "// WETH: ", vm.toString(wethAddress), "\n\n",
            "export const DEPLOYMENT_ADDRESSES = {\n",
            "  METAVERSO_CORE: '", vm.toString(address(metaversoCore)), "',\n",
            "  METAVERSO_TOKEN: '", vm.toString(address(metaversoToken)), "',\n",
            "  METAVERSO_NFT: '", vm.toString(address(metaversoNFT)), "',\n",
            "  METAVERSO_DEFI: '", vm.toString(address(metaversoDeFi)), "',\n",
            "  METAVERSO_GOVERNANCE: '", vm.toString(address(metaversoGovernance)), "',\n",
            "  DEPLOYER: '", vm.toString(deployer), "',\n",
            "  TREASURY: '", vm.toString(treasury), "',\n",
            "  WETH: '", vm.toString(wethAddress), "'\n",
            "};\n\n",
            "export const TOKEN_ALLOCATION = {\n",
            "  TOTAL_SUPPLY: '", vm.toString(INITIAL_TOKEN_SUPPLY), "',\n",
            "  TREASURY: '", vm.toString(TREASURY_ALLOCATION), "',\n",
            "  COMMUNITY: '", vm.toString(COMMUNITY_ALLOCATION), "',\n",
            "  TEAM: '", vm.toString(TEAM_ALLOCATION), "',\n",
            "  ECOSYSTEM: '", vm.toString(ECOSYSTEM_ALLOCATION), "'\n",
            "};\n"
        ));

        vm.writeFile("deployment-addresses.js", deploymentInfo);
        console.log("✅ Direcciones de despliegue guardadas en deployment-addresses.js");
    }

    // ============ VERIFICATION FUNCTIONS ============

    /**
     * @dev Verify deployment
     */
    function verifyDeployment() external view {
        console.log("\n🔍 Verificando despliegue...");

        // Check contract addresses
        require(address(metaversoCore) != address(0), "MetaversoCore not deployed");
        require(address(metaversoToken) != address(0), "MetaversoToken not deployed");
        require(address(metaversoNFT) != address(0), "MetaversoNFT not deployed");
        require(address(metaversoDeFi) != address(0), "MetaversoDeFi not deployed");
        require(address(metaversoGovernance) != address(0), "MetaversoGovernance not deployed");

        // Check token supply
        uint256 totalSupply = metaversoToken.totalSupply();
        require(totalSupply == INITIAL_TOKEN_SUPPLY, "Incorrect token supply");

        // Check treasury balance
        uint256 treasuryBalance = metaversoToken.balanceOf(treasury);
        require(treasuryBalance >= TREASURY_ALLOCATION, "Incorrect treasury allocation");

        console.log("✅ Verificación completada exitosamente");
        console.log("Total Supply:", totalSupply / 10**18, "tokens");
        console.log("Treasury Balance:", treasuryBalance / 10**18, "tokens");
    }

    // ============ UTILITY FUNCTIONS ============

    /**
     * @dev Get deployment summary
     */
    function getDeploymentSummary() external view returns (
        address core,
        address token,
        address nft,
        address defi,
        address governance,
        uint256 totalSupply,
        uint256 treasuryBalance
    ) {
        return (
            address(metaversoCore),
            address(metaversoToken),
            address(metaversoNFT),
            address(metaversoDeFi),
            address(metaversoGovernance),
            metaversoToken.totalSupply(),
            metaversoToken.balanceOf(treasury)
        );
    }

    /**
     * @dev Emergency pause all contracts
     */
    function emergencyPause() external {
        require(msg.sender == deployer, "Only deployer can pause");
        
        vm.startBroadcast();
        
        metaversoCore.pause();
        metaversoToken.pause();
        metaversoNFT.pause();
        
        vm.stopBroadcast();
        
        console.log("🚨 Todos los contratos han sido pausados por emergencia");
    }

    /**
     * @dev Emergency unpause all contracts
     */
    function emergencyUnpause() external {
        require(msg.sender == deployer, "Only deployer can unpause");
        
        vm.startBroadcast();
        
        metaversoCore.unpause();
        metaversoToken.unpause();
        metaversoNFT.unpause();
        
        vm.stopBroadcast();
        
        console.log("✅ Todos los contratos han sido reactivados");
    }
} 