'use client';

import { WalletConnect } from '@/components/wallet/WalletConnect';
import { Navbar } from '@/components/layout/Navbar';
import { CreateReservationForm } from '@/components/reservation/CreateReservationForm';
import { useWallet } from '@/contexts/WalletContext';
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreatePage() {
  const { wallet } = useWallet();

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      {/* Background Decorators */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.25]" />
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-blob animation-delay-400 mix-blend-screen" />
      </div>

      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-foreground gap-2 -ml-2 rounded-xl transition-all hover:bg-muted/50">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Button>
        </Link>

        {!wallet.connected ? (
          <div className="text-center py-24 px-6 animate-fade-in glass-panel rounded-3xl border border-border/40 shadow-2xl">
            <div className="inline-flex relative items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-8 shadow-inner">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Wallet className="h-8 w-8 text-primary relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Connect Your Wallet</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              Link your wallet to create a deposit-protected reservation and start taking back your time.
            </p>
            <div className="scale-110">
              <WalletConnect />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-scale">
            <CreateReservationForm />
          </div>
        )}
      </main>
    </div>
  );
}
