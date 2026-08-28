# Git Workflow — Frontend

**Your branch: `dev/frontend`**

## Rules

1. **Only commit and push to `dev/frontend`.** Never push to `dev` or `main` directly.

2. **One task from TASKS.md = one commit.** Use prefixes:
   - `feat:` — new feature or UI component
   - `fix:` — bug fix
   - `chore:` — config, cleanup, tooling
   - `docs:` — documentation only

3. **Push to `dev/frontend` as soon as a task is done and tested:**
   ```bash
   git add .
   git commit -m "feat: build landing page hero section"
   git push origin dev/frontend
   ```

4. **When a meaningful chunk of work is ready** (e.g. end of a phase), open a PR from `dev/frontend` into `dev` for the lead to review.

5. **Don't merge your own PR.** Wait for lead review and approval.

6. **Pull from `dev` regularly** to stay in sync with backend and AI pipeline work:
   ```bash
   git checkout dev/frontend
   git pull origin dev
   ```

7. **If you hit a merge conflict**, resolve it on your branch before opening the PR.

## Quick Reference

```bash
# Start your day
git checkout dev/frontend
git pull origin dev

# Work on a task
# ... make changes ...
git add .
git commit -m "feat: short description"
git push origin dev/frontend

# Ready for review
# → Open PR: dev/frontend → dev (on GitHub)
```
