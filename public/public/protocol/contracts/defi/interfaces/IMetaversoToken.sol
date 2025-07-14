// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IMetaversoToken
 * @dev Interfaz para el token del metaverso
 * @author Metaverso Crypto World Virtual 3D
 */
interface IMetaversoToken {
    // ============ EVENTS ============
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    // ============ BASIC FUNCTIONS ============

    /**
     * @dev Returns the name of the token
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals of the token
     */
    function decimals() external view returns (uint8);

    /**
     * @dev Returns the total supply of the token
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the balance of the specified address
     * @param account The address to query the balance of
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Transfers tokens from the caller to a specified address
     * @param to The address to transfer to
     * @param amount The amount to transfer
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that spender will be allowed to spend
     * @param owner The address which owns the funds
     * @param spender The address which will spend the funds
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Approves the specified address to spend the specified amount of tokens
     * @param spender The address which will spend the funds
     * @param amount The amount of tokens to be spent
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Transfers tokens from one address to another using the allowance mechanism
     * @param from The address which you want to send tokens from
     * @param to The address which you want to transfer to
     * @param amount The amount of tokens to be transferred
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // ============ MINTING FUNCTIONS ============

    /**
     * @dev Mints new tokens to the specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external;

    /**
     * @dev Burns tokens from the caller's account
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) external;

    /**
     * @dev Burns tokens from a specified address
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external;

    // ============ STAKING FUNCTIONS ============

    /**
     * @dev Stakes tokens to earn rewards
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external;

    /**
     * @dev Unstakes tokens and claims rewards
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 amount) external;

    /**
     * @dev Claims staking rewards
     */
    function claimRewards() external;

    /**
     * @dev Calculates pending rewards for a user
     * @param user User address
     */
    function calculateRewards(address user) external view returns (uint256);

    /**
     * @dev Gets staking information for a user
     * @param user User address
     */
    function getStakingInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lastRewardTime,
        uint256 totalRewards,
        bool isStaking
    );

    // ============ GOVERNANCE FUNCTIONS ============

    /**
     * @dev Creates a new governance proposal
     * @param title Proposal title
     * @param description Proposal description
     */
    function createProposal(string memory title, string memory description) external;

    /**
     * @dev Votes on a proposal
     * @param proposalId Proposal ID
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external;

    /**
     * @dev Executes a proposal
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external;

    /**
     * @dev Cancels a proposal
     * @param proposalId Proposal ID
     */
    function cancelProposal(uint256 proposalId) external;

    /**
     * @dev Gets proposal information
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
    );

    // ============ VESTING FUNCTIONS ============

    /**
     * @dev Creates vesting schedule for a beneficiary
     * @param beneficiary Address to receive tokens
     * @param amount Total amount to vest
     * @param duration Vesting duration in seconds
     */
    function createVesting(address beneficiary, uint256 amount, uint256 duration) external;

    /**
     * @dev Claims vested tokens
     */
    function claimVested() external;

    /**
     * @dev Calculates claimable vested amount
     * @param beneficiary Beneficiary address
     */
    function calculateVestedAmount(address beneficiary) external view returns (uint256);

    /**
     * @dev Gets vesting information
     * @param beneficiary Beneficiary address
     */
    function getVestingInfo(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 startTime,
        uint256 duration,
        uint256 claimed,
        uint256 claimable
    );

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Updates reward rate
     * @param newRate New reward rate
     * @param duration Duration for new rate
     */
    function updateRewardRate(uint256 newRate, uint256 duration) external;

    /**
     * @dev Updates governance parameters
     * @param newProposalThreshold New proposal threshold
     * @param newVotingPeriod New voting period
     * @param newQuorumVotes New quorum votes
     */
    function updateGovernanceParams(
        uint256 newProposalThreshold,
        uint256 newVotingPeriod,
        uint256 newQuorumVotes
    ) external;

    /**
     * @dev Pauses token transfers
     */
    function pause() external;

    /**
     * @dev Unpauses token transfers
     */
    function unpause() external;

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Gets contract statistics
     */
    function getStats() external view returns (
        uint256 totalSupply_,
        uint256 totalStaked_,
        uint256 totalRewardsDistributed_,
        uint256 activeProposals
    );

    // ============ EVENTS ============

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
} 