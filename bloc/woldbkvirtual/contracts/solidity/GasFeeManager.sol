// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./BSWCV.sol";

/**
 * @title GasFeeManager
 * @dev Gestiona gas fees en múltiples redes blockchain de forma transparente
 * @author WoldVirtual3D Team
 */
contract GasFeeManager is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    // Eventos
    event CrossChainGasFeePaid(
        address indexed user,
        uint256 wcvAmount,
        string sourceChain,
        string targetChain,
        string service,
        bytes32 transactionId
    );
    
    event NetworkRegistered(
        string networkName,
        address gasToken,
        uint256 gasMultiplier,
        bool active
    );
    
    event ServiceFeeUpdated(
        string serviceName,
        uint256 oldFee,
        uint256 newFee
    );

    // Estructuras
    struct Network {
        string name;
        address gasToken; // Dirección del token wrapped (ej: BSWCV)
        uint256 gasMultiplier; // Multiplicador para ajustar fees
        bool active;
        uint256 totalTransactions;
        uint256 totalFees;
    }

    struct Service {
        string name;
        uint256 baseFee; // Fee base en WCV (3 decimales)
        bool active;
        mapping(string => uint256) networkFees; // Fees específicos por red
    }

    struct CrossChainTransaction {
        address user;
        uint256 wcvAmount;
        string sourceChain;
        string targetChain;
        string service;
        uint256 timestamp;
        bool processed;
        bytes32 transactionId;
    }

    // Variables de estado
    mapping(string => Network) public networks;
    mapping(string => Service) public services;
    mapping(bytes32 => CrossChainTransaction) public crossChainTransactions;
    
    string[] public registeredNetworks;
    string[] public registeredServices;
    
    uint256 public totalCrossChainFees;
    uint256 public totalTransactions;

    // Configuración
    uint256 public constant DECIMALS = 3;
    uint256 public constant MIN_FEE = 1; // 0.001 WCV
    uint256 public constant MAX_FEE = 1000000; // 1000 WCV

    // Constructor
    constructor() {
        // Registrar redes por defecto
        _registerNetwork("BSC", address(0), 100, true); // 100% del fee base
        _registerNetwork("ETH", address(0), 150, true); // 150% del fee base (más cara)
        _registerNetwork("POLYGON", address(0), 80, true); // 80% del fee base (más barata)
        _registerNetwork("AVALANCHE", address(0), 90, true); // 90% del fee base
        _registerNetwork("ARBITRUM", address(0), 70, true); // 70% del fee base
        
        // Registrar servicios por defecto
        _registerService("publish_island", 1); // 0.001 WCV
        _registerService("publish_house", 1); // 0.001 WCV
        _registerService("publish_asset", 5); // 0.005 WCV
        _registerService("transfer_asset", 2); // 0.002 WCV
        _registerService("mint_nft", 10); // 0.01 WCV
        _registerService("create_avatar", 5); // 0.005 WCV
        _registerService("join_metaverse", 1); // 0.001 WCV
        _registerService("create_world", 50); // 0.05 WCV
        _registerService("deploy_smart_contract", 100); // 0.1 WCV
    }

    /**
     * @dev Pagar gas fee en la red actual
     */
    function payGasFee(
        string memory serviceName,
        string memory networkName,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bool) {
        require(bytes(serviceName).length > 0, "Service name cannot be empty");
        require(bytes(networkName).length > 0, "Network name cannot be empty");
        require(services[serviceName].active, "Service not active");
        require(networks[networkName].active, "Network not active");
        
        uint256 fee = _calculateFee(serviceName, networkName);
        require(fee >= MIN_FEE, "Fee too low");
        require(fee <= MAX_FEE, "Fee too high");
        
        // Procesar pago según la red
        bool success = _processPayment(msg.sender, fee, networkName, serviceName);
        require(success, "Payment processing failed");
        
        // Registrar transacción
        _recordTransaction(msg.sender, fee, networkName, "", serviceName, transactionId);
        
        return true;
    }

    /**
     * @dev Pagar gas fee cross-chain
     */
    function payCrossChainGasFee(
        string memory serviceName,
        string memory sourceChain,
        string memory targetChain,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bool) {
        require(bytes(serviceName).length > 0, "Service name cannot be empty");
        require(bytes(sourceChain).length > 0, "Source chain cannot be empty");
        require(bytes(targetChain).length > 0, "Target chain cannot be empty");
        require(services[serviceName].active, "Service not active");
        require(networks[sourceChain].active, "Source network not active");
        require(networks[targetChain].active, "Target network not active");
        
        uint256 fee = _calculateCrossChainFee(serviceName, sourceChain, targetChain);
        require(fee >= MIN_FEE, "Fee too low");
        require(fee <= MAX_FEE, "Fee too high");
        
        // Procesar pago en la red origen
        bool success = _processPayment(msg.sender, fee, sourceChain, serviceName);
        require(success, "Payment processing failed");
        
        // Registrar transacción cross-chain
        _recordCrossChainTransaction(msg.sender, fee, sourceChain, targetChain, serviceName, transactionId);
        
        emit CrossChainGasFeePaid(msg.sender, fee, sourceChain, targetChain, serviceName, transactionId);
        
        return true;
    }

    /**
     * @dev Pagar múltiples servicios
     */
    function payMultipleServices(
        string[] memory serviceNames,
        string memory networkName,
        bytes32 transactionId
    ) public nonReentrant whenNotPaused returns (bool) {
        require(serviceNames.length > 0, "No services provided");
        require(serviceNames.length <= 10, "Too many services");
        require(bytes(networkName).length > 0, "Network name cannot be empty");
        require(networks[networkName].active, "Network not active");
        
        uint256 totalFee = 0;
        
        // Calcular total de fees
        for (uint256 i = 0; i < serviceNames.length; i++) {
            require(services[serviceNames[i]].active, "Service not active");
            totalFee = totalFee.add(_calculateFee(serviceNames[i], networkName));
        }
        
        require(totalFee >= MIN_FEE, "Total fee too low");
        require(totalFee <= MAX_FEE, "Total fee too high");
        
        // Procesar pago
        bool success = _processPayment(msg.sender, totalFee, networkName, "multiple");
        require(success, "Payment processing failed");
        
        // Registrar transacción
        _recordTransaction(msg.sender, totalFee, networkName, "", "multiple", transactionId);
        
        return true;
    }

    /**
     * @dev Registrar nueva red (solo owner)
     */
    function registerNetwork(
        string memory networkName,
        address gasToken,
        uint256 gasMultiplier,
        bool active
    ) public onlyOwner {
        require(bytes(networkName).length > 0, "Network name cannot be empty");
        require(gasMultiplier > 0, "Gas multiplier must be greater than 0");
        
        _registerNetwork(networkName, gasToken, gasMultiplier, active);
    }

    /**
     * @dev Actualizar red existente (solo owner)
     */
    function updateNetwork(
        string memory networkName,
        address gasToken,
        uint256 gasMultiplier,
        bool active
    ) public onlyOwner {
        require(bytes(networkName).length > 0, "Network name cannot be empty");
        require(networks[networkName].gasMultiplier > 0, "Network does not exist");
        require(gasMultiplier > 0, "Gas multiplier must be greater than 0");
        
        networks[networkName].gasToken = gasToken;
        networks[networkName].gasMultiplier = gasMultiplier;
        networks[networkName].active = active;
        
        emit NetworkRegistered(networkName, gasToken, gasMultiplier, active);
    }

    /**
     * @dev Registrar nuevo servicio (solo owner)
     */
    function registerService(
        string memory serviceName,
        uint256 baseFee
    ) public onlyOwner {
        require(bytes(serviceName).length > 0, "Service name cannot be empty");
        require(baseFee >= MIN_FEE, "Base fee too low");
        require(baseFee <= MAX_FEE, "Base fee too high");
        
        _registerService(serviceName, baseFee);
    }

    /**
     * @dev Actualizar fee de servicio por red (solo owner)
     */
    function updateServiceNetworkFee(
        string memory serviceName,
        string memory networkName,
        uint256 fee
    ) public onlyOwner {
        require(bytes(serviceName).length > 0, "Service name cannot be empty");
        require(bytes(networkName).length > 0, "Network name cannot be empty");
        require(services[serviceName].baseFee > 0, "Service does not exist");
        require(fee >= MIN_FEE, "Fee too low");
        require(fee <= MAX_FEE, "Fee too high");
        
        uint256 oldFee = services[serviceName].networkFees[networkName];
        services[serviceName].networkFees[networkName] = fee;
        
        emit ServiceFeeUpdated(serviceName, oldFee, fee);
    }

    /**
     * @dev Obtener información de una red
     */
    function getNetworkInfo(string memory networkName) public view returns (
        string memory name,
        address gasToken,
        uint256 gasMultiplier,
        bool active,
        uint256 totalTransactions,
        uint256 totalFees
    ) {
        Network memory network = networks[networkName];
        return (
            network.name,
            network.gasToken,
            network.gasMultiplier,
            network.active,
            network.totalTransactions,
            network.totalFees
        );
    }

    /**
     * @dev Obtener fee para un servicio en una red específica
     */
    function getServiceFee(
        string memory serviceName,
        string memory networkName
    ) public view returns (uint256) {
        return _calculateFee(serviceName, networkName);
    }

    /**
     * @dev Obtener fee cross-chain
     */
    function getCrossChainFee(
        string memory serviceName,
        string memory sourceChain,
        string memory targetChain
    ) public view returns (uint256) {
        return _calculateCrossChainFee(serviceName, sourceChain, targetChain);
    }

    /**
     * @dev Obtener estadísticas del contrato
     */
    function getContractStats() public view returns (
        uint256 totalCrossChainFees_,
        uint256 totalTransactions_,
        uint256 registeredNetworks_,
        uint256 registeredServices_
    ) {
        return (
            totalCrossChainFees,
            totalTransactions,
            registeredNetworks.length,
            registeredServices.length
        );
    }

    /**
     * @dev Obtener todas las redes registradas
     */
    function getAllNetworks() public view returns (string[] memory) {
        return registeredNetworks;
    }

    /**
     * @dev Obtener todos los servicios registrados
     */
    function getAllServices() public view returns (string[] memory) {
        return registeredServices;
    }

    /**
     * @dev Calcular fee para un servicio en una red específica
     */
    function _calculateFee(
        string memory serviceName,
        string memory networkName
    ) internal view returns (uint256) {
        Service storage service = services[serviceName];
        Network storage network = networks[networkName];
        
        // Si hay un fee específico para esta red, usarlo
        if (service.networkFees[networkName] > 0) {
            return service.networkFees[networkName];
        }
        
        // Si no, calcular basado en el multiplicador de la red
        return service.baseFee.mul(network.gasMultiplier).div(100);
    }

    /**
     * @dev Calcular fee cross-chain
     */
    function _calculateCrossChainFee(
        string memory serviceName,
        string memory sourceChain,
        string memory targetChain
    ) internal view returns (uint256) {
        uint256 sourceFee = _calculateFee(serviceName, sourceChain);
        uint256 targetFee = _calculateFee(serviceName, targetChain);
        
        // Fee cross-chain = fee origen + 50% del fee destino
        return sourceFee.add(targetFee.mul(50).div(100));
    }

    /**
     * @dev Procesar pago según la red
     */
    function _processPayment(
        address user,
        uint256 fee,
        string memory networkName,
        string memory serviceName
    ) internal returns (bool) {
        Network storage network = networks[networkName];
        
        // Si hay un token específico para esta red, usarlo
        if (network.gasToken != address(0)) {
            // Interactuar con el token wrapped (ej: BSWCV)
            BSWCV gasToken = BSWCV(network.gasToken);
            
            // Verificar balance
            require(gasToken.balanceOf(user) >= fee, "Insufficient wrapped token balance");
            
            // Quemar tokens
            gasToken.burn(user, fee, "Gas fee payment");
        } else {
            // Para redes sin token wrapped, usar WCV directamente
            // Aquí se implementaría la lógica para WCV nativo
            // Por ahora, solo registramos la transacción
        }
        
        // Actualizar estadísticas
        network.totalTransactions = network.totalTransactions.add(1);
        network.totalFees = network.totalFees.add(fee);
        totalTransactions = totalTransactions.add(1);
        
        return true;
    }

    /**
     * @dev Registrar transacción
     */
    function _recordTransaction(
        address user,
        uint256 fee,
        string memory networkName,
        string memory targetChain,
        string memory serviceName,
        bytes32 transactionId
    ) internal {
        CrossChainTransaction memory transaction = CrossChainTransaction({
            user: user,
            wcvAmount: fee,
            sourceChain: networkName,
            targetChain: targetChain,
            service: serviceName,
            timestamp: block.timestamp,
            processed: true,
            transactionId: transactionId
        });
        
        crossChainTransactions[transactionId] = transaction;
    }

    /**
     * @dev Registrar transacción cross-chain
     */
    function _recordCrossChainTransaction(
        address user,
        uint256 fee,
        string memory sourceChain,
        string memory targetChain,
        string memory serviceName,
        bytes32 transactionId
    ) internal {
        _recordTransaction(user, fee, sourceChain, targetChain, serviceName, transactionId);
        totalCrossChainFees = totalCrossChainFees.add(fee);
    }

    /**
     * @dev Registrar red internamente
     */
    function _registerNetwork(
        string memory networkName,
        address gasToken,
        uint256 gasMultiplier,
        bool active
    ) internal {
        networks[networkName] = Network({
            name: networkName,
            gasToken: gasToken,
            gasMultiplier: gasMultiplier,
            active: active,
            totalTransactions: 0,
            totalFees: 0
        });
        
        registeredNetworks.push(networkName);
        
        emit NetworkRegistered(networkName, gasToken, gasMultiplier, active);
    }

    /**
     * @dev Registrar servicio internamente
     */
    function _registerService(
        string memory serviceName,
        uint256 baseFee
    ) internal {
        services[serviceName].name = serviceName;
        services[serviceName].baseFee = baseFee;
        services[serviceName].active = true;
        
        registeredServices.push(serviceName);
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