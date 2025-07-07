//! Gestor de Governance para Metaverso
//! Maneja propuestas, votaciones y decisiones DAO

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Propuesta de governance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proposal {
    pub id: String,
    pub title: String,
    pub description: String,
    pub proposer: String,
    pub island: String,
    pub category: ProposalCategory,
    pub status: ProposalStatus,
    pub start_time: u64,
    pub end_time: u64,
    pub voting_power_required: u64,
    pub total_votes: u64,
    pub votes_for: u64,
    pub votes_against: u64,
    pub votes_abstain: u64,
    pub executed: bool,
    pub execution_time: Option<u64>,
}

/// Categoría de propuesta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProposalCategory {
    IslandDevelopment,
    TokenEconomics,
    FeatureRequest,
    SecurityUpdate,
    CommunityInitiative,
    TreasuryAllocation,
    Partnership,
    TechnicalUpgrade,
}

/// Estado de propuesta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProposalStatus {
    Active,
    Pending,
    Executed,
    Defeated,
    Expired,
    Cancelled,
}

/// Voto de usuario
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vote {
    pub proposal_id: String,
    pub voter: String,
    pub vote_type: VoteType,
    pub voting_power: u64,
    pub timestamp: u64,
    pub reason: Option<String>,
}

/// Tipo de voto
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VoteType {
    For,
    Against,
    Abstain,
}

/// Delegación de votos
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delegation {
    pub delegator: String,
    pub delegate: String,
    pub amount: u64,
    pub start_time: u64,
    pub end_time: Option<u64>,
    pub is_active: bool,
}

/// Información de governance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GovernanceInfo {
    pub total_proposals: u64,
    pub active_proposals: u64,
    pub total_voters: u64,
    pub total_voting_power: u64,
    pub quorum_required: u64,
    pub proposal_threshold: u64,
    pub voting_period: u64,
    pub execution_delay: u64,
}

/// Gestor de Governance
#[wasm_bindgen]
pub struct GovernanceManager {
    proposals: HashMap<String, Proposal>,
    votes: HashMap<String, Vec<Vote>>,
    delegations: HashMap<String, Delegation>,
    governance_info: GovernanceInfo,
    user_voting_power: HashMap<String, u64>,
    current_network: String,
    is_initialized: bool,
}

#[wasm_bindgen]
impl GovernanceManager {
    /// Crear nuevo gestor de governance
    pub fn new(config: &crate::blockchain::BlockchainConfig) -> Self {
        Self {
            proposals: HashMap::new(),
            votes: HashMap::new(),
            delegations: HashMap::new(),
            governance_info: GovernanceInfo {
                total_proposals: 0,
                active_proposals: 0,
                total_voters: 0,
                total_voting_power: 1000000000000000000000000, // 1M tokens
                quorum_required: 100000000000000000000000, // 100K tokens (10%)
                proposal_threshold: 10000000000000000000000, // 10K tokens
                voting_period: 604800, // 7 días
                execution_delay: 86400, // 1 día
            },
            user_voting_power: HashMap::new(),
            current_network: config.default_network.clone(),
            is_initialized: false,
        }
    }

    /// Inicializar el gestor
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.load_sample_proposals()?;
        self.load_user_voting_power()?;
        self.is_initialized = true;
        Ok(())
    }

    /// Cargar propuestas de muestra
    fn load_sample_proposals(&mut self) -> Result<(), JsValue> {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let proposals = vec![
            Proposal {
                id: "PROP_001".to_string(),
                title: "Nuevo sistema de recompensas para la Isla del Bosque".to_string(),
                description: "Implementar un sistema mejorado de recompensas para actividades en la Isla del Bosque, incluyendo bonus por exploración y crafting.".to_string(),
                proposer: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6".to_string(),
                island: "forest".to_string(),
                category: ProposalCategory::IslandDevelopment,
                status: ProposalStatus::Active,
                start_time: current_time - 86400, // Hace 1 día
                end_time: current_time + 518400, // En 6 días
                voting_power_required: 10000000000000000000000, // 10K tokens
                total_votes: 50000000000000000000000, // 50K tokens
                votes_for: 35000000000000000000000, // 35K tokens
                votes_against: 10000000000000000000000, // 10K tokens
                votes_abstain: 5000000000000000000000, // 5K tokens
                executed: false,
                execution_time: None,
            },
            Proposal {
                id: "PROP_002".to_string(),
                title: "Aumentar el suministro total de GREEN tokens".to_string(),
                description: "Proponemos aumentar el suministro total de GREEN tokens en un 20% para financiar nuevas iniciativas de desarrollo.".to_string(),
                proposer: "0x1234567890123456789012345678901234567890".to_string(),
                island: "forest".to_string(),
                category: ProposalCategory::TokenEconomics,
                status: ProposalStatus::Active,
                start_time: current_time - 172800, // Hace 2 días
                end_time: current_time + 432000, // En 5 días
                voting_power_required: 10000000000000000000000, // 10K tokens
                total_votes: 30000000000000000000000, // 30K tokens
                votes_for: 10000000000000000000000, // 10K tokens
                votes_against: 15000000000000000000000, // 15K tokens
                votes_abstain: 5000000000000000000000, // 5K tokens
                executed: false,
                execution_time: None,
            },
            Proposal {
                id: "PROP_003".to_string(),
                title: "Implementar sistema de trading entre islas".to_string(),
                description: "Crear un sistema de trading que permita intercambiar recursos y tokens entre diferentes islas del metaverso.".to_string(),
                proposer: "0x2345678901234567890123456789012345678901".to_string(),
                island: "global".to_string(),
                category: ProposalCategory::FeatureRequest,
                status: ProposalStatus::Pending,
                start_time: current_time + 86400, // En 1 día
                end_time: current_time + 604800, // En 7 días
                voting_power_required: 10000000000000000000000, // 10K tokens
                total_votes: 0,
                votes_for: 0,
                votes_against: 0,
                votes_abstain: 0,
                executed: false,
                execution_time: None,
            },
            Proposal {
                id: "PROP_004".to_string(),
                title: "Actualización de seguridad del smart contract principal".to_string(),
                description: "Implementar mejoras de seguridad en el smart contract principal del metaverso para proteger los fondos de los usuarios.".to_string(),
                proposer: "0x3456789012345678901234567890123456789012".to_string(),
                island: "global".to_string(),
                category: ProposalCategory::SecurityUpdate,
                status: ProposalStatus::Executed,
                start_time: current_time - 1209600, // Hace 14 días
                end_time: current_time - 518400, // Hace 6 días
                voting_power_required: 10000000000000000000000, // 10K tokens
                total_votes: 80000000000000000000000, // 80K tokens
                votes_for: 75000000000000000000000, // 75K tokens
                votes_against: 3000000000000000000000, // 3K tokens
                votes_abstain: 2000000000000000000000, // 2K tokens
                executed: true,
                execution_time: Some(current_time - 432000), // Hace 5 días
            },
        ];

        for proposal in proposals {
            self.proposals.insert(proposal.id.clone(), proposal);
        }

        // Actualizar contadores
        self.governance_info.total_proposals = self.proposals.len() as u64;
        self.governance_info.active_proposals = self.proposals.values()
            .filter(|p| p.status == ProposalStatus::Active)
            .count() as u64;

        Ok(())
    }

    /// Cargar poder de voto del usuario
    fn load_user_voting_power(&mut self) -> Result<(), JsValue> {
        // Simular poder de voto basado en tokens
        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        self.user_voting_power.insert(user_address.to_string(), 50000000000000000000000); // 50K tokens

        self.governance_info.total_voters = 1;
        Ok(())
    }

    /// Crear nueva propuesta
    pub fn create_proposal(&mut self, title: &str, description: &str, island: &str, category: &str) -> Result<String, JsValue> {
        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let user_voting_power = self.user_voting_power.get(user_address)
            .copied()
            .unwrap_or(0);

        if user_voting_power < self.governance_info.proposal_threshold {
            return Err(JsValue::from_str("Poder de voto insuficiente para crear propuesta"));
        }

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let proposal_id = format!("PROP_{:03}", self.proposals.len() + 1);
        
        let category_enum = match category.to_lowercase().as_str() {
            "island_development" => ProposalCategory::IslandDevelopment,
            "token_economics" => ProposalCategory::TokenEconomics,
            "feature_request" => ProposalCategory::FeatureRequest,
            "security_update" => ProposalCategory::SecurityUpdate,
            "community_initiative" => ProposalCategory::CommunityInitiative,
            "treasury_allocation" => ProposalCategory::TreasuryAllocation,
            "partnership" => ProposalCategory::Partnership,
            "technical_upgrade" => ProposalCategory::TechnicalUpgrade,
            _ => return Err(JsValue::from_str("Categoría no válida")),
        };

        let proposal = Proposal {
            id: proposal_id.clone(),
            title: title.to_string(),
            description: description.to_string(),
            proposer: user_address.to_string(),
            island: island.to_string(),
            category: category_enum,
            status: ProposalStatus::Pending,
            start_time: current_time + self.governance_info.execution_delay,
            end_time: current_time + self.governance_info.execution_delay + self.governance_info.voting_period,
            voting_power_required: self.governance_info.proposal_threshold,
            total_votes: 0,
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            executed: false,
            execution_time: None,
        };

        self.proposals.insert(proposal_id.clone(), proposal);
        self.governance_info.total_proposals += 1;

        Ok(proposal_id)
    }

    /// Votar en propuesta
    pub fn vote(&mut self, proposal_id: &str, vote_type: &str, reason: Option<&str>) -> Result<(), JsValue> {
        let proposal = self.proposals.get_mut(proposal_id)
            .ok_or_else(|| JsValue::from_str("Propuesta no encontrada"))?;

        if proposal.status != ProposalStatus::Active {
            return Err(JsValue::from_str("La propuesta no está activa para votación"));
        }

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if current_time < proposal.start_time || current_time > proposal.end_time {
            return Err(JsValue::from_str("Fuera del período de votación"));
        }

        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let user_voting_power = self.user_voting_power.get(user_address)
            .copied()
            .unwrap_or(0);

        if user_voting_power == 0 {
            return Err(JsValue::from_str("No tienes poder de voto"));
        }

        // Verificar si ya votó
        let existing_votes = self.votes.get(proposal_id).unwrap_or(&Vec::new());
        if existing_votes.iter().any(|vote| vote.voter == user_address) {
            return Err(JsValue::from_str("Ya has votado en esta propuesta"));
        }

        let vote_type_enum = match vote_type.to_lowercase().as_str() {
            "for" => VoteType::For,
            "against" => VoteType::Against,
            "abstain" => VoteType::Abstain,
            _ => return Err(JsValue::from_str("Tipo de voto no válido")),
        };

        let vote = Vote {
            proposal_id: proposal_id.to_string(),
            voter: user_address.to_string(),
            vote_type: vote_type_enum,
            voting_power: user_voting_power,
            timestamp: current_time,
            reason: reason.map(|r| r.to_string()),
        };

        // Actualizar votos de la propuesta
        match vote_type_enum {
            VoteType::For => proposal.votes_for += user_voting_power,
            VoteType::Against => proposal.votes_against += user_voting_power,
            VoteType::Abstain => proposal.votes_abstain += user_voting_power,
        }

        proposal.total_votes += user_voting_power;

        // Guardar voto
        self.votes.entry(proposal_id.to_string())
            .or_insert_with(Vec::new)
            .push(vote);

        Ok(())
    }

    /// Ejecutar propuesta
    pub fn execute_proposal(&mut self, proposal_id: &str) -> Result<(), JsValue> {
        let proposal = self.proposals.get_mut(proposal_id)
            .ok_or_else(|| JsValue::from_str("Propuesta no encontrada"))?;

        if proposal.executed {
            return Err(JsValue::from_str("La propuesta ya fue ejecutada"));
        }

        if proposal.status != ProposalStatus::Active {
            return Err(JsValue::from_str("La propuesta no está activa"));
        }

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if current_time < proposal.end_time + self.governance_info.execution_delay {
            return Err(JsValue::from_str("Aún no se puede ejecutar la propuesta"));
        }

        // Verificar quorum
        if proposal.total_votes < self.governance_info.quorum_required {
            proposal.status = ProposalStatus::Defeated;
            return Err(JsValue::from_str("No se alcanzó el quorum requerido"));
        }

        // Verificar mayoría
        if proposal.votes_for <= proposal.votes_against {
            proposal.status = ProposalStatus::Defeated;
            return Err(JsValue::from_str("La propuesta fue rechazada"));
        }

        proposal.status = ProposalStatus::Executed;
        proposal.executed = true;
        proposal.execution_time = Some(current_time);

        Ok(())
    }

    /// Obtener propuesta
    pub fn get_proposal(&self, proposal_id: &str) -> Result<JsValue, JsValue> {
        let proposal = self.proposals.get(proposal_id)
            .ok_or_else(|| JsValue::from_str("Propuesta no encontrada"))?;
        
        serde_wasm_bindgen::to_value(proposal)
            .map_err(|_| JsValue::from_str("Error al serializar propuesta"))
    }

    /// Obtener todas las propuestas
    pub fn get_all_proposals(&self) -> JsValue {
        let proposal_list: Vec<&Proposal> = self.proposals.values().collect();
        serde_wasm_bindgen::to_value(&proposal_list).unwrap_or_default()
    }

    /// Obtener propuestas por isla
    pub fn get_proposals_by_island(&self, island: &str) -> JsValue {
        let island_proposals: Vec<&Proposal> = self.proposals.values()
            .filter(|proposal| proposal.island == island)
            .collect();
        
        serde_wasm_bindgen::to_value(&island_proposals).unwrap_or_default()
    }

    /// Obtener propuestas por categoría
    pub fn get_proposals_by_category(&self, category: &str) -> JsValue {
        let category_enum = match category.to_lowercase().as_str() {
            "island_development" => ProposalCategory::IslandDevelopment,
            "token_economics" => ProposalCategory::TokenEconomics,
            "feature_request" => ProposalCategory::FeatureRequest,
            "security_update" => ProposalCategory::SecurityUpdate,
            "community_initiative" => ProposalCategory::CommunityInitiative,
            "treasury_allocation" => ProposalCategory::TreasuryAllocation,
            "partnership" => ProposalCategory::Partnership,
            "technical_upgrade" => ProposalCategory::TechnicalUpgrade,
            _ => return serde_wasm_bindgen::to_value(&Vec::<&Proposal>::new()).unwrap_or_default(),
        };

        let category_proposals: Vec<&Proposal> = self.proposals.values()
            .filter(|proposal| std::mem::discriminant(&proposal.category) == std::mem::discriminant(&category_enum))
            .collect();
        
        serde_wasm_bindgen::to_value(&category_proposals).unwrap_or_default()
    }

    /// Obtener votos de propuesta
    pub fn get_proposal_votes(&self, proposal_id: &str) -> JsValue {
        let votes = self.votes.get(proposal_id).unwrap_or(&Vec::new());
        serde_wasm_bindgen::to_value(votes).unwrap_or_default()
    }

    /// Obtener poder de voto del usuario
    pub fn get_user_voting_power(&self) -> Result<u64, JsValue> {
        let user_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        self.user_voting_power.get(user_address)
            .copied()
            .ok_or_else(|| JsValue::from_str("Usuario no encontrado"))
    }

    /// Delegar votos
    pub fn delegate_votes(&mut self, delegate_address: &str, amount: u64) -> Result<(), JsValue> {
        let delegator_address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        let current_voting_power = self.user_voting_power.get(delegator_address)
            .copied()
            .unwrap_or(0);

        if amount > current_voting_power {
            return Err(JsValue::from_str("Cantidad excede el poder de voto disponible"));
        }

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let delegation = Delegation {
            delegator: delegator_address.to_string(),
            delegate: delegate_address.to_string(),
            amount,
            start_time: current_time,
            end_time: None,
            is_active: true,
        };

        let delegation_key = format!("{}_{}", delegator_address, delegate_address);
        self.delegations.insert(delegation_key, delegation);

        // Actualizar poder de voto
        if let Some(power) = self.user_voting_power.get_mut(delegator_address) {
            *power -= amount;
        }

        if let Some(power) = self.user_voting_power.get_mut(delegate_address) {
            *power += amount;
        } else {
            self.user_voting_power.insert(delegate_address.to_string(), amount);
        }

        Ok(())
    }

    /// Obtener información de governance
    pub fn get_governance_info(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.governance_info).unwrap_or_default()
    }

    /// Obtener estadísticas de governance
    pub fn get_governance_stats(&self) -> JsValue {
        let total_proposals = self.proposals.len();
        let active_proposals = self.proposals.values()
            .filter(|p| p.status == ProposalStatus::Active)
            .count();
        let executed_proposals = self.proposals.values()
            .filter(|p| p.executed)
            .count();
        let defeated_proposals = self.proposals.values()
            .filter(|p| p.status == ProposalStatus::Defeated)
            .count();

        let stats = serde_json::json!({
            "total_proposals": total_proposals,
            "active_proposals": active_proposals,
            "executed_proposals": executed_proposals,
            "defeated_proposals": defeated_proposals,
            "total_voters": self.governance_info.total_voters,
            "total_voting_power": self.governance_info.total_voting_power,
            "quorum_required": self.governance_info.quorum_required,
            "proposal_threshold": self.governance_info.proposal_threshold,
            "proposals_by_island": {
                "forest": self.get_proposals_by_island("forest"),
                "ocean": self.get_proposals_by_island("ocean"),
                "mountain": self.get_proposals_by_island("mountain"),
                "desert": self.get_proposals_by_island("desert"),
                "city": self.get_proposals_by_island("city"),
                "volcano": self.get_proposals_by_island("volcano"),
                "space": self.get_proposals_by_island("space"),
                "global": self.get_proposals_by_island("global"),
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