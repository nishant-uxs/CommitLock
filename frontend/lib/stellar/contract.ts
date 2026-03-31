import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from './config';
import { Reservation } from './types';
import { trackTransaction } from '@/lib/metrics/tracker';
import { logContractCall, logTransaction } from '@/lib/monitoring/logger';

const { Contract, rpc, TransactionBuilder, Networks, BASE_FEE, xdr, Address, nativeToScVal, Keypair } = StellarSdk;

// A fixed public key used ONLY for simulating read-only queries (no real funds needed)
const SIMULATION_ACCOUNT = Keypair.random().publicKey();

export class CommitLockContract {
  private contract: StellarSdk.Contract;
  private server: InstanceType<typeof rpc.Server>;

  constructor() {
    this.contract = new Contract(STELLAR_CONFIG.contractId);
    this.server = new rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);
  }

  // Contract sig: create_reservation(env, host: Address, title: String, description: String, timestamp: u64, deposit: i128) -> u64
  async createReservation(
    sourceAccount: string,
    title: string,
    description: string,
    timestamp: number,
    depositXLM: number
  ): Promise<string> {
    const account = await this.server.getAccount(sourceAccount);
    const depositStroops = BigInt(Math.floor(depositXLM * 10000000));

    const hostAddr = new Address(sourceAccount);

    const operation = this.contract.call(
      'create_reservation',
      hostAddr.toScVal(),
      nativeToScVal(title, { type: 'string' }),
      nativeToScVal(description, { type: 'string' }),
      nativeToScVal(timestamp, { type: 'u64' }),
      nativeToScVal(depositStroops, { type: 'i128' })
    );

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(300)
      .build();

    const prepared = await this.server.prepareTransaction(transaction);
    logContractCall('create_reservation', { title, depositXLM });
    return prepared.toXDR();
  }

  // Contract sig: book_reservation(env, reservation_id: u64, guest: Address)
  async bookReservation(
    sourceAccount: string,
    reservationId: number
  ): Promise<string> {
    const account = await this.server.getAccount(sourceAccount);
    const guestAddr = new Address(sourceAccount);

    const operation = this.contract.call(
      'book_reservation',
      nativeToScVal(reservationId, { type: 'u64' }),
      guestAddr.toScVal()
    );

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(300)
      .build();

    const prepared = await this.server.prepareTransaction(transaction);
    logContractCall('book_reservation', { reservationId });
    return prepared.toXDR();
  }

  // Contract sig: confirm_attendance(env, reservation_id: u64, host: Address, attended: bool)
  async confirmAttendance(
    sourceAccount: string,
    reservationId: number,
    attended: boolean
  ): Promise<string> {
    const account = await this.server.getAccount(sourceAccount);
    const hostAddr = new Address(sourceAccount);

    const operation = this.contract.call(
      'confirm_attendance',
      nativeToScVal(reservationId, { type: 'u64' }),
      hostAddr.toScVal(),
      nativeToScVal(attended, { type: 'bool' })
    );

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(300)
      .build();

    const prepared = await this.server.prepareTransaction(transaction);
    logContractCall('confirm_attendance', { reservationId, attended });
    return prepared.toXDR();
  }

  // Read-only: get_reservation(env, reservation_id: u64) -> Option<Reservation>
  async getReservation(reservationId: number): Promise<Reservation | null> {
    try {
      const operation = this.contract.call(
        'get_reservation',
        nativeToScVal(reservationId, { type: 'u64' })
      );

      const response = await this.simulateReadOnly(operation);
      if (response) {
        return this.parseReservation(response);
      }
      return null;
    } catch (error) {
      console.error('Error getting reservation:', error instanceof Error ? error.message : JSON.stringify(error));
      return null;
    }
  }

  // Read-only: get_all_reservations(env) -> Vec<Reservation>
  async getAllReservations(): Promise<Reservation[]> {
    try {
      const operation = this.contract.call('get_all_reservations');
      const response = await this.simulateReadOnly(operation);
      if (response) {
        return this.parseReservationList(response);
      }
      return [];
    } catch (error) {
      console.error('Error getting all reservations:', error instanceof Error ? error.message : JSON.stringify(error));
      return [];
    }
  }

  // Read-only: get_user_bookings(env, user: Address) -> Vec<Reservation>
  async getUserBookings(userAddress: string): Promise<Reservation[]> {
    try {
      const userAddr = new Address(userAddress);
      const operation = this.contract.call(
        'get_user_bookings',
        userAddr.toScVal()
      );
      const response = await this.simulateReadOnly(operation);
      if (response) {
        return this.parseReservationList(response);
      }
      return [];
    } catch (error) {
      console.error('Error getting user bookings:', error instanceof Error ? error.message : JSON.stringify(error));
      return [];
    }
  }

  async submitTransaction(originalXdr: string, signedXDR: string): Promise<string> {
    const transaction = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
    const response = await this.server.sendTransaction(transaction as StellarSdk.Transaction);

    if (response.status === 'PENDING') {
      let getResponse = await this.server.getTransaction(response.hash);
      
      while (getResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        getResponse = await this.server.getTransaction(response.hash);
      }

      if (getResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        logTransaction('submitted', response.hash);
        trackTransaction('reservation');
        return response.hash;
      } else {
        logTransaction('failed', response.hash, 'Transaction failed on chain');
        throw new Error('Transaction failed on chain');
      }
    } else if (response.status === 'ERROR') {
      throw new Error(`Transaction error: ${response.errorResult?.toXDR('base64') || 'unknown'}`);
    } else {
      throw new Error(`Unexpected transaction status: ${response.status}`);
    }
  }

  // Helper: simulate a read-only contract call without needing a funded account
  private async simulateReadOnly(operation: StellarSdk.xdr.Operation): Promise<StellarSdk.xdr.ScVal | null> {
    // Use a random valid public key for simulation source (contract IDs don't work)
    const account = new StellarSdk.Account(SIMULATION_ACCOUNT, '0');

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const response = await this.server.simulateTransaction(transaction);

    if (rpc.Api.isSimulationSuccess(response) && response.result) {
      return response.result.retval;
    }

    // Log simulation failure details for debugging
    if ('error' in response) {
      console.error('Simulation error:', (response as any).error);
    }
    return null;
  }

  private parseReservation(scVal: StellarSdk.xdr.ScVal): Reservation | null {
    try {
      const switchName = scVal.switch().name;
      
      // Handle Option<Reservation> - could be scvVoid (None) or the struct
      if (switchName === 'scvVoid') return null;

      // Soroban structs are encoded as scvMap
      if (switchName === 'scvMap') {
        return this.parseReservationMap(scVal.map()!);
      }

      // Sometimes wrapped in a Vec for Option
      if (switchName === 'scvVec') {
        const vec = scVal.vec();
        if (!vec || vec.length === 0) return null;
        const inner = vec[0];
        if (inner.switch().name === 'scvMap') {
          return this.parseReservationMap(inner.map()!);
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing reservation:', error instanceof Error ? error.message : JSON.stringify(error));
      return null;
    }
  }

  private parseReservationMap(mapEntries: StellarSdk.xdr.ScMapEntry[]): Reservation | null {
    try {
      const reservation: any = {};
      
      mapEntries.forEach((entry: StellarSdk.xdr.ScMapEntry) => {
        const key = entry.key().sym().toString();
        const val = entry.val();
        
        switch (key) {
          case 'id':
            reservation.id = this.scValToNumber(val);
            break;
          case 'host':
            reservation.host = Address.fromScAddress(val.address()).toString();
            break;
          case 'guest':
            try {
              const guestSwitch = val.switch().name;
              if (guestSwitch === 'scvVec') {
                const vec = val.vec();
                if (vec && vec.length > 0) {
                  reservation.guest = Address.fromScAddress(vec[0].address()).toString();
                } else {
                  reservation.guest = null;
                }
              } else if (guestSwitch === 'scvVoid') {
                reservation.guest = null;
              } else if (guestSwitch === 'scvAddress') {
                reservation.guest = Address.fromScAddress(val.address()).toString();
              } else {
                reservation.guest = null;
              }
            } catch {
              reservation.guest = null;
            }
            break;
          case 'title':
            reservation.title = val.str().toString();
            break;
          case 'description':
            reservation.description = val.str().toString();
            break;
          case 'deposit':
            reservation.deposit = this.scValToBigInt(val);
            break;
          case 'timestamp':
            reservation.timestamp = this.scValToNumber(val);
            break;
          case 'status':
            reservation.status = Number(this.scValToNumber(val));
            break;
        }
      });

      return reservation as Reservation;
    } catch (error) {
      console.error('Error parsing reservation map:', error instanceof Error ? error.message : JSON.stringify(error));
      return null;
    }
  }

  private scValToNumber(val: StellarSdk.xdr.ScVal): bigint {
    const switchName = val.switch().name;
    if (switchName === 'scvU64') {
      return BigInt(val.u64().toString());
    }
    if (switchName === 'scvI128') {
      const parts = val.i128();
      const lo = BigInt(parts.lo().toString());
      const hi = BigInt(parts.hi().toString());
      return (hi << BigInt(64)) | lo;
    }
    if (switchName === 'scvU32') {
      return BigInt(val.u32());
    }
    return BigInt(0);
  }

  private scValToBigInt(val: StellarSdk.xdr.ScVal): bigint {
    return this.scValToNumber(val);
  }

  private parseReservationList(scVal: StellarSdk.xdr.ScVal): Reservation[] {
    try {
      if (scVal.switch().name === 'scvVec') {
        const vec = scVal.vec();
        if (!vec) return [];

        return vec
          .map((item: StellarSdk.xdr.ScVal) => this.parseReservation(item))
          .filter((r: Reservation | null): r is Reservation => r !== null);
      }
      return [];
    } catch (error) {
      console.error('Error parsing reservation list:', error instanceof Error ? error.message : JSON.stringify(error));
      return [];
    }
  }
}
