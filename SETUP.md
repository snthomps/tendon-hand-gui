# Setup Guide

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/tendon-hand-gui.git
cd tendon-hand-gui

# Install
npm install

# Run
npm start
```

App opens at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

Output in `build/` directory.

## Deploy to GitHub Pages

1. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/tendon-hand-gui",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

2. Install and deploy:
```bash
npm install --save-dev gh-pages
npm run deploy
```

## Troubleshooting

- **Port in use?** Run: `PORT=3001 npm start`
- **Install fails?** Delete `node_modules/` and `package-lock.json`, reinstall
- **Build fails?** Check Node version: `node -v` (need 14+)

See [README.md](README.md) for more details.
