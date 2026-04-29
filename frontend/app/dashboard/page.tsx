'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { Navbar } from '@/components/layout/Navbar';
import { ReservationList } from '@/components/reservation/ReservationList';
import { CommitLockContract } from '@/lib/stellar/contract';
import { Reservation } from '@/lib/stellar/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Plus, Loader2, Wallet, RefreshCw, CalendarPlus } from 'lucide-react';

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
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-lg mx-auto px-4 py-32 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-6">
              <Wallet className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Wallet</h2>
            <p className="text-slate-500 mb-8">
              Link your Stellar wallet to view and manage reservations.
            </p>
            <WalletConnect />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your reservations and bookings
            </p>
          </div>
          <Link href="/create">
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              New Reservation
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm text-slate-400">Loading reservations...</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6 animate-fade-in-delay-1">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white border shadow-sm">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  All Reservations
                  <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">{allReservations.length}</span>
                </TabsTrigger>
                <TabsTrigger value="my-bookings" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  My Bookings
                  <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">{userBookings.length}</span>
                </TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm" onClick={loadReservations} className="gap-1.5 text-slate-500 hover:text-slate-700">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>

            <TabsContent value="all" className="mt-0">
              {allReservations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                  <CalendarPlus className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium mb-1">No reservations yet</p>
                  <p className="text-sm text-slate-400 mb-6">Create the first deposit-protected reservation.</p>
                  <Link href="/create">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      Create Reservation
                    </Button>
                  </Link>
                </div>
              ) : (
                <ReservationList
                  reservations={allReservations}
                  userAddress={wallet.address}
                />
              )}
            </TabsContent>

            <TabsContent value="my-bookings" className="mt-0">
              {userBookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                  <Wallet className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium mb-1">No bookings yet</p>
                  <p className="text-sm text-slate-400">Book a reservation to see it here.</p>
                </div>
              ) : (
                <ReservationList
                  reservations={userBookings}
                  userAddress={wallet.address}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
