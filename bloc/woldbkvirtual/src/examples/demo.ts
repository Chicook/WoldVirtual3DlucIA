/**
 * @fileoverview Demo completo de la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/examples/demo
 */

import { WoldVirtualBlockchain, createWallet, formatBalance, BLOCKCHAIN_CONSTANTS } from '../blockchain';
import { Logger } from '../utils/logger';

const logger = new Logger('Demo');

/**
 * Demo principal de la blockchain
 */
export async function runBlockchainDemo(): Promise<void> {
  try {
    logger.info('🚀 Iniciando demo de la blockchain WoldVirtual3D...');

    // 1. Crear e inicializar la blockchain
    logger.info('📦 Creando blockchain...');
    const blockchain = new WoldVirtualBlockchain();
    await blockchain.initialize();
    const chain = blockchain.getChain();

    // 2. Crear wallets de prueba
    logger.info('👛 Creando wallets de prueba...');
    const alice = createWallet();
    const bob = createWallet();
    const charlie = createWallet();

    logger.info(`Alice: ${alice.address}`);
    logger.info(`Bob: ${bob.address}`);
    logger.info(`Charlie: ${charlie.address}`);

    // 3. Obtener balances iniciales
    logger.info('💰 Verificando balances iniciales...');
    const aliceBalance = await chain.getBalance(alice.address);
    const bobBalance = await chain.getBalance(bob.address);
    const charlieBalance = await chain.getBalance(charlie.address);

    logger.info(`Alice balance: ${formatBalance(aliceBalance)} WVC`);
    logger.info(`Bob balance: ${formatBalance(bobBalance)} WVC`);
    logger.info(`Charlie balance: ${formatBalance(charlieBalance)} WVC`);

    // 4. Registrar usuarios
    logger.info('👤 Registrando usuarios...');
    
    const aliceUserId = await chain.registerUser({
      username: 'alice_3d',
      email: 'alice@woldvirtual3d.com',
      avatar: 'https://example.com/avatars/alice.png',
      bio: 'Creadora de assets 3D'
    }, alice.address);

    const bobUserId = await chain.registerUser({
      username: 'bob_builder',
      email: 'bob@woldvirtual3d.com',
      avatar: 'https://example.com/avatars/bob.png',
      bio: 'Constructor de metaversos'
    }, bob.address);

    const charlieUserId = await chain.registerUser({
      username: 'charlie_explorer',
      email: 'charlie@woldvirtual3d.com',
      avatar: 'https://example.com/avatars/charlie.png',
      bio: 'Explorador de mundos virtuales'
    }, charlie.address);

    logger.info(`Usuarios registrados: ${aliceUserId}, ${bobUserId}, ${charlieUserId}`);

    // 5. Registrar assets
    logger.info('🎨 Registrando assets 3D...');
    
    const castleAssetId = await chain.registerAsset({
      name: 'Castillo Medieval',
      description: 'Un impresionante castillo medieval con torres y murallas',
      type: 'MODEL_3D',
      ipfsHash: 'QmCastle123456789',
      isPublic: true,
      allowDownload: true,
      allowModification: false,
      allowCommercialUse: false,
      price: '1000000000000000000', // 1 WVC
      tags: ['medieval', 'castillo', 'fantasía'],
      metadata: {
        fileSize: 15000000,
        fileFormat: 'glb',
        dimensions: { width: 100, height: 50, depth: 100 },
        category: 'arquitectura',
        version: '1.0.0',
        license: 'CC BY-NC-SA 4.0'
      }
    }, alice.address);

    const dragonAssetId = await chain.registerAsset({
      name: 'Dragón Élfico',
      description: 'Un majestuoso dragón con alas y escamas brillantes',
      type: 'MODEL_3D',
      ipfsHash: 'QmDragon987654321',
      isPublic: true,
      allowDownload: true,
      allowModification: true,
      allowCommercialUse: true,
      price: '5000000000000000000', // 5 WVC
      tags: ['dragón', 'fantasía', 'criatura'],
      metadata: {
        fileSize: 25000000,
        fileFormat: 'glb',
        dimensions: { width: 20, height: 15, depth: 30 },
        category: 'criaturas',
        version: '2.1.0',
        license: 'CC BY 4.0'
      }
    }, alice.address);

    const textureAssetId = await chain.registerAsset({
      name: 'Textura de Piedra Antigua',
      description: 'Textura realista de piedra antigua para edificios',
      type: 'TEXTURE',
      ipfsHash: 'QmTexture456789123',
      isPublic: true,
      allowDownload: true,
      allowModification: true,
      allowCommercialUse: true,
      price: '200000000000000000', // 0.2 WVC
      tags: ['textura', 'piedra', 'realista'],
      metadata: {
        fileSize: 5000000,
        fileFormat: 'png',
        dimensions: { width: 2048, height: 2048 },
        category: 'texturas',
        version: '1.5.0',
        license: 'CC0'
      }
    }, bob.address);

    logger.info(`Assets registrados: ${castleAssetId}, ${dragonAssetId}, ${textureAssetId}`);

    // 6. Crear metaversos
    logger.info('🌍 Creando metaversos...');
    
    const fantasyWorldId = await chain.createMetaverse({
      name: 'Mundo de Fantasía',
      description: 'Un mundo mágico lleno de castillos, dragones y aventuras',
      maxUsers: 50,
      worldData: {
        theme: 'fantasy',
        environment: 'medieval',
        weather: 'dynamic',
        timeCycle: true
      },
      assets: [castleAssetId, dragonAssetId]
    }, bob.address);

    const sciFiWorldId = await chain.createMetaverse({
      name: 'Ciudad del Futuro',
      description: 'Una metrópolis futurista con tecnología avanzada',
      maxUsers: 100,
      worldData: {
        theme: 'sci-fi',
        environment: 'urban',
        weather: 'controlled',
        timeCycle: false
      },
      assets: [textureAssetId]
    }, charlie.address);

    logger.info(`Metaversos creados: ${fantasyWorldId}, ${sciFiWorldId}`);

    // 7. Unirse a metaversos
    logger.info('🚪 Uniéndose a metaversos...');
    
    await chain.joinMetaverse(fantasyWorldId, alice.address);
    await chain.joinMetaverse(fantasyWorldId, charlie.address);
    await chain.joinMetaverse(sciFiWorldId, alice.address);
    await chain.joinMetaverse(sciFiWorldId, bob.address);

    logger.info('Usuarios se han unido a los metaversos');

    // 8. Transferir assets
    logger.info('🔄 Transfiriendo assets...');
    
    await chain.transferAsset(alice.address, bob.address, castleAssetId, '1', 'tx_hash_1');
    await chain.transferAsset(alice.address, charlie.address, dragonAssetId, '1', 'tx_hash_2');

    logger.info('Assets transferidos exitosamente');

    // 9. Obtener estadísticas
    logger.info('📊 Obteniendo estadísticas...');
    
    const stats = await chain.getStats();
    logger.info('Estadísticas de la blockchain:', {
      bloqueActual: stats.currentBlock,
      transaccionesTotales: stats.totalTransactions,
      assetsTotales: stats.totalAssets,
      usuariosTotales: stats.totalUsers,
      metaversosTotales: stats.totalMetaverses,
      hashrate: stats.networkHashrate,
      dificultad: stats.difficulty,
      precioGas: formatBalance(stats.gasPrice, 9) + ' gwei'
    });

    // 10. Obtener información de registros
    logger.info('📋 Información de registros...');
    
    const assetStats = await chain.assetRegistry.getRegistryStats();
    const userStats = await chain.userRegistry.getRegistryStats();
    const metaverseStats = await chain.metaverseRegistry.getRegistryStats();

    logger.info('Estadísticas de Assets:', assetStats);
    logger.info('Estadísticas de Usuarios:', userStats);
    logger.info('Estadísticas de Metaversos:', metaverseStats);

    // 11. Buscar assets
    logger.info('🔍 Buscando assets...');
    
    const fantasyAssets = await chain.assetRegistry.searchAssetsByTags(['fantasía']);
    const medievalAssets = await chain.assetRegistry.searchAssetsByTags(['medieval']);
    const publicAssets = await chain.assetRegistry.getPublicAssets();

    logger.info(`Assets de fantasía encontrados: ${fantasyAssets.length}`);
    logger.info(`Assets medievales encontrados: ${medievalAssets.length}`);
    logger.info(`Assets públicos: ${publicAssets.length}`);

    // 12. Obtener metaversos populares
    logger.info('🏆 Metaversos populares...');
    
    const popularMetaverses = await chain.metaverseRegistry.getPopularMetaverses(5);
    const recentMetaverses = await chain.metaverseRegistry.getRecentMetaverses(5);

    logger.info(`Metaversos populares: ${popularMetaverses.length}`);
    logger.info(`Metaversos recientes: ${recentMetaverses.length}`);

    // 13. Simular algunas transacciones más
    logger.info('💸 Simulando transacciones adicionales...');
    
    for (let i = 0; i < 5; i++) {
      const amount = (i + 1) * 100000000000000000; // 0.1, 0.2, 0.3, 0.4, 0.5 WVC
      await chain.sendTransaction({
        from: alice.address,
        to: bob.address,
        value: amount.toString(),
        data: `Transferencia ${i + 1}`,
        gasLimit: BLOCKCHAIN_CONSTANTS.GAS_LIMIT.TRANSFER.toString(),
        gasPrice: BLOCKCHAIN_CONSTANTS.GAS_PRICE.MEDIUM
      });
    }

    // 14. Verificar balances finales
    logger.info('💰 Verificando balances finales...');
    
    const aliceFinalBalance = await chain.getBalance(alice.address);
    const bobFinalBalance = await chain.getBalance(bob.address);
    const charlieFinalBalance = await chain.getBalance(charlie.address);

    logger.info(`Alice balance final: ${formatBalance(aliceFinalBalance)} WVC`);
    logger.info(`Bob balance final: ${formatBalance(bobFinalBalance)} WVC`);
    logger.info(`Charlie balance final: ${formatBalance(charlieFinalBalance)} WVC`);

    // 15. Obtener información de peers
    logger.info('🌐 Información de red...');
    
    const peers = chain.getConnectedPeers();
    const consensusState = chain.consensus.getConsensusState();

    logger.info(`Peers conectados: ${peers.length}`);
    logger.info('Estado del consenso:', consensusState);

    logger.info('✅ Demo completado exitosamente!');
    logger.info('🎉 La blockchain WoldVirtual3D está funcionando correctamente');

    // Mantener la blockchain ejecutándose por un tiempo
    logger.info('⏰ Manteniendo la blockchain ejecutándose por 30 segundos...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Detener la blockchain
    logger.info('🛑 Deteniendo la blockchain...');
    await blockchain.stop();

    logger.info('👋 Demo finalizado');

  } catch (error: any) {
    logger.error('❌ Error en el demo:', error);
    throw error;
  }
}

/**
 * Función para ejecutar el demo
 */
if (require.main === module) {
  runBlockchainDemo()
    .then(() => {
      console.log('Demo ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error ejecutando demo:', error);
      process.exit(1);
    });
}

export default runBlockchainDemo; 