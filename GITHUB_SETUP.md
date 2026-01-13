# GitHub Repository Setup Instructions

## Step-by-Step Guide to Create Your Repo

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in details:
   - **Repository name**: `tendon-hand-gui` (or your preferred name)
   - **Description**: "Interactive GUI for tendon-driven robotic hand control"
   - **Visibility**: Public (or Private if preferred)
   - **Initialize**: Do NOT check any boxes (no README, .gitignore, or license)
4. Click **"Create repository"**

### 2. Organize Your Local Files

Create this folder structure on your computer:

```
tendon-hand-gui/
├── public/
│   └── index.html
├── src/
│   ├── tendon_hand_with_plots.jsx
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .gitignore
├── package.json
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── SETUP.md
```

**File placement from downloads:**
- `index.html` → goes in `public/` folder
- `tendon_hand_with_plots.jsx`, `App.js`, `App.css`, `index.js`, `index.css` → go in `src/` folder
- All other files → go in root directory

### 3. Initialize Local Git Repository

Open terminal/command prompt in your project folder:

```bash
# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit: Phase 1 tendon-driven hand GUI"

# Connect to GitHub (replace with YOUR repo URL)
git remote add origin https://github.com/yourusername/tendon-hand-gui.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Verify Upload

1. Refresh your GitHub repository page
2. You should see all files uploaded
3. The README.md should display automatically

### 5. Enable GitHub Pages (Optional)

To host your app on GitHub Pages:

1. In your repository, click **Settings**
2. Scroll to **Pages** section (left sidebar)
3. Under "Source":
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

Then deploy:
```bash
npm install --save-dev gh-pages
npm run deploy
```

Your app will be live at: `https://yourusername.github.io/tendon-hand-gui`

### 6. Customize Repository

#### Update package.json
Replace these fields with your information:
```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "url": "https://github.com/yourusername/tendon-hand-gui.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/tendon-hand-gui/issues"
  },
  "homepage": "https://github.com/yourusername/tendon-hand-gui#readme"
}
```

#### Update LICENSE
Replace `[Your Name]` with your actual name

#### Update README.md
Replace placeholder URLs with your actual GitHub username

### 7. Add Topics/Tags

On your GitHub repo:
1. Click ⚙️ (gear icon) next to "About"
2. Add topics: `robotics`, `react`, `tendon-driven`, `hand-control`, `visualization`
3. Add description and website URL

### 8. Ongoing Development

**Daily workflow:**
```bash
# Make changes to files

# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

**Branching workflow:**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit

# Push branch
git push origin feature/new-feature

# Create Pull Request on GitHub
```

## Common Git Commands

```bash
# Check current status
git status

# See commit history
git log --oneline

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout main

# Pull latest changes
git pull

# View remote URL
git remote -v

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename
```

## Collaborating

### Adding Collaborators
1. Go to Settings → Collaborators
2. Click "Add people"
3. Enter GitHub username or email

### Accepting Contributions
1. Others fork your repo
2. They make changes and submit Pull Request
3. You review and merge

## Protecting Your Main Branch

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✓ Require pull request reviews
   - ✓ Require status checks to pass
3. Save changes

## Resources

- [GitHub Docs](https://docs.github.com)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Pages Guide](https://pages.github.com/)

---

## Quick Reference Card

### First Time Setup
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Regular Updates
```bash
git add .
git commit -m "Your message"
git push
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

That's it! Your project is now on GitHub! 🎉
