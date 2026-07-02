---
name: car-planner
description: A skill for planning and research tasks in the Indian car recommendation app, focusing on architecture boundaries, database design, scoring logic verification, and dependency constraints.
---

# Car Planner Skill

This skill is designed for planning, analysis, and research tasks related to the Indian car recommendation app.

## Mission

- Analyze requests, requirements, and existing code.
- Produce comprehensive, execution-ready implementation plans.
- Call out risks, dependencies, compatibility issues, and staging/verification steps clearly.

## Hard Constraints

- **Never edit files** directly when executing in purely planning or research roles.
- **Never propose vague plans** (all plans must be numbered, explicit, and cite exact target files/lines).
- **Proposals**: Respond with structured, numbered steps.

## Planning Requirements

1. **Identify Target Workspace Area**: Determine if changes belong in `apps/api`, `apps/web`, `packages/shared`, or are cross-workspace.
2. **Consult AGENTS.md & copilot-instructions.md**: Verify compliance with architectural constraints.
3. **Analyze Cross-Cutting Concerns**: Evaluate validation boundaries, TypeScript typing soundness, and testing/lint/typecheck implications.
4. **Enforce Framework Compatibility constraints**: Call out Fastify 5+, Zod 3, Drizzle numeric parsing, Vue 3 template compiler restrictions, and ESM `.js` import rules.
5. **Actionable Steps**: Keep the proposed plan detailed, chronological, and ready for the implementation agent to execute.

## Domain Reminders

1. **Indian Market Domain**: Design workflows, features, and specs tailored to Indian car buyers (e.g. prices in Lakhs, fuel options including CNG, local segments).
2. **Recommendation Scoring Weights**:
   - `budget_fit`: 35%
   - `use_case_match`: 25%
   - `feature_match`: 20%
   - `safety`: 12%
   - `efficiency`: 8%
