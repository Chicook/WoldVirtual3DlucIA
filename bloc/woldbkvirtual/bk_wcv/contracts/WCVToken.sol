// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title WCVToken
 * @dev Token WCV con 30 millones de unidades y 3 decimales
 * @author WoldVirtual3D Team
 */
contract WCVToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Constantes del token
    uint256 public constant INITIAL_SUPPLY = 30_000_000 * 10**3; // 30 millones con 3 decimales
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**3; // 100 millones máximo
    uint8 public constant DECIMALS = 3;
    
    // Configuración de fees
    uint256 public mintingFee = 0.001 ether;
    uint256 public transferFee = 0; // Fee por transferencia (en WCV)
    uint256 public maxTransferAmount = MAX_SUPPLY;
    
    // Mappings para control de acceso
    mapping(address => bool) public isBlacklisted;
    mapping(address => bool) public isWhitelisted;
    mapping(address => bool) public isExcludedFromFees;
    mapping(address => bool) public isMinter;
    
    // Estadísticas
    uint256 public totalMinted;
    uint256 public totalBurned;
    Counters.Counter private _transactionCount;
    
    // Eventos personalizados
    event TokensMinted(address indexed to, uint256 amount, uint256 fee);
    event TokensBurned(address indexed from, uint256 amount);
    event FeeUpdated(string feeType, uint256 oldFee, uint256 newFee);
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event WhitelistUpdated(address indexed account, bool isWhitelisted);
    event MinterUpdated(address indexed account, bool isMinter);
    event MaxTransferAmountUpdated(uint256 oldAmount, uint256 newAmount);
    
    // Modificadores
    modifier notBlacklisted(address account) {
        require(!isBlacklisted[account], "WCV: Cuenta en blacklist");
        _;
    }
    
    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "WCV: Solo minters autorizados");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "WCV: Cantidad debe ser mayor a 0");
        require(amount <= maxTransferAmount, "WCV: Cantidad excede el límite máximo");
        _;
    }

    /**
     * @dev Constructor del token WCV
     * @param initialOwner Dirección del propietario inicial
     */
    constructor(address initialOwner) 
        ERC20("WCV Token", "WCV") 
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
        totalMinted = INITIAL_SUPPLY;
        
        // Configurar exclusiones iniciales
        isExcludedFromFees[initialOwner] = true;
        isWhitelisted[initialOwner] = true;
        isMinter[initialOwner] = true;
        
        // Excluir al contrato de fees
        isExcludedFromFees[address(this)] = true;
    }

    /**
     * @dev Función para acuñar nuevos tokens
     * @param to Dirección que recibirá los tokens
     * @param amount Cantidad de tokens a acuñar
     */
    function mint(address to, uint256 amount) 
        external 
        payable 
        onlyMinter 
        nonReentrant 
        validAmount(amount)
    {
        require(msg.value >= mintingFee, "WCV: Fee de minting insuficiente");
        require(totalSupply() + amount <= MAX_SUPPLY, "WCV: Excede supply máximo");
        require(!isBlacklisted[to], "WCV: Destinatario en blacklist");
        
        _mint(to, amount);
        totalMinted += amount;
        _transactionCount.increment();
        
        emit TokensMinted(to, amount, msg.value);
    }

    /**
     * @dev Función para quemar tokens
     * @param amount Cantidad de tokens a quemar
     */
    function burn(uint256 amount) 
        external 
        override 
        nonReentrant 
        validAmount(amount)
    {
        require(balanceOf(msg.sender) >= amount, "WCV: Saldo insuficiente");
        
        _burn(msg.sender, amount);
        totalBurned += amount;
        _transactionCount.increment();
        
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Función para quemar tokens desde otra cuenta (con autorización)
     * @param account Cuenta desde la cual quemar tokens
     * @param amount Cantidad de tokens a quemar
     */
    function burnFrom(address account, uint256 amount) 
        external 
        override 
        nonReentrant 
        validAmount(amount)
    {
        require(balanceOf(account) >= amount, "WCV: Saldo insuficiente");
        require(allowance(account, msg.sender) >= amount, "WCV: Allowance insuficiente");
        
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
        totalBurned += amount;
        _transactionCount.increment();
        
        emit TokensBurned(account, amount);
    }

    /**
     * @dev Función de transferencia con soporte para fees
     * @param to Dirección de destino
     * @param amount Cantidad a transferir
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        nonReentrant 
        validAmount(amount)
        returns (bool)
    {
        require(!isBlacklisted[to], "WCV: Destinatario en blacklist");
        require(!isBlacklisted[msg.sender], "WCV: Remitente en blacklist");
        
        uint256 transferAmount = amount;
        uint256 feeAmount = 0;
        
        // Calcular fee si aplica
        if (transferFee > 0 && !isExcludedFromFees[msg.sender] && !isExcludedFromFees[to]) {
            feeAmount = (amount * transferFee) / 10000; // Fee en basis points
            transferAmount = amount - feeAmount;
            
            if (feeAmount > 0) {
                _transfer(msg.sender, address(this), feeAmount);
            }
        }
        
        _transfer(msg.sender, to, transferAmount);
        _transactionCount.increment();
        
        return true;
    }

    /**
     * @dev Función de transferencia desde otra cuenta
     * @param from Dirección de origen
     * @param to Dirección de destino
     * @param amount Cantidad a transferir
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        nonReentrant 
        validAmount(amount)
        returns (bool)
    {
        require(!isBlacklisted[to], "WCV: Destinatario en blacklist");
        require(!isBlacklisted[from], "WCV: Remitente en blacklist");
        
        uint256 transferAmount = amount;
        uint256 feeAmount = 0;
        
        // Calcular fee si aplica
        if (transferFee > 0 && !isExcludedFromFees[from] && !isExcludedFromFees[to]) {
            feeAmount = (amount * transferFee) / 10000;
            transferAmount = amount - feeAmount;
            
            if (feeAmount > 0) {
                _spendAllowance(from, msg.sender, amount);
                _transfer(from, address(this), feeAmount);
                _transfer(from, to, transferAmount);
            } else {
                _spendAllowance(from, msg.sender, amount);
                _transfer(from, to, transferAmount);
            }
        } else {
            _spendAllowance(from, msg.sender, amount);
            _transfer(from, to, transferAmount);
        }
        
        _transactionCount.increment();
        return true;
    }

    // Funciones administrativas

    /**
     * @dev Pausar el contrato
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Reanudar el contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Actualizar fee de minting
     * @param newFee Nuevo fee en wei
     */
    function setMintingFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = mintingFee;
        mintingFee = newFee;
        emit FeeUpdated("minting", oldFee, newFee);
    }

    /**
     * @dev Actualizar fee de transferencia
     * @param newFee Nuevo fee en basis points (100 = 1%)
     */
    function setTransferFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "WCV: Fee máximo 10%");
        uint256 oldFee = transferFee;
        transferFee = newFee;
        emit FeeUpdated("transfer", oldFee, newFee);
    }

    /**
     * @dev Actualizar límite máximo de transferencia
     * @param newAmount Nueva cantidad máxima
     */
    function setMaxTransferAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "WCV: Cantidad debe ser mayor a 0");
        uint256 oldAmount = maxTransferAmount;
        maxTransferAmount = newAmount;
        emit MaxTransferAmountUpdated(oldAmount, newAmount);
    }

    /**
     * @dev Agregar/remover cuenta del blacklist
     * @param account Dirección de la cuenta
     * @param blacklisted Estado del blacklist
     */
    function setBlacklisted(address account, bool blacklisted) external onlyOwner {
        isBlacklisted[account] = blacklisted;
        emit BlacklistUpdated(account, blacklisted);
    }

    /**
     * @dev Agregar/remover cuenta del whitelist
     * @param account Dirección de la cuenta
     * @param whitelisted Estado del whitelist
     */
    function setWhitelisted(address account, bool whitelisted) external onlyOwner {
        isWhitelisted[account] = whitelisted;
        emit WhitelistUpdated(account, whitelisted);
    }

    /**
     * @dev Agregar/remover minter
     * @param account Dirección del minter
     * @param isMinterRole Estado de minter
     */
    function setMinter(address account, bool isMinterRole) external onlyOwner {
        isMinter[account] = isMinterRole;
        emit MinterUpdated(account, isMinterRole);
    }

    /**
     * @dev Excluir/incluir cuenta de fees
     * @param account Dirección de la cuenta
     * @param excluded Estado de exclusión
     */
    function setExcludedFromFees(address account, bool excluded) external onlyOwner {
        isExcludedFromFees[account] = excluded;
    }

    /**
     * @dev Retirar ETH acumulado por fees
     * @param to Dirección de destino
     */
    function withdrawFees(address to) external onlyOwner {
        require(to != address(0), "WCV: Dirección inválida");
        uint256 balance = address(this).balance;
        require(balance > 0, "WCV: Sin balance para retirar");
        
        (bool success, ) = to.call{value: balance}("");
        require(success, "WCV: Transferencia fallida");
    }

    /**
     * @dev Retirar tokens WCV acumulados por fees
     * @param to Dirección de destino
     * @param amount Cantidad a retirar
     */
    function withdrawTokenFees(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "WCV: Dirección inválida");
        require(amount > 0, "WCV: Cantidad debe ser mayor a 0");
        require(balanceOf(address(this)) >= amount, "WCV: Saldo insuficiente");
        
        _transfer(address(this), to, amount);
    }

    // Funciones de consulta

    /**
     * @dev Obtener estadísticas del token
     */
    function getTokenStats() external view returns (
        uint256 totalSupplyValue,
        uint256 totalMintedValue,
        uint256 totalBurnedValue,
        uint256 transactionCount,
        uint256 currentMintingFee,
        uint256 currentTransferFee,
        uint256 maxTransferAmountValue
    ) {
        return (
            totalSupply(),
            totalMinted,
            totalBurned,
            _transactionCount.current(),
            mintingFee,
            transferFee,
            maxTransferAmount
        );
    }

    /**
     * @dev Verificar si una cuenta está en blacklist
     * @param account Dirección a verificar
     */
    function isAccountBlacklisted(address account) external view returns (bool) {
        return isBlacklisted[account];
    }

    /**
     * @dev Verificar si una cuenta está en whitelist
     * @param account Dirección a verificar
     */
    function isAccountWhitelisted(address account) external view returns (bool) {
        return isWhitelisted[account];
    }

    /**
     * @dev Verificar si una cuenta es minter
     * @param account Dirección a verificar
     */
    function isAccountMinter(address account) external view returns (bool) {
        return isMinter[account];
    }

    // Override de funciones de OpenZeppelin

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
} 