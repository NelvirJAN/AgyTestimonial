---
name: save-progress
description: >-
  Reviews the current session and updates CONTEXT.md with the latest application state, 
  modified files, key architectural decisions, and next steps. Activated on demand or via /saveProgress.
---

# Save Progress Skill (`/saveProgress`)

## Purpose
This skill instructs the agent to review the current development session, inspect all created or modified files, review architectural decisions, and update [`CONTEXT.md`](file:///c:/AntiGravity/AgyTestimonials/CONTEXT.md) in the project root to ensure persistent documentation across turns and sessions.

---

## When to Run
- Triggered whenever the user issues the `/saveProgress` command.
- Triggered when the user asks to "save progress", "update context", or "document current state".
- Recommended at the end of every significant feature implementation, bug fix, or deployment.

---

## Step-by-Step Execution Runbook

### Step 1: Session & Workspace Review
1. **Check Git Status & History:**
   - Run `git status` to identify modified, staged, or untracked files.
   - Run `git log -1 --oneline` to obtain the latest commit hash and message.
2. **Review Turn Conversation & Tool Invocations:**
   - Identify all files created, edited, pushed, or deployed during the session.
   - Summarize the business logic changes, UI enhancements, or architectural decisions made.

### Step 2: Read Existing `CONTEXT.md`
- Read [`CONTEXT.md`](file:///c:/AntiGravity/AgyTestimonials/CONTEXT.md) to preserve existing architectural documentation and structure.

### Step 3: Update `CONTEXT.md` Sections
Ensure the following sections in [`CONTEXT.md`](file:///c:/AntiGravity/AgyTestimonials/CONTEXT.md) are updated accurately:

1. **Metadata Header:**
   - Update `Last Updated` to the current local timestamp.
   - Update `Status` and current `Git Commit` hash.
2. **Current Application State:**
   - Document any changes in the cloud deployment status (Clasp, Web App deployment, GitHub).
   - Update the **Project Inventory** table with any new or modified files, updated line counts, and responsibilities.
3. **Key Architectural Decisions & Changes:**
   - Document any new design choices, API configurations, or safety rails added during the session.
4. **Immediate Next Steps & Open Items:**
   - Refresh the roadmap / open questions so the next turn or agent can pick up where this session left off.

### Step 4: Verification & Git Commit (If Approved)
1. Verify that [`CONTEXT.md`](file:///c:/AntiGravity/AgyTestimonials/CONTEXT.md) has valid markdown formatting, links, and table syntax.
2. If the user requested pushing progress to GitHub, commit and push the updated `CONTEXT.md`.

---

## Standard Prompt Template for `/saveProgress`

When the user types `/saveProgress`, execute the following instructions:

```markdown
1. Inspect the workspace with `git status` and check recent file modifications.
2. Review the actions taken during this conversation session.
3. Update `CONTEXT.md` in the project root:
   - Header metadata (date, commit, version).
   - File inventory (files modified, line counts, responsibilities).
   - Current application state & deployment status.
   - Key architectural decisions made in this session.
   - Concrete next steps.
4. Report a concise bulleted summary of the updates made to `CONTEXT.md`.
```
