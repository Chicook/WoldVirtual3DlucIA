//! Gestor de NFTs para Metaverso
//! Maneja NFTs de criaturas, vehículos, artefactos y otros elementos del metaverso

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Metadatos de NFT
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFTMetadata {
    pub name: String,
    pub description: String,
    pub image: String,
    pub attributes: Vec<NFTAttribute>,
    pub island: String,
    pub rarity: NFTRarity,
    pub level: u8,
    pub experience: u64,
    pub power: u32,
    pub abilities: Vec<String>,
    pub created_at: u64,
    pub creator: String,
}

/// Atributo de NFT
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFTAttribute {
    pub trait_type: String,
    pub value: String,
    pub rarity_percentage: Option<f32>,
}

/// Rareza de NFT
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NFTRarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Mythic,
}

/// Información de NFT
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFTInfo {
    pub token_id: String,
    pub contract_address: String,
    pub metadata: NFTMetadata,
    pub owner: String,
    pub is_staked: bool,
    pub staking_rewards: Option<String>,
    pub last_transfer: u64,
    pub market_price: Option<String>,
    pub market_price_usd: Option<f64>,
}

/// Colección de NFTs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFTCollection {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub island: String,
    pub total_supply: u64,
    pub minted_count: u64,
    pub contract_address: String,
    pub creator: String,
    pub royalty_percentage: u8,
}

/// Gestor de NFTs
#[wasm_bindgen]
pub struct NFTManager {
    collections: HashMap<String, NFTCollection>,
    user_nfts: HashMap<String, NFTInfo>,
    all_nfts: HashMap<String, NFTInfo>,
    current_network: String,
    is_initialized: bool,
}

#[wasm_bindgen]
impl NFTManager {
    /// Crear nuevo gestor de NFTs
    pub fn new(config: &crate::blockchain::BlockchainConfig) -> Self {
        Self {
            collections: HashMap::new(),
            user_nfts: HashMap::new(),
            all_nfts: HashMap::new(),
            current_network: config.default_network.clone(),
            is_initialized: false,
        }
    }

    /// Inicializar el gestor
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.load_collections()?;
        self.load_sample_nfts()?;
        self.is_initialized = true;
        Ok(())
    }

    /// Cargar colecciones
    fn load_collections(&mut self) -> Result<(), JsValue> {
        let collections = vec![
            NFTCollection {
                name: "Forest Creatures".to_string(),
                symbol: "FOREST".to_string(),
                description: "Magical creatures that inhabit the forest".to_string(),
                island: "forest".to_string(),
                total_supply: 10000,
                minted_count: 1500,
                contract_address: "0x1234567890123456789012345678901234567890".to_string(),
                creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                royalty_percentage: 5,
            },
            NFTCollection {
                name: "Sea Creatures".to_string(),
                symbol: "SEA".to_string(),
                description: "Mysterious creatures of the deep ocean".to_string(),
                island: "ocean".to_string(),
                total_supply: 8000,
                minted_count: 1200,
                contract_address: "0x2345678901234567890123456789012345678901".to_string(),
                creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                royalty_percentage: 5,
            },
            NFTCollection {
                name: "Ice Creatures".to_string(),
                symbol: "ICE".to_string(),
                description: "Frozen beings from the mountain peaks".to_string(),
                island: "mountain".to_string(),
                total_supply: 6000,
                minted_count: 800,
                contract_address: "0x3456789012345678901234567890123456789012".to_string(),
                creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                royalty_percentage: 5,
            },
            NFTCollection {
                name: "Desert Creatures".to_string(),
                symbol: "DESERT".to_string(),
                description: "Ancient beings of the mystical desert".to_string(),
                island: "desert".to_string(),
                total_supply: 5000,
                minted_count: 600,
                contract_address: "0x4567890123456789012345678901234567890123".to_string(),
                creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                royalty_percentage: 5,
            },
            NFTCollection {
                name: "Flying Vehicles".to_string(),
                symbol: "VEHICLE".to_string(),
                description: "Advanced transportation of the future city".to_string(),
                island: "city".to_string(),
                total_supply: 4000,
                minted_count: 500,
                contract_address: "0x5678901234567890123456789012345678901234".to_string(),
                creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                royalty_percentage: 5,
            },
            NFTCollection {
                name: "Fire Creatures".to_string(),
                symbol: "FIRE".to_string(),
                description: "Beings born from the volcanic flames".to_string(),
                island: "volcano".to_string(),
                total_supply: 3000,
                minted_count: 300,
                contract_address: "0x6789012345678901234567890123456789012345".to_string(),
                creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                royalty_percentage: 5,
            },
            NFTCollection {
                name: "Spaceships".to_string(),
                symbol: "SPACE".to_string(),
                description: "Interstellar vessels for cosmic exploration".to_string(),
                island: "space".to_string(),
                total_supply: 2000,
                minted_count: 200,
                contract_address: "0x7890123456789012345678901234567890123456".to_string(),
                creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                royalty_percentage: 5,
            },
        ];

        for collection in collections {
            self.collections.insert(collection.symbol.clone(), collection);
        }

        Ok(())
    }

    /// Cargar NFTs de muestra
    fn load_sample_nfts(&mut self) -> Result<(), JsValue> {
        let sample_nfts = vec![
            NFTInfo {
                token_id: "1".to_string(),
                contract_address: "0x1234567890123456789012345678901234567890".to_string(),
                metadata: NFTMetadata {
                    name: "Ancient Tree Guardian".to_string(),
                    description: "A wise and powerful guardian of the forest".to_string(),
                    image: "ipfs://QmAncientTreeGuardian".to_string(),
                    attributes: vec![
                        NFTAttribute { trait_type: "Type".to_string(), value: "Guardian".to_string(), rarity_percentage: Some(10.0) },
                        NFTAttribute { trait_type: "Element".to_string(), value: "Nature".to_string(), rarity_percentage: Some(25.0) },
                        NFTAttribute { trait_type: "Power".to_string(), value: "85".to_string(), rarity_percentage: Some(15.0) },
                        NFTAttribute { trait_type: "Rarity".to_string(), value: "Rare".to_string(), rarity_percentage: Some(10.0) },
                    ],
                    island: "forest".to_string(),
                    rarity: NFTRarity::Rare,
                    level: 15,
                    experience: 15000,
                    power: 85,
                    abilities: vec!["Healing Aura".to_string(), "Nature Shield".to_string()],
                    created_at: 1640995200,
                    creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                },
                owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                is_staked: false,
                staking_rewards: None,
                last_transfer: 1640995200,
                market_price: Some("1000000000000000000".to_string()), // 1 ETH
                market_price_usd: Some(3000.0),
            },
            NFTInfo {
                token_id: "2".to_string(),
                contract_address: "0x2345678901234567890123456789012345678901".to_string(),
                metadata: NFTMetadata {
                    name: "Deep Sea Leviathan".to_string(),
                    description: "A massive creature of the deep ocean".to_string(),
                    image: "ipfs://QmDeepSeaLeviathan".to_string(),
                    attributes: vec![
                        NFTAttribute { trait_type: "Type".to_string(), value: "Leviathan".to_string(), rarity_percentage: Some(5.0) },
                        NFTAttribute { trait_type: "Element".to_string(), value: "Water".to_string(), rarity_percentage: Some(25.0) },
                        NFTAttribute { trait_type: "Power".to_string(), value: "95".to_string(), rarity_percentage: Some(5.0) },
                        NFTAttribute { trait_type: "Rarity".to_string(), value: "Epic".to_string(), rarity_percentage: Some(5.0) },
                    ],
                    island: "ocean".to_string(),
                    rarity: NFTRarity::Epic,
                    level: 20,
                    experience: 25000,
                    power: 95,
                    abilities: vec!["Tsunami Wave".to_string(), "Deep Pressure".to_string()],
                    created_at: 1640995200,
                    creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                },
                owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                is_staked: false,
                staking_rewards: None,
                last_transfer: 1640995200,
                market_price: Some("2000000000000000000".to_string()), // 2 ETH
                market_price_usd: Some(6000.0),
            },
            NFTInfo {
                token_id: "3".to_string(),
                contract_address: "0x3456789012345678901234567890123456789012".to_string(),
                metadata: NFTMetadata {
                    name: "Frost Giant King".to_string(),
                    description: "The ruler of the frozen mountain peaks".to_string(),
                    image: "ipfs://QmFrostGiantKing".to_string(),
                    attributes: vec![
                        NFTAttribute { trait_type: "Type".to_string(), value: "Giant".to_string(), rarity_percentage: Some(3.0) },
                        NFTAttribute { trait_type: "Element".to_string(), value: "Ice".to_string(), rarity_percentage: Some(20.0) },
                        NFTAttribute { trait_type: "Power".to_string(), value: "100".to_string(), rarity_percentage: Some(2.0) },
                        NFTAttribute { trait_type: "Rarity".to_string(), value: "Legendary".to_string(), rarity_percentage: Some(2.0) },
                    ],
                    island: "mountain".to_string(),
                    rarity: NFTRarity::Legendary,
                    level: 25,
                    experience: 50000,
                    power: 100,
                    abilities: vec!["Blizzard Storm".to_string(), "Ice Armor".to_string(), "Mountain Control".to_string()],
                    created_at: 1640995200,
                    creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                },
                owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                is_staked: false,
                staking_rewards: None,
                last_transfer: 1640995200,
                market_price: Some("5000000000000000000".to_string()), // 5 ETH
                market_price_usd: Some(15000.0),
            },
        ];

        for nft in sample_nfts {
            let key = format!("{}_{}", nft.contract_address, nft.token_id);
            self.all_nfts.insert(key.clone(), nft.clone());
            if nft.owner == "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" {
                self.user_nfts.insert(key, nft);
            }
        }

        Ok(())
    }

    /// Cargar NFTs del usuario
    pub fn load_user_nfts(&mut self, address: &str) -> Result<(), JsValue> {
        // Filtrar NFTs del usuario
        self.user_nfts.clear();
        for (key, nft) in &self.all_nfts {
            if nft.owner == address {
                self.user_nfts.insert(key.clone(), nft.clone());
            }
        }
        Ok(())
    }

    /// Obtener NFT por ID
    pub fn get_nft(&self, contract_address: &str, token_id: &str) -> Result<JsValue, JsValue> {
        let key = format!("{}_{}", contract_address, token_id);
        let nft = self.all_nfts.get(&key)
            .ok_or_else(|| JsValue::from_str("NFT no encontrado"))?;
        
        serde_wasm_bindgen::to_value(nft)
            .map_err(|_| JsValue::from_str("Error al serializar NFT"))
    }

    /// Obtener NFTs del usuario
    pub fn get_user_nfts(&self) -> JsValue {
        let nft_list: Vec<&NFTInfo> = self.user_nfts.values().collect();
        serde_wasm_bindgen::to_value(&nft_list).unwrap_or_default()
    }

    /// Obtener NFTs por isla
    pub fn get_nfts_by_island(&self, island: &str) -> JsValue {
        let island_nfts: Vec<&NFTInfo> = self.all_nfts.values()
            .filter(|nft| nft.metadata.island == island)
            .collect();
        
        serde_wasm_bindgen::to_value(&island_nfts).unwrap_or_default()
    }

    /// Obtener NFTs por rareza
    pub fn get_nfts_by_rarity(&self, rarity: &str) -> JsValue {
        let rarity_enum = match rarity.to_lowercase().as_str() {
            "common" => NFTRarity::Common,
            "uncommon" => NFTRarity::Uncommon,
            "rare" => NFTRarity::Rare,
            "epic" => NFTRarity::Epic,
            "legendary" => NFTRarity::Legendary,
            "mythic" => NFTRarity::Mythic,
            _ => return serde_wasm_bindgen::to_value(&Vec::<&NFTInfo>::new()).unwrap_or_default(),
        };

        let rarity_nfts: Vec<&NFTInfo> = self.all_nfts.values()
            .filter(|nft| std::mem::discriminant(&nft.metadata.rarity) == std::mem::discriminant(&rarity_enum))
            .collect();
        
        serde_wasm_bindgen::to_value(&rarity_nfts).unwrap_or_default()
    }

    /// Obtener colección
    pub fn get_collection(&self, symbol: &str) -> Result<JsValue, JsValue> {
        let collection = self.collections.get(symbol)
            .ok_or_else(|| JsValue::from_str("Colección no encontrada"))?;
        
        serde_wasm_bindgen::to_value(collection)
            .map_err(|_| JsValue::from_str("Error al serializar colección"))
    }

    /// Obtener todas las colecciones
    pub fn get_all_collections(&self) -> JsValue {
        let collection_list: Vec<&NFTCollection> = self.collections.values().collect();
        serde_wasm_bindgen::to_value(&collection_list).unwrap_or_default()
    }

    /// Obtener colecciones por isla
    pub fn get_collections_by_island(&self, island: &str) -> JsValue {
        let island_collections: Vec<&NFTCollection> = self.collections.values()
            .filter(|collection| collection.island == island)
            .collect();
        
        serde_wasm_bindgen::to_value(&island_collections).unwrap_or_default()
    }

    /// Mintear NFT (solo para desarrollo)
    pub fn mint_nft(&mut self, collection_symbol: &str, metadata: JsValue) -> Result<String, JsValue> {
        let collection = self.collections.get(collection_symbol)
            .ok_or_else(|| JsValue::from_str("Colección no encontrada"))?;
        
        let nft_metadata: NFTMetadata = serde_wasm_bindgen::from_value(metadata)?;
        
        // Generar token ID
        let token_id = (collection.minted_count + 1).to_string();
        
        let nft = NFTInfo {
            token_id: token_id.clone(),
            contract_address: collection.contract_address.clone(),
            metadata: nft_metadata,
            owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
            is_staked: false,
            staking_rewards: None,
            last_transfer: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            market_price: None,
            market_price_usd: None,
        };

        let key = format!("{}_{}", collection.contract_address, token_id);
        self.all_nfts.insert(key.clone(), nft.clone());
        self.user_nfts.insert(key, nft);

        // Actualizar contador de minted
        if let Some(collection) = self.collections.get_mut(collection_symbol) {
            collection.minted_count += 1;
        }

        Ok(token_id)
    }

    /// Transferir NFT
    pub fn transfer_nft(&mut self, contract_address: &str, token_id: &str, to_address: &str) -> Result<String, JsValue> {
        let key = format!("{}_{}", contract_address, token_id);
        
        // Verificar que el usuario es el propietario
        let nft = self.user_nfts.get(&key)
            .ok_or_else(|| JsValue::from_str("NFT no encontrado o no es propietario"))?;

        // Simular transacción
        let tx_hash = format!("0x{}", hex::encode(&[0u8; 32]));

        // Actualizar propietario
        if let Some(nft) = self.all_nfts.get_mut(&key) {
            nft.owner = to_address.to_string();
            nft.last_transfer = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();
        }

        // Remover de NFTs del usuario si se transfiere a otro
        if to_address != "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" {
            self.user_nfts.remove(&key);
        }

        Ok(tx_hash)
    }

    /// Hacer stake de NFT
    pub fn stake_nft(&mut self, contract_address: &str, token_id: &str) -> Result<(), JsValue> {
        let key = format!("{}_{}", contract_address, token_id);
        
        if let Some(nft) = self.user_nfts.get_mut(&key) {
            nft.is_staked = true;
            nft.staking_rewards = Some("0".to_string());
        }

        if let Some(nft) = self.all_nfts.get_mut(&key) {
            nft.is_staked = true;
            nft.staking_rewards = Some("0".to_string());
        }

        Ok(())
    }

    /// Hacer unstake de NFT
    pub fn unstake_nft(&mut self, contract_address: &str, token_id: &str) -> Result<String, JsValue> {
        let key = format!("{}_{}", contract_address, token_id);
        
        let rewards = if let Some(nft) = self.user_nfts.get(&key) {
            nft.staking_rewards.clone().unwrap_or_else(|| "0".to_string())
        } else {
            "0".to_string()
        };

        if let Some(nft) in self.user_nfts.get_mut(&key) {
            nft.is_staked = false;
            nft.staking_rewards = None;
        }

        if let Some(nft) in self.all_nfts.get_mut(&key) {
            nft.is_staked = false;
            nft.staking_rewards = None;
        }

        Ok(rewards)
    }

    /// Obtener estadísticas de NFTs
    pub fn get_nft_stats(&self) -> JsValue {
        let total_nfts = self.all_nfts.len();
        let user_nfts = self.user_nfts.len();
        let total_collections = self.collections.len();
        let staked_nfts = self.user_nfts.values().filter(|nft| nft.is_staked).count();

        let stats = serde_json::json!({
            "total_nfts": total_nfts,
            "user_nfts": user_nfts,
            "total_collections": total_collections,
            "staked_nfts": staked_nfts,
            "nfts_by_island": {
                "forest": self.get_nfts_by_island("forest"),
                "ocean": self.get_nfts_by_island("ocean"),
                "mountain": self.get_nfts_by_island("mountain"),
                "desert": self.get_nfts_by_island("desert"),
                "city": self.get_nfts_by_island("city"),
                "volcano": self.get_nfts_by_island("volcano"),
                "space": self.get_nfts_by_island("space"),
            },
            "collections_by_island": {
                "forest": self.get_collections_by_island("forest"),
                "ocean": self.get_collections_by_island("ocean"),
                "mountain": self.get_collections_by_island("mountain"),
                "desert": self.get_collections_by_island("desert"),
                "city": self.get_collections_by_island("city"),
                "volcano": self.get_collections_by_island("volcano"),
                "space": self.get_collections_by_island("space"),
            }
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Actualizar red
    pub fn update_network(&mut self, network: &str) -> Result<(), JsValue> {
        self.current_network = network.to_string();
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