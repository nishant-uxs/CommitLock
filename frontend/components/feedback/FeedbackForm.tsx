'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function FeedbackForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
    rating: '5',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Feedback submitted!',
          description: 'Thank you for your feedback. We appreciate it!',
        });
        setFormData({ name: '', email: '', feedback: '', rating: '5' });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
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
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <div className="h-6 w-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">⭐</div>
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Share Feedback</CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">Help us shape the future of CommitLock</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 lg:p-10 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground tracking-wide uppercase">Name</Label>
              <Input
                id="name"
                placeholder="What should we call you?"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-14 rounded-xl border-border/60 bg-muted/20 text-base shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground tracking-wide uppercase">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-14 rounded-xl border-border/60 bg-muted/20 text-base shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-3 bg-muted/10 p-6 rounded-2xl border border-border/40">
            <Label className="text-sm font-semibold text-foreground tracking-wide uppercase">Rate Your Experience</Label>
            <div className="flex gap-3 justify-between sm:justify-start">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: String(n) })}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-xl sm:text-2xl hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-sm ${
                    parseInt(formData.rating) >= n
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-500/30'
                      : 'bg-muted border border-border/60 text-muted-foreground hover:border-amber-500/50 hover:text-amber-500/70'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-semibold text-foreground tracking-wide uppercase">Your Thoughts</Label>
            <Textarea
              id="feedback"
              placeholder="What do you love? What could be better? Don't hold back..."
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              rows={5}
              required
              className="resize-none rounded-xl border-border/60 bg-muted/20 text-base shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all p-4"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-16 text-lg font-bold shadow-xl shadow-primary/20 rounded-2xl hover:scale-[1.02] hover:shadow-primary/40 transition-all duration-300 relative overflow-hidden group" disabled={loading}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Sending feedback...
                  </>
                ) : (
                  'Send Feedback'
                )}
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
