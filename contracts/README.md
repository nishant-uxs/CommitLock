# CommitLock Smart Contract

## Overview

This is the Soroban smart contract for CommitLock, a decentralized no-show protection protocol on Stellar.

## Contract Functions

### `initialize()`
Initializes the contract. Must be called once after deployment.

### `create_reservation(host, title, description, timestamp, deposit)`
Creates a new reservation slot.
- **host**: Address of the host creating the reservation
- **title**: Title of the reservation
- **description**: Description of the reservation
- **timestamp**: Unix timestamp for the reservation time
- **deposit**: Amount of XLM (in stroops) required as deposit

Returns: Reservation ID

### `book_reservation(reservation_id, guest)`
Books a reservation and locks the deposit.
- **reservation_id**: ID of the reservation to book
- **guest**: Address of the guest booking the reservation

### `confirm_attendance(reservation_id, host, attended)`
Confirms whether the guest attended.
- **reservation_id**: ID of the reservation
- **host**: Address of the host (must match reservation host)
- **attended**: Boolean indicating if guest attended

### `get_reservation(reservation_id)`
Returns reservation details for a given ID.

### `get_all_reservations()`
Returns all reservations.

### `get_user_bookings(user)`
Returns all reservations where the user is either host or guest.

### `get_reservation_count()`
Returns the total number of reservations created.

## Building

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

## Testing

```bash
cd contracts
cargo test
```

## Deploying to Testnet

```bash
# Install Stellar CLI if not already installed
cargo install --locked stellar-cli --features opt

# Build optimized WASM
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/commitlock.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet

# Initialize the contract
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_SECRET_KEY> \
  --network testnet \
  -- initialize
```

## Events

The contract emits the following events:

- **created**: When a reservation is created
- **booked**: When a reservation is booked
- **refunded**: When deposit is refunded to guest
- **claimed**: When deposit is transferred to host

## Security Features

- Host authentication required for attendance confirmation
- Guest authentication required for booking
- Deposit locked in contract escrow
- Atomic transfers prevent partial failures
- Status validation prevents invalid state transitions
