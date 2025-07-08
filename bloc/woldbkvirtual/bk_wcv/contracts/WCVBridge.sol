// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title WCVBridge
 * @dev Puente para conectar WCV local con Binance Smart Chain
 * @author WoldVirtual3D Team
 */
contract WCVBridge is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    // Constantes
    uint256 public constant MIN_BRIDGE_AMOUNT = 100 * 10**3; // 100 WCV mínimo
    uint256 public constant MAX_BRIDGE_AMOUNT = 1_000_000 * 10**3; // 1M WCV máximo
    uint256 public constant BRIDGE_FEE = 0.0001 ether; // Fee en ETH
    uint256 public constant BRIDGE_TIMEOUT = 24 hours; // Timeout para solicitudes

    // Variables de estado
    IERC20 public wcvToken;
    address public bscWCVContract; // Contrato WCV en BSC
    address public validator; // Dirección del validador
    uint256 public bridgeFee;
    uint256 public dailyBridgeLimit;
    uint256 public currentDailyBridgeAmount;
    uint256 public lastDailyReset;
    
    // Mappings
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(bytes32 => bool) public processedRequests;
    mapping(address => uint256) public userBridgeLimits;
    mapping(address => bool) public isExcludedFromLimits;
    
    // Contadores
    Counters.Counter private _requestIdCounter;
    
    // Estructuras
    struct BridgeRequest {
        uint256 requestId;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        BridgeDirection direction;
        BridgeStatus status;
        bytes32 requestHash;
    }
    
    enum BridgeDirection { WCV_TO_BSC, BSC_TO_WCV }
    enum BridgeStatus { PENDING, PROCESSED, CANCELLED, EXPIRED }
    
    // Eventos
    event BridgeRequestCreated(
        uint256 indexed requestId,
        address indexed from,
        address indexed to,
        uint256 amount,
        BridgeDirection direction,
        bytes32 requestHash
    );
    
    event BridgeRequestProcessed(
        uint256 indexed requestId,
        address indexed from,
        address indexed to,
        uint256 amount,
        BridgeDirection direction,
        BridgeStatus status
    );
    
    event BridgeFeeUpdated(uint256 oldFee, uint256 newFee);
    event DailyLimitUpdated(uint256 oldLimit, uint256 newLimit);
    event ValidatorUpdated(address oldValidator, address newValidator);
    event BSCContractUpdated(address oldContract, address newContract);
    event UserLimitUpdated(address indexed user, uint256 oldLimit, uint256 newLimit);
    
    // Modificadores
    modifier onlyValidator() {
        require(msg.sender == validator || msg.sender == owner(), "Bridge: Solo validador autorizado");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount >= MIN_BRIDGE_AMOUNT, "Bridge: Cantidad mínima no alcanzada");
        require(amount <= MAX_BRIDGE_AMOUNT, "Bridge: Cantidad máxima excedida");
        _;
    }
    
    modifier withinDailyLimit(uint256 amount) {
        if (!isExcludedFromLimits[msg.sender]) {
            require(currentDailyBridgeAmount + amount <= dailyBridgeLimit, "Bridge: Límite diario excedido");
        }
        _;
    }
    
    modifier withinUserLimit(address user, uint256 amount) {
        if (!isExcludedFromLimits[user]) {
            require(userBridgeLimits[user] >= amount, "Bridge: Límite de usuario excedido");
        }
        _;
    }

    /**
     * @dev Constructor del puente
     * @param _wcvToken Dirección del token WCV local
     * @param _bscWCVContract Dirección del contrato WCV en BSC
     * @param _validator Dirección del validador
     * @param initialOwner Propietario inicial
     */
    constructor(
        address _wcvToken,
        address _bscWCVContract,
        address _validator,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_wcvToken != address(0), "Bridge: Token WCV inválido");
        require(_bscWCVContract != address(0), "Bridge: Contrato BSC inválido");
        require(_validator != address(0), "Bridge: Validador inválido");
        
        wcvToken = IERC20(_wcvToken);
        bscWCVContract = _bscWCVContract;
        validator = _validator;
        bridgeFee = BRIDGE_FEE;
        dailyBridgeLimit = 10_000_000 * 10**3; // 10M WCV diario
        lastDailyReset = block.timestamp;
        
        // Excluir al contrato de límites
        isExcludedFromLimits[address(this)] = true;
        isExcludedFromLimits[initialOwner] = true;
    }

    /**
     * @dev Crear solicitud de bridge WCV → BSC
     * @param to Dirección de destino en BSC
     * @param amount Cantidad de WCV a transferir
     */
    function bridgeToBSC(address to, uint256 amount) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validAmount(amount)
        withinDailyLimit(amount)
        withinUserLimit(msg.sender, amount)
    {
        require(msg.value >= bridgeFee, "Bridge: Fee insuficiente");
        require(to != address(0), "Bridge: Destinatario inválido");
        require(wcvToken.balanceOf(msg.sender) >= amount, "Bridge: Saldo insuficiente");
        
        // Crear solicitud
        _requestIdCounter.increment();
        uint256 requestId = _requestIdCounter.current();
        
        bytes32 requestHash = keccak256(abi.encodePacked(
            requestId,
            msg.sender,
            to,
            amount,
            BridgeDirection.WCV_TO_BSC,
            block.chainid
        ));
        
        BridgeRequest memory request = BridgeRequest({
            requestId: requestId,
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            direction: BridgeDirection.WCV_TO_BSC,
            status: BridgeStatus.PENDING,
            requestHash: requestHash
        });
        
        bridgeRequests[requestHash] = request;
        processedRequests[requestHash] = false;
        
        // Transferir tokens al contrato
        wcvToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Actualizar límites
        currentDailyBridgeAmount += amount;
        if (!isExcludedFromLimits[msg.sender]) {
            userBridgeLimits[msg.sender] -= amount;
        }
        
        emit BridgeRequestCreated(requestId, msg.sender, to, amount, BridgeDirection.WCV_TO_BSC, requestHash);
    }

    /**
     * @dev Procesar solicitud de bridge (solo validador)
     * @param requestHash Hash de la solicitud
     * @param signature Firma del validador
     */
    function processBridgeRequest(bytes32 requestHash, bytes memory signature) 
        external 
        onlyValidator 
        nonReentrant 
        whenNotPaused 
    {
        require(!processedRequests[requestHash], "Bridge: Solicitud ya procesada");
        
        BridgeRequest storage request = bridgeRequests[requestHash];
        require(request.status == BridgeStatus.PENDING, "Bridge: Estado inválido");
        require(block.timestamp <= request.timestamp + BRIDGE_TIMEOUT, "Bridge: Solicitud expirada");
        
        // Verificar firma
        bytes32 messageHash = keccak256(abi.encodePacked(
            "ProcessBridgeRequest",
            requestHash,
            request.requestId,
            request.from,
            request.to,
            request.amount,
            request.direction
        ));
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == validator, "Bridge: Firma inválida");
        
        // Procesar según dirección
        if (request.direction == BridgeDirection.WCV_TO_BSC) {
            // Liberar tokens en WCV local (simular llegada desde BSC)
            wcvToken.safeTransfer(request.to, request.amount);
            request.status = BridgeStatus.PROCESSED;
        } else {
            // Quemar tokens en WCV local (simular envío a BSC)
            wcvToken.safeTransfer(request.to, request.amount);
            request.status = BridgeStatus.PROCESSED;
        }
        
        processedRequests[requestHash] = true;
        
        emit BridgeRequestProcessed(
            request.requestId,
            request.from,
            request.to,
            request.amount,
            request.direction,
            request.status
        );
    }

    /**
     * @dev Crear solicitud de bridge BSC → WCV (solo validador)
     * @param from Dirección de origen en BSC
     * @param to Dirección de destino en WCV local
     * @param amount Cantidad de WCV
     * @param bscTxHash Hash de la transacción en BSC
     */
    function createBSCToWCVRequest(
        address from,
        address to,
        uint256 amount,
        bytes32 bscTxHash
    ) 
        external 
        onlyValidator 
        nonReentrant 
        whenNotPaused 
        validAmount(amount)
        withinDailyLimit(amount)
    {
        require(from != address(0), "Bridge: Remitente inválido");
        require(to != address(0), "Bridge: Destinatario inválido");
        require(wcvToken.balanceOf(address(this)) >= amount, "Bridge: Saldo insuficiente en contrato");
        
        _requestIdCounter.increment();
        uint256 requestId = _requestIdCounter.current();
        
        bytes32 requestHash = keccak256(abi.encodePacked(
            requestId,
            from,
            to,
            amount,
            BridgeDirection.BSC_TO_WCV,
            bscTxHash,
            block.chainid
        ));
        
        BridgeRequest memory request = BridgeRequest({
            requestId: requestId,
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            direction: BridgeDirection.BSC_TO_WCV,
            status: BridgeStatus.PROCESSED, // Procesado inmediatamente
            requestHash: requestHash
        });
        
        bridgeRequests[requestHash] = request;
        processedRequests[requestHash] = true;
        
        // Transferir tokens inmediatamente
        wcvToken.safeTransfer(to, amount);
        currentDailyBridgeAmount += amount;
        
        emit BridgeRequestCreated(requestId, from, to, amount, BridgeDirection.BSC_TO_WCV, requestHash);
        emit BridgeRequestProcessed(requestId, from, to, amount, BridgeDirection.BSC_TO_WCV, BridgeStatus.PROCESSED);
    }

    /**
     * @dev Cancelar solicitud de bridge (solo propietario)
     * @param requestHash Hash de la solicitud
     */
    function cancelBridgeRequest(bytes32 requestHash) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(!processedRequests[requestHash], "Bridge: Solicitud ya procesada");
        
        BridgeRequest storage request = bridgeRequests[requestHash];
        require(request.status == BridgeStatus.PENDING, "Bridge: Estado inválido");
        
        request.status = BridgeStatus.CANCELLED;
        processedRequests[requestHash] = true;
        
        // Devolver tokens si es WCV_TO_BSC
        if (request.direction == BridgeDirection.WCV_TO_BSC) {
            wcvToken.safeTransfer(request.from, request.amount);
            currentDailyBridgeAmount -= request.amount;
            if (!isExcludedFromLimits[request.from]) {
                userBridgeLimits[request.from] += request.amount;
            }
        }
        
        emit BridgeRequestProcessed(
            request.requestId,
            request.from,
            request.to,
            request.amount,
            request.direction,
            BridgeStatus.CANCELLED
        );
    }

    /**
     * @dev Resetear límite diario
     */
    function resetDailyLimit() external {
        require(block.timestamp >= lastDailyReset + 1 days, "Bridge: Aún no es tiempo de reset");
        currentDailyBridgeAmount = 0;
        lastDailyReset = block.timestamp;
    }

    // Funciones administrativas

    /**
     * @dev Pausar el puente
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Reanudar el puente
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Actualizar fee del bridge
     * @param newFee Nuevo fee en wei
     */
    function setBridgeFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = bridgeFee;
        bridgeFee = newFee;
        emit BridgeFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Actualizar límite diario
     * @param newLimit Nuevo límite diario
     */
    function setDailyBridgeLimit(uint256 newLimit) external onlyOwner {
        uint256 oldLimit = dailyBridgeLimit;
        dailyBridgeLimit = newLimit;
        emit DailyLimitUpdated(oldLimit, newLimit);
    }

    /**
     * @dev Actualizar validador
     * @param newValidator Nueva dirección del validador
     */
    function setValidator(address newValidator) external onlyOwner {
        require(newValidator != address(0), "Bridge: Validador inválido");
        address oldValidator = validator;
        validator = newValidator;
        emit ValidatorUpdated(oldValidator, newValidator);
    }

    /**
     * @dev Actualizar contrato BSC
     * @param newContract Nueva dirección del contrato BSC
     */
    function setBSCContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Bridge: Contrato inválido");
        address oldContract = bscWCVContract;
        bscWCVContract = newContract;
        emit BSCContractUpdated(oldContract, newContract);
    }

    /**
     * @dev Establecer límite de usuario
     * @param user Dirección del usuario
     * @param limit Nuevo límite
     */
    function setUserBridgeLimit(address user, uint256 limit) external onlyOwner {
        uint256 oldLimit = userBridgeLimits[user];
        userBridgeLimits[user] = limit;
        emit UserLimitUpdated(user, oldLimit, limit);
    }

    /**
     * @dev Excluir/incluir usuario de límites
     * @param user Dirección del usuario
     * @param excluded Estado de exclusión
     */
    function setExcludedFromLimits(address user, bool excluded) external onlyOwner {
        isExcludedFromLimits[user] = excluded;
    }

    /**
     * @dev Retirar ETH acumulado por fees
     * @param to Dirección de destino
     */
    function withdrawFees(address to) external onlyOwner {
        require(to != address(0), "Bridge: Dirección inválida");
        uint256 balance = address(this).balance;
        require(balance > 0, "Bridge: Sin balance para retirar");
        
        (bool success, ) = to.call{value: balance}("");
        require(success, "Bridge: Transferencia fallida");
    }

    /**
     * @dev Retirar tokens WCV del contrato
     * @param to Dirección de destino
     * @param amount Cantidad a retirar
     */
    function withdrawWCV(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Bridge: Dirección inválida");
        require(amount > 0, "Bridge: Cantidad debe ser mayor a 0");
        require(wcvToken.balanceOf(address(this)) >= amount, "Bridge: Saldo insuficiente");
        
        wcvToken.safeTransfer(to, amount);
    }

    // Funciones de consulta

    /**
     * @dev Obtener información de una solicitud
     * @param requestHash Hash de la solicitud
     */
    function getBridgeRequest(bytes32 requestHash) external view returns (
        uint256 requestId,
        address from,
        address to,
        uint256 amount,
        uint256 timestamp,
        BridgeDirection direction,
        BridgeStatus status
    ) {
        BridgeRequest memory request = bridgeRequests[requestHash];
        return (
            request.requestId,
            request.from,
            request.to,
            request.amount,
            request.timestamp,
            request.direction,
            request.status
        );
    }

    /**
     * @dev Verificar si una solicitud está procesada
     * @param requestHash Hash de la solicitud
     */
    function isRequestProcessed(bytes32 requestHash) external view returns (bool) {
        return processedRequests[requestHash];
    }

    /**
     * @dev Obtener estadísticas del bridge
     */
    function getBridgeStats() external view returns (
        uint256 totalRequests,
        uint256 currentDailyAmount,
        uint256 dailyLimit,
        uint256 bridgeFeeValue,
        uint256 lastReset
    ) {
        return (
            _requestIdCounter.current(),
            currentDailyBridgeAmount,
            dailyBridgeLimit,
            bridgeFee,
            lastDailyReset
        );
    }

    /**
     * @dev Obtener límite de usuario
     * @param user Dirección del usuario
     */
    function getUserBridgeLimit(address user) external view returns (uint256) {
        return userBridgeLimits[user];
    }

    /**
     * @dev Verificar si usuario está excluido de límites
     * @param user Dirección del usuario
     */
    function isUserExcludedFromLimits(address user) external view returns (bool) {
        return isExcludedFromLimits[user];
    }
} 