# Deployment Guide — Black Belt on Render

## Quick Deploy to Render

### Option 1: Blueprint (render.yaml) — Recommended

1. Login to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Blueprint**
3. Connect GitHub repo: `nishant-uxs/CommitLock`
4. Render auto-detects `render.yaml` at repo root
5. Click **Apply** to create the service

### Option 2: Manual Web Service

1. Login to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect GitHub repo: `nishant-uxs/CommitLock`
4. Configure:
   - **Name**: `commitlock-blackbelt`
   - **Region**: Oregon (or nearest)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click **Create Web Service**

## Environment Variables

Set these in Render Dashboard → Environment tab:

### Required (public)
```
NODE_ENV=production
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=CANEW3ZQL7QVB7ZAH5R6XXEUZX3TGO5CONSPXBAFSPWSEK2ITBZJ7WT5
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_FEE_SPONSOR_ENABLED=true
```

### Fee Sponsorship (Optional — for gasless transactions)

If you want to enable fee sponsorship, generate a new Stellar testnet keypair and fund it:

1. Generate keypair at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Fund the public key with testnet XLM (10,000 free XLM)
3. Add to Render environment:

```
NEXT_PUBLIC_FEE_SPONSOR_PUBLIC_KEY=G...your_sponsor_public_key
FEE_SPONSOR_SECRET_KEY=S...your_sponsor_secret_key
```

⚠️ **Security**: The `FEE_SPONSOR_SECRET_KEY` is server-side only. Never expose it. Render encrypts env vars at rest.

## Health Check

Render uses `/api/health` to verify the service is healthy. Returns:
- `200 OK` if frontend + Soroban RPC + Horizon are all reachable
- `503 Service Unavailable` if any dependency fails

## Post-Deployment Checklist

After first deploy, verify:

- [ ] Landing page loads at deployed URL
- [ ] `/dashboard` shows reservations
- [ ] `/metrics` shows metrics dashboard
- [ ] `/monitoring` shows health + logs
- [ ] `/api/health` returns JSON health status
- [ ] Wallet connect works (Freighter)
- [ ] Create reservation transaction succeeds

## Updating the Deployment

Auto-deploy is enabled. Just push to `main`:

```bash
git add -A
git commit -m "your changes"
git push origin main
```

Render will automatically rebuild and redeploy within 2-3 minutes.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with TypeScript errors | Check Node version is 18+ in Render settings |
| `/api/health` returns 503 | Soroban RPC or Horizon is down; check Stellar status page |
| Wallet connection fails | Ensure Freighter is set to Testnet |
| Fee sponsorship not working | Verify env vars are set and sponsor account is funded |
| 404 on `/metrics` or `/monitoring` | Clear Render cache and redeploy |

## Custom Domain (Optional)

1. Render Dashboard → Your Service → Settings → Custom Domains
2. Add your domain (e.g., `commitlock.yourdomain.com`)
3. Add CNAME record in your DNS: `commitlock.yourdomain.com → your-service.onrender.com`
4. Wait 5-10 minutes for SSL certificate to be issued

## Monitoring the Deployed App

- **Uptime**: [UptimeRobot](https://uptimerobot.com) — add `https://your-service.onrender.com/api/health`
- **Logs**: Render Dashboard → Logs tab (real-time streaming)
- **Metrics**: Render Dashboard → Metrics tab (CPU, memory, bandwidth)
- **Custom**: Visit `/monitoring` page in the app for in-app health + log stream
