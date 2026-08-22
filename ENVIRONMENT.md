# Local Environment Reference

Create a local `.env` file manually for your own workstation. **Do not commit it.** This repository intentionally does not publish an `.env.example` file through the managed project workflow; that prevents accidental propagation of deployable secret patterns. Use the variable names and non-secret guidance below instead.

| Variable | Required for | Local-development guidance |
|---|---|---|
| `NODE_ENV` | Runtime mode | Use `development` while running `pnpm dev`. |
| `PORT` | Local server port | Optional. The server defaults to `3000` and will try the next available port if needed. |
| `DATABASE_URL` | Drizzle and database-backed flows | Supply a **MySQL/TiDB-compatible**, non-production connection string. The project does not use Postgres. |
| `JWT_SECRET` | Standard auth and Partner Team dashboard sessions | Use a long, unique local value; never share or reuse the production secret. |
| `VITE_APP_ID` | Manus OAuth client flow | Obtain the app ID from the environment that owns the OAuth application. |
| `VITE_OAUTH_PORTAL_URL` | Browser redirect to Manus OAuth | Obtain from the owning OAuth environment. |
| `OAUTH_SERVER_URL` | Server-side OAuth exchange | Obtain from the owning OAuth environment. |
| `OWNER_OPEN_ID` | Owner-aware authorization | Use the intended development owner identifier. |
| `TCF_PARTNER_DASHBOARD_USERNAME` | Partner Team dashboard login and related tests | Use a local-only username. |
| `TCF_PARTNER_DASHBOARD_PASSWORD` | Partner Team dashboard login and related tests | Use a local-only password. |
| `BUILT_IN_FORGE_API_URL` | Forge-backed integration endpoints | Required only when exercising the related integration locally. |
| `BUILT_IN_FORGE_API_KEY` | Forge-backed integration authentication | Use only a properly scoped non-production key. |
| `VITE_ANALYTICS_ENDPOINT` | Browser analytics | Optional; leave unset locally to disable analytics. |
| `VITE_ANALYTICS_WEBSITE_ID` | Browser analytics | Optional; leave unset locally to disable analytics. |

The current code reads these variables from the server process and Vite build environment. Variables prefixed with `VITE_` may be exposed to browser code by Vite, so they must **never** contain secrets. Before running `pnpm test`, set local values for the Partner Team dashboard credentials; otherwise its credential-dependent tests will fail by design.

> Do not copy values from an existing deployed environment into local configuration. Request dedicated development credentials from the system owner instead.
