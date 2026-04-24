# Screenshots Folder

Save screenshots with these exact filenames so README links work:

| Required File | What to Capture |
|---------------|-----------------|
| `metrics-dashboard.png` | Full `/metrics` page with KPI cards, charts, and data |
| `monitoring-dashboard.png` | Full `/monitoring` page with health checks and log stream |
| `landing-page.png` | Homepage with Metrics/Monitoring buttons (optional) |
| `dashboard.png` | Main dashboard showing reservations (optional) |

## How to Take Screenshots

1. Run the app: `cd frontend && npm run dev`
2. Open http://localhost:3000
3. Navigate to `/metrics` → press `F12` or use browser screenshot (full page)
4. Navigate to `/monitoring` → same
5. Save PNGs in this folder with the filenames above
6. Commit + push: `git add docs/screenshots/ && git commit -m "docs: add dashboard screenshots" && git push`
