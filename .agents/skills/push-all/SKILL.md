---
name: push-all
description: >-
  Sequential deployment runbook: Pushes code to Google Apps Script cloud via Clasp first; 
  if successful, commits and pushes all workspace changes to Git and GitHub. Halts immediately on any Clasp error.
---

# Push All Skill (`/pushAll`)

## Purpose
This skill coordinates a safe, sequential deployment process:
1. Pushes local Apps Script files to the Google Apps Script Cloud project via **Clasp**.
2. **Circuit Breaker:** If `clasp push` encounters any error, halts execution immediately and alerts the user. Git commands are strictly prevented from executing.
3. If Clasp succeeds, proceeds to commit and push all project changes to **Git & GitHub**.
4. Enforces plain-English explanations before each command is executed.

---

## When to Run
- Triggered whenever the user enters the `/pushAll` command.
- Triggered when the user asks to "push to both Apps Script and GitHub" or "deploy everywhere".

---

## Mandatory Execution Protocol

### Rule 1: Plain-English Command Explanation
Before running each terminal command in the sequence, output a brief explanation to the user explaining:
- **What** the command does.
- **Why** it is being executed at that specific moment in the workflow.

### Rule 2: Strict Clasp Circuit Breaker
If `clasp push` returns an error, non-zero exit code, or failure message:
- **HALT IMMEDIATELY.**
- Do **NOT** execute any Git staging, commit, or push commands.
- Report the full error output and diagnostic suggestions to the user.

---

## Step-by-Step Runbook

### Step 1: Push to Google Apps Script via Clasp
1. **Explain:**
   > "I will now run `clasp push` to upload our local Apps Script files (`Code.js`, `Form.html`, `Admin.html`, `Wall.html`, and `appsscript.json`) directly to your Google Apps Script cloud project."
2. **Execute:**
   ```bash
   clasp push
   ```
   *(Note: On Windows systems where credentials reside in the user profile, execute outside sandbox boundary `BypassSandbox: true` if credentials are required).*
3. **Verify:**
   - Inspect the command output for errors (e.g. `No credentials found`, `Push failed`, syntax errors, or rejection).
   - If an error occurs, output an alert banner, explain what failed, and **STOP**. Do not proceed to Step 2.

### Step 2: Inspect Workspace Status
1. **Explain:**
   > "Clasp push succeeded. Now I will run `git status` to check all modified, added, and untracked files before committing."
2. **Execute:**
   ```bash
   git status
   ```

### Step 3: Stage Workspace Changes
1. **Explain:**
   > "I will now stage all modified and new project files (`git add .`) to include them in the Git commit."
2. **Execute:**
   ```bash
   git add .
   ```

### Step 4: Commit Workspace Changes
1. **Explain:**
   > "I will now create a Git commit documenting the latest session updates, file additions, and deployment sync."
2. **Execute:**
   ```bash
   git commit -m "<Clear, descriptive message summarizing current session changes>"
   ```

### Step 5: Push Commits to GitHub Remote
1. **Explain:**
   > "I will now run `git push origin main` to synchronize our local commit with the remote GitHub repository."
2. **Execute:**
   ```bash
   git push origin main
   ```

### Step 6: Final Deployment Summary
Output a confirmation report covering:
- **Apps Script Cloud Sync:** Files pushed and timestamp.
- **GitHub Sync:** Commit hash, branch, and remote URL.
