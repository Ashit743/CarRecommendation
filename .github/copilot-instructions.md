---
applyTo: "**"
---

# Indian Car Recommendation App Instructions

This repository is an Indian car recommendation app built as a `pnpm` workspace with:

- `apps/api`: Fastify 5+, Drizzle ORM, PostgreSQL, Zod 3
- `apps/web`: Vue 3, Pinia, Tailwind CSS
- `packages/shared`: shared types, schemas, utilities, scoring helpers

## Architecture Rules

- Use ESM everywhere.
- Local TypeScript imports must include the `.js` extension in emitted import paths.
- Keep API, web, and shared code separated by workspace boundaries.
- Prefer moving cross-app schemas, enums, DTOs, and pure utilities into `packages/shared`.

## Backend Rules

- Use Fastify 5+ compatible packages only.
- `@fastify/cors` must be `v11+`. Never use `v8`, which is for Fastify 4.
- Use Zod 3.
- Never use `@fastify/type-provider-zod` with Zod 3.
- For validation, use inline `setValidatorCompiler` / `setSerializerCompiler` patterns instead of type-provider integrations.
- When reading Fastify request bodies, treat `request.body` with explicit type casts or route-local typing. Do not assume inferred body typing from unsupported integrations.
- API error responses must follow this exact shape:

```ts
{ error: string; code: string }
```

- Keep handlers small and move business logic into services/utilities where useful.

## Database Rules

- Use Drizzle ORM with PostgreSQL.
- Model a `cars` table for the main catalog.
- Model a `car_images` table with a foreign key to `cars`.
- Prices are stored in Indian rupees lakh units.
- `safety_stars` is an integer score from `0` to `5`.
- `tags` is a `text[]` column.
- `specs` is a `jsonb` column.
- `segment`, `fuel_type`, and `transmission` must be PostgreSQL enums.
- Important: Drizzle `numeric()` columns come back as JavaScript strings. Always wrap numeric DB values in `Number(...)` before calculations, comparisons, or API response shaping.

## Frontend Rules

- Use Vue 3 with `script setup` only.
- Use Pinia in composition-store style only.
- Use Tailwind CSS only for styling. Do not introduce separate CSS frameworks.
- Prefer strongly typed composables, stores, and API clients.
- Vue template compiler rejects inline `if` statements inside `@input` handlers. Put conditional input logic in component methods/functions declared in `script setup`, then reference those functions from the template.

## LLM Integration Rules

- Use `@google/generative-ai` for LLM-powered recommendation or explanation flows.
- Always provide a template-based fallback when the LLM is unavailable, rate-limited, returns invalid output, or times out.
- Keep prompt construction deterministic and auditable.
- Validate LLM outputs with Zod before using them in application flows.

## Domain Modeling

- The app recommends cars for Indian buyers.
- Respect Indian market terminology, pricing, and ownership considerations.
- Typical recommendation inputs may include:
  - budget
  - city/highway usage
  - family size
  - safety preference
  - fuel preference
  - transmission preference
  - feature priorities

## Scoring Formula

Recommendation scoring must use this weighted formula:

- `budget_fit`: 35%
- `use_case_match`: 25%
- `feature_match`: 20%
- `safety`: 12%
- `efficiency`: 8%

Implement scoring in a transparent way so each component score can be inspected independently.

## Code Style

- Favor small pure functions and shared utilities for business rules.
- Use clear names over abbreviations.
- Avoid hidden magic values; extract constants for weights, limits, and defaults.
- Keep validation close to boundaries.
- Prefer Zod schemas for API payloads, env validation, and LLM output validation.
- Preserve TypeScript correctness and avoid `any` unless there is a strong reason.

## What To Avoid

- Do not use CommonJS.
- Do not omit `.js` extensions from local ESM imports.
- Do not use options API in Vue components.
- Do not use Pinia options stores.
- Do not return ad hoc error shapes from the API.
- Do not perform math directly on Drizzle `numeric()` values without `Number(...)`.
- Do not place complex inline logic directly in Vue templates.
