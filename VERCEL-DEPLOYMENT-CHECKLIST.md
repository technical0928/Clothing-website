# Vercel Deployment Checklist — Noor-e-Multan

> Prepared before delivery. This project = **Next.js frontend** (this repo root, deploys to Vercel) +
> **separate Express API** (`server/` folder, MUST be hosted separately — Vercel cannot run it).

---

## ⚠️ THE MOST IMPORTANT FACT

**This project = Next.js frontend (repo root) + Express API (`server/` folder).**

Two hosting options:

| Option | Website | API | Card needed |
|---|---|---|---|
| **A — Recommended** | Vercel | Render (free) | Render needs card for some new accounts |
| **B — All on Vercel** | Vercel (root `/`) | Vercel (root `server/`, serverless) | ✅ No card — one platform |

**Option B is now fully supported**: the API was converted to a Vercel serverless
function (`server/api/index.js` + `server/vercel.json`). On Vercel the app is exported
instead of `app.listen`, logs go to stdout (read-only FS), uploads go to `/tmp`
(ephemeral), and `.env` writes are skipped.

The frontend reaches the API through `NEXT_PUBLIC_API_BASE_URL` (env var). The API allows
the frontend through CORS using `FRONTEND_URL` + `NEXTAUTH_URL` env vars.

---

## ✅ Already fixed for deployment (this session)

- [x] **Hardcoded `localhost:3001` removed** from frontend:
  - `app/(dashboard)/admin/bulk-upload/page.tsx`
  - `components/BulkUploadHistory.tsx`
  - Now use `config.apiBaseUrl` like the rest of the app.
- [x] **`pnpm-lock.yaml` created** inside the repo (was missing entirely → Vercel build would be non-deterministic).
- [x] **`pnpm-workspace.yaml` added** (self-contained: `.` + `server`) so Vercel resolves deps with the lockfile.
- [x] `server/.env` confirmed **gitignored** (secrets will NOT be pushed to GitHub).
- [x] Root `.env` confirmed gitignored.
- [x] All product/demo images (`public/demo/`, 13 files) are **committed to git** → they display on Vercel.
- [x] **`ContactMessage` model added to BOTH schemas** (`prisma/schema.prisma` + `server/prisma/schema.prisma`) — the API on Render generates its own client from `server/prisma/schema.prisma`, so the contact-messages feature would crash without it.

---

## Step 1 — Push to GitHub

1. Create a new GitHub repo. **Recommendation: PRIVATE** (client project, business logic, future secrets).
   - Note: this repo already contains a pre-made `README.md` and a harmless `.github/workflows/blank1.yml` (just echoes "Hello world" — safe to keep or delete).
2. Push:
   ```bash
   git add -A
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/noor-e-multan.git
   git push -u origin main
   ```
   (Ask Codebuff to do this for you — never run it yourself unless you know it's safe.)

---

## Step 2 — Deploy the API (Render, free tier)

Create an account at render.com → **New → Web Service** → connect the GitHub repo.

- **Root Directory:** `server`
- **Build Command:** `npm install --ignore-scripts && npx prisma generate --schema prisma/schema.prisma`
  - ⚠️ `--ignore-scripts` is REQUIRED — the `express-rate-limit` package ships a
    `prepare` script that calls `husky`, which is not installed, so a plain
    `npm install` fails the build with `'husky' is not recognized`.
    With `--ignore-scripts` the package installs fine; the Prisma client is then
    generated explicitly by the `prisma generate` step.
- **Start Command:** `npm start` (runs `node app.js`)
- **Instance Type:** Free

### API environment variables (Render → Environment):

```
DATABASE_URL=<your Neon connection string>
NODE_ENV=production
PORT=10000              (Render sets this automatically — optional)
FRONTEND_URL=https://noor-e-multan.vercel.app
NEXTAUTH_URL=https://noor-e-multan.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=technicalsothikhan0928@gmail.com
SMTP_PASS=<your Gmail app password — the one you set up>
SMTP_FROM=Noor-e-Multan <technicalsothikhan0928@gmail.com>
SMTP_SECURE=false
```

⚠️ **Do NOT set `ALLOW_DEMO_OTP`** on Render/Vercel — that flag exists ONLY for local testing.
Without it, the OTP never appears in API responses (only in the real email).

> ⚠️ Free-tier disk note: Render free instances have **ephemeral storage** — product images
> uploaded through the admin panel will be lost when the API redeploys. For delivery,
> either (a) accept this for demo, or (b) move uploads to Cloudinary/S3 later.
> The 13 demo product images and the 2 pre-committed uploads ARE in git, so the storefront
> always shows them.

---

## Step 3 — Deploy the Website (Vercel)

vercel.com → **Add New → Project** → import the same GitHub repo.

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `/` (repo root)
- **Build Command:** `prisma generate && next build` (from package.json — auto-detected)
- **Install Command:** leave default (Vercel detects pnpm via `pnpm-lock.yaml`)

### Website environment variables (Vercel → Settings → Environment Variables):

```
DATABASE_URL=<your Neon connection string>
NEXT_PUBLIC_API_BASE_URL=https://noor-e-multan-api.onrender.com
NEXTAUTH_SECRET=<any long random string — same one you use locally>
NEXTAUTH_URL=https://noor-e-multan.vercel.app
NODE_ENV=production
```

**Important:**
- `NEXT_PUBLIC_API_BASE_URL` is baked into the client bundle at build time → set it BEFORE the first build.
- `NEXTAUTH_URL` must be the exact Vercel domain (login breaks if it mismatches — we hit this locally).
- No SMTP vars needed on Vercel — emails are sent by the API host, not the website.

---

## Step 4 — Database (Neon — already synced)

No migration reset. Schema is already live in Neon (we used `prisma db push` earlier).
Both `prisma/schema.prisma` (website) and `server/prisma/schema.prisma` (API) point to the
same Neon `DATABASE_URL`. If you ever change the schema:

```bash
cd server && npx prisma db push --schema prisma/schema.prisma
# and for the website schema:
npx prisma db push --schema prisma/schema.prisma
```

Do NOT use `prisma migrate reset` in production — it deletes data.

---

## Step 5 — After deployment, test this flow

1. Open `https://noor-e-multan.vercel.app` → homepage shows products & images.
2. Shop → filters → product details → add to cart → checkout.
3. Login as admin → `/admin` dashboard → stats show real Neon counts.
4. Admin → Users → promote/demote a user (Make admin / Remove admin).
5. Admin → Products → add a product with image → appears on the site (ISR refresh after ~30s).
6. **Forgot password:** login page → forgot password → code arrives at
   `technicalsothikhan0928@gmail.com` **by email** (NOT on screen — verify the demo banner is gone).
7. Change password → log in with new password.

---

## Step 6 — Post-deploy watch-outs

| Issue | Why | Fix |
|---|---|---|
| API build fails with `'husky' is not recognized` | express-rate-limit `prepare` script runs husky | Use `npm install --ignore-scripts` in the Render build command (already in `server/vercel.json` + `server/.npmrc`) |
| API build fails `prisma: command not found` (exit 127, only ~32 packages installed) | Broken `server/package-lock.json` — 15 pnpm-style `link` entries pointing into the root pnpm store don't exist on Vercel | Lockfile regenerated clean (commit `0e8a2d5`) — do NOT regenerate it with local npm 11 while the root `pnpm-lock.yaml` exists, or the links come back |
| Login says "Invalid email or password" | `NEXTAUTH_URL` mismatch | Set exact Vercel domain in Vercel env |
| Products don't show after admin add | ISR caches 30s | Wait 30s or click a revalidate trigger |
| New admin-uploaded images vanish | Render free disk ephemeral | Use Cloudinary/S3 for uploads (optional) |
| Forgot-password code appears on screen | `ALLOW_DEMO_OTP=true` leaked to prod | Remove that var from all cloud envs |

---

## Secrets checklist (never commit)

- [ ] `.env` — gitignored ✅
- [ ] `server/.env` — gitignored ✅
- [ ] Gmail app password — only in Render env vars, never in code/git
- [ ] `NEXTAUTH_SECRET` — keep the same value across Vercel and local
