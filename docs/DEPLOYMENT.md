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
4. Add environment variables (Supabase, Razorpay, etc.) in the Vercel project settings.

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

### Obsolete branch

`update_worker_name_to_linqapp` was used for an older Cloudflare Worker rename flow and is not used for Vercel. You may delete it on GitHub when no longer needed.
