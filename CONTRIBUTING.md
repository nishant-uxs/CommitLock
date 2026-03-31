# Contributing to CommitLock

Thank you for your interest in contributing to CommitLock!

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/CommitLock_BlackBelt.git`
3. **Install** dependencies: `cd frontend && npm install`
4. **Copy** env file: `cp .env.example .env.local`
5. **Run** the dev server: `npm run dev`

## Project Structure

```
black-belt/
├── frontend/                # Next.js 14 application
│   ├── app/                 # App router pages
│   │   ├── api/             # API routes (health, metrics, fee-sponsor, feedback)
│   │   ├── dashboard/       # Main dashboard
│   │   ├── metrics/         # Metrics dashboard
│   │   ├── monitoring/      # Monitoring dashboard
│   │   ├── create/          # Create reservation
│   │   └── feedback/        # User feedback form
│   ├── components/          # Reusable React components
│   ├── contexts/            # React context providers
│   └── lib/                 # Utility libraries
│       ├── stellar/         # Stellar SDK integration (contract, fee-sponsor, indexer, explorer)
│       ├── metrics/         # Metrics tracking and export
│       ├── monitoring/      # Logging and health checks
│       ├── hooks/           # Custom React hooks
│       └── utils/           # Formatting and helper utilities
├── contracts/               # Soroban smart contracts (Rust)
├── docs/                    # Documentation (user guide, technical docs, demo day, CSV)
├── ARCHITECTURE.md          # System architecture
├── SECURITY.md              # Security checklist
├── MONITORING.md            # Monitoring documentation
└── README.md                # Project overview
```

## Development Guidelines

### Code Style
- Use **TypeScript** for all frontend code
- Follow existing patterns for component structure
- Use **Tailwind CSS** for styling (no inline styles)
- Use **shadcn/ui** components where possible

### Commit Messages
Follow conventional commits format:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `refactor:` — Code refactoring
- `config:` — Configuration changes
- `test:` — Adding or updating tests

### Pull Requests
1. Create a feature branch from `main`
2. Write clear PR description with context
3. Ensure code compiles without errors (`npm run build`)
4. Reference any related issues

## Smart Contract Development

### Prerequisites
- Rust 1.74+
- Soroban CLI (`cargo install --locked soroban-cli`)
- Stellar CLI tools

### Build & Deploy
```bash
cd contracts/commit_lock
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/commit_lock.wasm --network testnet
```

## Reporting Issues

- Use GitHub Issues for bug reports
- Include browser, OS, and wallet version
- Provide transaction hashes where relevant
- Include console logs for frontend issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
