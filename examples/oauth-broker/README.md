# OAuth Broker — WIF → User OAuth Bridge for Workspace + Apps Script

A production-ready Cloud Run service that bridges Workload Identity Federation
(WIF) container deployments to real per-user Google Workspace identity, without
Domain-Wide Delegation.

Source: [curtiskrygier/appsscript-oauth-broker](https://github.com/curtiskrygier/appsscript-oauth-broker)

## The problem

`scripts.run` and Workspace APIs require a **user** OAuth token. A container
authenticated via WIF has a service account identity — it can reach GCP APIs,
but cannot call Drive, Docs, or Apps Script on behalf of a real user. DWD
bridges this in some environments, but is tightly restricted in enterprise
Google Workspace orgs.

## The solution

```
User (once)
  └─→ broker /auth  ──→  Google OAuth consent
                    ←──  refresh_token
                    stored in Secret Manager keyed by email

Agent (every invocation, no user present)
  └─→ broker /token?email=user@domain.com
        └─ Secret Manager.get(email) → refresh_token
        └─ POST oauth2.googleapis.com/token → access_token
  ←── access_token
  └─→ scripts.run  /  Drive API  /  Docs API  (as the real user)
```

The container uses its WIF-derived service account identity to authenticate to
the broker and to Secret Manager. The user's refresh token handles the Workspace
execution layer. These are two separate identity concerns — WIF handles
infrastructure, OAuth handles Workspace.

## Structure

```
broker/          Cloud Run service (FastAPI)
  main.py        /auth, /auth/callback, /token, /health routes
  requirements.txt
  Dockerfile

agent/           Client utilities for your ADK / Reasoning Engine agent
  auth_utils.py  get_access_token(email), scripts_run(token, fn, params)
  requirements.txt

.env.example     Configuration reference for broker, agent, and gas-fakes local testing
```

## Broker endpoints

| Route | Purpose |
|---|---|
| `GET /auth` | Starts OAuth consent (PKCE). Send users here once. |
| `GET /auth/callback` | Receives auth code, stores refresh token in Secret Manager. |
| `GET /token?email=` | Returns a fresh access token for an enrolled user. Requires `Authorization: Bearer <TOKEN_SERVICE_SECRET>`. |
| `GET /health` | Liveness check. |

## Deploy

**Prerequisites**

- GCP project with Secret Manager API enabled
- OAuth 2.0 Web Application client (with Cloud Run callback URI in allowed redirects)
- Client secret stored in Secret Manager as `oauth-client-secret` (or set `CLIENT_SECRET_ID`)
- Cloud Run service account with `roles/secretmanager.secretAccessor`

```bash
cd broker

gcloud run deploy oauth-broker \
  --source . \
  --region europe-west1 \
  --set-env-vars "PROJECT_ID=YOUR_PROJECT,CLIENT_ID=YOUR_CLIENT_ID,REDIRECT_URI=https://YOUR-SERVICE.run.app/auth/callback,TOKEN_SERVICE_SECRET=$(python3 -c 'import secrets; print(secrets.token_hex(32))')" \
  --no-allow-unauthenticated
```

**Enrol a user** (one-time per user):

```
https://YOUR-SERVICE.run.app/auth
```

**Call from your agent:**

```python
from agent.auth_utils import get_access_token, scripts_run

token = await get_access_token("user@yourdomain.com")
if token is None:
    # user hasn't completed /auth — surface the auth URL
    return f"Please visit {AUTH_SERVICE_URL}/auth to authorise access."

result = scripts_run(token, "myGasFunction", {"param": "value"})
```

## Testing locally with gas-fakes

`AUTH_TYPE=user_oauth` (added in the companion PR) lets you test broker-injected
credentials locally without deploying Cloud Run. Set the three env vars to a
real refresh token obtained from a local broker run or `gcloud auth
application-default login`, and gas-fakes will initialize with that user
identity — the same path production takes.

```bash
export AUTH_TYPE=user_oauth
export GF_OAUTH_CLIENT_ID=your-client-id
export GF_OAUTH_CLIENT_SECRET=your-client-secret
export GF_USER_REFRESH_TOKEN=your-refresh-token

node your-test.js   # Session.getActiveUser().getEmail() returns the real user
```

See `.env.example` for a full configuration reference.

## Security notes

- **PKCE** prevents authorisation code interception even if the redirect URI is
  observed in transit.
- **HMAC-signed state** prevents CSRF on the callback.
- **Bearer secret** on `/token` ensures only your agent can request tokens.
- **Per-user secrets** in Secret Manager: one secret per email, named
  `workspace-token-{email}`. The broker SA has `secretAccessor` only.
- **Revocation**: users can revoke at `myaccount.google.com/permissions`. Clean
  up the Secret Manager entry on `invalid_grant` (the broker handles this
  automatically by returning `auth_required`).
- Refresh tokens don't expire unless unused for 6 months or explicitly revoked.
