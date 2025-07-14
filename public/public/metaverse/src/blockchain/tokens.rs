//! Gestor de Tokens para Metaverso
//! Maneja tokens ERC-20 y tokens nativos de las islas

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Información de token
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenInfo {
    pub address: String,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: String,
    pub island: String,
    pub utility: String,
    pub price_usd: Option<f64>,
    pub market_cap: Option<f64>,
    pub volume_24h: Option<f64>,
}

/// Balance de token
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenBalance {
    pub token_address: String,
    pub symbol: String,
    pub balance: String,
    pub balance_usd: Option<f64>,
    pub island: String,
}

/// Transacción de token
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenTransaction {
    pub hash: String,
    pub from: String,
    pub to: String,
    pub token_address: String,
    pub symbol: String,
    pub amount: String,
    pub amount_usd: Option<f64>,
    pub timestamp: u64,
    pub status: TransactionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
}

/// Gestor de Tokens
#[wasm_bindgen]
pub struct TokenManager {
    tokens: HashMap<String, TokenInfo>,
    user_balances: HashMap<String, TokenBalance>,
    user_transactions: Vec<TokenTransaction>,
    current_network: String,
    is_initialized: bool,
}

#[wasm_bindgen]
impl TokenManager {
    /// Crear nuevo gestor de tokens
    pub fn new(config: &crate::blockchain::BlockchainConfig) -> Self {
        Self {
            tokens: HashMap::new(),
            user_balances: HashMap::new(),
            user_transactions: Vec::new(),
            current_network: config.default_network.clone(),
            is_initialized: false,
        }
    }

    /// Inicializar el gestor
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.load_token_list()?;
        self.is_initialized = true;
        Ok(())
    }

    /// Cargar lista de tokens
    fn load_token_list(&mut self) -> Result<(), JsValue> {
        // Tokens de las islas del metaverso
        let metaverse_tokens = vec![
            TokenInfo {
                address: "0x1234567890123456789012345678901234567890".to_string(),
                name: "Green Token".to_string(),
                symbol: "GREEN".to_string(),
                decimals: 18,
                total_supply: "1000000000000000000000000".to_string(),
                island: "forest".to_string(),
                utility: "Environmental rewards and forest activities".to_string(),
                price_usd: Some(0.1),
                market_cap: Some(1000000.0),
                volume_24h: Some(50000.0),
            },
            TokenInfo {
                address: "0x2345678901234567890123456789012345678901".to_string(),
                name: "Blue Token".to_string(),
                symbol: "BLUE".to_string(),
                decimals: 18,
                total_supply: "1000000000000000000000000".to_string(),
                island: "ocean".to_string(),
                utility: "Ocean exploration and marine activities".to_string(),
                price_usd: Some(0.15),
                market_cap: Some(1500000.0),
                volume_24h: Some(75000.0),
            },
            TokenInfo {
                address: "0x3456789012345678901234567890123456789012".to_string(),
                name: "White Token".to_string(),
                symbol: "WHITE".to_string(),
                decimals: 18,
                total_supply: "1000000000000000000000000".to_string(),
                island: "mountain".to_string(),
                utility: "Mountain climbing and ice activities".to_string(),
                price_usd: Some(0.2),
                market_cap: Some(2000000.0),
                volume_24h: Some(100000.0),
            },
            TokenInfo {
                address: "0x4567890123456789012345678901234567890123".to_string(),
                name: "Gold Token".to_string(),
                symbol: "GOLD".to_string(),
                decimals: 18,
                total_supply: "1000000000000000000000000".to_string(),
                island: "desert".to_string(),
                utility: "Desert exploration and treasure hunting".to_string(),
                price_usd: Some(0.25),
                market_cap: Some(2500000.0),
                volume_24h: Some(125000.0),
            },
            TokenInfo {
                address: "0x5678901234567890123456789012345678901234".to_string(),
                name: "Tech Token".to_string(),
                symbol: "TECH".to_string(),
                decimals: 18,
                total_supply: "1000000000000000000000000".to_string(),
                island: "city".to_string(),
                utility: "Technology development and urban activities".to_string(),
                price_usd: Some(0.3),
                market_cap: Some(3000000.0),
                volume_24h: Some(150000.0),
            },
            TokenInfo {
                address: "0x6789012345678901234567890123456789012345".to_string(),
                name: "Fire Token".to_string(),
                symbol: "FIRE".to_string(),
                decimals: 18,
                total_supply: "1000000000000000000000000".to_string(),
                island: "volcano".to_string(),
                utility: "Volcanic activities and fire magic".to_string(),
                price_usd: Some(0.35),
                market_cap: Some(3500000.0),
                volume_24h: Some(175000.0),
            },
            TokenInfo {
                address: "0x7890123456789012345678901234567890123456".to_string(),
                name: "Cosmic Token".to_string(),
                symbol: "COSMIC".to_string(),
                decimals: 18,
                total_supply: "1000000000000000000000000".to_string(),
                island: "space".to_string(),
                utility: "Space exploration and cosmic activities".to_string(),
                price_usd: Some(0.4),
                market_cap: Some(4000000.0),
                volume_24h: Some(200000.0),
            },
        ];

        for token in metaverse_tokens {
            self.tokens.insert(token.symbol.clone(), token);
        }

        Ok(())
    }

    /// Cargar tokens del usuario
    pub fn load_user_tokens(&mut self, address: &str) -> Result<(), JsValue> {
        // Simulación de carga de balances
        let user_balances = vec![
            TokenBalance {
                token_address: "0x1234567890123456789012345678901234567890".to_string(),
                symbol: "GREEN".to_string(),
                balance: "1000000000000000000000".to_string(), // 1000 GREEN
                balance_usd: Some(100.0),
                island: "forest".to_string(),
            },
            TokenBalance {
                token_address: "0x2345678901234567890123456789012345678901".to_string(),
                symbol: "BLUE".to_string(),
                balance: "500000000000000000000".to_string(), // 500 BLUE
                balance_usd: Some(75.0),
                island: "ocean".to_string(),
            },
            TokenBalance {
                token_address: "0x3456789012345678901234567890123456789012".to_string(),
                symbol: "WHITE".to_string(),
                balance: "250000000000000000000".to_string(), // 250 WHITE
                balance_usd: Some(50.0),
                island: "mountain".to_string(),
            },
        ];

        self.user_balances.clear();
        for balance in user_balances {
            self.user_balances.insert(balance.symbol.clone(), balance);
        }

        Ok(())
    }

    /// Obtener información de token
    pub fn get_token_info(&self, symbol: &str) -> Result<JsValue, JsValue> {
        let token = self.tokens.get(symbol)
            .ok_or_else(|| JsValue::from_str("Token no encontrado"))?;
        
        serde_wasm_bindgen::to_value(token)
            .map_err(|_| JsValue::from_str("Error al serializar token"))
    }

    /// Obtener todos los tokens
    pub fn get_all_tokens(&self) -> JsValue {
        let token_list: Vec<&TokenInfo> = self.tokens.values().collect();
        serde_wasm_bindgen::to_value(&token_list).unwrap_or_default()
    }

    /// Obtener tokens por isla
    pub fn get_tokens_by_island(&self, island: &str) -> JsValue {
        let island_tokens: Vec<&TokenInfo> = self.tokens.values()
            .filter(|token| token.island == island)
            .collect();
        
        serde_wasm_bindgen::to_value(&island_tokens).unwrap_or_default()
    }

    /// Obtener balance de usuario
    pub fn get_user_balance(&self, symbol: &str) -> Result<JsValue, JsValue> {
        let balance = self.user_balances.get(symbol)
            .ok_or_else(|| JsValue::from_str("Balance no encontrado"))?;
        
        serde_wasm_bindgen::to_value(balance)
            .map_err(|_| JsValue::from_str("Error al serializar balance"))
    }

    /// Obtener todos los balances del usuario
    pub fn get_all_user_balances(&self) -> JsValue {
        let balance_list: Vec<&TokenBalance> = self.user_balances.values().collect();
        serde_wasm_bindgen::to_value(&balance_list).unwrap_or_default()
    }

    /// Transferir tokens
    pub fn transfer_tokens(&mut self, to_address: &str, symbol: &str, amount: &str) -> Result<String, JsValue> {
        // Verificar que el usuario tiene suficientes tokens
        let balance = self.user_balances.get(symbol)
            .ok_or_else(|| JsValue::from_str("Token no encontrado en balance"))?;
        
        let balance_amount = balance.balance.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear balance"))?;
        let transfer_amount = amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad"))?;
        
        if balance_amount < transfer_amount {
            return Err(JsValue::from_str("Saldo insuficiente"));
        }

        // Simular transacción
        let tx_hash = format!("0x{}", hex::encode(&[0u8; 32]));
        
        // Actualizar balance
        let new_balance = balance_amount - transfer_amount;
        if let Some(balance) = self.user_balances.get_mut(symbol) {
            balance.balance = new_balance.to_string();
            if let Some(price) = self.tokens.get(symbol).and_then(|t| t.price_usd) {
                balance.balance_usd = Some(new_balance as f64 * price / 1e18);
            }
        }

        // Añadir transacción al historial
        let transaction = TokenTransaction {
            hash: tx_hash.clone(),
            from: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
            to: to_address.to_string(),
            token_address: balance.token_address.clone(),
            symbol: symbol.to_string(),
            amount: amount.to_string(),
            amount_usd: self.tokens.get(symbol).and_then(|t| t.price_usd)
                .map(|price| transfer_amount as f64 * price / 1e18),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            status: TransactionStatus::Confirmed,
        };

        self.user_transactions.push(transaction);

        Ok(tx_hash)
    }

    /// Obtener historial de transacciones
    pub fn get_transaction_history(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.user_transactions).unwrap_or_default()
    }

    /// Obtener transacciones por token
    pub fn get_transactions_by_token(&self, symbol: &str) -> JsValue {
        let token_transactions: Vec<&TokenTransaction> = self.user_transactions
            .iter()
            .filter(|tx| tx.symbol == symbol)
            .collect();
        
        serde_wasm_bindgen::to_value(&token_transactions).unwrap_or_default()
    }

    /// Mintear tokens (solo para desarrollo)
    pub fn mint_tokens(&mut self, symbol: &str, amount: &str) -> Result<(), JsValue> {
        let amount_u128 = amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad"))?;

        if let Some(balance) = self.user_balances.get_mut(symbol) {
            let current_balance = balance.balance.parse::<u128>()
                .map_err(|_| JsValue::from_str("Error al parsear balance actual"))?;
            let new_balance = current_balance + amount_u128;
            
            balance.balance = new_balance.to_string();
            if let Some(price) = self.tokens.get(symbol).and_then(|t| t.price_usd) {
                balance.balance_usd = Some(new_balance as f64 * price / 1e18);
            }
        } else {
            // Crear nuevo balance si no existe
            if let Some(token_info) = self.tokens.get(symbol) {
                let balance = TokenBalance {
                    token_address: token_info.address.clone(),
                    symbol: symbol.to_string(),
                    balance: amount.to_string(),
                    balance_usd: token_info.price_usd.map(|price| amount_u128 as f64 * price / 1e18),
                    island: token_info.island.clone(),
                };
                self.user_balances.insert(symbol.to_string(), balance);
            }
        }

        Ok(())
    }

    /// Obtener estadísticas de tokens
    pub fn get_token_stats(&self) -> JsValue {
        let total_tokens = self.tokens.len();
        let total_balance_usd: f64 = self.user_balances.values()
            .filter_map(|balance| balance.balance_usd)
            .sum();
        let total_transactions = self.user_transactions.len();

        let stats = serde_json::json!({
            "total_tokens": total_tokens,
            "total_balance_usd": total_balance_usd,
            "total_transactions": total_transactions,
            "tokens_by_island": {
                "forest": self.get_tokens_by_island("forest"),
                "ocean": self.get_tokens_by_island("ocean"),
                "mountain": self.get_tokens_by_island("mountain"),
                "desert": self.get_tokens_by_island("desert"),
                "city": self.get_tokens_by_island("city"),
                "volcano": self.get_tokens_by_island("volcano"),
                "space": self.get_tokens_by_island("space"),
            }
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Actualizar red
    pub fn update_network(&mut self, network: &str) -> Result<(), JsValue> {
        self.current_network = network.to_string();
        // Aquí se actualizarían las direcciones de contratos según la red
        Ok(())
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, config: &crate::blockchain::BlockchainConfig) -> Result<(), JsValue> {
        self.current_network = config.default_network.clone();
        Ok(())
    }

    /// Verificar si está inicializado
    pub fn is_initialized(&self) -> bool {
        self.is_initialized
    }
} 