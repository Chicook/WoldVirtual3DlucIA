// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./WCVToken.sol";
import "./WCVStaking.sol";

/**
 * @title WCV Governance Contract
 * @dev Sistema de gobernanza descentralizada para WoldCoinVirtual
 * @author WoldVirtual3D Team
 */
contract WCVGovernance is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;

    // Eventos
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        string description,
        uint256 votingPeriod,
        uint256 timestamp
    );
    
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        bool passed,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 timestamp
    );
    
    event ProposalCancelled(
        uint256 indexed proposalId,
        address indexed canceller,
        string reason,
        uint256 timestamp
    );

    // Estructuras
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 createTime;
        uint256 votingPeriod;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool cancelled;
        mapping(address => Receipt) receipts;
    }

    struct Receipt {
        bool hasVoted;
        bool support;
        uint256 votes;
    }

    struct ProposalAction {
        address target;
        uint256 value;
        bytes data;
        string description;
    }

    // Variables de estado
    WCVToken public wcvToken;
    WCVStaking public stakingContract;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => ProposalAction[]) public proposalActions;
    
    uint256 public proposalCount;
    uint256 public minProposalStake = 10000000; // 10M WCV
    uint256 public votingPeriod = 7 days;
    uint256 public quorumVotes = 100000000; // 100M WCV
    uint256 public proposalThreshold = 5000000; // 5M WCV
    
    // Configuración
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant EXECUTION_DELAY = 2 days;
    
    // Constructor
    constructor(address _wcvToken, address _stakingContract) {
        require(_wcvToken != address(0), "Invalid WCV token address");
        require(_stakingContract != address(0), "Invalid staking contract address");
        
        wcvToken = WCVToken(_wcvToken);
        stakingContract = WCVStaking(_stakingContract);
    }

    /**
     * @dev Crear propuesta
     */
    function createProposal(
        string memory title,
        string memory description,
        ProposalAction[] memory actions
    ) public nonReentrant whenNotPaused returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(actions.length > 0, "Must have at least one action");
        
        // Verificar que el proponente tiene suficiente stake
        uint256 proposerStake = stakingContract.getStakerInfo(msg.sender).stakedAmount;
        require(proposerStake >= minProposalStake, "Insufficient stake to create proposal");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.createTime = block.timestamp;
        proposal.votingPeriod = votingPeriod;
        proposal.forVotes = 0;
        proposal.againstVotes = 0;
        proposal.executed = false;
        proposal.cancelled = false;
        
        // Guardar acciones
        for (uint256 i = 0; i < actions.length; i++) {
            proposalActions[proposalId].push(actions[i]);
        }
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            description,
            votingPeriod,
            block.timestamp
        );
        
        return proposalId;
    }

    /**
     * @dev Votar en una propuesta
     */
    function vote(uint256 proposalId, bool support) public nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id == proposalId, "Proposal does not exist");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal was cancelled");
        require(block.timestamp >= proposal.createTime.add(VOTING_DELAY), "Voting not started");
        require(block.timestamp < proposal.createTime.add(VOTING_DELAY).add(proposal.votingPeriod), "Voting period ended");
        require(!proposal.receipts[msg.sender].hasVoted, "Already voted");
        
        // Calcular peso del voto (stake + tokens)
        uint256 votingWeight = _getVotingWeight(msg.sender);
        require(votingWeight > 0, "No voting power");
        
        proposal.receipts[msg.sender] = Receipt({
            hasVoted: true,
            support: support,
            votes: votingWeight
        });
        
        if (support) {
            proposal.forVotes = proposal.forVotes.add(votingWeight);
        } else {
            proposal.againstVotes = proposal.againstVotes.add(votingWeight);
        }
        
        emit Voted(proposalId, msg.sender, support, votingWeight, block.timestamp);
    }

    /**
     * @dev Ejecutar propuesta
     */
    function executeProposal(uint256 proposalId) public nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id == proposalId, "Proposal does not exist");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal was cancelled");
        require(block.timestamp >= proposal.createTime.add(VOTING_DELAY).add(proposal.votingPeriod).add(EXECUTION_DELAY), "Execution delay not met");
        
        bool passed = _isProposalPassed(proposalId);
        proposal.executed = true;
        
        if (passed) {
            _executeActions(proposalId);
        }
        
        emit ProposalExecuted(
            proposalId,
            passed,
            proposal.forVotes,
            proposal.againstVotes,
            block.timestamp
        );
    }

    /**
     * @dev Cancelar propuesta (solo proponente o owner)
     */
    function cancelProposal(uint256 proposalId, string memory reason) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id == proposalId, "Proposal does not exist");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal already cancelled");
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized to cancel"
        );
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(proposalId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Obtener peso de votación de un usuario
     */
    function _getVotingWeight(address user) internal view returns (uint256) {
        // Stake en el contrato de staking
        uint256 stakedAmount = stakingContract.getStakerInfo(user).stakedAmount;
        
        // Tokens en wallet (con peso reducido)
        uint256 tokenBalance = wcvToken.balanceOf(user);
        uint256 tokenWeight = tokenBalance.div(2); // Los tokens tienen la mitad del peso del stake
        
        return stakedAmount.add(tokenWeight);
    }

    /**
     * @dev Verificar si una propuesta pasó
     */
    function _isProposalPassed(uint256 proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        
        uint256 totalVotes = proposal.forVotes.add(proposal.againstVotes);
        require(totalVotes >= quorumVotes, "Quorum not reached");
        
        return proposal.forVotes > proposal.againstVotes;
    }

    /**
     * @dev Ejecutar acciones de la propuesta
     */
    function _executeActions(uint256 proposalId) internal {
        ProposalAction[] storage actions = proposalActions[proposalId];
        
        for (uint256 i = 0; i < actions.length; i++) {
            ProposalAction storage action = actions[i];
            
            (bool success, bytes memory result) = action.target.call{value: action.value}(action.data);
            require(success, "Action execution failed");
        }
    }

    /**
     * @dev Obtener información de una propuesta
     */
    function getProposal(uint256 proposalId) public view returns (
        address proposer,
        string memory title,
        string memory description,
        uint256 createTime,
        uint256 votingPeriod,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool cancelled,
        uint256 votingStartTime,
        uint256 votingEndTime,
        uint256 executionTime,
        bool canExecute
    ) {
        Proposal storage proposal = proposals[proposalId];
        
        proposer = proposal.proposer;
        title = proposal.title;
        description = proposal.description;
        createTime = proposal.createTime;
        votingPeriod = proposal.votingPeriod;
        forVotes = proposal.forVotes;
        againstVotes = proposal.againstVotes;
        executed = proposal.executed;
        cancelled = proposal.cancelled;
        
        votingStartTime = proposal.createTime.add(VOTING_DELAY);
        votingEndTime = votingStartTime.add(proposal.votingPeriod);
        executionTime = votingEndTime.add(EXECUTION_DELAY);
        
        canExecute = !proposal.executed && 
                    !proposal.cancelled && 
                    block.timestamp >= executionTime;
    }

    /**
     * @dev Obtener acciones de una propuesta
     */
    function getProposalActions(uint256 proposalId) public view returns (ProposalAction[] memory) {
        return proposalActions[proposalId];
    }

    /**
     * @dev Obtener recibo de voto
     */
    function getReceipt(uint256 proposalId, address voter) public view returns (
        bool hasVoted,
        bool support,
        uint256 votes
    ) {
        Receipt storage receipt = proposals[proposalId].receipts[voter];
        return (receipt.hasVoted, receipt.support, receipt.votes);
    }

    /**
     * @dev Obtener peso de votación de un usuario
     */
    function getVotingWeight(address user) public view returns (uint256) {
        return _getVotingWeight(user);
    }

    /**
     * @dev Verificar si una propuesta puede ser ejecutada
     */
    function canExecuteProposal(uint256 proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.executed || proposal.cancelled) {
            return false;
        }
        
        uint256 executionTime = proposal.createTime.add(VOTING_DELAY).add(proposal.votingPeriod).add(EXECUTION_DELAY);
        return block.timestamp >= executionTime;
    }

    /**
     * @dev Verificar si una propuesta pasó
     */
    function isProposalPassed(uint256 proposalId) public view returns (bool) {
        return _isProposalPassed(proposalId);
    }

    /**
     * @dev Obtener estadísticas de gobernanza
     */
    function getGovernanceStats() public view returns (
        uint256 totalProposals,
        uint256 activeProposals,
        uint256 executedProposals,
        uint256 cancelledProposals,
        uint256 totalVoters,
        uint256 quorumVotes_,
        uint256 minProposalStake_,
        uint256 votingPeriod_
    ) {
        totalProposals = proposalCount;
        quorumVotes_ = quorumVotes;
        minProposalStake_ = minProposalStake;
        votingPeriod_ = votingPeriod;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            Proposal storage proposal = proposals[i];
            
            if (proposal.executed) {
                executedProposals++;
            } else if (proposal.cancelled) {
                cancelledProposals++;
            } else if (block.timestamp < proposal.createTime.add(VOTING_DELAY).add(proposal.votingPeriod)) {
                activeProposals++;
            }
        }
    }

    /**
     * @dev Configurar parámetros (solo owner)
     */
    function setParameters(
        uint256 _minProposalStake,
        uint256 _votingPeriod,
        uint256 _quorumVotes,
        uint256 _proposalThreshold
    ) public onlyOwner {
        require(_minProposalStake > 0, "Min proposal stake must be greater than 0");
        require(_votingPeriod >= 1 days, "Voting period too short");
        require(_votingPeriod <= 30 days, "Voting period too long");
        require(_quorumVotes > 0, "Quorum votes must be greater than 0");
        require(_proposalThreshold > 0, "Proposal threshold must be greater than 0");
        
        minProposalStake = _minProposalStake;
        votingPeriod = _votingPeriod;
        quorumVotes = _quorumVotes;
        proposalThreshold = _proposalThreshold;
    }

    /**
     * @dev Pausar gobernanza (solo owner)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Reanudar gobernanza (solo owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Crear propuesta simple (sin acciones)
     */
    function createSimpleProposal(
        string memory title,
        string memory description
    ) public returns (uint256) {
        ProposalAction[] memory actions = new ProposalAction[](0);
        return createProposal(title, description, actions);
    }
} 