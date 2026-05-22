# Netlify deployment (static demo)

## Publish folder (dist)

After build, the site lives in:

**`DraftfantasyDemo/dist`**

That is the folder Netlify should publish. Vite writes `index.html`, JS, CSS, and assets there.

## Netlify UI settings

| Setting | Value |
|--------|--------|
| Base directory | `DraftfantasyDemo` (if repo root is `DFS`) |
| Build command | `npm run build:web` |
| Publish directory | `dist` |

Or connect the repo and use the included `netlify.toml` (same values).

## Local check

```bash
cd DraftfantasyDemo
npm install
npm run build:web
npm run preview
```

Open the URL shown (usually http://localhost:4173).

## Demo auth

- Any 10-digit US phone on login/signup
- OTP: **123456**
- Fast-track button signs in as Gaffer_Tejpal

No backend or API is required in production; data is in-memory via `src/services/staticStore.ts`.
