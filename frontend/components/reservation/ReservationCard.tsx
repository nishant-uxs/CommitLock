'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reservation, ReservationStatus } from '@/lib/stellar/types';
import { formatXLM, formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { Calendar, Clock, Coins, User } from 'lucide-react';
import Link from 'next/link';

interface ReservationCardProps {
  reservation: Reservation;
  userAddress?: string | null;
}

export function ReservationCard({ reservation, userAddress }: ReservationCardProps) {
  const isHost = userAddress && reservation.host === userAddress;
  const isGuest = userAddress && reservation.guest === userAddress;
  const canBook = !isHost && !isGuest && reservation.status === ReservationStatus.Open;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{reservation.title}</CardTitle>
            <CardDescription className="mt-2">{reservation.description}</CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(reservation.status)}`}>
            {getStatusText(reservation.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(Number(reservation.timestamp))}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="h-4 w-4" />
          <span className="font-semibold">{formatXLM(reservation.deposit)} XLM</span>
          <span>deposit required</span>
        </div>
        {isHost && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <User className="h-4 w-4" />
            <span>You are the host</span>
          </div>
        )}
        {isGuest && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <User className="h-4 w-4" />
            <span>You booked this reservation</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/booking/${reservation.id}`} className="w-full">
          <Button className="w-full" variant={canBook ? "default" : "outline"}>
            {canBook ? 'Book Now' : 'View Details'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
