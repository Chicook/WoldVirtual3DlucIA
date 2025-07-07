//! Gestor de Marketplace para Metaverso
//! Maneja compra, venta y subastas de NFTs y tokens

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Listado en el marketplace
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceListing {
    pub id: String,
    pub seller: String,
    pub item_type: ItemType,
    pub item_id: String,
    pub price: String,
    pub price_usd: f64,
    pub currency: String,
    pub quantity: u64,
    pub available_quantity: u64,
    pub description: String,
    pub island: String,
    pub created_at: u64,
    pub expires_at: Option<u64>,
    pub is_active: bool,
    pub views: u64,
    pub favorites: u64,
}

/// Tipo de item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ItemType {
    NFT,
    Token,
    Resource,
    CraftingMaterial,
    Weapon,
    Armor,
    Consumable,
    Cosmetic,
}

/// Subasta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Auction {
    pub id: String,
    pub seller: String,
    pub item_type: ItemType,
    pub item_id: String,
    pub starting_price: String,
    pub current_price: String,
    pub current_price_usd: f64,
    pub currency: String,
    pub reserve_price: Option<String>,
    pub start_time: u64,
    pub end_time: u64,
    pub highest_bidder: Option<String>,
    pub bids: Vec<Bid>,
    pub island: String,
    pub is_active: bool,
    pub is_ended: bool,
}

/// Puja en subasta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bid {
    pub bidder: String,
    pub amount: String,
    pub amount_usd: f64,
    pub timestamp: u64,
}

/// Orden de compra
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuyOrder {
    pub id: String,
    pub buyer: String,
    pub item_type: ItemType,
    pub item_id: String,
    pub max_price: String,
    pub max_price_usd: f64,
    pub currency: String,
    pub quantity: u64,
    pub island: String,
    pub created_at: u64,
    pub is_active: bool,
}

/// Transacción del marketplace
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceTransaction {
    pub id: String,
    pub listing_id: String,
    pub buyer: String,
    pub seller: String,
    pub item_type: ItemType,
    pub item_id: String,
    pub price: String,
    pub price_usd: f64,
    pub currency: String,
    pub quantity: u64,
    pub transaction_hash: String,
    pub timestamp: u64,
    pub island: String,
}

/// Gestor de Marketplace
#[wasm_bindgen]
pub struct MarketplaceManager {
    listings: HashMap<String, MarketplaceListing>,
    auctions: HashMap<String, Auction>,
    buy_orders: HashMap<String, BuyOrder>,
    transactions: Vec<MarketplaceTransaction>,
    user_listings: HashMap<String, Vec<String>>,
    user_bids: HashMap<String, Vec<String>>,
    current_network: String,
    is_initialized: bool,
}

#[wasm_bindgen]
impl MarketplaceManager {
    /// Crear nuevo gestor de marketplace
    pub fn new(config: &crate::blockchain::BlockchainConfig) -> Self {
        Self {
            listings: HashMap::new(),
            auctions: HashMap::new(),
            buy_orders: HashMap::new(),
            transactions: Vec::new(),
            user_listings: HashMap::new(),
            user_bids: HashMap::new(),
            current_network: config.default_network.clone(),
            is_initialized: false,
        }
    }

    /// Inicializar el gestor
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.load_sample_listings()?;
        self.load_sample_auctions()?;
        self.is_initialized = true;
        Ok(())
    }

    /// Cargar listados de muestra
    fn load_sample_listings(&mut self) -> Result<(), JsValue> {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let listings = vec![
            MarketplaceListing {
                id: "LISTING_001".to_string(),
                seller: "0x1234567890123456789012345678901234567890".to_string(),
                item_type: ItemType::NFT,
                item_id: "FOREST_CREATURE_001".to_string(),
                price: "1000000000000000000".to_string(), // 1 ETH
                price_usd: 3000.0,
                currency: "ETH".to_string(),
                quantity: 1,
                available_quantity: 1,
                description: "Raro Ancient Tree Guardian con poderes de curación".to_string(),
                island: "forest".to_string(),
                created_at: current_time - 86400, // Hace 1 día
                expires_at: Some(current_time + 2592000), // En 30 días
                is_active: true,
                views: 45,
                favorites: 12,
            },
            MarketplaceListing {
                id: "LISTING_002".to_string(),
                seller: "0x2345678901234567890123456789012345678901".to_string(),
                item_type: ItemType::Token,
                item_id: "GREEN_TOKEN".to_string(),
                price: "500000000000000000000".to_string(), // 500 GREEN
                price_usd: 50.0,
                currency: "GREEN".to_string(),
                quantity: 1000,
                available_quantity: 1000,
                description: "Tokens GREEN para actividades en la Isla del Bosque".to_string(),
                island: "forest".to_string(),
                created_at: current_time - 172800, // Hace 2 días
                expires_at: Some(current_time + 2592000), // En 30 días
                is_active: true,
                views: 23,
                favorites: 5,
            },
            MarketplaceListing {
                id: "LISTING_003".to_string(),
                seller: "0x3456789012345678901234567890123456789012".to_string(),
                item_type: ItemType::Weapon,
                item_id: "MAGIC_SWORD_001".to_string(),
                price: "2000000000000000000".to_string(), // 2 ETH
                price_usd: 6000.0,
                currency: "ETH".to_string(),
                quantity: 1,
                available_quantity: 1,
                description: "Espada mágica con encantamientos de fuego".to_string(),
                island: "forest".to_string(),
                created_at: current_time - 259200, // Hace 3 días
                expires_at: Some(current_time + 2592000), // En 30 días
                is_active: true,
                views: 67,
                favorites: 18,
            },
            MarketplaceListing {
                id: "LISTING_004".to_string(),
                seller: "0x4567890123456789012345678901234567890123".to_string(),
                item_type: ItemType::Resource,
                item_id: "MAGIC_CRYSTAL".to_string(),
                price: "100000000000000000".to_string(), // 0.1 ETH
                price_usd: 300.0,
                currency: "ETH".to_string(),
                quantity: 50,
                available_quantity: 50,
                description: "Cristales mágicos para crafting y encantamientos".to_string(),
                island: "forest".to_string(),
                created_at: current_time - 345600, // Hace 4 días
                expires_at: Some(current_time + 2592000), // En 30 días
                is_active: true,
                views: 89,
                favorites: 25,
            },
        ];

        for listing in listings {
            self.listings.insert(listing.id.clone(), listing.clone());
            
            // Añadir a listados del usuario
            self.user_listings.entry(listing.seller.clone())
                .or_insert_with(Vec::new)
                .push(listing.id.clone());
        }

        Ok(())
    }

    /// Cargar subastas de muestra
    fn load_sample_auctions(&mut self) -> Result<(), JsValue> {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let auctions = vec![
            Auction {
                id: "AUCTION_001".to_string(),
                seller: "0x5678901234567890123456789012345678901234".to_string(),
                item_type: ItemType::NFT,
                item_id: "LEGENDARY_DRAGON_001".to_string(),
                starting_price: "5000000000000000000".to_string(), // 5 ETH
                current_price: "7500000000000000000".to_string(), // 7.5 ETH
                current_price_usd: 22500.0,
                currency: "ETH".to_string(),
                reserve_price: Some("8000000000000000000".to_string()), // 8 ETH
                start_time: current_time - 86400, // Hace 1 día
                end_time: current_time + 518400, // En 6 días
                highest_bidder: Some("0x6789012345678901234567890123456789012345".to_string()),
                bids: vec![
                    Bid {
                        bidder: "0x6789012345678901234567890123456789012345".to_string(),
                        amount: "7500000000000000000".to_string(),
                        amount_usd: 22500.0,
                        timestamp: current_time - 3600, // Hace 1 hora
                    },
                    Bid {
                        bidder: "0x7890123456789012345678901234567890123456".to_string(),
                        amount: "6000000000000000000".to_string(),
                        amount_usd: 18000.0,
                        timestamp: current_time - 7200, // Hace 2 horas
                    },
                ],
                island: "forest".to_string(),
                is_active: true,
                is_ended: false,
            },
            Auction {
                id: "AUCTION_002".to_string(),
                seller: "0x8901234567890123456789012345678901234567".to_string(),
                item_type: ItemType::Weapon,
                item_id: "COSMIC_BLADE_001".to_string(),
                starting_price: "3000000000000000000".to_string(), // 3 ETH
                current_price: "3000000000000000000".to_string(), // 3 ETH
                current_price_usd: 9000.0,
                currency: "ETH".to_string(),
                reserve_price: None,
                start_time: current_time - 172800, // Hace 2 días
                end_time: current_time + 345600, // En 4 días
                highest_bidder: None,
                bids: vec![],
                island: "space".to_string(),
                is_active: true,
                is_ended: false,
            },
        ];

        for auction in auctions {
            self.auctions.insert(auction.id.clone(), auction);
        }

        Ok(())
    }

    /// Crear listado
    pub fn create_listing(&mut self, item_type: &str, item_id: &str, price: &str, currency: &str, quantity: u64, description: &str, island: &str) -> Result<String, JsValue> {
        let seller = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let item_type_enum = match item_type.to_lowercase().as_str() {
            "nft" => ItemType::NFT,
            "token" => ItemType::Token,
            "resource" => ItemType::Resource,
            "crafting_material" => ItemType::CraftingMaterial,
            "weapon" => ItemType::Weapon,
            "armor" => ItemType::Armor,
            "consumable" => ItemType::Consumable,
            "cosmetic" => ItemType::Cosmetic,
            _ => return Err(JsValue::from_str("Tipo de item no válido")),
        };

        let listing_id = format!("LISTING_{:03}", self.listings.len() + 1);
        
        // Calcular precio en USD (simulación)
        let price_usd = match currency {
            "ETH" => price.parse::<f64>().unwrap_or(0.0) * 3000.0,
            "GREEN" => price.parse::<f64>().unwrap_or(0.0) * 0.1,
            "BLUE" => price.parse::<f64>().unwrap_or(0.0) * 0.15,
            "WHITE" => price.parse::<f64>().unwrap_or(0.0) * 0.2,
            "GOLD" => price.parse::<f64>().unwrap_or(0.0) * 0.25,
            "TECH" => price.parse::<f64>().unwrap_or(0.0) * 0.3,
            _ => price.parse::<f64>().unwrap_or(0.0) * 1.0,
        };

        let listing = MarketplaceListing {
            id: listing_id.clone(),
            seller: seller.to_string(),
            item_type: item_type_enum,
            item_id: item_id.to_string(),
            price: price.to_string(),
            price_usd,
            currency: currency.to_string(),
            quantity,
            available_quantity: quantity,
            description: description.to_string(),
            island: island.to_string(),
            created_at: current_time,
            expires_at: Some(current_time + 2592000), // 30 días
            is_active: true,
            views: 0,
            favorites: 0,
        };

        self.listings.insert(listing_id.clone(), listing.clone());
        
        // Añadir a listados del usuario
        self.user_listings.entry(seller.to_string())
            .or_insert_with(Vec::new)
            .push(listing_id.clone());

        Ok(listing_id)
    }

    /// Comrar item
    pub fn buy_item(&mut self, listing_id: &str, quantity: u64) -> Result<String, JsValue> {
        let listing = self.listings.get_mut(listing_id)
            .ok_or_else(|| JsValue::from_str("Listado no encontrado"))?;

        if !listing.is_active {
            return Err(JsValue::from_str("El listado no está activo"));
        }

        if listing.available_quantity < quantity {
            return Err(JsValue::from_str("Cantidad insuficiente disponible"));
        }

        let buyer = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        if listing.seller == buyer {
            return Err(JsValue::from_str("No puedes comprar tu propio item"));
        }

        // Calcular precio total
        let price_per_unit = listing.price.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear precio"))?;
        let total_price = price_per_unit * quantity as u128;

        // Simular transacción
        let tx_hash = format!("0x{}", hex::encode(&[0u8; 32]));
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Actualizar cantidad disponible
        listing.available_quantity -= quantity;
        if listing.available_quantity == 0 {
            listing.is_active = false;
        }

        // Crear transacción
        let transaction = MarketplaceTransaction {
            id: format!("TX_{}", self.transactions.len() + 1),
            listing_id: listing_id.to_string(),
            buyer: buyer.to_string(),
            seller: listing.seller.clone(),
            item_type: listing.item_type.clone(),
            item_id: listing.item_id.clone(),
            price: total_price.to_string(),
            price_usd: listing.price_usd * quantity as f64,
            currency: listing.currency.clone(),
            quantity,
            transaction_hash: tx_hash.clone(),
            timestamp: current_time,
            island: listing.island.clone(),
        };

        self.transactions.push(transaction);

        Ok(tx_hash)
    }

    /// Crear subasta
    pub fn create_auction(&mut self, item_type: &str, item_id: &str, starting_price: &str, currency: &str, duration_days: u64, reserve_price: Option<&str>, island: &str) -> Result<String, JsValue> {
        let seller = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let item_type_enum = match item_type.to_lowercase().as_str() {
            "nft" => ItemType::NFT,
            "token" => ItemType::Token,
            "resource" => ItemType::Resource,
            "crafting_material" => ItemType::CraftingMaterial,
            "weapon" => ItemType::Weapon,
            "armor" => ItemType::Armor,
            "consumable" => ItemType::Consumable,
            "cosmetic" => ItemType::Cosmetic,
            _ => return Err(JsValue::from_str("Tipo de item no válido")),
        };

        let auction_id = format!("AUCTION_{:03}", self.auctions.len() + 1);
        
        // Calcular precio en USD
        let starting_price_usd = match currency {
            "ETH" => starting_price.parse::<f64>().unwrap_or(0.0) * 3000.0,
            "GREEN" => starting_price.parse::<f64>().unwrap_or(0.0) * 0.1,
            "BLUE" => starting_price.parse::<f64>().unwrap_or(0.0) * 0.15,
            "WHITE" => starting_price.parse::<f64>().unwrap_or(0.0) * 0.2,
            "GOLD" => starting_price.parse::<f64>().unwrap_or(0.0) * 0.25,
            "TECH" => starting_price.parse::<f64>().unwrap_or(0.0) * 0.3,
            _ => starting_price.parse::<f64>().unwrap_or(0.0) * 1.0,
        };

        let auction = Auction {
            id: auction_id.clone(),
            seller: seller.to_string(),
            item_type: item_type_enum,
            item_id: item_id.to_string(),
            starting_price: starting_price.to_string(),
            current_price: starting_price.to_string(),
            current_price_usd: starting_price_usd,
            currency: currency.to_string(),
            reserve_price: reserve_price.map(|p| p.to_string()),
            start_time: current_time,
            end_time: current_time + (duration_days * 86400),
            highest_bidder: None,
            bids: Vec::new(),
            island: island.to_string(),
            is_active: true,
            is_ended: false,
        };

        self.auctions.insert(auction_id.clone(), auction);

        Ok(auction_id)
    }

    /// Hacer puja en subasta
    pub fn place_bid(&mut self, auction_id: &str, amount: &str) -> Result<(), JsValue> {
        let auction = self.auctions.get_mut(auction_id)
            .ok_or_else(|| JsValue::from_str("Subasta no encontrada"))?;

        if !auction.is_active || auction.is_ended {
            return Err(JsValue::from_str("La subasta no está activa"));
        }

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if current_time < auction.start_time || current_time > auction.end_time {
            return Err(JsValue::from_str("Fuera del período de subasta"));
        }

        let bidder = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        if auction.seller == bidder {
            return Err(JsValue::from_str("No puedes pujar en tu propia subasta"));
        }

        let bid_amount = amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad"))?;
        let current_price = auction.current_price.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear precio actual"))?;

        if bid_amount <= current_price {
            return Err(JsValue::from_str("La puja debe ser mayor al precio actual"));
        }

        // Calcular precio en USD
        let bid_amount_usd = match auction.currency.as_str() {
            "ETH" => bid_amount as f64 * 3000.0 / 1e18,
            "GREEN" => bid_amount as f64 * 0.1 / 1e18,
            "BLUE" => bid_amount as f64 * 0.15 / 1e18,
            "WHITE" => bid_amount as f64 * 0.2 / 1e18,
            "GOLD" => bid_amount as f64 * 0.25 / 1e18,
            "TECH" => bid_amount as f64 * 0.3 / 1e18,
            _ => bid_amount as f64 / 1e18,
        };

        let bid = Bid {
            bidder: bidder.to_string(),
            amount: amount.to_string(),
            amount_usd: bid_amount_usd,
            timestamp: current_time,
        };

        auction.bids.push(bid);
        auction.current_price = amount.to_string();
        auction.current_price_usd = bid_amount_usd;
        auction.highest_bidder = Some(bidder.to_string());

        // Añadir a pujas del usuario
        self.user_bids.entry(bidder.to_string())
            .or_insert_with(Vec::new)
            .push(auction_id.to_string());

        Ok(())
    }

    /// Finalizar subasta
    pub fn end_auction(&mut self, auction_id: &str) -> Result<Option<String>, JsValue> {
        let auction = self.auctions.get_mut(auction_id)
            .ok_or_else(|| JsValue::from_str("Subasta no encontrada"))?;

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if current_time < auction.end_time {
            return Err(JsValue::from_str("La subasta aún no ha terminado"));
        }

        if auction.is_ended {
            return Err(JsValue::from_str("La subasta ya ha terminado"));
        }

        auction.is_ended = true;
        auction.is_active = false;

        // Verificar si se alcanzó el precio de reserva
        if let Some(reserve_price) = &auction.reserve_price {
            let reserve = reserve_price.parse::<u128>()
                .map_err(|_| JsValue::from_str("Error al parsear precio de reserva"))?;
            let current = auction.current_price.parse::<u128>()
                .map_err(|_| JsValue::from_str("Error al parsear precio actual"))?;

            if current < reserve {
                return Ok(None); // Subasta fallida
            }
        }

        // Simular transacción de venta
        let tx_hash = format!("0x{}", hex::encode(&[0u8; 32]));

        if let Some(winner) = &auction.highest_bidder {
            let transaction = MarketplaceTransaction {
                id: format!("TX_{}", self.transactions.len() + 1),
                listing_id: auction_id.to_string(),
                buyer: winner.clone(),
                seller: auction.seller.clone(),
                item_type: auction.item_type.clone(),
                item_id: auction.item_id.clone(),
                price: auction.current_price.clone(),
                price_usd: auction.current_price_usd,
                currency: auction.currency.clone(),
                quantity: 1,
                transaction_hash: tx_hash.clone(),
                timestamp: current_time,
                island: auction.island.clone(),
            };

            self.transactions.push(transaction);
        }

        Ok(auction.highest_bidder.clone())
    }

    /// Obtener listados
    pub fn get_listings(&self) -> JsValue {
        let listing_list: Vec<&MarketplaceListing> = self.listings.values().collect();
        serde_wasm_bindgen::to_value(&listing_list).unwrap_or_default()
    }

    /// Obtener listados por isla
    pub fn get_listings_by_island(&self, island: &str) -> JsValue {
        let island_listings: Vec<&MarketplaceListing> = self.listings.values()
            .filter(|listing| listing.island == island && listing.is_active)
            .collect();
        
        serde_wasm_bindgen::to_value(&island_listings).unwrap_or_default()
    }

    /// Obtener subastas
    pub fn get_auctions(&self) -> JsValue {
        let auction_list: Vec<&Auction> = self.auctions.values().collect();
        serde_wasm_bindgen::to_value(&auction_list).unwrap_or_default()
    }

    /// Obtener subastas activas
    pub fn get_active_auctions(&self) -> JsValue {
        let active_auctions: Vec<&Auction> = self.auctions.values()
            .filter(|auction| auction.is_active && !auction.is_ended)
            .collect();
        
        serde_wasm_bindgen::to_value(&active_auctions).unwrap_or_default()
    }

    /// Obtener transacciones
    pub fn get_transactions(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.transactions).unwrap_or_default()
    }

    /// Obtener listados del usuario
    pub fn get_user_listings(&self) -> JsValue {
        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let user_listing_ids = self.user_listings.get(user_address).unwrap_or(&Vec::new());
        
        let user_listings: Vec<&MarketplaceListing> = user_listing_ids
            .iter()
            .filter_map(|id| self.listings.get(id))
            .collect();
        
        serde_wasm_bindgen::to_value(&user_listings).unwrap_or_default()
    }

    /// Obtener estadísticas del marketplace
    pub fn get_marketplace_stats(&self) -> JsValue {
        let total_listings = self.listings.len();
        let active_listings = self.listings.values().filter(|l| l.is_active).count();
        let total_auctions = self.auctions.len();
        let active_auctions = self.auctions.values().filter(|a| a.is_active && !a.is_ended).count();
        let total_transactions = self.transactions.len();
        let total_volume_usd: f64 = self.transactions.iter().map(|tx| tx.price_usd).sum();

        let stats = serde_json::json!({
            "total_listings": total_listings,
            "active_listings": active_listings,
            "total_auctions": total_auctions,
            "active_auctions": active_auctions,
            "total_transactions": total_transactions,
            "total_volume_usd": total_volume_usd,
            "listings_by_island": {
                "forest": self.get_listings_by_island("forest"),
                "ocean": self.get_listings_by_island("ocean"),
                "mountain": self.get_listings_by_island("mountain"),
                "desert": self.get_listings_by_island("desert"),
                "city": self.get_listings_by_island("city"),
                "volcano": self.get_listings_by_island("volcano"),
                "space": self.get_listings_by_island("space"),
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