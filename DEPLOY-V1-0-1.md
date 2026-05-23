# Hangouts v1.0.1 — Deep links + cross-channel confirms

Small patch on top of v1 Drop 1. Two things:

1. **Deep links in nudges** — every SMS nudge now ends with `hangouts.app/h/X7P2` so friends can tap to RSVP in-app, not just reply to the text.
2. **Cross-channel confirmations** — when someone RSVPs via the app and there's an open SMS nudge sitting in their texts, they get a friendly closing SMS so they don't reply to a stale text two days later.

## Files

```
lib/schema-004-deeplinks.sql           NEW (run in Supabase)
lib/short-code.ts                      NEW
lib/claude.ts                          REPLACES v1 version (130-char limit added)
app/h/[code]/page.tsx                  NEW (deep link resolver)
app/api/hangouts/create/route.ts       REPLACES v1 version (adds short_code generation)
app/api/nudges/send/route.ts           REPLACES v1 version (appends deep link)
app/api/rsvps/update/route.ts          REPLACES v1 version (cross-channel SMS)
```

## Deploy steps

### 1. Run the SQL migration

Supabase Dashboard → SQL Editor → paste `lib/schema-004-deeplinks.sql` → Run.

This adds `hangouts.short_code` and backfills existing rows.

### 2. Add the app URL env var (if not already set)

Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_APP_URL=https://hangouts.app
```

(Or whatever your real domain is. Falls back to `https://hangouts.app` if unset.)

### 3. Push

```bash
git checkout -b feat/deeplinks
# copy the patch files in, replacing the existing ones
git add .
git commit -m "v1.0.1: deep links in nudges + cross-channel confirmations"
git push origin feat/deeplinks
```

Open the Vercel preview, merge once verified.

## Test loop

1. Create a hangout in a test squad
2. From a different phone in the squad, *don't* RSVP yet — leave as pending
3. Back on the organiser account, tap the ⚡ nudge button next to them
4. **Check the SMS** — should now end with `hangouts.app/h/XXXX`
5. **Tap the link in the SMS** — should land directly on the hangout page (after login if needed)
6. **RSVP via the app** — should update normally
7. **Check the second phone for a follow-up SMS** like *"nice — locked you in for [Title] via the app. no need to reply to my earlier text 🎉"*

If steps 4-7 all work, you're good.

## Why this matters

The deep link turns SMS from a one-way nudge into a two-way doorway. Friends without the app installed will see the link, tap it out of curiosity, and onboard via the join flow. SMS becomes a top-of-funnel acquisition channel, not just a nag mechanism.

The cross-channel confirmation closes what would otherwise be a UX gap: if someone got the SMS, then went into the app and RSVP'd, the original SMS would just sit in their phone forever, potentially confusing them days later. Now the conversation closes cleanly across both channels. Friends notice this kind of polish even when they can't articulate why the app "feels better."

— AT
