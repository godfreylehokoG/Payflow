# Payflow

Payflow is a Next.js app backed by Supabase.

## Local setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` from `.env.local.example` and fill in your Supabase values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_TEST_MODE=1
```

3. In Supabase SQL Editor, run:
- `supabase/schema.sql`
- `supabase/seed.sql`

4. In Supabase Dashboard:
- Auth > Providers > Phone: enable only when you want real OTP.
- Database > Replication: enable `public.transactions` for realtime updates.

5. Start the app:
```bash
npm run dev
```

## Test mode vs OTP mode

- `NEXT_PUBLIC_SUPABASE_TEST_MODE=1`: bypasses OTP verification and signs in anonymously through Supabase Auth. This still uses real Supabase API and database.
- `NEXT_PUBLIC_SUPABASE_TEST_MODE=0`: uses real SMS OTP (`signInWithOtp` + `verifyOtp`).

## Notes

- Transaction actions (`send`, `withdraw`, `borrow`) use Postgres RPC functions defined in `supabase/schema.sql`.
- If env vars are missing, the app fails fast at startup with a clear error.
