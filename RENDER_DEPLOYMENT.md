# Render Deployment Guide

Complete step-by-step guide to deploy CommitLock frontend on Render.

## Prerequisites

- GitHub repository with your code pushed
- Render account (free tier works fine)
- Contract deployed on Stellar testnet

## Step-by-Step Deployment

### 1. Sign Up / Login to Render

Go to [render.com](https://render.com) and sign in with your GitHub account.

### 2. Create New Web Service

1. Click **Dashboard** → **New +** → **Web Service**
2. Click **Connect GitHub** (if not already connected)
3. Select your repository: `nishant-uxs/CommitLock`
4. Click **Connect**

### 3. Configure Service Settings

**Basic Settings:**
- **Name**: `commitlock-blackbelt` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `frontend` ⚠️ **IMPORTANT**

**Build Settings:**
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. Add Environment Variables

Click **Advanced** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` |
| `NEXT_PUBLIC_CONTRACT_ID` | `CANEW3ZQL7QVB7ZAH5R6XXEUZX3TGO5CONSPXBAFSPWSEK2ITBZJ7WT5` |
| `NEXT_PUBLIC_HORIZON_URL` | `https://horizon-testnet.stellar.org` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_FEE_SPONSOR_ENABLED` | `true` |
| `NEXT_PUBLIC_FEE_SPONSOR_PUBLIC_KEY` | _(your sponsor public key)_ |
| `FEE_SPONSOR_SECRET_KEY` | _(your sponsor secret key — keep private)_ |

### 5. Select Plan

- Choose **Free** plan (sufficient for testing)
- Free tier includes:
  - 750 hours/month
  - Automatic SSL
  - Global CDN

### 6. Deploy

1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. Watch the build logs in real-time

### 7. Verify Deployment

Once deployed, you'll get your own URL. Production instance of CommitLock is live at: `https://commitlock.onrender.com`

**Test these features:**
- ✅ Homepage loads
- ✅ Wallet connection works (Freighter)
- ✅ Dashboard shows reservations
- ✅ Create reservation form works
- ✅ Booking flow works
- ✅ Contract interactions succeed
- ✅ `/metrics` dashboard renders with KPIs
- ✅ `/monitoring` dashboard shows health + logs
- ✅ `/api/health` returns JSON health status
- ✅ Fee sponsorship works for gasless transactions

## Troubleshooting

### Build Fails

**Error**: `Cannot find module 'next'`
- **Fix**: Ensure `Root Directory` is set to `frontend`

**Error**: `Build command failed`
- **Fix**: Check `package.json` scripts are correct

### Runtime Errors

**Error**: `Contract not found`
- **Fix**: Verify `NEXT_PUBLIC_CONTRACT_ID` environment variable

**Error**: `Network error`
- **Fix**: Check `NEXT_PUBLIC_SOROBAN_RPC_URL` is correct

### Wallet Connection Issues

**Error**: Freighter not detected
- **Fix**: This is expected - users need Freighter extension installed

## Auto-Deploy on Push

Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will detect the push and redeploy automatically.

## Custom Domain (Optional)

1. Go to **Settings** → **Custom Domain**
2. Add your domain (e.g., `commitlock.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate auto-generated

## Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: CPU, memory usage in dashboard
- **Alerts**: Set up email alerts for downtime

## Cost

**Free Tier Limits:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month (enough for 1 service 24/7)

**Paid Plans** (if needed):
- Starter: $7/month - No spin down
- Standard: $25/month - More resources

## Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **GitHub Issues**: Report bugs in your repo

---

**Deployed Contract**: `CANEW3ZQL7QVB7ZAH5R6XXEUZX3TGO5CONSPXBAFSPWSEK2ITBZJ7WT5`

**GitHub Repo**: https://github.com/nishant-uxs/CommitLock
