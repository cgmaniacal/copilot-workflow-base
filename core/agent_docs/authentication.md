<!-- Optional: Only generated when an authentication system is detected during onboarding -->

# Authentication

<!-- ONBOARDING: This doc captures the authentication and authorization strategy for this project.
     Discover the auth scheme in use — do not prescribe a pattern that isn't already present.
     Look for auth middleware, token handling, session management, and role/permission checks. -->

## Auth Scheme

<!-- ONBOARDING: Identify the authentication mechanism in use.
     Options include: JWT (stateless), session cookies (stateful), OAuth/OIDC (third-party),
     API keys, or a managed auth service (Auth0, Clerk, Supabase Auth, etc.).
     Look for auth libraries in package.json and middleware in the server entry point. -->

{{TODO: detected during onboarding}}

## When to Add Auth

Not every project needs authentication. This doc applies when the application has user-specific data, protected routes, or admin functionality.

## Architecture

<!-- ONBOARDING: Document the overall auth flow:
     1. How does a user prove their identity? (login form, OAuth redirect, API key header)
     2. How is the session or token issued?
     3. How does the server verify identity on subsequent requests?
     4. How is the session/token terminated (logout)?
     Look for auth middleware or guards in the route setup. -->

### Default-Deny vs Per-Route

Document whether the project uses:
- **Default-deny**: a single middleware that blocks all routes except an explicit allowlist
- **Per-route guards**: auth decorators or middleware applied individually to each protected route

{{TODO: detected during onboarding}}

### Middleware Order

<!-- ONBOARDING: Document where in the middleware stack auth verification runs.
     Note what runs before auth (e.g., security headers, request ID) and after (route handlers). -->

{{TODO: detected during onboarding}}

## Token Strategy (if JWT-based)

<!-- ONBOARDING: If the project uses JWTs, document:
     - Access token lifetime and payload contents
     - Whether refresh tokens are used and how they're stored/rotated
     - Where tokens are stored on the client (httpOnly cookie vs memory vs localStorage)
     Prefer httpOnly cookies for token storage — they are inaccessible to JavaScript. -->

{{TODO: detected during onboarding — skip if not JWT-based}}

## Session Strategy (if session-based)

<!-- ONBOARDING: If the project uses server-side sessions, document:
     - Session store (in-memory, Redis, database)
     - Session expiry and renewal strategy
     - Cookie security settings (httpOnly, secure, sameSite) -->

{{TODO: detected during onboarding — skip if not session-based}}

## Password Handling

<!-- ONBOARDING: If the project stores passwords, document the hashing approach.
     Universal rules regardless of library:
     - Use a slow, adaptive hashing algorithm (bcrypt, argon2, or scrypt)
     - Never store plaintext passwords
     - Never log passwords -->

{{TODO: detected during onboarding — skip if passwordless}}

## Role-Based Authorization

<!-- ONBOARDING: Document how roles or permissions are modeled and checked.
     Look for role fields on user models, permission checks in middleware or services,
     and how roles are attached to the authenticated user context. -->

{{TODO: detected during onboarding — skip if no role system}}

## Auth Routes

<!-- ONBOARDING: Document the standard auth endpoints (login, logout, register, refresh, me).
     Note which are public (no auth required) vs protected. -->

| Method | Route | Description | Public |
|--------|-------|-------------|--------|
| {{TODO}} | {{TODO}} | {{TODO}} | {{TODO}} |

## Security Considerations

- Apply stricter rate limits to auth endpoints to prevent brute-force attacks.
- Never return details about why auth failed beyond "invalid credentials" (prevents user enumeration).
- Log authentication failures with enough context to detect attacks, but never log credentials.
