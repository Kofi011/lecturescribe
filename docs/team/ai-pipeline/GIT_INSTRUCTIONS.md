# Git Workflow — AI Pipeline

**Your branch: `dev/ai-pipeline`**

## Rules

1. **Only commit and push to `dev/ai-pipeline`.** Never push to `dev` or `main` directly.

2. **One task from TASKS.md = one commit.** Use prefixes:
   - `feat:` — new feature, model integration, or pipeline step
   - `fix:` — bug fix
   - `chore:` — config, cleanup, tooling
   - `docs:` — documentation only

3. **Push to `dev/ai-pipeline` as soon as a task is done and tested:**
   ```bash
   git add .
   git commit -m "feat: implement dual-engine routing logic"
   git push origin dev/ai-pipeline
   ```

4. **When a meaningful chunk of work is ready** (e.g. end of a phase), open a PR from `dev/ai-pipeline` into `dev` for the lead to review.

5. **Don't merge your own PR.** Wait for lead review and approval.

6. **Pull from `dev` regularly** to stay in sync with frontend and backend work:
   ```bash
   git checkout dev/ai-pipeline
   git pull origin dev
   ```

7. **If you hit a merge conflict**, resolve it on your branch before opening the PR.

## Quick Reference

```bash
# Start your day
git checkout dev/ai-pipeline
git pull origin dev

# Work on a task
# ... make changes ...
git add .
git commit -m "feat: short description"
git push origin dev/ai-pipeline

# Ready for review
# → Open PR: dev/ai-pipeline → dev (on GitHub)
```
