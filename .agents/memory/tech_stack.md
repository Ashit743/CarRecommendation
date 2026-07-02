# Technical Memory: Technology Stack Guidelines

This file maintains the technical configurations, architecture patterns, database structures, and library boundaries for the Car Recommendation App.

## 1. Directory Layout & Roles
The repository is set up as a monorepo workspace managed via `pnpm`:

- **`/apps/api`**: Fastify 5 REST server providing recommendation and health endpoints.
- **`/apps/web`**: Vue 3 + Vite Single Page Application for user interface.
- **`/packages/shared`**: Common interfaces, type guards, and schemas shared between frontend and backend.

---

## 2. Core Stack Details

### Backend Framework
- **Fastify 5+**: Node.js web framework.
- **Validation**: Core validation compile is done inline using native Fastify serializers/validators paired with Zod.
- **Rules**:
  - Never use `@fastify/type-provider-zod` with Zod 3.
  - Require explicit type casting on request payloads: `request.body as QuestionnaireInput`.

### Database layer
- **PostgreSQL & Drizzle ORM**: Used to model catalog tables and perform migrations.
- **Data Types Warning**: Drizzle returns decimal/numeric types as JavaScript `string`s. Any logic involving price comparison, budget checking, or calculations **must** cast these string fields using `Number(car.priceLakh)` first.

### Frontend layer
- **Vue 3**: Single File Components using `<script setup>` tag exclusively.
- **Pinia**: Global state management using Composition style stores.
- **Tailwind CSS**: Utility-first CSS styling framework.

---

## 3. Boundary Schemas & Shared Models
Defined in `/packages/shared/src/index.ts`:

- **`carSchema`**: Represents a catalog entry (pricing in lakhs, specs as jsonb, segments, and images array).
- **`questionnaireInputSchema`**: Enforces user responses. Contains a validation refinement requiring `cityDrivingPercent + highwayDrivingPercent === 100`.
- **`recommendationResultSchema`**: Defines the response array of recommended cars, individual scores, and LLM-generated rationale.

---

## 4. Key Developer Constraints
- **ESM-Only**: All local package imports must write out the `.js` extension (e.g. `import { db } from "./db/client.js"`).
- **Vue Templates**: The Vue template compiler rejects inline logical operations inside event handlers. Place conditional input logic inside functions declared within `<script setup>` block.
- **CORS Setup**: Fastify CORS registration must utilize `@fastify/cors` `v11` or higher.
- **API Errors**: Always use `{ error: string, code: string }` response objects.
