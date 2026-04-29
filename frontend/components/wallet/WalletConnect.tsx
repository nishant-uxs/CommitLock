'use client';

import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (wallet.connected && wallet.address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-700">{formatAddress(wallet.address)}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{wallet.walletType}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-slate-400 hover:text-slate-600 h-8 px-2">
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} size="sm" className="gap-1.5 shadow-sm">
      <Wallet className="h-3.5 w-3.5" />
      Connect Wallet
    </Button>
  );
}
