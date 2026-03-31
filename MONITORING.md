# CommitLock - Production Monitoring & Logging

## Overview

CommitLock uses a comprehensive monitoring and logging system to track application health, user activity, and system performance in production.

## Monitoring Architecture

```
┌─────────────────────────────────────────────────┐
│                 CommitLock Frontend               │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ Logger       │  │ Health Check │  │ Metrics │ │
│  │ Module       │  │ Module       │  │ Tracker │ │
│  └──────┬──────┘  └──────┬───────┘  └────┬────┘ │
│         │                │               │       │
│  ┌──────┴────────────────┴───────────────┴────┐ │
│  │          Monitoring Dashboard (/monitoring) │ │
│  │          Metrics Dashboard (/metrics)       │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
         │                │                │
         ▼                ▼                ▼
   localStorage     Soroban RPC       Horizon API
   (Log Storage)    (Health)          (Indexer)
```

## Components

### 1. Structured Logger (`lib/monitoring/logger.ts`)

Provides leveled logging with structured context:

- **debug** — Verbose development logs
- **info** — Normal operations (wallet connect, transactions)
- **warn** — Recoverable issues (fee sponsorship fallback)
- **error** — Failed operations (transaction failures)
- **critical** — System-level failures

Each log entry includes:
- ISO 8601 timestamp
- Log level
- Message
- Structured context (key-value pairs)
- Source module identifier

### 2. Health Checks

Automated health checks for all dependencies:

| Service | Check Method | Endpoint |
|---------|-------------|----------|
| Frontend | Self-check | localhost |
| Soroban RPC | JSON-RPC `getHealth` | soroban-testnet.stellar.org |
| Horizon API | HTTP GET | horizon-testnet.stellar.org |
| Smart Contract | Via Soroban RPC | Contract ID lookup |

Health status levels:
- **Healthy** — All services operational
- **Degraded** — Some services down
- **Unhealthy** — Critical services unavailable

### 3. Monitoring Dashboard (`/monitoring`)

Live dashboard showing:
- Overall system health status
- Individual service check results
- Uptime tracking
- Log stream with level filtering
- Log statistics by level

### 4. Metrics Dashboard (`/metrics`)

Platform analytics showing:
- DAU / WAU / MAU
- Transaction volumes
- Reservation funnel (created → booked → completed)
- Deposit volumes
- No-show rates
- Retention rates
- Daily breakdown table

## Alerting (Production)

For production deployment, integrate with:

| Service | Purpose | Integration |
|---------|---------|-------------|
| Sentry | Error tracking | `@sentry/nextjs` package |
| BetterStack | Log aggregation | HTTP log drain |
| Render Health | Uptime monitoring | Built-in with Render |
| UptimeRobot | External monitoring | HTTP ping check |

## Accessing Dashboards

- **Metrics**: `https://<your-domain>/metrics`
- **Monitoring**: `https://<your-domain>/monitoring`
- **Metrics API**: `https://<your-domain>/api/metrics`
- **Indexer API**: `https://<your-domain>/api/metrics/indexer`
- **Health API**: `https://<your-domain>/api/fee-sponsor` (GET)
