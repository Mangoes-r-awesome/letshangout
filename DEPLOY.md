# Hangouts v0.2 — Auth, Squads, Admin

This drop adds:
- **Phone OTP login** (`/login`) — Supabase Auth + SMS via their built-in Twilio
- **Onboarding** (`/onboarding`) — pick name + emoji
- **App home** (`/app`) — list your squads
- **Squad creation** (`/app/squad/new`) — name, emoji, auto-generates invite code
- **Shareable invite links** (`/join/[code]`) — works for non-users (sends to login first)
- **Squad detail page** (`/app/squad/[id]`) — see members, copy/share invite link
- **Admin console** (`/admin`) — waitlist count, signups chart, recent signups (only for `is_admin` users)
- **Middleware** — gates `/app` and `/admin`, refreshes session cookies
- **RLS policies** — proper data isolation between squads

## Files to merge into the existing repo

```
lib/supabase-browser.ts          NEW
lib/supabase-server.ts           NEW
lib/schema-002-auth.sql          NEW (run in Supabase SQL editor)
middleware.ts                    NEW
app/login/page.tsx               NEW
app/onboarding/page.tsx          NEW
app/admin/page.tsx               NEW
app/app/page.tsx                 NEW
app/app/join/page.tsx            NEW
app/app/squad/new/page.tsx       NEW
app/app/squad/[id]/page.tsx      NEW
app/join/[code]/page.tsx         NEW
app/api/auth/send-otp/route.ts   NEW
app/api/auth/verify-otp/route.ts NEW
app/api/auth/signout/route.ts    NEW
app/api/squads/create/route.ts   NEW
app/api/squads/join/route.ts     NEW
components/SignOutButton.tsx     NEW
components/InviteLink.tsx        NEW
components/JoinButton.tsx        NEW
package.json                     UPDATED (adds @supabase/ssr)
```

## Deploy order (do these IN SEQUENCE)

### 1. Enable phone auth in Supabase

1. Supabase Dashboard → Authentication → Providers → **Phone**
2. Toggle ON
3. Choose **Twilio** as SMS provider (recommended) OR Supabase's built-in test mode for dev
4. If using Twilio:
   - Twilio Console → buy an Australian number (~AUD $6/mo) and get `Account SID`, `Auth Token`
   - Paste into Supabase phone auth config
   - Set message template: `Your Hangouts code is {{ .Code }}`
5. Save

> **Dev shortcut**: While testing, you can use Supabase's Test OTP feature — set a fixed `123456` code for a fixed phone number under Auth → Phone → Test OTP. Saves money + makes development much faster.

### 2. Run the SQL migration

Supabase Dashboard → SQL Editor → New query → paste `lib/schema-002-auth.sql` → Run.

This adds:
- `is_admin` to users
- `invite_code` to squads
- Auto-create users row on signup (trigger)
- RLS policies on everything

### 3. Install the new package

```bash
npm install @supabase/ssr
```

### 4. Push to GitHub, Vercel auto-deploys

```bash
git add .
git commit -m "v0.2: phone auth, squads, invites, admin"
git push origin main
```

### 5. Make yourselves admins

After you and Max each log in (you'll need to do this once to create your `users` rows), run in Supabase SQL editor:

```sql
update public.users
set is_admin = true, name = 'Alex', emoji = '🦁'
where phone = '+614XXXXXXXX';

update public.users
set is_admin = true, name = 'Max', emoji = '🦊'
where phone = '+614YYYYYYYY';
```

Now `/admin` is accessible to both of you. Middleware blocks everyone else.

## How you log in

Once deployed: `https://hangouts.app/login` → enter your phone → enter the 6-digit code from the SMS → done.

If it's your first login the flow auto-redirects to `/onboarding`. After that you land on `/app`.

## How troubleshooting works

**80% of issues**: Supabase Dashboard
- Table Editor → inspect/edit any row
- Auth → Users → see all signed-up users, manually verify or delete
- Logs → API logs, auth events, errors
- SQL Editor → query anything

**20% of issues**: Vercel Dashboard
- Deployments → see every build, every error
- Logs (Functions tab) → real-time logs from API routes
- Settings → env vars

**Custom admin UI**: `/admin` page in the app — currently shows waitlist + signup chart. Add specific buttons here only when you find yourself wishing for them.

## What's next

Now that auth works:
- Hangout creation flow (date, location, cost, etc.)
- Squad Stats view (the leaderboard)
- Twilio integration for nudges (separate from auth SMS)
- Cron job for the nudge engine
- Calendar OAuth sync

— AT
