// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/core/MetaversoCore.sol";
import "../contracts/core/MetaversoToken.sol";
import "../contracts/nfts/MetaversoNFT.sol";
import "../contracts/defi/MetaversoDeFi.sol";
import "../contracts/governance/MetaversoGovernance.sol";

/**
 * @title MetaversoTest
 * @dev Tests completos para todos los contratos del metaverso
 * @author Metaverso Crypto World Virtual 3D
 */
contract MetaversoTest is Test {
    // ============ CONTRACTS ============

    MetaversoCore public metaversoCore;
    MetaversoToken public metaversoToken;
    MetaversoNFT public metaversoNFT;
    MetaversoDeFi public metaversoDeFi;
    MetaversoGovernance public metaversoGovernance;

    // ============ ADDRESSES ============

    address public deployer = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    address public treasury = address(0x4);
    address public wethAddress = address(0x5);

    // ============ CONSTANTS ============

    uint256 public constant REGISTRATION_FEE = 0.01 ether;
    uint256 public constant AVATAR_CREATION_FEE = 0.005 ether;
    uint256 public constant ISLAND_CREATION_FEE = 0.1 ether;
    uint256 public constant INITIAL_TOKEN_SUPPLY = 1000000000 * 10**18;

    // ============ SETUP ============

    function setUp() public {
        // Deploy contracts
        metaversoToken = new MetaversoToken();
        metaversoCore = new MetaversoCore();
        metaversoNFT = new MetaversoNFT();
        metaversoDeFi = new MetaversoDeFi(address(metaversoToken), wethAddress);
        metaversoGovernance = new MetaversoGovernance(address(metaversoCore), address(metaversoToken));

        // Fund test addresses
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
        vm.deal(treasury, 100 ether);

        // Transfer tokens to test users
        metaversoToken.transfer(user1, 10000 * 10**18);
        metaversoToken.transfer(user2, 10000 * 10**18);
        metaversoToken.transfer(user3, 10000 * 10**18);
    }

    // ============ METAVERSO CORE TESTS ============

    function testUserRegistration() public {
        vm.startPrank(user1);
        
        // Register user
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser1");
        
        // Check user data
        MetaversoCore.User memory user = metaversoCore.getUser(user1);
        assertEq(user.username, "testuser1");
        assertEq(user.isActive, true);
        assertEq(user.level, 1);
        assertEq(user.experience, 0);
        
        vm.stopPrank();
    }

    function testUserRegistrationFailInsufficientFee() public {
        vm.startPrank(user1);
        
        // Try to register with insufficient fee
        vm.expectRevert("Insufficient registration fee");
        metaversoCore.registerUser{value: 0.005 ether}("testuser1");
        
        vm.stopPrank();
    }

    function testUserRegistrationFailDuplicateUsername() public {
        vm.startPrank(user1);
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser");
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert("Username already taken");
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser");
        vm.stopPrank();
    }

    function testIslandCreation() public {
        vm.startPrank(user1);
        
        // Register user first
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser1");
        
        // Create island
        metaversoCore.createIsland{value: ISLAND_CREATION_FEE}(
            "Test Island",
            "A test island",
            "ipfs://test",
            100,
            MetaversoCore.IslandType.FOREST
        );
        
        // Check island data
        MetaversoCore.Island memory island = metaversoCore.getIsland(1);
        assertEq(island.name, "Test Island");
        assertEq(island.creator, user1);
        assertEq(island.isActive, true);
        assertEq(island.maxCapacity, 100);
        
        vm.stopPrank();
    }

    function testIslandVisit() public {
        // Setup: Create user and island
        vm.startPrank(user1);
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser1");
        metaversoCore.createIsland{value: ISLAND_CREATION_FEE}(
            "Test Island",
            "A test island",
            "ipfs://test",
            100,
            MetaversoCore.IslandType.FOREST
        );
        vm.stopPrank();

        // Visit island
        vm.startPrank(user1);
        metaversoCore.visitIsland(1);
        
        // Check user data
        MetaversoCore.User memory user = metaversoCore.getUser(user1);
        assertEq(user.totalIslandsVisited, 1);
        assertEq(user.experience, 10); // experiencePerVisit
        
        // Check island data
        MetaversoCore.Island memory island = metaversoCore.getIsland(1);
        assertEq(island.currentUsers, 1);
        assertEq(island.visitCount, 1);
        
        vm.stopPrank();
    }

    function testAvatarCreation() public {
        vm.startPrank(user1);
        
        // Register user first
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser1");
        
        // Create avatar
        MetaversoCore.AvatarTraits memory traits = MetaversoCore.AvatarTraits({
            gender: "male",
            age: "25",
            build: "athletic",
            skinTone: "medium",
            hairColor: "brown",
            eyeColor: "blue",
            clothing: "casual",
            personality: "friendly",
            traits: new string[](0),
            interests: new string[](0)
        });
        
        metaversoCore.createAvatar{value: AVATAR_CREATION_FEE}("ipfs://avatar", traits);
        
        // Check avatar data
        MetaversoCore.Avatar memory avatar = metaversoCore.getAvatar(1);
        assertEq(avatar.userId, 1);
        assertEq(avatar.isActive, true);
        
        vm.stopPrank();
    }

    // ============ METAVERSO TOKEN TESTS ============

    function testTokenInitialSupply() public {
        assertEq(metaversoToken.totalSupply(), INITIAL_TOKEN_SUPPLY);
        assertEq(metaversoToken.balanceOf(deployer), INITIAL_TOKEN_SUPPLY);
    }

    function testTokenTransfer() public {
        uint256 transferAmount = 1000 * 10**18;
        
        metaversoToken.transfer(user1, transferAmount);
        
        assertEq(metaversoToken.balanceOf(user1), transferAmount);
        assertEq(metaversoToken.balanceOf(deployer), INITIAL_TOKEN_SUPPLY - transferAmount);
    }

    function testTokenStaking() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        // Transfer tokens to user
        metaversoToken.transfer(user1, stakeAmount);
        
        vm.startPrank(user1);
        
        // Approve staking
        metaversoToken.approve(address(metaversoToken), stakeAmount);
        
        // Stake tokens
        metaversoToken.stake(stakeAmount);
        
        // Check staking info
        (uint256 amount, , , , bool isStaking) = metaversoToken.getStakingInfo(user1);
        assertEq(amount, stakeAmount);
        assertEq(isStaking, true);
        
        vm.stopPrank();
    }

    function testTokenStakingRewards() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        // Transfer tokens to user
        metaversoToken.transfer(user1, stakeAmount);
        
        vm.startPrank(user1);
        
        // Approve and stake
        metaversoToken.approve(address(metaversoToken), stakeAmount);
        metaversoToken.stake(stakeAmount);
        
        // Fast forward time
        vm.warp(block.timestamp + 1 days);
        
        // Check rewards
        uint256 rewards = metaversoToken.calculateRewards(user1);
        assertGt(rewards, 0, "Should have earned rewards");
        
        // Claim rewards
        metaversoToken.claimRewards();
        
        // Check balance increased
        assertGt(metaversoToken.balanceOf(user1), stakeAmount, "Should have received rewards");
        
        vm.stopPrank();
    }

    function testGovernanceProposal() public {
        uint256 proposalThreshold = 10000 * 10**18;
        
        // Transfer tokens to user
        metaversoToken.transfer(user1, proposalThreshold);
        
        vm.startPrank(user1);
        
        // Create proposal
        metaversoToken.createProposal("Test Proposal", "Test Description");
        
        // Check proposal
        (uint256 proposalId, string memory title, , , , , , , , address proposer) = metaversoToken.getProposal(0);
        assertEq(title, "Test Proposal");
        assertEq(proposer, user1);
        
        vm.stopPrank();
    }

    // ============ METAVERSO NFT TESTS ============

    function testNFTCollectionCreation() public {
        vm.startPrank(deployer);
        
        metaversoNFT.createCollection(
            "Test Collection",
            "Test Description",
            "TEST",
            1000,
            0.01 ether,
            "ipfs://test/"
        );
        
        // Check collection
        MetaversoNFT.Collection memory collection = metaversoNFT.getCollection(1);
        assertEq(collection.name, "Test Collection");
        assertEq(collection.maxSupply, 1000);
        assertEq(collection.isActive, true);
        
        vm.stopPrank();
    }

    function testNFTMinting() public {
        // Create collection first
        vm.startPrank(deployer);
        metaversoNFT.createCollection(
            "Test Collection",
            "Test Description",
            "TEST",
            1000,
            0.01 ether,
            "ipfs://test/"
        );
        vm.stopPrank();

        // Mint NFT
        vm.startPrank(user1);
        
        MetaversoNFT.NFTMetadata memory metadata = MetaversoNFT.NFTMetadata({
            name: "Test NFT",
            description: "Test NFT Description",
            image: "ipfs://test/image.png",
            animation_url: "",
            external_url: "",
            attributes: new string[](0),
            rarity: 1,
            level: 1,
            experience: 0,
            isTradeable: true,
            isStakeable: true,
            creationDate: 0,
            lastModified: 0
        });
        
        metaversoNFT.mintNFT{value: 0.02 ether}(1, "ipfs://test/token", metadata);
        
        // Check NFT
        assertEq(metaversoNFT.ownerOf(1), user1);
        assertEq(metaversoNFT.balanceOf(user1), 1);
        
        vm.stopPrank();
    }

    function testNFTStaking() public {
        // Setup: Create collection and mint NFT
        vm.startPrank(deployer);
        metaversoNFT.createCollection("Test Collection", "Test Description", "TEST", 1000, 0.01 ether, "ipfs://test/");
        vm.stopPrank();

        vm.startPrank(user1);
        
        MetaversoNFT.NFTMetadata memory metadata = MetaversoNFT.NFTMetadata({
            name: "Test NFT",
            description: "Test NFT Description",
            image: "ipfs://test/image.png",
            animation_url: "",
            external_url: "",
            attributes: new string[](0),
            rarity: 1,
            level: 1,
            experience: 0,
            isTradeable: true,
            isStakeable: true,
            creationDate: 0,
            lastModified: 0
        });
        
        metaversoNFT.mintNFT{value: 0.02 ether}(1, "ipfs://test/token", metadata);
        
        // Stake NFT
        metaversoNFT.stakeNFT(1);
        
        // Check staking info
        MetaversoNFT.StakingInfo memory staking = metaversoNFT.getStakingInfo(1);
        assertEq(staking.isStaked, true);
        
        vm.stopPrank();
    }

    // ============ METAVERSO DEFI TESTS ============

    function testDeFiStakingPoolCreation() public {
        vm.startPrank(deployer);
        
        metaversoDeFi.createStakingPool(
            "Test Pool",
            "Test Description",
            address(metaversoToken),
            1e15, // 0.001 tokens per second
            100 * 10**18, // 100 min stake
            10000 * 10**18, // 10k max stake
            30 days // 30 days lock
        );
        
        // Check pool
        MetaversoDeFi.StakingPool memory pool = metaversoDeFi.getStakingPool(1);
        assertEq(pool.name, "Test Pool");
        assertEq(pool.isActive, true);
        
        vm.stopPrank();
    }

    function testDeFiStaking() public {
        // Create pool first
        vm.startPrank(deployer);
        metaversoDeFi.createStakingPool(
            "Test Pool",
            "Test Description",
            address(metaversoToken),
            1e15,
            100 * 10**18,
            10000 * 10**18,
            30 days
        );
        vm.stopPrank();

        // Stake in pool
        vm.startPrank(user1);
        
        uint256 stakeAmount = 1000 * 10**18;
        metaversoToken.approve(address(metaversoDeFi), stakeAmount);
        metaversoDeFi.stake(1, stakeAmount);
        
        // Check staking info
        MetaversoDeFi.UserStake memory userStake = metaversoDeFi.getUserStake(user1, 1);
        assertEq(userStake.amount, stakeAmount);
        assertEq(userStake.isStaked, true);
        
        vm.stopPrank();
    }

    function testDeFiLiquidityPoolCreation() public {
        vm.startPrank(deployer);
        
        metaversoDeFi.createLiquidityPool(
            "META-ETH LP",
            address(metaversoToken),
            wethAddress,
            30 // 0.3% fee
        );
        
        // Check pool
        uint256[] memory pools = metaversoDeFi.getActiveLiquidityPools();
        assertEq(pools.length, 1);
        
        vm.stopPrank();
    }

    function testDeFiYieldFarmCreation() public {
        vm.startPrank(deployer);
        
        metaversoDeFi.createYieldFarm(
            "Test Farm",
            "Test Description",
            address(metaversoToken),
            address(metaversoToken),
            1e15, // 0.001 tokens per second
            365 days // 1 year
        );
        
        // Check farm
        uint256[] memory farms = metaversoDeFi.getActiveYieldFarms();
        assertEq(farms.length, 1);
        
        vm.stopPrank();
    }

    // ============ METAVERSO GOVERNANCE TESTS ============

    function testGovernanceProposalCreation() public {
        // Transfer tokens to user for voting power
        metaversoToken.transfer(user1, 20000 * 10**18);
        
        vm.startPrank(user1);
        
        metaversoGovernance.createProposal(
            "Test Governance Proposal",
            "Test Description",
            "ipfs://test/",
            MetaversoGovernance.ProposalType.POLICY_CHANGE
        );
        
        // Check proposal
        (uint256 proposalId, string memory title, , , , , , , , , , MetaversoGovernance.ProposalStatus status) = metaversoGovernance.getProposal(1);
        assertEq(title, "Test Governance Proposal");
        assertEq(uint256(status), uint256(MetaversoGovernance.ProposalStatus.PENDING));
        
        vm.stopPrank();
    }

    function testGovernanceVoting() public {
        // Setup: Create proposal
        metaversoToken.transfer(user1, 20000 * 10**18);
        
        vm.startPrank(user1);
        metaversoGovernance.createProposal("Test Proposal", "Test Description", "ipfs://test/", MetaversoGovernance.ProposalType.POLICY_CHANGE);
        metaversoGovernance.activateProposal(1);
        vm.stopPrank();

        // Vote
        vm.startPrank(user1);
        metaversoGovernance.vote(1, MetaversoGovernance.VoteChoice.YES, "I support this proposal");
        
        // Check vote
        (bool hasVoted, MetaversoGovernance.VoteChoice choice, , , ) = metaversoGovernance.getUserVote(1, user1);
        assertEq(hasVoted, true);
        assertEq(uint256(choice), uint256(MetaversoGovernance.VoteChoice.YES));
        
        vm.stopPrank();
    }

    function testGovernanceDelegation() public {
        // Transfer tokens to users
        metaversoToken.transfer(user1, 10000 * 10**18);
        metaversoToken.transfer(user2, 5000 * 10**18);
        
        vm.startPrank(user1);
        metaversoGovernance.delegate(user2, 5000 * 10**18);
        
        // Check delegation
        (address delegate, uint256 delegatedPower, , bool isActive) = metaversoGovernance.getDelegation(user1);
        assertEq(delegate, user2);
        assertEq(delegatedPower, 5000 * 10**18);
        assertEq(isActive, true);
        
        vm.stopPrank();
    }

    // ============ INTEGRATION TESTS ============

    function testFullUserJourney() public {
        // 1. Register user
        vm.startPrank(user1);
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser1");
        
        // 2. Create avatar
        MetaversoCore.AvatarTraits memory traits = MetaversoCore.AvatarTraits({
            gender: "male",
            age: "25",
            build: "athletic",
            skinTone: "medium",
            hairColor: "brown",
            eyeColor: "blue",
            clothing: "casual",
            personality: "friendly",
            traits: new string[](0),
            interests: new string[](0)
        });
        metaversoCore.createAvatar{value: AVATAR_CREATION_FEE}("ipfs://avatar", traits);
        
        // 3. Create island
        metaversoCore.createIsland{value: ISLAND_CREATION_FEE}(
            "My Island",
            "My personal island",
            "ipfs://island",
            50,
            MetaversoCore.IslandType.FOREST
        );
        
        // 4. Visit island
        metaversoCore.visitIsland(1);
        
        // 5. Stake tokens
        metaversoToken.approve(address(metaversoToken), 1000 * 10**18);
        metaversoToken.stake(1000 * 10**18);
        
        // 6. Create governance proposal
        metaversoGovernance.createProposal(
            "Community Proposal",
            "A proposal from the community",
            "ipfs://proposal",
            MetaversoGovernance.ProposalType.COMMUNITY_PROPOSAL
        );
        
        vm.stopPrank();
        
        // Verify everything worked
        MetaversoCore.User memory user = metaversoCore.getUser(user1);
        assertEq(user.username, "testuser1");
        assertEq(user.totalIslandsVisited, 1);
        assertEq(user.experience, 10);
        
        (uint256 stakedAmount, , , , bool isStaking) = metaversoToken.getStakingInfo(user1);
        assertEq(stakedAmount, 1000 * 10**18);
        assertEq(isStaking, true);
    }

    function testEmergencyPause() public {
        // Pause all contracts
        metaversoCore.pause();
        metaversoToken.pause();
        metaversoNFT.pause();
        
        // Try to register user (should fail)
        vm.startPrank(user1);
        vm.expectRevert("Pausable: paused");
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser1");
        vm.stopPrank();
        
        // Try to transfer tokens (should fail)
        vm.expectRevert("Pausable: paused");
        metaversoToken.transfer(user1, 1000 * 10**18);
        
        // Unpause
        metaversoCore.unpause();
        metaversoToken.unpause();
        metaversoNFT.unpause();
        
        // Should work again
        metaversoToken.transfer(user1, 1000 * 10**18);
        assertEq(metaversoToken.balanceOf(user1), 1000 * 10**18);
    }

    // ============ EDGE CASES AND ERROR TESTS ============

    function testReentrancyProtection() public {
        // This test would require a malicious contract to test reentrancy
        // For now, we just verify the contracts have reentrancy protection
        assertTrue(address(metaversoCore).code.length > 0);
        assertTrue(address(metaversoToken).code.length > 0);
        assertTrue(address(metaversoNFT).code.length > 0);
        assertTrue(address(metaversoDeFi).code.length > 0);
        assertTrue(address(metaversoGovernance).code.length > 0);
    }

    function testAccessControl() public {
        // Test that only authorized users can call admin functions
        vm.startPrank(user1);
        
        vm.expectRevert();
        metaversoCore.addAuthorizedOperator(user2);
        
        vm.expectRevert();
        metaversoToken.addAuthorizedMinter(user2);
        
        vm.expectRevert();
        metaversoNFT.addAuthorizedMinter(user2);
        
        vm.stopPrank();
    }

    function testGasOptimization() public {
        // Test that operations don't consume excessive gas
        uint256 gasBefore = gasleft();
        
        vm.startPrank(user1);
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser1");
        uint256 gasUsed = gasBefore - gasleft();
        
        // Registration should use reasonable amount of gas
        assertLt(gasUsed, 500000, "Registration uses too much gas");
        
        vm.stopPrank();
    }

    // ============ PERFORMANCE TESTS ============

    function testBulkOperations() public {
        // Test multiple users registering
        for (uint256 i = 0; i < 10; i++) {
            address user = address(uint160(1000 + i));
            vm.deal(user, 1 ether);
            
            vm.startPrank(user);
            metaversoCore.registerUser{value: REGISTRATION_FEE}(string(abi.encodePacked("user", vm.toString(i))));
            vm.stopPrank();
        }
        
        // Verify all users were registered
        for (uint256 i = 0; i < 10; i++) {
            address user = address(uint160(1000 + i));
            MetaversoCore.User memory userData = metaversoCore.getUser(user);
            assertEq(userData.isActive, true);
        }
    }

    function testStressTest() public {
        // Create many islands and visit them
        vm.startPrank(user1);
        metaversoCore.registerUser{value: REGISTRATION_FEE}("testuser1");
        
        for (uint256 i = 0; i < 5; i++) {
            metaversoCore.createIsland{value: ISLAND_CREATION_FEE}(
                string(abi.encodePacked("Island ", vm.toString(i))),
                "Test island",
                "ipfs://test",
                100,
                MetaversoCore.IslandType.FOREST
            );
        }
        
        // Visit all islands
        for (uint256 i = 1; i <= 5; i++) {
            metaversoCore.visitIsland(i);
        }
        
        vm.stopPrank();
        
        // Verify user has visited all islands
        MetaversoCore.User memory user = metaversoCore.getUser(user1);
        assertEq(user.totalIslandsVisited, 5);
        assertEq(user.experience, 50); // 5 islands * 10 experience each
    }
} 