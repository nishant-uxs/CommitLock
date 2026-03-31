'use client';

import { Reservation } from '@/lib/stellar/types';
import { ReservationCard } from './ReservationCard';

interface ReservationListProps {
  reservations: Reservation[];
  userAddress?: string | null;
  emptyMessage?: string;
}

export function ReservationList({ reservations, userAddress, emptyMessage = "No reservations found" }: ReservationListProps) {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id.toString()}
          reservation={reservation}
          userAddress={userAddress}
        />
      ))}
    </div>
  );
}
