# Changelog

All notable changes to CommitLock are documented in this file.

## [2.0.0] - Black Belt Release

### Added
- **Fee Sponsorship**: Gasless transactions via Stellar Fee Bump mechanism (`fee-sponsor.ts`, `/api/fee-sponsor`)
- **Metrics Dashboard**: DAU, WAU, MAU, transaction volumes, retention, no-show rates at `/metrics`
- **Monitoring Dashboard**: System health checks, structured logging, service status at `/monitoring`
- **Data Indexing**: Stellar Horizon event-driven indexing for contract activity tracking
- **Health API**: `/api/health` endpoint for external uptime monitoring (Soroban RPC + Horizon checks)
- **Error Boundary**: Production-grade React error boundary with structured error logging
- **Rate Limiter**: Per-wallet daily limit on fee-sponsored transactions to prevent abuse
- **Metrics Export**: CSV and JSON export for analytics reporting
- **Explorer Integration**: URL generators and validators for Stellar Explorer links
- **Custom Hooks**: `useMetrics` and `useHealthCheck` for reusable data access
- **Loading Skeletons**: Skeleton components for perceived performance during network fetches
- **Centralized Constants**: Application-wide configuration in single constants module
- **Formatting Utilities**: Stroops/XLM conversion, address truncation, date/number formatters
- **32 Verified Users**: Expanded onboarding CSV from 5 to 32 users with wallet addresses and feedback

### Documentation
- **SECURITY.md**: 24-point security checklist covering contract, frontend, infra, fee sponsorship
- **MONITORING.md**: Monitoring system architecture and operational runbook
- **USER_GUIDE.md**: Step-by-step guide for hosts and guests
- **TECHNICAL_DOCS.md**: Full API reference, data models, deployment architecture
- **DEMO_DAY.md**: 14-slide presentation structure for Demo Day
- **CONTRIBUTING.md**: Contributor guidelines, project structure, development setup
- **ARCHITECTURE.md**: Updated with Black Belt additions (metrics, monitoring, fee sponsor layers)
- **README.md**: Complete Black Belt submission checklist with all requirement links

### Improved
- Landing page with Metrics, Monitoring navigation and Gasless Transactions feature card
- Dashboard header with Metrics and Monitor quick-access buttons
- WalletContext integrated with monitoring logger and metrics tracker
- Contract interactions instrumented with structured logging and transaction tracking
- `render.yaml` with health check path and fee sponsorship environment variables
- `.env.example` updated with fee sponsorship configuration
- `.gitignore` extended for monitoring logs, IDE files, OS artifacts

## [1.0.0] - Blue Belt Release

### Added
- Soroban smart contract with escrow deposit logic (Rust)
- Next.js 14 frontend with Freighter wallet integration
- Reservation creation, booking, and attendance confirmation flows
- Dashboard with reservation listing and user bookings
- Feedback form with Google Form integration
- Deployment on Render with auto-deploy from GitHub
- Architecture documentation and README
- 6 verified test users with on-chain activity
