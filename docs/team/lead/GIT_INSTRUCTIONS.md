# Git Workflow — Team Lead

**Your branch: `dev/lead`**

## Rules

1. **Commit your own work to `dev/lead`.** Never push directly to `main`.

2. **One task from TASKS.md = one commit.** Use prefixes:
   - `feat:` — new feature or infrastructure
   - `fix:` — bug fix
   - `chore:` — config, cleanup, tooling
   - `docs:` — documentation only

3. **Push to `dev/lead` as soon as a task is done and tested:**
   ```bash
   git add .
   git commit -m "chore: configure deployment env vars on Render"
   git push origin dev/lead
   ```

4. **Open a PR from `dev/lead` into `dev`** for your own work — same as everyone else.

5. **You are the only one who merges PRs into `dev`** (including your own, after self-review).

6. **You are the only one who merges `dev` into `main`:**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

7. **Pull from `dev` regularly** to stay in sync:
   ```bash
   git checkout dev/lead
   git pull origin dev
   ```

## Lead-Only Responsibilities

- Review and merge all team PRs into `dev`
- Merge `dev` → `main` after testing and team sign-off
- Keep root `docs/TASKS.md` status in sync with team progress
- Break ties on scope decisions and cross-role conflicts
- Own deployment, infrastructure, and end-to-end testing

## Quick Reference

```bash
# Start your day
git checkout dev/lead
git pull origin dev

# Work on a task
# ... make changes ...
git add .
git commit -m "chore: short description"
git push origin dev/lead

# Review a teammate's PR
# → On GitHub: review PR from dev/{role} → dev
# → Approve and merge

# Deploy
git checkout main
git merge dev
git push origin main
```
