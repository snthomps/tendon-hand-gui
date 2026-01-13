# Intern Quick Reference Guide

Welcome! This is your quick-start guide for contributing to the project.

## 🚀 First Time Setup (Do Once)

### 1. Accept Invitation
- Check your email for GitHub invitation
- Click link and accept

### 2. Clone Repository
```bash
git clone https://github.com/[manager-username]/tendon-hand-gui.git
cd tendon-hand-gui
npm install
```

### 3. Test It Works
```bash
npm start
# Should open at http://localhost:3000
```

### 4. Configure Git (if not done)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 📋 Daily Workflow

### Starting a New Task

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull origin main

# 2. Create a new branch (use descriptive name)
git checkout -b feature/your-feature-name
# Examples:
# feature/add-export-button
# fix/graph-rendering-bug
# docs/update-readme

# 3. Start coding!
```

### While Working

```bash
# Save your work often (every 30-60 min or after completing a subtask)
git add .
git commit -m "Clear description of what you did"

# Examples of good commit messages:
# "Add CSV export button to Time Series page"
# "Fix axis labels on mapping plot"
# "Update README with new installation steps"

# Push to GitHub (your branch is backed up!)
git push origin feature/your-feature-name
```

### Creating a Pull Request

1. Push your branch: `git push origin feature/your-feature-name`
2. Go to GitHub repository page
3. You'll see a yellow banner: **"Compare & pull request"** - click it
4. Fill in:
   - **Title**: Clear summary (e.g., "Add CSV export functionality")
   - **Description**: What you changed and why
   - Reference any issues: "Fixes #12" or "Related to #8"
5. Click **Create pull request**
6. Wait for review!

### After Review

**If changes requested:**
```bash
# 1. Stay on your feature branch
git checkout feature/your-feature-name

# 2. Make the requested changes

# 3. Commit and push
git add .
git commit -m "Address review comments: [what you fixed]"
git push origin feature/your-feature-name

# 4. PR automatically updates! Comment on GitHub that you addressed feedback
```

**If approved and merged:**
```bash
# 1. Go back to main
git checkout main

# 2. Pull the merged changes
git pull origin main

# 3. Delete old branch (cleanup)
git branch -d feature/your-feature-name

# 4. Start next feature!
```

## 🔄 Staying Up to Date

### Before Starting New Work Each Day
```bash
git checkout main
git pull origin main
```

### If Your Branch Gets Behind Main
```bash
# Update main first
git checkout main
git pull origin main

# Go to your branch
git checkout feature/your-feature-name

# Merge in latest changes
git merge main

# If there are conflicts:
# 1. Open the files with conflicts
# 2. Look for <<<<<<, ======, >>>>>> markers
# 3. Edit to keep the right code
# 4. Remove the markers
# 5. Save the file
# 6. git add <filename>
# 7. git commit -m "Resolve merge conflicts"
# 8. git push
```

## 📝 Branch Naming Convention

Use these prefixes:
- `feature/` - New features (e.g., `feature/add-dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/servo-slider-bug`)
- `docs/` - Documentation (e.g., `docs/improve-readme`)
- `refactor/` - Code improvements (e.g., `refactor/simplify-plotting`)

## 💬 Communication

### On GitHub
- **Comment on issues** when you start working on them
- **Ask questions** in PR comments if stuck
- **Tag your manager**: Use `@their-username` to get attention

### Finding Work
1. Check **Issues** tab for assigned tasks
2. Look for `good-first-issue` label if starting out
3. Ask if you finish early: "What should I work on next?"

## 🆘 Common Problems & Solutions

### Problem: Can't push
```bash
# Solution: Make sure you're on your branch, not main
git branch  # Shows current branch (should have * next to your branch)

# If on main by accident:
git checkout feature/your-feature-name
```

### Problem: Made changes on wrong branch
```bash
# Solution: Stash changes and move them
git stash  # Saves your changes temporarily
git checkout feature/correct-branch
git stash pop  # Brings changes back
```

### Problem: Want to undo last commit but keep changes
```bash
git reset --soft HEAD~1
```

### Problem: Want to completely discard local changes
```bash
git checkout -- filename  # Specific file
git checkout .  # All files
```

### Problem: Accidentally committed to main
```bash
# DON'T PUSH! Instead:
git reset --soft HEAD~1  # Undo commit, keep changes
git checkout -b feature/my-feature  # Create proper branch
git add .
git commit -m "Your message"
git push origin feature/my-feature
```

## ✅ Before You Leave Each Day

Daily checklist:
- [ ] Commit your work (even if not done)
- [ ] Push to GitHub: `git push origin feature/your-feature-name`
- [ ] Update any relevant issues with progress
- [ ] If you're blocked, leave a comment for your manager

## 🎯 Good Practices

**DO:**
- ✅ Commit often (at least every hour)
- ✅ Write clear commit messages
- ✅ Test your changes before creating PR
- ✅ Ask questions early if confused
- ✅ Keep branches focused (one feature per branch)

**DON'T:**
- ❌ Push directly to main
- ❌ Commit without a message: `git commit` (no -m flag)
- ❌ Leave your work only on your computer (push to GitHub!)
- ❌ Merge your own PRs without approval
- ❌ Copy-paste large amounts of code without understanding it

## 📞 Need Help?

1. Check this guide first
2. Google the error message
3. Ask in PR/issue comments on GitHub
4. Tag your manager: `@their-username I'm stuck on X`
5. Send a message directly

## 🎓 Learning Resources

- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write Good Commit Messages](https://chris.beams.io/posts/git-commit/)

---

## Quick Command Reference Card

```bash
# Status and info
git status              # What changed?
git branch              # What branch am I on?
git log --oneline       # Recent commits

# Basic workflow
git pull                # Get latest
git checkout -b branch  # New branch
git add .               # Stage changes
git commit -m "msg"     # Save changes
git push origin branch  # Upload to GitHub

# Branch management
git checkout branch     # Switch branch
git branch -d branch    # Delete branch

# Undo/fix
git stash               # Save work temporarily
git stash pop           # Restore saved work
git reset --soft HEAD~1 # Undo last commit
```

---

**Remember**: It's better to ask questions than to guess! Your manager wants you to succeed. 🚀

Good luck! You've got this! 💪
