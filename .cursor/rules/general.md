---
alwaysApply: true
---
# Agent Rules: Persistent Memory & Learning

```rule
Always reference `.cursor/rules/technical-overview.md` at the start of a task to align with the system’s architecture and code generation rules. If it is missing or outdated, create or update it before proceeding.
```

# PR Test Generation Requirement

```rule
Before merging any PR that changes behavior, generate regression coverage for the change.

- Preferred: add permanent unit/integration tests in the relevant workspace (`apps/*` or `packages/*`) runnable via `pnpm test` and Turbo `test` task.
- Acceptable fallback: generate a one-off regression script under `apps/*/src/scripts/regression/` (or `apps/*/src/scripts/tests/`). Run it locally/non-interactively, capture output in the PR description (and/or `docs/test-artifacts/<slug>.md`). These scripts may be deleted after validation.
- Requirement: CI must be green (`build`, `lint`, `type-check`, `test`) prior to merge.
- For schema changes: include a quick verification step (seed/backfill check) via script or test to prove migrations run and core queries still work.
```
```rule
Always start by referencing the technical knowledge base document in the codebase. If this is the first chat, make sure to create it and maintain this knowledge base throughout working on this project. Rememeber to update this .md file as you learn new lessons (mistakes, learnings, shortcuts, understandings about deployment, project highlights, etc.)
```

```rule
Always reference previous assistant-user chats within this project folder when performing tasks. Treat prior chats as a source of project knowledge, similar to code comments or documentation.
```

```rule
When a new prompt resembles a previous request or bug fix, summarize the previous resolution and explain how this new task relates or improves on it.
```

```rule
If the user encounters a repeated problem, first check prior chats for how it was previously addressed. Avoid reusing approaches that failed unless explicitly asked.
```

```rule
Apply patterns, naming conventions, and techniques established earlier in the project unless the user requests a change. Maintain consistency.
```

```rule
Ask the user before discarding or overwriting logic that was part of a past assistant-user decision unless it has been explicitly deprecated.
```

```rule
When summarizing the state of the project, incorporate relevant assistant-user conversations and decisions made in chat history.
```

```rule
Treat all prior chats in this project as first-class context. They are as authoritative as README files, inline comments, and code documentation.
```

# Optional Enhancements (Uncomment if desired)

```rule
If you cannot find sufficient context in the current file or prompt, proactively search prior chat history in this project for related instructions or discussions.
```

```rule
Log key decisions and assistant explanations in a `docs/agent-decisions.md` file to create a permanent traceable memory.
```

```rule
Whenever a code change is made, ask the user at the end of implementation if they would like to push the code to the connected Github Repo and deploy the changes. Follow the deployment guides in the codebase if there is one. If not, start to create one. 
```

```rule
Keep in mind we are a google-native development environment (using Gemini, Google Cloud) and our other primary workspaces are Slack, Notion, and Linear.
```

```rule
Following deployment, always think to test if the deployment is effective by opening the google cloud run logs from the CLI and creating testing scenarios for the user to test to verify the code changes while monitoring the logs to check for any debug messages and progress.
```
