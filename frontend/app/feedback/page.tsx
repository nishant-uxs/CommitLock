'use client';

import { Navbar } from '@/components/layout/Navbar';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-slate-500 hover:text-slate-700 gap-1.5 -ml-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Button>
        </Link>

        <div className="animate-fade-in">
          <FeedbackForm />
        </div>
      </main>
    </div>
  );
}
