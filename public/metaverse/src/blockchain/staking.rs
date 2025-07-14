//! Gestor de Staking para Metaverso
//! Maneja staking de tokens, NFTs y recompensas

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Pool de staking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StakingPool {
    pub id: String,
    pub name: String,
    pub token_symbol: String,
    pub total_staked: String,
    pub total_staked_usd: f64,
    pub total_rewards_distributed: String,
    pub total_rewards_distributed_usd: f64,
    pub apr: f32,
    pub lock_period: u64,
    pub min_stake_amount: String,
    pub max_stake_amount: Option<String>,
    pub reward_token: String,
    pub reward_rate: f32,
    pub island: String,
    pub is_active: bool,
    pub created_at: u64,
}

/// Posición de staking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StakingPosition {
    pub id: String,
    pub user_address: String,
    pub pool_id: String,
    pub amount_staked: String,
    pub amount_staked_usd: f64,
    pub rewards_earned: String,
    pub rewards_earned_usd: f64,
    pub rewards_claimed: String,
    pub rewards_claimed_usd: f64,
    pub start_time: u64,
    pub end_time: Option<u64>,
    pub lock_end_time: u64,
    pub is_locked: bool,
    pub is_active: bool,
    pub apr_at_stake: f32,
}

/// Información de recompensas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RewardInfo {
    pub token_symbol: String,
    pub amount: String,
    pub amount_usd: f64,
    pub timestamp: u64,
    pub source: String, // "staking", "farming", "activity"
    pub island: String,
}

/// Historial de staking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StakingHistory {
    pub id: String,
    pub user_address: String,
    pub pool_id: String,
    pub action: StakingAction,
    pub amount: String,
    pub amount_usd: f64,
    pub timestamp: u64,
    pub transaction_hash: Option<String>,
}

/// Acción de staking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StakingAction {
    Stake,
    Unstake,
    ClaimRewards,
    Restake,
}

/// Gestor de Staking
#[wasm_bindgen]
pub struct StakingManager {
    pools: HashMap<String, StakingPool>,
    positions: HashMap<String, StakingPosition>,
    rewards: HashMap<String, Vec<RewardInfo>>,
    history: Vec<StakingHistory>,
    current_network: String,
    is_initialized: bool,
}

#[wasm_bindgen]
impl StakingManager {
    /// Crear nuevo gestor de staking
    pub fn new(config: &crate::blockchain::BlockchainConfig) -> Self {
        Self {
            pools: HashMap::new(),
            positions: HashMap::new(),
            rewards: HashMap::new(),
            history: Vec::new(),
            current_network: config.default_network.clone(),
            is_initialized: false,
        }
    }

    /// Inicializar el gestor
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.load_staking_pools()?;
        self.load_user_positions()?;
        self.is_initialized = true;
        Ok(())
    }

    /// Cargar pools de staking
    fn load_staking_pools(&mut self) -> Result<(), JsValue> {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let pools = vec![
            StakingPool {
                id: "GREEN_STAKING_POOL".to_string(),
                name: "Green Token Staking Pool".to_string(),
                token_symbol: "GREEN".to_string(),
                total_staked: "500000000000000000000000".to_string(), // 500K GREEN
                total_staked_usd: 50000.0,
                total_rewards_distributed: "25000000000000000000000".to_string(), // 25K GREEN
                total_rewards_distributed_usd: 2500.0,
                apr: 12.5,
                lock_period: 2592000, // 30 días
                min_stake_amount: "1000000000000000000000".to_string(), // 1000 GREEN
                max_stake_amount: None,
                reward_token: "GREEN".to_string(),
                reward_rate: 0.125,
                island: "forest".to_string(),
                is_active: true,
                created_at: current_time - 2592000, // Hace 30 días
            },
            StakingPool {
                id: "BLUE_STAKING_POOL".to_string(),
                name: "Blue Token Staking Pool".to_string(),
                token_symbol: "BLUE".to_string(),
                total_staked: "300000000000000000000000".to_string(), // 300K BLUE
                total_staked_usd: 45000.0,
                total_rewards_distributed: "15000000000000000000000".to_string(), // 15K BLUE
                total_rewards_distributed_usd: 2250.0,
                apr: 15.0,
                lock_period: 2592000, // 30 días
                min_stake_amount: "1000000000000000000000".to_string(), // 1000 BLUE
                max_stake_amount: None,
                reward_token: "BLUE".to_string(),
                reward_rate: 0.15,
                island: "ocean".to_string(),
                is_active: true,
                created_at: current_time - 2592000, // Hace 30 días
            },
            StakingPool {
                id: "WHITE_STAKING_POOL".to_string(),
                name: "White Token Staking Pool".to_string(),
                token_symbol: "WHITE".to_string(),
                total_staked: "200000000000000000000000".to_string(), // 200K WHITE
                total_staked_usd: 40000.0,
                total_rewards_distributed: "10000000000000000000000".to_string(), // 10K WHITE
                total_rewards_distributed_usd: 2000.0,
                apr: 18.0,
                lock_period: 5184000, // 60 días
                min_stake_amount: "1000000000000000000000".to_string(), // 1000 WHITE
                max_stake_amount: None,
                reward_token: "WHITE".to_string(),
                reward_rate: 0.18,
                island: "mountain".to_string(),
                is_active: true,
                created_at: current_time - 2592000, // Hace 30 días
            },
            StakingPool {
                id: "GOLD_STAKING_POOL".to_string(),
                name: "Gold Token Staking Pool".to_string(),
                token_symbol: "GOLD".to_string(),
                total_staked: "150000000000000000000000".to_string(), // 150K GOLD
                total_staked_usd: 37500.0,
                total_rewards_distributed: "7500000000000000000000".to_string(), // 7.5K GOLD
                total_rewards_distributed_usd: 1875.0,
                apr: 20.0,
                lock_period: 7776000, // 90 días
                min_stake_amount: "1000000000000000000000".to_string(), // 1000 GOLD
                max_stake_amount: None,
                reward_token: "GOLD".to_string(),
                reward_rate: 0.20,
                island: "desert".to_string(),
                is_active: true,
                created_at: current_time - 2592000, // Hace 30 días
            },
            StakingPool {
                id: "TECH_STAKING_POOL".to_string(),
                name: "Tech Token Staking Pool".to_string(),
                token_symbol: "TECH".to_string(),
                total_staked: "100000000000000000000000".to_string(), // 100K TECH
                total_staked_usd: 30000.0,
                total_rewards_distributed: "5000000000000000000000".to_string(), // 5K TECH
                total_rewards_distributed_usd: 1500.0,
                apr: 25.0,
                lock_period: 10368000, // 120 días
                min_stake_amount: "1000000000000000000000".to_string(), // 1000 TECH
                max_stake_amount: None,
                reward_token: "TECH".to_string(),
                reward_rate: 0.25,
                island: "city".to_string(),
                is_active: true,
                created_at: current_time - 2592000, // Hace 30 días
            },
        ];

        for pool in pools {
            self.pools.insert(pool.id.clone(), pool);
        }

        Ok(())
    }

    /// Cargar posiciones del usuario
    fn load_user_positions(&mut self) -> Result<(), JsValue> {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

        let positions = vec![
            StakingPosition {
                id: "POS_001".to_string(),
                user_address: user_address.to_string(),
                pool_id: "GREEN_STAKING_POOL".to_string(),
                amount_staked: "10000000000000000000000".to_string(), // 10K GREEN
                amount_staked_usd: 1000.0,
                rewards_earned: "500000000000000000000".to_string(), // 500 GREEN
                rewards_earned_usd: 50.0,
                rewards_claimed: "200000000000000000000".to_string(), // 200 GREEN
                rewards_claimed_usd: 20.0,
                start_time: current_time - 2592000, // Hace 30 días
                end_time: None,
                lock_end_time: current_time + 2592000, // En 30 días
                is_locked: true,
                is_active: true,
                apr_at_stake: 12.5,
            },
            StakingPosition {
                id: "POS_002".to_string(),
                user_address: user_address.to_string(),
                pool_id: "BLUE_STAKING_POOL".to_string(),
                amount_staked: "5000000000000000000000".to_string(), // 5K BLUE
                amount_staked_usd: 750.0,
                rewards_earned: "250000000000000000000".to_string(), // 250 BLUE
                rewards_earned_usd: 37.5,
                rewards_claimed: "100000000000000000000".to_string(), // 100 BLUE
                rewards_claimed_usd: 15.0,
                start_time: current_time - 1728000, // Hace 20 días
                end_time: None,
                lock_end_time: current_time + 3456000, // En 40 días
                is_locked: true,
                is_active: true,
                apr_at_stake: 15.0,
            },
        ];

        for position in positions {
            self.positions.insert(position.id.clone(), position);
        }

        Ok(())
    }

    /// Obtener pools de staking
    pub fn get_staking_pools(&self) -> JsValue {
        let pool_list: Vec<&StakingPool> = self.pools.values().collect();
        serde_wasm_bindgen::to_value(&pool_list).unwrap_or_default()
    }

    /// Obtener pools por isla
    pub fn get_pools_by_island(&self, island: &str) -> JsValue {
        let island_pools: Vec<&StakingPool> = self.pools.values()
            .filter(|pool| pool.island == island && pool.is_active)
            .collect();
        
        serde_wasm_bindgen::to_value(&island_pools).unwrap_or_default()
    }

    /// Obtener pool específico
    pub fn get_pool(&self, pool_id: &str) -> Result<JsValue, JsValue> {
        let pool = self.pools.get(pool_id)
            .ok_or_else(|| JsValue::from_str("Pool no encontrado"))?;
        
        serde_wasm_bindgen::to_value(pool)
            .map_err(|_| JsValue::from_str("Error al serializar pool"))
    }

    /// Hacer stake
    pub fn stake(&mut self, pool_id: &str, amount: &str) -> Result<String, JsValue> {
        let pool = self.pools.get_mut(pool_id)
            .ok_or_else(|| JsValue::from_str("Pool no encontrado"))?;

        if !pool.is_active {
            return Err(JsValue::from_str("El pool no está activo"));
        }

        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let stake_amount = amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad"))?;
        let min_stake = pool.min_stake_amount.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad mínima"))?;

        if stake_amount < min_stake {
            return Err(JsValue::from_str("Cantidad menor al mínimo requerido"));
        }

        if let Some(max_stake) = &pool.max_stake_amount {
            let max_stake_amount = max_stake.parse::<u128>()
                .map_err(|_| JsValue::from_str("Error al parsear cantidad máxima"))?;
            if stake_amount > max_stake_amount {
                return Err(JsValue::from_str("Cantidad mayor al máximo permitido"));
            }
        }

        // Calcular valor en USD
        let stake_amount_usd = match pool.token_symbol.as_str() {
            "GREEN" => stake_amount as f64 * 0.1 / 1e18,
            "BLUE" => stake_amount as f64 * 0.15 / 1e18,
            "WHITE" => stake_amount as f64 * 0.2 / 1e18,
            "GOLD" => stake_amount as f64 * 0.25 / 1e18,
            "TECH" => stake_amount as f64 * 0.3 / 1e18,
            _ => stake_amount as f64 / 1e18,
        };

        // Crear posición de staking
        let position_id = format!("POS_{:03}", self.positions.len() + 1);
        let position = StakingPosition {
            id: position_id.clone(),
            user_address: user_address.to_string(),
            pool_id: pool_id.to_string(),
            amount_staked: amount.to_string(),
            amount_staked_usd: stake_amount_usd,
            rewards_earned: "0".to_string(),
            rewards_earned_usd: 0.0,
            rewards_claimed: "0".to_string(),
            rewards_claimed_usd: 0.0,
            start_time: current_time,
            end_time: None,
            lock_end_time: current_time + pool.lock_period,
            is_locked: true,
            is_active: true,
            apr_at_stake: pool.apr,
        };

        self.positions.insert(position_id.clone(), position);

        // Actualizar pool
        let total_staked = pool.total_staked.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear total staked"))?;
        pool.total_staked = (total_staked + stake_amount).to_string();
        pool.total_staked_usd += stake_amount_usd;

        // Crear entrada en historial
        let history_entry = StakingHistory {
            id: format!("HIST_{}", self.history.len() + 1),
            user_address: user_address.to_string(),
            pool_id: pool_id.to_string(),
            action: StakingAction::Stake,
            amount: amount.to_string(),
            amount_usd: stake_amount_usd,
            timestamp: current_time,
            transaction_hash: Some(format!("0x{}", hex::encode(&[0u8; 32]))),
        };

        self.history.push(history_entry);

        Ok(position_id)
    }

    /// Hacer unstake
    pub fn unstake(&mut self, position_id: &str) -> Result<(String, String), JsValue> {
        let position = self.positions.get_mut(position_id)
            .ok_or_else(|| JsValue::from_str("Posición no encontrada"))?;

        if !position.is_active {
            return Err(JsValue::from_str("La posición no está activa"));
        }

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if position.is_locked && current_time < position.lock_end_time {
            return Err(JsValue::from_str("La posición aún está bloqueada"));
        }

        // Calcular recompensas pendientes
        let pending_rewards = self.calculate_pending_rewards(position)?;

        position.is_active = false;
        position.end_time = Some(current_time);

        // Actualizar pool
        if let Some(pool) = self.pools.get_mut(&position.pool_id) {
            let total_staked = pool.total_staked.parse::<u128>()
                .map_err(|_| JsValue::from_str("Error al parsear total staked"))?;
            let position_staked = position.amount_staked.parse::<u128>()
                .map_err(|_| JsValue::from_str("Error al parsear cantidad staked"))?;
            
            pool.total_staked = (total_staked - position_staked).to_string();
            pool.total_staked_usd -= position.amount_staked_usd;
        }

        // Crear entrada en historial
        let history_entry = StakingHistory {
            id: format!("HIST_{}", self.history.len() + 1),
            user_address: position.user_address.clone(),
            pool_id: position.pool_id.clone(),
            action: StakingAction::Unstake,
            amount: position.amount_staked.clone(),
            amount_usd: position.amount_staked_usd,
            timestamp: current_time,
            transaction_hash: Some(format!("0x{}", hex::encode(&[0u8; 32]))),
        };

        self.history.push(history_entry);

        Ok((position.amount_staked.clone(), pending_rewards))
    }

    /// Reclamar recompensas
    pub fn claim_rewards(&mut self, position_id: &str) -> Result<String, JsValue> {
        let position = self.positions.get_mut(position_id)
            .ok_or_else(|| JsValue::from_str("Posición no encontrada"))?;

        if !position.is_active {
            return Err(JsValue::from_str("La posición no está activa"));
        }

        // Calcular recompensas pendientes
        let pending_rewards = self.calculate_pending_rewards(position)?;
        
        if pending_rewards == "0" {
            return Err(JsValue::from_str("No hay recompensas para reclamar"));
        }

        // Actualizar recompensas reclamadas
        let claimed_rewards = position.rewards_claimed.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear recompensas reclamadas"))?;
        let pending_rewards_u128 = pending_rewards.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear recompensas pendientes"))?;
        
        position.rewards_claimed = (claimed_rewards + pending_rewards_u128).to_string();

        // Calcular valor en USD
        let pending_rewards_usd = match position.pool_id.as_str() {
            "GREEN_STAKING_POOL" => pending_rewards_u128 as f64 * 0.1 / 1e18,
            "BLUE_STAKING_POOL" => pending_rewards_u128 as f64 * 0.15 / 1e18,
            "WHITE_STAKING_POOL" => pending_rewards_u128 as f64 * 0.2 / 1e18,
            "GOLD_STAKING_POOL" => pending_rewards_u128 as f64 * 0.25 / 1e18,
            "TECH_STAKING_POOL" => pending_rewards_u128 as f64 * 0.3 / 1e18,
            _ => pending_rewards_u128 as f64 / 1e18,
        };

        position.rewards_claimed_usd += pending_rewards_usd;

        // Actualizar pool
        if let Some(pool) = self.pools.get_mut(&position.pool_id) {
            let total_rewards = pool.total_rewards_distributed.parse::<u128>()
                .map_err(|_| JsValue::from_str("Error al parsear total recompensas"))?;
            
            pool.total_rewards_distributed = (total_rewards + pending_rewards_u128).to_string();
            pool.total_rewards_distributed_usd += pending_rewards_usd;
        }

        // Crear entrada en historial
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let history_entry = StakingHistory {
            id: format!("HIST_{}", self.history.len() + 1),
            user_address: position.user_address.clone(),
            pool_id: position.pool_id.clone(),
            action: StakingAction::ClaimRewards,
            amount: pending_rewards.clone(),
            amount_usd: pending_rewards_usd,
            timestamp: current_time,
            transaction_hash: Some(format!("0x{}", hex::encode(&[0u8; 32]))),
        };

        self.history.push(history_entry);

        Ok(pending_rewards)
    }

    /// Calcular recompensas pendientes
    fn calculate_pending_rewards(&self, position: &StakingPosition) -> Result<String, JsValue> {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let staked_amount = position.amount_staked.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear cantidad staked"))?;
        let claimed_rewards = position.rewards_claimed.parse::<u128>()
            .map_err(|_| JsValue::from_str("Error al parsear recompensas reclamadas"))?;

        let time_staked = current_time - position.start_time;
        let days_staked = time_staked as f64 / 86400.0; // Convertir a días

        let annual_reward_rate = position.apr_at_stake / 100.0;
        let daily_reward_rate = annual_reward_rate / 365.0;
        let total_rewards = staked_amount as f64 * daily_reward_rate * days_staked;
        let pending_rewards = total_rewards - claimed_rewards as f64;

        Ok((pending_rewards * 1e18) as u128.to_string())
    }

    /// Obtener posiciones del usuario
    pub fn get_user_positions(&self) -> JsValue {
        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let user_positions: Vec<&StakingPosition> = self.positions.values()
            .filter(|pos| pos.user_address == user_address)
            .collect();
        
        serde_wasm_bindgen::to_value(&user_positions).unwrap_or_default()
    }

    /// Obtener posiciones activas
    pub fn get_active_positions(&self) -> JsValue {
        let active_positions: Vec<&StakingPosition> = self.positions.values()
            .filter(|pos| pos.is_active)
            .collect();
        
        serde_wasm_bindgen::to_value(&active_positions).unwrap_or_default()
    }

    /// Obtener historial de staking
    pub fn get_staking_history(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.history).unwrap_or_default()
    }

    /// Obtener recompensas del usuario
    pub fn get_user_rewards(&self) -> JsValue {
        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let user_rewards = self.rewards.get(user_address).unwrap_or(&Vec::new());
        
        serde_wasm_bindgen::to_value(user_rewards).unwrap_or_default()
    }

    /// Obtener estadísticas de staking
    pub fn get_staking_stats(&self) -> JsValue {
        let total_pools = self.pools.len();
        let active_pools = self.pools.values().filter(|pool| pool.is_active).count();
        let total_positions = self.positions.len();
        let active_positions = self.positions.values().filter(|pos| pos.is_active).count();
        let total_staked_usd: f64 = self.pools.values().map(|pool| pool.total_staked_usd).sum();
        let total_rewards_usd: f64 = self.pools.values().map(|pool| pool.total_rewards_distributed_usd).sum();

        let stats = serde_json::json!({
            "total_pools": total_pools,
            "active_pools": active_pools,
            "total_positions": total_positions,
            "active_positions": active_positions,
            "total_staked_usd": total_staked_usd,
            "total_rewards_usd": total_rewards_usd,
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