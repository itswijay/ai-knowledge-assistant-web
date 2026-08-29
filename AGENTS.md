<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

You are acting as the senior frontend engineer, product designer, and UI architect for a new SaaS frontend.

Your task is to **plan and implement Phase 3** of an existing AI Knowledge Assistant product.

The backend already exists in a separate repository and Phase 1 + Phase 2 are complete (ai-knowledge-assistant-web).

This repository is frontend-only:

```text
ai-knowledge-assistant-web
```

Do not rewrite or duplicate backend functionality.

# PRODUCT OVERVIEW

We are building a multi-tenant SaaS platform where organizations can create AI knowledge assistants.

Users can:

* authenticate;
* create and switch organizations;
* create AI assistants;
* configure assistant behavior;
* upload PDF knowledge documents;
* test assistants in a playground;
* customize assistant appearance;
* manage assistants and knowledge.

The AI answers questions using only the knowledge assigned to that assistant.

The backend already provides:

* Supabase authentication compatibility;
* JWT authentication;
* organizations;
* organization memberships;
* roles: owner, admin, member;
* assistants;
* assistant CRUD;
* assistant instructions;
* PDF document ingestion;
* assistant-scoped knowledge;
* assistant-scoped RAG chat;
* grounded answers;
* source citations;
* tenant isolation.

# PHASE 3 OBJECTIVE

Build the first production-quality web dashboard.

Phase 3 should produce this experience:

```text
Authentication
      ↓
Organization
      ↓
Dashboard
      ↓
Assistants
      ↓
Assistant Workspace
      ├── Overview
      ├── Knowledge
      ├── Playground
      ├── Appearance
      └── Settings
```

The frontend should feel like a real polished SaaS product, not an admin template.

# TECHNOLOGY STACK

Use:

* Next.js
* App Router
* TypeScript
* React
* Tailwind CSS
* shadcn/ui
* Lucide icons
* pnpm
* Supabase Auth
* `@supabase/ssr`
* TanStack Query
* React Hook Form
* Zod
* Sonner for toast notifications
* next-themes if dark mode is implemented
* ESLint
* Vitest
* React Testing Library
* Playwright for selected critical end-to-end flows if practical

Do not use:

* Redux
* Zustand unless a concrete need appears;
* Material UI;
* Chakra UI;
* Ant Design;
* Bootstrap;
* a large dashboard template;
* GraphQL;
* tRPC;
* Prisma;
* direct access to application tables through Supabase;
* frontend-only fake authentication;
* unnecessary animation libraries.

Use the platform and libraries directly before adding abstractions.

# PACKAGE MANAGEMENT

Use `pnpm`.

Do not mix:

```text
npm
yarn
bun
pnpm
```

Commit:

```text
pnpm-lock.yaml
```

# IMPORTANT BACKEND BOUNDARY

Supabase on the frontend is for:

```text
AUTHENTICATION
```

The FastAPI backend remains the source of truth for:

```text
organizations
memberships
assistants
documents
RAG
authorization
tenant isolation
```

Do NOT query application tables directly using:

```text
supabase.from(...)
```

The frontend should communicate with FastAPI through its REST API.

Architecture:

```text
                        Supabase Auth
                             ▲
                             │
                         session/JWT
                             │
                             ▼

Browser / Next.js
       │
       │ Authorization: Bearer <JWT>
       ▼
   FastAPI API
       │
       ├── Organizations
       ├── Assistants
       ├── Documents
       └── RAG
```

Do not recreate backend authorization logic in the frontend.

Frontend authorization is for UX only.

FastAPI remains authoritative.

# AUTHENTICATION

Use Supabase Auth using the recommended Next.js SSR/cookie approach.

Use:

```text
@supabase/ssr
```

Create separate browser/server helpers as appropriate.

Do NOT manually store access tokens in:

```text
localStorage
sessionStorage
```

Do not implement custom password hashing or custom sessions.

Support initially:

* sign in with email/password;
* sign up with email/password;
* sign out;
* session persistence;
* protected dashboard routes.

If straightforward with the existing Supabase configuration, support:

* Google sign-in

but do not let OAuth delay the core Phase 3 implementation.

# FASTAPI AUTHENTICATION

Authenticated FastAPI requests must send:

```http
Authorization: Bearer <Supabase access token>
```

Create a centralized API layer that obtains the current authenticated access token and attaches it automatically.

Do not manually repeat auth-header construction throughout components.

Do not expose tokens in logs.

# ENVIRONMENT VARIABLES

Use environment variables such as:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=
```

Use the current Supabase public/publishable key convention supported by the user's project.

Do not commit real values.

Create:

```text
.env.example
```

Use:

```text
.env.local
```

for local secrets/configuration.

# PROJECT STRUCTURE

Use a pragmatic feature-oriented frontend structure.

A good baseline is:

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── assistants/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [assistantId]/
│   │   │       ├── page.tsx
│   │   │       ├── knowledge/
│   │   │       ├── playground/
│   │   │       ├── appearance/
│   │   │       └── settings/
│   │   │
│   │   └── settings/
│   │
│   ├── auth/
│   │   └── callback/
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── common/
│   ├── assistants/
│   ├── knowledge/
│   └── playground/
│
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── assistants/
│   ├── documents/
│   └── chat/
│
├── lib/
│   ├── api/
│   ├── supabase/
│   ├── query/
│   └── utils/
│
├── hooks/
└── types/
```

Adjust this structure if the actual application benefits from a slightly different organization.

Do not reproduce backend-style Clean Architecture in React.

Prefer:

```text
feature cohesion
+
clear API boundaries
+
reusable UI primitives
```

# SERVER VS CLIENT COMPONENTS

Use React Server Components by default where they simplify static/layout work.

Use Client Components only where needed for:

* forms;
* TanStack Query;
* dialogs;
* upload interactions;
* chat;
* dropdown state;
* live previews;
* interactive controls.

Do not mark large application trees with:

```text
"use client"
```

without reason.

Keep client boundaries focused.

# DATA FETCHING

Use TanStack Query for interactive authenticated application data.

Create stable query keys.

Examples:

```text
["organizations"]

["assistants", organizationId]

["assistant", assistantId]

["documents", assistantId]
```

Use mutations for:

* organization creation;
* assistant creation;
* assistant update;
* assistant deletion;
* document upload;
* document deletion;
* chat requests.

Invalidate only relevant queries.

Do not manually synchronize duplicate server state into React context.

# API CLIENT

Create a centralized typed API client.

Conceptually:

```text
src/lib/api/
├── client.ts
├── organizations.ts
├── assistants.ts
├── documents.ts
└── chat.ts
```

Requirements:

* configurable API base URL;
* bearer token attachment;
* JSON serialization;
* multipart upload support;
* typed responses;
* typed application errors;
* handling for 401;
* handling for 403/404;
* handling for FastAPI validation responses.

Do not scatter raw `fetch()` calls across UI components.

Do not create unnecessary enterprise API abstractions.

# TYPES

Define frontend models reflecting the real backend API.

Examples:

```text
Organization

OrganizationMember

Assistant

Document

ChatRequest

ChatResponse

SourceReference
```

Use backend field names accurately.

The customer-configurable assistant field is:

```text
assistant_instructions
```

NOT:

```text
system_prompt
```

Provider-level system instructions must never appear in the customer UI.

# FORM VALIDATION

Use:

```text
React Hook Form
+
Zod
```

for meaningful forms.

Keep frontend validation aligned with backend constraints.

The backend remains authoritative.

Display backend validation messages in a human-readable way.

# DESIGN DIRECTION

The visual design should be inspired by the restraint and usability of modern AI products such as Claude.ai.

Do NOT copy Claude's:

* branding;
* exact colors;
* exact typography;
* proprietary assets;
* exact layouts.

Use the following principles:

```text
clean
modern
minimal
calm
premium
intelligent
spacious
professional
```

The application should feel like an AI product rather than an old enterprise admin dashboard.

# VISUAL DESIGN PRINCIPLES

Use:

* generous whitespace;
* restrained neutral palette;
* excellent typography hierarchy;
* subtle 1px borders;
* very limited shadows;
* moderate rounded corners;
* compact navigation;
* uncluttered content;
* lightweight dialogs;
* minimal use of icons;
* one restrained accent color;
* strong light mode;
* carefully designed dark mode if implemented.

Avoid:

* gradients everywhere;
* glassmorphism;
* neon AI colors;
* giant dashboard cards;
* excessive badges;
* excessive shadows;
* decorative illustrations;
* dashboard-template aesthetics;
* huge navigation menus;
* unnecessary animations.

# SHADCN/UI

Use shadcn/ui as component primitives.

Do NOT blindly accept default styling.

Customize the design system.

Likely useful components include:

```text
Button
Input
Textarea
Label
Form
Dialog
AlertDialog
DropdownMenu
Avatar
Tabs
Badge
Separator
Skeleton
Tooltip
Popover
Sheet
Sidebar
Select
Table
Progress
Sonner
Command
```

Install only components actually needed.

# ICONS

Use Lucide icons.

Prefer outline icons.

Use icons to clarify meaning, not as decoration.

# DESIGN TOKENS

Before building many screens, establish application-wide design tokens.

Define consistent values for:

```text
background
foreground
card
card-foreground
muted
muted-foreground
border
input
ring
primary
primary-foreground
destructive
sidebar
sidebar-foreground
sidebar-accent
sidebar-border
```

Also define:

```text
radius
spacing conventions
content max widths
```

The interface should stay visually consistent.

# TYPOGRAPHY

Use a modern readable sans-serif.

Prefer a quality font suitable for SaaS interfaces.

Possible direction:

```text
Geist
Inter
```

Choose one.

Do not mix multiple unrelated families.

Use a restrained type scale.

# APP SHELL

Create a polished responsive application shell.

Desktop:

```text
┌───────────────┬─────────────────────────────┐
│               │                             │
│   Sidebar     │        Main Content         │
│               │                             │
│               │                             │
└───────────────┴─────────────────────────────┘
```

Sidebar should include:

```text
Product Logo

+ New Assistant

Home
Assistants

────────

Organization Settings

────────

Organization Switcher
User/Profile
```

Do not clutter the global sidebar with:

```text
Knowledge
Playground
Appearance
```

These belong inside individual assistants.

# ORGANIZATION CONTEXT

The application is organization-scoped.

Provide:

* current organization;
* organization switcher;
* create organization flow.

The frontend must refresh assistant data when organization changes.

Do not allow stale assistant data from Organization A to remain visible after switching to Organization B.

# AUTH SCREEN — LOGIN

Create:

```text
/login
```

Design:

* minimal centered experience;
* product identity;
* heading;
* email;
* password;
* sign-in button;
* create account link;
* forgot-password affordance if supported;
* optional Google authentication.

Avoid large illustrations.

Example copy:

```text
Welcome back

Sign in to manage your AI assistants.
```

# AUTH SCREEN — SIGN UP

Create:

```text
/signup
```

Support:

* email;
* password;
* appropriate confirmation/feedback;
* link to sign in.

Do not ask for unnecessary profile fields unless required.

# PROTECTED ROUTES

Protect dashboard routes.

Unauthenticated users should be redirected to login.

Authenticated users visiting auth screens may be redirected to the dashboard when appropriate.

Avoid redirect loops.

# FIRST ORGANIZATION EXPERIENCE

If the authenticated user belongs to no organizations, display a clean onboarding state.

Example:

```text
Create your workspace

Your workspace contains your assistants and knowledge.
```

Form:

```text
Organization name

[ Create Workspace ]
```

After successful creation:

* select the organization;
* navigate into the dashboard.

# HOME DASHBOARD

Route:

```text
/
```

inside the authenticated application.

Do NOT create fake analytics.

Show useful existing data only.

Suggested content:

```text
Good morning
ABC Insurance

Manage your AI assistants and knowledge from one place.

[ Create Assistant ]
```

Then:

```text
Your Assistants
```

Display recent/all assistants in a clean list or restrained cards.

Optional factual summary values:

```text
Number of assistants
Number of documents
```

only if easily available from existing API data.

Do not create unsupported metrics.

# ASSISTANTS LIST

Route:

```text
/assistants
```

Heading:

```text
Assistants
```

Supporting copy:

```text
Create and manage AI assistants for your organization.
```

CTA:

```text
New Assistant
```

Each assistant should display:

* avatar/logo;
* name;
* description;
* document count if available;
* modified/created information if available;
* contextual menu.

Actions:

```text
Open
Edit
Delete
```

Include:

* populated state;
* empty state;
* loading skeleton;
* error state.

# CREATE ASSISTANT

Route:

```text
/assistants/new
```

Fields should reflect the actual backend.

At minimum:

```text
Name

Description

Welcome Message

Assistant Instructions

Logo URL or logo mechanism supported by backend

Primary Color
```

Assistant Instructions helper text:

```text
Define the assistant's tone, communication style, and formatting preferences.
The assistant will still answer only using its knowledge base.
```

Do not use the customer-facing term:

```text
System Prompt
```

Use:

```text
Assistant Instructions
```

# ASSISTANT WORKSPACE

Route:

```text
/assistants/[assistantId]
```

Create an assistant header containing:

* avatar;
* name;
* description;
* status if available;
* action menu.

Then use tabs/subnavigation:

```text
Overview
Knowledge
Playground
Appearance
Settings
```

Prefer a horizontal assistant navigation instead of introducing another permanent sidebar.

# ASSISTANT OVERVIEW

Show useful current configuration.

Sections:

```text
Assistant Details

Knowledge

Configuration

Quick Actions
```

Quick actions:

```text
Upload Knowledge

Test Assistant

Edit Appearance
```

Do not invent analytics.

# KNOWLEDGE PAGE

Route:

```text
/assistants/[assistantId]/knowledge
```

This is one of the most important screens.

Heading:

```text
Knowledge
```

Supporting copy:

```text
Upload information your assistant can use when answering questions.
```

CTA:

```text
Add Knowledge
```

Current supported format:

```text
PDF
```

Create a polished upload experience:

```text
Drag and drop a PDF

or

Choose File
```

Respect backend upload-size rules.

Validate basic file type/size before upload for UX, while still relying on backend validation.

# DOCUMENT LIST

Display uploaded documents.

Fields based on API availability:

```text
filename
created/uploaded date
status if backend provides it
```

Do not invent processing states if the backend API does not expose them.

Actions:

```text
Delete
```

Use confirmation:

```text
Delete "Refund Policy.pdf"?

The assistant will no longer be able to use this document.
```

# KNOWLEDGE EMPTY STATE

Example:

```text
Add knowledge

Upload company documents so your assistant can answer questions.

[ Upload Document ]
```

Avoid technical words like:

```text
embedding
vector
chunk
pgvector
```

# PLAYGROUND

Route:

```text
/assistants/[assistantId]/playground
```

This should be one of the most polished experiences.

Purpose:

```text
Test the assistant using its current knowledge.
```

Build a clean chat interface.

Include:

* assistant avatar/name;
* chat messages;
* user messages;
* assistant messages;
* message composer;
* send button;
* new/clear chat if helpful.

The backend currently does not persist conversation history.

Therefore:

> Playground conversation history should remain local to the current page/session unless persistence is later added.

Do NOT imply server-side history exists.

# CHAT UX

Input:

```text
Ask your assistant...
```

Disable send while a request is active.

Support Enter-to-send and reasonable multiline behavior.

Display typing/loading state.

Do not allow accidental duplicate submissions.

# SOURCES

Backend responses may contain citations.

Render sources clearly but subtly.

Example:

```text
Sources

Refund Policy.pdf · Page 3
Shipping Guide.pdf · Page 7
```

Sources can use:

* pills;
* compact list;
* expandable section.

Do not overwhelm the answer.

# RAG FALLBACK

The assistant may respond:

```text
I couldn't find enough information in the knowledge base to answer that question.
```

Treat this as a normal assistant response.

Do NOT render it as:

```text
error
failure
warning
```

It is correct product behavior.

# APPEARANCE PAGE

Route:

```text
/assistants/[assistantId]/appearance
```

Editable configuration may include:

```text
Assistant Logo

Assistant Name

Primary Color

Welcome Message
```

Show a live visual preview where possible.

Desktop layout:

```text
Configuration        Preview
```

The preview can simulate the future embedded chat widget visually.

Clearly treat it as a preview.

Do not implement the real embeddable widget in Phase 3.

# SETTINGS PAGE

Route:

```text
/assistants/[assistantId]/settings
```

Sections:

```text
General

Assistant Instructions

Danger Zone
```

Allow supported assistant configuration editing.

Danger Zone:

```text
Delete Assistant
```

Use a strong confirmation flow.

Communicate that deleting an assistant also removes its knowledge if that matches backend behavior.

# ORGANIZATION SETTINGS

Route:

```text
/settings
```

or:

```text
/settings/organization
```

Display:

* organization name;
* current members if the backend exposes a members endpoint;
* current user's role.

Do not invent team invitation functionality.

If the backend does not expose member listing yet, do not create fake member management.

# ORGANIZATION SWITCHER

Create a compact organization switcher in the sidebar footer.

Example:

```text
ABC Insurance
⌄
```

Menu:

```text
ABC Insurance ✓
Acme Labs

────────

Create Organization
Organization Settings
```

On switch:

* update active organization;
* update URL/context if relevant;
* invalidate organization-dependent queries;
* prevent stale content.

# USER MENU

Show:

* user email/name where available;
* organization settings;
* sign out.

Do not create fake account functionality.

# RESPONSIVE DESIGN

Desktop-first but fully responsive.

Desktop:

* persistent sidebar.

Tablet:

* collapsible sidebar.

Mobile:

* sidebar becomes Sheet/drawer.

Important responsive requirements:

* assistant navigation horizontally scrollable when needed;
* forms use full width;
* appearance preview stacks below form;
* knowledge lists become mobile-friendly;
* playground remains highly usable;
* dialogs remain viewport-safe.

# DARK MODE

Implement dark mode only if it can be done cleanly without delaying core Phase 3.

If implemented, use:

```text
next-themes
```

Dark mode should feel intentionally designed.

Do not simply invert colors.

# LOADING UX

Use skeletons for page-level loading.

Use inline loading indicators for actions.

Examples:

```text
Creating...
Saving...
Uploading...
Sending...
Deleting...
```

Prevent duplicate submissions while pending.

# ERROR UX

Create reusable error states.

Examples:

```text
Something went wrong

We couldn't load your assistants.

[ Retry ]
```

Do not expose raw backend stack traces.

Translate technical HTTP failures into useful UI.

# API ERROR HANDLING

Handle:

```text
401 → authentication expired / login

403 → insufficient access where backend returns it

404 → resource unavailable

409 → conflict

422 → validation

5xx → generic server failure
```

Remember the backend may intentionally return `404` for cross-tenant resources.

Do not attempt to reveal hidden resources.

# TOASTS

Use Sonner for action confirmations.

Examples:

```text
Assistant created

Assistant updated

Document uploaded

Document deleted

Organization created
```

Do not produce a toast for every successful fetch.

# ACCESSIBILITY

Follow strong accessibility practices.

Include:

* semantic HTML;
* proper labels;
* keyboard navigation;
* visible focus states;
* sufficient contrast;
* accessible dialogs;
* accessible dropdowns;
* meaningful button labels;
* large enough pointer targets;
* color-independent status meaning;
* screen-reader-friendly loading states.

# EMPTY STATES

Use simple empty states.

No giant generic illustrations.

Pattern:

```text
small icon

clear heading

one sentence

primary action
```

# DESIGN QUALITY

Before considering a screen finished, inspect:

* alignment;
* spacing;
* typography;
* hover states;
* focus states;
* loading states;
* empty states;
* errors;
* mobile behavior.

Do not stop at "functional".

The target is:

```text
production-quality SaaS UI
```

# PERFORMANCE

Avoid unnecessary client JavaScript.

Avoid giant dependencies.

Use dynamic loading only when beneficial.

Optimize images/logos where relevant.

Do not prematurely optimize minor things before profiling.

# SECURITY

Never expose:

* backend database credentials;
* Gemini API keys;
* Supabase secret/service-role keys;
* internal tokens.

Never log access tokens.

Use only the public Supabase browser credential intended for frontend use.

Do not depend on frontend authorization for security.

FastAPI remains authoritative.

# CORS

The frontend and FastAPI backend are separate deployments.

If browser requests call FastAPI directly, the backend will require the production/local frontend origins in its CORS configuration.

Do not modify the backend repository from this frontend repository.

Document required origins such as:

```text
http://localhost:3000
production frontend URL
```

if backend configuration changes are needed.

# TESTING

Testing is required.

## Unit/component tests

Use Vitest + React Testing Library.

Prioritize meaningful behavior:

* form validation;
* assistant form;
* organization switcher;
* API error rendering;
* document upload validation;
* source citation rendering;
* playground fallback rendering.

Do not test implementation details.

## API layer tests

Mock network calls and verify:

* bearer token attachment;
* expected methods/URLs;
* response parsing;
* error mapping.

## Authentication tests

Test application behavior for:

* unauthenticated user;
* authenticated user;
* expired/invalid session behavior where practical.

Do not call real Supabase in normal unit tests.

## E2E

If practical, use Playwright for a small number of critical flows.

Prioritize:

```text
Login
→ Dashboard

Create Organization

Create Assistant

Upload Document

Open Playground
```

Do not build a giant brittle E2E suite during Phase 3.

# CODE QUALITY

Requirements:

* strict TypeScript;
* avoid `any`;
* readable components;
* small focused modules;
* clear naming;
* no giant page components;
* no unnecessary abstraction;
* no duplicate API logic;
* no dead code;
* no console logs left casually;
* no secrets;
* no unrelated refactors.

# DOCUMENTATION

Maintain a useful README.

Include:

* product overview;
* stack;
* prerequisites;
* installation;
* pnpm commands;
* environment variables;
* Supabase Auth configuration;
* FastAPI URL configuration;
* development;
* tests;
* production build;
* architecture;
* authentication flow.

# DESIGN DOCUMENT

Create:

```text
DESIGN.md
```

Document the chosen visual system.

Include:

* overall philosophy;
* colors;
* typography;
* radius;
* spacing;
* sidebar behavior;
* cards;
* buttons;
* forms;
* tables/lists;
* dialogs;
* chat;
* sources;
* empty states;
* dark mode if implemented.

This should prevent visual inconsistency as the product grows.

# DO NOT IMPLEMENT YET

Do NOT implement Phase 4+ features:

```text
public embeddable widget
public anonymous chat
conversation persistence
conversation history backend
analytics
billing
Stripe
usage limits
domain allowlists
API keys
CRM integrations
Slack
WhatsApp
agent actions
human handoff
team invitations
enterprise SSO
```

Do not place unfinished features in navigation just to make the app look larger.

# IMPLEMENTATION PROCESS

Do not generate the entire frontend blindly in one pass.

## STEP 1 — INITIALIZE

If the repository is empty:

* initialize Next.js;
* enable TypeScript;
* use App Router;
* use `src/`;
* configure Tailwind;
* use pnpm;
* initialize shadcn/ui;
* configure ESLint.

Inspect generated files before proceeding.

## STEP 2 — PLAN

Before building screens, produce a concise implementation plan containing:

1. application architecture;
2. route structure;
3. feature structure;
4. Supabase Auth strategy;
5. FastAPI client strategy;
6. organization-context strategy;
7. TanStack Query strategy;
8. design system;
9. screen implementation order;
10. testing plan;
11. API dependencies/unknowns;
12. risks.

If backend API details are uncertain, inspect available backend API documentation/OpenAPI supplied by the user rather than inventing endpoints.

Do not invent backend capabilities.

## STEP 3 — DESIGN FOUNDATION

Build only:

```text
global styles
design tokens
typography
shadcn configuration
app shell
sidebar
responsive navigation
theme foundation
```

Then visually inspect before moving forward.

## STEP 4 — AUTH

Implement:

```text
Supabase clients
middleware/session refresh as required
login
signup
signout
protected routes
auth callback if required
```

Verify before moving on.

## STEP 5 — ORGANIZATIONS

Implement:

```text
organization API
organization context
empty organization onboarding
organization switcher
organization creation
```

Verify organization switching cannot show stale cross-organization content.

## STEP 6 — ASSISTANTS

Implement:

```text
assistant list
assistant empty state
assistant creation
assistant detail
assistant editing
assistant deletion
```

Verify forms and error states.

## STEP 7 — KNOWLEDGE

Implement:

```text
document list
PDF uploader
upload progress/pending state
delete flow
empty/error states
```

Verify real FastAPI integration.

## STEP 8 — PLAYGROUND

Implement:

```text
chat interface
send message
loading state
answers
fallback response
sources
local conversation state
```

Do not add server conversation history.

## STEP 9 — APPEARANCE + SETTINGS

Implement:

```text
appearance configuration
live preview
assistant instructions
general settings
danger zone
```

## STEP 10 — RESPONSIVE + ACCESSIBILITY PASS

Explicitly inspect:

```text
desktop
tablet
mobile
keyboard
focus
contrast
dialogs
forms
navigation
```

## STEP 11 — TESTS

Add meaningful unit/component tests.

Add selected E2E tests if practical.

## STEP 12 — FINAL POLISH

Run:

* TypeScript validation;
* ESLint;
* tests;
* production build.

Inspect for:

* console warnings;
* hydration warnings;
* missing loading states;
* broken mobile layouts;
* unused dependencies;
* accidental direct Supabase DB access.

# VERIFICATION COMMANDS

Use the commands appropriate for the generated package scripts.

At minimum ensure equivalents of:

```text
pnpm lint
pnpm test
pnpm build
```

pass.

If a dedicated TypeScript command exists:

```text
pnpm typecheck
```

run it as well.

Do not claim completion if the production build fails.

# GIT DISCIPLINE

Check git status before work.

Do not overwrite unrelated changes.

Keep logical commits.

Suggested boundaries:

```text
chore: initialize Next.js dashboard

feat: establish dashboard design system

feat: add Supabase authentication

feat: add organization workspace

feat: add assistant management

feat: add knowledge management

feat: add assistant playground

feat: add appearance and settings

test: add frontend coverage

docs: document dashboard architecture
```

Do not commit:

```text
.env.local
tokens
credentials
```

# DEFINITION OF DONE

Phase 3 is complete only when:

1. Next.js production build succeeds.
2. Authentication works with Supabase.
3. Protected routes work.
4. User can create/select organizations.
5. Organization switching works correctly.
6. User can list assistants.
7. User can create assistants.
8. User can view assistants.
9. User can edit assistants.
10. User can delete assistants.
11. Assistant Instructions are exposed with correct terminology.
12. User can upload PDFs.
13. User can list documents.
14. User can delete documents.
15. Knowledge empty/loading/error states exist.
16. Playground can send assistant-scoped questions.
17. Playground renders grounded answers.
18. Playground renders source citations.
19. Playground renders insufficient-knowledge responses correctly.
20. Appearance configuration works with supported backend fields.
21. Assistant settings work.
22. Destructive actions require confirmation.
23. Application is responsive.
24. Keyboard/focus accessibility is reasonable.
25. API calls use FastAPI rather than direct Supabase database access.
26. FastAPI requests include Supabase JWT correctly.
27. No secrets are exposed.
28. TypeScript checks pass.
29. ESLint passes.
30. Tests pass.
31. Production build passes.
32. README is complete.
33. DESIGN.md documents the UI system.
34. No Phase 4+ functionality was implemented unnecessarily.

# FINAL COMPLETION REPORT

When Phase 3 is complete, provide:

1. architecture summary;
2. routes implemented;
3. components/features created;
4. authentication design;
5. organization-state design;
6. FastAPI client design;
7. assistant management behavior;
8. knowledge management behavior;
9. playground behavior;
10. design-system summary;
11. responsive/accessibility work;
12. test results;
13. lint/typecheck results;
14. production build result;
15. any backend configuration still required, such as CORS;
16. known limitations;
17. recommended Phase 4 work.

Do not automatically implement Phase 4.

# START NOW

First inspect the repository.

If it is empty, initialize the project.

Then present the implementation plan before building large portions of the application.

Build incrementally and verify each milestone.

The priorities are:

```text
1. Correct authentication
2. Correct organization boundaries
3. Clean FastAPI integration
4. Excellent UX
5. Visual consistency
6. Responsive behavior
7. Maintainable code
```

Do not optimize for the number of screens generated.

Optimize for a small, coherent, production-quality SaaS dashboard.
