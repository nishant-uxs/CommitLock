'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { ReservationList } from '@/components/reservation/ReservationList';
import { CommitLockContract } from '@/lib/stellar/contract';
import { Reservation } from '@/lib/stellar/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Shield, Plus, Loader2, BarChart3, Monitor } from 'lucide-react';

export default function DashboardPage() {
  const { wallet } = useWallet();
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [userBookings, setUserBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const contract = new CommitLockContract();
      const all = await contract.getAllReservations();
      setAllReservations(all);

      if (wallet.address) {
        const bookings = await contract.getUserBookings(wallet.address);
        setUserBookings(bookings);
      }
    } catch (error) {
      console.error('Error loading reservations:', error instanceof Error ? error.message : JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="container mx-auto px-4 py-6 border-b">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">CommitLock</h1>
            </Link>
            <WalletConnect />
          </nav>
        </header>
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your Stellar wallet to access the dashboard
            </p>
            <WalletConnect />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6 border-b bg-white">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CommitLock</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Reservation
              </Button>
            </Link>
            <Link href="/metrics">
              <Button variant="ghost" size="sm" className="gap-1">
                <BarChart3 className="h-4 w-4" /> Metrics
              </Button>
            </Link>
            <Link href="/monitoring">
              <Button variant="ghost" size="sm" className="gap-1">
                <Monitor className="h-4 w-4" /> Monitor
              </Button>
            </Link>
            <WalletConnect />
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your reservations and bookings
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Reservations</TabsTrigger>
              <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Available Reservations ({allReservations.length})
                </h3>
                <Button variant="outline" onClick={loadReservations}>
                  Refresh
                </Button>
              </div>
              <ReservationList
                reservations={allReservations}
                userAddress={wallet.address}
                emptyMessage="No reservations available yet. Create one to get started!"
              />
            </TabsContent>

            <TabsContent value="my-bookings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  My Bookings ({userBookings.length})
                </h3>
                <Button variant="outline" onClick={loadReservations}>
                  Refresh
                </Button>
              </div>
              <ReservationList
                reservations={userBookings}
                userAddress={wallet.address}
                emptyMessage="You haven't created or booked any reservations yet."
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
