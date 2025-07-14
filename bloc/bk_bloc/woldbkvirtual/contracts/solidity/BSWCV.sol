// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title BSWCV (Wrapped WCV for Binance Smart Chain)
 * @dev Token wrapped que permite pagar gas fees en BNB mientras el usuario paga en WCV
 * @author WoldVirtual3D Team
 */
contract BSWCV is ERC20, Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    // Eventos
    event GasFeePaid(
        address indexed user,
        uint256 wcvAmount,
        uint256 bnbAmount,
        string service,
        bytes32 transactionId
    );
    
    event GasFeeRefunded(
        address indexed user,
        uint256 bnbAmount,
        string reason
    );
    
    event ServiceRegistered(
        string serviceName,
        uint256 gasFee,
        bool active
    );

    // Estructuras
    struct Service {
        string name;
        uint256 gasFee; // Gas fee en WCV (con 3 decimales)
        bool active;
        uint256 totalTransactions;
        uint256 totalRevenue;
    }

    struct Transaction {
        address user;
        uint256 wcvAmount;
        uint256 bnbAmount;
        string service;
        uint256 timestamp;
        bool processed;
        bytes32 transactionId;
    }

    // Variables de estado
    mapping(string => Service) public services;
    mapping(bytes32 => Transaction) public transactions;
    mapping(address => uint256) public userBalances;
    
    uint256 public totalGasFeesCollected;
    uint256 public totalBNBSpent;
    uint256 public minBNBBalance = 0.01 ether; // 0.01 BNB mínimo
    uint256 public maxBNBBalance = 10 ether; // 10 BNB máximo
    
    // Configuración
    uint256 public constant DECIMALS = 3;
    uint256 public constant MIN_GAS_FEE = 1; // 0.001 WCV
    uint256 public constant MAX_GAS_FEE = 1000000; // 1000 WCV
    
    // Constructor
    constructor() ERC20("Wrapped WCV", "BSWCV") {
        _mint(msg.sender, 1000000000); // 1M BSWCV inicial
        
        // Registrar servicios por defecto
        _registerService("publish_island", 1, true); // 0.001 WCV
        _registerService("publish_house", 1, true); // 0.001 WCV
        _registerService("publish_asset", 5, true); // 0.005 WCV
        _registerService("transfer_asset", 2, true); // 0.002 WCV
        _registerService("mint_nft", 10, true); // 0.01 WCV
        _registerService("create_avatar", 5, true); // 0.005 WCV
        _registerService("join_metaverse", 1, true); // 0.001 WCV
    }

    /**
     * @dev Pagar gas fee por un servicio
     */
    function payGasFee(
        string memory serviceName,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bool) {
        require(bytes(serviceName).length > 0, "Service name cannot be empty");
        require(services[serviceName].active, "Service not active");
        
        uint256 gasFee = services[serviceName].gasFee;
        require(gasFee >= MIN_GAS_FEE, "Gas fee too low");
        require(gasFee <= MAX_GAS_FEE, "Gas fee too high");
        
        // Verificar que el usuario tiene suficientes BSWCV
        require(balanceOf(msg.sender) >= gasFee, "Insufficient BSWCV balance");
        
        // Quemar BSWCV del usuario
        _burn(msg.sender, gasFee);
        
        // Calcular BNB necesario para gas
        uint256 bnbNeeded = _calculateBNBForGas();
        
        // Verificar que el contrato tiene suficientes BNB
        require(address(this).balance >= bnbNeeded, "Insufficient BNB balance");
        
        // Registrar transacción
        Transaction memory newTransaction = Transaction({
            user: msg.sender,
            wcvAmount: gasFee,
            bnbAmount: bnbNeeded,
            service: serviceName,
            timestamp: block.timestamp,
            processed: true,
            transactionId: transactionId
        });
        
        transactions[transactionId] = newTransaction;
        
        // Actualizar estadísticas
        services[serviceName].totalTransactions = services[serviceName].totalTransactions.add(1);
        services[serviceName].totalRevenue = services[serviceName].totalRevenue.add(gasFee);
        totalGasFeesCollected = totalGasFeesCollected.add(gasFee);
        totalBNBSpent = totalBNBSpent.add(bnbNeeded);
        
        emit GasFeePaid(msg.sender, gasFee, bnbNeeded, serviceName, transactionId);
        
        return true;
    }

    /**
     * @dev Pagar gas fee con múltiples servicios
     */
    function payMultipleGasFees(
        string[] memory serviceNames,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bool) {
        require(serviceNames.length > 0, "No services provided");
        require(serviceNames.length <= 10, "Too many services");
        
        uint256 totalGasFee = 0;
        
        // Calcular total de gas fees
        for (uint256 i = 0; i < serviceNames.length; i++) {
            require(services[serviceNames[i]].active, "Service not active");
            totalGasFee = totalGasFee.add(services[serviceNames[i]].gasFee);
        }
        
        // Verificar balance
        require(balanceOf(msg.sender) >= totalGasFee, "Insufficient BSWCV balance");
        
        // Quemar BSWCV
        _burn(msg.sender, totalGasFee);
        
        // Calcular BNB necesario
        uint256 bnbNeeded = _calculateBNBForGas();
        require(address(this).balance >= bnbNeeded, "Insufficient BNB balance");
        
        // Registrar transacción
        Transaction memory newTransaction = Transaction({
            user: msg.sender,
            wcvAmount: totalGasFee,
            bnbAmount: bnbNeeded,
            service: "multiple",
            timestamp: block.timestamp,
            processed: true,
            transactionId: transactionId
        });
        
        transactions[transactionId] = newTransaction;
        
        // Actualizar estadísticas
        for (uint256 i = 0; i < serviceNames.length; i++) {
            services[serviceNames[i]].totalTransactions = services[serviceNames[i]].totalTransactions.add(1);
            services[serviceNames[i]].totalRevenue = services[serviceNames[i]].totalRevenue.add(services[serviceNames[i]].gasFee);
        }
        
        totalGasFeesCollected = totalGasFeesCollected.add(totalGasFee);
        totalBNBSpent = totalBNBSpent.add(bnbNeeded);
        
        emit GasFeePaid(msg.sender, totalGasFee, bnbNeeded, "multiple", transactionId);
        
        return true;
    }

    /**
     * @dev Reembolsar gas fee (solo owner)
     */
    function refundGasFee(
        address user,
        uint256 bnbAmount,
        string memory reason
    ) public onlyOwner {
        require(bnbAmount > 0, "Amount must be greater than 0");
        require(bnbAmount <= address(this).balance, "Insufficient BNB balance");
        
        // Transferir BNB al usuario
        (bool success, ) = user.call{value: bnbAmount}("");
        require(success, "BNB transfer failed");
        
        emit GasFeeRefunded(user, bnbAmount, reason);
    }

    /**
     * @dev Registrar nuevo servicio (solo owner)
     */
    function registerService(
        string memory serviceName,
        uint256 gasFee,
        bool active
    ) public onlyOwner {
        require(bytes(serviceName).length > 0, "Service name cannot be empty");
        require(gasFee >= MIN_GAS_FEE, "Gas fee too low");
        require(gasFee <= MAX_GAS_FEE, "Gas fee too high");
        
        _registerService(serviceName, gasFee, active);
    }

    /**
     * @dev Actualizar servicio existente (solo owner)
     */
    function updateService(
        string memory serviceName,
        uint256 gasFee,
        bool active
    ) public onlyOwner {
        require(bytes(serviceName).length > 0, "Service name cannot be empty");
        require(services[serviceName].gasFee > 0, "Service does not exist");
        require(gasFee >= MIN_GAS_FEE, "Gas fee too low");
        require(gasFee <= MAX_GAS_FEE, "Gas fee too high");
        
        services[serviceName].gasFee = gasFee;
        services[serviceName].active = active;
        
        emit ServiceRegistered(serviceName, gasFee, active);
    }

    /**
     * @dev Depositar BNB al contrato (solo owner)
     */
    function depositBNB() public payable onlyOwner {
        require(msg.value > 0, "Must send BNB");
        require(address(this).balance <= maxBNBBalance, "BNB balance too high");
    }

    /**
     * @dev Retirar BNB del contrato (solo owner)
     */
    function withdrawBNB(uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= address(this).balance, "Insufficient BNB balance");
        require(address(this).balance.sub(amount) >= minBNBBalance, "Would exceed minimum BNB balance");
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "BNB withdrawal failed");
    }

    /**
     * @dev Configurar límites de BNB (solo owner)
     */
    function setBNBLimits(uint256 _minBalance, uint256 _maxBalance) public onlyOwner {
        require(_minBalance < _maxBalance, "Min balance must be less than max");
        require(_maxBalance > 0, "Max balance must be greater than 0");
        
        minBNBBalance = _minBalance;
        maxBNBBalance = _maxBalance;
    }

    /**
     * @dev Obtener información de un servicio
     */
    function getServiceInfo(string memory serviceName) public view returns (
        string memory name,
        uint256 gasFee,
        bool active,
        uint256 totalTransactions,
        uint256 totalRevenue
    ) {
        Service memory service = services[serviceName];
        return (
            service.name,
            service.gasFee,
            service.active,
            service.totalTransactions,
            service.totalRevenue
        );
    }

    /**
     * @dev Obtener información de una transacción
     */
    function getTransactionInfo(bytes32 transactionId) public view returns (
        address user,
        uint256 wcvAmount,
        uint256 bnbAmount,
        string memory service,
        uint256 timestamp,
        bool processed
    ) {
        Transaction memory transaction = transactions[transactionId];
        return (
            transaction.user,
            transaction.wcvAmount,
            transaction.bnbAmount,
            transaction.service,
            transaction.timestamp,
            transaction.processed
        );
    }

    /**
     * @dev Obtener estadísticas del contrato
     */
    function getContractStats() public view returns (
        uint256 totalGasFees_,
        uint256 totalBNBSpent_,
        uint256 currentBNBBalance,
        uint256 minBNBBalance_,
        uint256 maxBNBBalance_
    ) {
        return (
            totalGasFeesCollected,
            totalBNBSpent,
            address(this).balance,
            minBNBBalance,
            maxBNBBalance
        );
    }

    /**
     * @dev Calcular BNB necesario para gas
     */
    function _calculateBNBForGas() internal view returns (uint256) {
        // Estimación dinámica basada en gas price actual
        uint256 gasPrice = tx.gasprice;
        uint256 estimatedGas = 21000; // Gas básico para transacción
        
        // Ajustar según complejidad de la transacción
        if (gasPrice > 5 gwei) {
            estimatedGas = 50000; // Transacción más compleja
        }
        
        return gasPrice.mul(estimatedGas);
    }

    /**
     * @dev Registrar servicio internamente
     */
    function _registerService(
        string memory serviceName,
        uint256 gasFee,
        bool active
    ) internal {
        services[serviceName] = Service({
            name: serviceName,
            gasFee: gasFee,
            active: active,
            totalTransactions: 0,
            totalRevenue: 0
        });
        
        emit ServiceRegistered(serviceName, gasFee, active);
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

    /**
     * @dev Override decimals para usar 3 decimales
     */
    function decimals() public view virtual override returns (uint8) {
        return 3;
    }

    /**
     * @dev Recibir BNB
     */
    receive() external payable {
        // Solo permitir depósitos del owner
        require(msg.sender == owner(), "Only owner can deposit BNB");
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Function not found");
    }
} 