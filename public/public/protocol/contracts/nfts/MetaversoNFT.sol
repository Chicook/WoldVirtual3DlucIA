// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MetaversoNFT
 * @dev Sistema de NFTs para el metaverso con funcionalidades avanzadas
 * @author Metaverso Crypto World Virtual 3D
 */
contract MetaversoNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    // ============ STRUCTS ============

    struct NFTMetadata {
        string name;
        string description;
        string image;
        string animation_url;
        string external_url;
        string[] attributes;
        uint256 rarity;
        uint256 level;
        uint256 experience;
        bool isTradeable;
        bool isStakeable;
        uint256 creationDate;
        uint256 lastModified;
    }

    struct Collection {
        uint256 collectionId;
        string name;
        string description;
        string symbol;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 mintPrice;
        bool isActive;
        address creator;
        uint256 creationDate;
        string baseURI;
    }

    struct StakingInfo {
        uint256 tokenId;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 totalRewards;
        bool isStaked;
    }

    struct Auction {
        uint256 auctionId;
        uint256 tokenId;
        address seller;
        uint256 startingPrice;
        uint256 currentPrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        bool isActive;
        bool isEnded;
    }

    // ============ STATE VARIABLES ============

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _collectionIdCounter;
    Counters.Counter private _auctionIdCounter;

    // Mappings
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(uint256 => Collection) public collections;
    mapping(uint256 => StakingInfo) public stakingInfo;
    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256[]) public userNFTs;
    mapping(uint256 => uint256[]) public collectionNFTs;
    mapping(address => bool) public authorizedMinters;
    mapping(uint256 => bool) public tokenExists;

    // Arrays
    uint256[] public allCollections;
    uint256[] public activeAuctions;

    // Configuration
    uint256 public mintFee = 0.01 ether;
    uint256 public stakingRewardRate = 1e15; // 0.001 tokens per second
    uint256 public auctionDuration = 7 days;
    uint256 public minAuctionPrice = 0.001 ether;
    uint256 public platformFee = 250; // 2.5% (250 basis points)
    uint256 public maxNFTsPerUser = 100;

    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed owner, uint256 indexed collectionId);
    event NFTBurned(uint256 indexed tokenId, address indexed owner);
    event CollectionCreated(uint256 indexed collectionId, string name, address indexed creator);
    event NFTStaked(uint256 indexed tokenId, address indexed owner);
    event NFTUnstaked(uint256 indexed tokenId, address indexed owner, uint256 rewards);
    event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, uint256 startingPrice);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 amount);
    event MetadataUpdated(uint256 indexed tokenId, string newURI);

    // ============ CONSTRUCTOR ============

    constructor() ERC721("Metaverso NFT", "MNFT") {
        _tokenIdCounter.increment(); // Start from 1
        _collectionIdCounter.increment();
        _auctionIdCounter.increment();
    }

    // ============ NFT MINTING ============

    /**
     * @dev Mint a new NFT
     * @param collectionId Collection ID
     * @param tokenURI Token URI
     * @param metadata NFT metadata
     */
    function mintNFT(
        uint256 collectionId,
        string memory tokenURI,
        NFTMetadata memory metadata
    ) external payable nonReentrant {
        require(collections[collectionId].isActive, "Collection not active");
        require(msg.value >= collections[collectionId].mintPrice + mintFee, "Insufficient payment");
        require(userNFTs[msg.sender].length < maxNFTsPerUser, "Max NFTs per user reached");
        require(collections[collectionId].currentSupply < collections[collectionId].maxSupply, "Collection full");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        nftMetadata[tokenId] = metadata;
        nftMetadata[tokenId].creationDate = block.timestamp;
        nftMetadata[tokenId].lastModified = block.timestamp;

        tokenExists[tokenId] = true;
        userNFTs[msg.sender].push(tokenId);
        collectionNFTs[collectionId].push(tokenId);

        collections[collectionId].currentSupply++;

        emit NFTMinted(tokenId, msg.sender, collectionId);
    }

    /**
     * @dev Mint NFT by authorized minter (free)
     * @param to Recipient address
     * @param collectionId Collection ID
     * @param tokenURI Token URI
     * @param metadata NFT metadata
     */
    function mintNFTByAuthorized(
        address to,
        uint256 collectionId,
        string memory tokenURI,
        NFTMetadata memory metadata
    ) external {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(collections[collectionId].isActive, "Collection not active");
        require(userNFTs[to].length < maxNFTsPerUser, "Max NFTs per user reached");
        require(collections[collectionId].currentSupply < collections[collectionId].maxSupply, "Collection full");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        nftMetadata[tokenId] = metadata;
        nftMetadata[tokenId].creationDate = block.timestamp;
        nftMetadata[tokenId].lastModified = block.timestamp;

        tokenExists[tokenId] = true;
        userNFTs[to].push(tokenId);
        collectionNFTs[collectionId].push(tokenId);

        collections[collectionId].currentSupply++;

        emit NFTMinted(tokenId, to, collectionId);
    }

    /**
     * @dev Burn an NFT
     * @param tokenId Token ID to burn
     */
    function burnNFT(uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        require(tokenExists[tokenId], "Token does not exist");

        _burn(tokenId);
        delete nftMetadata[tokenId];
        delete tokenExists[tokenId];

        // Remove from user's NFT list
        uint256[] storage userNFTList = userNFTs[msg.sender];
        for (uint256 i = 0; i < userNFTList.length; i++) {
            if (userNFTList[i] == tokenId) {
                userNFTList[i] = userNFTList[userNFTList.length - 1];
                userNFTList.pop();
                break;
            }
        }

        emit NFTBurned(tokenId, msg.sender);
    }

    // ============ COLLECTION MANAGEMENT ============

    /**
     * @dev Create a new collection
     * @param name Collection name
     * @param description Collection description
     * @param symbol Collection symbol
     * @param maxSupply Maximum supply
     * @param mintPrice Mint price
     * @param baseURI Base URI for collection
     */
    function createCollection(
        string memory name,
        string memory description,
        string memory symbol,
        uint256 maxSupply,
        uint256 mintPrice,
        string memory baseURI
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(maxSupply > 0, "Max supply must be greater than 0");

        uint256 collectionId = _collectionIdCounter.current();
        _collectionIdCounter.increment();

        Collection memory newCollection = Collection({
            collectionId: collectionId,
            name: name,
            description: description,
            symbol: symbol,
            maxSupply: maxSupply,
            currentSupply: 0,
            mintPrice: mintPrice,
            isActive: true,
            creator: msg.sender,
            creationDate: block.timestamp,
            baseURI: baseURI
        });

        collections[collectionId] = newCollection;
        allCollections.push(collectionId);

        emit CollectionCreated(collectionId, name, msg.sender);
    }

    /**
     * @dev Update collection information
     * @param collectionId Collection ID
     * @param name New name
     * @param description New description
     * @param mintPrice New mint price
     */
    function updateCollection(
        uint256 collectionId,
        string memory name,
        string memory description,
        uint256 mintPrice
    ) external {
        require(collections[collectionId].creator == msg.sender, "Not collection creator");
        require(collections[collectionId].isActive, "Collection not active");

        collections[collectionId].name = name;
        collections[collectionId].description = description;
        collections[collectionId].mintPrice = mintPrice;
    }

    /**
     * @dev Get collection information
     * @param collectionId Collection ID
     */
    function getCollection(uint256 collectionId) external view returns (Collection memory) {
        return collections[collectionId];
    }

    /**
     * @dev Get all collections
     */
    function getAllCollections() external view returns (uint256[] memory) {
        return allCollections;
    }

    /**
     * @dev Get NFTs in a collection
     * @param collectionId Collection ID
     */
    function getCollectionNFTs(uint256 collectionId) external view returns (uint256[] memory) {
        return collectionNFTs[collectionId];
    }

    // ============ STAKING SYSTEM ============

    /**
     * @dev Stake an NFT
     * @param tokenId Token ID to stake
     */
    function stakeNFT(uint256 tokenId) external nonReentrant {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        require(tokenExists[tokenId], "Token does not exist");
        require(nftMetadata[tokenId].isStakeable, "NFT not stakeable");
        require(!stakingInfo[tokenId].isStaked, "Already staked");

        StakingInfo storage staking = stakingInfo[tokenId];
        staking.tokenId = tokenId;
        staking.startTime = block.timestamp;
        staking.lastRewardTime = block.timestamp;
        staking.isStaked = true;

        emit NFTStaked(tokenId, msg.sender);
    }

    /**
     * @dev Unstake an NFT and claim rewards
     * @param tokenId Token ID to unstake
     */
    function unstakeNFT(uint256 tokenId) external nonReentrant {
        require(stakingInfo[tokenId].isStaked, "Not staked");
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");

        StakingInfo storage staking = stakingInfo[tokenId];
        uint256 rewards = _calculateStakingRewards(tokenId);

        staking.isStaked = false;
        staking.totalRewards += rewards;

        // Mint rewards to owner
        if (rewards > 0) {
            // This would require integration with the token contract
            // For now, we'll just emit the event
        }

        emit NFTUnstaked(tokenId, msg.sender, rewards);
    }

    /**
     * @dev Calculate staking rewards for an NFT
     * @param tokenId Token ID
     */
    function calculateStakingRewards(uint256 tokenId) external view returns (uint256) {
        return _calculateStakingRewards(tokenId);
    }

    /**
     * @dev Get staking information
     * @param tokenId Token ID
     */
    function getStakingInfo(uint256 tokenId) external view returns (StakingInfo memory) {
        return stakingInfo[tokenId];
    }

    // ============ AUCTION SYSTEM ============

    /**
     * @dev Create an auction for an NFT
     * @param tokenId Token ID to auction
     * @param startingPrice Starting price
     * @param duration Auction duration
     */
    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        require(tokenExists[tokenId], "Token does not exist");
        require(nftMetadata[tokenId].isTradeable, "NFT not tradeable");
        require(startingPrice >= minAuctionPrice, "Price too low");
        require(duration > 0 && duration <= 30 days, "Invalid duration");

        uint256 auctionId = _auctionIdCounter.current();
        _auctionIdCounter.increment();

        Auction memory newAuction = Auction({
            auctionId: auctionId,
            tokenId: tokenId,
            seller: msg.sender,
            startingPrice: startingPrice,
            currentPrice: startingPrice,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            highestBidder: address(0),
            isActive: true,
            isEnded: false
        });

        auctions[auctionId] = newAuction;
        activeAuctions.push(auctionId);

        // Transfer NFT to contract
        _transfer(msg.sender, address(this), tokenId);

        emit AuctionCreated(auctionId, tokenId, startingPrice);
    }

    /**
     * @dev Place a bid on an auction
     * @param auctionId Auction ID
     */
    function placeBid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.currentPrice, "Bid too low");
        require(msg.sender != auction.seller, "Seller cannot bid");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            (bool success, ) = auction.highestBidder.call{value: auction.currentPrice}("");
            require(success, "Refund failed");
        }

        auction.currentPrice = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * @dev End an auction
     * @param auctionId Auction ID
     */
    function endAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        auction.isActive = false;
        auction.isEnded = true;

        if (auction.highestBidder != address(0)) {
            // Calculate platform fee
            uint256 platformFeeAmount = (auction.currentPrice * platformFee) / 10000;
            uint256 sellerAmount = auction.currentPrice - platformFeeAmount;

            // Transfer to seller
            (bool success1, ) = auction.seller.call{value: sellerAmount}("");
            require(success1, "Transfer to seller failed");

            // Transfer platform fee to owner
            (bool success2, ) = owner().call{value: platformFeeAmount}("");
            require(success2, "Transfer platform fee failed");

            // Transfer NFT to winner
            _transfer(address(this), auction.highestBidder, auction.tokenId);

            emit AuctionEnded(auctionId, auction.highestBidder, auction.currentPrice);
        } else {
            // No bids, return NFT to seller
            _transfer(address(this), auction.seller, auction.tokenId);
        }

        // Remove from active auctions
        for (uint256 i = 0; i < activeAuctions.length; i++) {
            if (activeAuctions[i] == auctionId) {
                activeAuctions[i] = activeAuctions[activeAuctions.length - 1];
                activeAuctions.pop();
                break;
            }
        }
    }

    /**
     * @dev Get auction information
     * @param auctionId Auction ID
     */
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    /**
     * @dev Get active auctions
     */
    function getActiveAuctions() external view returns (uint256[] memory) {
        return activeAuctions;
    }

    // ============ METADATA MANAGEMENT ============

    /**
     * @dev Update NFT metadata
     * @param tokenId Token ID
     * @param newURI New token URI
     */
    function updateMetadata(uint256 tokenId, string memory newURI) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        require(tokenExists[tokenId], "Token does not exist");

        _setTokenURI(tokenId, newURI);
        nftMetadata[tokenId].lastModified = block.timestamp;

        emit MetadataUpdated(tokenId, newURI);
    }

    /**
     * @dev Get NFT metadata
     * @param tokenId Token ID
     */
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(tokenExists[tokenId], "Token does not exist");
        return nftMetadata[tokenId];
    }

    /**
     * @dev Get user's NFTs
     * @param user User address
     */
    function getUserNFTs(address user) external view returns (uint256[] memory) {
        return userNFTs[user];
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Add authorized minter
     * @param minter Minter address
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /**
     * @dev Remove authorized minter
     * @param minter Minter address
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    /**
     * @dev Update configuration
     * @param newMintFee New mint fee
     * @param newStakingRewardRate New staking reward rate
     * @param newAuctionDuration New auction duration
     * @param newMinAuctionPrice New minimum auction price
     * @param newPlatformFee New platform fee
     * @param newMaxNFTsPerUser New max NFTs per user
     */
    function updateConfiguration(
        uint256 newMintFee,
        uint256 newStakingRewardRate,
        uint256 newAuctionDuration,
        uint256 newMinAuctionPrice,
        uint256 newPlatformFee,
        uint256 newMaxNFTsPerUser
    ) external onlyOwner {
        mintFee = newMintFee;
        stakingRewardRate = newStakingRewardRate;
        auctionDuration = newAuctionDuration;
        minAuctionPrice = newMinAuctionPrice;
        platformFee = newPlatformFee;
        maxNFTsPerUser = newMaxNFTsPerUser;
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

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate staking rewards for an NFT
     * @param tokenId Token ID
     * @return Rewards amount
     */
    function _calculateStakingRewards(uint256 tokenId) internal view returns (uint256) {
        StakingInfo storage staking = stakingInfo[tokenId];
        if (!staking.isStaked) {
            return 0;
        }

        uint256 timeStaked = block.timestamp - staking.lastRewardTime;
        return (stakingRewardRate * timeStaked) / 1e18;
    }

    // ============ OVERRIDE FUNCTIONS ============

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalNFTs,
        uint256 totalCollections,
        uint256 totalAuctions,
        uint256 activeAuctionsCount,
        uint256 stakedNFTs
    ) {
        totalNFTs = _tokenIdCounter.current() - 1;
        totalCollections = _collectionIdCounter.current() - 1;
        totalAuctions = _auctionIdCounter.current() - 1;
        activeAuctionsCount = activeAuctions.length;
        
        uint256 stakedCount = 0;
        for (uint256 i = 1; i < _tokenIdCounter.current(); i++) {
            if (stakingInfo[i].isStaked) {
                stakedCount++;
            }
        }
        stakedNFTs = stakedCount;
    }
} 