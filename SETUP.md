# Dental Pro — Build & Deploy Setup

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (serves unminified source on port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build (port 4000)
npm run preview
```

## Deploy to GitHub Pages

### First-Time Setup

```bash
# 1. Create a new GitHub repo
gh repo create dental-pro --public --source=. --remote=origin

# 2. Initialize git and push
git init
git add .
git commit -m "Initial commit — Dental Pro v1.0"
git branch -M main
git push -u origin main

# 3. Enable GitHub Pages (one-time)
#    Go to: Settings → Pages → Source → "GitHub Actions"
#    Or run:
gh api repos/{owner}/dental-pro/pages -X POST -f build_type=workflow
```

### How It Works

Every push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **Checkout** — pulls latest code
2. **Install** — `npm ci` installs build dependencies
3. **Lint** — validates HTML structure (non-blocking)
4. **Build** — minifies HTML/CSS/JS via `build.js`
5. **Deploy** — publishes `dist/` to GitHub Pages

Pull requests run steps 1-4 (build only, no deploy) so you can verify changes before merging.

### Custom Domain

To use `DentalProAIaaS.ai`:

1. Create `src/CNAME` with content: `DentalProAIaaS.ai`
2. Add DNS records at your registrar:
   - `A` record → `185.199.108.153` (and .109, .110, .111)
   - `CNAME` for `www` → `<username>.github.io`
3. In repo Settings → Pages → Custom domain → enter `DentalProAIaaS.ai`
4. Check "Enforce HTTPS"

## Project Structure

```
dental-pro/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── src/
│   ├── index.html              # Full app (source)
│   └── dental_conditions_db.json
├── dist/                       # Built by CI (not committed)
│   ├── index.html              # Minified app
│   └── 404.html                # SPA fallback
├── build.js                    # Build script (minify + optimize)
├── package.json                # Dependencies & scripts
├── .gitignore
├── .htmlvalidate.json          # Linter config
└── SETUP.md                    # This file
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server (port 3000) |
| `npm run build` | Minify and output to `dist/` |
| `npm run preview` | Serve production build (port 4000) |
| `npm run lint` | Validate HTML structure |
| `npm run clean` | Remove `dist/` directory |
