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
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Decorators */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.25]" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-blob mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
        </div>
        
        <Navbar />
        
        <main className="max-w-lg mx-auto px-4 py-32 relative z-10 text-center">
          <div className="animate-fade-in-scale glass-panel p-12 rounded-3xl border border-border/40 shadow-2xl">
            <div className="inline-flex relative items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-8 shadow-inner">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Wallet className="h-10 w-10 text-primary relative z-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-4">Connect Your Wallet</h2>
            <p className="text-lg text-muted-foreground mb-10">
              Link your Stellar wallet to view, manage, and create secure reservations.
            </p>
            <div className="scale-110 flex justify-center">
              <WalletConnect />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      {/* Background Decorators */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full animate-blob animation-delay-400 mix-blend-screen" />
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12 animate-fade-in">
          <div>
            <h2 className="text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm">Dashboard</h2>
            <p className="text-base text-muted-foreground mt-2">
              Manage your reservations and bookings on the Soroban network
            </p>
          </div>
          <Link href="/create">
            <Button size="lg" className="gap-2 text-md shadow-xl shadow-primary/20 hover:shadow-primary/40 rounded-2xl hover:scale-105 transition-all duration-300">
              <Plus className="h-5 w-5" />
              New Reservation
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in glass-panel rounded-3xl border border-border/40">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10 mb-6 mx-auto" />
            </div>
            <p className="text-lg font-medium text-foreground tracking-wide">Syncing with Soroban...</p>
            <p className="text-sm text-muted-foreground mt-1">Fetching your reservations securely</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-8 animate-fade-in-delay-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList className="bg-muted/50 border border-border/50 p-1.5 rounded-2xl h-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl px-6 py-3 text-sm font-semibold transition-all">
                  All Reservations
                  <span className="ml-2 text-xs bg-primary/10 text-primary font-bold rounded-lg px-2 py-0.5">{allReservations.length}</span>
                </TabsTrigger>
                <TabsTrigger value="my-bookings" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl px-6 py-3 text-sm font-semibold transition-all">
                  My Bookings
                  <span className="ml-2 text-xs bg-purple-500/10 text-purple-500 font-bold rounded-lg px-2 py-0.5">{userBookings.length}</span>
                </TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm" onClick={loadReservations} className="gap-2 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/60 transition-all">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>

            <TabsContent value="all" className="mt-0 outline-none">
              {allReservations.length === 0 ? (
                <div className="text-center py-24 glass-panel rounded-3xl border border-dashed border-border/60 shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-muted to-muted/50 border border-border/50 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10 transition-transform group-hover:scale-110 duration-500">
                    <CalendarPlus className="h-10 w-10 text-muted-foreground/80" />
                  </div>
                  <p className="text-foreground text-2xl font-bold mb-3 tracking-tight relative z-10">No reservations found</p>
                  <p className="text-base text-muted-foreground mb-10 max-w-md mx-auto relative z-10">Be the first to create a deposit-protected reservation and start valuing your time.</p>
                  <Link href="/create" className="relative z-10">
                    <Button size="lg" className="gap-2 h-14 rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/40 transition-all font-semibold text-lg px-8">
                      <Plus className="h-5 w-5" />
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

            <TabsContent value="my-bookings" className="mt-0 outline-none">
              {userBookings.length === 0 ? (
                <div className="text-center py-24 glass-panel rounded-3xl border border-dashed border-border/60 shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-muted to-muted/50 border border-border/50 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10 transition-transform group-hover:scale-110 duration-500">
                    <Wallet className="h-10 w-10 text-muted-foreground/80" />
                  </div>
                  <p className="text-foreground text-2xl font-bold mb-3 tracking-tight relative z-10">No bookings yet</p>
                  <p className="text-base text-muted-foreground max-w-md mx-auto relative z-10">Book a reservation to see your securely tracked commitments here.</p>
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
