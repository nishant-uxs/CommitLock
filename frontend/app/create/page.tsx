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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 text-slate-500 hover:text-slate-700 gap-1.5 -ml-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Button>
        </Link>

        {!wallet.connected ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-6">
              <Wallet className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Wallet</h2>
            <p className="text-slate-500 mb-8">
              Link your wallet to create a deposit-protected reservation.
            </p>
            <WalletConnect />
          </div>
        ) : (
          <div className="animate-fade-in">
            <CreateReservationForm />
          </div>
        )}
      </main>
    </div>
  );
}
