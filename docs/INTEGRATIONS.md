# Live activity integrations

The portfolio has two optional live-data cards. Neither integration invents fallback statistics or tracks: when a connection is absent, the UI says setup is pending.

The section is disabled by default. After both integrations are configured, set `VITE_ENABLE_LIVE_ACTIVITY=true` in Vercel and redeploy. Until then, neither the Activity navbar link nor the section is rendered.

## WakaTime coding hours

WakaTime explicitly recommends **not** using a secret API key on a public website. This portfolio uses its public embeddable JSON share through a same-origin normalizing function.

### What Emmanuel needs to do

1. Create or sign into a [WakaTime account](https://wakatime.com/).
2. Install the official [WakaTime VS Code extension](https://marketplace.visualstudio.com/items?itemName=WakaTime.vscode-wakatime).
3. Follow the extension prompt to connect the account. The WakaTime API key belongs in VS Code only; do not put it in this repository or send it in chat.
4. Write code normally so WakaTime has activity to report.
5. Open [WakaTime Share](https://wakatime.com/share), create a **Coding Activity** share, and choose **JSON**.
6. Copy the resulting public URL, which resembles:

   ```text
   https://wakatime.com/share/@username/share-id.json
   ```

7. Add that URL to Vercel as `WAKATIME_SHARE_URL`.

The public share URL is not the secret API key. The server function validates that it uses HTTPS, belongs to `wakatime.com`, and starts with `/share/`. It returns only the latest seven daily totals, weekly total, and daily average.

## Spotify current and recently played track

Spotify requires user authorization. The browser never receives the client secret, refresh token, or temporary access token.

### What Emmanuel needs to do

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an application.
2. Add this redirect URI exactly:

   ```text
   http://127.0.0.1:8888/callback
   ```

3. Copy `.env.example` to `.env.local`.
4. Put the app credentials into `.env.local`:

   ```dotenv
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   ```

5. Run:

   ```bash
   npm run spotify:authorize
   ```

6. Open the URL printed by the script and approve these read-only scopes:
   - `user-read-currently-playing`
   - `user-read-recently-played`
7. The helper saves the refresh token directly to ignored `.env.local` with owner-only file permissions. It does not print the token.
8. Add all three Spotify values from `.env.local` directly to the Vercel project’s environment variables.

Never send the client secret or refresh token through chat, email, screenshots, commits, or frontend variables. In particular, do not prefix them with `VITE_`.

## Local development

`npm run dev` runs Vite only, so the cards show their honest connection-pending states. To exercise Vercel functions locally after configuration, use the Vercel CLI:

```bash
vercel dev
```

## Public API contracts

### `GET /api/wakatime`

Returns one of:

- `200 { "status": "ok", ...sanitized activity }`
- `200 { "status": "empty" }`
- `503 { "status": "unconfigured" }`
- `502 { "status": "unavailable" }`

### `GET /api/spotify`

Returns one of:

- `200 { "status": "playing", "track": ... }`
- `200 { "status": "recent", "track": ... }`
- `200 { "status": "empty" }`
- `503 { "status": "unconfigured" }`
- `502 { "status": "unavailable" }`

Only track title, artists, album, allowlisted artwork/link URLs, playback state, duration, and last-played timestamp can reach the browser.
