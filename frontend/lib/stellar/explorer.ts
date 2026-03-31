/**
 * Stellar Explorer Integration Module
 * 
 * Provides helper functions for generating Stellar Explorer URLs
 * and verifying on-chain data for accounts, transactions, and contracts.
 */

import { STELLAR_CONFIG } from './config';

const EXPLORER_BASE = 'https://stellar.expert/explorer/testnet';

export function getAccountUrl(address: string): string {
  return `${EXPLORER_BASE}/account/${address}`;
}

export function getTransactionUrl(hash: string): string {
  return `${EXPLORER_BASE}/tx/${hash}`;
}

export function getContractUrl(contractId?: string): string {
  return `${EXPLORER_BASE}/contract/${contractId || STELLAR_CONFIG.contractId}`;
}

export function getLedgerUrl(ledger: number): string {
  return `${EXPLORER_BASE}/ledger/${ledger}`;
}

export function formatAddress(address: string, chars: number = 6): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function isValidContractId(id: string): boolean {
  return /^C[A-Z2-7]{55}$/.test(id);
}
