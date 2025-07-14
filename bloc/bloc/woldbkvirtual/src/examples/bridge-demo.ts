/**
 * @fileoverview Demo del puente entre BSC y WoldVirtual3D
 * @module woldbkvirtual/src/examples/bridge-demo
 */

import { WoldVirtualChain } from '../blockchain/WoldVirtualChain';
import { Logger } from '../utils/logger';

const logger = new Logger('BridgeDemo');

// Configuración de la blockchain
const chainConfig = {
  name: 'WoldVirtual3D Mainnet',
  symbol: 'WCV',
  chainId: 1337,
  blockTime: 15,
  maxBlockSize: 1000000,
  maxGasLimit: 30000000,
  consensus: 'pos' as const,
  validators: [
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    '0x8ba1f109551bD432803012645Hac136c772c3c7b',
    '0x147B8eb97fD247D06C4006D269c90C1908Fb5D54'
  ],
  genesisBlock: {
    header: {
      number: 0,
      parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: Date.now(),
      merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
      difficulty: '1000000',
      nonce: 0
    },
    transactions: [],
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000'
  },
  networkPort: 8545,
  rpcPort: 8546,
  wsPort: 8547
};

async function runBridgeDemo(): Promise<void> {
  try {
    logger.info('🌉 Iniciando demo del puente BSC ↔ WoldVirtual3D...');

    // Crear e iniciar blockchain
    const blockchain = new WoldVirtualChain(chainConfig);
    await blockchain.start();

    // Crear wallets
    const wallet1 = blockchain.createWallet();
    const wallet2 = blockchain.createWallet();
    const wallet3 = blockchain.createWallet();

    logger.info('📋 Wallets creadas:');
    logger.info(`  Wallet 1: ${wallet1.address}`);
    logger.info(`  Wallet 2: ${wallet2.address}`);
    logger.info(`  Wallet 3: ${wallet3.address}`);

    // Esperar un poco para que se procesen los bloques iniciales
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Obtener token WCV
    const wcvToken = blockchain.getWCVToken();
    const bridge = blockchain.getBridge();
    const bscIntegration = blockchain.getBSCIntegration();

    logger.info('💰 Información del token WCV:');
    logger.info(`  Nombre: ${wcvToken.getName()}`);
    logger.info(`  Símbolo: ${wcvToken.getSymbol()}`);
    logger.info(`  Decimales: ${wcvToken.getDecimals()}`);
    logger.info(`  Suministro total: ${wcvToken.formatAmount(wcvToken.getTotalSupply())} WCV`);
    logger.info(`  Dirección del contrato: ${wcvToken.getAddress()}`);

    // Obtener balances iniciales
    logger.info('💳 Balances iniciales:');
    const balance1 = await wcvToken.getBalance(wallet1.address);
    const balance2 = await wcvToken.getBalance(wallet2.address);
    const balance3 = await wcvToken.getBalance(wallet3.address);

    logger.info(`  Wallet 1: ${wcvToken.formatAmount(balance1)} WCV`);
    logger.info(`  Wallet 2: ${wcvToken.formatAmount(balance2)} WCV`);
    logger.info(`  Wallet 3: ${wcvToken.formatAmount(balance3)} WCV`);

    // Simular transferencia desde BSC
    logger.info('🔄 Simulando transferencia desde BSC...');
    
    const bscTransferId = await bridge.transferFromBSC(
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Desde BSC
      wallet1.address, // A WoldVirtual3D
      '1000000', // 1000 WCV
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' // Hash de BSC
    );

    logger.info(`  Transferencia iniciada: ${bscTransferId}`);

    // Confirmar transferencia
    await bridge.confirmTransferFromBSC(
      bscTransferId,
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    );

    logger.info('  ✅ Transferencia confirmada desde BSC');

    // Verificar nuevo balance
    const newBalance1 = await wcvToken.getBalance(wallet1.address);
    logger.info(`  Nuevo balance Wallet 1: ${wcvToken.formatAmount(newBalance1)} WCV`);

    // Transferencia interna en WoldVirtual3D
    logger.info('💸 Realizando transferencia interna...');
    
    const internalTxHash = await blockchain.transferWCV(
      wallet1.address,
      wallet2.address,
      '500000', // 500 WCV
      wallet1.privateKey
    );

    logger.info(`  Transferencia interna: ${internalTxHash}`);

    // Esperar procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificar balances después de transferencia interna
    const balance1After = await wcvToken.getBalance(wallet1.address);
    const balance2After = await wcvToken.getBalance(wallet2.address);

    logger.info('💳 Balances después de transferencia interna:');
    logger.info(`  Wallet 1: ${wcvToken.formatAmount(balance1After)} WCV`);
    logger.info(`  Wallet 2: ${wcvToken.formatAmount(balance2After)} WCV`);

    // Simular transferencia hacia BSC
    logger.info('🔄 Simulando transferencia hacia BSC...');
    
    const toBscTxHash = await blockchain.bridgeToBSC(
      wallet2.address,
      '0x8ba1f109551bD432803012645Hac136c772c3c7b', // A BSC
      '200000', // 200 WCV
      wallet2.privateKey
    );

    logger.info(`  Transferencia hacia BSC: ${toBscTxHash}`);

    // Obtener estadísticas del puente
    logger.info('📊 Estadísticas del puente:');
    const bridgeStats = await bridge.getBridgeStats();
    logger.info(`  Total de transferencias: ${bridgeStats.totalTransfers}`);
    logger.info(`  Volumen total: ${wcvToken.formatAmount(bridgeStats.totalVolume)} WCV`);
    logger.info(`  Transferencias pendientes: ${bridgeStats.pendingTransfers}`);
    logger.info(`  Transferencias completadas: ${bridgeStats.completedTransfers}`);
    logger.info(`  Transferencias fallidas: ${bridgeStats.failedTransfers}`);

    // Obtener estadísticas de integración BSC
    logger.info('🔗 Estadísticas de integración BSC:');
    const bscStats = bscIntegration.getIntegrationStats();
    logger.info(`  Conectado a BSC: ${bscStats.isConnected}`);
    logger.info(`  Último bloque procesado: ${bscStats.lastProcessedBlock}`);
    logger.info(`  Transacciones pendientes: ${bscStats.pendingTransactions}`);
    logger.info(`  Transacciones confirmadas: ${bscStats.confirmedTransactions}`);

    // Obtener holders del token
    logger.info('👥 Top holders del token WCV:');
    const holders = await wcvToken.getHolders();
    const topHolders = holders.slice(0, 5);
    
    for (let i = 0; i < topHolders.length; i++) {
      const holder = topHolders[i];
      logger.info(`  ${i + 1}. ${holder.address}: ${wcvToken.formatAmount(holder.balance)} WCV (${holder.percentage.toFixed(2)}%)`);
    }

    // Obtener estadísticas del token
    logger.info('📈 Estadísticas del token WCV:');
    const tokenStats = await wcvToken.getTokenStats();
    logger.info(`  Suministro total: ${wcvToken.formatAmount(tokenStats.totalSupply)} WCV`);
    logger.info(`  Suministro en circulación: ${wcvToken.formatAmount(tokenStats.circulatingSupply)} WCV`);
    logger.info(`  Suministro quemado: ${wcvToken.formatAmount(tokenStats.burnedSupply)} WCV`);
    logger.info(`  Total de holders: ${tokenStats.totalHolders}`);
    logger.info(`  Total de transferencias: ${tokenStats.totalTransfers}`);
    logger.info(`  Total de aprobaciones: ${tokenStats.totalApprovals}`);

    // Simular transacciones diarias
    logger.info('📅 Simulando transferencias diarias...');
    
    const dailyTransfers = [
      { from: wallet1.address, to: wallet3.address, amount: '100000' },
      { from: wallet2.address, to: wallet1.address, amount: '50000' },
      { from: wallet3.address, to: wallet2.address, amount: '75000' }
    ];

    for (const transfer of dailyTransfers) {
      const txHash = await blockchain.transferWCV(
        transfer.from,
        transfer.to,
        transfer.amount,
        wallet1.privateKey // Usar wallet1 como ejemplo
      );
      logger.info(`  Transferencia: ${wcvToken.formatAmount(transfer.amount)} WCV → ${txHash}`);
    }

    // Esperar procesamiento
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Mostrar balances finales
    logger.info('🏁 Balances finales:');
    const finalBalance1 = await wcvToken.getBalance(wallet1.address);
    const finalBalance2 = await wcvToken.getBalance(wallet2.address);
    const finalBalance3 = await wcvToken.getBalance(wallet3.address);

    logger.info(`  Wallet 1: ${wcvToken.formatAmount(finalBalance1)} WCV`);
    logger.info(`  Wallet 2: ${wcvToken.formatAmount(finalBalance2)} WCV`);
    logger.info(`  Wallet 3: ${wcvToken.formatAmount(finalBalance3)} WCV`);

    // Mostrar información del puente
    logger.info('🌉 Información del puente:');
    const bridgeConfig = bridge.getConfig();
    logger.info(`  Contrato BSC: ${bridgeConfig.bscContractAddress}`);
    logger.info(`  Contrato WoldVirtual: ${bridgeConfig.woldvirtualContractAddress}`);
    logger.info(`  Transferencia mínima: ${wcvToken.formatAmount(bridgeConfig.minTransferAmount)} WCV`);
    logger.info(`  Transferencia máxima: ${wcvToken.formatAmount(bridgeConfig.maxTransferAmount)} WCV`);
    logger.info(`  Límite diario: ${wcvToken.formatAmount(bridgeConfig.dailyLimit)} WCV`);
    logger.info(`  Fee de transferencia: ${wcvToken.formatAmount(bridgeConfig.transferFee)} WCV`);

    // Mostrar información de integración BSC
    logger.info('🔗 Información de integración BSC:');
    const bscConfig = bscIntegration.getConfig();
    logger.info(`  RPC URL: ${bscConfig.rpcUrl}`);
    logger.info(`  Chain ID: ${bscConfig.chainId}`);
    logger.info(`  Contrato WCV en BSC: ${bscConfig.contractAddress}`);
    logger.info(`  Explorer: ${bscConfig.explorerUrl}`);

    logger.info('✅ Demo del puente completado exitosamente!');

    // Detener blockchain
    await blockchain.stop();
    logger.info('🛑 Blockchain detenida');

  } catch (error: any) {
    logger.error('❌ Error en demo del puente:', error);
    throw error;
  }
}

// Ejecutar demo si se llama directamente
if (require.main === module) {
  runBridgeDemo()
    .then(() => {
      logger.info('🎉 Demo completado');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Error en demo:', error);
      process.exit(1);
    });
}

export { runBridgeDemo }; 