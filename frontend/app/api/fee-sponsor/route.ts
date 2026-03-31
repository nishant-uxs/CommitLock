import { NextRequest, NextResponse } from 'next/server';
import * as StellarSdk from '@stellar/stellar-sdk';

const { TransactionBuilder, Networks, Keypair } = StellarSdk;

/**
 * API Route: Fee Sponsorship Endpoint
 * 
 * POST /api/fee-sponsor
 * Body: { signedTxXdr: string }
 * 
 * This endpoint receives a user's signed transaction and wraps it
 * in a fee bump transaction where the sponsor account pays the fee.
 */

const SPONSOR_SECRET = process.env.FEE_SPONSOR_SECRET_KEY || '';
const MAX_FEE = '100000'; // 0.01 XLM

export async function POST(request: NextRequest) {
  try {
    if (!SPONSOR_SECRET) {
      return NextResponse.json(
        { error: 'Fee sponsorship not configured', sponsored: false },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { signedTxXdr } = body;

    if (!signedTxXdr) {
      return NextResponse.json(
        { error: 'Missing signedTxXdr in request body' },
        { status: 400 }
      );
    }

    const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);

    // Parse user's signed transaction
    const userTransaction = TransactionBuilder.fromXDR(
      signedTxXdr,
      Networks.TESTNET
    );

    // Create fee bump transaction - sponsor pays the fee
    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      sponsorKeypair,
      MAX_FEE,
      userTransaction as StellarSdk.Transaction,
      Networks.TESTNET
    );

    // Sponsor signs the outer fee bump transaction
    feeBumpTx.sign(sponsorKeypair);

    return NextResponse.json({
      feeBumpXdr: feeBumpTx.toXDR(),
      sponsored: true,
      sponsorPublicKey: sponsorKeypair.publicKey(),
      maxFee: MAX_FEE,
    });
  } catch (error) {
    console.error('[Fee Sponsor] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create fee bump transaction',
        sponsored: false,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    enabled: !!SPONSOR_SECRET,
    maxFeePerTransaction: MAX_FEE,
    description: 'Fee Sponsorship API - Submit signed transactions for gasless execution',
    usage: 'POST /api/fee-sponsor with { signedTxXdr: string }',
  });
}
