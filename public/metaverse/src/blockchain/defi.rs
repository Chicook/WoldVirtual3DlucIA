//! Gestor de DeFi para Metaverso
//! Maneja staking, yield farming, liquidity pools y otros protocolos DeFi

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Pool de liquidez
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiquidityPool {
    pub id: String,
    pub name: String,
    pub token_a: String,
    pub token_b: String,
    pub reserve_a: String,
    pub reserve_b: String,
    pub total_supply: String,
    pub fee_percentage: f32,
    pub apr: f32,
    pub tvl_usd: f64,
    pub volume_24h: f64,
    pub island: String,
}

/// Posición de staking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StakingPosition {
    pub id: String,
    pub token_symbol: String,
    pub amount_staked: String,
    pub amount_staked_usd: f64,
    pub rewards_earned: String,
    pub rewards_earned_usd: f64,
    pub apr: f32,
    pub start_time: u64,
    pub end_time: Option<u64>,
    pub is_active: bool,
    pub island: String,
}

/// Posición de yield farming
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FarmingPosition {
    pub id: String,
    pub pool_id: String,
    pub lp_tokens_staked: String,
    pub lp_tokens_staked_usd: f64,
    pub rewards_earned: HashMap<String, String>, // token -> amount
    pub rewards_earned_usd: f64,
    pub apr: f32,
    pub start_time: u64,
    pub end_time: Option<u64>,
    pub is_active: bool,
    pub island: String,
}

/// Información de préstamo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoanInfo {
    pub id: String,
    pub collateral_token: String,
    pub collateral_amount: String,
    pub collateral_amount_usd: f64,
    pub borrowed_token: String,
    pub borrowed_amount: String,
    pub borrowed_amount_usd: f64,
    pub interest_rate: f32,
    pub liquidation_threshold: f32,
    pub health_factor: f32,
    pub start_time: u64,
    pub due_time: u64,
    pub is_active: bool,
    pub island: String,
}

/// Gestor de DeFi
#[wasm_bindgen]
pub struct DeFiManager {
    liquidity_pools: HashMap<String, LiquidityPool>,
    staking_positions: HashMap<String, StakingPosition>,
    farming_positions: HashMap<String, FarmingPosition>,
    loans: HashMap<String, LoanInfo>,
    current_network: String,
    is_initialized: bool,
}

#[wasm_bindgen]
impl DeFiManager {
    /// Crear nuevo gestor de DeFi
    pub fn new(config: &crate::blockchain::BlockchainConfig) -> Self {
        Self {
            liquidity_pools: HashMap::new(),
            staking_positions: HashMap::new(),
            farming_positions: HashMap::new(),
            loans: HashMap::new(),
            current_network: config.default_network.clone(),
            is_initialized: false,
        }
    }

    /// Inicializar el gestor
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.load_liquidity_pools()?;
        self.load_user_positions()?;
        self.is_initialized = true;
        Ok(())
    }

    /// Cargar pools de liquidez
    fn load_liquidity_pools(&mut self) -> Result<(), JsValue> {
        let pools = vec![
            LiquidityPool {
                id: "GREEN_ETH_POOL".to_string(),
                name: "GREEN/ETH Pool".to_string(),
                token_a: "GREEN".to_string(),
                token_b: "ETH".to_string(),
                reserve_a: "1000000000000000000000000".to_string(), // 1M GREEN
                reserve_b: "1000000000000000000000".to_string(), // 1000 ETH
                total_supply: "1000000000000000000000".to_string(), // 1M LP tokens
                fee_percentage: 0.3,
                apr: 15.5,
                tvl_usd: 3000000.0,
                volume_24h: 150000.0,
                island: "forest".to_string(),
            },
            LiquidityPool {
                id: "BLUE_ETH_POOL".to_string(),
                name: "BLUE/ETH Pool".to_string(),
                token_a: "BLUE".to_string(),
                token_b: "ETH".to_string(),
                reserve_a: "800000000000000000000000".to_string(), // 800K BLUE
                reserve_b: "1200000000000000000000".to_string(), // 1200 ETH
                total_supply: "800000000000000000000".to_string(), // 800K LP tokens
                fee_percentage: 0.3,
                apr: 18.2,
                tvl_usd: 4200000.0,
                volume_24h: 200000.0,
                island: "ocean".to_string(),
            },
            LiquidityPool {
                id: "WHITE_ETH_POOL".to_string(),
                name: "WHITE/ETH Pool".to_string(),
                token_a: "WHITE".to_string(),
                token_b: "ETH".to_string(),
                reserve_a: "600000000000000000000000".to_string(), // 600K WHITE
                reserve_b: "1200000000000000000000".to_string(), // 1200 ETH
                total_supply: "600000000000000000000".to_string(), // 600K LP tokens
                fee_percentage: 0.3,
                apr: 20.1,
                tvl_usd: 3600000.0,
                volume_24h: 180000.0,
                island: "mountain".to_string(),
            },
            LiquidityPool {
                id: "GOLD_ETH_POOL".to_string(),
                name: "GOLD/ETH Pool".to_string(),
                token_a: "GOLD".to_string(),
                token_b: "ETH".to_string(),
                reserve_a: "500000000000000000000000".to_string(), // 500K GOLD
                reserve_b: "1250000000000000000000".to_string(), // 1250 ETH
                total_supply: "500000000000000000000".to_string(), // 500K LP tokens
                fee_percentage: 0.3,
                apr: 22.5,
                tvl_usd: 3750000.0,
                volume_24h: 220000.0,
                island: "desert".to_string(),
            },
            LiquidityPool {
                id: "TECH_ETH_POOL".to_string(),
                name: "TECH/ETH Pool".to_string(),
                token_a: "TECH".to_string(),
                token_b: "ETH".to_string(),
                reserve_a: "400000000000000000000000".to_string(), // 400K TECH
                reserve_b: "1200000000000000000000".to_string(), // 1200 ETH
                total_supply: "400000000000000000000".to_string(), // 400K LP tokens
                fee_percentage: 0.3,
                apr: 25.8,
                tvl_usd: 3600000.0,
                volume_24h: 250000.0,
                island: "city".to_string(),
            },
        ];

        for pool in pools {
            self.liquidity_pools.insert(pool.id.clone(), pool);
        }

        Ok(())
    }

    /// Cargar posiciones del usuario
    fn load_user_positions(&mut self) -> Result<(), JsValue> {
        // Posiciones de staking
        let staking_positions = vec![
            StakingPosition {
                id: "STAKING_1".to_string(),
                token_symbol: "GREEN".to_string(),
                amount_staked: "100000000000000000000".to_string(), // 100 GREEN
                amount_staked_usd: 10.0,
                rewards_earned: "50000000000000000000".to_string(), // 50 GREEN
                rewards_earned_usd: 5.0,
                apr: 12.5,
                start_time: 1640995200,
                end_time: None,
                is_active: true,
                island: "forest".to_string(),
            },
            StakingPosition {
                id: "STAKING_2".to_string(),
                token_symbol: "BLUE".to_string(),
                amount_staked: "50000000000000000000".to_string(), // 50 BLUE
                amount_staked_usd: 7.5,
                rewards_earned: "25000000000000000000".to_string(), // 25 BLUE
                rewards_earned_usd: 3.75,
                apr: 15.0,
                start_time: 1640995200,
                end_time: None,
                is_active: true,
                island: "ocean".to_string(),
            },
        ];

        for position in staking_positions {
            self.staking_positions.insert(position.id.clone(), position);
        }

        // Posiciones de farming
        let farming_positions = vec![
            FarmingPosition {
                id: "FARMING_1".to_string(),
                pool_id: "GREEN_ETH_POOL".to_string(),
                lp_tokens_staked: "100000000000000000000".to_string(), // 100 LP tokens
                lp_tokens_staked_usd: 300.0,
                rewards_earned: {
                    let mut rewards = HashMap::new();
                    rewards.insert("GREEN".to_string(), "200000000000000000000".to_string()); // 200 GREEN
                    rewards.insert("ETH".to_string(), "1000000000000000000".to_string()); // 1 ETH
                    rewards
                },
                rewards_earned_usd: 3300.0,
                apr: 15.5,
                start_time: 1640995200,
                end_time: None,
                is_active: true,
                island: "forest".to_string(),
            },
        ];

        for position in farming_positions {
            self.farming_positions.insert(position.id.clone(), position);
        }

        Ok(())
    }

    /// Obtener pools de liquidez
    pub fn get_liquidity_pools(&self) -> JsValue {
        let pool_list: Vec<&LiquidityPool> = self.liquidity_pools.values().collect();
        serde_wasm_bindgen::to_value(&pool_list).unwrap_or_default()
    }

    /// Obtener pools por isla
    pub fn get_pools_by_island(&self, island: &str) -> JsValue {
        let island_pools: Vec<&LiquidityPool> = self.liquidity_pools.values()
            .filter(|pool| pool.island == island)
            .collect();
        
        serde_wasm_bindgen::to_value(&island_pools).unwrap_or_default()
    }

    /// Obtener pool específico
    pub fn get_pool(&self, pool_id: &str) -> Result<JsValue, JsValue> {
        let pool = self.liquidity_pools.get(pool_id)
            .ok_or_else(|| JsValue::from_str("Pool no encontrado"))?;
        
        serde_wasm_bindgen::to_value(pool)
            .map_err(|_| JsValue::from_str("Error al serializar pool"))
    }

    /// Añadir liquidez
    pub fn add_liquidity(&mut self, pool_id: &str, token_a_amount: &str, token_b_amount: &str) -> Result<String, JsValue> {
        let pool = self.liquidity_pools.get_mut(pool_id)
            .ok_or_else(|| JsValue::from_str("Pool no encontrado"))?;

        // Simular añadir liquidez
        let lp_tokens_minted = "100000000000000000000".to_string(); // 100 LP tokens

        // Actualizar reservas del pool
        let token_a_amount_u128 = token_a_amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad token A"))?;
        let token_b_amount_u128 = token_b_amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad token B"))?;

        let reserve_a = pool.reserve_a.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear reserva A"))?;
        let reserve_b = pool.reserve_b.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear reserva B"))?;

        pool.reserve_a = (reserve_a + token_a_amount_u128).to_string();
        pool.reserve_b = (reserve_b + token_b_amount_u128).to_string();

        let total_supply = pool.total_supply.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear supply total"))?;
        let lp_tokens_minted_u128 = lp_tokens_minted.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear LP tokens"))?;

        pool.total_supply = (total_supply + lp_tokens_minted_u128).to_string();

        Ok(lp_tokens_minted)
    }

    /// Remover liquidez
    pub fn remove_liquidity(&mut self, pool_id: &str, lp_tokens_amount: &str) -> Result<(String, String), JsValue> {
        let pool = self.liquidity_pools.get_mut(pool_id)
            .ok_or_else(|| JsValue::from_str("Pool no encontrado"))?;

        // Simular remover liquidez
        let token_a_returned = "50000000000000000000000".to_string(); // 50K tokens A
        let token_b_returned = "50000000000000000000".to_string(); // 50 tokens B

        // Actualizar reservas del pool
        let lp_tokens_amount_u128 = lp_tokens_amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad LP tokens"))?;
        let token_a_returned_u128 = token_a_returned.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear tokens A retornados"))?;
        let token_b_returned_u128 = token_b_returned.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear tokens B retornados"))?;

        let reserve_a = pool.reserve_a.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear reserva A"))?;
        let reserve_b = pool.reserve_b.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear reserva B"))?;
        let total_supply = pool.total_supply.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear supply total"))?;

        pool.reserve_a = (reserve_a - token_a_returned_u128).to_string();
        pool.reserve_b = (reserve_b - token_b_returned_u128).to_string();
        pool.total_supply = (total_supply - lp_tokens_amount_u128).to_string();

        Ok((token_a_returned, token_b_returned))
    }

    /// Hacer stake de tokens
    pub fn stake_tokens(&mut self, token_symbol: &str, amount: &str) -> Result<String, JsValue> {
        let position_id = format!("STAKING_{}", self.staking_positions.len() + 1);
        
        let amount_u128 = amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad"))?;

        // Determinar isla basada en el token
        let island = match token_symbol {
            "GREEN" => "forest",
            "BLUE" => "ocean",
            "WHITE" => "mountain",
            "GOLD" => "desert",
            "TECH" => "city",
            "FIRE" => "volcano",
            "COSMIC" => "space",
            _ => "unknown",
        };

        let position = StakingPosition {
            id: position_id.clone(),
            token_symbol: token_symbol.to_string(),
            amount_staked: amount.to_string(),
            amount_staked_usd: amount_u128 as f64 * 0.1 / 1e18, // Asumiendo precio de $0.1
            rewards_earned: "0".to_string(),
            rewards_earned_usd: 0.0,
            apr: 12.5,
            start_time: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            end_time: None,
            is_active: true,
            island: island.to_string(),
        };

        self.staking_positions.insert(position_id.clone(), position);
        Ok(position_id)
    }

    /// Hacer unstake de tokens
    pub fn unstake_tokens(&mut self, position_id: &str) -> Result<(String, String), JsValue> {
        let position = self.staking_positions.get_mut(position_id)
            .ok_or_else(|| JsValue::from_str("Posición no encontrada"))?;

        if !position.is_active {
            return Err(JsValue::from_str("Posición ya no está activa"));
        }

        position.is_active = false;
        position.end_time = Some(std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs());

        Ok((position.amount_staked.clone(), position.rewards_earned.clone()))
    }

    /// Obtener posiciones de staking
    pub fn get_staking_positions(&self) -> JsValue {
        let position_list: Vec<&StakingPosition> = self.staking_positions.values().collect();
        serde_wasm_bindgen::to_value(&position_list).unwrap_or_default()
    }

    /// Obtener posiciones de farming
    pub fn get_farming_positions(&self) -> JsValue {
        let position_list: Vec<&FarmingPosition> = self.farming_positions.values().collect();
        serde_wasm_bindgen::to_value(&position_list).unwrap_or_default()
    }

    /// Hacer stake en farming
    pub fn stake_in_farming(&mut self, pool_id: &str, lp_tokens_amount: &str) -> Result<String, JsValue> {
        let pool = self.liquidity_pools.get(pool_id)
            .ok_or_else(|| JsValue::from_str("Pool no encontrado"))?;

        let position_id = format!("FARMING_{}", self.farming_positions.len() + 1);
        
        let position = FarmingPosition {
            id: position_id.clone(),
            pool_id: pool_id.to_string(),
            lp_tokens_staked: lp_tokens_amount.to_string(),
            lp_tokens_staked_usd: lp_tokens_amount.parse::<u128>()
                .unwrap_or(0) as f64 * 3.0 / 1e18, // Asumiendo $3 por LP token
            rewards_earned: HashMap::new(),
            rewards_earned_usd: 0.0,
            apr: pool.apr,
            start_time: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            end_time: None,
            is_active: true,
            island: pool.island.clone(),
        };

        self.farming_positions.insert(position_id.clone(), position);
        Ok(position_id)
    }

    /// Reclamar recompensas de farming
    pub fn claim_farming_rewards(&mut self, position_id: &str) -> Result<HashMap<String, String>, JsValue> {
        let position = self.farming_positions.get_mut(position_id)
            .ok_or_else(|| JsValue::from_str("Posición no encontrada"))?;

        if !position.is_active {
            return Err(JsValue::from_str("Posición no está activa"));
        }

        // Simular recompensas
        let mut rewards = HashMap::new();
        rewards.insert("GREEN".to_string(), "100000000000000000000".to_string()); // 100 GREEN
        rewards.insert("ETH".to_string(), "500000000000000000".to_string()); // 0.5 ETH

        position.rewards_earned = rewards.clone();
        position.rewards_earned_usd = 350.0; // $350 en recompensas

        Ok(rewards)
    }

    /// Obtener estadísticas de DeFi
    pub fn get_defi_stats(&self) -> JsValue {
        let total_tvl = self.liquidity_pools.values().map(|pool| pool.tvl_usd).sum::<f64>();
        let total_volume_24h = self.liquidity_pools.values().map(|pool| pool.volume_24h).sum::<f64>();
        let active_staking_positions = self.staking_positions.values().filter(|pos| pos.is_active).count();
        let active_farming_positions = self.farming_positions.values().filter(|pos| pos.is_active).count();

        let stats = serde_json::json!({
            "total_tvl": total_tvl,
            "total_volume_24h": total_volume_24h,
            "active_staking_positions": active_staking_positions,
            "active_farming_positions": active_farming_positions,
            "pools_by_island": {
                "forest": self.get_pools_by_island("forest"),
                "ocean": self.get_pools_by_island("ocean"),
                "mountain": self.get_pools_by_island("mountain"),
                "desert": self.get_pools_by_island("desert"),
                "city": self.get_pools_by_island("city"),
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