This skill tells the AI how to load and apply the project’s Cursor rules.

## How to use this skill

- Read [cursor-rules](/docs/cursor-rules.md) for the authoritative rules for this project.
- Treat those rules as **project-specific defaults** in addition to any global/system rules.
- Follow them for all work in this repo unless the user explicitly overrides a rule in a request.

## When rules conflict

- System / tool rules > this SKILL > repo `Guidelines.md` > ad‑hoc prompt text.
- If a user request clearly conflicts with [cursor-rules](/docs/cursor-rules.md), briefly note the conflict and follow the user’s explicit instruction.

