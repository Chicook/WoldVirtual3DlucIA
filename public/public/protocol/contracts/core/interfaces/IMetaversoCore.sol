// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IMetaversoCore
 * @dev Interfaz para el contrato principal del metaverso
 * @author Metaverso Crypto World Virtual 3D
 */
interface IMetaversoCore {
    // ============ STRUCTS ============

    struct User {
        uint256 userId;
        string username;
        string avatarHash;
        uint256 registrationDate;
        uint256 lastActive;
        bool isActive;
        uint256 experience;
        uint256 level;
        uint256 totalIslandsVisited;
        uint256 totalTransactions;
        uint256 reputation;
    }

    struct Island {
        uint256 islandId;
        string name;
        string description;
        string metadataHash;
        uint256 maxCapacity;
        uint256 currentUsers;
        uint256 creationDate;
        address creator;
        bool isActive;
        uint256 visitCount;
        uint256 averageRating;
        IslandType islandType;
    }

    struct Avatar {
        uint256 avatarId;
        uint256 userId;
        string metadataHash;
        uint256 creationDate;
        uint256 lastModified;
        bool isActive;
        AvatarTraits traits;
    }

    struct AvatarTraits {
        string gender;
        string age;
        string build;
        string skinTone;
        string hairColor;
        string eyeColor;
        string clothing;
        string personality;
        string[] traits;
        string[] interests;
    }

    struct Transaction {
        uint256 transactionId;
        address from;
        address to;
        uint256 amount;
        string transactionType;
        uint256 timestamp;
        bool isCompleted;
        string metadata;
    }

    // ============ ENUMS ============

    enum IslandType {
        FOREST,
        OCEAN,
        MOUNTAIN,
        DESERT,
        CITY,
        VOLCANO,
        VALLEY
    }

    enum TransactionType {
        AVATAR_CREATION,
        ISLAND_VISIT,
        NFT_PURCHASE,
        TOKEN_TRANSFER,
        STAKING,
        GOVERNANCE_VOTE
    }

    // ============ EVENTS ============

    event UserRegistered(address indexed user, uint256 userId, string username);
    event UserUpdated(address indexed user, uint256 userId);
    event IslandCreated(uint256 indexed islandId, string name, address indexed creator);
    event IslandVisited(uint256 indexed islandId, address indexed user);
    event AvatarCreated(uint256 indexed avatarId, uint256 indexed userId);
    event AvatarUpdated(uint256 indexed avatarId, uint256 indexed userId);
    event TransactionExecuted(uint256 indexed transactionId, address indexed from, address indexed to);
    event ExperienceGained(address indexed user, uint256 amount, uint256 newLevel);
    event ReputationChanged(address indexed user, int256 change, uint256 newReputation);

    // ============ USER MANAGEMENT ============

    /**
     * @dev Register a new user
     * @param username The username for the new user
     */
    function registerUser(string memory username) external payable;

    /**
     * @dev Update user information
     * @param username New username
     */
    function updateUser(string memory username) external;

    /**
     * @dev Get user information
     * @param userAddress The address of the user
     * @return User struct
     */
    function getUser(address userAddress) external view returns (User memory);

    /**
     * @dev Get user by ID
     * @param userId The user ID
     * @return User struct
     */
    function getUserById(uint256 userId) external view returns (User memory);

    // ============ ISLAND MANAGEMENT ============

    /**
     * @dev Create a new island
     * @param name Island name
     * @param description Island description
     * @param metadataHash IPFS hash of island metadata
     * @param maxCapacity Maximum number of users
     * @param islandType Type of island
     */
    function createIsland(
        string memory name,
        string memory description,
        string memory metadataHash,
        uint256 maxCapacity,
        IslandType islandType
    ) external payable;

    /**
     * @dev Visit an island
     * @param islandId The island to visit
     */
    function visitIsland(uint256 islandId) external;

    /**
     * @dev Leave an island
     * @param islandId The island to leave
     */
    function leaveIsland(uint256 islandId) external;

    /**
     * @dev Get island information
     * @param islandId The island ID
     * @return Island struct
     */
    function getIsland(uint256 islandId) external view returns (Island memory);

    /**
     * @dev Get all active islands
     * @return Array of island IDs
     */
    function getActiveIslands() external view returns (uint256[] memory);

    // ============ AVATAR MANAGEMENT ============

    /**
     * @dev Create a new avatar
     * @param metadataHash IPFS hash of avatar metadata
     * @param traits Avatar traits
     */
    function createAvatar(string memory metadataHash, AvatarTraits memory traits) external payable;

    /**
     * @dev Update avatar
     * @param avatarId The avatar ID
     * @param metadataHash New metadata hash
     * @param traits New traits
     */
    function updateAvatar(uint256 avatarId, string memory metadataHash, AvatarTraits memory traits) external;

    /**
     * @dev Get avatar information
     * @param avatarId The avatar ID
     * @return Avatar struct
     */
    function getAvatar(uint256 avatarId) external view returns (Avatar memory);

    /**
     * @dev Get user's avatar
     * @param userId The user ID
     * @return Avatar struct
     */
    function getUserAvatar(uint256 userId) external view returns (Avatar memory);

    // ============ TRANSACTION MANAGEMENT ============

    /**
     * @dev Execute a transaction
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param transactionType Type of transaction
     * @param metadata Additional metadata
     */
    function executeTransaction(
        address to,
        uint256 amount,
        string memory transactionType,
        string memory metadata
    ) external payable;

    /**
     * @dev Get transaction information
     * @param transactionId The transaction ID
     * @return Transaction struct
     */
    function getTransaction(uint256 transactionId) external view returns (Transaction memory);

    // ============ REPUTATION SYSTEM ============

    /**
     * @dev Change user reputation
     * @param userAddress The user address
     * @param change Reputation change (positive or negative)
     */
    function changeReputation(address userAddress, int256 change) external;

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Add authorized operator
     * @param operator The operator address
     */
    function addAuthorizedOperator(address operator) external;

    /**
     * @dev Remove authorized operator
     * @param operator The operator address
     */
    function removeAuthorizedOperator(address operator) external;

    /**
     * @dev Update fees
     * @param newRegistrationFee New registration fee
     * @param newAvatarCreationFee New avatar creation fee
     * @param newIslandCreationFee New island creation fee
     */
    function updateFees(
        uint256 newRegistrationFee,
        uint256 newAvatarCreationFee,
        uint256 newIslandCreationFee
    ) external;

    /**
     * @dev Update configuration
     * @param newMaxUsernameLength New max username length
     * @param newMaxIslandCapacity New max island capacity
     * @param newExperiencePerVisit New experience per visit
     * @param newLevelUpExperience New level up experience
     */
    function updateConfiguration(
        uint256 newMaxUsernameLength,
        uint256 newMaxIslandCapacity,
        uint256 newExperiencePerVisit,
        uint256 newLevelUpExperience
    ) external;

    /**
     * @dev Pause contract
     */
    function pause() external;

    /**
     * @dev Unpause contract
     */
    function unpause() external;

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external;

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalUsers,
        uint256 totalIslands,
        uint256 totalAvatars,
        uint256 totalTransactions,
        uint256 activeUsersCount,
        uint256 activeIslandsCount
    );

    /**
     * @dev Check if user is visiting island
     * @param islandId The island ID
     * @param userAddress The user address
     */
    function isVisitingIsland(uint256 islandId, address userAddress) external view returns (bool);

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256);

    // ============ RECEIVE FUNCTION ============

    receive() external payable;
} 