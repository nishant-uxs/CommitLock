export enum ReservationStatus {
  Open = 0,
  Booked = 1,
  Completed = 2,
  NoShow = 3,
}

export interface Reservation {
  id: bigint;
  host: string;
  guest: string | null;
  title: string;
  description: string;
  deposit: bigint;
  timestamp: bigint;
  status: number;
}

export interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash?: string;
  error?: string;
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  walletType: string | null;
}
