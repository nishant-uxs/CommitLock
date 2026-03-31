# CommitLock - Technical Documentation

## API Reference

### Smart Contract Functions

#### `initialize(token_address: Address)`
Initializes the contract with the native XLM Stellar Asset Contract address.

- **Access**: One-time admin call
- **Parameters**: `token_address` — SAC address for native XLM
- **Returns**: void
- **Events**: None

#### `create_reservation(host: Address, title: String, description: String, timestamp: u64, deposit: i128) -> u64`
Creates a new reservation with deposit requirement.

- **Access**: Any authenticated user
- **Parameters**:
  - `host` — Wallet address of the reservation creator
  - `title` — Reservation name (max 100 chars)
  - `description` — Details (max 500 chars)
  - `timestamp` — Unix timestamp (must be in the future)
  - `deposit` — Amount in stroops (1 XLM = 10,000,000 stroops)
- **Returns**: Reservation ID (u64)
- **Events**: `reservation_created(id, host, title, deposit)`
- **Errors**: Panics if timestamp is in the past or deposit <= 0

#### `book_reservation(reservation_id: u64, guest: Address)`
Books a reservation and locks the guest's deposit in escrow.

- **Access**: Any authenticated user (not the host)
- **Parameters**:
  - `reservation_id` — ID of the reservation
  - `guest` — Wallet address of the booking guest
- **Returns**: void
- **Events**: `reservation_booked(id, guest, deposit)`
- **Token Transfer**: `guest → contract` (deposit amount)
- **Errors**: Panics if already booked, guest is host, or reservation doesn't exist

#### `confirm_attendance(reservation_id: u64, host: Address, attended: bool)`
Host confirms whether the guest attended.

- **Access**: Only the original host
- **Parameters**:
  - `reservation_id` — ID of the reservation
  - `host` — Must match the reservation host
  - `attended` — `true` = refund guest, `false` = pay host
- **Returns**: void
- **Events**: 
  - If attended: `attendance_confirmed(id, guest, deposit)`
  - If no-show: `no_show(id, host, deposit)`
- **Token Transfer**: 
  - Attended: `contract → guest` (refund)
  - No-show: `contract → host` (claim)
- **Errors**: Panics if caller is not host or reservation is not in Booked status

#### `get_reservation(reservation_id: u64) -> Option<Reservation>`
Query a single reservation by ID.

- **Access**: Public (read-only, no auth needed)
- **Returns**: Reservation struct or None

#### `get_all_reservations() -> Vec<Reservation>`
Query all reservations.

- **Access**: Public (read-only)
- **Returns**: Vector of all Reservation structs

#### `get_user_bookings(user: Address) -> Vec<Reservation>`
Query reservations for a specific user.

- **Access**: Public (read-only)
- **Returns**: Reservations where user is host or guest

---

### REST API Endpoints

#### `GET /api/metrics`
Returns platform metrics schema and documentation.

**Response:**
```json
{
  "description": "CommitLock Metrics API",
  "version": "1.0.0",
  "endpoints": { ... },
  "schema": { ... }
}
```

#### `GET /api/metrics/indexer`
Returns data indexing approach and schema.

**Response:**
```json
{
  "description": "CommitLock Data Indexer API",
  "approach": {
    "summary": "Event-driven indexing of Stellar Soroban contract interactions",
    "steps": [ ... ],
    "dataModel": { ... }
  }
}
```

#### `POST /api/fee-sponsor`
Submit a signed transaction for fee sponsorship.

**Request:**
```json
{
  "signedTxXdr": "base64-encoded-signed-transaction-xdr"
}
```

**Response (success):**
```json
{
  "feeBumpXdr": "base64-encoded-fee-bump-transaction-xdr",
  "sponsored": true,
  "sponsorPublicKey": "G...",
  "maxFee": "100000"
}
```

#### `POST /api/feedback`
Submit user feedback.

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "walletAddress": "string",
  "rating": 1-5,
  "feedback": "string"
}
```

---

### Data Models

#### Reservation
```typescript
interface Reservation {
  id: bigint;           // Unique identifier
  host: string;         // Host's Stellar address
  guest: string | null; // Guest's address (null if unbooked)
  title: string;        // Reservation title
  description: string;  // Reservation description
  deposit: bigint;      // Deposit amount in stroops
  timestamp: bigint;    // Unix timestamp
  status: number;       // 0=Open, 1=Booked, 2=Completed, 3=NoShow
}
```

#### Transaction Flow States
```
Open → Booked → Completed (attended, deposit refunded)
                → NoShow (not attended, deposit claimed by host)
```

---

## Deployment Architecture

```
GitHub Repository
       │
       ▼
  Render.com (Auto-deploy on push)
       │
       ├── Build: npm install && npm run build
       ├── Start: npm start
       ├── Root Directory: /frontend
       └── Environment Variables:
           ├── NEXT_PUBLIC_STELLAR_NETWORK=testnet
           ├── NEXT_PUBLIC_CONTRACT_ID=CANEW3ZQL...
           ├── NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
           ├── NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
           ├── NEXT_PUBLIC_FEE_SPONSOR_ENABLED=true
           ├── NEXT_PUBLIC_FEE_SPONSOR_PUBLIC_KEY=G...
           └── FEE_SPONSOR_SECRET_KEY=S... (server-side only)
```

---

## Technology Stack Details

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Smart Contract | Rust + Soroban SDK | 21.6.0 | On-chain business logic |
| Frontend | Next.js | 14.1.0 | Server-rendered React app |
| Language | TypeScript | 5.x | Type-safe development |
| Styling | Tailwind CSS | 3.3.0 | Utility-first CSS |
| Components | shadcn/ui (Radix) | Latest | Accessible UI components |
| Blockchain | @stellar/stellar-sdk | 15.0.1 | Transaction building |
| Wallet | @stellar/freighter-api | Latest | Wallet integration |
| Hosting | Render | Free Tier | Production deployment |
| Monitoring | Custom logger | 1.0.0 | Structured logging |
| Metrics | Custom tracker | 1.0.0 | Analytics tracking |
