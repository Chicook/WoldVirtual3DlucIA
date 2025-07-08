// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./GasFeeManager.sol";
import "./BSWCV.sol";

/**
 * @title WCVGasProxy
 * @dev Proxy que integra el sistema de gas abstraction con el metaverso WoldVirtual3D
 * @author WoldVirtual3D Team
 */
contract WCVGasProxy is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    // Eventos
    event MetaverseAction(
        address indexed user,
        string action,
        string network,
        uint256 fee,
        bytes32 assetId,
        bytes32 transactionId
    );
    
    event AssetPublished(
        address indexed user,
        string assetType,
        string network,
        uint256 fee,
        bytes32 assetId,
        string metadata
    );
    
    event WorldCreated(
        address indexed user,
        string network,
        uint256 fee,
        bytes32 worldId,
        string worldName
    );
    
    event AvatarCreated(
        address indexed user,
        string network,
        uint256 fee,
        bytes32 avatarId,
        string avatarName
    );

    // Estructuras
    struct MetaverseAction {
        address user;
        string action;
        string network;
        uint256 fee;
        bytes32 assetId;
        bytes32 transactionId;
        uint256 timestamp;
        bool processed;
        string metadata;
    }

    struct Asset {
        bytes32 id;
        address owner;
        string assetType;
        string network;
        uint256 fee;
        uint256 timestamp;
        string metadata;
        bool active;
    }

    struct World {
        bytes32 id;
        address creator;
        string name;
        string network;
        uint256 fee;
        uint256 timestamp;
        bool active;
        uint256 maxPlayers;
        string description;
    }

    struct Avatar {
        bytes32 id;
        address owner;
        string name;
        string network;
        uint256 fee;
        uint256 timestamp;
        bool active;
        string appearance;
    }

    // Variables de estado
    GasFeeManager public gasFeeManager;
    BSWCV public bswcv;
    
    mapping(bytes32 => MetaverseAction) public metaverseActions;
    mapping(bytes32 => Asset) public assets;
    mapping(bytes32 => World) public worlds;
    mapping(bytes32 => Avatar) public avatars;
    mapping(address => bytes32[]) public userAssets;
    mapping(address => bytes32[]) public userWorlds;
    mapping(address => bytes32[]) public userAvatars;
    
    uint256 public totalActions;
    uint256 public totalAssets;
    uint256 public totalWorlds;
    uint256 public totalAvatars;

    // Configuración
    mapping(string => uint256) public actionFees;
    mapping(string => bool) public allowedActions;
    
    uint256 public constant MIN_FEE = 1; // 0.001 WCV
    uint256 public constant MAX_FEE = 1000000; // 1000 WCV

    // Constructor
    constructor(address _gasFeeManager, address _bswcv) {
        require(_gasFeeManager != address(0), "Invalid gas fee manager address");
        require(_bswcv != address(0), "Invalid BSWCV address");
        
        gasFeeManager = GasFeeManager(_gasFeeManager);
        bswcv = BSWCV(_bswcv);
        
        // Configurar acciones permitidas y fees
        _setupActions();
    }

    /**
     * @dev Publicar isla en el metaverso
     */
    function publishIsland(
        string memory networkName,
        string memory islandName,
        string memory metadata,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bytes32) {
        require(bytes(islandName).length > 0, "Island name cannot be empty");
        require(allowedActions["publish_island"], "Action not allowed");
        
        uint256 fee = actionFees["publish_island"];
        bytes32 assetId = _generateAssetId(msg.sender, "island", islandName);
        
        // Procesar pago de gas fee
        bool paymentSuccess = gasFeeManager.payGasFee("publish_island", networkName, transactionId);
        require(paymentSuccess, "Gas fee payment failed");
        
        // Crear asset
        Asset memory newAsset = Asset({
            id: assetId,
            owner: msg.sender,
            assetType: "island",
            network: networkName,
            fee: fee,
            timestamp: block.timestamp,
            metadata: metadata,
            active: true
        });
        
        assets[assetId] = newAsset;
        userAssets[msg.sender].push(assetId);
        totalAssets = totalAssets.add(1);
        
        // Registrar acción
        _recordAction(msg.sender, "publish_island", networkName, fee, assetId, transactionId);
        
        emit AssetPublished(msg.sender, "island", networkName, fee, assetId, metadata);
        
        return assetId;
    }

    /**
     * @dev Publicar casa en el metaverso
     */
    function publishHouse(
        string memory networkName,
        string memory houseName,
        string memory metadata,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bytes32) {
        require(bytes(houseName).length > 0, "House name cannot be empty");
        require(allowedActions["publish_house"], "Action not allowed");
        
        uint256 fee = actionFees["publish_house"];
        bytes32 assetId = _generateAssetId(msg.sender, "house", houseName);
        
        // Procesar pago de gas fee
        bool paymentSuccess = gasFeeManager.payGasFee("publish_house", networkName, transactionId);
        require(paymentSuccess, "Gas fee payment failed");
        
        // Crear asset
        Asset memory newAsset = Asset({
            id: assetId,
            owner: msg.sender,
            assetType: "house",
            network: networkName,
            fee: fee,
            timestamp: block.timestamp,
            metadata: metadata,
            active: true
        });
        
        assets[assetId] = newAsset;
        userAssets[msg.sender].push(assetId);
        totalAssets = totalAssets.add(1);
        
        // Registrar acción
        _recordAction(msg.sender, "publish_house", networkName, fee, assetId, transactionId);
        
        emit AssetPublished(msg.sender, "house", networkName, fee, assetId, metadata);
        
        return assetId;
    }

    /**
     * @dev Crear mundo en el metaverso
     */
    function createWorld(
        string memory networkName,
        string memory worldName,
        string memory description,
        uint256 maxPlayers,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bytes32) {
        require(bytes(worldName).length > 0, "World name cannot be empty");
        require(allowedActions["create_world"], "Action not allowed");
        require(maxPlayers > 0, "Max players must be greater than 0");
        
        uint256 fee = actionFees["create_world"];
        bytes32 worldId = _generateWorldId(msg.sender, worldName);
        
        // Procesar pago de gas fee
        bool paymentSuccess = gasFeeManager.payGasFee("create_world", networkName, transactionId);
        require(paymentSuccess, "Gas fee payment failed");
        
        // Crear mundo
        World memory newWorld = World({
            id: worldId,
            creator: msg.sender,
            name: worldName,
            network: networkName,
            fee: fee,
            timestamp: block.timestamp,
            active: true,
            maxPlayers: maxPlayers,
            description: description
        });
        
        worlds[worldId] = newWorld;
        userWorlds[msg.sender].push(worldId);
        totalWorlds = totalWorlds.add(1);
        
        // Registrar acción
        _recordAction(msg.sender, "create_world", networkName, fee, worldId, transactionId);
        
        emit WorldCreated(msg.sender, networkName, fee, worldId, worldName);
        
        return worldId;
    }

    /**
     * @dev Crear avatar
     */
    function createAvatar(
        string memory networkName,
        string memory avatarName,
        string memory appearance,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bytes32) {
        require(bytes(avatarName).length > 0, "Avatar name cannot be empty");
        require(allowedActions["create_avatar"], "Action not allowed");
        
        uint256 fee = actionFees["create_avatar"];
        bytes32 avatarId = _generateAvatarId(msg.sender, avatarName);
        
        // Procesar pago de gas fee
        bool paymentSuccess = gasFeeManager.payGasFee("create_avatar", networkName, transactionId);
        require(paymentSuccess, "Gas fee payment failed");
        
        // Crear avatar
        Avatar memory newAvatar = Avatar({
            id: avatarId,
            owner: msg.sender,
            name: avatarName,
            network: networkName,
            fee: fee,
            timestamp: block.timestamp,
            active: true,
            appearance: appearance
        });
        
        avatars[avatarId] = newAvatar;
        userAvatars[msg.sender].push(avatarId);
        totalAvatars = totalAvatars.add(1);
        
        // Registrar acción
        _recordAction(msg.sender, "create_avatar", networkName, fee, avatarId, transactionId);
        
        emit AvatarCreated(msg.sender, networkName, fee, avatarId, avatarName);
        
        return avatarId;
    }

    /**
     * @dev Unirse al metaverso
     */
    function joinMetaverse(
        string memory networkName,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bool) {
        require(allowedActions["join_metaverse"], "Action not allowed");
        
        uint256 fee = actionFees["join_metaverse"];
        
        // Procesar pago de gas fee
        bool paymentSuccess = gasFeeManager.payGasFee("join_metaverse", networkName, transactionId);
        require(paymentSuccess, "Gas fee payment failed");
        
        // Registrar acción
        _recordAction(msg.sender, "join_metaverse", networkName, fee, bytes32(0), transactionId);
        
        return true;
    }

    /**
     * @dev Transferir asset
     */
    function transferAsset(
        bytes32 assetId,
        address to,
        string memory networkName,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bool) {
        require(assets[assetId].owner == msg.sender, "Not asset owner");
        require(to != address(0), "Invalid recipient");
        require(allowedActions["transfer_asset"], "Action not allowed");
        
        uint256 fee = actionFees["transfer_asset"];
        
        // Procesar pago de gas fee
        bool paymentSuccess = gasFeeManager.payGasFee("transfer_asset", networkName, transactionId);
        require(paymentSuccess, "Gas fee payment failed");
        
        // Transferir asset
        assets[assetId].owner = to;
        
        // Actualizar arrays de usuarios
        _removeFromUserAssets(msg.sender, assetId);
        userAssets[to].push(assetId);
        
        // Registrar acción
        _recordAction(msg.sender, "transfer_asset", networkName, fee, assetId, transactionId);
        
        return true;
    }

    /**
     * @dev Obtener información de un asset
     */
    function getAssetInfo(bytes32 assetId) public view returns (
        address owner,
        string memory assetType,
        string memory network,
        uint256 fee,
        uint256 timestamp,
        string memory metadata,
        bool active
    ) {
        Asset memory asset = assets[assetId];
        return (
            asset.owner,
            asset.assetType,
            asset.network,
            asset.fee,
            asset.timestamp,
            asset.metadata,
            asset.active
        );
    }

    /**
     * @dev Obtener información de un mundo
     */
    function getWorldInfo(bytes32 worldId) public view returns (
        address creator,
        string memory name,
        string memory network,
        uint256 fee,
        uint256 timestamp,
        bool active,
        uint256 maxPlayers,
        string memory description
    ) {
        World memory world = worlds[worldId];
        return (
            world.creator,
            world.name,
            world.network,
            world.fee,
            world.timestamp,
            world.active,
            world.maxPlayers,
            world.description
        );
    }

    /**
     * @dev Obtener información de un avatar
     */
    function getAvatarInfo(bytes32 avatarId) public view returns (
        address owner,
        string memory name,
        string memory network,
        uint256 fee,
        uint256 timestamp,
        bool active,
        string memory appearance
    ) {
        Avatar memory avatar = avatars[avatarId];
        return (
            avatar.owner,
            avatar.name,
            avatar.network,
            avatar.fee,
            avatar.timestamp,
            avatar.active,
            avatar.appearance
        );
    }

    /**
     * @dev Obtener assets de un usuario
     */
    function getUserAssets(address user) public view returns (bytes32[] memory) {
        return userAssets[user];
    }

    /**
     * @dev Obtener mundos de un usuario
     */
    function getUserWorlds(address user) public view returns (bytes32[] memory) {
        return userWorlds[user];
    }

    /**
     * @dev Obtener avatares de un usuario
     */
    function getUserAvatars(address user) public view returns (bytes32[] memory) {
        return userAvatars[user];
    }

    /**
     * @dev Obtener estadísticas del contrato
     */
    function getContractStats() public view returns (
        uint256 totalActions_,
        uint256 totalAssets_,
        uint256 totalWorlds_,
        uint256 totalAvatars_
    ) {
        return (
            totalActions,
            totalAssets,
            totalWorlds,
            totalAvatars
        );
    }

    /**
     * @dev Configurar acción (solo owner)
     */
    function setAction(
        string memory actionName,
        uint256 fee,
        bool allowed
    ) public onlyOwner {
        require(bytes(actionName).length > 0, "Action name cannot be empty");
        require(fee >= MIN_FEE, "Fee too low");
        require(fee <= MAX_FEE, "Fee too high");
        
        actionFees[actionName] = fee;
        allowedActions[actionName] = allowed;
    }

    /**
     * @dev Configurar gas fee manager (solo owner)
     */
    function setGasFeeManager(address _gasFeeManager) public onlyOwner {
        require(_gasFeeManager != address(0), "Invalid gas fee manager address");
        gasFeeManager = GasFeeManager(_gasFeeManager);
    }

    /**
     * @dev Generar ID de asset
     */
    function _generateAssetId(
        address owner,
        string memory assetType,
        string memory name
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            owner,
            assetType,
            name,
            block.timestamp,
            block.number
        ));
    }

    /**
     * @dev Generar ID de mundo
     */
    function _generateWorldId(
        address creator,
        string memory worldName
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            creator,
            worldName,
            block.timestamp,
            block.number
        ));
    }

    /**
     * @dev Generar ID de avatar
     */
    function _generateAvatarId(
        address owner,
        string memory avatarName
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            owner,
            avatarName,
            block.timestamp,
            block.number
        ));
    }

    /**
     * @dev Registrar acción
     */
    function _recordAction(
        address user,
        string memory action,
        string memory network,
        uint256 fee,
        bytes32 assetId,
        bytes32 transactionId
    ) internal {
        MetaverseAction memory newAction = MetaverseAction({
            user: user,
            action: action,
            network: network,
            fee: fee,
            assetId: assetId,
            transactionId: transactionId,
            timestamp: block.timestamp,
            processed: true,
            metadata: ""
        });
        
        metaverseActions[transactionId] = newAction;
        totalActions = totalActions.add(1);
        
        emit MetaverseAction(user, action, network, fee, assetId, transactionId);
    }

    /**
     * @dev Remover asset de la lista de usuario
     */
    function _removeFromUserAssets(address user, bytes32 assetId) internal {
        bytes32[] storage userAssetList = userAssets[user];
        for (uint256 i = 0; i < userAssetList.length; i++) {
            if (userAssetList[i] == assetId) {
                userAssetList[i] = userAssetList[userAssetList.length - 1];
                userAssetList.pop();
                break;
            }
        }
    }

    /**
     * @dev Configurar acciones por defecto
     */
    function _setupActions() internal {
        actionFees["publish_island"] = 1; // 0.001 WCV
        actionFees["publish_house"] = 1; // 0.001 WCV
        actionFees["publish_asset"] = 5; // 0.005 WCV
        actionFees["transfer_asset"] = 2; // 0.002 WCV
        actionFees["mint_nft"] = 10; // 0.01 WCV
        actionFees["create_avatar"] = 5; // 0.005 WCV
        actionFees["join_metaverse"] = 1; // 0.001 WCV
        actionFees["create_world"] = 50; // 0.05 WCV
        actionFees["deploy_smart_contract"] = 100; // 0.1 WCV
        
        allowedActions["publish_island"] = true;
        allowedActions["publish_house"] = true;
        allowedActions["publish_asset"] = true;
        allowedActions["transfer_asset"] = true;
        allowedActions["mint_nft"] = true;
        allowedActions["create_avatar"] = true;
        allowedActions["join_metaverse"] = true;
        allowedActions["create_world"] = true;
        allowedActions["deploy_smart_contract"] = true;
    }

    /**
     * @dev Pausar contrato (solo owner)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Reanudar contrato (solo owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }
} 