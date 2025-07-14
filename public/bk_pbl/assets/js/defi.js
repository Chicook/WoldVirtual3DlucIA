/**
 * Metaverso DeFi System
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoDeFi {
    constructor() {
        this.isInitialized = false;
        this.currentTab = 'staking';
        this.currentPool = null;
        this.userStakes = new Map();
        this.userRewards = new Map();
        
        // DeFi data
        this.stakingPools = new Map();
        this.liquidityPools = new Map();
        this.yieldFarms = new Map();
        this.swapPairs = new Map();
        
        // DeFi state
        this.state = {
            isLoading: false,
            isStaking: false,
            isUnstaking: false,
            isClaiming: false,
            isSwapping: false
        };
        
        // DeFi options
        this.options = {
            autoRefresh: true,
            refreshInterval: 15000, // 15 seconds
            enableNotifications: true,
            enableAutoCompound: false,
            slippageTolerance: 0.5 // 0.5%
        };
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Refresh timer
        this.refreshTimer = null;
        
        // User balances
        this.userBalances = {
            meta: 0,
            eth: 0,
            usdc: 0,
            usdt: 0
        };
    }

    /**
     * Initialize DeFi system
     */
    async initialize() {
        try {
            console.log('💰 Inicializando sistema DeFi...');
            
            // Setup DeFi structure
            this.setupDeFi();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup auto refresh
            this.setupAutoRefresh();
            
            // Setup notifications
            this.setupNotifications();
            
            this.isInitialized = true;
            console.log('✅ Sistema DeFi inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema DeFi:', error);
            throw error;
        }
    }

    /**
     * Setup DeFi structure
     */
    setupDeFi() {
        // Setup tabs
        this.setupTabs();
        
        // Setup forms
        this.setupForms();
        
        // Setup charts
        this.setupCharts();
    }

    /**
     * Setup tabs
     */
    setupTabs() {
        const tabButtons = document.querySelectorAll('.defi-tabs .tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }

    /**
     * Setup forms
     */
    setupForms() {
        // Staking form
        this.setupStakingForm();
        
        // Swap form
        this.setupSwapForm();
        
        // Liquidity form
        this.setupLiquidityForm();
    }

    /**
     * Setup staking form
     */
    setupStakingForm() {
        const stakeForm = document.getElementById('stake-form');
        if (stakeForm) {
            stakeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStake();
            });
        }
        
        const unstakeForm = document.getElementById('unstake-form');
        if (unstakeForm) {
            unstakeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUnstake();
            });
        }
    }

    /**
     * Setup swap form
     */
    setupSwapForm() {
        const swapForm = document.getElementById('swap-form');
        if (swapForm) {
            swapForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSwap();
            });
        }
    }

    /**
     * Setup liquidity form
     */
    setupLiquidityForm() {
        const addLiquidityForm = document.getElementById('add-liquidity-form');
        if (addLiquidityForm) {
            addLiquidityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddLiquidity();
            });
        }
    }

    /**
     * Setup charts
     */
    setupCharts() {
        // This would setup price charts and analytics
        // For now, we'll use placeholder charts
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Pool interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.pool-card')) {
                const poolId = e.target.getAttribute('data-pool-id');
                this.selectPool(poolId);
            }
            
            if (e.target.matches('.claim-rewards')) {
                const poolId = e.target.getAttribute('data-pool-id');
                this.claimRewards(poolId);
            }
        });
        
        // Balance updates
        document.addEventListener('input', (e) => {
            if (e.target.matches('.stake-amount')) {
                this.updateStakePreview();
            }
            
            if (e.target.matches('.swap-amount')) {
                this.updateSwapPreview();
            }
        });
    }

    /**
     * Setup auto refresh
     */
    setupAutoRefresh() {
        if (this.options.autoRefresh) {
            this.refreshTimer = setInterval(() => {
                this.refreshData();
            }, this.options.refreshInterval);
        }
    }

    /**
     * Setup notifications
     */
    setupNotifications() {
        if (this.options.enableNotifications) {
            // Setup notification preferences
            this.setupNotificationPreferences();
        }
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            this.state.isLoading = true;
            
            // Load staking pools
            await this.loadStakingPools();
            
            // Load liquidity pools
            await this.loadLiquidityPools();
            
            // Load yield farms
            await this.loadYieldFarms();
            
            // Load swap pairs
            await this.loadSwapPairs();
            
            // Load user data if connected
            if (window.metaverso && window.metaverso.isWalletConnected) {
                await this.loadUserData();
            }
            
            // Render initial view
            this.renderCurrentTab();
            
        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Load staking pools
     */
    async loadStakingPools() {
        try {
            // This would load from blockchain/API
            // For now, we'll use mock data
            const mockPools = [
                {
                    id: 1,
                    name: 'META Staking Pool',
                    description: 'Stake META tokens para ganar recompensas',
                    token: 'META',
                    apy: 12.5,
                    totalStaked: 1000000,
                    userStaked: 0,
                    rewards: 0,
                    minStake: 100,
                    maxStake: 1000000,
                    lockPeriod: 0
                },
                {
                    id: 2,
                    name: 'LP Staking Pool',
                    description: 'Stake LP tokens para ganar META',
                    token: 'META-ETH LP',
                    apy: 18.2,
                    totalStaked: 500000,
                    userStaked: 0,
                    rewards: 0,
                    minStake: 50,
                    maxStake: 500000,
                    lockPeriod: 7
                }
            ];
            
            mockPools.forEach(pool => {
                this.stakingPools.set(pool.id, pool);
            });
            
        } catch (error) {
            console.error('❌ Error cargando pools de staking:', error);
        }
    }

    /**
     * Load liquidity pools
     */
    async loadLiquidityPools() {
        try {
            // This would load from blockchain/API
            // For now, we'll use mock data
            const mockLiquidityPools = [
                {
                    id: 1,
                    name: 'META/ETH',
                    token0: 'META',
                    token1: 'ETH',
                    reserve0: 1000000,
                    reserve1: 500,
                    totalSupply: 1000000,
                    userLiquidity: 0,
                    fee: 0.3
                }
            ];
            
            mockLiquidityPools.forEach(pool => {
                this.liquidityPools.set(pool.id, pool);
            });
            
        } catch (error) {
            console.error('❌ Error cargando pools de liquidez:', error);
        }
    }

    /**
     * Load yield farms
     */
    async loadYieldFarms() {
        try {
            // This would load from blockchain/API
            // For now, we'll use mock data
            const mockYieldFarms = [
                {
                    id: 1,
                    name: 'META Farm',
                    description: 'Farm META tokens',
                    token: 'META',
                    apy: 25.0,
                    totalStaked: 2000000,
                    userStaked: 0,
                    rewards: 0
                }
            ];
            
            mockYieldFarms.forEach(farm => {
                this.yieldFarms.set(farm.id, farm);
            });
            
        } catch (error) {
            console.error('❌ Error cargando yield farms:', error);
        }
    }

    /**
     * Load swap pairs
     */
    async loadSwapPairs() {
        try {
            // This would load from blockchain/API
            // For now, we'll use mock data
            const mockSwapPairs = [
                {
                    id: 1,
                    token0: 'META',
                    token1: 'ETH',
                    reserve0: 1000000,
                    reserve1: 500,
                    price: 0.0005
                },
                {
                    id: 2,
                    token0: 'META',
                    token1: 'USDC',
                    reserve0: 1000000,
                    reserve1: 1000000,
                    price: 1.0
                }
            ];
            
            mockSwapPairs.forEach(pair => {
                this.swapPairs.set(pair.id, pair);
            });
            
        } catch (error) {
            console.error('❌ Error cargando swap pairs:', error);
        }
    }

    /**
     * Load user data
     */
    async loadUserData() {
        try {
            // Load user balances
            await this.loadUserBalances();
            
            // Load user stakes
            await this.loadUserStakes();
            
            // Load user rewards
            await this.loadUserRewards();
            
        } catch (error) {
            console.error('❌ Error cargando datos del usuario:', error);
        }
    }

    /**
     * Load user balances
     */
    async loadUserBalances() {
        try {
            // This would load from blockchain
            // For now, we'll use mock data
            this.userBalances = {
                meta: 1000,
                eth: 0.5,
                usdc: 500,
                usdt: 500
            };
            
        } catch (error) {
            console.error('❌ Error cargando balances del usuario:', error);
        }
    }

    /**
     * Load user stakes
     */
    async loadUserStakes() {
        try {
            // This would load from blockchain
            // For now, we'll use mock data
            const mockStakes = [
                {
                    poolId: 1,
                    amount: 500,
                    startTime: Date.now() - 86400000, // 1 day ago
                    rewards: 25.5
                }
            ];
            
            mockStakes.forEach(stake => {
                this.userStakes.set(stake.poolId, stake);
            });
            
        } catch (error) {
            console.error('❌ Error cargando stakes del usuario:', error);
        }
    }

    /**
     * Load user rewards
     */
    async loadUserRewards() {
        try {
            // This would load from blockchain
            // For now, we'll use mock data
            const mockRewards = [
                {
                    poolId: 1,
                    amount: 25.5,
                    token: 'META'
                }
            ];
            
            mockRewards.forEach(reward => {
                this.userRewards.set(reward.poolId, reward);
            });
            
        } catch (error) {
            console.error('❌ Error cargando recompensas del usuario:', error);
        }
    }

    /**
     * Switch tab
     */
    switchTab(tab) {
        if (this.currentTab === tab) return;
        
        // Update tab buttons
        document.querySelectorAll('.defi-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update current tab
        this.currentTab = tab;
        
        // Render new tab
        this.renderCurrentTab();
        
        // Emit tab change event
        this.emit('tabChanged', tab);
    }

    /**
     * Render current tab
     */
    renderCurrentTab() {
        switch (this.currentTab) {
            case 'staking':
                this.renderStakingPools();
                break;
            case 'farming':
                this.renderYieldFarms();
                break;
            case 'liquidity':
                this.renderLiquidityPools();
                break;
            case 'swap':
                this.renderSwapInterface();
                break;
        }
    }

    /**
     * Render staking pools
     */
    renderStakingPools() {
        const container = document.getElementById('staking-pools');
        if (!container) return;
        
        const pools = Array.from(this.stakingPools.values());
        
        container.innerHTML = pools.map(pool => {
            const userStake = this.userStakes.get(pool.id);
            const userReward = this.userRewards.get(pool.id);
            
            return `
                <div class="card pool-card" data-pool-id="${pool.id}">
                    <div class="pool-header">
                        <h3>${pool.name}</h3>
                        <div class="pool-apy">${pool.apy}% APY</div>
                    </div>
                    <div class="pool-content">
                        <p>${pool.description}</p>
                        <div class="pool-stats">
                            <div class="stat">
                                <span class="stat-label">Total Staked:</span>
                                <span class="stat-value">${this.formatNumber(pool.totalStaked)} ${pool.token}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Your Stake:</span>
                                <span class="stat-value">${this.formatNumber(userStake ? userStake.amount : 0)} ${pool.token}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Your Rewards:</span>
                                <span class="stat-value">${this.formatNumber(userReward ? userReward.amount : 0)} META</span>
                            </div>
                        </div>
                        <div class="pool-actions">
                            <button class="btn btn-primary" onclick="metaverso.defi.selectPool(${pool.id})">
                                ${userStake ? 'Manage Stake' : 'Stake'}
                            </button>
                            ${userReward && userReward.amount > 0 ? `
                                <button class="btn btn-secondary claim-rewards" data-pool-id="${pool.id}">
                                    Claim Rewards
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render yield farms
     */
    renderYieldFarms() {
        const container = document.getElementById('yield-farms');
        if (!container) return;
        
        const farms = Array.from(this.yieldFarms.values());
        
        container.innerHTML = farms.map(farm => {
            const userStake = this.userStakes.get(farm.id);
            const userReward = this.userRewards.get(farm.id);
            
            return `
                <div class="card farm-card" data-farm-id="${farm.id}">
                    <div class="farm-header">
                        <h3>${farm.name}</h3>
                        <div class="farm-apy">${farm.apy}% APY</div>
                    </div>
                    <div class="farm-content">
                        <p>${farm.description}</p>
                        <div class="farm-stats">
                            <div class="stat">
                                <span class="stat-label">Total Staked:</span>
                                <span class="stat-value">${this.formatNumber(farm.totalStaked)} ${farm.token}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Your Stake:</span>
                                <span class="stat-value">${this.formatNumber(userStake ? userStake.amount : 0)} ${farm.token}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Your Rewards:</span>
                                <span class="stat-value">${this.formatNumber(userReward ? userReward.amount : 0)} META</span>
                            </div>
                        </div>
                        <div class="farm-actions">
                            <button class="btn btn-primary" onclick="metaverso.defi.selectFarm(${farm.id})">
                                ${userStake ? 'Manage Farm' : 'Start Farming'}
                            </button>
                            ${userReward && userReward.amount > 0 ? `
                                <button class="btn btn-secondary claim-rewards" data-farm-id="${farm.id}">
                                    Claim Rewards
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render liquidity pools
     */
    renderLiquidityPools() {
        const container = document.getElementById('liquidity-pools');
        if (!container) return;
        
        const pools = Array.from(this.liquidityPools.values());
        
        container.innerHTML = pools.map(pool => {
            return `
                <div class="card liquidity-card" data-pool-id="${pool.id}">
                    <div class="liquidity-header">
                        <h3>${pool.name}</h3>
                        <div class="liquidity-fee">${pool.fee}% Fee</div>
                    </div>
                    <div class="liquidity-content">
                        <div class="liquidity-stats">
                            <div class="stat">
                                <span class="stat-label">${pool.token0} Reserve:</span>
                                <span class="stat-value">${this.formatNumber(pool.reserve0)}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">${pool.token1} Reserve:</span>
                                <span class="stat-value">${this.formatNumber(pool.reserve1)}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Your Liquidity:</span>
                                <span class="stat-value">${this.formatNumber(pool.userLiquidity)} LP</span>
                            </div>
                        </div>
                        <div class="liquidity-actions">
                            <button class="btn btn-primary" onclick="metaverso.defi.selectLiquidityPool(${pool.id})">
                                ${pool.userLiquidity > 0 ? 'Manage LP' : 'Add Liquidity'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render swap interface
     */
    renderSwapInterface() {
        const container = document.getElementById('swap-interface');
        if (!container) return;
        
        container.innerHTML = `
            <div class="swap-container">
                <div class="swap-form">
                    <div class="swap-input">
                        <label>You Pay</label>
                        <div class="input-group">
                            <input type="number" class="swap-amount" placeholder="0.0" min="0">
                            <select class="token-select">
                                <option value="META">META</option>
                                <option value="ETH">ETH</option>
                                <option value="USDC">USDC</option>
                                <option value="USDT">USDT</option>
                            </select>
                        </div>
                        <div class="balance">Balance: ${this.formatNumber(this.userBalances.meta)} META</div>
                    </div>
                    
                    <div class="swap-arrow">↓</div>
                    
                    <div class="swap-input">
                        <label>You Receive</label>
                        <div class="input-group">
                            <input type="number" class="swap-receive" placeholder="0.0" readonly>
                            <select class="token-select">
                                <option value="ETH">ETH</option>
                                <option value="META">META</option>
                                <option value="USDC">USDC</option>
                                <option value="USDT">USDT</option>
                            </select>
                        </div>
                        <div class="swap-info">
                            <div>Price Impact: < 0.1%</div>
                            <div>Slippage: ${this.options.slippageTolerance}%</div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary btn-large swap-button" onclick="metaverso.defi.handleSwap()">
                        Swap
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Select pool
     */
    selectPool(poolId) {
        const pool = this.stakingPools.get(parseInt(poolId));
        if (!pool) return;
        
        this.currentPool = pool;
        
        // Show pool details modal
        this.showPoolDetails(pool);
    }

    /**
     * Show pool details
     */
    showPoolDetails(pool) {
        const userStake = this.userStakes.get(pool.id);
        const userReward = this.userRewards.get(pool.id);
        
        // Show modal with pool details
        if (window.metaverso && window.metaverso.ui) {
            window.metaverso.ui.showModal('pool-modal');
            
            // Update modal content
            const modal = document.getElementById('pool-modal');
            if (modal) {
                modal.innerHTML = `
                    <div class="modal-header">
                        <h3>${pool.name}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-content">
                        <div class="pool-details">
                            <div class="detail-item">
                                <span class="label">APY:</span>
                                <span class="value">${pool.apy}%</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Total Staked:</span>
                                <span class="value">${this.formatNumber(pool.totalStaked)} ${pool.token}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Your Stake:</span>
                                <span class="value">${this.formatNumber(userStake ? userStake.amount : 0)} ${pool.token}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Your Rewards:</span>
                                <span class="value">${this.formatNumber(userReward ? userReward.amount : 0)} META</span>
                            </div>
                        </div>
                        
                        ${userStake ? `
                            <div class="unstake-form">
                                <h4>Unstake</h4>
                                <form id="unstake-form">
                                    <input type="number" class="unstake-amount" placeholder="Amount to unstake" max="${userStake.amount}">
                                    <button type="submit" class="btn btn-secondary">Unstake</button>
                                </form>
                            </div>
                        ` : `
                            <div class="stake-form">
                                <h4>Stake</h4>
                                <form id="stake-form">
                                    <input type="number" class="stake-amount" placeholder="Amount to stake" max="${this.userBalances.meta}">
                                    <button type="submit" class="btn btn-primary">Stake</button>
                                </form>
                            </div>
                        `}
                        
                        ${userReward && userReward.amount > 0 ? `
                            <div class="claim-rewards">
                                <button class="btn btn-success claim-rewards-btn" data-pool-id="${pool.id}">
                                    Claim ${this.formatNumber(userReward.amount)} META
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }
    }

    /**
     * Handle stake
     */
    async handleStake() {
        const amountInput = document.querySelector('.stake-amount');
        if (!amountInput || !this.currentPool) return;
        
        const amount = parseFloat(amountInput.value);
        if (!amount || amount <= 0) {
            this.showNotification('Ingresa una cantidad válida', 'error');
            return;
        }
        
        if (amount > this.userBalances.meta) {
            this.showNotification('Saldo insuficiente', 'error');
            return;
        }
        
        try {
            this.state.isStaking = true;
            
            // Execute stake
            await this.executeStake(this.currentPool.id, amount);
            
            // Clear form
            amountInput.value = '';
            
            // Refresh data
            await this.refreshData();
            
        } catch (error) {
            console.error('❌ Error haciendo stake:', error);
            this.showNotification('Error al hacer stake', 'error');
        } finally {
            this.state.isStaking = false;
        }
    }

    /**
     * Handle unstake
     */
    async handleUnstake() {
        const amountInput = document.querySelector('.unstake-amount');
        if (!amountInput || !this.currentPool) return;
        
        const amount = parseFloat(amountInput.value);
        if (!amount || amount <= 0) {
            this.showNotification('Ingresa una cantidad válida', 'error');
            return;
        }
        
        const userStake = this.userStakes.get(this.currentPool.id);
        if (!userStake || amount > userStake.amount) {
            this.showNotification('Cantidad inválida', 'error');
            return;
        }
        
        try {
            this.state.isUnstaking = true;
            
            // Execute unstake
            await this.executeUnstake(this.currentPool.id, amount);
            
            // Clear form
            amountInput.value = '';
            
            // Refresh data
            await this.refreshData();
            
        } catch (error) {
            console.error('❌ Error haciendo unstake:', error);
            this.showNotification('Error al hacer unstake', 'error');
        } finally {
            this.state.isUnstaking = false;
        }
    }

    /**
     * Handle swap
     */
    async handleSwap() {
        const amountInput = document.querySelector('.swap-amount');
        const receiveInput = document.querySelector('.swap-receive');
        const tokenFromSelect = document.querySelector('.token-select');
        const tokenToSelect = document.querySelectorAll('.token-select')[1];
        
        if (!amountInput || !receiveInput || !tokenFromSelect || !tokenToSelect) return;
        
        const amount = parseFloat(amountInput.value);
        const tokenFrom = tokenFromSelect.value;
        const tokenTo = tokenToSelect.value;
        
        if (!amount || amount <= 0) {
            this.showNotification('Ingresa una cantidad válida', 'error');
            return;
        }
        
        if (amount > this.userBalances[tokenFrom.toLowerCase()]) {
            this.showNotification('Saldo insuficiente', 'error');
            return;
        }
        
        try {
            this.state.isSwapping = true;
            
            // Execute swap
            await this.executeSwap(tokenFrom, tokenTo, amount);
            
            // Clear form
            amountInput.value = '';
            receiveInput.value = '';
            
            // Refresh data
            await this.refreshData();
            
        } catch (error) {
            console.error('❌ Error haciendo swap:', error);
            this.showNotification('Error al hacer swap', 'error');
        } finally {
            this.state.isSwapping = false;
        }
    }

    /**
     * Execute stake
     */
    async executeStake(poolId, amount) {
        // This would execute the stake on the blockchain
        // For now, we'll simulate it
        
        this.showNotification('Procesando stake...', 'info');
        
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update user stakes
        const currentStake = this.userStakes.get(poolId) || { amount: 0, startTime: Date.now(), rewards: 0 };
        this.userStakes.set(poolId, {
            ...currentStake,
            amount: currentStake.amount + amount
        });
        
        // Update user balance
        this.userBalances.meta -= amount;
        
        this.showNotification('¡Stake realizado exitosamente!', 'success');
        
        // Emit stake event
        this.emit('staked', { poolId, amount });
    }

    /**
     * Execute unstake
     */
    async executeUnstake(poolId, amount) {
        // This would execute the unstake on the blockchain
        // For now, we'll simulate it
        
        this.showNotification('Procesando unstake...', 'info');
        
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update user stakes
        const currentStake = this.userStakes.get(poolId);
        if (currentStake) {
            currentStake.amount -= amount;
            if (currentStake.amount <= 0) {
                this.userStakes.delete(poolId);
            }
        }
        
        // Update user balance
        this.userBalances.meta += amount;
        
        this.showNotification('¡Unstake realizado exitosamente!', 'success');
        
        // Emit unstake event
        this.emit('unstaked', { poolId, amount });
    }

    /**
     * Execute swap
     */
    async executeSwap(tokenFrom, tokenTo, amount) {
        // This would execute the swap on the blockchain
        // For now, we'll simulate it
        
        this.showNotification('Procesando swap...', 'info');
        
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Calculate received amount (simplified)
        const receivedAmount = amount * 0.995; // 0.5% fee
        
        // Update user balances
        this.userBalances[tokenFrom.toLowerCase()] -= amount;
        this.userBalances[tokenTo.toLowerCase()] += receivedAmount;
        
        this.showNotification('¡Swap realizado exitosamente!', 'success');
        
        // Emit swap event
        this.emit('swapped', { tokenFrom, tokenTo, amount, receivedAmount });
    }

    /**
     * Claim rewards
     */
    async claimRewards(poolId) {
        const reward = this.userRewards.get(parseInt(poolId));
        if (!reward || reward.amount <= 0) return;
        
        try {
            this.state.isClaiming = true;
            
            // Execute claim
            await this.executeClaim(poolId, reward.amount);
            
            // Refresh data
            await this.refreshData();
            
        } catch (error) {
            console.error('❌ Error reclamando recompensas:', error);
            this.showNotification('Error al reclamar recompensas', 'error');
        } finally {
            this.state.isClaiming = false;
        }
    }

    /**
     * Execute claim
     */
    async executeClaim(poolId, amount) {
        // This would execute the claim on the blockchain
        // For now, we'll simulate it
        
        this.showNotification('Procesando claim...', 'info');
        
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update user rewards
        this.userRewards.delete(poolId);
        
        // Update user balance
        this.userBalances.meta += amount;
        
        this.showNotification('¡Recompensas reclamadas exitosamente!', 'success');
        
        // Emit claim event
        this.emit('claimed', { poolId, amount });
    }

    /**
     * Update stake preview
     */
    updateStakePreview() {
        const amountInput = document.querySelector('.stake-amount');
        if (!amountInput || !this.currentPool) return;
        
        const amount = parseFloat(amountInput.value) || 0;
        const apy = this.currentPool.apy;
        const dailyReward = (amount * apy) / 365;
        const monthlyReward = dailyReward * 30;
        const yearlyReward = amount * (apy / 100);
        
        // Update preview display
        const preview = document.getElementById('stake-preview');
        if (preview) {
            preview.innerHTML = `
                <div class="preview-item">
                    <span>Daily Reward:</span>
                    <span>${this.formatNumber(dailyReward)} META</span>
                </div>
                <div class="preview-item">
                    <span>Monthly Reward:</span>
                    <span>${this.formatNumber(monthlyReward)} META</span>
                </div>
                <div class="preview-item">
                    <span>Yearly Reward:</span>
                    <span>${this.formatNumber(yearlyReward)} META</span>
                </div>
            `;
        }
    }

    /**
     * Update swap preview
     */
    updateSwapPreview() {
        const amountInput = document.querySelector('.swap-amount');
        const receiveInput = document.querySelector('.swap-receive');
        const tokenFromSelect = document.querySelector('.token-select');
        const tokenToSelect = document.querySelectorAll('.token-select')[1];
        
        if (!amountInput || !receiveInput || !tokenFromSelect || !tokenToSelect) return;
        
        const amount = parseFloat(amountInput.value) || 0;
        const tokenFrom = tokenFromSelect.value;
        const tokenTo = tokenToSelect.value;
        
        // Calculate received amount (simplified)
        const receivedAmount = amount * 0.995; // 0.5% fee
        
        receiveInput.value = receivedAmount.toFixed(6);
    }

    /**
     * Refresh data
     */
    async refreshData() {
        try {
            await this.loadStakingPools();
            await this.loadLiquidityPools();
            await this.loadYieldFarms();
            await this.loadSwapPairs();
            
            if (window.metaverso && window.metaverso.isWalletConnected) {
                await this.loadUserData();
            }
            
            // Re-render current tab
            this.renderCurrentTab();
            
        } catch (error) {
            console.error('❌ Error refrescando datos:', error);
        }
    }

    /**
     * Format number
     */
    formatNumber(number) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
        }).format(number);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (window.metaverso && window.metaverso.ui) {
            window.metaverso.ui.showNotification(message, type);
        }
    }

    /**
     * Setup notification preferences
     */
    setupNotificationPreferences() {
        // This would setup notification preferences
    }

    /**
     * Get current tab
     */
    getCurrentTab() {
        return this.currentTab;
    }

    /**
     * Get staking pools
     */
    getStakingPools() {
        return Array.from(this.stakingPools.values());
    }

    /**
     * Get liquidity pools
     */
    getLiquidityPools() {
        return Array.from(this.liquidityPools.values());
    }

    /**
     * Get yield farms
     */
    getYieldFarms() {
        return Array.from(this.yieldFarms.values());
    }

    /**
     * Get user balances
     */
    getUserBalances() {
        return { ...this.userBalances };
    }

    /**
     * Get user stakes
     */
    getUserStakes() {
        return Array.from(this.userStakes.values());
    }

    /**
     * Get user rewards
     */
    getUserRewards() {
        return Array.from(this.userRewards.values());
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }

    /**
     * Dispose
     */
    dispose() {
        // Clear refresh timer
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // Clear data
        this.stakingPools.clear();
        this.liquidityPools.clear();
        this.yieldFarms.clear();
        this.swapPairs.clear();
        this.userStakes.clear();
        this.userRewards.clear();
        
        // Clear event listeners
        this.eventListeners.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoDeFi;
} 