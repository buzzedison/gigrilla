# Gigrilla Web App

Gigrilla is a Next.js application that connects fans, artists, venues, and music services in one marketplace. The web app implements Supabase authentication, a protected fan dashboard, and onboarding flows that will expand to support other profile types.

## Prerequisites

- Node.js 20+
- npm 10+ (the repo includes a lockfile for npm)
- A Supabase project with the `users`, `user_profiles`, and `genres` tables expected by the SQL files in the repo

## Environment Variables

Authentication runs entirely in the browser with Supabase. Create an `.env.local` file in the project root that provides the following variables from your Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="service anon key"
```

Restart `npm run dev` after changing environment variables.

## Install & Run

```bash
npm install
npm run dev
```

The development server runs on `http://localhost:3000`.

## Auth Flow

- All signups are provisioned as the `fan` role. Fans choose between a **Guest Pass** (basic) or **Full Fan Profile** at signup.
- Guest passes (`user_metadata.account_type = "guest"`) can browse, search, and RSVP to invites. The dashboard surfaces an upgrade CTA at `/upgrade` so they can unlock streaming, commerce, messaging, and playlists later.
- Full fan profiles capture legal details (username, DOB, address, payment preference, phone) and store them in `auth.user_metadata`, the `users` table, and a `user_profiles` record with `profile_type = 'fan'`.
- On a successful login, fans are taken straight to `/dashboard`. The dashboard is wrapped in `ProtectedRoute` (`lib/protected-route.tsx`) and will redirect anonymous users to `/login`.
- The Supabase session is managed by `AuthProvider` (`lib/auth-context.tsx`). It provisions the `users` table, maintains the fan profile record, and ensures future upgrades (artist/venue/service/pro) can be attached.

## Project Structure Highlights

- `app/` – Next.js App Router pages and UI components (login, signup, dashboard, genre selection prototype).
- `lib/` – Supabase client helpers, authentication context, and route guards.
- `public/` – Static assets such as the Gigrilla logos.
- `*.sql` – Reference schema and data helpers for aligning Supabase tables with the application expectations.

## Available Scripts

- `npm run dev` – Start the Next.js dev server with Turbopack.
- `npm run build` – Build production assets.
- `npm run start` – Serve the production build.
- `npm run lint` – Run ESLint across the project.

## Next Steps

- Flesh out the dashboard modules for artists, venues, and service providers.
- Connect the genre selection flow to live data once Supabase policies are finalized.
- Add end-to-end tests that exercise signup and login via Supabase's local emulator.
