# Power Coffee — Investor Dashboard

Interactive financial dashboard built from the live Google Sheets model.

## Features

- 18-month revenue projection with unit growth and repurchase curves
- Monthly cost breakdown (AI, marketing, warehouse, COGS, logistics)
- EBITDA and profitability tracking
- CAP table (pre and post-funding)
- Dark theme optimized for investor presentations

## Tech Stack

- React 18 + Vite
- Vanilla CSS (no frameworks)
- Data sourced from Google Sheets → static JSON

## Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:5173

## Build for Production

\`\`\`bash
npm run build
\`\`\`

Output goes to \`dist/\`.

## Deploy to GitHub Pages

1. Create a new GitHub repository (public or private)
2. Push this project to the \`main\` branch
3. Enable GitHub Pages → Source: GitHub Actions → select "Deploy to GitHub Pages" workflow
4. The site publishes at \`https://<username>.github.io/<repo>/\`

## Data Source

Financial data is stored in \`src/data.json\`, auto-generated from the master Google Sheet:

https://docs.google.com/spreadsheets/d/1cECO9T_Pet00U3O1jERMCAjXRobWWu-FQV_rfGMbeoA/

To refresh data, run the included Python script (requires Google OAuth token):
\`python scripts/fetch_sheet.py\`
