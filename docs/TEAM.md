# TEAM.md — LectureScribe Team Structure

## Team Roles

| Role | Branch | Owner | Scope |
|---|---|---|---|
| **Frontend / UI** | `dev/frontend` | TBD | All React pages, components, styling, client-side logic |
| **Backend / API** | `dev/backend` | TBD | Express server, routes, database, auth, validation |
| **AI Pipeline** | `dev/ai-pipeline` | TBD | Groq Whisper, Griot Nano 1 sidecar, LLM notes, tutor |
| **Team Lead** | `dev/lead` | TBD | Infra, deployment, QA, E2E testing, PR review, docs |

## Branch Map

```
main                ← Production. Only lead merges here.
 └── dev            ← Integration branch. PRs land here first.
      ├── dev/frontend     ← Frontend person's working branch
      ├── dev/backend      ← Backend person's working branch
      ├── dev/ai-pipeline  ← AI/ML person's working branch
      └── dev/lead         ← Lead's working branch
```

## Workflow

1. Each team member commits and pushes **only to their own branch**.
2. When a meaningful chunk of work is ready, open a **PR from `dev/{role}` into `dev`**.
3. **The lead reviews and merges PRs into `dev`**. No one merges their own PR.
4. **Only the lead merges `dev` into `main`** — after testing and team sign-off.

## Lead's Extra Responsibilities

- Reviews and merges all PRs into `dev`
- Only person who merges `dev` → `main`
- Keeps root `docs/TASKS.md` status in sync with team progress
- Breaks ties on scope decisions and cross-role conflicts
- Owns deployment, infrastructure, and end-to-end testing
- Maintains `docs/TEAM.md` and project-wide documentation

## Role Documentation

Each team member has a dedicated folder with everything they need:

| Role | Folder | Contents |
|---|---|---|
| Frontend / UI | [`docs/team/frontend/`](docs/team/frontend/) | CONTEXT.md, TASKS.md, GIT_INSTRUCTIONS.md, DESIGN_BRIEF.md |
| Backend / API | [`docs/team/backend/`](docs/team/backend/) | CONTEXT.md, TASKS.md, GIT_INSTRUCTIONS.md |
| AI Pipeline | [`docs/team/ai-pipeline/`](docs/team/ai-pipeline/) | CONTEXT.md, TASKS.md, GIT_INSTRUCTIONS.md |
| Team Lead | [`docs/team/lead/`](docs/team/lead/) | CONTEXT.md, TASKS.md, GIT_INSTRUCTIONS.md |

Hand each person their folder. They read CONTEXT.md first, then follow TASKS.md in order.
