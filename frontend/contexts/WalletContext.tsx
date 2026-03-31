'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  requestAccess,
  getAddress,
  signTransaction as freighterSignTransaction,
  isConnected as freighterIsConnected,
  isAllowed,
} from '@stellar/freighter-api';
import { WalletState } from '@/lib/stellar/types';
import { logWalletConnect, logWalletDisconnect, logTransaction } from '@/lib/monitoring/logger';
import { trackActiveUser } from '@/lib/metrics/tracker';

interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    connected: false,
    walletType: null,
  });

  const connectWallet = useCallback(async () => {
    try {
      // Check if Freighter is installed
      const connResult = await freighterIsConnected();
      if (!connResult.isConnected) {
        throw new Error('Freighter wallet extension is not installed. Please install it from freighter.app');
      }

      // Check if site is already authorized
      const allowedResult = await isAllowed();

      let address: string;
      if (allowedResult.isAllowed) {
        // Already authorized — fetch current active Freighter account
        const addrResult = await getAddress();
        if (addrResult.error) {
          throw new Error(addrResult.error);
        }
        address = addrResult.address;
      } else {
        // Not yet authorized — triggers Freighter popup for permission
        const accessResult = await requestAccess();
        if (accessResult.error) {
          throw new Error(accessResult.error);
        }
        address = accessResult.address;
      }

      setWallet({
        address,
        connected: true,
        walletType: 'Freighter',
      });

      // Track for monitoring and metrics
      logWalletConnect(address);
      trackActiveUser(address);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw new Error(
        error?.message ||
        'Failed to connect. Make sure Freighter extension is installed.'
      );
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    logWalletDisconnect();
    setWallet({
      address: null,
      connected: false,
      walletType: null,
    });
  }, []);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (!wallet.connected || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await freighterSignTransaction(xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
        address: wallet.address,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      logTransaction('signed', undefined);
      return result.signedTxXdr;
    } catch (error: any) {
      logTransaction('sign_failed', undefined, error?.message);
      console.error('Error signing transaction:', error);
      throw new Error(error?.message || 'Failed to sign transaction');
    }
  }, [wallet.connected, wallet.address]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
