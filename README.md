# Car Recommendation App

A full-stack car recommendation platform for the Indian market. The app combines a Fastify API, a Vue 3 frontend, and shared TypeScript utilities to recommend cars based on user preferences, browse the catalog, compare vehicles, and view reviews.

## Tech Stack

### Frontend
- Vue 3 with Composition API and `script setup`
- Vite for development and build tooling
- Pinia for state management
- Tailwind CSS for styling
- Vue Router for navigation

### Backend
- Fastify 5 for the API server
- TypeScript for server-side logic
- Drizzle ORM with PostgreSQL
- Zod for validation and schema definitions
- Google Generative AI for recommendation/explanation flows

### Shared Package
- Shared TypeScript types, schemas, and utility logic
- Centralized domain models for the API and web app

### Database & Tooling
- PostgreSQL for persistence
- Drizzle migrations and seeding
- pnpm workspaces for monorepo management
- ESLint for linting

## Project Structure

- `apps/api` — backend API and database logic
- `apps/web` — frontend web application
- `packages/shared` — shared types, schemas, and utilities

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the local database (if needed).

3. Run the API:
   ```bash
   pnpm --filter @car-app/api dev
   ```

4. Run the web app:
   ```bash
   pnpm --filter @car-app/web dev
   ```

## Notes

The app is designed around a monorepo structure with clear separation between API, web, and shared code.
