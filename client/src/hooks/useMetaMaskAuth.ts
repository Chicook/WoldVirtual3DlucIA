import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';

export interface MetaMaskState {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseMetaMaskAuth {
  state: MetaMaskState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  resetError: () => void;
}

const initialState: MetaMaskState = {
  isConnected: false,
  account: null,
  chainId: null,
  provider: null,
  signer: null,
  isLoading: false,
  error: null,
};

export function useMetaMaskAuth(): UseMetaMaskAuth {
  const [state, setState] = useState<MetaMaskState>(initialState);

  // Detectar MetaMask
  const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum;

  // Inicializar conexión si ya está conectada
  useEffect(() => {
    if (!isMetaMaskInstalled) return;
    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          setState(s => ({
            ...s,
            isConnected: true,
            account: accounts[0].address,
            chainId: Number(network.chainId),
            provider,
            signer,
            isLoading: false,
            error: null,
          }));
        }
      } catch (e) {
        setState(s => ({ ...s, error: 'Error al inicializar MetaMask', isLoading: false }));
      }
    })();
    // eslint-disable-next-line
  }, [isMetaMaskInstalled]);

  // Conectar a MetaMask
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setState(s => ({ ...s, error: 'MetaMask no está instalado' }));
      return;
    }
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        setState(s => ({
          ...s,
          isConnected: true,
          account: accounts[0],
          chainId: Number(network.chainId),
          provider,
          signer,
          isLoading: false,
          error: null,
        }));
      } else {
        setState(s => ({ ...s, isLoading: false, error: 'No se detectaron cuentas en MetaMask' }));
      }
    } catch (e: any) {
      setState(s => ({ ...s, isLoading: false, error: e?.message || 'Error al conectar MetaMask' }));
    }
  }, [isMetaMaskInstalled]);

  // Desconectar (firma de logout)
  const disconnect = useCallback(async () => {
    if (!state.signer || !state.account) {
      setState(s => ({ ...s, error: 'No hay sesión activa' }));
      return;
    }
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      // Solicitar firma de logout (no transacción real)
      await state.signer.signMessage('Cerrar sesión en Metaverso Crypto World Virtual 3D');
      setState({ ...initialState });
    } catch (e: any) {
      setState(s => ({ ...s, isLoading: false, error: e?.message || 'Error al cerrar sesión' }));
    }
  }, [state.signer, state.account]);

  // Firmar mensaje
  const signMessage = useCallback(async (message: string) => {
    if (!state.signer) {
      setState(s => ({ ...s, error: 'No hay sesión activa' }));
      return null;
    }
    try {
      return await state.signer.signMessage(message);
    } catch (e: any) {
      setState(s => ({ ...s, error: e?.message || 'Error al firmar mensaje' }));
      return null;
    }
  }, [state.signer]);

  // Resetear error
  const resetError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  // Listeners de eventos de MetaMask
  useEffect(() => {
    if (!isMetaMaskInstalled || !window.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState(s => ({ ...s, isConnected: false, account: null, signer: null }));
      } else {
        setState(s => ({ ...s, account: accounts[0] }));
      }
    };
    const handleChainChanged = (chainId: string) => {
      setState(s => ({ ...s, chainId: parseInt(chainId, 16) }));
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled]);

  return {
    state,
    connect,
    disconnect,
    signMessage,
    resetError,
  };
}
