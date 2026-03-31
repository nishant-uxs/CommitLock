/**
 * Data Indexing Module
 * 
 * Indexes Stellar contract events and transaction data for analytics.
 * Uses Stellar Horizon API to fetch and cache transaction history.
 */

import { STELLAR_CONFIG } from './config';

export interface IndexedTransaction {
  hash: string;
  timestamp: string;
  type: 'reservation_created' | 'reservation_booked' | 'attendance_confirmed' | 'no_show' | 'unknown';
  sourceAccount: string;
  successful: boolean;
  ledger: number;
  fee: string;
}

export interface IndexerState {
  lastIndexedLedger: number;
  totalIndexed: number;
  transactions: IndexedTransaction[];
  lastUpdated: string;
}

const INDEXER_KEY = 'commitlock_indexer';

function getStoredState(): IndexerState {
  if (typeof window === 'undefined') {
    return { lastIndexedLedger: 0, totalIndexed: 0, transactions: [], lastUpdated: '' };
  }
  try {
    const raw = localStorage.getItem(INDEXER_KEY);
    return raw ? JSON.parse(raw) : { lastIndexedLedger: 0, totalIndexed: 0, transactions: [], lastUpdated: '' };
  } catch {
    return { lastIndexedLedger: 0, totalIndexed: 0, transactions: [], lastUpdated: '' };
  }
}

function saveState(state: IndexerState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INDEXER_KEY, JSON.stringify(state));
}

/**
 * Fetch recent contract transactions from Horizon
 */
export async function indexContractTransactions(): Promise<IndexerState> {
  const state = getStoredState();

  try {
    const url = `${STELLAR_CONFIG.horizonUrl}/accounts/${STELLAR_CONFIG.contractId}/operations?limit=50&order=desc`;
    const res = await fetch(url);

    if (!res.ok) {
      // Contract accounts may not have direct Horizon entries; use stored data
      return state;
    }

    const data = await res.json();
    const records = data._embedded?.records || [];

    const newTxns: IndexedTransaction[] = records.map((r: any) => ({
      hash: r.transaction_hash || r.id,
      timestamp: r.created_at || new Date().toISOString(),
      type: classifyOperation(r),
      sourceAccount: r.source_account || '',
      successful: r.transaction_successful !== false,
      ledger: r.ledger || 0,
      fee: r.fee_charged || '100',
    }));

    state.transactions = newTxns;
    state.totalIndexed = newTxns.length;
    state.lastUpdated = new Date().toISOString();
    if (newTxns.length > 0 && newTxns[0].ledger) {
      state.lastIndexedLedger = newTxns[0].ledger;
    }

    saveState(state);
    return state;
  } catch (error) {
    console.error('[Indexer] Error fetching transactions:', error);
    return state;
  }
}

function classifyOperation(op: any): IndexedTransaction['type'] {
  const opType = op.type || '';
  if (opType === 'invoke_host_function') {
    const fn = op.function || '';
    if (fn.includes('create')) return 'reservation_created';
    if (fn.includes('book')) return 'reservation_booked';
    if (fn.includes('confirm')) return 'attendance_confirmed';
  }
  return 'unknown';
}

/**
 * Get indexed data summary
 */
export function getIndexerSummary(): IndexerState {
  return getStoredState();
}

/**
 * Seed demo indexer data
 */
export function seedDemoIndexerData(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(INDEXER_KEY)) return;

  const demoTxns: IndexedTransaction[] = [
    { hash: '5be5207d8fcaa28b', timestamp: '2026-03-28T10:00:00Z', type: 'reservation_created', sourceAccount: 'GCHL5O...NEL', successful: true, ledger: 1234560, fee: '100' },
    { hash: '9319b202d3cac385', timestamp: '2026-03-28T11:00:00Z', type: 'reservation_booked', sourceAccount: 'GACWMM...IEL', successful: true, ledger: 1234570, fee: '100' },
    { hash: 'a1b2c3d4e5f6a7b8', timestamp: '2026-03-29T09:00:00Z', type: 'attendance_confirmed', sourceAccount: 'GCHL5O...NEL', successful: true, ledger: 1234600, fee: '100' },
    { hash: 'f1e2d3c4b5a69788', timestamp: '2026-03-29T14:00:00Z', type: 'reservation_created', sourceAccount: 'GB7JTK...MCT', successful: true, ledger: 1234650, fee: '100' },
    { hash: '1a2b3c4d5e6f7890', timestamp: '2026-03-30T08:00:00Z', type: 'reservation_booked', sourceAccount: 'GCXD73...5JP', successful: true, ledger: 1234700, fee: '100' },
    { hash: '0987654321abcdef', timestamp: '2026-03-30T16:00:00Z', type: 'no_show', sourceAccount: 'GCHL5O...NEL', successful: true, ledger: 1234750, fee: '100' },
  ];

  const state: IndexerState = {
    lastIndexedLedger: 1234750,
    totalIndexed: demoTxns.length,
    transactions: demoTxns,
    lastUpdated: new Date().toISOString(),
  };
  saveState(state);
}
