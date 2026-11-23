# Grade 6 Weekly Planner

A responsive, editable recreation of the Grade 6 weekly timetable, with week-specific todos and notes.

## Features

- Monday–Friday timetable with class, room, duty, information, and notice entries
- Per-week cell and period editing, reset, highlight toggle, and PNG export
- Downloadable JSON schedule layouts with validated upload and replacement confirmation
- Expandable 10-minute break rows with dedicated, week-specific task entries
- Mouse and long-press touch dragging for class entries, with destination confirmation
- Live red current-time line positioned within the matching period on the current school week
- Full-column highlight and “Today” label for the current weekday on the current week
- Week navigation with independent todos and notes
- Automatic browser-local persistence via `localStorage`
- Optional Supabase cloud sync with private email-link accounts and automatic saves
- Per-account row-level security; signed-out use remains browser-local
- Mobile day-by-day schedule and desktop five-day grid
- Installable PWA with automatic service-worker updates

## Run

```bash
npm install
npm run dev
```

## Supabase setup

1. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key. Never put the database password or service-role key in this frontend.
2. In Supabase Dashboard → **SQL Editor**, run the complete contents of `supabase/schema.sql`. This creates `planner_states` and private per-account row-level security policies.
3. In **Authentication → Sign In / Providers**, enable Email. Either enable **Allow new users to sign up**, or create your user manually in **Authentication → Users** if signups remain disabled. For local development, add `http://localhost:5173` to **Authentication → URL Configuration → Redirect URLs**. After publishing, add the published planner URL as well.

Click **Cloud sync**, enter an email address, and open the emailed sign-in link. On the first sign-in, the current browser planner is uploaded when the account has no cloud planner. Subsequent changes save automatically. On another device, sign in with the same email to load the cloud planner.

The single-file offline copy supports local editing and layout transfer. Open the hosted planner to complete email sign-in.

## Production build

```bash
npm run build
npm run preview
```

The static production output is generated in `dist/`.

The build also creates `dist/Grade 6 Weekly Planner.html`, a self-contained offline copy. Download this single file and open it directly in a browser; no installation or web server is required. The online planner also has an **Offline copy** button.

The offline file stores changes in browser-local storage for that file. Its saved data is separate from the hosted planner and from copies saved under other filenames or locations.

**Download layout** saves a complete JSON snapshot of the currently viewed week, including all visible classes, period settings, and break tasks. **Upload layout** validates a layout and asks for confirmation before replacing the currently viewed week’s schedule. Uploading never changes that week’s todos or notes.

## Structure

- `src/data/schedule.ts` — default timetable and weekday definitions
- `src/data/schedule-transfer.ts` — complete layout snapshots and upload validation
- `src/lib/supabase.ts` — publishable-key Supabase browser client
- `src/hooks/use-supabase-auth.ts` — email-link authentication and session handling
- `src/hooks/use-planner-store.ts` — local persistence, cloud sync, and weekly data operations
- `supabase/schema.sql` — private per-account table and row-level security policies
- `src/components/` — timetable, editors, todos, and notes
- `src/App.tsx` — week navigation and application composition

## Storage note

Signed-out data is stored only in the current browser. Signed-in data is also stored in the account’s private Supabase row and syncs between devices. A local backup remains in each browser, so recent changes stay available if cloud sync is temporarily unavailable.
