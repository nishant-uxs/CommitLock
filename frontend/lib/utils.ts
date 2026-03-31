import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatXLM(stroops: bigint | string): string {
  const amount = typeof stroops === 'string' ? BigInt(stroops) : stroops;
  return (Number(amount) / 10000000).toFixed(2);
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.floor(xlm * 10000000));
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function getStatusColor(status: number | bigint): string {
  const s = Number(status);
  switch (s) {
    case 0: return "bg-green-500";
    case 1: return "bg-blue-500";
    case 2: return "bg-purple-500";
    case 3: return "bg-red-500";
    default: return "bg-gray-500";
  }
}

export function getStatusText(status: number | bigint): string {
  const s = Number(status);
  switch (s) {
    case 0: return "Open";
    case 1: return "Booked";
    case 2: return "Completed";
    case 3: return "No Show";
    default: return "Unknown";
  }
}
