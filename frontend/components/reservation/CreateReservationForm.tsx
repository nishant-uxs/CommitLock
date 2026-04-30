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
    <Card className="border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] bg-background/60 backdrop-blur-2xl rounded-3xl overflow-hidden glowing-border relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
      <CardHeader className="pb-8 pt-10 px-8 lg:px-10 border-b border-border/50 relative z-10 bg-muted/20">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20 flex items-center justify-center shadow-inner">
            <div className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">✨</div>
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">New Reservation</CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">Set up a deposit-protected reservation slot on Soroban</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 lg:p-10 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground tracking-wide uppercase">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Exclusive VIP Dinner"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-14 rounded-xl border-border/60 bg-muted/20 text-lg shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground tracking-wide uppercase">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details — location, dress code, what to expect..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="min-h-[140px] resize-none rounded-xl border-border/60 bg-muted/20 text-base shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10 p-6 rounded-2xl border border-border/40">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-foreground tracking-wide uppercase">Date</Label>
              <Input
                id="date"
                type="date"
                min={getTodayDate()}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="h-14 rounded-xl border-border/60 bg-background text-base shadow-sm focus-visible:ring-primary transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold text-foreground tracking-wide uppercase">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="h-14 rounded-xl border-border/60 bg-background text-base shadow-sm focus-visible:ring-primary transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit" className="text-sm font-semibold text-foreground tracking-wide uppercase">Required Deposit (XLM)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-amber-500 font-bold">XLM</span>
              </div>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                required
                className="h-16 pl-14 rounded-xl border-border/60 bg-muted/20 text-2xl font-bold tracking-tight shadow-sm focus-visible:ring-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground bg-primary/5 border border-primary/10 py-2 px-3 rounded-lg w-max">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Guests verify with this amount. It automatically refunds on attendance.</span>
            </div>
          </div>

          <div className="pt-6">
            <Button type="submit" className="w-full h-16 text-lg font-bold shadow-xl shadow-primary/20 rounded-2xl hover:scale-[1.02] hover:shadow-primary/40 transition-all duration-300 relative overflow-hidden group" disabled={loading}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Deploying to Soroban...
                  </>
                ) : (
                  'Confirm & Create Reservation'
                )}
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
