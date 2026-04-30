'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { CommitLockContract } from '@/lib/stellar/contract';
import { Reservation, ReservationStatus } from '@/lib/stellar/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatXLM, formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { STELLAR_EXPLORER_URL, STELLAR_CONFIG } from '@/lib/stellar/config';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft, Loader2, Calendar, Coins, User, CheckCircle, XCircle, ExternalLink, Lock, Clock, ShieldCheck } from 'lucide-react';

function StatusPill({ status }: { status: number | bigint }) {
  const s = Number(status);
  const config: Record<number, { label: string; wrapper: string; text: string; dot: string; glow: string }> = {
    0: { label: 'Open', wrapper: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-500', dot: 'bg-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
    1: { label: 'Booked', wrapper: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-500', dot: 'bg-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
    2: { label: 'Completed', wrapper: 'bg-violet-500/10 border-violet-500/30', text: 'text-violet-500', dot: 'bg-violet-500', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]' },
    3: { label: 'No Show', wrapper: 'bg-red-500/10 border-red-500/30', text: 'text-red-500', dot: 'bg-red-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' },
  };
  const c = config[s] || { label: 'Unknown', wrapper: 'bg-muted/50 border-border/50', text: 'text-muted-foreground', dot: 'bg-muted-foreground', glow: '' };
  return (
    <span className={`inline-flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest px-5 py-2.5 rounded-2xl border backdrop-blur-md transition-all ${c.wrapper} ${c.text}`}>
      <span className={`relative flex h-2.5 w-2.5`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.dot}`}></span>
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${c.dot} ${c.glow}`}></span>
      </span>
      {c.label}
    </span>
  );
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { wallet, signTransaction } = useWallet();
  const { toast } = useToast();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const reservationId = parseInt(params.id as string);

  const loadReservation = useCallback(async () => {
    setLoading(true);
    try {
      const contract = new CommitLockContract();
      const res = await contract.getReservation(reservationId);
      setReservation(res);
    } catch (error) {
      console.error('Error loading reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reservation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [reservationId, toast]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  const handleBook = async () => {
    if (!wallet.connected || !wallet.address || !reservation) return;

    setActionLoading(true);
    try {
      const contract = new CommitLockContract();
      const xdr = await contract.bookReservation(wallet.address, reservationId);
      const signedXDR = await signTransaction(xdr);
      const hash = await contract.submitTransaction(xdr, signedXDR);

      setTxHash(hash);
      toast({
        title: 'Booking successful!',
        description: `Transaction hash: ${hash.slice(0, 8)}...`,
      });

      await loadReservation();
    } catch (error: any) {
      const errMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      console.error('Error booking reservation:', errMsg);
      toast({
        title: 'Error',
        description: errMsg || 'Failed to book reservation',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAttendance = async (attended: boolean) => {
    if (!wallet.connected || !wallet.address || !reservation) return;

    setActionLoading(true);
    try {
      const contract = new CommitLockContract();
      const xdr = await contract.confirmAttendance(wallet.address, reservationId, attended);
      const signedXDR = await signTransaction(xdr);
      const hash = await contract.submitTransaction(xdr, signedXDR);

      setTxHash(hash);
      toast({
        title: 'Attendance confirmed!',
        description: attended ? 'Deposit refunded to guest' : 'Deposit transferred to host',
      });

      await loadReservation();
    } catch (error: any) {
      const errMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      console.error('Error confirming attendance:', errMsg);
      toast({
        title: 'Error',
        description: errMsg || 'Failed to confirm attendance',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 animate-fade-in relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10 mb-6 mx-auto" />
          </div>
          <p className="text-lg font-medium text-foreground tracking-wide">Syncing Reservation...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-32 text-center relative z-10">
          <div className="glass-panel p-12 rounded-3xl border border-border/40 shadow-2xl animate-fade-in">
            <div className="mx-auto w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-8 shadow-inner relative group">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
              <XCircle className="h-12 w-12 text-red-500 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-4">Reservation Not Found</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-sm mx-auto">This reservation either doesn&apos;t exist or has been removed from the network.</p>
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                <ArrowLeft className="h-5 w-5 mr-3" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isHost = wallet.address === reservation.host;
  const isGuest = wallet.address === reservation.guest;
  const canBook = wallet.connected && !isHost && !isGuest && reservation.status === ReservationStatus.Open;
  const canConfirm = isHost && reservation.status === ReservationStatus.Booked;
  const isPastTime = Number(reservation.timestamp) * 1000 < Date.now();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Background Decorators */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.20]" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
      </div>

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="animate-fade-in-scale">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-foreground gap-2 -ml-2 rounded-xl transition-all hover:bg-muted/50 h-12 px-4 shadow-sm backdrop-blur-sm border border-transparent hover:border-border/50">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="glass-panel border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] bg-background/60 backdrop-blur-2xl rounded-3xl overflow-hidden glowing-border relative">
            <CardHeader className="pb-8 pt-10 px-8 lg:px-12 border-b border-border/50 bg-muted/20 relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <CardTitle className="text-4xl font-extrabold tracking-tight drop-shadow-sm">{reservation.title}</CardTitle>
                    <span className="text-sm text-primary font-bold font-mono bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl shadow-inner">
                      #{Number(reservation.id)}
                    </span>
                  </div>
                  <CardDescription className="text-lg text-muted-foreground font-medium mt-4 max-w-2xl leading-relaxed">
                    {reservation.description}
                  </CardDescription>
                </div>
                <StatusPill status={reservation.status} />
              </div>
            </CardHeader>
            <CardContent className="p-8 lg:p-12 space-y-10 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-5 bg-muted/30 border border-border/40 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className="p-3 bg-background shadow-md border border-border/50 rounded-xl shrink-0">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Reservation Time</p>
                      <p className="text-lg font-bold text-foreground">{formatDate(Number(reservation.timestamp))}</p>
                      {isPastTime && (
                        <div className="mt-2 inline-flex items-center text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                          <XCircle className="w-3 h-3 mr-1.5 inline" />
                          Time has passed
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-muted/30 border border-border/40 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className="p-3 bg-background shadow-md border border-border/50 rounded-xl shrink-0">
                      <Coins className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Deposit Amount</p>
                      <p className="font-extrabold text-2xl text-foreground tracking-tight">{formatXLM(reservation.deposit)} <span className="text-amber-500 text-lg">XLM</span></p>
                      <p className="text-sm font-medium text-muted-foreground mt-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border/30">
                        {reservation.status === ReservationStatus.Open && 'Required deposit to book this reservation'}
                        {reservation.status === ReservationStatus.Booked && 'Currently held in smart contract escrow'}
                        {reservation.status === ReservationStatus.Completed && 'Successfully refunded to guest'}
                        {reservation.status === ReservationStatus.NoShow && 'Claimed by host due to no-show'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-5 bg-muted/30 border border-border/40 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className="p-3 bg-background shadow-md border border-border/50 rounded-xl shrink-0">
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Host address</p>
                      <a
                        href={`${STELLAR_EXPLORER_URL}/account/${reservation.host}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2.5 py-1 rounded border border-primary/20 flex items-center justify-between w-full group"
                      >
                        <span>{reservation.host.slice(0, 8)}...{reservation.host.slice(-8)}</span>
                        <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </a>
                      {isHost && (
                        <div className="mt-3 inline-flex items-center text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                          <CheckCircle className="w-3 h-3 mr-1.5" />
                          You are the host
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-muted/30 border border-border/40 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className="p-3 bg-background shadow-md border border-border/50 rounded-xl shrink-0">
                      <User className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Guest address</p>
                      {reservation.guest ? (
                        <>
                          <a
                            href={`${STELLAR_EXPLORER_URL}/account/${reservation.guest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center justify-between w-full group"
                          >
                            <span>{reservation.guest.slice(0, 8)}...{reservation.guest.slice(-8)}</span>
                            <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </a>
                          {isGuest && (
                            <div className="mt-3 inline-flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                              <CheckCircle className="w-3 h-3 mr-1.5" />
                              You are the guest
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-between bg-background/50 border border-border/30 px-4 py-3 rounded-xl border-dashed">
                          <p className="text-sm font-medium text-muted-foreground italic">No guest yet</p>
                          <span className="text-xs font-bold text-primary capitalize tracking-wider animate-pulse">Open</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-background/40 border border-border/40 rounded-2xl shadow-inner backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-border/30">
                  <div className="pt-4 md:pt-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Reservation ID</p>
                    <p className="font-mono text-xl font-bold bg-muted/50 inline-block px-4 py-1 rounded-xl border border-border/50">#{Number(reservation.id)}</p>
                  </div>
                  <div className="pt-4 md:pt-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Status</p>
                    <p className="font-bold text-lg text-foreground">{getStatusText(reservation.status)}</p>
                  </div>
                  <div className="pt-4 md:pt-0 flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Smart Contract</p>
                    <a
                      href={`${STELLAR_EXPLORER_URL}/contract/${STELLAR_CONFIG.contractId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2 bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20 hover:scale-105"
                    >
                      View on Explorer
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {txHash && (
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-between animate-fade-in group">
                  <div>
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-1">Transaction Successful!</p>
                    <p className="text-sm text-foreground/80 font-medium">Your action has been confirmed on the network</p>
                  </div>
                  <a
                    href={`${STELLAR_EXPLORER_URL}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-xl transition-all group-hover:bg-emerald-500/30"
                  >
                    View TX
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <div className="pt-6 border-t border-border/30 space-y-4">
                {!wallet.connected && (
                  <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl text-center shadow-inner">
                    <p className="text-base font-bold text-primary flex items-center justify-center gap-3">
                      <Lock className="h-5 w-5" />
                      Connect your wallet to interact with this reservation
                    </p>
                  </div>
                )}

                {canBook && (
                  <Button
                    onClick={handleBook}
                    disabled={actionLoading}
                    className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group"
                    size="lg"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Processing on Stellar...
                      </>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Lock className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Secure Booking & Lock {formatXLM(reservation.deposit)} XLM
                      </span>
                    )}
                  </Button>
                )}

                {canConfirm && isPastTime && (
                  <div className="p-6 bg-muted/20 border border-border/40 rounded-3xl space-y-5 shadow-inner">
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-foreground tracking-tight">Time to finalize the reservation</p>
                      <p className="text-sm font-medium text-muted-foreground mt-1">Please confirm if the guest attended the event to resolve the escrow.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleConfirmAttendance(true)}
                        disabled={actionLoading}
                        className="h-14 text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 rounded-xl transition-all hover:-translate-y-1"
                        size="lg"
                      >
                        {actionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                        Guest Attended
                      </Button>
                      <Button
                        onClick={() => handleConfirmAttendance(false)}
                        disabled={actionLoading}
                        variant="destructive"
                        className="h-14 text-base font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 rounded-xl transition-all hover:-translate-y-1"
                        size="lg"
                      >
                        {actionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <XCircle className="mr-2 h-5 w-5" />}
                        Report No-Show
                      </Button>
                    </div>
                  </div>
                )}

                {canConfirm && !isPastTime && (
                  <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center gap-2">
                    <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
                    <p className="text-base font-bold text-amber-500">
                      Awaiting Event Completion
                    </p>
                    <p className="text-sm text-amber-500/80 font-medium">You will be able to confirm attendance once the reservation time has passed.</p>
                  </div>
                )}

                {isGuest && reservation.status === ReservationStatus.Booked && (
                  <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-blue-500" />
                    <p className="text-base font-bold text-blue-500">
                      Booking Confirmed & Escrow Locked
                    </p>
                    <p className="text-sm text-blue-500/80 font-medium">The host will finalize attendance after the event completes.</p>
                  </div>
                )}

                {reservation.status === ReservationStatus.Completed && (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center gap-2">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                    <p className="text-base font-bold text-emerald-500">
                      Reservation Successfully Completed
                    </p>
                    <p className="text-sm font-medium text-emerald-500/80">The deposit of {formatXLM(reservation.deposit)} XLM has been fully refunded to the guest.</p>
                  </div>
                )}

                {reservation.status === ReservationStatus.NoShow && (
                  <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center gap-2">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <p className="text-base font-bold text-red-500">
                      Marked as No-Show
                    </p>
                    <p className="text-sm font-medium text-red-500/80">The deposit of {formatXLM(reservation.deposit)} XLM was successfully transferred to the host.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
