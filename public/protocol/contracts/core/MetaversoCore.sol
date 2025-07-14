// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MetaversoCore
 * @dev Contrato principal del metaverso que integra todos los sistemas
 * @author Metaverso Crypto World Virtual 3D
 */
contract MetaversoCore is Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    using Strings for uint256;

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

    // ============ STATE VARIABLES ============

    Counters.Counter private _userIdCounter;
    Counters.Counter private _islandIdCounter;
    Counters.Counter private _avatarIdCounter;
    Counters.Counter private _transactionIdCounter;

    // Mappings
    mapping(address => User) public users;
    mapping(uint256 => Island) public islands;
    mapping(uint256 => Avatar) public avatars;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256) public addressToUserId;
    mapping(uint256 => address) public userIdToAddress;
    mapping(string => bool) public usernames;
    mapping(address => bool) public authorizedOperators;
    mapping(uint256 => mapping(address => bool)) public islandVisitors;

    // Arrays
    uint256[] public activeIslands;
    uint256[] public activeUsers;

    // Configuration
    uint256 public registrationFee = 0.01 ether;
    uint256 public avatarCreationFee = 0.005 ether;
    uint256 public islandCreationFee = 0.1 ether;
    uint256 public maxUsernameLength = 20;
    uint256 public maxIslandCapacity = 1000;
    uint256 public experiencePerVisit = 10;
    uint256 public levelUpExperience = 100;

    // Events
    event UserRegistered(address indexed user, uint256 userId, string username);
    event UserUpdated(address indexed user, uint256 userId);
    event IslandCreated(uint256 indexed islandId, string name, address indexed creator);
    event IslandVisited(uint256 indexed islandId, address indexed user);
    event AvatarCreated(uint256 indexed avatarId, uint256 indexed userId);
    event AvatarUpdated(uint256 indexed avatarId, uint256 indexed userId);
    event TransactionExecuted(uint256 indexed transactionId, address indexed from, address indexed to);
    event ExperienceGained(address indexed user, uint256 amount, uint256 newLevel);
    event ReputationChanged(address indexed user, int256 change, uint256 newReputation);

    // ============ MODIFIERS ============

    modifier onlyRegisteredUser() {
        require(users[msg.sender].isActive, "User not registered");
        _;
    }

    modifier onlyIslandCreator(uint256 islandId) {
        require(islands[islandId].creator == msg.sender, "Not island creator");
        _;
    }

    modifier onlyAuthorizedOperator() {
        require(authorizedOperators[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier validIslandId(uint256 islandId) {
        require(islands[islandId].isActive, "Invalid island ID");
        _;
    }

    modifier validAvatarId(uint256 avatarId) {
        require(avatars[avatarId].isActive, "Invalid avatar ID");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor() {
        _userIdCounter.increment(); // Start from 1
        _islandIdCounter.increment();
        _avatarIdCounter.increment();
        _transactionIdCounter.increment();
    }

    // ============ USER MANAGEMENT ============

    /**
     * @dev Register a new user
     * @param username The username for the new user
     */
    function registerUser(string memory username) external payable whenNotPaused nonReentrant {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(bytes(username).length > 0 && bytes(username).length <= maxUsernameLength, "Invalid username length");
        require(!usernames[username], "Username already taken");
        require(!users[msg.sender].isActive, "User already registered");

        uint256 userId = _userIdCounter.current();
        _userIdCounter.increment();

        User memory newUser = User({
            userId: userId,
            username: username,
            avatarHash: "",
            registrationDate: block.timestamp,
            lastActive: block.timestamp,
            isActive: true,
            experience: 0,
            level: 1,
            totalIslandsVisited: 0,
            totalTransactions: 0,
            reputation: 50
        });

        users[msg.sender] = newUser;
        addressToUserId[msg.sender] = userId;
        userIdToAddress[userId] = msg.sender;
        usernames[username] = true;
        activeUsers.push(userId);

        emit UserRegistered(msg.sender, userId, username);
    }

    /**
     * @dev Update user information
     * @param username New username
     */
    function updateUser(string memory username) external onlyRegisteredUser {
        require(bytes(username).length > 0 && bytes(username).length <= maxUsernameLength, "Invalid username length");
        require(!usernames[username] || keccak256(bytes(username)) == keccak256(bytes(users[msg.sender].username)), "Username already taken");

        if (keccak256(bytes(username)) != keccak256(bytes(users[msg.sender].username))) {
            usernames[users[msg.sender].username] = false;
            usernames[username] = true;
            users[msg.sender].username = username;
        }

        users[msg.sender].lastActive = block.timestamp;
        emit UserUpdated(msg.sender, users[msg.sender].userId);
    }

    /**
     * @dev Get user information
     * @param userAddress The address of the user
     * @return User struct
     */
    function getUser(address userAddress) external view returns (User memory) {
        return users[userAddress];
    }

    /**
     * @dev Get user by ID
     * @param userId The user ID
     * @return User struct
     */
    function getUserById(uint256 userId) external view returns (User memory) {
        address userAddress = userIdToAddress[userId];
        require(userAddress != address(0), "User not found");
        return users[userAddress];
    }

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
    ) external payable whenNotPaused nonReentrant {
        require(msg.value >= islandCreationFee, "Insufficient creation fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(maxCapacity > 0 && maxCapacity <= maxIslandCapacity, "Invalid capacity");
        require(users[msg.sender].isActive, "User not registered");

        uint256 islandId = _islandIdCounter.current();
        _islandIdCounter.increment();

        Island memory newIsland = Island({
            islandId: islandId,
            name: name,
            description: description,
            metadataHash: metadataHash,
            maxCapacity: maxCapacity,
            currentUsers: 0,
            creationDate: block.timestamp,
            creator: msg.sender,
            isActive: true,
            visitCount: 0,
            averageRating: 0,
            islandType: islandType
        });

        islands[islandId] = newIsland;
        activeIslands.push(islandId);

        emit IslandCreated(islandId, name, msg.sender);
    }

    /**
     * @dev Visit an island
     * @param islandId The island to visit
     */
    function visitIsland(uint256 islandId) external onlyRegisteredUser validIslandId(islandId) {
        require(!islandVisitors[islandId][msg.sender], "Already visiting this island");
        require(islands[islandId].currentUsers < islands[islandId].maxCapacity, "Island at full capacity");

        islands[islandId].currentUsers++;
        islands[islandId].visitCount++;
        islandVisitors[islandId][msg.sender] = true;

        User storage user = users[msg.sender];
        user.totalIslandsVisited++;
        user.lastActive = block.timestamp;
        user.experience += experiencePerVisit;

        // Check for level up
        uint256 newLevel = (user.experience / levelUpExperience) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
        }

        emit IslandVisited(islandId, msg.sender);
        emit ExperienceGained(msg.sender, experiencePerVisit, user.level);
    }

    /**
     * @dev Leave an island
     * @param islandId The island to leave
     */
    function leaveIsland(uint256 islandId) external onlyRegisteredUser validIslandId(islandId) {
        require(islandVisitors[islandId][msg.sender], "Not visiting this island");

        islands[islandId].currentUsers--;
        islandVisitors[islandId][msg.sender] = false;

        users[msg.sender].lastActive = block.timestamp;
    }

    /**
     * @dev Get island information
     * @param islandId The island ID
     * @return Island struct
     */
    function getIsland(uint256 islandId) external view returns (Island memory) {
        return islands[islandId];
    }

    /**
     * @dev Get all active islands
     * @return Array of island IDs
     */
    function getActiveIslands() external view returns (uint256[] memory) {
        return activeIslands;
    }

    // ============ AVATAR MANAGEMENT ============

    /**
     * @dev Create a new avatar
     * @param metadataHash IPFS hash of avatar metadata
     * @param traits Avatar traits
     */
    function createAvatar(string memory metadataHash, AvatarTraits memory traits) 
        external 
        payable 
        onlyRegisteredUser 
        whenNotPaused 
        nonReentrant 
    {
        require(msg.value >= avatarCreationFee, "Insufficient creation fee");
        require(bytes(metadataHash).length > 0, "Metadata hash cannot be empty");

        uint256 avatarId = _avatarIdCounter.current();
        _avatarIdCounter.increment();

        Avatar memory newAvatar = Avatar({
            avatarId: avatarId,
            userId: users[msg.sender].userId,
            metadataHash: metadataHash,
            creationDate: block.timestamp,
            lastModified: block.timestamp,
            isActive: true,
            traits: traits
        });

        avatars[avatarId] = newAvatar;
        users[msg.sender].avatarHash = metadataHash;

        emit AvatarCreated(avatarId, users[msg.sender].userId);
    }

    /**
     * @dev Update avatar
     * @param avatarId The avatar ID
     * @param metadataHash New metadata hash
     * @param traits New traits
     */
    function updateAvatar(uint256 avatarId, string memory metadataHash, AvatarTraits memory traits) 
        external 
        onlyRegisteredUser 
        validAvatarId(avatarId) 
    {
        require(avatars[avatarId].userId == users[msg.sender].userId, "Not your avatar");

        avatars[avatarId].metadataHash = metadataHash;
        avatars[avatarId].traits = traits;
        avatars[avatarId].lastModified = block.timestamp;
        users[msg.sender].avatarHash = metadataHash;

        emit AvatarUpdated(avatarId, users[msg.sender].userId);
    }

    /**
     * @dev Get avatar information
     * @param avatarId The avatar ID
     * @return Avatar struct
     */
    function getAvatar(uint256 avatarId) external view returns (Avatar memory) {
        return avatars[avatarId];
    }

    /**
     * @dev Get user's avatar
     * @param userId The user ID
     * @return Avatar struct
     */
    function getUserAvatar(uint256 userId) external view returns (Avatar memory) {
        address userAddress = userIdToAddress[userId];
        require(userAddress != address(0), "User not found");
        
        // Find avatar for this user
        for (uint256 i = 1; i < _avatarIdCounter.current(); i++) {
            if (avatars[i].userId == userId && avatars[i].isActive) {
                return avatars[i];
            }
        }
        
        revert("Avatar not found");
    }

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
    ) external payable onlyRegisteredUser whenNotPaused nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");

        uint256 transactionId = _transactionIdCounter.current();
        _transactionIdCounter.increment();

        Transaction memory newTransaction = Transaction({
            transactionId: transactionId,
            from: msg.sender,
            to: to,
            amount: amount,
            transactionType: transactionType,
            timestamp: block.timestamp,
            isCompleted: true,
            metadata: metadata
        });

        transactions[transactionId] = newTransaction;
        users[msg.sender].totalTransactions++;
        users[msg.sender].lastActive = block.timestamp;

        // Transfer funds
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");

        emit TransactionExecuted(transactionId, msg.sender, to);
    }

    /**
     * @dev Get transaction information
     * @param transactionId The transaction ID
     * @return Transaction struct
     */
    function getTransaction(uint256 transactionId) external view returns (Transaction memory) {
        return transactions[transactionId];
    }

    // ============ REPUTATION SYSTEM ============

    /**
     * @dev Change user reputation
     * @param userAddress The user address
     * @param change Reputation change (positive or negative)
     */
    function changeReputation(address userAddress, int256 change) external onlyAuthorizedOperator {
        require(users[userAddress].isActive, "User not found");
        
        uint256 currentReputation = users[userAddress].reputation;
        uint256 newReputation;
        
        if (change > 0) {
            newReputation = currentReputation + uint256(change);
        } else {
            if (uint256(-change) >= currentReputation) {
                newReputation = 0;
            } else {
                newReputation = currentReputation - uint256(-change);
            }
        }
        
        users[userAddress].reputation = newReputation;
        emit ReputationChanged(userAddress, change, newReputation);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Add authorized operator
     * @param operator The operator address
     */
    function addAuthorizedOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = true;
    }

    /**
     * @dev Remove authorized operator
     * @param operator The operator address
     */
    function removeAuthorizedOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = false;
    }

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
    ) external onlyOwner {
        registrationFee = newRegistrationFee;
        avatarCreationFee = newAvatarCreationFee;
        islandCreationFee = newIslandCreationFee;
    }

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
    ) external onlyOwner {
        maxUsernameLength = newMaxUsernameLength;
        maxIslandCapacity = newMaxIslandCapacity;
        experiencePerVisit = newExperiencePerVisit;
        levelUpExperience = newLevelUpExperience;
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

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
    ) {
        totalUsers = _userIdCounter.current() - 1;
        totalIslands = _islandIdCounter.current() - 1;
        totalAvatars = _avatarIdCounter.current() - 1;
        totalTransactions = _transactionIdCounter.current() - 1;
        activeUsersCount = activeUsers.length;
        activeIslandsCount = activeIslands.length;
    }

    /**
     * @dev Check if user is visiting island
     * @param islandId The island ID
     * @param userAddress The user address
     */
    function isVisitingIsland(uint256 islandId, address userAddress) external view returns (bool) {
        return islandVisitors[islandId][userAddress];
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ RECEIVE FUNCTION ============

    receive() external payable {
        // Accept ETH transfers
    }
} 