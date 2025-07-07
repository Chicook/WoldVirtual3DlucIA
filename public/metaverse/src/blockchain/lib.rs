//! Sistema de Blockchain para Metaverso Descentralizado
//! Integración completa con Web3, DeFi, NFTs y Smart Contracts

pub mod tokens;
pub mod nfts;
pub mod defi;
pub mod governance;
pub mod marketplace;
pub mod staking;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Configuración de red blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub chain_id: u64,
    pub name: String,
    pub rpc_url: String,
    pub explorer_url: String,
    pub native_currency: NativeCurrency,
    pub contracts: HashMap<String, String>, // Nombre -> Dirección
}

/// Moneda nativa de la red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NativeCurrency {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
}

/// Configuración de blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockchainConfig {
    pub networks: HashMap<String, NetworkConfig>,
    pub default_network: String,
    pub gas_limit: u64,
    pub gas_price: u64,
    pub enable_auto_gas: bool,
    pub enable_transaction_history: bool,
    pub enable_price_feeds: bool,
}

impl Default for BlockchainConfig {
    fn default() -> Self {
        let mut networks = HashMap::new();
        
        // Ethereum Mainnet
        networks.insert("ethereum".to_string(), NetworkConfig {
            chain_id: 1,
            name: "Ethereum Mainnet".to_string(),
            rpc_url: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID".to_string(),
            explorer_url: "https://etherscan.io".to_string(),
            native_currency: NativeCurrency {
                name: "Ether".to_string(),
                symbol: "ETH".to_string(),
                decimals: 18,
            },
            contracts: HashMap::new(),
        });

        // Polygon
        networks.insert("polygon".to_string(), NetworkConfig {
            chain_id: 137,
            name: "Polygon".to_string(),
            rpc_url: "https://polygon-rpc.com".to_string(),
            explorer_url: "https://polygonscan.com".to_string(),
            native_currency: NativeCurrency {
                name: "MATIC".to_string(),
                symbol: "MATIC".to_string(),
                decimals: 18,
            },
            contracts: HashMap::new(),
        });

        // BSC
        networks.insert("bsc".to_string(), NetworkConfig {
            chain_id: 56,
            name: "Binance Smart Chain".to_string(),
            rpc_url: "https://bsc-dataseed.binance.org".to_string(),
            explorer_url: "https://bscscan.com".to_string(),
            native_currency: NativeCurrency {
                name: "BNB".to_string(),
                symbol: "BNB".to_string(),
                decimals: 18,
            },
            contracts: HashMap::new(),
        });

        Self {
            networks,
            default_network: "polygon".to_string(),
            gas_limit: 300000,
            gas_price: 20000000000, // 20 Gwei
            enable_auto_gas: true,
            enable_transaction_history: true,
            enable_price_feeds: true,
        }
    }
}

/// Gestor principal de blockchain
#[wasm_bindgen]
pub struct BlockchainManager {
    config: BlockchainConfig,
    current_network: String,
    wallet_address: Option<String>,
    token_manager: tokens::TokenManager,
    nft_manager: nfts::NFTManager,
    defi_manager: defi::DeFiManager,
    governance_manager: governance::GovernanceManager,
    marketplace_manager: marketplace::MarketplaceManager,
    staking_manager: staking::StakingManager,
    transaction_history: Vec<Transaction>,
    price_feeds: HashMap<String, f64>,
}

/// Transacción blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub from: String,
    pub to: String,
    pub value: String,
    pub gas_used: u64,
    pub gas_price: u64,
    pub status: TransactionStatus,
    pub timestamp: u64,
    pub network: String,
    pub contract_address: Option<String>,
    pub method: Option<String>,
    pub parameters: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
}

#[wasm_bindgen]
impl BlockchainManager {
    /// Crear nuevo gestor de blockchain
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let config = BlockchainConfig::default();
        
        Self {
            token_manager: tokens::TokenManager::new(&config),
            nft_manager: nfts::NFTManager::new(&config),
            defi_manager: defi::DeFiManager::new(&config),
            governance_manager: governance::GovernanceManager::new(&config),
            marketplace_manager: marketplace::MarketplaceManager::new(&config),
            staking_manager: staking::StakingManager::new(&config),
            transaction_history: Vec::new(),
            price_feeds: HashMap::new(),
            current_network: config.default_network.clone(),
            wallet_address: None,
            config,
        }
    }

    /// Inicializar el sistema de blockchain
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.token_manager.initialize()?;
        self.nft_manager.initialize()?;
        self.defi_manager.initialize()?;
        self.governance_manager.initialize()?;
        self.marketplace_manager.initialize()?;
        self.staking_manager.initialize()?;
        
        // Cargar precios iniciales
        self.update_price_feeds()?;
        
        Ok(())
    }

    /// Conectar wallet
    pub fn connect_wallet(&mut self) -> Result<String, JsValue> {
        // Simulación de conexión de wallet
        let address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string();
        self.wallet_address = Some(address.clone());
        
        // Cargar datos del usuario
        self.load_user_data(&address)?;
        
        Ok(address)
    }

    /// Cargar datos del usuario
    fn load_user_data(&mut self, address: &str) -> Result<(), JsValue> {
        // Cargar tokens del usuario
        self.token_manager.load_user_tokens(address)?;
        
        // Cargar NFTs del usuario
        self.nft_manager.load_user_nfts(address)?;
        
        // Cargar historial de transacciones
        self.load_transaction_history(address)?;
        
        Ok(())
    }

    /// Cargar historial de transacciones
    fn load_transaction_history(&mut self, address: &str) -> Result<(), JsValue> {
        // Simulación de carga de transacciones
        let transactions = vec![
            Transaction {
                hash: "0x1234567890abcdef".to_string(),
                from: address.to_string(),
                to: "0xContractAddress".to_string(),
                value: "1000000000000000000".to_string(), // 1 ETH
                gas_used: 21000,
                gas_price: 20000000000,
                status: TransactionStatus::Confirmed,
                timestamp: 1640995200, // 2022-01-01
                network: self.current_network.clone(),
                contract_address: Some("0xTokenContract".to_string()),
                method: Some("transfer".to_string()),
                parameters: Some(vec!["0xRecipient".to_string(), "1000000000000000000".to_string()]),
            }
        ];
        
        self.transaction_history = transactions;
        Ok(())
    }

    /// Actualizar feeds de precios
    pub fn update_price_feeds(&mut self) -> Result<(), JsValue> {
        // Simulación de feeds de precios
        self.price_feeds.insert("ETH".to_string(), 3000.0);
        self.price_feeds.insert("MATIC".to_string(), 1.5);
        self.price_feeds.insert("BNB".to_string(), 400.0);
        self.price_feeds.insert("GREEN_TOKEN".to_string(), 0.1);
        self.price_feeds.insert("BLUE_TOKEN".to_string(), 0.15);
        self.price_feeds.insert("WHITE_TOKEN".to_string(), 0.2);
        self.price_feeds.insert("GOLD_TOKEN".to_string(), 0.25);
        self.price_feeds.insert("TECH_TOKEN".to_string(), 0.3);
        self.price_feeds.insert("FIRE_TOKEN".to_string(), 0.35);
        self.price_feeds.insert("COSMIC_TOKEN".to_string(), 0.4);
        
        Ok(())
    }

    /// Obtener precio de token
    pub fn get_token_price(&self, symbol: &str) -> Result<f64, JsValue> {
        self.price_feeds.get(symbol)
            .copied()
            .ok_or_else(|| JsValue::from_str("Precio no disponible"))
    }

    /// Cambiar red
    pub fn switch_network(&mut self, network_name: &str) -> Result<(), JsValue> {
        if !self.config.networks.contains_key(network_name) {
            return Err(JsValue::from_str("Red no soportada"));
        }
        
        self.current_network = network_name.to_string();
        
        // Actualizar configuración de todos los managers
        self.token_manager.update_network(network_name)?;
        self.nft_manager.update_network(network_name)?;
        self.defi_manager.update_network(network_name)?;
        self.governance_manager.update_network(network_name)?;
        self.marketplace_manager.update_network(network_name)?;
        self.staking_manager.update_network(network_name)?;
        
        Ok(())
    }

    /// Obtener configuración de red actual
    pub fn get_current_network(&self) -> JsValue {
        let network = self.config.networks.get(&self.current_network)
            .expect("Red actual debe existir");
        
        serde_wasm_bindgen::to_value(network).unwrap_or_default()
    }

    /// Obtener todas las redes disponibles
    pub fn get_available_networks(&self) -> JsValue {
        let networks: Vec<&NetworkConfig> = self.config.networks.values().collect();
        serde_wasm_bindgen::to_value(&networks).unwrap_or_default()
    }

    /// Obtener historial de transacciones
    pub fn get_transaction_history(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.transaction_history).unwrap_or_default()
    }

    /// Obtener estadísticas de blockchain
    pub fn get_blockchain_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "current_network": self.current_network,
            "wallet_connected": self.wallet_address.is_some(),
            "total_transactions": self.transaction_history.len(),
            "token_prices": self.price_feeds,
            "network_config": self.get_current_network(),
        });
        
        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Obtener dirección del wallet
    pub fn get_wallet_address(&self) -> Option<String> {
        self.wallet_address.clone()
    }

    /// Verificar si el wallet está conectado
    pub fn is_wallet_connected(&self) -> bool {
        self.wallet_address.is_some()
    }

    /// Desconectar wallet
    pub fn disconnect_wallet(&mut self) {
        self.wallet_address = None;
        self.transaction_history.clear();
    }

    /// Obtener configuración
    pub fn get_config(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.config).unwrap_or_default()
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        let new_config: BlockchainConfig = serde_wasm_bindgen::from_value(config)?;
        self.config = new_config;
        
        // Aplicar nueva configuración a todos los managers
        self.token_manager.update_config(&self.config)?;
        self.nft_manager.update_config(&self.config)?;
        self.defi_manager.update_config(&self.config)?;
        self.governance_manager.update_config(&self.config)?;
        self.marketplace_manager.update_config(&self.config)?;
        self.staking_manager.update_config(&self.config)?;
        
        Ok(())
    }

    /// Obtener manager de tokens
    pub fn get_token_manager(&self) -> &tokens::TokenManager {
        &self.token_manager
    }

    /// Obtener manager de NFTs
    pub fn get_nft_manager(&self) -> &nfts::NFTManager {
        &self.nft_manager
    }

    /// Obtener manager de DeFi
    pub fn get_defi_manager(&self) -> &defi::DeFiManager {
        &self.defi_manager
    }

    /// Obtener manager de governance
    pub fn get_governance_manager(&self) -> &governance::GovernanceManager {
        &self.governance_manager
    }

    /// Obtener manager de marketplace
    pub fn get_marketplace_manager(&self) -> &marketplace::MarketplaceManager {
        &self.marketplace_manager
    }

    /// Obtener manager de staking
    pub fn get_staking_manager(&self) -> &staking::StakingManager {
        &self.staking_manager
    }
}

impl Drop for BlockchainManager {
    fn drop(&mut self) {
        // Limpiar recursos
        self.disconnect_wallet();
    }
} 