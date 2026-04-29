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
  const config: Record<number, { label: string; bg: string; text: string; dot: string }> = {
    0: { label: 'Open', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    1: { label: 'Booked', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    2: { label: 'Completed', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
    3: { label: 'No Show', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const c = config[s] || { label: 'Unknown', bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function ReservationCard({ reservation, userAddress }: ReservationCardProps) {
  const isHost = userAddress && reservation.host === userAddress;
  const isGuest = userAddress && reservation.guest === userAddress;
  const canBook = !isHost && !isGuest && reservation.status === ReservationStatus.Open;

  return (
    <Link href={`/booking/${reservation.id}`} className="block group">
      <div className="relative bg-white rounded-2xl border border-slate-150 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-slate-100/80 hover:border-slate-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
            {reservation.title}
          </h3>
          <StatusBadge status={reservation.status} />
        </div>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
          {reservation.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(Number(reservation.timestamp))}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            {formatXLM(reservation.deposit)} XLM
          </span>
        </div>

        {(isHost || isGuest) && (
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${isHost ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <User className="h-3 w-3" />
              {isHost ? 'You are hosting' : 'You booked this'}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100">
          <Button
            variant={canBook ? "default" : "ghost"}
            size="sm"
            className={`w-full gap-1.5 ${canBook ? 'shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
            tabIndex={-1}
          >
            {canBook ? 'Book Now' : 'View Details'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
