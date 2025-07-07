/**
 * Metaverso Marketplace System
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoMarketplace {
    constructor() {
        this.isInitialized = false;
        this.currentTab = 'collections';
        this.currentFilters = {};
        this.currentSort = { field: 'price', order: 'asc' };
        this.currentPage = 1;
        this.itemsPerPage = 12;
        
        // Marketplace data
        this.collections = new Map();
        this.nfts = new Map();
        this.listings = new Map();
        this.userNFTs = new Map();
        
        // Marketplace state
        this.state = {
            isLoading: false,
            isFiltering: false,
            isSorting: false,
            hasMoreItems: true
        };
        
        // Marketplace options
        this.options = {
            autoRefresh: true,
            refreshInterval: 30000, // 30 seconds
            enableNotifications: true,
            enableFavorites: true,
            enableWatchlist: true
        };
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Refresh timer
        this.refreshTimer = null;
    }

    /**
     * Initialize marketplace system
     */
    async initialize() {
        try {
            console.log('🛒 Inicializando sistema de marketplace...');
            
            // Setup marketplace structure
            this.setupMarketplace();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup auto refresh
            this.setupAutoRefresh();
            
            // Setup notifications
            this.setupNotifications();
            
            this.isInitialized = true;
            console.log('✅ Sistema de marketplace inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de marketplace:', error);
            throw error;
        }
    }

    /**
     * Setup marketplace structure
     */
    setupMarketplace() {
        // Setup tabs
        this.setupTabs();
        
        // Setup filters
        this.setupFilters();
        
        // Setup sorting
        this.setupSorting();
        
        // Setup pagination
        this.setupPagination();
    }

    /**
     * Setup tabs
     */
    setupTabs() {
        const tabButtons = document.querySelectorAll('.marketplace-tabs .tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }

    /**
     * Setup filters
     */
    setupFilters() {
        // Price filter
        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                this.setFilter('price', e.target.value);
            });
        }
        
        // Rarity filter
        const rarityFilter = document.getElementById('rarity-filter');
        if (rarityFilter) {
            rarityFilter.addEventListener('change', (e) => {
                this.setFilter('rarity', e.target.value);
            });
        }
        
        // Search filter
        const searchInput = document.getElementById('nft-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.setFilter('search', e.target.value);
            });
        }
    }

    /**
     * Setup sorting
     */
    setupSorting() {
        // This would setup sorting controls
        // For now, we'll use default sorting
    }

    /**
     * Setup pagination
     */
    setupPagination() {
        // This would setup pagination controls
        // For now, we'll use infinite scroll
        this.setupInfiniteScroll();
    }

    /**
     * Setup infinite scroll
     */
    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (this.isNearBottom() && this.state.hasMoreItems && !this.state.isLoading) {
                this.loadMoreItems();
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // NFT card interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nft-card')) {
                const nftId = e.target.getAttribute('data-nft-id');
                this.showNFTDetails(nftId);
            }
            
            if (e.target.matches('.nft-favorite')) {
                e.stopPropagation();
                const nftId = e.target.getAttribute('data-nft-id');
                this.toggleFavorite(nftId);
            }
            
            if (e.target.matches('.nft-buy')) {
                e.stopPropagation();
                const nftId = e.target.getAttribute('data-nft-id');
                this.buyNFT(nftId);
            }
        });
        
        // Collection interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.collection-card')) {
                const collectionId = e.target.getAttribute('data-collection-id');
                this.showCollectionDetails(collectionId);
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
            
            // Load collections
            await this.loadCollections();
            
            // Load NFTs
            await this.loadNFTs();
            
            // Load user NFTs if connected
            if (window.metaverso && window.metaverso.isWalletConnected) {
                await this.loadUserNFTs();
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
     * Load collections
     */
    async loadCollections() {
        try {
            // This would load from blockchain/API
            // For now, we'll use mock data
            const mockCollections = [
                {
                    id: 1,
                    name: 'Avatares Legendarios',
                    description: 'Colección de avatares únicos y legendarios',
                    image: 'assets/images/collections/avatars.jpg',
                    totalSupply: 1000,
                    floorPrice: 0.5,
                    volume: 150.5
                },
                {
                    id: 2,
                    name: 'Terrenos Virtuales',
                    description: 'Parcelas de tierra en el metaverso',
                    image: 'assets/images/collections/lands.jpg',
                    totalSupply: 500,
                    floorPrice: 2.0,
                    volume: 300.0
                },
                {
                    id: 3,
                    name: 'Arte Digital',
                    description: 'Obras de arte únicas creadas por artistas',
                    image: 'assets/images/collections/art.jpg',
                    totalSupply: 200,
                    floorPrice: 1.0,
                    volume: 75.0
                }
            ];
            
            mockCollections.forEach(collection => {
                this.collections.set(collection.id, collection);
            });
            
        } catch (error) {
            console.error('❌ Error cargando colecciones:', error);
        }
    }

    /**
     * Load NFTs
     */
    async loadNFTs() {
        try {
            // This would load from blockchain/API
            // For now, we'll use mock data
            const mockNFTs = [
                {
                    id: 1,
                    name: 'Avatar #001',
                    description: 'Un avatar legendario con poderes especiales',
                    image: 'assets/images/nfts/avatar1.jpg',
                    collection: 1,
                    price: 0.8,
                    rarity: 'legendary',
                    level: 10,
                    attributes: {
                        strength: 95,
                        agility: 88,
                        intelligence: 92
                    }
                },
                {
                    id: 2,
                    name: 'Terreno #001',
                    description: 'Una parcela de tierra en el centro del metaverso',
                    image: 'assets/images/nfts/land1.jpg',
                    collection: 2,
                    price: 2.5,
                    rarity: 'epic',
                    level: 5,
                    attributes: {
                        size: 'large',
                        location: 'center',
                        resources: 'high'
                    }
                }
            ];
            
            mockNFTs.forEach(nft => {
                this.nfts.set(nft.id, nft);
            });
            
        } catch (error) {
            console.error('❌ Error cargando NFTs:', error);
        }
    }

    /**
     * Load user NFTs
     */
    async loadUserNFTs() {
        try {
            // This would load user's NFTs from blockchain
            // For now, we'll use mock data
            const mockUserNFTs = [
                {
                    id: 3,
                    name: 'Mi Avatar',
                    description: 'Mi avatar personal',
                    image: 'assets/images/nfts/my-avatar.jpg',
                    collection: 1,
                    rarity: 'rare',
                    level: 5
                }
            ];
            
            mockUserNFTs.forEach(nft => {
                this.userNFTs.set(nft.id, nft);
            });
            
        } catch (error) {
            console.error('❌ Error cargando NFTs del usuario:', error);
        }
    }

    /**
     * Switch tab
     */
    switchTab(tab) {
        if (this.currentTab === tab) return;
        
        // Update tab buttons
        document.querySelectorAll('.marketplace-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update current tab
        this.currentTab = tab;
        
        // Reset pagination
        this.currentPage = 1;
        this.state.hasMoreItems = true;
        
        // Render new tab
        this.renderCurrentTab();
        
        // Emit tab change event
        this.emit('tabChanged', tab);
    }

    /**
     * Set filter
     */
    setFilter(key, value) {
        this.currentFilters[key] = value;
        this.currentPage = 1;
        this.state.hasMoreItems = true;
        
        // Apply filters
        this.applyFilters();
    }

    /**
     * Apply filters
     */
    applyFilters() {
        this.state.isFiltering = true;
        
        // Filter NFTs based on current filters
        const filteredNFTs = this.filterNFTs();
        
        // Render filtered results
        this.renderNFTs(filteredNFTs);
        
        this.state.isFiltering = false;
    }

    /**
     * Filter NFTs
     */
    filterNFTs() {
        let filtered = Array.from(this.nfts.values());
        
        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(nft => 
                nft.name.toLowerCase().includes(searchTerm) ||
                nft.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply price filter
        if (this.currentFilters.price) {
            switch (this.currentFilters.price) {
                case 'low':
                    filtered = filtered.filter(nft => nft.price < 0.1);
                    break;
                case 'medium':
                    filtered = filtered.filter(nft => nft.price >= 0.1 && nft.price <= 1);
                    break;
                case 'high':
                    filtered = filtered.filter(nft => nft.price > 1);
                    break;
            }
        }
        
        // Apply rarity filter
        if (this.currentFilters.rarity) {
            filtered = filtered.filter(nft => nft.rarity === this.currentFilters.rarity);
        }
        
        return filtered;
    }

    /**
     * Render current tab
     */
    renderCurrentTab() {
        switch (this.currentTab) {
            case 'collections':
                this.renderCollections();
                break;
            case 'trending':
                this.renderTrending();
                break;
            case 'recent':
                this.renderRecent();
                break;
            case 'my-nfts':
                this.renderUserNFTs();
                break;
        }
    }

    /**
     * Render collections
     */
    renderCollections() {
        const container = document.getElementById('nft-grid');
        if (!container) return;
        
        const collections = Array.from(this.collections.values());
        
        container.innerHTML = collections.map(collection => `
            <div class="card collection-card" data-collection-id="${collection.id}">
                <div class="collection-image">
                    <img src="${collection.image}" alt="${collection.name}">
                </div>
                <div class="card-content">
                    <h3>${collection.name}</h3>
                    <p>${collection.description}</p>
                    <div class="collection-stats">
                        <div class="stat">
                            <span class="stat-label">Supply:</span>
                            <span class="stat-value">${collection.totalSupply}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Floor:</span>
                            <span class="stat-value">${collection.floorPrice} ETH</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Volume:</span>
                            <span class="stat-value">${collection.volume} ETH</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render trending NFTs
     */
    renderTrending() {
        const container = document.getElementById('nft-grid');
        if (!container) return;
        
        const trendingNFTs = Array.from(this.nfts.values())
            .sort((a, b) => b.price - a.price)
            .slice(0, this.itemsPerPage);
        
        this.renderNFTs(trendingNFTs);
    }

    /**
     * Render recent NFTs
     */
    renderRecent() {
        const container = document.getElementById('nft-grid');
        if (!container) return;
        
        const recentNFTs = Array.from(this.nfts.values())
            .sort((a, b) => b.id - a.id)
            .slice(0, this.itemsPerPage);
        
        this.renderNFTs(recentNFTs);
    }

    /**
     * Render user NFTs
     */
    renderUserNFTs() {
        const container = document.getElementById('nft-grid');
        if (!container) return;
        
        const userNFTs = Array.from(this.userNFTs.values());
        
        if (userNFTs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No tienes NFTs</h3>
                    <p>Compra tu primer NFT en el marketplace</p>
                    <button class="btn btn-primary" onclick="metaverso.marketplace.switchTab('collections')">
                        Explorar Marketplace
                    </button>
                </div>
            `;
            return;
        }
        
        this.renderNFTs(userNFTs);
    }

    /**
     * Render NFTs
     */
    renderNFTs(nfts) {
        const container = document.getElementById('nft-grid');
        if (!container) return;
        
        container.innerHTML = nfts.map(nft => `
            <div class="card nft-card" data-nft-id="${nft.id}">
                <div class="nft-image">
                    <img src="${nft.image}" alt="${nft.name}">
                    <div class="nft-badge">${nft.rarity}</div>
                    <button class="nft-favorite" data-nft-id="${nft.id}">
                        <span class="favorite-icon">♡</span>
                    </button>
                </div>
                <div class="card-content">
                    <h3>${nft.name}</h3>
                    <p>${nft.description}</p>
                    <div class="nft-price">
                        <span class="price-icon">💰</span>
                        <span class="price-value">${nft.price} ETH</span>
                    </div>
                    <div class="nft-attributes">
                        ${this.renderNFTAttributes(nft.attributes)}
                    </div>
                    <div class="nft-actions">
                        <button class="btn btn-primary nft-buy" data-nft-id="${nft.id}">
                            Comprar
                        </button>
                        <button class="btn btn-secondary nft-offer" data-nft-id="${nft.id}">
                            Oferta
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render NFT attributes
     */
    renderNFTAttributes(attributes) {
        if (!attributes) return '';
        
        return Object.entries(attributes).map(([key, value]) => `
            <span class="nft-attribute">
                ${key}: ${value}
            </span>
        `).join('');
    }

    /**
     * Show NFT details
     */
    showNFTDetails(nftId) {
        const nft = this.nfts.get(parseInt(nftId));
        if (!nft) return;
        
        // Show modal with NFT details
        if (window.metaverso && window.metaverso.ui) {
            window.metaverso.ui.showModal('nft-modal');
            
            // Update modal content
            document.getElementById('nft-modal-image').src = nft.image;
            document.getElementById('nft-modal-name').textContent = nft.name;
            document.getElementById('nft-modal-description').textContent = nft.description;
            
            // Update attributes
            const attributesContainer = document.getElementById('nft-modal-attributes');
            if (attributesContainer) {
                attributesContainer.innerHTML = this.renderNFTAttributes(nft.attributes);
            }
        }
    }

    /**
     * Show collection details
     */
    showCollectionDetails(collectionId) {
        const collection = this.collections.get(parseInt(collectionId));
        if (!collection) return;
        
        // Switch to collection view
        this.switchTab('collections');
        
        // Filter NFTs by collection
        this.setFilter('collection', collectionId);
    }

    /**
     * Toggle favorite
     */
    toggleFavorite(nftId) {
        const favoriteBtn = document.querySelector(`[data-nft-id="${nftId}"] .nft-favorite`);
        if (!favoriteBtn) return;
        
        const icon = favoriteBtn.querySelector('.favorite-icon');
        const isFavorited = icon.textContent === '♥';
        
        if (isFavorited) {
            icon.textContent = '♡';
            this.removeFromFavorites(nftId);
        } else {
            icon.textContent = '♥';
            this.addToFavorites(nftId);
        }
    }

    /**
     * Add to favorites
     */
    addToFavorites(nftId) {
        const favorites = JSON.parse(localStorage.getItem('metaverso-favorites') || '[]');
        if (!favorites.includes(nftId)) {
            favorites.push(nftId);
            localStorage.setItem('metaverso-favorites', JSON.stringify(favorites));
        }
    }

    /**
     * Remove from favorites
     */
    removeFromFavorites(nftId) {
        const favorites = JSON.parse(localStorage.getItem('metaverso-favorites') || '[]');
        const index = favorites.indexOf(nftId);
        if (index > -1) {
            favorites.splice(index, 1);
            localStorage.setItem('metaverso-favorites', JSON.stringify(favorites));
        }
    }

    /**
     * Buy NFT
     */
    async buyNFT(nftId) {
        const nft = this.nfts.get(parseInt(nftId));
        if (!nft) return;
        
        try {
            // Check if user is connected
            if (!window.metaverso || !window.metaverso.isWalletConnected) {
                this.showNotification('Conecta tu wallet para comprar NFTs', 'warning');
                return;
            }
            
            // Show confirmation dialog
            const confirmed = await this.showConfirmation(
                `¿Comprar ${nft.name} por ${nft.price} ETH?`
            );
            
            if (!confirmed) return;
            
            // Execute purchase
            await this.executePurchase(nftId, nft.price);
            
        } catch (error) {
            console.error('❌ Error comprando NFT:', error);
            this.showNotification('Error al comprar NFT', 'error');
        }
    }

    /**
     * Execute purchase
     */
    async executePurchase(nftId, price) {
        // This would execute the purchase on the blockchain
        // For now, we'll simulate it
        
        this.showNotification('Procesando compra...', 'info');
        
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update user's NFTs
        const nft = this.nfts.get(parseInt(nftId));
        if (nft) {
            this.userNFTs.set(nftId, nft);
        }
        
        this.showNotification('¡NFT comprado exitosamente!', 'success');
        
        // Emit purchase event
        this.emit('nftPurchased', { nftId, price });
    }

    /**
     * Show confirmation dialog
     */
    showConfirmation(message) {
        return new Promise((resolve) => {
            const confirmed = confirm(message);
            resolve(confirmed);
        });
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
     * Load more items
     */
    async loadMoreItems() {
        if (this.state.isLoading || !this.state.hasMoreItems) return;
        
        try {
            this.state.isLoading = true;
            this.currentPage++;
            
            // Load more NFTs
            await this.loadMoreNFTs();
            
        } catch (error) {
            console.error('❌ Error cargando más items:', error);
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Load more NFTs
     */
    async loadMoreNFTs() {
        // This would load more NFTs from the API
        // For now, we'll just mark as no more items
        this.state.hasMoreItems = false;
    }

    /**
     * Refresh data
     */
    async refreshData() {
        try {
            await this.loadCollections();
            await this.loadNFTs();
            
            if (window.metaverso && window.metaverso.isWalletConnected) {
                await this.loadUserNFTs();
            }
            
            // Re-render current tab
            this.renderCurrentTab();
            
        } catch (error) {
            console.error('❌ Error refrescando datos:', error);
        }
    }

    /**
     * Check if near bottom
     */
    isNearBottom() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        return scrollTop + windowHeight >= documentHeight - 100;
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
     * Get current filters
     */
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    /**
     * Get collections
     */
    getCollections() {
        return Array.from(this.collections.values());
    }

    /**
     * Get NFTs
     */
    getNFTs() {
        return Array.from(this.nfts.values());
    }

    /**
     * Get user NFTs
     */
    getUserNFTs() {
        return Array.from(this.userNFTs.values());
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
        this.collections.clear();
        this.nfts.clear();
        this.listings.clear();
        this.userNFTs.clear();
        
        // Clear event listeners
        this.eventListeners.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoMarketplace;
} 