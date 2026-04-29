'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/contexts/WalletContext';
import { CommitLockContract } from '@/lib/stellar/contract';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateReservationForm() {
  const { wallet, signTransaction } = useWallet();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    deposit: '',
  });

  // Get today's date in YYYY-MM-DD format for min date validation
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected || !wallet.address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const timestamp = Math.floor(dateTime.getTime() / 1000);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const depositXLM = parseFloat(formData.deposit);

      // Validate date is in the future
      if (isNaN(timestamp)) {
        throw new Error('Invalid date or time selected');
      }

      if (timestamp <= currentTimestamp) {
        throw new Error('Reservation date and time must be in the future. Please select a date after today.');
      }

      if (isNaN(depositXLM) || depositXLM <= 0) {
        throw new Error('Please enter a valid deposit amount');
      }

      const contract = new CommitLockContract();
      const xdr = await contract.createReservation(
        wallet.address,
        formData.title,
        formData.description,
        timestamp,
        depositXLM
      );

      const signedXDR = await signTransaction(xdr);
      const hash = await contract.submitTransaction(xdr, signedXDR);

      toast({
        title: 'Reservation created!',
        description: `Transaction hash: ${hash.slice(0, 8)}...`,
      });

      router.push('/dashboard');
    } catch (error: any) {
      const errMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      console.error('Error creating reservation:', errMsg);
      toast({
        title: 'Error',
        description: errMsg || 'Failed to create reservation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">New Reservation</CardTitle>
        <CardDescription>Set up a deposit-protected reservation slot</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Dinner at The Grand"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details — location, dress code, what to expect..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-sm font-medium text-slate-700">Date</Label>
              <Input
                id="date"
                type="date"
                min={getTodayDate()}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time" className="text-sm font-medium text-slate-700">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deposit" className="text-sm font-medium text-slate-700">Deposit Amount (XLM)</Label>
            <Input
              id="deposit"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g., 10"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              required
              className="h-11"
            />
            <p className="text-xs text-slate-400">Guests will lock this amount. It&apos;s refunded if they attend.</p>
          </div>

          <Button type="submit" className="w-full h-11 font-semibold shadow-sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Reservation...
              </>
            ) : (
              'Create Reservation'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
