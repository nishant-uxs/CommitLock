# CommitLock - Architecture Document (Black Belt Edition)

## System Overview

CommitLock is a production-ready decentralized no-show protection protocol built on the Stellar blockchain using Soroban smart contracts. The system enables hosts to create reservations with deposit requirements, and guests to book by locking XLM tokens in escrow. The Black Belt version adds fee sponsorship (gasless transactions), metrics tracking, production monitoring, data indexing, and comprehensive security measures.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js 14)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐  │
│  │ Landing   │ │Dashboard │ │ Booking  │ │Feedback │ │ Metrics   │  │
│  │ Page      │ │  Page    │ │  Detail  │ │  Form   │ │ Dashboard │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ └─────┬─────┘  │
│       │             │            │             │            │         │
│  ┌────┴─────────────┴────────────┴─────────────┴────────────┴──────┐ │
│  │              WalletContext (React Context)                       │ │
│  │    Manages wallet state, transaction signing, metrics tracking  │ │
│  └──────────────────────┬──────────────────────────────────────────┘ │
│                         │                                            │
│  ┌──────────────────────┼──────────────────────────────────────────┐ │
│  │  ┌─────────────────┐ │ ┌──────────────┐ ┌───────────────────┐  │ │
│  │  │ CommitLock       │ │ │ Fee Sponsor  │ │ Metrics Tracker   │  │ │
│  │  │ Contract.ts      │ │ │ Module       │ │ + Logger          │  │ │
│  │  └────────┬─────────┘ │ └──────┬───────┘ └────────┬──────────┘  │ │
│  │           │            │        │                  │             │ │
│  │  ┌────────┴────────────┴────────┴──────────────────┴──────────┐ │ │
│  │  │              API Routes (/api/*)                            │ │ │
│  │  │  /fee-sponsor  /metrics  /health  /feedback  /indexer      │ │ │
│  │  └────────────────────┬───────────────────────────────────────┘ │ │
│  └───────────────────────┼─────────────────────────────────────────┘ │
└──────────────────────────┼───────────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │  Stellar Network   │
                │  (Testnet)         │
                │                    │
                │  ┌──────────────┐  │
                │  │ Soroban RPC  │  │
                │  │  Server      │  │
                │  └──────┬───────┘  │
                │         │          │
                │  ┌──────┴───────┐  │
                │  │  CommitLock  │  │
                │  │  Smart       │  │
                │  │  Contract    │  │
                │  └──────────────┘  │
                │                    │
                │  ┌──────────────┐  │
                │  │ Stellar      │  │
                │  │ Asset        │  │
                │  │ Contract     │  │
                │  │ (Native XLM) │  │
                │  └──────────────┘  │
                └────────────────────┘
```

## Component Architecture

### 1. Smart Contract Layer (Soroban/Rust)

**File**: `contracts/src/lib.rs`

The smart contract is the core of the system, handling all business logic on-chain.

#### Data Structures

```rust
pub struct Reservation {
    pub id: u64,
    pub host: Address,
    pub guest: Address,
    pub title: String,
    pub description: String,
    pub timestamp: u64,
    pub deposit: i128,
    pub status: u32,
}

pub enum ReservationStatus {
    Open = 0,      // Created, waiting for guest
    Booked = 1,    // Guest booked, deposit locked
    Completed = 2, // Attended, deposit refunded
    NoShow = 3,    // No-show, deposit claimed by host
}
```

#### Contract Functions

| Function | Description | Access |
|----------|-------------|--------|
| `initialize(token_address)` | Set up contract with XLM token address | Admin (once) |
| `create_reservation(host, title, desc, timestamp, deposit)` | Create new reservation | Any user |
| `book_reservation(reservation_id, guest)` | Book and lock deposit | Any user (not host) |
| `confirm_attendance(reservation_id, host, attended)` | Confirm/deny attendance | Host only |
| `get_reservation(id)` | Query single reservation | Public |
| `get_all_reservations()` | Query all reservations | Public |

#### Token Transfer Flow

```
BOOKING:
  Guest Wallet ──[deposit XLM]──> Contract (Escrow)

ATTENDED (confirm_attendance = true):
  Contract (Escrow) ──[refund XLM]──> Guest Wallet

NO-SHOW (confirm_attendance = false):
  Contract (Escrow) ──[claim XLM]──> Host Wallet
```

### 2. Frontend Layer (Next.js 14)

#### App Router Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `page.tsx` | Landing page with project overview |
| `/dashboard` | `dashboard/page.tsx` | View all reservations and user bookings |
| `/create` | `create/page.tsx` | Create new reservation form |
| `/booking/[id]` | `booking/[id]/page.tsx` | Reservation detail with booking/confirm actions |
| `/feedback` | `feedback/page.tsx` | User feedback form |
| `/api/feedback` | `api/feedback/route.ts` | API endpoint for feedback submission |

#### Component Hierarchy

```
RootLayout (layout.tsx)
├── WalletProvider (WalletContext.tsx)
│   ├── Toaster (toaster.tsx)
│   └── Page Components
│       ├── LandingPage
│       ├── DashboardPage
│       │   ├── WalletConnect
│       │   ├── ReservationList
│       │   │   └── ReservationCard (per reservation)
│       │   └── Tabs (All / My Bookings)
│       ├── CreatePage
│       │   ├── WalletConnect
│       │   └── CreateReservationForm
│       ├── BookingDetailPage
│       │   ├── WalletConnect
│       │   ├── Reservation Info Display
│       │   ├── Book Button (for guests)
│       │   └── Confirm Attendance Button (for hosts)
│       └── FeedbackPage
│           ├── WalletConnect
│           └── FeedbackForm
```

### 3. Blockchain Integration Layer

#### WalletContext (`contexts/WalletContext.tsx`)

Manages wallet connection state using Freighter API:

- **`connectWallet()`**: Checks if already authorized via `isAllowed()`, uses `getAddress()` for existing auth, `requestAccess()` for new connections
- **`disconnectWallet()`**: Clears wallet state
- **`signTransaction(xdr)`**: Signs transaction XDR using Freighter's `signTransaction()`

#### CommitLockContract (`lib/stellar/contract.ts`)

Handles all contract interactions:

- **Transaction Building**: Creates Stellar transactions with proper Soroban operations
- **ScVal Encoding**: Converts TypeScript values to Soroban-compatible ScVal format
- **Read-Only Simulation**: Uses random keypair for query operations (no signing needed)
- **Result Parsing**: Decodes contract return values into TypeScript objects

#### Configuration (`lib/stellar/config.ts`)

```typescript
export const STELLAR_CONFIG = {
  contractId: 'CANEW3ZQL7QVB7ZAH5R6XXEUZX3TGO5CONSPXBAFSPWSEK2ITBZJ7WT5',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
};
```

## Data Flow

### Reservation Creation Flow

```
1. Host fills form (title, description, date, deposit)
2. CreateReservationForm validates inputs
3. CommitLockContract.createReservation() builds transaction
4. WalletContext.signTransaction() → Freighter popup
5. Signed XDR submitted to Soroban RPC
6. Contract stores reservation in on-chain storage
7. Event emitted: "reservation_created"
8. UI updates with new reservation
```

### Booking Flow

```
1. Guest clicks "Book" on reservation detail page
2. CommitLockContract.bookReservation() builds transaction
3. Transaction includes token transfer: guest → contract
4. WalletContext.signTransaction() → Freighter popup
5. Contract receives deposit and updates status to "Booked"
6. Event emitted: "reservation_booked"
7. UI shows booking confirmation
```

### Attendance Confirmation Flow

```
1. Host clicks "Confirm Attendance" or "Mark No-Show"
2. CommitLockContract.confirmAttendance() builds transaction
3. If attended=true: Contract transfers deposit back to guest
4. If attended=false: Contract transfers deposit to host
5. Status updated to "Completed" or "NoShow"
6. Event emitted: "attendance_confirmed" or "no_show"
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Smart Contract | Rust + Soroban SDK | 21.6.0 |
| Frontend Framework | Next.js | 14.1.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.3.0 |
| UI Components | shadcn/ui (Radix UI) | Latest |
| Blockchain SDK | @stellar/stellar-sdk | 15.0.1 |
| Wallet | @stellar/freighter-api | Latest |
| Deployment | Render | Free Tier |

## Security Considerations

1. **Deposit Safety**: All deposits held in smart contract escrow, not in any centralized wallet
2. **Host-Only Confirmation**: Only the original host can confirm attendance
3. **Immutable Records**: All transactions recorded on Stellar blockchain
4. **No Private Keys**: Frontend never handles private keys; Freighter manages signing
5. **Input Validation**: Contract validates all parameters (future timestamps, positive deposits)

## Network Configuration

- **Network**: Stellar Testnet
- **Contract ID**: `CANEW3ZQL7QVB7ZAH5R6XXEUZX3TGO5CONSPXBAFSPWSEK2ITBZJ7WT5`
- **Soroban RPC**: `https://soroban-testnet.stellar.org`
- **Horizon**: `https://horizon-testnet.stellar.org`
- **Explorer**: [Stellar Expert](https://stellar.expert/explorer/testnet)
