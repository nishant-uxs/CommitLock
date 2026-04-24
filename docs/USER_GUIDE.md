# CommitLock - User Guide

## Getting Started

### What is CommitLock?

CommitLock is a decentralized no-show protection platform. When you book a reservation, you lock a small XLM deposit as a commitment. If you attend, you get your deposit back. If you don't show up, the host keeps the deposit.

### Prerequisites

1. **Freighter Wallet** — Install from [freighter.app](https://www.freighter.app/)
2. **Testnet XLM** — Get free test tokens from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
3. **Modern Browser** — Chrome or Brave recommended

---

## Step-by-Step Guide

### 1. Setting Up Your Wallet

1. Install the **Freighter** browser extension
2. Create a new wallet or import an existing one
3. Switch to **Testnet** network:
   - Open Freighter → Settings → Network → Select "TESTNET"
4. Fund your wallet:
   - Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
   - Enter your public key and click "Fund"
   - You'll receive 10,000 test XLM

### 2. Connecting to CommitLock

1. Visit the app at [https://commitlock.onrender.com](https://commitlock.onrender.com)
2. Click **"Connect Wallet"** button
3. Freighter will popup asking for permission — click **Allow**
4. Your wallet address will appear in the header

### 3. Creating a Reservation (As Host)

1. Navigate to **"Create Reservation"** page
2. Fill in the details:
   - **Title**: Name of your event (e.g., "Dinner at The Grand")
   - **Description**: Details about the reservation
   - **Date & Time**: When the reservation is for
   - **Deposit Amount**: How much XLM the guest must lock (e.g., 1 XLM)
3. Click **"Create Reservation"**
4. Sign the transaction in Freighter
5. Wait for confirmation — your reservation is now live!

### 4. Booking a Reservation (As Guest)

1. Go to the **Dashboard** page
2. Browse available reservations
3. Click on a reservation to view details
4. Click **"Book Reservation"**
5. Sign the transaction — your deposit will be locked in the smart contract
6. Show up to the event!

### 5. Confirming Attendance (As Host)

1. After the reservation time has passed, go to the reservation detail page
2. You'll see two options:
   - **"Confirm Attendance"** — Guest showed up → deposit is refunded to guest
   - **"Mark No-Show"** — Guest didn't show → deposit is transferred to you
3. Sign the transaction to finalize

### 6. Viewing Your Bookings

1. Go to **Dashboard** → **"My Bookings"** tab
2. See all reservations you've created or booked
3. Check status: Open, Booked, Completed, or No-Show

### 7. Submitting Feedback

1. Navigate to the **Feedback** page
2. Fill in your experience and suggestions
3. Or use our [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSfguzIG0QRxGyqE05ZFLUUYfGEgbQTKePCYyHDNTyE9oMQ5Pg/viewform)

---

## Fee Sponsorship (Gasless Transactions)

CommitLock supports **fee sponsorship** — a sponsor account pays the transaction fees so you don't have to. This means:

- No need to worry about having XLM for gas fees
- Only the deposit amount matters
- The sponsor pays network fees on your behalf

This is implemented using Stellar's **Fee Bump Transaction** mechanism.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Wallet won't connect | Make sure Freighter is installed and set to Testnet |
| Transaction failing | Ensure you have enough XLM for the deposit + small fee |
| Page not loading | Refresh the page; check internet connection |
| Can't confirm attendance | Only the host can confirm; wait until reservation time passes |
| Deposit not refunded | Host must confirm your attendance first |

---

## Platform Features

| Feature | Description |
|---------|-------------|
| Smart Contract Escrow | Deposits safely held in on-chain contract |
| Multi-Wallet Support | Connect via Freighter wallet |
| Fee Sponsorship | Gasless transactions for better UX |
| Metrics Dashboard | Track DAU, transactions, and retention at `/metrics` |
| Monitoring | System health and logs at `/monitoring` |
| Data Indexing | Contract event tracking via Horizon API |
| User Feedback | In-app feedback form + Google Form |

---

## FAQ

**Q: Is my money safe?**
A: Yes. Deposits are held in a smart contract, not in anyone's wallet. The code is open-source and auditable.

**Q: What happens if the host never confirms?**
A: Currently, the deposit remains locked. In future versions, an automatic timeout will release it.

**Q: Can I cancel a booking?**
A: Cancellation with partial refund is planned for a future release.

**Q: Is this on mainnet?**
A: No, this is currently on Stellar Testnet. Do not use real XLM.
