/**
 * Metaverso Web3 Integration
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoWeb3 {
    constructor() {
        this.web3 = null;
        this.provider = null;
        this.isConnected = false;
        this.currentAccount = null;
        this.chainId = null;
        this.networkName = null;
        
        // Supported networks
        this.supportedNetworks = {
            1: 'Ethereum Mainnet',
            137: 'Polygon',
            56: 'BSC',
            42161: 'Arbitrum One',
            10: 'Optimism',
            8453: 'Base'
        };
        
        // Contract ABIs (simplified for demo)
        this.contractABIs = {
            core: [],
            token: [],
            nft: [],
            defi: [],
            governance: []
        };
    }

    /**
     * Initialize Web3
     */
    async initialize() {
        try {
            console.log('🔗 Inicializando Web3...');
            
            // Check if Web3 is available
            if (typeof window.ethereum !== 'undefined') {
                this.provider = window.ethereum;
                this.web3 = new Web3(this.provider);
                
                // Setup event listeners
                this.setupEventListeners();
                
                // Check if already connected
                const accounts = await this.provider.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.handleAccountsChanged(accounts);
                }
                
                console.log('✅ Web3 inicializado con MetaMask');
            } else if (typeof window.web3 !== 'undefined') {
                this.web3 = new Web3(window.web3.currentProvider);
                console.log('✅ Web3 inicializado con Web3 Provider');
            } else {
                console.warn('⚠️ No se detectó Web3 Provider');
                this.showWeb3Error();
            }
            
        } catch (error) {
            console.error('❌ Error inicializando Web3:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.provider) {
            // Account changes
            this.provider.on('accountsChanged', (accounts) => {
                this.handleAccountsChanged(accounts);
            });
            
            // Chain changes
            this.provider.on('chainChanged', (chainId) => {
                this.handleChainChanged(chainId);
            });
            
            // Disconnect
            this.provider.on('disconnect', (error) => {
                this.handleDisconnect(error);
            });
        }
    }

    /**
     * Connect wallet
     */
    async connectWallet() {
        try {
            if (!this.provider) {
                throw new Error('No se detectó MetaMask');
            }
            
            console.log('🔗 Conectando wallet...');
            
            // Request account access
            const accounts = await this.provider.request({
                method: 'eth_requestAccounts'
            });
            
            await this.handleAccountsChanged(accounts);
            
            // Get chain ID
            const chainId = await this.provider.request({
                method: 'eth_chainId'
            });
            
            await this.handleChainChanged(chainId);
            
            console.log('✅ Wallet conectada exitosamente');
            
        } catch (error) {
            console.error('❌ Error conectando wallet:', error);
            throw error;
        }
    }

    /**
     * Handle account changes
     */
    async handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected
            this.isConnected = false;
            this.currentAccount = null;
            console.log('👤 Usuario desconectado');
        } else if (accounts[0] !== this.currentAccount) {
            // Account changed
            this.currentAccount = accounts[0];
            this.isConnected = true;
            console.log('👤 Cuenta cambiada:', this.currentAccount);
            
            // Update UI
            this.updateConnectionUI();
        }
    }

    /**
     * Handle chain changes
     */
    async handleChainChanged(chainId) {
        const newChainId = parseInt(chainId, 16);
        this.chainId = newChainId;
        this.networkName = this.supportedNetworks[newChainId] || 'Unknown Network';
        
        console.log('🌐 Red cambiada:', this.networkName);
        
        // Check if network is supported
        if (!this.supportedNetworks[newChainId]) {
            this.showNetworkError();
        }
        
        // Update UI
        this.updateNetworkUI();
    }

    /**
     * Handle disconnect
     */
    handleDisconnect(error) {
        console.log('🔌 Wallet desconectada:', error);
        this.isConnected = false;
        this.currentAccount = null;
        this.updateConnectionUI();
    }

    /**
     * Get current account
     */
    getCurrentAccount() {
        return this.currentAccount;
    }

    /**
     * Get current network
     */
    getCurrentNetwork() {
        return {
            chainId: this.chainId,
            name: this.networkName
        };
    }

    /**
     * Switch network
     */
    async switchNetwork(chainId) {
        try {
            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }]
            });
        } catch (error) {
            if (error.code === 4902) {
                // Chain not added, add it
                await this.addNetwork(chainId);
            } else {
                throw error;
            }
        }
    }

    /**
     * Add network
     */
    async addNetwork(chainId) {
        const networkConfig = this.getNetworkConfig(chainId);
        
        await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig]
        });
    }

    /**
     * Get network configuration
     */
    getNetworkConfig(chainId) {
        const configs = {
            137: {
                chainId: '0x89',
                chainName: 'Polygon',
                nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/']
            },
            56: {
                chainId: '0x38',
                chainName: 'Binance Smart Chain',
                nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/']
            }
        };
        
        return configs[chainId];
    }

    /**
     * Send transaction
     */
    async sendTransaction(transaction) {
        try {
            if (!this.isConnected) {
                throw new Error('Wallet no conectada');
            }
            
            const result = await this.web3.eth.sendTransaction({
                from: this.currentAccount,
                ...transaction
            });
            
            console.log('✅ Transacción enviada:', result.transactionHash);
            return result;
            
        } catch (error) {
            console.error('❌ Error enviando transacción:', error);
            throw error;
        }
    }

    /**
     * Call contract method
     */
    async callContract(contractAddress, abi, method, params = []) {
        try {
            const contract = new this.web3.eth.Contract(abi, contractAddress);
            const result = await contract.methods[method](...params).call({
                from: this.currentAccount
            });
            
            return result;
            
        } catch (error) {
            console.error('❌ Error llamando contrato:', error);
            throw error;
        }
    }

    /**
     * Send contract transaction
     */
    async sendContractTransaction(contractAddress, abi, method, params = [], options = {}) {
        try {
            if (!this.isConnected) {
                throw new Error('Wallet no conectada');
            }
            
            const contract = new this.web3.eth.Contract(abi, contractAddress);
            const data = contract.methods[method](...params).encodeABI();
            
            const transaction = {
                from: this.currentAccount,
                to: contractAddress,
                data: data,
                ...options
            };
            
            // Estimate gas
            const gasEstimate = await this.web3.eth.estimateGas(transaction);
            transaction.gas = Math.floor(gasEstimate * 1.2); // Add 20% buffer
            
            const result = await this.sendTransaction(transaction);
            return result;
            
        } catch (error) {
            console.error('❌ Error enviando transacción de contrato:', error);
            throw error;
        }
    }

    /**
     * Get balance
     */
    async getBalance(address = null) {
        try {
            const targetAddress = address || this.currentAccount;
            const balance = await this.web3.eth.getBalance(targetAddress);
            return this.web3.utils.fromWei(balance, 'ether');
            
        } catch (error) {
            console.error('❌ Error obteniendo balance:', error);
            throw error;
        }
    }

    /**
     * Get token balance
     */
    async getTokenBalance(tokenAddress, userAddress = null) {
        try {
            const targetAddress = userAddress || this.currentAccount;
            
            // ERC20 balanceOf method
            const balance = await this.callContract(
                tokenAddress,
                [
                    {
                        "constant": true,
                        "inputs": [{"name": "_owner", "type": "address"}],
                        "name": "balanceOf",
                        "outputs": [{"name": "balance", "type": "uint256"}],
                        "type": "function"
                    }
                ],
                'balanceOf',
                [targetAddress]
            );
            
            return this.web3.utils.fromWei(balance, 'ether');
            
        } catch (error) {
            console.error('❌ Error obteniendo balance de token:', error);
            throw error;
        }
    }

    /**
     * Sign message
     */
    async signMessage(message) {
        try {
            if (!this.isConnected) {
                throw new Error('Wallet no conectada');
            }
            
            const signature = await this.provider.request({
                method: 'personal_sign',
                params: [message, this.currentAccount]
            });
            
            return signature;
            
        } catch (error) {
            console.error('❌ Error firmando mensaje:', error);
            throw error;
        }
    }

    /**
     * Verify signature
     */
    verifySignature(message, signature, address) {
        try {
            const recoveredAddress = this.web3.eth.accounts.recover(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
            
        } catch (error) {
            console.error('❌ Error verificando firma:', error);
            return false;
        }
    }

    /**
     * Update connection UI
     */
    updateConnectionUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const userMenuToggle = document.getElementById('user-menu-toggle');
        
        if (this.isConnected) {
            if (connectBtn) connectBtn.style.display = 'none';
            if (userMenuToggle) userMenuToggle.style.display = 'flex';
            
            // Update user info
            this.updateUserInfo();
        } else {
            if (connectBtn) connectBtn.style.display = 'flex';
            if (userMenuToggle) userMenuToggle.style.display = 'none';
        }
    }

    /**
     * Update network UI
     */
    updateNetworkUI() {
        // Update network indicator if exists
        const networkIndicator = document.getElementById('network-indicator');
        if (networkIndicator) {
            networkIndicator.textContent = this.networkName;
            networkIndicator.className = `network-indicator ${this.supportedNetworks[this.chainId] ? 'supported' : 'unsupported'}`;
        }
    }

    /**
     * Update user info
     */
    async updateUserInfo() {
        if (this.isConnected && this.currentAccount) {
            try {
                const balance = await this.getBalance();
                const shortAddress = `${this.currentAccount.slice(0, 6)}...${this.currentAccount.slice(-4)}`;
                
                // Update UI elements
                const userAddress = document.getElementById('user-address');
                const userBalance = document.getElementById('user-balance');
                
                if (userAddress) userAddress.textContent = shortAddress;
                if (userBalance) userBalance.textContent = `${parseFloat(balance).toFixed(4)} ETH`;
                
            } catch (error) {
                console.error('❌ Error actualizando información del usuario:', error);
            }
        }
    }

    /**
     * Show Web3 error
     */
    showWeb3Error() {
        const errorMessage = `
            <div class="web3-error">
                <h3>Web3 no detectado</h3>
                <p>Para usar el metaverso, necesitas instalar MetaMask o una wallet compatible.</p>
                <a href="https://metamask.io/" target="_blank" class="btn btn-primary">Instalar MetaMask</a>
            </div>
        `;
        
        // Show error in a modal or notification
        if (window.metaverso) {
            window.metaverso.showNotification('Web3 no detectado. Instala MetaMask para continuar.', 'error');
        }
    }

    /**
     * Show network error
     */
    showNetworkError() {
        const errorMessage = `
            <div class="network-error">
                <h3>Red no soportada</h3>
                <p>Esta red no está soportada. Cambia a una red soportada para continuar.</p>
                <div class="supported-networks">
                    ${Object.entries(this.supportedNetworks).map(([id, name]) => 
                        `<button class="btn btn-secondary" onclick="metaverso.web3.switchNetwork(${id})">${name}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        if (window.metaverso) {
            window.metaverso.showNotification('Red no soportada. Cambia a una red soportada.', 'warning');
        }
    }

    /**
     * Get transaction history
     */
    async getTransactionHistory(address = null, limit = 10) {
        try {
            const targetAddress = address || this.currentAccount;
            
            // This would typically use an API like Etherscan
            // For demo purposes, we'll return a mock response
            const mockTransactions = [
                {
                    hash: '0x123...',
                    from: targetAddress,
                    to: '0x456...',
                    value: '0.1',
                    timestamp: Date.now() - 3600000,
                    status: 'confirmed'
                }
            ];
            
            return mockTransactions;
            
        } catch (error) {
            console.error('❌ Error obteniendo historial de transacciones:', error);
            return [];
        }
    }

    /**
     * Get gas price
     */
    async getGasPrice() {
        try {
            const gasPrice = await this.web3.eth.getGasPrice();
            return this.web3.utils.fromWei(gasPrice, 'gwei');
            
        } catch (error) {
            console.error('❌ Error obteniendo precio del gas:', error);
            return '0';
        }
    }

    /**
     * Estimate gas for transaction
     */
    async estimateGas(transaction) {
        try {
            const gasEstimate = await this.web3.eth.estimateGas(transaction);
            return gasEstimate;
            
        } catch (error) {
            console.error('❌ Error estimando gas:', error);
            throw error;
        }
    }

    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(hash, confirmations = 1) {
        try {
            const receipt = await this.web3.eth.waitForTransactionReceipt(hash, confirmations);
            return receipt;
            
        } catch (error) {
            console.error('❌ Error esperando confirmación:', error);
            throw error;
        }
    }

    /**
     * Get block information
     */
    async getBlock(blockNumber = 'latest') {
        try {
            const block = await this.web3.eth.getBlock(blockNumber);
            return block;
            
        } catch (error) {
            console.error('❌ Error obteniendo información del bloque:', error);
            throw error;
        }
    }

    /**
     * Get current block number
     */
    async getBlockNumber() {
        try {
            const blockNumber = await this.web3.eth.getBlockNumber();
            return blockNumber;
            
        } catch (error) {
            console.error('❌ Error obteniendo número de bloque:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoWeb3;
} 