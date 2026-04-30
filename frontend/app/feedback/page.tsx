'use client';

import { Navbar } from '@/components/layout/Navbar';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorators */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.25]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
      </div>

      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-foreground gap-2 -ml-2 rounded-xl transition-all hover:bg-muted/50">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>
        </Link>

        <div className="animate-fade-in-scale">
          <FeedbackForm />
        </div>
      </main>
    </div>
  );
}
