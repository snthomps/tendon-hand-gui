# Team Collaboration Setup Guide

Complete guide for adding an intern (or any collaborator) to your GitHub repository.

## Option 1: Direct Collaborator Access (Recommended for Interns)

This gives your intern direct push access to the repository.

### Step 1: Add Collaborator on GitHub

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Collaborators** (left sidebar)
4. Click **Add people** button
5. Enter your intern's:
   - GitHub username, OR
   - Email address (they'll get an invite)
6. Click **Add [username] to this repository**
7. Select permission level:
   - **Write** (recommended): Can push, create branches, open PRs
   - **Maintain**: Can manage issues, but can't change settings
   - **Admin**: Full access (usually not needed for interns)

### Step 2: Intern Accepts Invitation

Your intern will receive an email invitation and needs to:
1. Click the link in the email
2. Click **Accept invitation**
3. They now have access!

### Step 3: Intern Clones Repository

```bash
# Intern runs on their computer:
git clone https://github.com/yourusername/tendon-hand-gui.git
cd tendon-hand-gui
npm install
```

## Recommended Workflow: Feature Branches + Pull Requests

Even with direct access, use this workflow to maintain code quality:

### For You (Repository Owner)

**1. Protect the main branch:**
1. Go to Settings → Branches
2. Click **Add rule**
3. Branch name pattern: `main`
4. Check these options:
   - ✓ **Require pull request before merging**
   - ✓ **Require approvals** (set to 1)
   - ✓ **Dismiss stale pull request approvals when new commits are pushed**
   - Optional: ✓ **Require status checks to pass** (if you set up CI/CD)
5. Click **Create** or **Save changes**

**2. Set up issue templates (optional but helpful):**
1. Go to Settings → Features
2. Under "Issues", click **Set up templates**
3. Add templates for:
   - Bug report
   - Feature request
   - Task/Assignment

### For Your Intern

**Daily Workflow:**

```bash
# 1. Start work on a new feature
git checkout main
git pull origin main
git checkout -b feature/add-new-plot

# 2. Make changes, commit often
git add .
git commit -m "Add preliminary XYZ plot"

# Make more changes...
git add .
git commit -m "Fix plot axis labels"

# 3. Push branch to GitHub
git push origin feature/add-new-plot

# 4. Create Pull Request on GitHub
# Go to repo → "Compare & pull request" button appears
# Or: Pull requests → New pull request

# 5. You review and approve, intern (or you) merges

# 6. After merge, clean up
git checkout main
git pull origin main
git branch -d feature/add-new-plot
```

## Workflow Example

### Scenario: Intern adds a new feature

**Intern's steps:**
```bash
# Day 1: Start feature
git checkout -b feature/export-csv
# ... write code ...
git add src/exportFeature.js
git commit -m "Add CSV export functionality"
git push origin feature/export-csv
# Creates Pull Request on GitHub with description
```

**Your steps:**
1. Get notification of PR
2. Review code on GitHub
3. Leave comments if changes needed
4. Approve PR when ready
5. Merge to main

**Intern continues:**
```bash
# Day 2: Update based on review
git checkout feature/export-csv
# ... make changes ...
git add .
git commit -m "Address review comments: add error handling"
git push origin feature/export-csv
# PR automatically updates
```

## Communication Setup

### 1. Use GitHub Issues for Task Management

**Create issues for tasks:**
```markdown
Title: Add CSV export functionality

Description:
Implement ability to export time series data to CSV file.

Requirements:
- [ ] Create export button in Time Series page
- [ ] Generate CSV with timestamps and all servo data
- [ ] Add download trigger
- [ ] Test with sample data

Labels: enhancement, good-first-issue
Assignee: @intern-username
```

**Intern workflow:**
1. Check **Issues** tab for assigned tasks
2. Comment when starting work
3. Reference issue in commits: `git commit -m "Fixes #12: Add export button"`
4. Close issue when PR is merged

### 2. Use Project Boards (Optional)

1. Go to **Projects** tab
2. Create new project: "Development Roadmap"
3. Add columns:
   - To Do
   - In Progress  
   - In Review
   - Done
4. Add issues to board
5. Drag cards as work progresses

### 3. Set Up Notifications

**For you:**
- Settings → Notifications
- Watch the repository
- Get emails/notifications for PRs, issues, mentions

**For intern:**
- Same as above
- Intern should "watch" the repo

## Code Review Best Practices

### When Reviewing Intern's Code:

**Be constructive:**
- ✅ "Consider extracting this into a separate function for reusability"
- ❌ "This is wrong"

**Ask questions:**
- "What happens if the user clicks this before data loads?"
- "Have you tested this with the edge case we discussed?"

**Use GitHub's review features:**
- Add inline comments on specific lines
- Use "Request changes" vs "Approve" status
- Create review summary with overall feedback

**Example review comment:**
```markdown
Great work on implementing the export feature! A few suggestions:

**Required changes:**
- Line 45: Add error handling for empty data array
- Line 78: This function can be simplified (see suggestion)

**Nice to have:**
- Consider adding a loading spinner during export
- File naming could include timestamp for uniqueness

Overall this is solid! Once you address the error handling, I'll approve.
```

### Intern's Response to Review:
```bash
# Make requested changes
git checkout feature/export-csv
# ... fix issues ...
git add .
git commit -m "Address review: add error handling and simplify function"
git push origin feature/export-csv

# On GitHub, reply to review:
"Fixed! Added try-catch and refactored the export function."
```

## Common Commands for Your Intern

### Creating a cheat sheet for them:

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/my-feature-name

# Save work frequently
git add .
git commit -m "Descriptive message"

# Push to GitHub
git push origin feature/my-feature-name

# Update from main branch
git checkout main
git pull origin main
git checkout feature/my-feature-name
git merge main

# If merge conflicts occur
# 1. Fix conflicts in files
# 2. git add <fixed-files>
# 3. git commit -m "Resolve merge conflicts"
# 4. git push

# Sync with your latest changes
git pull origin main

# See what changed
git status
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename
```

## Setting Expectations

### Create a COLLABORATION.md file in your repo:

```markdown
# Collaboration Guidelines

## Workflow
1. Always work on feature branches
2. Create Pull Requests for all changes
3. Never push directly to main
4. Reference issue numbers in commits

## Branch Naming
- Features: `feature/description`
- Bugs: `fix/description`
- Docs: `docs/description`

## Commit Messages
Use clear, descriptive messages:
- ✅ "Add CSV export button to Time Series page"
- ❌ "Update files"

## Pull Requests
- Write clear descriptions
- List what was changed and why
- Include screenshots if UI changed
- Link to related issues

## Communication
- Comment on issues when starting work
- Ask questions in PR comments
- Use GitHub Discussions for general questions
- Tag @yourusername for urgent reviews

## Review Process
- PRs will be reviewed within 24 hours
- Address all review comments before re-requesting review
- Don't merge your own PRs without approval
```

## Weekly Sync Meetings

Consider regular check-ins:
- **Monday**: Plan the week, assign issues
- **Wednesday**: Mid-week progress check
- **Friday**: Demo completed work, review PRs

## Tools to Consider

### VS Code with GitHub Integration
Both of you install:
- **GitHub Pull Requests and Issues** extension
- View/comment on PRs directly in VS Code
- See assigned issues in sidebar

### GitHub CLI (Optional)
```bash
# Install GitHub CLI
# https://cli.github.com/

# Checkout PR locally
gh pr checkout 12

# Create PR from command line
gh pr create --title "Add feature" --body "Description"

# Review PR
gh pr review 12 --approve
```

## Troubleshooting Common Issues

### Intern gets "Permission Denied"
- Verify they accepted the invitation
- Check their access level (needs Write or higher)
- Ensure they're using their GitHub credentials

### Intern can't push
```bash
# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/yourusername/tendon-hand-gui.git (fetch)
# origin  https://github.com/yourusername/tendon-hand-gui.git (push)

# If wrong, update:
git remote set-url origin https://github.com/yourusername/tendon-hand-gui.git
```

### Merge Conflicts
```bash
# Intern pulls latest main
git checkout feature/my-feature
git pull origin main

# Conflicts appear, fix them manually in files
# Look for <<<<<<, =====, >>>>>> markers

# After fixing:
git add .
git commit -m "Resolve merge conflicts"
git push
```

## Alternative: Fork Workflow

If you want more control, use fork workflow:

1. Intern **forks** your repository (creates copy under their account)
2. Intern clones their fork
3. Intern makes changes in their fork
4. Intern creates PR from their fork to your main repo
5. You review and merge

**When to use:**
- Multiple contributors you don't know well
- Open source project
- Want to review everything before it touches your repo

**Direct collaborator is better for:**
- Small team (1-2 people)
- Intern you're actively mentoring
- Faster workflow

---

## Quick Setup Summary

1. ✅ Add intern as collaborator (Write access)
2. ✅ Protect main branch (require PRs)
3. ✅ Create initial issues for first tasks
4. ✅ Share this guide with intern
5. ✅ Have them clone repo and create first branch
6. ✅ Review their first PR together to establish workflow
7. ✅ Set up weekly sync meetings

That's it! You're ready to collaborate! 🎉
