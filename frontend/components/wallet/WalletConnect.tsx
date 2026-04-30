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
      <div className="flex items-center gap-2 group">
        <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border/60 hover:border-primary/50 shadow-sm hover:shadow-primary/20 rounded-xl transition-all duration-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-bold text-foreground tracking-tight">{formatAddress(wallet.address)}</span>
          <div className="w-px h-3 bg-border mx-1" />
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">{wallet.walletType}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={disconnectWallet} className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} size="default" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all rounded-xl font-semibold px-6">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
