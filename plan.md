# Phase 3 Frontend Implementation Plan

Status: implementation in progress; Steps 1 through 4 are complete. Step 5 is
awaiting user confirmation.

Last reviewed: 2026-08-29

## Implementation Progress

| Step | Status | Completed |
| --- | --- | --- |
| Step 0: Resolve preflight conditions | Partially complete | - |
| Step 1: Install and configure the frontend foundation | Complete | 2026-08-29 |
| Step 2: Establish the design foundation | Complete | 2026-08-29 |
| Step 3: Implement Supabase authentication | Complete | 2026-08-29 |
| Step 4: Build the typed FastAPI layer | Complete | 2026-08-29 |
| Step 5: Implement organization context and onboarding | Complete | 2026-10-02 |
| Step 6: Build dashboard home and assistant list | Complete | 2026-10-02 |
| Step 7: Implement assistant creation and workspace | Complete | 2026-10-02 |
| Step 8: Implement knowledge management | Complete | 2026-10-02 |
| Step 9: Implement the playground | Complete | 2026-10-02 |
| Step 10: Implement appearance and assistant settings | Complete | 2026-10-06 |
| Step 11: Responsive, accessibility, and theme pass | Complete | 2026-10-06 |
| Step 12: Testing, documentation, and release verification | Not started | - |

Step 1 verification:

- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm test:run`: passed, 2 tests.
- `pnpm test:coverage`: passed.
- Next.js production build: passed with the supported webpack build mode.
- Default Turbopack production build: blocked in the execution sandbox because
  its CSS worker is not permitted to bind an internal port.
- Environment fail-fast behavior: verified without exposing configuration
  values.

Step 2 verification:

- Initialized shadcn/ui for Tailwind CSS 4 with the required Radix-based
  primitives only.
- Added semantic light/dark tokens, tuned state colors, stable shell dimensions,
  reduced-motion behavior, and visible focus treatment.
- Added TanStack Query, Sonner, tooltip, and theme root providers.
- Added the reusable page header, content container, empty/error states,
  skeleton, loading button, and confirmation dialog.
- Added a compact desktop sidebar, accessible mobile Sheet navigation, truthful
  signed-out/organization-empty states, and a skip link targeting main content.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm test:run`: passed, 2 files and 6 tests.
- Next.js production build: passed with webpack; `/` and `/_not-found` are
  statically prerendered.
- Playwright inspected 360x800, 768x1024, 1280x800, and 1600x900 viewports:
  document widths matched each viewport, no visible elements crossed horizontal
  bounds, and the expected mobile/desktop shell was active.
- Mobile navigation, theme switching, and skip-link focus transfer were verified
  in Chromium with no console or page errors. Captured screenshots were manually
  reviewed for phone, tablet, laptop, wide desktop, and open mobile navigation.

Step 3 verification:

- Added separate cookie-backed Supabase browser and server clients using
  `@supabase/ssr` and the publishable-key convention.
- Added Next.js 16 `src/proxy.ts` session refresh with `getClaims()`, refreshed
  cookie propagation, protected-route redirects, and authenticated auth-screen
  redirects. The protected dashboard layout independently verifies claims.
- Added safe same-origin return-path handling so login, signup, callbacks, and
  confirmation links cannot redirect to an external origin.
- Added responsive login and signup flows using React Hook Form and Zod,
  accessible field errors, password visibility, pending states, generic provider
  errors, and email-confirmation feedback.
- Added PKCE code exchange and token-hash email confirmation Route Handlers.
- Added a real account menu and local sign-out flow that clears TanStack Query
  and the selected-organization browser preference before returning to login.
- Google OAuth and password reset were not exposed because provider and reset
  configuration have not been confirmed.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm test:run`: passed, 9 files and 38 tests. Supabase was mocked; no real
  project was called.
- Next.js production build: passed with `/`, `/login`, `/signup`, both auth Route
  Handlers, and Proxy compiled successfully.
- Playwright verified protected redirects, invalid-callback recovery, field
  validation, password visibility, auth navigation, dark mode, and exact-width
  layouts at 360x800, 768x1024, 1280x800, and 1600x900 with no visible overflow
  or application console errors.
- Live credential acceptance remains pending the real Supabase URL/key, allowed
  redirect URLs, email-confirmation template/policy, and a test account.

Step 4 verification:

- Implemented typed FastAPI wire request/response interfaces in `src/types/api.ts`
  and clean camelCase domain models in `src/types/domain.ts`.
- Created structured `ApiError` class in `src/lib/api/errors.ts` supporting HTTP
  status helpers, FastAPI string error details, and FastAPI validation `loc` array
  decomposition with per-field error mapping.
- Implemented centralized API client in `src/lib/api/client.ts` with automatic
  Supabase session Bearer token injection, single 401 token refresh retry, JSON
  body serialization, multipart `FormData` support for PDF uploads, empty 204
  response handling, and `AbortSignal` propagation without leaking credentials.
- Implemented typed endpoint modules with domain mappers:
  `src/lib/api/organizations.ts`, `src/lib/api/assistants.ts`,
  `src/lib/api/documents.ts`, `src/lib/api/chat.ts`, `src/lib/api/me.ts`,
  `src/lib/api/health.ts`, and barrel export `src/lib/api/index.ts`.
- `pnpm typecheck`: passed with 0 errors.
- `pnpm lint`: passed with 0 warnings.
- `pnpm test:run`: passed, 12 test files and 75 unit tests passing.

Step 5 verification:

- Implemented centralized query key factories in `src/lib/query/keys.ts`.
- Implemented organization creation validation schema with 1-120 character constraint in `src/features/organizations/schemas.ts`.
- Implemented `OrganizationContext` and `OrganizationProvider` in `src/features/organizations/organization-context.tsx` with stored ID reconciliation, first-organization fallback, and strict tenant-switch cache isolation (cancelling in-flight requests and evicting old organization queries from TanStack Query cache).
- Implemented `useOrganization` hook in `src/features/organizations/use-organization.ts`.
- Implemented accessible Radix Dialog primitive in `src/components/ui/dialog.tsx`.
- Implemented `CreateOrganizationDialog` with React Hook Form, Zod validation, `LoadingButton`, and `ApiError` normalization in `src/features/organizations/create-organization-dialog.tsx`.
- Implemented `OrganizationSwitcher` in `src/components/layout/organization-switcher.tsx` replacing the placeholder disabled button in the desktop and mobile navigation sidebar.
- Implemented `OrganizationOnboarding` empty state in `src/features/organizations/organization-onboarding.tsx`.
- Updated `src/app/(dashboard)/layout.tsx` to wrap `AppShell` with `OrganizationProvider`.
- Updated `src/components/layout/app-navigation.tsx` to dynamically enable Organization Settings navigation link when an organization is selected.
- Updated `src/app/(dashboard)/page.tsx` to render loading skeleton while fetching, onboarding when 0 orgs, and tenant workspace overview when active.
- Implemented read-only `/settings` page in `src/app/(dashboard)/settings/page.tsx` displaying organization details, copy UUID affordance, and future capabilities note.
- Added comprehensive unit and component test suites:
  - `src/lib/query/keys.test.ts`
  - `src/features/organizations/schemas.test.ts`
  - `src/features/organizations/organization-context.test.tsx`
  - `src/features/organizations/create-organization-dialog.test.tsx`
  - `src/components/layout/organization-switcher.test.tsx`
  - `src/app/(dashboard)/settings/page.test.tsx`

Step 6 verification:

- Implemented `useAssistants` hook in `src/features/assistants/use-assistants.ts` querying `queryKeys.organizations.assistants(orgId)` with automatic enablement based on `selectedOrganizationId`.
- Built `AssistantCard` component with visual primary color indicator, avatar fallback with name initial or logo, truncated description, formatted date, and workspace link in `src/components/assistants/assistant-card.tsx`.
- Built `AssistantListSkeleton` matching the responsive grid geometry in `src/components/assistants/assistant-list-skeleton.tsx`.
- Built full Assistant List page (`/assistants`) with real-time search filtering across names and descriptions, clear-search affordance, zero-assistant empty state, and retryable error state in `src/app/(dashboard)/assistants/page.tsx`.
- Updated Dashboard Home (`/`) with legitimate metrics (`assistants.length` and active tenant), recently updated assistants sorted by `updatedAt` desc (up to 3), and zero-assistant prompt without N+1 queries.
- Dynamically enabled "Assistants" navigation link and "New assistant" button in desktop/mobile navigation when an organization is active.
- Added comprehensive unit and component tests:
  - `src/features/assistants/use-assistants.test.tsx`
  - `src/components/assistants/assistant-card.test.tsx`
  - `src/app/(dashboard)/assistants/page.test.tsx`
  - `src/app/(dashboard)/page.test.tsx`

Step 7 verification:

- Implemented `createAssistantSchema` in `src/features/assistants/assistant-schemas.ts` enforcing 1-100 characters for name, optional 1,000 characters for description, hex color validation, and optional instructions/welcome message.
- Implemented `useAssistant`, `useAssistantDocuments`, and `useCreateAssistant` in `src/features/assistants/use-assistant.ts` with organization-scoped query keys and automatic cache invalidation.
- Created `AssistantWorkspaceNav` in `src/components/assistants/assistant-workspace-nav.tsx` providing local sub-navigation across Overview, Knowledge, Playground, Appearance, and Settings.
- Created `/assistants/new` wizard in `src/app/(dashboard)/assistants/new/page.tsx` with name and description validation, expandable initial customization section, `LoadingButton`, and friendly 403 role-permission error alert.
- Created `/assistants/[assistantId]/layout.tsx` featuring assistant branding header, tab bar, and secure 404 concealment for missing or cross-tenant assistants with recovery navigation.
- Created `/assistants/[assistantId]/page.tsx` displaying real assistant metadata, document count, and quick shortcuts to all workspace tabs.
- Added clean stub pages for `/knowledge`, `/playground`, `/appearance`, and `/settings` to ensure all workspace links are immediately testable and functional without 404s.
- Added comprehensive unit and component test suites:
  - `src/features/assistants/assistant-schemas.test.ts`
  - `src/features/assistants/use-assistant.test.tsx`
  - `src/app/(dashboard)/assistants/new/page.test.tsx`
  - `src/app/(dashboard)/assistants/[assistantId]/layout.test.tsx`
  - `src/app/(dashboard)/assistants/[assistantId]/page.test.tsx`

Step 8 verification:

- Implemented `useDocuments`, `useUploadDocument`, and `useDeleteDocument` in `src/features/documents/use-documents.ts` with organization-scoped query keys and automatic cache invalidation.
- Created `DocumentUploader` in `src/components/knowledge/document-uploader.tsx` with drag-and-drop zone, file picker, client-side prechecks (PDF extension and 10 MiB limit), indeterminate processing spinner without artificial progress, duplicate submit prevention, and specific API error mapping (413, 422, 403).
- Created `DocumentList` in `src/components/knowledge/document-list.tsx` rendering uploaded documents with timestamps, empty state when zero documents exist, loading skeletons, and destructive `ConfirmationDialog` for deletion.
- Updated `/assistants/[assistantId]/knowledge/page.tsx` replacing the placeholder stub with full knowledge ingestion and document management interface.
- Added comprehensive unit and component test suites:
  - `src/features/documents/use-documents.test.tsx`
  - `src/components/knowledge/document-uploader.test.tsx`
  - `src/components/knowledge/document-list.test.tsx`
  - `src/app/(dashboard)/assistants/[assistantId]/knowledge/page.test.tsx`

Step 9 verification:

- Implemented `useChat` in `src/features/chat/use-chat.ts` managing local in-memory session chat, initializing with the assistant's `welcome_message`, 2,000-character input validation, duplicate in-flight submission guard, deduplicated source citation processing, fallback answer handling as standard assistant response (HTTP 200), and preserving failed questions with retry affordance on 502/503/404 errors.
- Created `SourceCitations` in `src/components/playground/source-citations.tsx` providing an expandable disclosure displaying cited document filenames and page numbers.
- Created `ChatMessage` in `src/components/playground/chat-message.tsx` rendering assistant messages (with branding avatar, thinking pulsing animation, multiline answers, and citations) and user messages (with retry affordance on failure).
- Created `ChatInput` in `src/components/playground/chat-input.tsx` with multiline textarea, Enter-to-submit (Shift+Enter for newline), real-time `X / 2,000` character counter turning destructive on over-limit, and disabled states.
- Created `PlaygroundChat` in `src/components/playground/playground-chat.tsx` providing testing session header, document index count badge, focus-preserving auto-scroll, and "Reset chat" button.
- Updated `/assistants/[assistantId]/playground/page.tsx` replacing the placeholder stub with full testing playground, dynamic grounding context banner, and organization-assistant keying to guarantee memory reset on switch.
- Added comprehensive unit and component test suites:
  - `src/features/chat/use-chat.test.tsx`
  - `src/components/playground/source-citations.test.tsx`
  - `src/components/playground/chat-message.test.tsx`
  - `src/app/(dashboard)/assistants/[assistantId]/playground/playground-page.test.tsx`

Step 10 verification:

- Implemented `appearanceSchema` and `settingsSchema` in `src/features/assistants/assistant-schemas.ts` with strict length limits, absolute HTTP/HTTPS URL checks, hex color validation, and customer-facing instructions (strictly without any `system_prompt` field).
- Created `getReadableTextColor` in `src/lib/utils/contrast.ts` for WCAG 2.1 relative luminance calculation to ensure readable dark or light text contrast.
- Added `useUpdateAssistant` and `useDeleteAssistant` hooks in `src/features/assistants/use-assistant.ts` with organization-scoped cache invalidation and updates.
- Added `useUnsavedChanges` hook in `src/features/assistants/use-unsaved-changes.ts` protecting against accidental tab closing or page refresh when forms are dirty.
- Created `AssistantLivePreview` in `src/components/assistants/assistant-live-preview.tsx` displaying an immediate live preview of the assistant header, logo fallback, welcome greeting mockup bubble, and contrast badge.
- Created `AssistantAppearanceForm` in `src/components/assistants/assistant-appearance-form.tsx` supporting live updates, quick color preset swatches, hex picker, delta PATCH computation (only transmitting changed fields), form dirty state warnings, and reset affordances.
- Created `AssistantSettingsForm` in `src/components/assistants/assistant-settings-form.tsx` for updating name, description, and `assistant_instructions` with delta PATCH payloads and 403 Forbidden handling.
- Created `AssistantDangerZone` in `src/components/assistants/assistant-danger-zone.tsx` with modal confirmation requiring typing the assistant name, deletion execution, query cache purging, and recovery redirect to `/assistants`.
- Replaced stubs with full implementations for:
  - `/assistants/[assistantId]/appearance/page.tsx`
  - `/assistants/[assistantId]/settings/page.tsx`
- Added comprehensive unit and component test suites:
  - `src/lib/utils/contrast.test.ts`
  - `src/features/assistants/assistant-schemas.test.ts`
  - `src/features/assistants/use-assistant.test.tsx`
  - `src/components/assistants/assistant-live-preview.test.tsx`
  - `src/components/assistants/assistant-appearance-form.test.tsx`
  - `src/components/assistants/assistant-settings-form.test.tsx`
  - `src/components/assistants/assistant-danger-zone.test.tsx`
  - `src/app/(dashboard)/assistants/[assistantId]/appearance/appearance-page.test.tsx`
  - `src/app/(dashboard)/assistants/[assistantId]/settings/settings-page.test.tsx`

Step 11 verification:

- Tested responsive layout constraints, text containment (`break-words`, `min-w-0`), and adaptable heights on mobile (360px), tablet (768px), and desktop (1280px+).
- Added `prefers-reduced-motion` detection in `src/components/playground/playground-chat.tsx` for smooth scrolling and responsive chat window sizing.
- Added responsive dropzone padding (`p-5 sm:p-8`) and accessible live progress announcements (`role="status"`, `aria-live="polite"`) to `src/components/knowledge/document-uploader.tsx`.
- Connected form inputs in `AssistantAppearanceForm` and `AssistantSettingsForm` with `aria-describedby` linking to error and description IDs (`welcome-message-error`, `assistant-name-error`, etc.).
- Added `aria-label`, `role="group"`, and `aria-pressed` states to color presets in `AssistantAppearanceForm`.
- Added `aria-describedby` to the danger zone confirmation input linking to instructions, and responsive modal width constraints (`w-[calc(100vw-2rem)] sm:max-w-md`).
- Added `role="alert"` / `aria-live="assertive"` to character limit over-boundary warnings in `src/components/playground/chat-input.tsx`.
- Verified WCAG 2.1 AA text contrast across light and dark palettes in `globals.css` and dynamic brand color contrast calculation (`getReadableTextColor`).
- Added dedicated automated accessibility and responsive test suite in `src/components/common/a11y-responsive.test.tsx` (8 new tests, 214 total tests passing).
- `pnpm typecheck`: passed with zero errors (`tsc --noEmit`).
- `pnpm test:run`: passed all 43 test files.

## 1. Goal

Build the first production-quality frontend for the AI Knowledge Assistant as a
Next.js 16 App Router application. The finished flow is:

```text
Supabase authentication
  -> organization selection/onboarding
  -> dashboard
  -> assistant management
  -> assistant overview / knowledge / playground / appearance / settings
```

The frontend will use Supabase only for authentication. FastAPI remains the
authoritative API for organizations, memberships, assistants, documents, chat,
authorization, and tenant isolation.

## 2. Confirmed Starting Point

### Frontend

- The repository is a default `create-next-app` scaffold.
- Installed application dependencies currently contain only Next.js 16.3.3,
  React 19.2.8, React DOM, Tailwind CSS 4, TypeScript, and ESLint.
- Geist is already configured through `next/font`.
- No Supabase, TanStack Query, shadcn/ui, forms, toast, or test setup exists yet.
- No application routes or feature modules exist beyond the starter page.
- The current shell does not expose `node` or `pnpm` on `PATH`; this must be
  resolved before package installation or verification.
- The workspace `.git` directory is empty, so Git status/history cannot
  currently be used to establish a clean baseline.

### Backend Phase 1 and Phase 2

The sibling `../ai-knowledge-assistant` repository confirms:

- JWT bearer authentication backed by Supabase Auth and asymmetric JWKS.
- Roles are `owner`, `admin`, and `member`.
- Cross-tenant resources are concealed with `404`.
- Members can read organizations/assistants/documents and use chat.
- Owners/admins can create, update, and delete assistants and documents.
- PDF ingestion is synchronous and returns only after parsing, embedding, and
  persistence finish.
- Chat is request/response only; there is no streaming or conversation history.
- The grounded fallback is returned as a normal `200` chat response with no
  sources.

## 3. Verified API Contract

Every `/api/v1` request requires:

```http
Authorization: Bearer <Supabase access token>
```

| Method | Endpoint | UI use | Access |
| --- | --- | --- | --- |
| `GET` | `/health` | Optional connectivity check | Public |
| `GET` | `/api/v1/me` | Current user identity | Authenticated |
| `POST` | `/api/v1/organizations` | Create organization | Authenticated |
| `GET` | `/api/v1/organizations` | Organization switcher/onboarding | Authenticated |
| `GET` | `/api/v1/organizations/{organizationId}` | Current organization | Member |
| `POST` | `/api/v1/organizations/{organizationId}/assistants` | Create assistant | Owner/admin |
| `GET` | `/api/v1/organizations/{organizationId}/assistants` | Dashboard/list | Member |
| `GET` | `/api/v1/assistants/{assistantId}` | Assistant workspace | Member |
| `PATCH` | `/api/v1/assistants/{assistantId}` | General/appearance settings | Owner/admin |
| `DELETE` | `/api/v1/assistants/{assistantId}` | Danger zone | Owner/admin |
| `POST` | `/api/v1/assistants/{assistantId}/documents` | PDF upload | Owner/admin |
| `GET` | `/api/v1/assistants/{assistantId}/documents` | Knowledge list | Member |
| `DELETE` | `/api/v1/documents/{documentId}` | Remove knowledge | Owner/admin |
| `POST` | `/api/v1/assistants/{assistantId}/chat` | Playground | Member |

Confirmed model constraints:

| Model/field | Constraint |
| --- | --- |
| Organization `name` | Required, trimmed, 1-120 characters |
| Assistant `name` | Required, trimmed, 1-100 characters |
| `description` | Optional, nonblank when present, max 1,000 characters |
| `welcome_message` | Required, max 500 characters |
| `assistant_instructions` | Required, max 4,000 characters |
| `logo_url` | Optional absolute HTTP/HTTPS URL, max 2,048 characters, no credentials |
| `primary_color` | `#RRGGBB` |
| PDF filename | `.pdf`, sanitized by backend, max stored length 255 |
| PDF size | Backend-configured, currently defaults to 10 MiB |
| Chat `message` | Required, trimmed, max 2,000 characters |

Assistant defaults supplied by the backend are:

```text
welcome_message: Hi! How can I help you today?
assistant_instructions: Answer questions using the provided knowledge base.
primary_color: #2563EB
```

Error handling must support both forms FastAPI can return:

- Application errors: `{ "detail": "human-readable message" }`.
- Request validation errors: `{ "detail": [{ "loc": ..., "msg": ..., "type": ... }] }`.

Important status codes are `401`, `403`, `404`, `409`, `413`, `422`, `502`,
and `503`. Successful deletes return `204` with an empty body.

## 4. Backend Dependencies and Decisions Required Before Integration

These are backend/deployment dependencies, not frontend implementation tasks:

1. **Browser connectivity:** FastAPI currently installs no CORS middleware.
   Prefer a same-origin production reverse proxy. If the browser uses a
   different FastAPI origin, the backend deployment must allow the exact web
   origins, methods, and `Authorization`/`Content-Type` headers.
2. **Role-aware controls:** Organization responses do not include the current
   user's membership role, and there is no membership endpoint. The frontend
   cannot reliably hide manager-only controls until the API exposes a role or
   capability set. FastAPI will still enforce writes; until the contract is
   extended, the UI must handle `403` gracefully and never claim frontend role
   checks are authoritative.
3. **Organization settings:** There is no organization update, delete, member
   list, or invitation endpoint. Phase 3 can provide a read-only organization
   summary only. It must not render fake edit/member controls.
4. **Upload limits:** The backend's configured upload limit is not exposed by an
   endpoint. The frontend may use a documented 10 MiB precheck for immediate UX,
   but `413` remains authoritative and the limit should become API-driven later.
5. **Document state:** Ingestion is synchronous and document responses expose no
   processing state, page count, chunk count, or file size after creation. Show
   an indeterminate upload/processing state only while the POST is pending; do
   not invent queued/indexing states.
6. **Brand asset:** Appearance supports a URL, not file storage. Phase 3 will
   accept `logo_url`; it will not pretend to upload image files.
7. **Supabase configuration:** Confirm the project URL, publishable key, allowed
   redirect URLs, email-confirmation policy/template, and optional Google
   provider before auth acceptance testing.

## 5. Architecture

### Rendering and state ownership

- Use Server Components for route layouts, static page framing, metadata, and
  authenticated layout checks.
- Use focused Client Components for forms, dialogs, organization selection,
  TanStack Query, uploads, chat, tabs, menus, and live appearance preview.
- Use Next.js 16 `src/proxy.ts`, not `middleware.ts`, to refresh Supabase cookies
  and make optimistic route redirects.
- Protect dashboard layouts with server-side `supabase.auth.getClaims()`.
  `proxy.ts` is not the security boundary.
- Use `supabase.auth.getSession()` only when the browser-side centralized API
  client needs the raw access token to forward to FastAPI. FastAPI re-verifies
  every token.
- Keep FastAPI server state in TanStack Query. Do not mirror it in React context.
- Keep only the selected organization ID in organization context. Persist that
  non-sensitive preference in local storage after validating it against the
  fetched organization list. Never store tokens there.

### Proposed source layout

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── assistants/
│   │   │   ├── [assistantId]/
│   │   │   │   ├── appearance/page.tsx
│   │   │   │   ├── knowledge/page.tsx
│   │   │   │   ├── playground/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── page.tsx
│   │   ├── settings/page.tsx
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── auth/
│   │   ├── callback/route.ts
│   │   └── confirm/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── providers.tsx
├── components/
│   ├── assistants/
│   ├── common/
│   ├── knowledge/
│   ├── layout/
│   ├── playground/
│   └── ui/
├── features/
│   ├── assistants/
│   ├── auth/
│   ├── chat/
│   ├── documents/
│   └── organizations/
├── hooks/
├── lib/
│   ├── api/
│   │   ├── assistants.ts
│   │   ├── chat.ts
│   │   ├── client.ts
│   │   ├── documents.ts
│   │   ├── errors.ts
│   │   └── organizations.ts
│   ├── query/
│   │   ├── client.ts
│   │   └── keys.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── proxy.ts
│   │   └── server.ts
│   ├── env.ts
│   └── utils.ts
├── types/
│   ├── api.ts
│   └── domain.ts
└── proxy.ts
```

Feature-local schemas, hooks, and tests should stay with their feature rather
than forcing every file into a global folder.

### API client rules

- Validate `NEXT_PUBLIC_API_BASE_URL` once.
- Inject the bearer token centrally.
- Support JSON and `FormData` without manually setting multipart boundaries.
- Pass `AbortSignal` from TanStack Query to `fetch`.
- Parse JSON only when a response has content.
- Normalize FastAPI string and validation-array errors into a typed `ApiError`.
- On a backend `401`, refresh the Supabase session once and retry once; if it
  still fails, clear user-scoped query data and return to login.
- Never log tokens, request bodies containing document text, or chat context.
- Keep endpoint functions small and typed; do not call raw `fetch` in screens.
- Optionally validate boundary responses with Zod where it adds contract safety.

### Query keys and tenant switching

Use factories rather than hand-written arrays:

```text
["current-user"]
["organizations", "list"]
["organization", organizationId]
["organization", organizationId, "assistants"]
["organization", organizationId, "assistant", assistantId]
["organization", organizationId, "assistant", assistantId, "documents"]
```

On organization switch:

1. Cancel requests under the old `organizationId` prefix.
2. Update the selected organization only after confirming it appears in the
   authenticated organization list.
3. Remove old organization-scoped queries from the cache.
4. Clear assistant-local playground state by remounting on organization and
   assistant IDs.
5. Navigate out of an old assistant workspace to the new organization's home.
6. Start the new organization's queries without `keepPreviousData`.

This UX isolation is additive. FastAPI remains the actual authorization layer.

## 6. Route and Screen Plan

| Route | Purpose |
| --- | --- |
| `/login` | Email/password sign in; optional Google button only when configured |
| `/signup` | Email/password account creation and confirmation feedback |
| `/auth/confirm` | Verify email token hash for SSR/PKCE confirmation |
| `/auth/callback` | Exchange OAuth/PKCE code when OAuth is enabled |
| `/` | Organization-scoped dashboard home |
| `/assistants` | Searchable assistant list and empty state |
| `/assistants/new` | Create assistant form |
| `/assistants/[assistantId]` | Assistant overview and quick actions |
| `/assistants/[assistantId]/knowledge` | PDF upload, list, delete, states |
| `/assistants/[assistantId]/playground` | Local-session chat with sources |
| `/assistants/[assistantId]/appearance` | Welcome message, logo URL, color, preview |
| `/assistants/[assistantId]/settings` | Name, description, instructions, delete |
| `/settings` | Read-only organization summary until update/member APIs exist |

The assistant workspace navigation is local to the assistant. Knowledge,
Playground, Appearance, and Settings do not appear in the global sidebar.

## 7. Design System Direction

- Use Geist with a restrained type scale and no viewport-scaled typography.
- Build a quiet neutral light theme with a deep teal accent, amber for warning,
  and red only for destructive/error states. Avoid a one-hue interface.
- Use white and cool-neutral page surfaces, crisp 1px borders, minimal shadows,
  and card radii no larger than 8px.
- Use dense, scannable operational layouts rather than marketing composition.
- Use Lucide icons for recognizable actions and tooltips for unfamiliar icons.
- Use shadcn/ui as primitives, customized through application tokens.
- Keep desktop sidebar compact; use an accessible Sheet-based navigation on
  smaller screens.
- Use skeletons that match final geometry, inline field errors, retryable error
  states, and specific empty states.
- Establish light mode first. Add `next-themes` and a deliberately tuned dark
  palette only after all primary light-mode screens are stable.
- Use actual assistant logo URLs and live appearance state in previews. Do not
  add decorative stock art, gradients, glass effects, or fake analytics.

## 8. Step-by-Step Delivery Plan

### Step 0: Resolve Preflight Conditions

Tasks:

1. Restore Node.js and `pnpm` 11.24.0 availability in the implementation shell.
2. Confirm the frontend working tree or initialize usable Git metadata outside
   this task if repository history is expected.
3. Decide same-origin API routing versus exact FastAPI CORS allowlisting.
4. Obtain non-secret Supabase URL/publishable key and API base URL.
5. Confirm whether email confirmation and Google OAuth are enabled.
6. Decide whether the backend will expose current membership role for Phase 3.

Gate:

- Package commands run, auth redirect URLs are known, and browser-to-API
  connectivity has an agreed deployment path.

### Step 1: Install and Configure the Frontend Foundation

Tasks:

1. Add `@supabase/supabase-js`, `@supabase/ssr`, TanStack Query, React Hook Form,
   Zod, resolver integration, Sonner, Lucide, shadcn dependencies, and
   `next-themes` if dark mode remains in scope.
2. Add Vitest, jsdom, React Testing Library, user-event, jest-dom, Vite React,
   and path-alias support as development dependencies.
3. Add package scripts for `typecheck`, deterministic unit tests, coverage, and
   selected Playwright tests.
4. Create `.env.example` with placeholders only:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   NEXT_PUBLIC_API_BASE_URL=
   ```

5. Update `.gitignore` so `.env.example` is explicitly trackable while real
   `.env*` files remain ignored.
6. Add runtime/build-time public environment validation with actionable errors.
7. Update the starter metadata and remove generated demo assets when no longer
   used.

Gate:

- A minimal app passes lint, type checking, tests, and production build before
  feature work starts.

### Step 2: Establish the Design Foundation

Tasks:

1. Initialize shadcn/ui for Tailwind CSS 4 and install only required primitives.
2. Define semantic color, typography, radius, border, focus, sidebar, and layout
   tokens in `globals.css`.
3. Build the root providers for TanStack Query, Sonner, tooltips, and theme.
4. Build reusable page header, empty state, error state, skeleton, loading button,
   confirmation dialog, and responsive content container.
5. Build the desktop sidebar and mobile navigation with stable dimensions.
6. Add visible focus states, skip navigation, reduced-motion behavior, and
   accessible dialog/menu labeling.
7. Visually inspect at phone, tablet, laptop, and wide desktop sizes before
   adding feature screens.

Gate:

- The shell has no overflow/overlap, keyboard navigation works, and design tokens
  cover every semantic state without per-screen color improvisation.

### Step 3: Implement Supabase Authentication

Tasks:

1. Add separate browser and server Supabase client helpers using cookie storage.
2. Add the Supabase cookie refresh helper and Next.js 16 `src/proxy.ts` matcher.
3. Use `getClaims()` in the protected dashboard layout and redirect unauthenticated
   requests to `/login`.
4. Redirect authenticated users away from login/signup when appropriate.
5. Build login and signup forms with React Hook Form and Zod.
6. Implement email/password sign-in, sign-up feedback, sign-out, and session
   persistence.
7. Implement email confirmation and OAuth callback routes required by the
   configured Supabase flow.
8. Add Google sign-in only after its provider and redirect URLs are verified.
9. Verify the obtained access token against FastAPI `/api/v1/me` through the
   centralized client.
10. Clear TanStack Query state and selected organization state on sign-out.

Gate:

- Refresh keeps the session, protected routes redirect without loops, sign-out
  clears user data, and FastAPI accepts the forwarded Supabase JWT.

### Step 4: Build the Typed FastAPI Layer

Tasks:

1. Define exact frontend types for current user, organization, assistant,
   document, upload result, chat response, and source.
2. Build the generic authenticated request helper and typed `ApiError`.
3. Implement organization, assistant, document, and chat endpoint modules.
4. Implement field-level conversion for FastAPI validation locations.
5. Handle empty `204` responses, multipart uploads, aborted requests, one-time
   token refresh, and service failures.
6. Add API-layer tests for request shape, bearer headers, validation errors,
   non-JSON failures, 204 handling, and retry behavior.

Gate:

- Components require no direct `fetch`, no token/header duplication exists, and
  representative endpoint/error tests pass.

### Step 5: Implement Organization Context and Onboarding

Tasks:

1. Query `/api/v1/organizations` after authentication.
2. Validate any stored selected organization ID against that list.
3. Choose the first organization only when no valid selection exists.
4. Show a focused create-organization experience when the list is empty.
5. Implement organization creation with 120-character validation.
6. Select the newly created organization and invalidate only the organization
   list/detail queries.
7. Build the organization switcher and apply the tenant-switch cache procedure.
8. Build `/settings` as a read-only summary; add mutation/member UI only if the
   backend contract is extended.
9. Add tests proving that old organization assistants disappear immediately on
   a switch and late old requests cannot repopulate visible UI.

Gate:

- First-time onboarding works and switching from Organization A to B never shows
  Organization A assistants under B.

### Step 6: Build Dashboard Home and Assistant List

Tasks:

1. Query assistants using the selected organization ID in the URL and query key.
2. Build a dashboard greeting, real assistant count, recently updated assistants,
   and legitimate quick actions only.
3. Build the full assistant list with responsive cards/rows, search filtering,
   loading, empty, error, and retry states.
4. Avoid per-assistant document-count requests and unsupported analytics.
5. Ensure opening an assistant always carries the selected organization scope
   into its query key.

Gate:

- Dashboard and list are useful with zero, one, and many assistants, with no
  invented metrics or N+1 request pattern.

### Step 7: Implement Assistant Creation and Workspace

Tasks:

1. Build `/assistants/new` with name and optional description; let backend
   defaults supply welcome message, instructions, and color unless advanced
   fields are intentionally exposed.
2. Submit through the organization-scoped create endpoint.
3. Invalidate the selected organization's assistant list and navigate to the
   created assistant.
4. Build the assistant workspace header and local tab navigation.
5. Build overview content from real assistant fields and document data already
   required by the screen.
6. Handle `404` as a generic unavailable assistant state without revealing
   cross-tenant existence.
7. Handle manager-only write `403` responses clearly until role capabilities are
   exposed.

Gate:

- A user can create, open, navigate, and recover from invalid assistant routes
  without leaking another tenant's data.

### Step 8: Implement Knowledge Management

Tasks:

1. Build the document query and filename/date list.
2. Build a click-to-select and drag/drop PDF uploader.
3. Precheck extension and the documented 10 MiB default for fast feedback while
   preserving backend validation authority.
4. Show an indeterminate upload/processing state and prevent duplicate submits.
5. On success, show the returned processed page/chunk counts in a toast or result
   message, then invalidate the document list.
6. Map invalid PDF, image-only/encrypted PDF, size, provider, and service failures
   to useful messages.
7. Add a destructive confirmation dialog for document deletion.
8. Keep member-readable states functional even when upload/delete returns `403`.
9. Do not show fake indexing progress or persistent processing badges.

Gate:

- Valid PDFs upload and appear, invalid PDFs explain why, deletes confirm, and
  pending/error states remain stable on mobile.

### Step 9: Implement the Playground

Tasks:

1. Initialize the local chat with the assistant's welcome message.
2. Keep conversation messages in component state only, keyed by organization and
   assistant.
3. Validate nonblank messages up to 2,000 characters.
4. Disable duplicate submissions while a request is pending.
5. Render user and assistant messages, multiline answer text, pending state,
   retry affordance, and auto-scroll that does not steal focus.
6. Render source disclosures as `document`, page `N`, deduplicated if needed.
7. Render the backend fallback answer as a normal assistant response, not as an
   application error.
8. Preserve the user's failed question for retry and never add server history,
   streaming, or public chat.

Gate:

- Grounded answers, sources, fallback responses, 404/502/503 errors, keyboard
  submission, and duplicate-submit prevention all behave correctly.

### Step 10: Implement Appearance and Assistant Settings

Tasks:

1. Build Appearance for `welcome_message`, `logo_url`, and `primary_color`.
2. Build an immediate live preview from form state with logo fallback behavior
   and readable contrast.
3. Save only changed supported fields through `PATCH`.
4. Build Settings for `name`, `description`, and customer-facing
   `assistant_instructions`.
5. Never display or send a field named `system_prompt`.
6. Reset forms when assistant data changes after navigation or organization
   switch.
7. Build the assistant deletion danger zone with explicit name/context,
   confirmation, cache removal, and redirect to `/assistants`.
8. Add unsaved-change protection where accidental navigation would discard
   meaningful edits.

Gate:

- Supported changes persist and rehydrate, preview values match saved values,
  and destructive actions are deliberate and recover to a valid route.

### Step 11: Responsive, Accessibility, and Theme Pass

Tasks:

1. Test all routes at 360px, 768px, 1280px, and a wide desktop viewport.
2. Check text containment, toolbar stability, dialogs, menus, uploader, chat,
   source rows, and assistant navigation.
3. Complete every workflow using keyboard only.
4. Verify labels, descriptions, error association, `aria-live` feedback, focus
   restoration, and logical heading order.
5. Run automated accessibility checks where practical and manually inspect
   contrast/focus.
6. Add and inspect dark mode only after light mode passes; do not merely invert
   colors.
7. Check reduced motion and avoid layout shifts from dynamic content.

Gate:

- No overlapping/clipped UI, no keyboard traps, and all critical states remain
  understandable without color alone.

### Step 12: Testing, Documentation, and Release Verification

Tasks:

1. Add component tests for auth forms, organization onboarding/switching,
   assistant forms, uploader, delete confirmations, chat sources, and fallback.
2. Add hook/API tests for query key isolation, relevant invalidation, token
   forwarding, refresh-once behavior, and FastAPI error normalization.
3. Mock Supabase and FastAPI in normal unit/component tests; never call real
   Supabase in that suite.
4. Add selected Playwright coverage for unauthenticated redirects and, when test
   Supabase/FastAPI credentials are available, login -> organization -> assistant
   -> upload -> chat. Do not create frontend-only fake authentication.
5. Update README with setup, architecture, environment variables, backend/CORS,
   Supabase redirect/email configuration, scripts, and known limitations.
6. Create `DESIGN.md` documenting tokens, typography, layout, forms, feedback,
   assistant workspace, sources, responsive behavior, and theme decisions.
7. Search for accidental `supabase.from(` and raw component-level `fetch(` calls.
8. Run the full release gate:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test:run
   pnpm build
   pnpm test:e2e
   ```

9. Inspect the production app for console errors, hydration warnings, failed
   assets, mobile overflow, and stale tenant data.

Gate:

- Type checking, lint, unit/component tests, production build, and configured
  critical E2E tests pass. Any unavailable external integration is reported
  explicitly rather than marked complete.

## 9. Test Matrix

| Area | Primary tests |
| --- | --- |
| Auth | Login/signup validation, protected redirects, callback errors, sign-out cleanup |
| API client | Auth header, JSON/multipart, 204, FastAPI validation, abort, one retry on 401 |
| Organizations | Empty onboarding, create/select, invalid stored ID, A-to-B cache isolation |
| Assistants | CRUD forms, defaults, validation, 403, concealed 404, targeted invalidation |
| Knowledge | PDF precheck, pending state, upload result, 413/422, delete confirmation |
| Playground | 2,000-char limit, duplicate guard, answer, sources, fallback, retry |
| Appearance | Color/URL validation, live preview, reset, PATCH payload |
| Accessibility | Labels, focus, keyboard navigation, live regions, dialog restoration |
| Responsive | Sidebar/Sheet, workspace tabs, forms, uploader, chat at target viewports |

## 10. Implementation Rules

- Use `pnpm` only and commit `pnpm-lock.yaml` changes with dependency changes.
- Read the relevant local Next.js 16 guide before using a framework convention.
- Use `proxy.ts`; do not introduce deprecated `middleware.ts`.
- Keep secrets in `.env.local`; commit placeholders only.
- Never use `supabase.from(...)` for application data.
- Never put Supabase access or refresh tokens in local/session storage manually.
- Never recreate FastAPI authorization in the frontend.
- Never send `system_prompt`; use `assistant_instructions`.
- Never invent roles, metrics, document statuses, history, streaming, invitations,
  billing, analytics, widgets, or other Phase 4 features.
- Verify each milestone before starting the next one.

## 11. Completion Evidence

The final Phase 3 report must include:

1. Implemented architecture and route map.
2. Supabase session and FastAPI token-forwarding behavior.
3. Organization selection and tenant-cache isolation behavior.
4. Assistant, document, chat, appearance, and settings behavior.
5. Backend/deployment work still required, especially CORS and role visibility.
6. Accessibility and responsive checks performed.
7. Exact typecheck, lint, test, E2E, and production-build results.
8. Known limitations and recommended Phase 4 work without implementing it.

## 12. Reference Sources

Repository sources inspected:

- `AGENTS.md`
- `package.json`, `tsconfig.json`, `next.config.ts`, and current `src/app`
- `../ai-knowledge-assistant/README.md`
- Backend route, schema, domain constraint, authorization, error, and API test files
- Installed Next.js 16 documentation under `node_modules/next/dist/docs/`

External primary documentation checked:

- Supabase SSR client setup:
  <https://supabase.com/docs/guides/auth/server-side/creating-a-client>
- Supabase password authentication:
  <https://supabase.com/docs/guides/auth/passwords>
- TanStack Query App Router SSR guidance:
  <https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr>
