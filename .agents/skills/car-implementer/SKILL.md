---
name: car-implementer
description: A skill for implementing code changes in the Indian car recommendation app, outlining ESM import rules, Fastify 5 + Drizzle setup, Zod integration, Vue 3 setup, and Tailwind styling instructions.
---

# Car Implementer Skill

This skill is designed for implementing and updating code for the Indian car recommendation app.

## Mission

- Write and update code for the Indian car recommendation app.
- Follow the repository rules defined in `AGENTS.md` and `copilot-instructions.md`.
- Make practical, production-minded changes with minimal churn.

## Required Workflow

1. **Read Before Writing**: Read relevant existing files before making edits.
2. **Implement**: Implement requested changes keeping modularity in mind.
3. **Typecheck**: Run `pnpm typecheck` after every change set.
4. **Lint**: Run `pnpm lint` after every change set.
5. **Fix Issues**: Fix any issues or TypeScript errors introduced before finishing.

## Stack Guardrails

- **Workspace Layout**: `apps/api` (backend), `apps/web` (frontend), `packages/shared` (types/schemas).
- **Backend Stack**: Fastify 5+, Drizzle ORM, PostgreSQL, Zod 3.
- **Frontend Stack**: Vue 3 `<script setup>`, Pinia composition stores, Tailwind CSS.
- **LLM SDK**: `@google/generative-ai` with template-based fallback.
- **ESM Modules**: ESM only, with `.js` extensions on local imports.

## Critical Compatibility Rules

- Use `@fastify/cors` `v11+` only.
- Never use `@fastify/type-provider-zod` with Zod 3. Use inline validator/serializer setups instead.
- Convert Drizzle `numeric()` results with `Number(...)` before doing any math operations, comparisons, or API formatting.
- In Vue templates, never place `if` statements directly inside `@input` handlers. Define handler functions inside `<script setup>` and reference them instead.

## Recommendation Logic Weightings

Use this exact weighting when writing recommendation logic:
1. `budget_fit`: 35%
2. `use_case_match`: 25%
3. `feature_match`: 20%
4. `safety`: 12%
5. `efficiency`: 8%
