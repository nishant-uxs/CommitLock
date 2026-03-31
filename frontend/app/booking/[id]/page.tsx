'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { CommitLockContract } from '@/lib/stellar/contract';
import { Reservation, ReservationStatus } from '@/lib/stellar/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatXLM, formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { STELLAR_EXPLORER_URL, STELLAR_CONFIG } from '@/lib/stellar/config';
import Link from 'next/link';
import { Shield, ArrowLeft, Loader2, Calendar, Coins, User, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reservation) {
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
        <main className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Reservation Not Found</h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
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
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-3xl">{reservation.title}</CardTitle>
                    <span className="text-sm text-muted-foreground font-mono bg-gray-100 px-2 py-0.5 rounded">
                      #{Number(reservation.id)}
                    </span>
                  </div>
                  <CardDescription className="mt-2 text-base">
                    {reservation.description}
                  </CardDescription>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Reservation Time</p>
                      <p className="font-semibold">{formatDate(Number(reservation.timestamp))}</p>
                      {isPastTime && (
                        <p className="text-xs text-red-500 mt-0.5">This reservation time has passed</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deposit Amount</p>
                      <p className="font-semibold text-lg">{formatXLM(reservation.deposit)} XLM</p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.status === ReservationStatus.Open && 'Required deposit to book this reservation'}
                        {reservation.status === ReservationStatus.Booked && 'Held in smart contract escrow'}
                        {reservation.status === ReservationStatus.Completed && 'Refunded to guest'}
                        {reservation.status === ReservationStatus.NoShow && 'Claimed by host'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Host</p>
                      <a
                        href={`${STELLAR_EXPLORER_URL}/account/${reservation.host}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {reservation.host.slice(0, 8)}...{reservation.host.slice(-8)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {isHost && <p className="text-xs text-blue-600 font-semibold mt-0.5">You are the host</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Guest</p>
                      {reservation.guest ? (
                        <>
                          <a
                            href={`${STELLAR_EXPLORER_URL}/account/${reservation.guest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {reservation.guest.slice(0, 8)}...{reservation.guest.slice(-8)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {isGuest && <p className="text-xs text-green-600 font-semibold mt-0.5">You are the guest</p>}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No guest yet — open for booking</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Reservation ID</p>
                    <p className="font-semibold">#{Number(reservation.id)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold">{getStatusText(reservation.status)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contract</p>
                    <a
                      href={`${STELLAR_EXPLORER_URL}/contract/${STELLAR_CONFIG.contractId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1"
                    >
                      View Contract
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {txHash && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-800 mb-2">Transaction Successful!</p>
                  <a
                    href={`${STELLAR_EXPLORER_URL}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View on Stellar Expert
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div className="pt-4 space-y-3">
                {!wallet.connected && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-800">Connect your wallet to book this reservation or take actions</p>
                  </div>
                )}

                {canBook && (
                  <Button
                    onClick={handleBook}
                    disabled={actionLoading}
                    className="w-full"
                    size="lg"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Book & Lock {formatXLM(reservation.deposit)} XLM Deposit</>
                    )}
                  </Button>
                )}

                {canConfirm && isPastTime && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Confirm whether the guest attended the reservation
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleConfirmAttendance(true)}
                        disabled={actionLoading}
                        variant="default"
                        size="lg"
                      >
                        {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Guest Attended
                      </Button>
                      <Button
                        onClick={() => handleConfirmAttendance(false)}
                        disabled={actionLoading}
                        variant="destructive"
                        size="lg"
                      >
                        {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                        No Show
                      </Button>
                    </div>
                  </div>
                )}

                {canConfirm && !isPastTime && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-sm text-yellow-800">
                      You can confirm attendance after the reservation time has passed
                    </p>
                  </div>
                )}

                {isGuest && reservation.status === ReservationStatus.Booked && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-800">
                      You have booked this reservation. The host will confirm attendance after the event.
                    </p>
                  </div>
                )}

                {reservation.status === ReservationStatus.Completed && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                    <p className="text-sm text-purple-800">
                      This reservation is completed. Deposit was refunded to the guest.
                    </p>
                  </div>
                )}

                {reservation.status === ReservationStatus.NoShow && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm text-red-800">
                      Guest did not attend. Deposit was claimed by the host.
                    </p>
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
