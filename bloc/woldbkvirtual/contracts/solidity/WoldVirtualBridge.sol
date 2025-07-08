// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./WCVToken.sol";

/**
 * @title WoldVirtual Bridge
 * @dev Puente entre Binance Smart Chain y WoldVirtual3D Blockchain
 * @author WoldVirtual3D Team
 */
contract WoldVirtualBridge is ReentrancyGuard, Ownable, Pausable {
    using ECDSA for bytes32;

    // Eventos
    event TransferInitiated(
        bytes32 indexed transferId,
        address indexed from,
        address indexed to,
        uint256 amount,
        string sourceChain,
        string targetChain,
        uint256 fee
    );
    
    event TransferCompleted(
        bytes32 indexed transferId,
        address indexed to,
        uint256 amount,
        string sourceChain
    );
    
    event TransferCancelled(
        bytes32 indexed transferId,
        address indexed from,
        uint256 amount,
        string reason
    );

    // Estructuras
    struct Transfer {
        bytes32 id;
        address from;
        address to;
        uint256 amount;
        string sourceChain;
        string targetChain;
        TransferStatus status;
        uint256 timestamp;
        bytes32 transactionHash;
        bytes32 confirmationHash;
        uint256 fee;
    }

    enum TransferStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    // Variables de estado
    WCVToken public wcvToken;
    
    mapping(bytes32 => Transfer) public transfers;
    mapping(address => bytes32[]) public userTransfers;
    mapping(bytes32 => bool) public processedTransfers;
    
    uint256 public totalTransfers;
    uint256 public totalVolume;
    
    // Configuración
    uint256 public minTransferAmount = 1_000; // 1 WCV
    uint256 public maxTransferAmount = 1_000_000_000; // 1B WCV
    uint256 public dailyLimit = 10_000_000_000; // 10B WCV
    uint256 public transferFee = 100; // 0.1 WCV
    
    uint256 public bscConfirmationBlocks = 15;
    uint256 public woldvirtualConfirmationBlocks = 5;
    
    // Límites diarios
    mapping(uint256 => uint256) public dailyTransfers; // day => amount
    mapping(address => uint256) public userDailyTransfers;
    mapping(address => uint256) public userLastTransferDay;
    
    // Validadores
    mapping(address => bool) public validators;
    uint256 public minValidators = 3;
    
    // Timeouts
    uint256 public transferTimeout = 1 hours;
    
    // Constructor
    constructor(address _wcvToken) {
        require(_wcvToken != address(0), "Invalid WCV token address");
        wcvToken = WCVToken(_wcvToken);
        
        // Configurar owner como validador inicial
        validators[msg.sender] = true;
    }

    /**
     * @dev Transferir desde BSC a WoldVirtual3D
     */
    function transferFromBSC(
        address to,
        uint256 amount
    ) public nonReentrant whenNotPaused returns (bytes32) {
        require(to != address(0), "Invalid recipient address");
        require(amount >= minTransferAmount, "Amount below minimum");
        require(amount <= maxTransferAmount, "Amount above maximum");
        require(_checkDailyLimit(amount), "Daily limit exceeded");
        require(_checkUserDailyLimit(msg.sender, amount), "User daily limit exceeded");
        
        // Quemar tokens en BSC
        wcvToken.burn(msg.sender, amount + transferFee, "Bridge transfer to WoldVirtual3D");
        
        // Crear transferencia
        bytes32 transferId = _generateTransferId(msg.sender, to, amount, "BSC");
        
        Transfer memory newTransfer = Transfer({
            id: transferId,
            from: msg.sender,
            to: to,
            amount: amount,
            sourceChain: "BSC",
            targetChain: "WOLDVIRTUAL",
            status: TransferStatus.PENDING,
            timestamp: block.timestamp,
            transactionHash: bytes32(uint256(uint160(msg.sender))),
            confirmationHash: bytes32(0),
            fee: transferFee
        });
        
        transfers[transferId] = newTransfer;
        userTransfers[msg.sender].push(transferId);
        userTransfers[to].push(transferId);
        
        totalTransfers++;
        _updateDailyLimits(amount);
        
        emit TransferInitiated(
            transferId,
            msg.sender,
            to,
            amount,
            "BSC",
            "WOLDVIRTUAL",
            transferFee
        );
        
        return transferId;
    }

    /**
     * @dev Transferir desde WoldVirtual3D a BSC
     */
    function transferToBSC(
        address to,
        uint256 amount
    ) public nonReentrant whenNotPaused returns (bytes32) {
        require(to != address(0), "Invalid recipient address");
        require(amount >= minTransferAmount, "Amount below minimum");
        require(amount <= maxTransferAmount, "Amount above maximum");
        require(_checkDailyLimit(amount), "Daily limit exceeded");
        require(_checkUserDailyLimit(msg.sender, amount), "User daily limit exceeded");
        require(wcvToken.balanceOf(msg.sender) >= amount + transferFee, "Insufficient balance");
        
        // Quemar tokens en WoldVirtual3D
        wcvToken.burn(msg.sender, amount + transferFee, "Bridge transfer to BSC");
        
        // Crear transferencia
        bytes32 transferId = _generateTransferId(msg.sender, to, amount, "WOLDVIRTUAL");
        
        Transfer memory newTransfer = Transfer({
            id: transferId,
            from: msg.sender,
            to: to,
            amount: amount,
            sourceChain: "WOLDVIRTUAL",
            targetChain: "BSC",
            status: TransferStatus.PENDING,
            timestamp: block.timestamp,
            transactionHash: bytes32(uint256(uint160(msg.sender))),
            confirmationHash: bytes32(0),
            fee: transferFee
        });
        
        transfers[transferId] = newTransfer;
        userTransfers[msg.sender].push(transferId);
        userTransfers[to].push(transferId);
        
        totalTransfers++;
        _updateDailyLimits(amount);
        
        emit TransferInitiated(
            transferId,
            msg.sender,
            to,
            amount,
            "WOLDVIRTUAL",
            "BSC",
            transferFee
        );
        
        return transferId;
    }

    /**
     * @dev Confirmar transferencia desde BSC (solo validadores)
     */
    function confirmTransferFromBSC(
        bytes32 transferId,
        bytes32 confirmationHash,
        bytes[] memory signatures
    ) public nonReentrant whenNotPaused {
        require(validators[msg.sender], "Not authorized validator");
        require(_validateSignatures(transferId, confirmationHash, signatures), "Invalid signatures");
        
        Transfer storage transfer = transfers[transferId];
        require(transfer.status == TransferStatus.PENDING, "Transfer not pending");
        require(transfer.sourceChain == "BSC", "Not a BSC transfer");
        require(!processedTransfers[transferId], "Transfer already processed");
        
        transfer.status = TransferStatus.PROCESSING;
        transfer.confirmationHash = confirmationHash;
        
        // Acuñar tokens en WoldVirtual3D
        wcvToken.mint(transfer.to, transfer.amount, "Bridge transfer from BSC");
        
        transfer.status = TransferStatus.COMPLETED;
        processedTransfers[transferId] = true;
        totalVolume += transfer.amount;
        
        emit TransferCompleted(
            transferId,
            transfer.to,
            transfer.amount,
            "BSC"
        );
    }

    /**
     * @dev Cancelar transferencia (solo owner o después de timeout)
     */
    function cancelTransfer(bytes32 transferId, string memory reason) public {
        Transfer storage transfer = transfers[transferId];
        require(transfer.status == TransferStatus.PENDING, "Transfer not pending");
        require(
            msg.sender == owner() || 
            block.timestamp > transfer.timestamp + transferTimeout,
            "Not authorized to cancel"
        );
        
        transfer.status = TransferStatus.CANCELLED;
        
        // Reembolsar tokens si es transferencia desde WoldVirtual3D
        if (transfer.sourceChain == "WOLDVIRTUAL") {
            wcvToken.mint(transfer.from, transfer.amount + transfer.fee, "Transfer cancelled");
        }
        
        emit TransferCancelled(transferId, transfer.from, transfer.amount, reason);
    }

    /**
     * @dev Obtener transferencia por ID
     */
    function getTransfer(bytes32 transferId) public view returns (
        address from,
        address to,
        uint256 amount,
        string memory sourceChain,
        string memory targetChain,
        TransferStatus status,
        uint256 timestamp,
        bytes32 transactionHash,
        bytes32 confirmationHash,
        uint256 fee
    ) {
        Transfer memory transfer = transfers[transferId];
        return (
            transfer.from,
            transfer.to,
            transfer.amount,
            transfer.sourceChain,
            transfer.targetChain,
            transfer.status,
            transfer.timestamp,
            transfer.transactionHash,
            transfer.confirmationHash,
            transfer.fee
        );
    }

    /**
     * @dev Obtener transferencias de un usuario
     */
    function getUserTransfers(address user) public view returns (bytes32[] memory) {
        return userTransfers[user];
    }

    /**
     * @dev Obtener estadísticas del puente
     */
    function getBridgeStats() public view returns (
        uint256 totalTransfers_,
        uint256 totalVolume_,
        uint256 pendingTransfers_,
        uint256 completedTransfers_,
        uint256 failedTransfers_
    ) {
        totalTransfers_ = totalTransfers;
        totalVolume_ = totalVolume;
        
        // Contar por estado
        for (uint256 i = 0; i < totalTransfers; i++) {
            bytes32 transferId = bytes32(i);
            if (transfers[transferId].status == TransferStatus.PENDING) {
                pendingTransfers_++;
            } else if (transfers[transferId].status == TransferStatus.COMPLETED) {
                completedTransfers_++;
            } else if (transfers[transferId].status == TransferStatus.FAILED) {
                failedTransfers_++;
            }
        }
    }

    /**
     * @dev Configurar límites (solo owner)
     */
    function setLimits(
        uint256 _minTransferAmount,
        uint256 _maxTransferAmount,
        uint256 _dailyLimit
    ) public onlyOwner {
        require(_minTransferAmount > 0, "Min amount must be greater than 0");
        require(_maxTransferAmount > _minTransferAmount, "Max amount must be greater than min");
        require(_dailyLimit > 0, "Daily limit must be greater than 0");
        
        minTransferAmount = _minTransferAmount;
        maxTransferAmount = _maxTransferAmount;
        dailyLimit = _dailyLimit;
    }

    /**
     * @dev Configurar fee (solo owner)
     */
    function setTransferFee(uint256 _fee) public onlyOwner {
        transferFee = _fee;
    }

    /**
     * @dev Agregar validador (solo owner)
     */
    function addValidator(address validator) public onlyOwner {
        require(validator != address(0), "Invalid validator address");
        validators[validator] = true;
    }

    /**
     * @dev Remover validador (solo owner)
     */
    function removeValidator(address validator) public onlyOwner {
        validators[validator] = false;
    }

    /**
     * @dev Pausar puente (solo owner)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Reanudar puente (solo owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Generar ID de transferencia
     */
    function _generateTransferId(
        address from,
        address to,
        uint256 amount,
        string memory sourceChain
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            from,
            to,
            amount,
            sourceChain,
            block.timestamp,
            block.number
        ));
    }

    /**
     * @dev Verificar límite diario
     */
    function _checkDailyLimit(uint256 amount) internal view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        return dailyTransfers[today] + amount <= dailyLimit;
    }

    /**
     * @dev Verificar límite diario de usuario
     */
    function _checkUserDailyLimit(address user, uint256 amount) internal view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        
        if (userLastTransferDay[user] != today) {
            return amount <= dailyLimit;
        }
        
        return userDailyTransfers[user] + amount <= dailyLimit;
    }

    /**
     * @dev Actualizar límites diarios
     */
    function _updateDailyLimits(uint256 amount) internal {
        uint256 today = block.timestamp / 1 days;
        dailyTransfers[today] += amount;
    }

    /**
     * @dev Validar firmas de validadores
     */
    function _validateSignatures(
        bytes32 transferId,
        bytes32 confirmationHash,
        bytes[] memory signatures
    ) internal view returns (bool) {
        require(signatures.length >= minValidators, "Insufficient signatures");
        
        bytes32 messageHash = keccak256(abi.encodePacked(transferId, confirmationHash));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        address[] memory signers = new address[](signatures.length);
        
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = ethSignedMessageHash.recover(signatures[i]);
            require(validators[signer], "Invalid validator signature");
            
            // Verificar que no se repita la firma
            for (uint256 j = 0; j < i; j++) {
                require(signers[j] != signer, "Duplicate signature");
            }
            
            signers[i] = signer;
        }
        
        return true;
    }

    /**
     * @dev Obtener información de límites diarios
     */
    function getDailyLimitInfo() public view returns (
        uint256 todayTransfers,
        uint256 limit,
        uint256 remaining
    ) {
        uint256 today = block.timestamp / 1 days;
        todayTransfers = dailyTransfers[today];
        limit = dailyLimit;
        remaining = limit > todayTransfers ? limit - todayTransfers : 0;
    }

    /**
     * @dev Obtener información de límites diarios de usuario
     */
    function getUserDailyLimitInfo(address user) public view returns (
        uint256 userTransfers,
        uint256 limit,
        uint256 remaining,
        uint256 lastDay
    ) {
        uint256 today = block.timestamp / 1 days;
        userTransfers = userDailyTransfers[user];
        limit = dailyLimit;
        remaining = limit > userTransfers ? limit - userTransfers : 0;
        lastDay = userLastTransferDay[user];
    }
} 