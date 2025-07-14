// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../core/interfaces/IMetaversoCore.sol";

/**
 * @title MetaversoGovernance
 * @dev Sistema de gobernanza DAO para el metaverso
 * @author Metaverso Crypto World Virtual 3D
 */
contract MetaversoGovernance is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    // ============ STRUCTS ============

    struct Proposal {
        uint256 proposalId;
        string title;
        string description;
        string metadata;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        bool executed;
        bool canceled;
        address proposer;
        ProposalType proposalType;
        ProposalStatus status;
        mapping(address => Vote) votes;
        address[] voters;
    }

    struct Vote {
        bool hasVoted;
        VoteChoice choice;
        uint256 votingPower;
        uint256 timestamp;
        string reason;
    }

    struct GovernanceSettings {
        uint256 proposalThreshold;
        uint256 votingPeriod;
        uint256 quorumVotes;
        uint256 executionDelay;
        uint256 minVotingPower;
        uint256 maxVotingPower;
        bool allowDelegation;
        bool allowVoteChange;
        uint256 proposalCooldown;
    }

    struct Delegation {
        address delegate;
        uint256 delegatedPower;
        uint256 delegationTime;
        bool isActive;
    }

    struct Snapshot {
        uint256 blockNumber;
        uint256 timestamp;
        mapping(address => uint256) balances;
        mapping(address => uint256) stakedBalances;
        mapping(address => uint256) reputation;
    }

    // ============ ENUMS ============

    enum ProposalType {
        PARAMETER_CHANGE,
        CONTRACT_UPGRADE,
        FUND_ALLOCATION,
        POLICY_CHANGE,
        EMERGENCY_ACTION,
        COMMUNITY_PROPOSAL
    }

    enum ProposalStatus {
        PENDING,
        ACTIVE,
        PASSED,
        FAILED,
        EXECUTED,
        CANCELED
    }

    enum VoteChoice {
        YES,
        NO,
        ABSTAIN
    }

    // ============ STATE VARIABLES ============

    Counters.Counter private _proposalIdCounter;
    Counters.Counter private _snapshotIdCounter;

    // Core contracts
    IMetaversoCore public metaversoCore;
    address public metaversoToken;

    // Mappings
    mapping(uint256 => Proposal) public proposals;
    mapping(address => Delegation) public delegations;
    mapping(address => address[]) public delegators;
    mapping(uint256 => Snapshot) public snapshots;
    mapping(address => uint256) public lastVoteTime;
    mapping(address => bool) public authorizedExecutors;
    mapping(address => bool) public councilMembers;

    // Arrays
    uint256[] public activeProposals;
    uint256[] public executedProposals;
    address[] public allVoters;

    // Configuration
    GovernanceSettings public settings;
    uint256 public proposalCooldown = 1 days;
    uint256 public emergencyThreshold = 100000 * 10**18; // 100k tokens
    uint256 public councilThreshold = 50000 * 10**18; // 50k tokens

    // Events
    event ProposalCreated(uint256 indexed proposalId, string title, address indexed proposer, ProposalType proposalType);
    event ProposalActivated(uint256 indexed proposalId, uint256 startTime, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, VoteChoice choice, uint256 votingPower, string reason);
    event VoteChanged(uint256 indexed proposalId, address indexed voter, VoteChoice oldChoice, VoteChoice newChoice);
    event ProposalExecuted(uint256 indexed proposalId, address indexed executor);
    event ProposalCanceled(uint256 indexed proposalId, address indexed canceler);
    event DelegationUpdated(address indexed delegator, address indexed delegate, uint256 power);
    event SnapshotCreated(uint256 indexed snapshotId, uint256 blockNumber, uint256 timestamp);
    event SettingsUpdated(GovernanceSettings newSettings);
    event CouncilMemberAdded(address indexed member);
    event CouncilMemberRemoved(address indexed member);

    // ============ CONSTRUCTOR ============

    constructor(address _metaversoCore, address _metaversoToken) {
        metaversoCore = IMetaversoCore(_metaversoCore);
        metaversoToken = _metaversoToken;

        // Initialize default settings
        settings = GovernanceSettings({
            proposalThreshold: 10000 * 10**18, // 10k tokens
            votingPeriod: 7 days,
            quorumVotes: 100000 * 10**18, // 100k tokens
            executionDelay: 2 days,
            minVotingPower: 100 * 10**18, // 100 tokens
            maxVotingPower: 1000000 * 10**18, // 1M tokens
            allowDelegation: true,
            allowVoteChange: true,
            proposalCooldown: 1 days
        });

        _proposalIdCounter.increment();
        _snapshotIdCounter.increment();
    }

    // ============ PROPOSAL MANAGEMENT ============

    /**
     * @dev Create a new governance proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param metadata Additional metadata
     * @param proposalType Type of proposal
     */
    function createProposal(
        string memory title,
        string memory description,
        string memory metadata,
        ProposalType proposalType
    ) external {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(getVotingPower(msg.sender) >= settings.proposalThreshold, "Insufficient voting power");
        require(block.timestamp >= lastVoteTime[msg.sender] + settings.proposalCooldown, "Cooldown not met");

        uint256 proposalId = _proposalIdCounter.current();
        _proposalIdCounter.increment();

        Proposal storage proposal = proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.title = title;
        proposal.description = description;
        proposal.metadata = metadata;
        proposal.startTime = block.timestamp + settings.executionDelay;
        proposal.endTime = block.timestamp + settings.executionDelay + settings.votingPeriod;
        proposal.proposer = msg.sender;
        proposal.proposalType = proposalType;
        proposal.status = ProposalStatus.PENDING;

        activeProposals.push(proposalId);
        lastVoteTime[msg.sender] = block.timestamp;

        emit ProposalCreated(proposalId, title, msg.sender, proposalType);
    }

    /**
     * @dev Activate a proposal (only proposer or council)
     * @param proposalId Proposal ID
     */
    function activateProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.PENDING, "Proposal not pending");
        require(
            msg.sender == proposal.proposer || 
            councilMembers[msg.sender] || 
            msg.sender == owner(),
            "Not authorized"
        );
        require(block.timestamp >= proposal.startTime, "Activation time not reached");

        proposal.status = ProposalStatus.ACTIVE;

        emit ProposalActivated(proposalId, proposal.startTime, proposal.endTime);
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId Proposal ID
     * @param choice Vote choice
     * @param reason Voting reason
     */
    function vote(
        uint256 proposalId,
        VoteChoice choice,
        string memory reason
    ) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.votes[msg.sender].hasVoted, "Already voted");

        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower >= settings.minVotingPower, "Insufficient voting power");

        Vote memory newVote = Vote({
            hasVoted: true,
            choice: choice,
            votingPower: votingPower,
            timestamp: block.timestamp,
            reason: reason
        });

        proposal.votes[msg.sender] = newVote;
        proposal.voters.push(msg.sender);

        // Update vote counts
        if (choice == VoteChoice.YES) {
            proposal.yesVotes = proposal.yesVotes.add(votingPower);
        } else if (choice == VoteChoice.NO) {
            proposal.noVotes = proposal.noVotes.add(votingPower);
        } else {
            proposal.abstainVotes = proposal.abstainVotes.add(votingPower);
        }

        // Add to all voters if not already there
        bool voterExists = false;
        for (uint256 i = 0; i < allVoters.length; i++) {
            if (allVoters[i] == msg.sender) {
                voterExists = true;
                break;
            }
        }
        if (!voterExists) {
            allVoters.push(msg.sender);
        }

        emit Voted(proposalId, msg.sender, choice, votingPower, reason);
    }

    /**
     * @dev Change vote on a proposal
     * @param proposalId Proposal ID
     * @param newChoice New vote choice
     * @param reason New voting reason
     */
    function changeVote(
        uint256 proposalId,
        VoteChoice newChoice,
        string memory reason
    ) external {
        require(settings.allowVoteChange, "Vote changes not allowed");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(proposal.votes[msg.sender].hasVoted, "No vote to change");
        require(block.timestamp <= proposal.endTime, "Voting ended");

        Vote storage existingVote = proposal.votes[msg.sender];
        VoteChoice oldChoice = existingVote.choice;

        // Remove old vote
        if (oldChoice == VoteChoice.YES) {
            proposal.yesVotes = proposal.yesVotes.sub(existingVote.votingPower);
        } else if (oldChoice == VoteChoice.NO) {
            proposal.noVotes = proposal.noVotes.sub(existingVote.votingPower);
        } else {
            proposal.abstainVotes = proposal.abstainVotes.sub(existingVote.votingPower);
        }

        // Add new vote
        if (newChoice == VoteChoice.YES) {
            proposal.yesVotes = proposal.yesVotes.add(existingVote.votingPower);
        } else if (newChoice == VoteChoice.NO) {
            proposal.noVotes = proposal.noVotes.add(existingVote.votingPower);
        } else {
            proposal.abstainVotes = proposal.abstainVotes.add(existingVote.votingPower);
        }

        existingVote.choice = newChoice;
        existingVote.reason = reason;
        existingVote.timestamp = block.timestamp;

        emit VoteChanged(proposalId, msg.sender, oldChoice, newChoice);
    }

    /**
     * @dev Execute a proposal
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(
            msg.sender == proposal.proposer || 
            authorizedExecutors[msg.sender] || 
            councilMembers[msg.sender] || 
            msg.sender == owner(),
            "Not authorized"
        );

        uint256 totalVotes = proposal.yesVotes.add(proposal.noVotes).add(proposal.abstainVotes);
        
        if (totalVotes >= settings.quorumVotes && proposal.yesVotes > proposal.noVotes) {
            proposal.status = ProposalStatus.PASSED;
            proposal.executed = true;
            executedProposals.push(proposalId);
            
            // Execute proposal logic based on type
            _executeProposalLogic(proposalId, proposal.proposalType);
        } else {
            proposal.status = ProposalStatus.FAILED;
        }

        // Remove from active proposals
        for (uint256 i = 0; i < activeProposals.length; i++) {
            if (activeProposals[i] == proposalId) {
                activeProposals[i] = activeProposals[activeProposals.length - 1];
                activeProposals.pop();
                break;
            }
        }

        emit ProposalExecuted(proposalId, msg.sender);
    }

    /**
     * @dev Cancel a proposal
     * @param proposalId Proposal ID
     */
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || 
            councilMembers[msg.sender] || 
            msg.sender == owner(),
            "Not authorized"
        );
        require(proposal.status == ProposalStatus.PENDING || proposal.status == ProposalStatus.ACTIVE, "Cannot cancel");

        proposal.status = ProposalStatus.CANCELED;
        proposal.canceled = true;

        // Remove from active proposals
        for (uint256 i = 0; i < activeProposals.length; i++) {
            if (activeProposals[i] == proposalId) {
                activeProposals[i] = activeProposals[activeProposals.length - 1];
                activeProposals.pop();
                break;
            }
        }

        emit ProposalCanceled(proposalId, msg.sender);
    }

    // ============ DELEGATION SYSTEM ============

    /**
     * @dev Delegate voting power to another address
     * @param delegate Address to delegate to
     * @param power Amount of power to delegate
     */
    function delegate(address delegate, uint256 power) external {
        require(settings.allowDelegation, "Delegation not allowed");
        require(delegate != address(0), "Invalid delegate");
        require(delegate != msg.sender, "Cannot delegate to self");
        require(power > 0, "Power must be greater than 0");

        uint256 availablePower = getVotingPower(msg.sender);
        require(availablePower >= power, "Insufficient voting power");

        Delegation storage delegation = delegations[msg.sender];
        
        // Remove old delegation if exists
        if (delegation.isActive) {
            _removeDelegation(msg.sender);
        }

        // Create new delegation
        delegation.delegate = delegate;
        delegation.delegatedPower = power;
        delegation.delegationTime = block.timestamp;
        delegation.isActive = true;

        delegators[delegate].push(msg.sender);

        emit DelegationUpdated(msg.sender, delegate, power);
    }

    /**
     * @dev Remove delegation
     */
    function removeDelegation() external {
        require(delegations[msg.sender].isActive, "No delegation to remove");
        _removeDelegation(msg.sender);
    }

    /**
     * @dev Get delegation information
     * @param delegator Delegator address
     */
    function getDelegation(address delegator) external view returns (
        address delegate,
        uint256 delegatedPower,
        uint256 delegationTime,
        bool isActive
    ) {
        Delegation storage delegation = delegations[delegator];
        return (
            delegation.delegate,
            delegation.delegatedPower,
            delegation.delegationTime,
            delegation.isActive
        );
    }

    // ============ SNAPSHOT SYSTEM ============

    /**
     * @dev Create a new snapshot
     */
    function createSnapshot() external onlyOwner {
        uint256 snapshotId = _snapshotIdCounter.current();
        _snapshotIdCounter.increment();

        Snapshot storage snapshot = snapshots[snapshotId];
        snapshot.blockNumber = block.number;
        snapshot.timestamp = block.timestamp;

        // Capture balances for all voters
        for (uint256 i = 0; i < allVoters.length; i++) {
            address voter = allVoters[i];
            snapshot.balances[voter] = getTokenBalance(voter);
            snapshot.stakedBalances[voter] = getStakedBalance(voter);
            snapshot.reputation[voter] = getReputation(voter);
        }

        emit SnapshotCreated(snapshotId, block.number, block.timestamp);
    }

    /**
     * @dev Get voting power at a specific snapshot
     * @param voter Voter address
     * @param snapshotId Snapshot ID
     */
    function getVotingPowerAtSnapshot(address voter, uint256 snapshotId) external view returns (uint256) {
        Snapshot storage snapshot = snapshots[snapshotId];
        uint256 balance = snapshot.balances[voter];
        uint256 staked = snapshot.stakedBalances[voter];
        uint256 reputation = snapshot.reputation[voter];
        
        return _calculateVotingPower(balance, staked, reputation);
    }

    // ============ VOTING POWER CALCULATION ============

    /**
     * @dev Get current voting power for an address
     * @param voter Voter address
     */
    function getVotingPower(address voter) public view returns (uint256) {
        uint256 balance = getTokenBalance(voter);
        uint256 staked = getStakedBalance(voter);
        uint256 reputation = getReputation(voter);
        
        uint256 power = _calculateVotingPower(balance, staked, reputation);
        
        // Apply delegation
        Delegation storage delegation = delegations[voter];
        if (delegation.isActive) {
            power = power.sub(delegation.delegatedPower);
        }
        
        // Add delegated power
        address[] storage delegatorsList = delegators[voter];
        for (uint256 i = 0; i < delegatorsList.length; i++) {
            Delegation storage delegatorDelegation = delegations[delegatorsList[i]];
            if (delegatorDelegation.isActive && delegatorDelegation.delegate == voter) {
                power = power.add(delegatorDelegation.delegatedPower);
            }
        }
        
        return power > settings.maxVotingPower ? settings.maxVotingPower : power;
    }

    /**
     * @dev Calculate voting power from components
     */
    function _calculateVotingPower(
        uint256 balance,
        uint256 staked,
        uint256 reputation
    ) internal pure returns (uint256) {
        // Base power from token balance
        uint256 power = balance;
        
        // Bonus from staked tokens (1.5x multiplier)
        power = power.add(staked.mul(3).div(2));
        
        // Bonus from reputation (1% per 100 reputation points)
        uint256 reputationBonus = reputation.div(100);
        power = power.add(power.mul(reputationBonus).div(100));
        
        return power;
    }

    // ============ HELPER FUNCTIONS ============

    /**
     * @dev Get token balance
     */
    function getTokenBalance(address user) internal view returns (uint256) {
        // This would integrate with the actual token contract
        // For now, return a placeholder
        return 0;
    }

    /**
     * @dev Get staked balance
     */
    function getStakedBalance(address user) internal view returns (uint256) {
        // This would integrate with the staking contract
        // For now, return a placeholder
        return 0;
    }

    /**
     * @dev Get reputation
     */
    function getReputation(address user) internal view returns (uint256) {
        // This would integrate with the reputation system
        // For now, return a placeholder
        return 50;
    }

    /**
     * @dev Remove delegation
     */
    function _removeDelegation(address delegator) internal {
        Delegation storage delegation = delegations[delegator];
        
        // Remove from delegate's delegators list
        address[] storage delegatorsList = delegators[delegation.delegate];
        for (uint256 i = 0; i < delegatorsList.length; i++) {
            if (delegatorsList[i] == delegator) {
                delegatorsList[i] = delegatorsList[delegatorsList.length - 1];
                delegatorsList.pop();
                break;
            }
        }
        
        emit DelegationUpdated(delegator, delegation.delegate, 0);
        
        delete delegations[delegator];
    }

    /**
     * @dev Execute proposal logic based on type
     */
    function _executeProposalLogic(uint256 proposalId, ProposalType proposalType) internal {
        // This would contain the actual execution logic for each proposal type
        // For now, it's a placeholder
        if (proposalType == ProposalType.PARAMETER_CHANGE) {
            // Execute parameter change
        } else if (proposalType == ProposalType.CONTRACT_UPGRADE) {
            // Execute contract upgrade
        } else if (proposalType == ProposalType.FUND_ALLOCATION) {
            // Execute fund allocation
        } else if (proposalType == ProposalType.POLICY_CHANGE) {
            // Execute policy change
        } else if (proposalType == ProposalType.EMERGENCY_ACTION) {
            // Execute emergency action
        } else if (proposalType == ProposalType.COMMUNITY_PROPOSAL) {
            // Execute community proposal
        }
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update governance settings
     * @param newSettings New settings
     */
    function updateSettings(GovernanceSettings memory newSettings) external onlyOwner {
        settings = newSettings;
        emit SettingsUpdated(newSettings);
    }

    /**
     * @dev Add council member
     * @param member Member address
     */
    function addCouncilMember(address member) external onlyOwner {
        require(member != address(0), "Invalid member address");
        councilMembers[member] = true;
        emit CouncilMemberAdded(member);
    }

    /**
     * @dev Remove council member
     * @param member Member address
     */
    function removeCouncilMember(address member) external onlyOwner {
        councilMembers[member] = false;
        emit CouncilMemberRemoved(member);
    }

    /**
     * @dev Add authorized executor
     * @param executor Executor address
     */
    function addAuthorizedExecutor(address executor) external onlyOwner {
        authorizedExecutors[executor] = true;
    }

    /**
     * @dev Remove authorized executor
     * @param executor Executor address
     */
    function removeAuthorizedExecutor(address executor) external onlyOwner {
        authorizedExecutors[executor] = false;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get proposal information
     * @param proposalId Proposal ID
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 proposalId_,
        string memory title,
        string memory description,
        string memory metadata,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes,
        bool executed,
        bool canceled,
        address proposer,
        ProposalType proposalType,
        ProposalStatus status
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposalId,
            proposal.title,
            proposal.description,
            proposal.metadata,
            proposal.startTime,
            proposal.endTime,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.abstainVotes,
            proposal.executed,
            proposal.canceled,
            proposal.proposer,
            proposal.proposalType,
            proposal.status
        );
    }

    /**
     * @dev Get user's vote on a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     */
    function getUserVote(uint256 proposalId, address voter) external view returns (
        bool hasVoted,
        VoteChoice choice,
        uint256 votingPower,
        uint256 timestamp,
        string memory reason
    ) {
        Vote storage vote = proposals[proposalId].votes[voter];
        return (
            vote.hasVoted,
            vote.choice,
            vote.votingPower,
            vote.timestamp,
            vote.reason
        );
    }

    /**
     * @dev Get active proposals
     */
    function getActiveProposals() external view returns (uint256[] memory) {
        return activeProposals;
    }

    /**
     * @dev Get executed proposals
     */
    function getExecutedProposals() external view returns (uint256[] memory) {
        return executedProposals;
    }

    /**
     * @dev Get all voters
     */
    function getAllVoters() external view returns (address[] memory) {
        return allVoters;
    }

    /**
     * @dev Get delegators for an address
     * @param delegate Delegate address
     */
    function getDelegators(address delegate) external view returns (address[] memory) {
        return delegators[delegate];
    }

    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalProposals,
        uint256 activeProposalsCount,
        uint256 executedProposalsCount,
        uint256 totalVoters,
        uint256 totalSnapshots
    ) {
        totalProposals = _proposalIdCounter.current() - 1;
        activeProposalsCount = activeProposals.length;
        executedProposalsCount = executedProposals.length;
        totalVoters = allVoters.length;
        totalSnapshots = _snapshotIdCounter.current() - 1;
    }
} 