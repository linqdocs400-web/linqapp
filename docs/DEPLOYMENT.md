# Deployment

This app is a **Vite + React** SPA with **TanStack Router**. Production hosting is **Vercel only**.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | `22.12.0` (see `.nvmrc` and `package.json` `engines`) |
| SPA routing | `vercel.json` (`filesystem` first, then `index.html`) |

## Vercel

1. Import the GitHub repo in Vercel.
2. Set **Framework Preset** to **Vite** (or let `vercel.json` apply).
3. Confirm **Build Command** = `npm run build` and **Output Directory** = `dist`.
4. Add environment variables in Vercel (Preview vs Production).

### Vercel Environment Variables (recommended)

Use **Vercel Preview** for **TEST** and **Vercel Production** for **PROD**.

| Variable | Preview (TEST) | Production (PROD) |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | your TEST project URL | your PROD project URL |
| `VITE_SUPABASE_ANON_KEY` | your TEST anon key | your PROD anon key |
| `VITE_RAZORPAY_KEY_ID` | your Razorpay TEST Key ID (`rzp_test_...`) | your Razorpay LIVE Key ID (`rzp_live_...`) |

Local development uses `.env.local` (copy from `.env.example`) and should point to TEST.

Important: after adding/changing environment variables in Vercel, trigger a redeploy (or push a new commit) so they take effect.

`vercel.json` pins the build/output settings and handles client-side routes (e.g. `/profile`, `/payments`) by serving `index.html` after static assets.

## Cloudflare Workers / Pages (decommission)

The repo **no longer** includes `wrangler.toml` / `wrangler.jsonc`. The app was migrated from Next.js (static export to `out`) to Vite (`dist`). If Cloudflare Workers Builds is still connected to this repository, deployments will **fail immediately** (often `failed in 0s`) because:

- There is no Wrangler config in the repo root.
- The old config pointed at `out`, not Vite’s `dist`.

**Do not re-add Wrangler** unless you intend to host on Cloudflare again.

### Disconnect Cloudflare (required to stop failed checks)

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**.
2. Open the **linqapp** (or linked) project → **Settings** → **Builds**.
3. **Disconnect** the GitHub repository (or delete the project if it is unused).
4. On GitHub: **Settings** → **Integrations** → **Applications** → find **Cloudflare Workers and Pages** → **Configure** → remove access to `linqapp` if the integration should not run on any repo.

After disconnecting, only Vercel should deploy on push to `main`.

## Supabase Edge Functions (TEST + PROD)

This app uses two Edge Functions:

- `create-order`
- `verify-payment`

You must deploy them to **both** Supabase projects and set secrets separately in each project.

### Secrets per Supabase project

Set these in each Supabase project (TEST and PROD) via CLI or dashboard:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Deploy functions

```bash
supabase link --project-ref <test-project-ref>
supabase functions deploy create-order verify-payment

supabase link --project-ref <prod-project-ref>
supabase functions deploy create-order verify-payment
```

### Obsolete branch

`update_worker_name_to_linqapp` was used for an older Cloudflare Worker rename flow and is not used for Vercel. You may delete it on GitHub when no longer needed.
