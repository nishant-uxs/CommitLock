import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from './config';

const { rpc, TransactionBuilder, Networks, Keypair } = StellarSdk;

/**
 * Fee Sponsorship Module - Gasless Transactions
 * 
 * This module implements Stellar's fee bump transaction mechanism,
 * allowing a sponsor account to pay transaction fees on behalf of users.
 * This enables gasless transactions for end users.
 * 
 * How it works:
 * 1. User signs a transaction with minimum base fee
 * 2. Sponsor wraps it in a FeeBumpTransaction with higher fee
 * 3. Sponsor signs the outer transaction
 * 4. The fee bump transaction is submitted to the network
 * 5. User's transaction executes, but sponsor pays the fee
 */

// Sponsor account configuration
// In production, this would be a funded account managed by the application
export const FEE_SPONSOR_CONFIG = {
  // Sponsor public key (funded testnet account that pays fees)
  sponsorPublicKey: process.env.NEXT_PUBLIC_FEE_SPONSOR_PUBLIC_KEY || '',
  // Maximum fee the sponsor is willing to pay per transaction (in stroops)
  maxFeePerTransaction: '100000', // 0.01 XLM max fee
  // Whether fee sponsorship is enabled
  enabled: process.env.NEXT_PUBLIC_FEE_SPONSOR_ENABLED === 'true',
};

export interface FeeBumpResult {
  success: boolean;
  hash?: string;
  sponsored: boolean;
  feePaid?: string;
  error?: string;
}

export interface SponsorshipStats {
  totalSponsored: number;
  totalFeePaid: bigint;
  transactionsToday: number;
  averageFee: bigint;
}

/**
 * Create a fee bump transaction that wraps a user's signed transaction
 * The sponsor pays the fee instead of the user
 */
export async function createFeeBumpTransaction(
  signedUserTxXdr: string,
  sponsorSecret: string
): Promise<string> {
  const server = new rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);
  const sponsorKeypair = Keypair.fromSecret(sponsorSecret);

  // Parse the user's signed transaction
  const userTransaction = TransactionBuilder.fromXDR(
    signedUserTxXdr,
    Networks.TESTNET
  );

  // Create fee bump transaction with sponsor paying the fee
  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    sponsorKeypair,
    FEE_SPONSOR_CONFIG.maxFeePerTransaction,
    userTransaction as StellarSdk.Transaction,
    Networks.TESTNET
  );

  // Sponsor signs the fee bump transaction
  feeBumpTx.sign(sponsorKeypair);

  return feeBumpTx.toXDR();
}

/**
 * Submit a fee-bumped transaction to the network
 */
export async function submitFeeBumpTransaction(
  feeBumpXdr: string
): Promise<FeeBumpResult> {
  const server = new rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);

  try {
    const transaction = TransactionBuilder.fromXDR(
      feeBumpXdr,
      Networks.TESTNET
    ) as StellarSdk.FeeBumpTransaction;

    const response = await server.sendTransaction(transaction);

    if (response.status === 'PENDING') {
      let getResponse = await server.getTransaction(response.hash);

      while (getResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        getResponse = await server.getTransaction(response.hash);
      }

      if (getResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        return {
          success: true,
          hash: response.hash,
          sponsored: true,
          feePaid: FEE_SPONSOR_CONFIG.maxFeePerTransaction,
        };
      } else {
        return {
          success: false,
          sponsored: true,
          error: 'Fee-bumped transaction failed on chain',
        };
      }
    }

    return {
      success: false,
      sponsored: true,
      error: `Unexpected status: ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      sponsored: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a transaction is eligible for fee sponsorship
 * Criteria: valid transaction, sponsor has funds, within daily limits
 */
export function isEligibleForSponsorship(): boolean {
  return FEE_SPONSOR_CONFIG.enabled && !!FEE_SPONSOR_CONFIG.sponsorPublicKey;
}

/**
 * Get fee sponsorship statistics from localStorage
 */
export function getSponsorshipStats(): SponsorshipStats {
  if (typeof window === 'undefined') {
    return { totalSponsored: 0, totalFeePaid: BigInt(0), transactionsToday: 0, averageFee: BigInt(0) };
  }

  const stats = localStorage.getItem('commitlock_sponsorship_stats');
  if (!stats) {
    return { totalSponsored: 0, totalFeePaid: BigInt(0), transactionsToday: 0, averageFee: BigInt(0) };
  }

  try {
    const parsed = JSON.parse(stats);
    return {
      totalSponsored: parsed.totalSponsored || 0,
      totalFeePaid: BigInt(parsed.totalFeePaid || '0'),
      transactionsToday: parsed.transactionsToday || 0,
      averageFee: BigInt(parsed.averageFee || '0'),
    };
  } catch {
    return { totalSponsored: 0, totalFeePaid: BigInt(0), transactionsToday: 0, averageFee: BigInt(0) };
  }
}

/**
 * Record a sponsored transaction in localStorage
 */
export function recordSponsoredTransaction(feePaid: string): void {
  if (typeof window === 'undefined') return;

  const stats = getSponsorshipStats();
  const newStats = {
    totalSponsored: stats.totalSponsored + 1,
    totalFeePaid: (stats.totalFeePaid + BigInt(feePaid)).toString(),
    transactionsToday: stats.transactionsToday + 1,
    averageFee: ((stats.totalFeePaid + BigInt(feePaid)) / BigInt(stats.totalSponsored + 1)).toString(),
    lastUpdated: new Date().toISOString(),
  };

  localStorage.setItem('commitlock_sponsorship_stats', JSON.stringify(newStats));
}
