# Hangouts 🦁

Stop planning hangouts. Start having them.

The AI agent that pesters your mates until they actually reply.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Supabase** — auth, database, RLS
- **Twilio** — SMS for non-app users
- **Claude API** — nudge generation, RSVP parsing
- **Vercel** — hosting
- **PWA** — installable to home screen, no App Store

## Ship today (30-min deploy)

### 1. Push to GitHub

```bash
cd hangouts-app
git init
git add .
git commit -m "Hangouts v0 — landing page + waitlist"
gh repo create Mangoes-r-awesome/hangouts --public --source=. --push
```

### 2. Set up Supabase

1. Go to https://supabase.com → New project → name it `hangouts`
2. Wait ~2 min for it to provision
3. Project Settings → API → copy `URL`, `anon public key`, `service_role key`
4. SQL Editor → New Query → paste contents of `lib/schema.sql` → Run

### 3. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import `Mangoes-r-awesome/hangouts`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` — from step 2
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from step 2
   - `SUPABASE_SERVICE_ROLE_KEY` — from step 2
4. Deploy

### 4. Custom domain ($55 stage)

In Vercel → Project → Settings → Domains → add your domain. Suggested:
- `hangouts.app` — best name, premium pricing
- `hangouts.club` — community vibe, cheaper
- `gethangouts.com` — fallback, always available

DNS: point A record to `76.76.21.21` and CNAME to `cname.vercel-dns.com`.

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

Open http://localhost:3000

## Roadmap

- **Week 1 (now):** Landing + waitlist live. Collect signups.
- **Week 2:** Auth + squad creation + manual hangouts + push notifs.
- **Week 3:** Twilio SMS line + AI reply parsing.
- **Week 4:** Calendar sync + adaptive nudge engine.
- **v2:** Stripe Connect for split payments (the Bali problem).
- **v3:** Open Mode — friend-of-friend discovery + spontaneous broadcasts.

## Mission

1 in 4 Australians feel lonely. Friendships die from small moments we never get back. Hangouts donates 1% of revenue to R U OK?

Built in Australia 💛

— AT
