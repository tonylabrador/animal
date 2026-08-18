# Animal update subscriptions

Wild Explorer uses Resend Contacts and a dedicated Segment as the subscriber store. Email addresses are never written to the repository. A visitor must confirm a signed, 24-hour email link before receiving release announcements.

## Production setup

1. In Resend, verify the sender domain used by `RESEND_FROM_EMAIL`.
2. Create a Segment for Wild Explorer subscribers and copy its ID into `RESEND_SEGMENT_ID`.
3. Add the variables from `.env.example` to the Vercel Production environment.
4. Generate `SUBSCRIBE_SIGNING_SECRET` and `NEWSLETTER_SEND_SECRET` independently with `openssl rand -hex 32`.
5. Redeploy after adding the variables.

There is no scheduled or automatic newsletter job. A release email is sent only when an operator runs the explicit manual command below. Broadcast names use `wild-explorer-release:<release-id>` as the durable duplicate-send guard.

## Publishing behavior

Running the existing finalize command records a stable release batch automatically:

```bash
node scripts/auto_process_wishlist.js --finalize animal-id-one,animal-id-two
```

Each release keeps the exact animal IDs published together, so multiple releases on one date remain separate emails.

## Manual release email

Always preview an exact release before sending it:

```bash
npm run email:release -- --release 2026-08-16-to-17-launch
```

The preview reads the release manifest and prints every English name, Chinese name, and scientific name. It does not contact the email service.

After checking that exact list, send it deliberately:

```bash
npm run email:release -- --release 2026-08-16-to-17-launch --send
```

The command calls the production `POST /api/admin/send-release` endpoint using `NEWSLETTER_SEND_SECRET`. It accepts only an exact release ID. A release that already has a matching Resend Broadcast is reported as `already_sent` and is not sent again. There is intentionally no force-resend option.

For local endpoint testing, set `NEWSLETTER_SEND_URL=http://localhost:3000`; otherwise the command uses `NEXT_PUBLIC_SITE_URL` or the production site URL.

## Consent and unsubscribe

- New contacts begin as unsubscribed and receive only the confirmation email.
- Confirmation marks the contact subscribed and adds it to the configured Segment.
- Every release Broadcast includes Resend's managed unsubscribe link in both HTML and plain text.
- Subscription requests use same-origin checks, a honeypot, email validation, and a best-effort cooldown. For higher traffic, add a shared edge rate limiter.
