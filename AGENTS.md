# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router lives under `app/`, with `app/components/` holding reusable UI (e.g. hero, login, upgrade flows) and route-level files named `page.tsx`. Shared logic such as Supabase auth helpers resides in `lib/`. Static assets, including brand logos, belong in `public/` and the `brand/` directory for design references. Database DDL and helper scripts live in `database/` and the root `*.sql` files—treat them as the source of truth when adjusting schemas or policies.

## Build, Test, and Development Commands
- `npm run dev`: Start the Turbopack-powered development server with hot reload.
- `npm run build`: Produce an optimized production bundle; run before deploying or shipping SQL changes.
- `npm run start`: Serve the built app locally to smoke-test the production build.
- `npm run lint`: Execute ESLint using `eslint.config.mjs`; fix issues before opening a PR.

## Coding Style & Naming Conventions
Code is TypeScript-first with functional React components. Use 2-space indentation, avoid semicolons to match the existing style, and keep Tailwind utility classes grouped by layout → color → state when practical. Name React components and files in PascalCase (e.g. `FullFanUpgrade.tsx`), hooks in camelCase, and route directories with lowercase hyphenated names (e.g. `fan-dashboard`). Run `npm run lint` and autofixes (`npx eslint --fix`) before committing.

## Testing Guidelines
An automated test harness is not yet configured. Document manual QA steps in the PR description and verify key flows (`/signup`, `/dashboard`, `/upgrade`) in `npm run dev`. When introducing tests, prefer React Testing Library for UI and keep them alongside components in `__tests__/` folders; add the necessary script to `package.json` in the same change.

## Commit & Pull Request Guidelines
Use short, imperative commit subjects (e.g. "Add fan dashboard upgrade prompt"). Keep changes focused and reference issue IDs in the body when relevant. Pull requests should include a summary, screenshots or screen recordings for UI updates, SQL migration notes, and any environment variable changes. Ensure Supabase keys stay in `.env.local` and are never committed.
