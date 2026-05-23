# Hangouts v1 — Drop 1: the spine

This drop turns Hangouts from a signup page into a real working product. The squad detail page is no longer a placeholder.

## What's new

- **Premium 8-step onboarding** — replaces the old single-screen onboarding. Hook → pain → magic demo → stats → mission → identity → seed squad → calendar.
- **Hangout creation** — full form: title, emoji, date/time, location, cost, bring, details. Auto-creates RSVPs for every squad member.
- **Hangout detail page** — hero card, RSVP buttons (In / Maybe / Out), squad statuses, nudge buttons per member, agent feed.
- **Real Twilio SMS nudges** — manual button per ghoster, AI-generated tone-adaptive message via Claude, sent via Twilio, logged to nudges table.
- **Inbound SMS webhook** — friends can reply "yeah", "nah cbf", "what time?" and Claude parses it into an RSVP status. Auto-confirms back.
- **Squad Stats page** — live leaderboard with reply rate, confirms, ghoster flags. Computed from real RSVP data.
- **Squad detail page** — now shows upcoming hangouts, stats teaser, deals "coming soon" tile, members, invite link.
- **Deals partnership tile** — coming-soon card with email capture form for vendor signups.
- **Theme toggle** — proper light/dark mode, persisted to user profile + localStorage.
- **Settings page** at `/me/settings`.

## Files to merge into the existing repo

```
lib/schema-003-v1.sql                                    NEW (run in Supabase)
lib/twilio.ts                                            NEW
lib/claude.ts                                            NEW
lib/tokens.ts                                            NEW
components/ThemeProvider.tsx                             NEW
components/ThemeToggleRow.tsx                            NEW
components/RsvpButtons.tsx                               NEW
components/MemberRow.tsx                                 NEW
components/AgentFeed.tsx                                 NEW
components/DealsTeaser.tsx                               NEW
app/onboarding/page.tsx                                  REPLACES v0.2 version
app/app/squad/[id]/page.tsx                              REPLACES v0.2 placeholder
app/app/squad/[id]/hangout/new/page.tsx                  NEW
app/app/squad/[id]/hangout/[hangoutId]/page.tsx          NEW
app/app/squad/[id]/stats/page.tsx                        NEW
app/me/settings/page.tsx                                 NEW
app/api/hangouts/create/route.ts                         NEW
app/api/rsvps/update/route.ts                            NEW
app/api/nudges/send/route.ts                             NEW
app/api/nudges/inbound/route.ts                          NEW (Twilio webhook)
app/api/partnerships/signup/route.ts                     NEW
```

## Deploy steps (in order)

### 1. Run the SQL migration

Supabase Dashboard → SQL Editor → paste `lib/schema-003-v1.sql` → Run.

This adds:
- `users.theme_preference`, `users.has_completed_onboarding`, `users.push_subscription`
- `hangouts.cover_emoji`, `hangouts.last_nudge_at`
- `nudges.triggered_by`, `nudges.triggered_by_user`
- `partnership_signups` table
- Updated `squad_stats` view with `confirms` and `total_rsvps`

### 2. Set up Twilio (~30 min, can run in parallel with everything else)

If you haven't already:

1. Sign up at twilio.com (use Superhostly's ABN to be safe)
2. **Buy an AU mobile number** with SMS+MMS capability (~AUD $6.50/mo)
3. Twilio Console → **Messaging → Regulatory Compliance → Australia** → submit business profile. Approval 2-5 days. Without this, nudges silently get throttled.
4. Twilio Console → grab **Account SID** and **Auth Token** (Settings → API keys)

### 3. Configure the inbound webhook in Twilio

Twilio Console → Phone Numbers → your number → **Messaging** section:
- "A MESSAGE COMES IN" → Webhook → `https://hangouts.app/api/nudges/inbound`
- HTTP POST

This is how replies get routed back to the app and parsed.

### 4. Get your Anthropic API key

Go to console.anthropic.com → API Keys → Create Key. Copy the `sk-ant-...` value.

### 5. Add env vars in Vercel

Vercel → hangouts project → Settings → Environment Variables, add:

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=+61488123456
ANTHROPIC_API_KEY=sk-ant-...
```

Then redeploy (push any commit or click "Redeploy" in Vercel).

### 6. Make sure Supabase phone auth uses Twilio (not test mode)

If you previously enabled Test OTP mode in Supabase, switch it to Twilio so real users can sign up:
- Supabase → Authentication → Providers → Phone → SMS provider: **Twilio**
- Paste your SID, token, number
- Save

### 7. Install + push

```bash
# In your local hangouts repo, after copying these files in
npm install  # No new deps needed, but verify
npm run build  # Make sure it compiles

git checkout -b feat/v1-spine
git add .
git commit -m "v1: onboarding, hangout creation, RSVP, nudges, stats, theme"
git push origin feat/v1-spine
```

Open the Vercel preview URL on your phone and run through the full flow end-to-end before merging to main.

## End-to-end test loop

Once preview deploys:

1. **Sign up** with your real phone → walk through new onboarding
2. **Create squad** "The Cousins" with 👥
3. **Share invite link** with Max (or a second phone) — verify they can join
4. **Create a hangout** in the squad — fill in all fields
5. **RSVP as "in"** on your account
6. **Switch to other phone** — see the hangout, RSVP as "out" via app
7. **From a phone that hasn't RSVP'd yet** — tap the ⚡ nudge button next to their name
8. **Verify SMS arrives** with AI-generated copy
9. **Reply to the SMS** with "yeah im in" — verify RSVP auto-updates
10. **Check Squad Stats** — leaderboard reflects responses
11. **Toggle theme** in `/me/settings`, verify it persists across reload
12. **Submit a partnership signup** via the deals tile — verify it lands in `partnership_signups` table

If all 12 work, merge to main. You have a real product.

## What's still coming (Drop 2 — week 2)

- **Adaptive nudge cron** — fires every 4hrs, decides who needs chasing automatically
- **Google Calendar OAuth + sync** — auto-detect free times, auto-add confirmed hangouts
- **AI activity suggestions** — "What's next" section with Claude-generated ideas based on past hangouts
- **PWA push notifications** — service worker, subscription flow, push API
- **R U OK? donation flow** — link in settings, monthly donation tracker

## Costs to expect

- Twilio AU number: ~AUD $6.50/mo
- Outbound SMS: ~AUD $0.05 per nudge. 100 nudges/mo = $5
- Inbound SMS: ~AUD $0.0075 per reply (basically free)
- Anthropic API (nudge gen + reply parse): ~$0.003 per nudge. 100/mo = $0.30
- Supabase: free tier covers v1 comfortably
- Vercel: free tier comfortable until ~100K users

**Total v1 monthly running cost at 100 active users: ~AUD $15-20.**

## Troubleshooting

**"Nudge button does nothing"** — check Vercel function logs (Functions tab in Vercel dashboard). Likely TWILIO env vars not set, or compliance not approved yet.

**"SMS arrives but reply doesn't update RSVP"** — check that inbound webhook URL is correct in Twilio Console. Test by sending a manual SMS to your Twilio number from your phone and watching the function logs at `/api/nudges/inbound`.

**"Claude API fails"** — usually ANTHROPIC_API_KEY missing or invalid. Fallback copy will be sent instead, so SMS still goes out, just less personalised.

**"Stats show 0% for everyone"** — RSVPs haven't been answered yet. The reply_rate is `answered/total`. Have your squad respond a few times and refresh.

— AT
