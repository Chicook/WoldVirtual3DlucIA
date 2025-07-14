// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MetaversoToken
 * @dev Token nativo del metaverso con funcionalidades avanzadas
 * @author Metaverso Crypto World Virtual 3D
 */
contract MetaversoToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // ============ STRUCTS ============

    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 totalRewards;
        bool isStaking;
    }

    struct RewardRate {
        uint256 rate; // Rewards per second per token
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    struct GovernanceProposal {
        uint256 proposalId;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        bool canceled;
        address proposer;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votes;
    }

    // ============ STATE VARIABLES ============

    Counters.Counter private _proposalIdCounter;

    // Staking
    mapping(address => StakingInfo) public stakingInfo;
    RewardRate public currentRewardRate;
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;

    // Governance
    mapping(uint256 => GovernanceProposal) public proposals;
    uint256 public proposalThreshold;
    uint256 public votingPeriod;
    uint256 public quorumVotes;

    // Vesting
    mapping(address => uint256) public vestingAmount;
    mapping(address => uint256) public vestingStartTime;
    mapping(address => uint256) public vestingDuration;
    mapping(address => uint256) public claimedAmount;

    // Events
    event TokensStaked(address indexed user, uint256 amount, uint256 startTime);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate, uint256 startTime, uint256 endTime);
    event ProposalCreated(uint256 indexed proposalId, string title, address indexed proposer);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event VestingCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    event VestingClaimed(address indexed beneficiary, uint256 amount);

    // ============ CONSTRUCTOR ============

    constructor() ERC20("Metaverso Token", "META") {
        _mint(msg.sender, 1000000000 * 10**decimals()); // 1 billion tokens
        
        // Initialize governance parameters
        proposalThreshold = 10000 * 10**decimals(); // 10,000 tokens
        votingPeriod = 7 days;
        quorumVotes = 100000 * 10**decimals(); // 100,000 tokens
        
        // Initialize reward rate
        currentRewardRate = RewardRate({
            rate: 1e15, // 0.001 tokens per second per staked token
            startTime: block.timestamp,
            endTime: block.timestamp + 365 days,
            isActive: true
        });
    }

    // ============ STAKING FUNCTIONS ============

    /**
     * @dev Stake tokens to earn rewards
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        StakingInfo storage userStaking = stakingInfo[msg.sender];
        
        // Claim existing rewards first
        if (userStaking.isStaking) {
            _claimRewards(msg.sender);
        }

        // Update staking info
        userStaking.amount += amount;
        userStaking.startTime = block.timestamp;
        userStaking.lastRewardTime = block.timestamp;
        userStaking.isStaking = true;

        totalStaked += amount;
        _transfer(msg.sender, address(this), amount);

        emit TokensStaked(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Unstake tokens and claim rewards
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        StakingInfo storage userStaking = stakingInfo[msg.sender];
        require(userStaking.isStaking, "Not staking");
        require(userStaking.amount >= amount, "Insufficient staked amount");

        // Claim rewards first
        uint256 rewards = _calculateRewards(msg.sender);
        _claimRewards(msg.sender);

        // Update staking info
        userStaking.amount -= amount;
        if (userStaking.amount == 0) {
            userStaking.isStaking = false;
        }

        totalStaked -= amount;
        _transfer(address(this), msg.sender, amount);

        emit TokensUnstaked(msg.sender, amount, rewards);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        require(stakingInfo[msg.sender].isStaking, "Not staking");
        _claimRewards(msg.sender);
    }

    /**
     * @dev Calculate pending rewards for a user
     * @param user User address
     * @return Pending rewards
     */
    function calculateRewards(address user) external view returns (uint256) {
        return _calculateRewards(user);
    }

    /**
     * @dev Get staking information for a user
     * @param user User address
     * @return StakingInfo struct
     */
    function getStakingInfo(address user) external view returns (StakingInfo memory) {
        return stakingInfo[user];
    }

    // ============ GOVERNANCE FUNCTIONS ============

    /**
     * @dev Create a new governance proposal
     * @param title Proposal title
     * @param description Proposal description
     */
    function createProposal(string memory title, string memory description) external {
        require(balanceOf(msg.sender) >= proposalThreshold, "Insufficient tokens to create proposal");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        uint256 proposalId = _proposalIdCounter.current();
        _proposalIdCounter.increment();

        GovernanceProposal storage proposal = proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.title = title;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        proposal.proposer = msg.sender;

        emit ProposalCreated(proposalId, title, msg.sender);
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId Proposal ID
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external {
        GovernanceProposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed && !proposal.canceled, "Proposal not active");

        uint256 votes = balanceOf(msg.sender);
        require(votes > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = votes;

        if (support) {
            proposal.yesVotes += votes;
        } else {
            proposal.noVotes += votes;
        }

        emit Voted(proposalId, msg.sender, support, votes);
    }

    /**
     * @dev Execute a proposal
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external {
        GovernanceProposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(proposal.yesVotes + proposal.noVotes >= quorumVotes, "Quorum not reached");
        require(proposal.yesVotes > proposal.noVotes, "Proposal not passed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a proposal (only proposer or owner)
     * @param proposalId Proposal ID
     */
    function cancelProposal(uint256 proposalId) external {
        GovernanceProposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.proposer || msg.sender == owner(), "Not authorized");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");

        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }

    /**
     * @dev Get proposal information
     * @param proposalId Proposal ID
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 proposalId_,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        bool executed,
        bool canceled,
        address proposer
    ) {
        GovernanceProposal storage proposal = proposals[proposalId];
        return (
            proposal.proposalId,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.executed,
            proposal.canceled,
            proposal.proposer
        );
    }

    // ============ VESTING FUNCTIONS ============

    /**
     * @dev Create vesting schedule for a beneficiary
     * @param beneficiary Address to receive tokens
     * @param amount Total amount to vest
     * @param duration Vesting duration in seconds
     */
    function createVesting(address beneficiary, uint256 amount, uint256 duration) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(vestingAmount[beneficiary] == 0, "Vesting already exists");

        vestingAmount[beneficiary] = amount;
        vestingStartTime[beneficiary] = block.timestamp;
        vestingDuration[beneficiary] = duration;
        claimedAmount[beneficiary] = 0;

        _transfer(msg.sender, address(this), amount);
        emit VestingCreated(beneficiary, amount, duration);
    }

    /**
     * @dev Claim vested tokens
     */
    function claimVested() external nonReentrant {
        uint256 totalVested = vestingAmount[msg.sender];
        require(totalVested > 0, "No vesting found");

        uint256 claimable = _calculateVestedAmount(msg.sender);
        require(claimable > 0, "No tokens to claim");

        claimedAmount[msg.sender] += claimable;
        _transfer(address(this), msg.sender, claimable);

        emit VestingClaimed(msg.sender, claimable);
    }

    /**
     * @dev Calculate claimable vested amount
     * @param beneficiary Beneficiary address
     */
    function calculateVestedAmount(address beneficiary) external view returns (uint256) {
        return _calculateVestedAmount(beneficiary);
    }

    /**
     * @dev Get vesting information
     * @param beneficiary Beneficiary address
     */
    function getVestingInfo(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 startTime,
        uint256 duration,
        uint256 claimed,
        uint256 claimable
    ) {
        totalAmount = vestingAmount[beneficiary];
        startTime = vestingStartTime[beneficiary];
        duration = vestingDuration[beneficiary];
        claimed = claimedAmount[beneficiary];
        claimable = _calculateVestedAmount(beneficiary);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update reward rate
     * @param newRate New reward rate
     * @param duration Duration for new rate
     */
    function updateRewardRate(uint256 newRate, uint256 duration) external onlyOwner {
        currentRewardRate.isActive = false;
        
        currentRewardRate = RewardRate({
            rate: newRate,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            isActive: true
        });

        emit RewardRateUpdated(newRate, block.timestamp, block.timestamp + duration);
    }

    /**
     * @dev Update governance parameters
     * @param newProposalThreshold New proposal threshold
     * @param newVotingPeriod New voting period
     * @param newQuorumVotes New quorum votes
     */
    function updateGovernanceParams(
        uint256 newProposalThreshold,
        uint256 newVotingPeriod,
        uint256 newQuorumVotes
    ) external onlyOwner {
        proposalThreshold = newProposalThreshold;
        votingPeriod = newVotingPeriod;
        quorumVotes = newQuorumVotes;
    }

    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate rewards for a user
     * @param user User address
     * @return Rewards amount
     */
    function _calculateRewards(address user) internal view returns (uint256) {
        StakingInfo storage userStaking = stakingInfo[user];
        if (!userStaking.isStaking || !currentRewardRate.isActive) {
            return 0;
        }

        uint256 endTime = currentRewardRate.endTime;
        if (block.timestamp > endTime) {
            endTime = block.timestamp;
        }

        uint256 timeStaked = endTime - userStaking.lastRewardTime;
        return (userStaking.amount * currentRewardRate.rate * timeStaked) / 1e18;
    }

    /**
     * @dev Claim rewards for a user
     * @param user User address
     */
    function _claimRewards(address user) internal {
        uint256 rewards = _calculateRewards(user);
        if (rewards > 0) {
            StakingInfo storage userStaking = stakingInfo[user];
            userStaking.lastRewardTime = block.timestamp;
            userStaking.totalRewards += rewards;
            totalRewardsDistributed += rewards;

            _mint(user, rewards);
            emit RewardsClaimed(user, rewards);
        }
    }

    /**
     * @dev Calculate vested amount for a beneficiary
     * @param beneficiary Beneficiary address
     * @return Vested amount
     */
    function _calculateVestedAmount(address beneficiary) internal view returns (uint256) {
        uint256 totalAmount = vestingAmount[beneficiary];
        if (totalAmount == 0) return 0;

        uint256 startTime = vestingStartTime[beneficiary];
        uint256 duration = vestingDuration[beneficiary];
        uint256 claimed = claimedAmount[beneficiary];

        if (block.timestamp < startTime) return 0;

        uint256 elapsed = block.timestamp - startTime;
        uint256 vested;

        if (elapsed >= duration) {
            vested = totalAmount;
        } else {
            vested = (totalAmount * elapsed) / duration;
        }

        return vested > claimed ? vested - claimed : 0;
    }

    // ============ OVERRIDE FUNCTIONS ============

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalSupply_,
        uint256 totalStaked_,
        uint256 totalRewardsDistributed_,
        uint256 activeProposals
    ) {
        totalSupply_ = totalSupply();
        totalStaked_ = totalStaked;
        totalRewardsDistributed_ = totalRewardsDistributed;
        
        uint256 count = 0;
        for (uint256 i = 0; i < _proposalIdCounter.current(); i++) {
            GovernanceProposal storage proposal = proposals[i];
            if (!proposal.executed && !proposal.canceled && block.timestamp <= proposal.endTime) {
                count++;
            }
        }
        activeProposals = count;
    }
} 