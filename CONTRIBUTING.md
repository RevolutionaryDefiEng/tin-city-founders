# External Development Guide

This repository is publicly cloneable at `https://github.com/RevolutionaryDefiEng/tin-city-founders`. A contributor can use Claude Code or another local development environment after authenticating to GitHub with an account that has write access to the repository. Repository access is separate from the application’s runtime secrets; do not place production credentials in source control, prompts, issues, pull requests, or Claude Code configuration.

## Local setup

| Step | Command or action |
|---|---|
| Clone | `git clone https://github.com/RevolutionaryDefiEng/tin-city-founders.git` |
| Enter the project | `cd tin-city-founders` |
| Enable the declared pnpm version | `corepack enable` followed by `corepack prepare pnpm@10.15.1 --activate` |
| Install dependencies | `pnpm install --frozen-lockfile` |
| Configure local variables | Create `.env` manually using [`ENVIRONMENT.md`](./ENVIRONMENT.md), then supply only dedicated local or development values. |
| Run quality checks | `pnpm check` and `pnpm test` |
| Start locally | `pnpm dev` |

The application currently uses **MySQL/TiDB** through Drizzle, not Postgres. `DATABASE_URL` must therefore point to a compatible non-production database before running database-dependent flows or Drizzle commands. The dashboard sign-in tests also require `TCF_PARTNER_DASHBOARD_USERNAME` and `TCF_PARTNER_DASHBOARD_PASSWORD`; use local-only values, never the production credentials.

## GitHub and Claude Code access

Claude Code operates through the GitHub identity configured in its local environment. For read-only work, cloning the public repository is sufficient. To open branches, push commits, or create pull requests, authenticate the local environment with a GitHub account that has write access to `RevolutionaryDefiEng/tin-city-founders`, for example through `gh auth login` or an appropriately scoped personal access token. Do not reuse a token from another machine or commit it to the repository.

Contributors should work on a short-lived branch, run `pnpm check` and `pnpm test` before pushing, and open a pull request against `main`. Changes that alter database schema, OAuth behavior, partner-dashboard authentication, or production deployment settings should be reviewed before merge.

## Install-script note

pnpm may report skipped build scripts for optional native packages such as `esbuild` or `@tailwindcss/oxide`. If a local build fails because an expected native binary is unavailable, run `pnpm approve-builds`, approve only the expected packages, reinstall, and rerun the checks. Do not approve unrelated packages blindly.
