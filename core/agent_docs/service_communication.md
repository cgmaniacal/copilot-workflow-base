<!-- Optional: Only generated when a client-server API layer is detected during onboarding -->

# Service Communication Patterns

<!-- ONBOARDING: This doc captures how the frontend communicates with the backend, and how
     the backend handles requests, responses, validation, and errors.
     Discover the API style in use — do not prescribe conventions that aren't already present.
     Look at existing route handlers, response shapes, and the frontend's API client. -->

## Overview

<!-- ONBOARDING: Identify the communication style between frontend and backend.
     Common styles: REST/JSON over HTTP, GraphQL, tRPC, gRPC, WebSockets.
     Note where the API contracts are defined (shared types package, GraphQL schema, OpenAPI spec). -->

{{TODO: detected during onboarding}}

## API Design Conventions

<!-- ONBOARDING: Document the URL structure and naming conventions for API routes.
     Look at existing route files and note:
     - Base path prefix (e.g., /api/v1/)
     - Resource naming (plural vs singular)
     - How path parameters are used -->

{{TODO: detected during onboarding}}

## Request/Response Shape

<!-- ONBOARDING: Document the standard shape for success responses, error responses,
     and paginated responses. Look at existing route handlers and response helpers.
     Note whether a wrapper object is used (e.g., { data: ... }) or bare payloads. -->

### Success Response

```
{{TODO: detected during onboarding}}
```

### Error Response

```
{{TODO: detected during onboarding}}
```

### Paginated Response

```
{{TODO: detected during onboarding — skip if not applicable}}
```

## HTTP Conventions (if REST)

<!-- ONBOARDING: Document the HTTP method and status code conventions in use.
     Look at existing routes for the patterns used for list, get-one, create, update, delete. -->

| Action | Method | Success Code |
|--------|--------|-------------|
| List | GET | 200 |
| Get one | GET | 200 |
| Create | POST | 201 |
| Update | PATCH | 200 |
| Delete | DELETE | 204 |

## Frontend API Client

<!-- ONBOARDING: Document how the frontend calls the backend.
     Look for a centralized HTTP client, fetch wrapper, or API client setup.
     Note where auth headers are attached and how errors are handled client-side. -->

{{TODO: detected during onboarding}}

## Input Validation

<!-- ONBOARDING: Document how request input is validated on the server.
     Look for a validation library (Zod, Joi, Yup, Pydantic, etc.) and where schemas live.
     Note whether validation schemas are shared between frontend and backend. -->

{{TODO: detected during onboarding}}

Universal validation rules:
- Trim whitespace from string inputs.
- Apply length limits on all strings to prevent storage abuse.
- Validate and sanitize input at the edge (before business logic runs).
- Never trust client-supplied IDs for authorization — verify ownership in the service layer.

## Error Handling

### Error Classification

| Type | Cause | What to return | What to log |
|------|-------|---------------|-------------|
| Validation error | Bad input from client | Field-level details | Nothing (client's problem) |
| Domain error | Business rule violation | Error code + message | Optional |
| Not found | Resource doesn't exist | 404 + code | Nothing |
| Auth error | Missing/invalid credentials | 401 or 403 + code | Log the attempt |
| Internal error | Bug, infrastructure failure | Generic message | Full stack trace |

**Critical rule:** Never return internal details (stack traces, SQL queries, file paths) to the client. Log them server-side, return a generic message.

### Standard Error Codes

<!-- ONBOARDING: Document the machine-readable error codes used in this project.
     Look for an error code enum or constants file in the shared package or API source. -->

{{TODO: detected during onboarding}}

### Error Flow

1. Route handler validates input (throws validation error if invalid)
2. Service executes business logic (throws domain error for business rule violations)
3. Route handler catches and forwards to error middleware
4. Error middleware classifies the error and returns the standard error shape
5. Frontend API client checks response status and throws typed errors
6. UI component catches and displays a user-facing message
