'use client';

import { WalletConnect } from '@/components/wallet/WalletConnect';
import { CreateReservationForm } from '@/components/reservation/CreateReservationForm';
import { useWallet } from '@/contexts/WalletContext';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreatePage() {
  const { wallet } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6 border-b bg-white">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CommitLock</h1>
          </Link>
          <WalletConnect />
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {!wallet.connected ? (
            <div className="text-center space-y-4 py-12">
              <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
              <p className="text-muted-foreground">
                Please connect your wallet to create a reservation
              </p>
              <WalletConnect />
            </div>
          ) : (
            <CreateReservationForm />
          )}
        </div>
      </main>
    </div>
  );
}
