# Deploy Power Coffee Investor Dashboard to GitHub Pages

## What's Been Built
- **Location**: `/Users/lacerdareis/powercoffee-investor-dashboard/`
- **Tech**: Vite + React + Tailwind CSS
- **Data**: Fetched from Google Sheets (219 rows of financial projections)
- **Build**: Already built locally — `dist/` folder contains production assets
- **Workflow**: `.github/workflows/deploy.yml` configured for GitHub Actions

## Deploy Steps

### 1. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `powercoffee-investor-dashboard`
3. Choose Private (recommended) or Public
4. ❌ Do NOT check "Add a README"
5. ❌ Do NOT add .gitignore or license
6. Click **Create repository**

### 2. Push the Code
Open Terminal and run:

```bash
cd /Users/lacerdareis/powercoffee-investor-dashboard

# Option A — HTTPS (requires GitHub Personal Access Token)
git remote add origin https://github.com/YOUR_USERNAME/powercoffee-investor-dashboard.git
git branch -M main
git push -u origin main
# When prompted for password, use your PAT

# Option B — SSH (requires SSH key added to GitHub)
git remote add origin git@github.com:YOUR_USERNAME/powercoffee-investor-dashboard.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Note**: If you don't have Git identity set up locally:
```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

### 3. Configure GitHub Pages
1. Go to repo Settings → Pages
2. **Source**: select `GitHub Actions`
3. **Workflow**: choose `Deploy to GitHub Pages`
4. Click **Save**

The workflow will start automatically. Monitor it under the **Actions** tab.

### 4. Access the Dashboard
Once the workflow completes (green checkmark), visit:

```
https://YOUR_USERNAME.github.io/powercoffee-investor-dashboard/
```

Allow 1-2 minutes for CDN propagation on first deploy.

## Dashboard Features
- 18-month projection model (unit economics, repurchase & growth)
- KPI cards: Revenue, Active Units, Gross Margin, CAC, LTV, Burn
- Revenue waterfall chart (SVG-based, no chart library bloat)
- Stainless-steel design with steel-blue accents

## Updating the Data
When the Google Sheet changes:

```bash
cd /Users/lacerdareis/powercoffee-investor-dashboard
python3 scripts/fetch_sheet.py   # Pulls fresh data into src/data.json
npm run build                    # Rebuilds locally
git add src/data.json dist/
git commit -m "Update investor data from sheet"
git push origin main
```

The GitHub Actions workflow will redeploy automatically.

## Need Help?
- GitHub PAT: Settings → Developer settings → Personal access tokens → Classic → Generate new token (check `repo` scope)
- SSH keys: `ssh-keygen -t ed25519 -C "you@example.com"` then add the public key to GitHub
