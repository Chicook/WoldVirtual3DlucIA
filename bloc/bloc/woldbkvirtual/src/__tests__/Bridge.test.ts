/**
 * Tests para el puente BSC ↔ WoldVirtual3D
 */

import { Bridge } from '../blockchain/contracts/Bridge';
import { WCVToken } from '../blockchain/contracts/WCVToken';
import { StateManager } from '../blockchain/state/StateManager';

describe('Bridge', () => {
  let bridge: Bridge;
  let wcvToken: WCVToken;
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
    wcvToken = new WCVToken(stateManager);
    bridge = new Bridge(stateManager, wcvToken);
  });

  describe('Inicialización', () => {
    test('debe inicializar correctamente', async () => {
      await bridge.initialize();
      
      const config = bridge.getConfig();
      expect(config.bscContractAddress).toBe('0x053532E91FFD6b8a21C925Da101C909A01106BBE');
      expect(config.minTransferAmount).toBe('1000');
      expect(config.maxTransferAmount).toBe('1000000000');
    });
  });

  describe('Transferencias desde BSC', () => {
    beforeEach(async () => {
      await wcvToken.initialize();
      await bridge.initialize();
    });

    test('debe transferir desde BSC correctamente', async () => {
      const from = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '1000000'; // 1000 WCV
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      const transferId = await bridge.transferFromBSC(from, to, amount, txHash);
      
      expect(transferId).toBeDefined();
      expect(transferId.length).toBe(16);
    });

    test('debe fallar si cantidad es menor al mínimo', async () => {
      const from = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '500'; // Menos del mínimo (1000)
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      await expect(
        bridge.transferFromBSC(from, to, amount, txHash)
      ).rejects.toThrow('Transferencia inválida');
    });

    test('debe fallar si cantidad es mayor al máximo', async () => {
      const from = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '2000000000'; // Más del máximo (1B)
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      await expect(
        bridge.transferFromBSC(from, to, amount, txHash)
      ).rejects.toThrow('Transferencia inválida');
    });
  });

  describe('Transferencias hacia BSC', () => {
    beforeEach(async () => {
      await wcvToken.initialize();
      await bridge.initialize();
    });

    test('debe transferir hacia BSC correctamente', async () => {
      const from = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '1000000'; // 1000 WCV
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      const transferId = await bridge.transferToBSC(from, to, amount, txHash);
      
      expect(transferId).toBeDefined();
      expect(transferId.length).toBe(16);
    });

    test('debe fallar si saldo insuficiente', async () => {
      const from = '0x147B8eb97fD247D06C4006D269c90C1908Fb5D54';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '10000000000'; // 10M WCV (más del balance)
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      await expect(
        bridge.transferToBSC(from, to, amount, txHash)
      ).rejects.toThrow('Saldo insuficiente en WoldVirtual3D');
    });
  });

  describe('Confirmación de transferencias', () => {
    beforeEach(async () => {
      await wcvToken.initialize();
      await bridge.initialize();
    });

    test('debe confirmar transferencia desde BSC correctamente', async () => {
      const from = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '1000000'; // 1000 WCV
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      const transferId = await bridge.transferFromBSC(from, to, amount, txHash);
      const confirmationHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      
      const result = await bridge.confirmTransferFromBSC(transferId, confirmationHash);
      
      expect(result).toBe(true);
      
      // Verificar que los tokens fueron acuñados
      const balance = await wcvToken.getBalance(to);
      expect(balance).toBe('3001000000'); // 3B + 1M - fee
    });

    test('debe fallar si transferencia no existe', async () => {
      const fakeTransferId = 'fake123456789';
      const confirmationHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      
      const result = await bridge.confirmTransferFromBSC(fakeTransferId, confirmationHash);
      
      expect(result).toBe(false);
    });
  });

  describe('Obtención de transferencias', () => {
    beforeEach(async () => {
      await wcvToken.initialize();
      await bridge.initialize();
    });

    test('debe obtener transferencia por ID', async () => {
      const from = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '1000000';
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      const transferId = await bridge.transferFromBSC(from, to, amount, txHash);
      const transfer = await bridge.getTransfer(transferId);
      
      expect(transfer).toBeDefined();
      expect(transfer?.from_address).toBe(from);
      expect(transfer?.to_address).toBe(to);
      expect(transfer?.amount).toBe(amount);
      expect(transfer?.source_chain).toBe('BSC');
      expect(transfer?.target_chain).toBe('WOLDVIRTUAL');
    });

    test('debe obtener transferencias por dirección', async () => {
      const from = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '1000000';
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      await bridge.transferFromBSC(from, to, amount, txHash);
      const transfers = await bridge.getTransfersByAddress(from);
      
      expect(transfers.length).toBeGreaterThan(0);
      expect(transfers[0].from_address).toBe(from);
    });
  });

  describe('Estadísticas del puente', () => {
    beforeEach(async () => {
      await wcvToken.initialize();
      await bridge.initialize();
    });

    test('debe obtener estadísticas correctas', async () => {
      const stats = await bridge.getBridgeStats();
      
      expect(stats.totalTransfers).toBe(0);
      expect(stats.totalVolume).toBe('0');
      expect(stats.pendingTransfers).toBe(0);
      expect(stats.completedTransfers).toBe(0);
      expect(stats.failedTransfers).toBe(0);
    });

    test('debe actualizar estadísticas después de transferencias', async () => {
      const from = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const to = '0x8ba1f109551bD432803012645Hac136c772c3c7b';
      const amount = '1000000';
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      await bridge.transferFromBSC(from, to, amount, txHash);
      
      const stats = await bridge.getBridgeStats();
      expect(stats.totalTransfers).toBe(1);
      expect(stats.pendingTransfers).toBe(1);
    });
  });
}); 