// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./WCVToken.sol";

/**
 * @title WCV Staking Contract
 * @dev Sistema de staking para WoldCoinVirtual con recompensas y gobernanza
 * @author WoldVirtual3D Team
 */
contract WCVStaking is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;

    // Eventos
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsDistributed(uint256 totalAmount, uint256 timestamp);
    event ValidatorAdded(address indexed validator, uint256 stake, uint256 timestamp);
    event ValidatorRemoved(address indexed validator, uint256 timestamp);

    // Estructuras
    struct Staker {
        uint256 stakedAmount;
        uint256 lastRewardTime;
        uint256 accumulatedRewards;
        uint256 totalRewardsClaimed;
        bool isValidator;
        uint256 validatorStake;
        uint256 stakingStartTime;
        uint256 lockPeriod;
    }

    struct StakingPool {
        uint256 totalStaked;
        uint256 totalRewards;
        uint256 rewardRate;
        uint256 lastRewardTime;
        uint256 minStakeAmount;
        uint256 maxStakeAmount;
        uint256 lockPeriod;
        uint256 validatorThreshold;
    }

    // Variables de estado
    WCVToken public wcvToken;
    
    mapping(address => Staker) public stakers;
    address[] public stakerAddresses;
    address[] public validators;
    
    StakingPool public stakingPool;
    
    uint256 public constant REWARD_PRECISION = 1e18;
    uint256 public constant YEAR_IN_SECONDS = 365 days;
    
    // Configuración
    uint256 public rewardRate = 5; // 5% APY
    uint256 public minStakeAmount = 1000; // 1 WCV
    uint256 public maxStakeAmount = 1000000000; // 1B WCV
    uint256 public lockPeriod = 30 days;
    uint256 public validatorThreshold = 10000000; // 10M WCV
    
    // Constructor
    constructor(address _wcvToken) {
        require(_wcvToken != address(0), "Invalid WCV token address");
        wcvToken = WCVToken(_wcvToken);
        
        stakingPool = StakingPool({
            totalStaked: 0,
            totalRewards: 0,
            rewardRate: rewardRate,
            lastRewardTime: block.timestamp,
            minStakeAmount: minStakeAmount,
            maxStakeAmount: maxStakeAmount,
            lockPeriod: lockPeriod,
            validatorThreshold: validatorThreshold
        });
    }

    /**
     * @dev Hacer stake de WCV
     */
    function stake(uint256 amount) public nonReentrant whenNotPaused {
        require(amount >= minStakeAmount, "Amount below minimum stake");
        require(amount <= maxStakeAmount, "Amount above maximum stake");
        require(wcvToken.balanceOf(msg.sender) >= amount, "Insufficient WCV balance");
        
        // Transferir tokens al contrato
        wcvToken.transferFrom(msg.sender, address(this), amount);
        
        // Actualizar staker
        Staker storage staker = stakers[msg.sender];
        
        if (staker.stakedAmount == 0) {
            // Nuevo staker
            staker.stakingStartTime = block.timestamp;
            stakerAddresses.push(msg.sender);
        } else {
            // Staker existente - calcular recompensas pendientes
            _calculateRewards(msg.sender);
        }
        
        staker.stakedAmount = staker.stakedAmount.add(amount);
        staker.lastRewardTime = block.timestamp;
        
        // Verificar si califica como validador
        if (staker.stakedAmount >= validatorThreshold && !staker.isValidator) {
            staker.isValidator = true;
            staker.validatorStake = staker.stakedAmount;
            validators.push(msg.sender);
            emit ValidatorAdded(msg.sender, staker.stakedAmount, block.timestamp);
        }
        
        // Actualizar pool
        stakingPool.totalStaked = stakingPool.totalStaked.add(amount);
        
        emit Staked(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Retirar stake
     */
    function unstake(uint256 amount) public nonReentrant whenNotPaused {
        Staker storage staker = stakers[msg.sender];
        require(staker.stakedAmount >= amount, "Insufficient staked amount");
        require(block.timestamp >= staker.stakingStartTime.add(lockPeriod), "Lock period not ended");
        
        // Calcular recompensas pendientes
        _calculateRewards(msg.sender);
        
        // Actualizar staker
        staker.stakedAmount = staker.stakedAmount.sub(amount);
        
        // Verificar si sigue siendo validador
        if (staker.stakedAmount < validatorThreshold && staker.isValidator) {
            staker.isValidator = false;
            staker.validatorStake = 0;
            _removeValidator(msg.sender);
            emit ValidatorRemoved(msg.sender, block.timestamp);
        }
        
        // Transferir tokens de vuelta
        wcvToken.transfer(msg.sender, amount);
        
        // Actualizar pool
        stakingPool.totalStaked = stakingPool.totalStaked.sub(amount);
        
        emit Unstaked(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Reclamar recompensas
     */
    function claimRewards() public nonReentrant whenNotPaused {
        Staker storage staker = stakers[msg.sender];
        require(staker.stakedAmount > 0, "No stake found");
        
        _calculateRewards(msg.sender);
        
        uint256 rewards = staker.accumulatedRewards;
        require(rewards > 0, "No rewards to claim");
        
        staker.accumulatedRewards = 0;
        staker.totalRewardsClaimed = staker.totalRewardsClaimed.add(rewards);
        
        // Transferir recompensas
        wcvToken.transfer(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards, block.timestamp);
    }

    /**
     * @dev Stake y reclamar recompensas en una transacción
     */
    function stakeAndClaim(uint256 amount) public {
        if (amount > 0) {
            stake(amount);
        }
        claimRewards();
    }

    /**
     * @dev Distribuir recompensas (solo owner)
     */
    function distributeRewards(uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(wcvToken.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        stakingPool.totalRewards = stakingPool.totalRewards.add(amount);
        stakingPool.lastRewardTime = block.timestamp;
        
        emit RewardsDistributed(amount, block.timestamp);
    }

    /**
     * @dev Calcular recompensas pendientes
     */
    function _calculateRewards(address user) internal {
        Staker storage staker = stakers[user];
        
        if (staker.stakedAmount == 0) return;
        
        uint256 timeElapsed = block.timestamp.sub(staker.lastRewardTime);
        if (timeElapsed == 0) return;
        
        // Calcular recompensas basadas en APY
        uint256 rewards = staker.stakedAmount
            .mul(rewardRate)
            .mul(timeElapsed)
            .div(YEAR_IN_SECONDS)
            .div(100);
        
        staker.accumulatedRewards = staker.accumulatedRewards.add(rewards);
        staker.lastRewardTime = block.timestamp;
    }

    /**
     * @dev Remover validador de la lista
     */
    function _removeValidator(address validator) internal {
        for (uint256 i = 0; i < validators.length; i++) {
            if (validators[i] == validator) {
                validators[i] = validators[validators.length - 1];
                validators.pop();
                break;
            }
        }
    }

    /**
     * @dev Obtener información del staker
     */
    function getStakerInfo(address user) public view returns (
        uint256 stakedAmount,
        uint256 accumulatedRewards,
        uint256 totalRewardsClaimed,
        bool isValidator,
        uint256 validatorStake,
        uint256 stakingStartTime,
        uint256 lockEndTime,
        uint256 pendingRewards
    ) {
        Staker memory staker = stakers[user];
        
        stakedAmount = staker.stakedAmount;
        accumulatedRewards = staker.accumulatedRewards;
        totalRewardsClaimed = staker.totalRewardsClaimed;
        isValidator = staker.isValidator;
        validatorStake = staker.validatorStake;
        stakingStartTime = staker.stakingStartTime;
        lockEndTime = staker.stakingStartTime.add(lockPeriod);
        
        // Calcular recompensas pendientes
        if (staker.stakedAmount > 0) {
            uint256 timeElapsed = block.timestamp.sub(staker.lastRewardTime);
            pendingRewards = staker.stakedAmount
                .mul(rewardRate)
                .mul(timeElapsed)
                .div(YEAR_IN_SECONDS)
                .div(100)
                .add(staker.accumulatedRewards);
        }
    }

    /**
     * @dev Obtener información del pool
     */
    function getPoolInfo() public view returns (
        uint256 totalStaked,
        uint256 totalRewards,
        uint256 rewardRate,
        uint256 minStakeAmount,
        uint256 maxStakeAmount,
        uint256 lockPeriod,
        uint256 validatorThreshold,
        uint256 totalStakers,
        uint256 totalValidators
    ) {
        return (
            stakingPool.totalStaked,
            stakingPool.totalRewards,
            stakingPool.rewardRate,
            stakingPool.minStakeAmount,
            stakingPool.maxStakeAmount,
            stakingPool.lockPeriod,
            stakingPool.validatorThreshold,
            stakerAddresses.length,
            validators.length
        );
    }

    /**
     * @dev Obtener lista de validadores
     */
    function getValidators() public view returns (address[] memory) {
        return validators;
    }

    /**
     * @dev Obtener lista de stakers
     */
    function getStakers() public view returns (address[] memory) {
        return stakerAddresses;
    }

    /**
     * @dev Configurar parámetros (solo owner)
     */
    function setParameters(
        uint256 _rewardRate,
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount,
        uint256 _lockPeriod,
        uint256 _validatorThreshold
    ) public onlyOwner {
        require(_rewardRate <= 50, "Reward rate too high"); // Máximo 50% APY
        require(_minStakeAmount > 0, "Min stake amount must be greater than 0");
        require(_maxStakeAmount > _minStakeAmount, "Max stake amount must be greater than min");
        require(_lockPeriod <= 365 days, "Lock period too long");
        require(_validatorThreshold > 0, "Validator threshold must be greater than 0");
        
        rewardRate = _rewardRate;
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        lockPeriod = _lockPeriod;
        validatorThreshold = _validatorThreshold;
        
        stakingPool.rewardRate = _rewardRate;
        stakingPool.minStakeAmount = _minStakeAmount;
        stakingPool.maxStakeAmount = _maxStakeAmount;
        stakingPool.lockPeriod = _lockPeriod;
        stakingPool.validatorThreshold = _validatorThreshold;
    }

    /**
     * @dev Pausar staking (solo owner)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Reanudar staking (solo owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Obtener estadísticas de staking
     */
    function getStakingStats() public view returns (
        uint256 totalStakers_,
        uint256 totalValidators_,
        uint256 totalStaked_,
        uint256 totalRewardsDistributed_,
        uint256 averageStake_,
        uint256 topStakerAmount_
    ) {
        totalStakers_ = stakerAddresses.length;
        totalValidators_ = validators.length;
        totalStaked_ = stakingPool.totalStaked;
        totalRewardsDistributed_ = stakingPool.totalRewards;
        
        if (totalStakers_ > 0) {
            averageStake_ = totalStaked_.div(totalStakers_);
        }
        
        // Encontrar el staker con mayor cantidad
        for (uint256 i = 0; i < stakerAddresses.length; i++) {
            uint256 stake = stakers[stakerAddresses[i]].stakedAmount;
            if (stake > topStakerAmount_) {
                topStakerAmount_ = stake;
            }
        }
    }
} 