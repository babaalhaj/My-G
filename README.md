# Bitget Trader Dashboard

A minimal Express backend that serves a static crypto-trading dashboard and
exposes a health-check API for Bitget connectivity. Built to deploy on
Render.com as a Web Service with zero configuration beyond the two settings
below.

## Project structure

```
.
├── server.js              # Express app: static file server + /api/status/bitget
├── package.json           # Dependencies + "start" script Render will run
├── .gitignore
├── README.md
└── public/                # Everything here is served as static files
    ├── index.html          # Dashboard home — links to all tools, live status pill
    ├── Notify.html
    ├── Notify-1.html
    ├── Notify-2.html
    ├── bitget-watchlist.html
    └── js/
        └── status.js       # Polls /api/status/bitget every 30s, updates the dot
```

## Endpoints

| Route                  | Description                                                            |
|-------------------------|--------------------------------------------------------------------------|
| `GET /`                 | Dashboard (`public/index.html`)                                        |
| `GET /api/status/bitget`| Pings Bitget's public time endpoint, returns `{ connected, status, ... }` |
| `GET /healthz`          | Simple `{ ok: true }` — handy for Render's health check setting        |

## Run locally

```bash
npm install
npm start
# → http://localhost:3000
```

## Deploy to Render.com

1. **Push this project to GitHub.** Create a new repo and push these files
   (root of the repo should contain `package.json` and `server.js`).
2. **Create a new Web Service on Render.** From the Render dashboard, click
   **New +** → **Web Service**, then connect the GitHub repo you just pushed.
3. **Configure the service.**
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - Render sets `PORT` automatically — `server.js` already reads
     `process.env.PORT`, so no changes are needed.
4. **(Optional) Set the health check path.** Under the service's *Settings*,
   set **Health Check Path** to `/healthz` so Render can detect crashes.
5. **Deploy.** Click **Create Web Service**. Render will install
   dependencies, run `npm start`, and give you a public URL
   (e.g. `https://your-service.onrender.com`).
6. **Verify.** Visit the URL — you should see the dashboard, and the status
   pill in the header should turn green within a few seconds as it confirms
   Bitget is reachable. You can also hit
   `https://your-service.onrender.com/api/status/bitget` directly to see the
   raw JSON.

Every future `git push` to the connected branch triggers an automatic
redeploy.
