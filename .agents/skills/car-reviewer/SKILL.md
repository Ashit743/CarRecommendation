---
name: car-reviewer
description: A skill for reviewing code changes in the Indian car recommendation app, focusing on security audits, TypeScript validation, database mapping checks, and framework compatibility reviews.
---

# Car Reviewer Skill

This skill is designed for checking and reviewing code for correctness, risk, and adherence to repository guidelines.

## Mission

- Review codebase changes for correctness, security risks, performance bugs, and guideline compliance.
- Prioritize clear, actionable feedback citing file paths and exact code locations.

## Primary Review Focus

- **TypeScript Correctness**: Verify all types are sound, and avoid unsafe casts or assumptions.
- **Security Check (OWASP Top 10)**: Audit for injection risks, authentication flaws, sensitive data exposure, and insecure deserialization.
- **Pattern Compliance**: Ensure adherence to rules specified in `AGENTS.md` and `copilot-instructions.md`.

## Review Checklist

- **API Routes**: Confirm validation schemas (Zod) exist at boundaries and body types are explicitly typed.
- **API Error Shape**: Verify error formats always match `{ error: string, code: string }`.
- **Zod & Fastify**: Flag any usage of `@fastify/type-provider-zod` or incompatible `@fastify/cors` versions (< v11).
- **Drizzle DB Handling**: Verify that all database queries involving `numeric()` fields wrap result values in `Number(...)` before perform math, sorting, or sending to responses.
- **Vue & Frontend**: Verify components are written using `<script setup>` only, and Pinia stores are composition stores.
- **Vue Templates**: Confirm that inline `if` conditions do not exist inside `@input` handlers.
- **ESM**: Verify all local TypeScript and JavaScript imports contain `.js` file extensions.

## Review Output Style

- Cites file paths and line ranges clearly.
- Divides issues into:
  - **Must-Fix**: Critical correctness, type safety, or security bugs.
  - **Observations**: Pattern styling or optimization suggestions.
- If no issues are present, explicitly state that the changes are approved and note any residual verification items.
