// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IMetaversoToken.sol";

/**
 * @title MetaversoDeFi
 * @dev Sistema DeFi completo para el metaverso con staking, liquidity pools y yield farming
 * @author Metaverso Crypto World Virtual 3D
 */
contract MetaversoDeFi is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    // ============ STRUCTS ============

    struct StakingPool {
        uint256 poolId;
        string name;
        string description;
        address tokenAddress;
        uint256 totalStaked;
        uint256 rewardRate;
        uint256 lastRewardTime;
        uint256 totalRewardsDistributed;
        bool isActive;
        uint256 minStakeAmount;
        uint256 maxStakeAmount;
        uint256 lockPeriod;
        uint256 creationDate;
    }

    struct UserStake {
        uint256 poolId;
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 totalRewards;
        bool isStaked;
        uint256 unlockTime;
    }

    struct LiquidityPool {
        uint256 poolId;
        string name;
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalSupply;
        uint256 fee;
        bool isActive;
        uint256 creationDate;
        mapping(address => uint256) balances;
    }

    struct YieldFarm {
        uint256 farmId;
        string name;
        string description;
        address stakingToken;
        address rewardToken;
        uint256 totalStaked;
        uint256 rewardPerSecond;
        uint256 lastRewardTime;
        uint256 totalRewardsDistributed;
        bool isActive;
        uint256 startTime;
        uint256 endTime;
        uint256 creationDate;
    }

    struct UserFarm {
        uint256 farmId;
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 totalRewards;
        bool isStaked;
    }

    struct FlashLoan {
        uint256 loanId;
        address borrower;
        address token;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        bool isRepaid;
    }

    // ============ STATE VARIABLES ============

    Counters.Counter private _poolIdCounter;
    Counters.Counter private _farmIdCounter;
    Counters.Counter private _loanIdCounter;

    // Token contracts
    IMetaversoToken public metaversoToken;
    address public wethAddress;

    // Mappings
    mapping(uint256 => StakingPool) public stakingPools;
    mapping(address => mapping(uint256 => UserStake)) public userStakes;
    mapping(uint256 => LiquidityPool) public liquidityPools;
    mapping(uint256 => YieldFarm) public yieldFarms;
    mapping(address => mapping(uint256 => UserFarm)) public userFarms;
    mapping(uint256 => FlashLoan) public flashLoans;
    mapping(address => uint256[]) public userStakePools;
    mapping(address => uint256[]) public userFarmPools;
    mapping(address => bool) public authorizedOperators;

    // Arrays
    uint256[] public activeStakingPools;
    uint256[] public activeLiquidityPools;
    uint256[] public activeYieldFarms;

    // Configuration
    uint256 public flashLoanFee = 30; // 0.3% (30 basis points)
    uint256 public liquidityFee = 30; // 0.3% (30 basis points)
    uint256 public maxFlashLoanAmount = 1000000 * 10**18; // 1M tokens
    uint256 public minStakeAmount = 100 * 10**18; // 100 tokens
    uint256 public maxStakeAmount = 1000000 * 10**18; // 1M tokens

    // Events
    event StakingPoolCreated(uint256 indexed poolId, string name, address indexed token);
    event TokensStaked(uint256 indexed poolId, address indexed user, uint256 amount);
    event TokensUnstaked(uint256 indexed poolId, address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(uint256 indexed poolId, address indexed user, uint256 amount);
    event LiquidityPoolCreated(uint256 indexed poolId, string name, address tokenA, address tokenB);
    event LiquidityAdded(uint256 indexed poolId, address indexed user, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(uint256 indexed poolId, address indexed user, uint256 amountA, uint256 amountB);
    event SwapExecuted(uint256 indexed poolId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event YieldFarmCreated(uint256 indexed farmId, string name, address indexed stakingToken, address indexed rewardToken);
    event FarmStaked(uint256 indexed farmId, address indexed user, uint256 amount);
    event FarmUnstaked(uint256 indexed farmId, address indexed user, uint256 amount, uint256 rewards);
    event FlashLoanExecuted(uint256 indexed loanId, address indexed borrower, address token, uint256 amount, uint256 fee);

    // ============ CONSTRUCTOR ============

    constructor(address _metaversoToken, address _wethAddress) {
        metaversoToken = IMetaversoToken(_metaversoToken);
        wethAddress = _wethAddress;
        
        _poolIdCounter.increment();
        _farmIdCounter.increment();
        _loanIdCounter.increment();
    }

    // ============ STAKING SYSTEM ============

    /**
     * @dev Create a new staking pool
     * @param name Pool name
     * @param description Pool description
     * @param tokenAddress Token address to stake
     * @param rewardRate Reward rate per second
     * @param minStakeAmount Minimum stake amount
     * @param maxStakeAmount Maximum stake amount
     * @param lockPeriod Lock period in seconds
     */
    function createStakingPool(
        string memory name,
        string memory description,
        address tokenAddress,
        uint256 rewardRate,
        uint256 minStakeAmount,
        uint256 maxStakeAmount,
        uint256 lockPeriod
    ) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        require(rewardRate > 0, "Invalid reward rate");
        require(minStakeAmount <= maxStakeAmount, "Invalid stake amounts");

        uint256 poolId = _poolIdCounter.current();
        _poolIdCounter.increment();

        StakingPool memory newPool = StakingPool({
            poolId: poolId,
            name: name,
            description: description,
            tokenAddress: tokenAddress,
            totalStaked: 0,
            rewardRate: rewardRate,
            lastRewardTime: block.timestamp,
            totalRewardsDistributed: 0,
            isActive: true,
            minStakeAmount: minStakeAmount,
            maxStakeAmount: maxStakeAmount,
            lockPeriod: lockPeriod,
            creationDate: block.timestamp
        });

        stakingPools[poolId] = newPool;
        activeStakingPools.push(poolId);

        emit StakingPoolCreated(poolId, name, tokenAddress);
    }

    /**
     * @dev Stake tokens in a pool
     * @param poolId Pool ID
     * @param amount Amount to stake
     */
    function stake(uint256 poolId, uint256 amount) external nonReentrant {
        StakingPool storage pool = stakingPools[poolId];
        require(pool.isActive, "Pool not active");
        require(amount >= pool.minStakeAmount, "Amount too low");
        require(amount <= pool.maxStakeAmount, "Amount too high");

        UserStake storage userStake = userStakes[msg.sender][poolId];
        
        // Claim existing rewards first
        if (userStake.isStaked) {
            _claimStakingRewards(poolId, msg.sender);
        }

        // Transfer tokens to contract
        IMetaversoToken(pool.tokenAddress).transferFrom(msg.sender, address(this), amount);

        // Update staking info
        userStake.poolId = poolId;
        userStake.amount = userStake.amount.add(amount);
        userStake.startTime = block.timestamp;
        userStake.lastRewardTime = block.timestamp;
        userStake.isStaked = true;
        userStake.unlockTime = block.timestamp.add(pool.lockPeriod);

        pool.totalStaked = pool.totalStaked.add(amount);

        // Add to user's pool list if not already there
        bool poolExists = false;
        for (uint256 i = 0; i < userStakePools[msg.sender].length; i++) {
            if (userStakePools[msg.sender][i] == poolId) {
                poolExists = true;
                break;
            }
        }
        if (!poolExists) {
            userStakePools[msg.sender].push(poolId);
        }

        emit TokensStaked(poolId, msg.sender, amount);
    }

    /**
     * @dev Unstake tokens from a pool
     * @param poolId Pool ID
     * @param amount Amount to unstake
     */
    function unstake(uint256 poolId, uint256 amount) external nonReentrant {
        StakingPool storage pool = stakingPools[poolId];
        UserStake storage userStake = userStakes[msg.sender][poolId];
        
        require(userStake.isStaked, "Not staked");
        require(userStake.amount >= amount, "Insufficient staked amount");
        require(block.timestamp >= userStake.unlockTime, "Lock period not ended");

        // Claim rewards first
        uint256 rewards = _calculateStakingRewards(poolId, msg.sender);
        _claimStakingRewards(poolId, msg.sender);

        // Update staking info
        userStake.amount = userStake.amount.sub(amount);
        if (userStake.amount == 0) {
            userStake.isStaked = false;
        }

        pool.totalStaked = pool.totalStaked.sub(amount);

        // Transfer tokens back to user
        IMetaversoToken(pool.tokenAddress).transfer(msg.sender, amount);

        emit TokensUnstaked(poolId, msg.sender, amount, rewards);
    }

    /**
     * @dev Claim staking rewards
     * @param poolId Pool ID
     */
    function claimStakingRewards(uint256 poolId) external nonReentrant {
        require(userStakes[msg.sender][poolId].isStaked, "Not staked");
        _claimStakingRewards(poolId, msg.sender);
    }

    /**
     * @dev Calculate pending staking rewards
     * @param poolId Pool ID
     * @param user User address
     */
    function calculateStakingRewards(uint256 poolId, address user) external view returns (uint256) {
        return _calculateStakingRewards(poolId, user);
    }

    // ============ LIQUIDITY POOLS ============

    /**
     * @dev Create a new liquidity pool
     * @param name Pool name
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param fee Pool fee (in basis points)
     */
    function createLiquidityPool(
        string memory name,
        address tokenA,
        address tokenB,
        uint256 fee
    ) external onlyOwner {
        require(tokenA != address(0) && tokenB != address(0), "Invalid token addresses");
        require(tokenA != tokenB, "Tokens must be different");
        require(fee <= 1000, "Fee too high"); // Max 10%

        uint256 poolId = _poolIdCounter.current();
        _poolIdCounter.increment();

        LiquidityPool storage newPool = liquidityPools[poolId];
        newPool.poolId = poolId;
        newPool.name = name;
        newPool.tokenA = tokenA;
        newPool.tokenB = tokenB;
        newPool.fee = fee;
        newPool.isActive = true;
        newPool.creationDate = block.timestamp;

        activeLiquidityPools.push(poolId);

        emit LiquidityPoolCreated(poolId, name, tokenA, tokenB);
    }

    /**
     * @dev Add liquidity to a pool
     * @param poolId Pool ID
     * @param amountA Amount of token A
     * @param amountB Amount of token B
     */
    function addLiquidity(
        uint256 poolId,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {
        LiquidityPool storage pool = liquidityPools[poolId];
        require(pool.isActive, "Pool not active");
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

        // Transfer tokens to contract
        IMetaversoToken(pool.tokenA).transferFrom(msg.sender, address(this), amountA);
        IMetaversoToken(pool.tokenB).transferFrom(msg.sender, address(this), amountB);

        // Calculate LP tokens to mint
        uint256 lpTokens;
        if (pool.totalSupply == 0) {
            lpTokens = sqrt(amountA.mul(amountB));
        } else {
            lpTokens = min(
                amountA.mul(pool.totalSupply).div(pool.reserveA),
                amountB.mul(pool.totalSupply).div(pool.reserveB)
            );
        }

        // Update reserves
        pool.reserveA = pool.reserveA.add(amountA);
        pool.reserveB = pool.reserveB.add(amountB);
        pool.totalSupply = pool.totalSupply.add(lpTokens);
        pool.balances[msg.sender] = pool.balances[msg.sender].add(lpTokens);

        emit LiquidityAdded(poolId, msg.sender, amountA, amountB);
    }

    /**
     * @dev Remove liquidity from a pool
     * @param poolId Pool ID
     * @param lpTokens Amount of LP tokens to burn
     */
    function removeLiquidity(
        uint256 poolId,
        uint256 lpTokens
    ) external nonReentrant {
        LiquidityPool storage pool = liquidityPools[poolId];
        require(pool.isActive, "Pool not active");
        require(pool.balances[msg.sender] >= lpTokens, "Insufficient LP tokens");

        // Calculate amounts to return
        uint256 amountA = lpTokens.mul(pool.reserveA).div(pool.totalSupply);
        uint256 amountB = lpTokens.mul(pool.reserveB).div(pool.totalSupply);

        // Update reserves and balances
        pool.reserveA = pool.reserveA.sub(amountA);
        pool.reserveB = pool.reserveB.sub(amountB);
        pool.totalSupply = pool.totalSupply.sub(lpTokens);
        pool.balances[msg.sender] = pool.balances[msg.sender].sub(lpTokens);

        // Transfer tokens back to user
        IMetaversoToken(pool.tokenA).transfer(msg.sender, amountA);
        IMetaversoToken(pool.tokenB).transfer(msg.sender, amountB);

        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB);
    }

    /**
     * @dev Swap tokens in a pool
     * @param poolId Pool ID
     * @param tokenIn Token to swap in
     * @param amountIn Amount to swap in
     * @param minAmountOut Minimum amount to receive
     */
    function swap(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant {
        LiquidityPool storage pool = liquidityPools[poolId];
        require(pool.isActive, "Pool not active");
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid token");

        address tokenOut = tokenIn == pool.tokenA ? pool.tokenB : pool.tokenA;
        uint256 reserveIn = tokenIn == pool.tokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = tokenIn == pool.tokenA ? pool.reserveB : pool.reserveA;

        // Calculate amount out
        uint256 amountOut = getAmountOut(amountIn, reserveIn, reserveOut, pool.fee);
        require(amountOut >= minAmountOut, "Insufficient output amount");

        // Transfer tokens
        IMetaversoToken(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IMetaversoToken(tokenOut).transfer(msg.sender, amountOut);

        // Update reserves
        if (tokenIn == pool.tokenA) {
            pool.reserveA = pool.reserveA.add(amountIn);
            pool.reserveB = pool.reserveB.sub(amountOut);
        } else {
            pool.reserveB = pool.reserveB.add(amountIn);
            pool.reserveA = pool.reserveA.sub(amountOut);
        }

        emit SwapExecuted(poolId, msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // ============ YIELD FARMING ============

    /**
     * @dev Create a new yield farm
     * @param name Farm name
     * @param description Farm description
     * @param stakingToken Token to stake
     * @param rewardToken Token to reward
     * @param rewardPerSecond Reward rate per second
     * @param duration Farm duration
     */
    function createYieldFarm(
        string memory name,
        string memory description,
        address stakingToken,
        address rewardToken,
        uint256 rewardPerSecond,
        uint256 duration
    ) external onlyOwner {
        require(stakingToken != address(0) && rewardToken != address(0), "Invalid token addresses");
        require(rewardPerSecond > 0, "Invalid reward rate");
        require(duration > 0, "Invalid duration");

        uint256 farmId = _farmIdCounter.current();
        _farmIdCounter.increment();

        YieldFarm memory newFarm = YieldFarm({
            farmId: farmId,
            name: name,
            description: description,
            stakingToken: stakingToken,
            rewardToken: rewardToken,
            totalStaked: 0,
            rewardPerSecond: rewardPerSecond,
            lastRewardTime: block.timestamp,
            totalRewardsDistributed: 0,
            isActive: true,
            startTime: block.timestamp,
            endTime: block.timestamp.add(duration),
            creationDate: block.timestamp
        });

        yieldFarms[farmId] = newFarm;
        activeYieldFarms.push(farmId);

        emit YieldFarmCreated(farmId, name, stakingToken, rewardToken);
    }

    /**
     * @dev Stake tokens in a yield farm
     * @param farmId Farm ID
     * @param amount Amount to stake
     */
    function farmStake(uint256 farmId, uint256 amount) external nonReentrant {
        YieldFarm storage farm = yieldFarms[farmId];
        require(farm.isActive, "Farm not active");
        require(block.timestamp <= farm.endTime, "Farm ended");
        require(amount > 0, "Amount must be greater than 0");

        UserFarm storage userFarm = userFarms[msg.sender][farmId];
        
        // Claim existing rewards first
        if (userFarm.isStaked) {
            _claimFarmingRewards(farmId, msg.sender);
        }

        // Transfer tokens to contract
        IMetaversoToken(farm.stakingToken).transferFrom(msg.sender, address(this), amount);

        // Update farming info
        userFarm.farmId = farmId;
        userFarm.amount = userFarm.amount.add(amount);
        userFarm.startTime = block.timestamp;
        userFarm.lastRewardTime = block.timestamp;
        userFarm.isStaked = true;

        farm.totalStaked = farm.totalStaked.add(amount);

        // Add to user's farm list if not already there
        bool farmExists = false;
        for (uint256 i = 0; i < userFarmPools[msg.sender].length; i++) {
            if (userFarmPools[msg.sender][i] == farmId) {
                farmExists = true;
                break;
            }
        }
        if (!farmExists) {
            userFarmPools[msg.sender].push(farmId);
        }

        emit FarmStaked(farmId, msg.sender, amount);
    }

    /**
     * @dev Unstake tokens from a yield farm
     * @param farmId Farm ID
     * @param amount Amount to unstake
     */
    function farmUnstake(uint256 farmId, uint256 amount) external nonReentrant {
        YieldFarm storage farm = yieldFarms[farmId];
        UserFarm storage userFarm = userFarms[msg.sender][farmId];
        
        require(userFarm.isStaked, "Not staked");
        require(userFarm.amount >= amount, "Insufficient staked amount");

        // Claim rewards first
        uint256 rewards = _calculateFarmingRewards(farmId, msg.sender);
        _claimFarmingRewards(farmId, msg.sender);

        // Update farming info
        userFarm.amount = userFarm.amount.sub(amount);
        if (userFarm.amount == 0) {
            userFarm.isStaked = false;
        }

        farm.totalStaked = farm.totalStaked.sub(amount);

        // Transfer tokens back to user
        IMetaversoToken(farm.stakingToken).transfer(msg.sender, amount);

        emit FarmUnstaked(farmId, msg.sender, amount, rewards);
    }

    /**
     * @dev Claim farming rewards
     * @param farmId Farm ID
     */
    function claimFarmingRewards(uint256 farmId) external nonReentrant {
        require(userFarms[msg.sender][farmId].isStaked, "Not staked");
        _claimFarmingRewards(farmId, msg.sender);
    }

    // ============ FLASH LOANS ============

    /**
     * @dev Execute a flash loan
     * @param token Token to borrow
     * @param amount Amount to borrow
     * @param data Additional data for callback
     */
    function flashLoan(
        address token,
        uint256 amount,
        bytes calldata data
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= maxFlashLoanAmount, "Amount exceeds maximum");

        uint256 fee = amount.mul(flashLoanFee).div(10000);
        uint256 totalRepay = amount.add(fee);

        // Record loan
        uint256 loanId = _loanIdCounter.current();
        _loanIdCounter.increment();
        
        flashLoans[loanId] = FlashLoan({
            loanId: loanId,
            borrower: msg.sender,
            token: token,
            amount: amount,
            fee: fee,
            timestamp: block.timestamp,
            isRepaid: false
        });

        // Transfer tokens to borrower
        IMetaversoToken(token).transfer(msg.sender, amount);

        // Call borrower's callback function
        (bool success, ) = msg.sender.call(data);
        require(success, "Flash loan callback failed");

        // Check repayment
        require(
            IMetaversoToken(token).balanceOf(address(this)) >= totalRepay,
            "Flash loan not repaid"
        );

        flashLoans[loanId].isRepaid = true;

        emit FlashLoanExecuted(loanId, msg.sender, token, amount, fee);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate staking rewards
     * @param poolId Pool ID
     * @param user User address
     */
    function _calculateStakingRewards(uint256 poolId, address user) internal view returns (uint256) {
        StakingPool storage pool = stakingPools[poolId];
        UserStake storage userStake = userStakes[user][poolId];
        
        if (!userStake.isStaked || pool.totalStaked == 0) {
            return 0;
        }

        uint256 timeStaked = block.timestamp.sub(userStake.lastRewardTime);
        uint256 userShare = userStake.amount.mul(1e18).div(pool.totalStaked);
        return pool.rewardRate.mul(timeStaked).mul(userShare).div(1e18);
    }

    /**
     * @dev Claim staking rewards
     * @param poolId Pool ID
     * @param user User address
     */
    function _claimStakingRewards(uint256 poolId, address user) internal {
        uint256 rewards = _calculateStakingRewards(poolId, user);
        if (rewards > 0) {
            StakingPool storage pool = stakingPools[poolId];
            UserStake storage userStake = userStakes[user][poolId];
            
            userStake.lastRewardTime = block.timestamp;
            userStake.totalRewards = userStake.totalRewards.add(rewards);
            pool.totalRewardsDistributed = pool.totalRewardsDistributed.add(rewards);

            // Mint rewards to user
            metaversoToken.mint(user, rewards);

            emit RewardsClaimed(poolId, user, rewards);
        }
    }

    /**
     * @dev Calculate farming rewards
     * @param farmId Farm ID
     * @param user User address
     */
    function _calculateFarmingRewards(uint256 farmId, address user) internal view returns (uint256) {
        YieldFarm storage farm = yieldFarms[farmId];
        UserFarm storage userFarm = userFarms[user][farmId];
        
        if (!userFarm.isStaked || farm.totalStaked == 0) {
            return 0;
        }

        uint256 timeStaked = block.timestamp.sub(userFarm.lastRewardTime);
        uint256 userShare = userFarm.amount.mul(1e18).div(farm.totalStaked);
        return farm.rewardPerSecond.mul(timeStaked).mul(userShare).div(1e18);
    }

    /**
     * @dev Claim farming rewards
     * @param farmId Farm ID
     * @param user User address
     */
    function _claimFarmingRewards(uint256 farmId, address user) internal {
        uint256 rewards = _calculateFarmingRewards(farmId, user);
        if (rewards > 0) {
            YieldFarm storage farm = yieldFarms[farmId];
            UserFarm storage userFarm = userFarms[user][farmId];
            
            userFarm.lastRewardTime = block.timestamp;
            userFarm.totalRewards = userFarm.totalRewards.add(rewards);
            farm.totalRewardsDistributed = farm.totalRewardsDistributed.add(rewards);

            // Transfer rewards to user
            IMetaversoToken(farm.rewardToken).transfer(user, rewards);
        }
    }

    /**
     * @dev Calculate amount out for swap
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 fee
    ) internal pure returns (uint256) {
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        
        uint256 amountInWithFee = amountIn.mul(10000 - fee);
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(10000).add(amountInWithFee);
        return numerator.div(denominator);
    }

    /**
     * @dev Square root function
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /**
     * @dev Minimum function
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update configuration
     */
    function updateConfiguration(
        uint256 newFlashLoanFee,
        uint256 newLiquidityFee,
        uint256 newMaxFlashLoanAmount,
        uint256 newMinStakeAmount,
        uint256 newMaxStakeAmount
    ) external onlyOwner {
        flashLoanFee = newFlashLoanFee;
        liquidityFee = newLiquidityFee;
        maxFlashLoanAmount = newMaxFlashLoanAmount;
        minStakeAmount = newMinStakeAmount;
        maxStakeAmount = newMaxStakeAmount;
    }

    /**
     * @dev Add authorized operator
     */
    function addAuthorizedOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = true;
    }

    /**
     * @dev Remove authorized operator
     */
    function removeAuthorizedOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = false;
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalStakingPools,
        uint256 totalLiquidityPools,
        uint256 totalYieldFarms,
        uint256 activeStakingPoolsCount,
        uint256 activeLiquidityPoolsCount,
        uint256 activeYieldFarmsCount
    ) {
        totalStakingPools = _poolIdCounter.current() - 1;
        totalLiquidityPools = _poolIdCounter.current() - 1;
        totalYieldFarms = _farmIdCounter.current() - 1;
        activeStakingPoolsCount = activeStakingPools.length;
        activeLiquidityPoolsCount = activeLiquidityPools.length;
        activeYieldFarmsCount = activeYieldFarms.length;
    }

    /**
     * @dev Get user's staking pools
     */
    function getUserStakingPools(address user) external view returns (uint256[] memory) {
        return userStakePools[user];
    }

    /**
     * @dev Get user's farming pools
     */
    function getUserFarmingPools(address user) external view returns (uint256[] memory) {
        return userFarmPools[user];
    }

    /**
     * @dev Get user stake information
     */
    function getUserStake(address user, uint256 poolId) external view returns (UserStake memory) {
        return userStakes[user][poolId];
    }

    /**
     * @dev Get user farm information
     */
    function getUserFarm(address user, uint256 farmId) external view returns (UserFarm memory) {
        return userFarms[user][farmId];
    }

    receive() external payable {
        // Accept ETH transfers
    }
} 