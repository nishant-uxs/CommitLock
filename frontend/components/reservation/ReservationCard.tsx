'use client';

import { Button } from '@/components/ui/button';
import { Reservation, ReservationStatus } from '@/lib/stellar/types';
import { formatXLM, formatDate } from '@/lib/utils';
import { Calendar, Coins, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ReservationCardProps {
  reservation: Reservation;
  userAddress?: string | null;
}

function StatusBadge({ status }: { status: number | bigint }) {
  const s = Number(status);
  const config: Record<number, { label: string; wrapper: string; text: string; dot: string; glow: string }> = {
    0: { label: 'Open', wrapper: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-500', dot: 'bg-emerald-500', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
    1: { label: 'Booked', wrapper: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-500', dot: 'bg-blue-500', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]' },
    2: { label: 'Completed', wrapper: 'bg-violet-500/10 border-violet-500/20', text: 'text-violet-500', dot: 'bg-violet-500', glow: 'shadow-[0_0_12px_rgba(139,92,246,0.4)]' },
    3: { label: 'No Show', wrapper: 'bg-red-500/10 border-red-500/20', text: 'text-red-500', dot: 'bg-red-500', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]' },
  };
  const c = config[s] || { label: 'Unknown', wrapper: 'bg-muted/50 border-border/50', text: 'text-muted-foreground', dot: 'bg-muted-foreground', glow: '' };
  return (
    <span className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md transition-all ${c.wrapper} ${c.text}`}>
      <span className={`relative flex h-2 w-2`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.dot}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot} ${c.glow}`}></span>
      </span>
      {c.label}
    </span>
  );
}

export function ReservationCard({ reservation, userAddress }: ReservationCardProps) {
  const isHost = userAddress && reservation.host === userAddress;
  const isGuest = userAddress && reservation.guest === userAddress;
  const canBook = !isHost && !isGuest && reservation.status === ReservationStatus.Open;

  return (
    <Link href={`/booking/${reservation.id}`} className="block group w-full">
      <div className="relative glass-panel rounded-3xl border border-border/40 p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-2 overflow-hidden bg-gradient-to-b from-card/50 to-card/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
          <h3 className="text-xl font-extrabold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300 drop-shadow-sm">
            {reservation.title}
          </h3>
          <StatusBadge status={reservation.status} />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-8 relative z-10 font-medium">
          {reservation.description}
        </p>

        <div className="flex items-center justify-between gap-4 text-sm font-bold text-muted-foreground mb-8 bg-muted/40 p-4 rounded-2xl border border-border/30 relative z-10 group-hover:bg-muted/60 transition-colors">
          <span className="inline-flex items-center gap-2.5 text-foreground/80">
            <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            {formatDate(Number(reservation.timestamp))}
          </span>
          <span className="inline-flex items-center gap-2.5 text-foreground">
            <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
              <Coins className="h-4 w-4 text-amber-500" />
            </div>
            <span className="tracking-tight">{formatXLM(reservation.deposit)} <span className="text-amber-500">XLM</span></span>
          </span>
        </div>

        {(isHost || isGuest) && (
          <div className="mb-6 relative z-10">
            <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl backdrop-blur-md border ${isHost ? 'bg-primary/10 text-primary border-primary/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
              <User className="h-4 w-4" />
              {isHost ? 'You are hosting' : 'You booked this'}
            </span>
          </div>
        )}

        <div className="pt-5 border-t border-border/30 relative z-10">
          <Button
            variant={canBook ? "default" : "outline"}
            className={`w-full gap-2 font-bold h-14 rounded-2xl transition-all duration-300 text-base ${
              canBook 
                ? 'shadow-xl shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-[1.02] bg-primary text-primary-foreground' 
                : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30 group-hover:scale-[1.02] border-border/60 bg-muted/20 text-foreground'
            }`}
            tabIndex={-1}
          >
            {canBook ? 'Secure Booking' : 'View Details'}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
