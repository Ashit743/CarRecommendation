# Workspace Customization Rules: Indian Car Recommendation App

This file defines the project-scoped rules and constraints for all AI agents working in this workspace.

## 1. General Architecture & Ecosystem

- **Build System & Package Manager**: The project is a `pnpm` workspace.
- **ESM-Only**: Use ESM everywhere. Do not use CommonJS (`require`, `module.exports`).
- **ESM Import Extensions**: Local TypeScript imports must include the `.js` extension in emitted import paths. For example, use `import { foo } from "./foo.js";` instead of `import { foo } from "./foo";`.
- **Workspace Boundaries**: Keep API (`apps/api`), web (`apps/web`), and shared code (`packages/shared`) separated.
- **Shared Code Sharing**: Move cross-app schemas, enums, DTOs, and pure utilities into `packages/shared`.

---

## 2. Backend Rules (`apps/api`)

- **Fastify version**: Use Fastify 5+ compatible packages only.
- **Fastify CORS**: `@fastify/cors` must be `v11+`. Do not use `v8`.
- **Validation Library**: Use Zod 3.
- **No Type Provider Integration**: Never use `@fastify/type-provider-zod` with Zod 3.
- **Validator/Serializer Compiler Setup**: For validation, use inline `setValidatorCompiler` / `setSerializerCompiler` patterns instead of type-provider integrations.
- **Request Body Types**: When reading Fastify request bodies, treat `request.body` with explicit type casts or route-local typing. Do not assume inferred body typing from unsupported integrations.
- **API Error Responses**: Must always follow this exact shape:
  ```json
  {
    "error": "Detailed error message",
    "code": "ERROR_CODE"
  }
  ```
- **Handler Structure**: Keep handlers thin. Move business logic into services/utilities where useful.

---

## 3. Database Rules

- **ORM & DB**: Use Drizzle ORM with PostgreSQL.
- **Catalog Schema**: Model a `cars` table for the main catalog.
- **Image Schema**: Model a `car_images` table with a foreign key to `cars`.
- **Pricing Units**: Prices are stored in Indian rupees lakh units.
- **Rating Bounds**: `safety_stars` is an integer score from `0` to `5`.
- **Tags & Specs**: `tags` is a `text[]` column. `specs` is a `jsonb` column.
- **Database Enums**: `segment`, `fuel_type`, and `transmission` must be PostgreSQL enums.
- **Drizzle Numeric Types**: Drizzle `numeric()` columns come back as JavaScript strings. **Always** wrap numeric DB values in `Number(...)` before calculations, comparisons, or API response shaping.

---

## 4. Frontend Rules (`apps/web`)

- **Vue Version**: Use Vue 3 with `<script setup>` only. Do not use options API.
- **State Management**: Use Pinia in composition-store style only (no options stores).
- **Styling System**: Use Tailwind CSS only for styling. Do not introduce separate CSS frameworks.
- **Types**: Prefer strongly typed composables, stores, and API clients.
- **Vue Template Compiler constraints**: Vue template compiler rejects inline `if` statements inside `@input` handlers. Put conditional input logic in component methods/functions declared in `<script setup>`, then reference those functions from the template.

---

## 5. LLM Integration Rules

- **SDK**: Use `@google/generative-ai` for LLM-powered recommendation or explanation flows.
- **Fallback Rule**: Always provide a template-based fallback when the LLM is unavailable, rate-limited, returns invalid output, or times out.
- **Prompts**: Keep prompt construction deterministic and auditable.
- **Output Validation**: Validate LLM outputs with Zod before using them in application flows.

---

## 6. Recommendation & Scoring Formulas

Indian car recommendation scoring must use this weighted formula:
- `budget_fit`: 35%
- `use_case_match`: 25%
- `feature_match`: 20%
- `safety`: 12%
- `efficiency`: 8%

Implement scoring transparently so each component score can be inspected independently.

---

## 7. What to Avoid (Strict Prohibitions)

- **NO** CommonJS imports or missing `.js` extensions on local ESM paths.
- **NO** Options API in Vue.
- **NO** Options stores in Pinia.
- **NO** Ad-hoc error shapes from the API.
- **NO** Direct mathematical operations on Drizzle `numeric()` fields without wrapping in `Number(...)`.
- **NO** Inline conditional expressions inside `@input` handlers in Vue templates.
