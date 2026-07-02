# Tactical Memory: Workspace Todo List

This file tracks the current completion status, architectural milestones, and planned tasks for the Indian Car Recommendation App.

## Current State Checklist

### 1. packages/shared (Types and Schemas)
- `[x]` Zod models for segments, fuel, and transmission types
- `[x]` Car and CarImage models defined
- `[x]` Questionnaire input validator with city/highway driving percent verification
- `[x]` RecommendationResult schemas defined

### 2. apps/api (Backend)
- `[x]` Fastify server initialization and health endpoint
- `[x]` Inline compilation configurations for Zod validation/serialization
- `[x]` Route `/recommend` using questionnaire schema input validation
- `[x]` LLM fallback logic for mock recommendation responses
- `[ ]` Drizzle schema mappings (`cars`, `car_images`) synced with Shared model types
- `[ ]` Actual database catalog queries for matching models
- `[ ]` Gemini SDK integration for explaining recommendation matches
- `[ ]` Database seed script matching Indian automobile specifications

### 3. apps/web (Frontend UI)
- `[x]` SPA structure with Vite and TS
- `[x]` Vue Pinia store initialization
- `[ ]` Car recommendation form questionnaire page
- `[ ]` Form submit logic connecting API endpoint
- `[ ]` Recommendations dashboard page with detailed breakdown scores

---

## Technical Debt & Guidelines Review

- Ensure that any future database queries wrap `numeric()` values inside `Number(...)` blocks.
- Check that all imports inside `.ts` and `.vue` files include the `.js` extension when targeting local files.
- Run `pnpm lint` and `pnpm typecheck` locally before completing implementation features.
