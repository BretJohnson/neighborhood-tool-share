# Implementation Plan: Abbington Neighborhood Tool Share

**Branch**: `001-neighborhood-tool-share` | **Date**: 2025-10-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-neighborhood-tool-share/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web application for the Abbington neighborhood to share tools among neighbors. Core functionality includes Facebook-based authentication, user profiles with contact info, tool listing/browsing/searching, and responsive mobile/desktop design. P2 feature includes AI-assisted tool identification from photos. The system prioritizes development speed and user experience over enterprise-grade features, following a "simple solutions" philosophy appropriate for a single-neighborhood tool with <100 expected users.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: Next.js 14+, React 18+, Supabase Client, Supabase Auth (Facebook OAuth), OpenAI API (P2)
**Storage**: Supabase (PostgreSQL database + file storage for photos)
**Testing**: Manual testing (per constitution Pragmatic Testing principle)
**Target Platform**: Web browsers (mobile and desktop responsive)
**Project Type**: Web application (Next.js full-stack with React components)
**Deployment**: Vercel (frontend + API routes), Supabase (database + storage)
**Performance Goals**: Page load <2 seconds, search results <500ms
**Constraints**: HTTPS in production (Vercel automatic), session-based auth, input validation/sanitization, server-side rendering (Next.js App Router)
**Scale/Scope**: <100 users (single neighborhood), <500 tools, minimal traffic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Speed Over Perfection
- ✅ **PASS**: Building only requested features (auth, profiles, tools, search, responsive design)
- ✅ **PASS**: No speculative features planned
- ✅ **PASS**: Performance goals are basic usability focused (<2s page load), not premature optimization

### II. User Experience First
- ✅ **PASS**: Simple workflows (3 clicks or less for common tasks per success criteria)
- ✅ **PASS**: Clear error messages specified (FR-018 OAuth failures, validation errors)
- ✅ **PASS**: Mobile-first responsive design (FR-007, SC-004)
- ✅ **PASS**: Intuitive signup flow with confirmation dialog (FR-021)

### III. Security Essentials Only
- ✅ **PASS**: Facebook OAuth for authentication (FR-001)
- ✅ **PASS**: Input validation required (FR-010, FR-020 phone validation)
- ✅ **PASS**: Authorization checks (users edit/delete own tools only, FR-014, FR-015)
- ✅ **PASS**: HTTPS in production (per constraints)
- ⚠️ **NOTE**: No password hashing needed (Facebook OAuth only, no local passwords)
- ✅ **PASS**: No advanced security theater (audits, penetration testing skipped)

### IV. Simple Solutions
- ✅ **PASS**: Monolithic web app (not microservices)
- ✅ **PASS**: Well-established tech stack (to be selected in Phase 0)
- ⚠️ **RESEARCH NEEDED**: Storage choice (SQLite vs simple database)
- ⚠️ **RESEARCH NEEDED**: Server-side vs minimal client-side rendering
- ✅ **PASS**: Scale deferred (building for <100 users, can grow later)

### V. Pragmatic Testing
- ✅ **PASS**: Manual testing approach documented
- ✅ **PASS**: Core user journeys identified for testing
- ✅ **PASS**: No automated test requirements
- ✅ **PASS**: Success criteria measurable via manual testing

**GATE STATUS**: ✅ PASS with research items

**Items requiring Phase 0 research:**
1. ~~Language/framework selection~~ → **RESOLVED**: Next.js + TypeScript (user has existing Vercel infrastructure)
2. ~~Database choice~~ → **RESOLVED**: Supabase PostgreSQL (user preference, includes auth + storage)
3. ~~Rendering approach~~ → **RESOLVED**: Next.js App Router with server components (modern React patterns)
4. AI/OCR service selection for P2 feature (existing service, not custom ML)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
neighborhood-tool-share/
├── package.json                # Node dependencies and scripts
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── .env.local                  # Environment variables (not committed)
├── .gitignore
├── README.md
│
├── app/                        # Next.js App Router directory
│   ├── layout.tsx              # Root layout (navigation, providers)
│   ├── page.tsx                # Landing page (/)
│   ├── globals.css             # Global styles (Tailwind)
│   │
│   ├── signup/                 # Signup flow
│   │   └── page.tsx            # Signup form
│   │
│   ├── tools/                  # Tool management
│   │   ├── page.tsx            # Tool listing with search
│   │   ├── add/
│   │   │   └── page.tsx        # Add new tool form
│   │   └── [id]/               # Dynamic route for tool details
│   │       ├── page.tsx        # Tool detail view
│   │       └── edit/
│   │           └── page.tsx    # Edit tool form
│   │
│   ├── profile/                # User profile
│   │   └── edit/
│   │       └── page.tsx        # Edit profile form
│   │
│   ├── auth/                   # Authentication callbacks
│   │   └── callback/
│   │       └── route.ts        # Supabase auth callback handler
│   │
│   └── api/                    # API routes (if needed)
│       └── ai/
│           └── identify-tool/
│               └── route.ts    # P2: AI tool identification endpoint
│
├── components/                 # Reusable React components
│   ├── ui/                     # UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Dialog.tsx
│   │
│   ├── auth/
│   │   ├── SignInButton.tsx    # Facebook OAuth button
│   │   └── AuthProvider.tsx    # Auth context provider
│   │
│   ├── tools/
│   │   ├── ToolCard.tsx        # Tool grid item
│   │   ├── ToolGrid.tsx        # Tool listing grid
│   │   ├── ToolForm.tsx        # Tool add/edit form
│   │   ├── SearchBox.tsx       # Search input (Client Component)
│   │   └── DeleteConfirm.tsx   # Delete confirmation dialog
│   │
│   └── layout/
│       ├── Navigation.tsx      # Site navigation bar
│       └── Footer.tsx
│
├── lib/                        # Utility libraries
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase client
│   │   ├── server.ts           # Server-side Supabase client
│   │   ├── database.types.ts   # Auto-generated TypeScript types
│   │   └── middleware.ts       # Auth middleware
│   │
│   ├── actions/                # Server Actions
│   │   ├── auth.ts             # Auth actions (signup, signout)
│   │   ├── tools.ts            # Tool CRUD actions
│   │   └── profile.ts          # Profile update actions
│   │
│   ├── schemas/                # Zod validation schemas
│   │   ├── user.ts
│   │   └── tool.ts
│   │
│   └── utils/
│       ├── formatting.ts       # Phone number formatting, etc.
│       └── validation.ts       # Custom validators
│
├── public/                     # Static assets
│   ├── images/
│   │   └── logo.png
│   └── favicon.ico
│
└── supabase/                   # Supabase configuration (optional local dev)
    ├── migrations/             # SQL migrations
    │   └── 20251022_initial_schema.sql
    └── config.toml             # Supabase CLI config
```

**Structure Decision**:

Next.js 14+ App Router with TypeScript (aligns with user's existing Vercel infrastructure). This structure:

- **App Router convention**: All routes in `app/` directory, using file-based routing
- **Server Components by default**: Most pages are Server Components (fast, SEO-friendly)
- **Client Components isolated**: Interactive components in `components/` with `'use client'` directive
- **Server Actions**: Form mutations in `lib/actions/` (no API routes needed for CRUD)
- **Type safety**: TypeScript throughout, auto-generated types from Supabase schema
- **Separation of concerns**: UI components, business logic, and data access clearly separated

**Rationale**:
- Leverages existing Vercel deployment (zero-config, automatic deployments)
- Supabase handles database + auth + storage (no backend code needed)
- TypeScript catches bugs at compile time
- App Router reduces boilerplate vs Pages Router
- Server Components minimize client JavaScript (better performance)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

### ⚠️ Acknowledged Complexity: React/Next.js vs Server-Side Templates

**Violation**: "Simple Solutions" principle prefers boring, simple technology. React/Next.js is more complex than pure server-side rendering (e.g., Flask/Jinja2, Rails/ERB).

**Justification**:
1. **User infrastructure**: User explicitly requested Next.js/Vercel stack and already has paid Vercel account
2. **Deployment simplicity**: `git push` → automatic deployment on Vercel (zero config) outweighs code complexity
3. **Existing familiarity**: User paying for Vercel suggests existing familiarity with React/Next.js ecosystem
4. **Type safety**: TypeScript prevents entire classes of bugs (offsets complexity cost)
5. **Modern React patterns**: Server Components reduce client JavaScript vs traditional React SPAs

**Mitigation strategies**:
- Default to Server Components (simpler, less JavaScript)
- Use Server Actions instead of API routes (less boilerplate)
- Minimize Client Components (only for true interactivity)
- Auto-generated TypeScript types from Supabase (reduces manual typing)
- Leverage Next.js conventions (reduces configuration)

**Trade-off accepted**: Deployment velocity + infrastructure alignment > code simplicity

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design complete (updated for Next.js/Supabase stack)*

### I. Speed Over Perfection
- ✅ **PASS**: Technology choices leverage existing infrastructure (user's paid Vercel account)
- ✅ **PASS**: Estimated 12 days development time (research.md timeline)
- ✅ **PASS**: No premature optimization in design
- ✅ **PASS**: Deployment velocity optimized (git push → auto-deploy on Vercel)

### II. User Experience First
- ✅ **PASS**: Routes designed for <3 clicks (login → browse → view details)
- ✅ **PASS**: Server Components ensure fast initial page loads
- ✅ **PASS**: Mobile-responsive design (Tailwind CSS + Next.js Image optimization)
- ✅ **PASS**: Clear error handling patterns documented (routes.md)
- ✅ **PASS**: Real-time search filtering (Client Component for interactivity)
- ✅ **PASS**: Optimistic updates via Server Actions (instant feedback)

### III. Security Essentials Only
- ✅ **PASS**: Facebook OAuth via Supabase Auth (no password storage)
- ✅ **PASS**: Input validation (Zod schemas on client + server)
- ✅ **PASS**: Authorization via Row Level Security policies (Supabase RLS)
- ✅ **PASS**: HTTPS enforced (Vercel automatic, Supabase required)
- ✅ **PASS**: XSS prevention (React auto-escaping)
- ✅ **PASS**: SQL injection prevention (Supabase parameterized queries)
- ✅ **PASS**: CSRF protection (Server Actions use POST + origin check)
- ✅ **PASS**: No over-engineering (rate limiting deferred, security audits skipped)

### IV. Simple Solutions
- ⚠️ **PARTIAL**: React/Next.js more complex than pure SSR (see Complexity Tracking)
- ✅ **JUSTIFIED**: User infrastructure + deployment simplicity outweighs code complexity
- ✅ **PASS**: Well-established tech (Next.js 10+ years, React 12+ years, PostgreSQL 30+ years)
- ✅ **PASS**: Minimal setup (Supabase handles database + auth + storage, zero backend code)
- ✅ **PASS**: Monolithic architecture (single Next.js app, not microservices)
- ✅ **PASS**: Server Components by default (reduces client complexity)
- ✅ **PASS**: Server Actions replace API routes (less boilerplate)
- ✅ **PASS**: Auto-generated types (Supabase → TypeScript, no manual duplication)

### V. Pragmatic Testing
- ✅ **PASS**: Manual test workflow documented in quickstart.md
- ✅ **PASS**: 12-step manual test procedure covers all user journeys
- ✅ **PASS**: No automated test requirements
- ✅ **PASS**: Success criteria measurable through manual testing
- ✅ **PASS**: TypeScript catches many bugs at compile time (pragmatic testing via types)

**FINAL GATE STATUS**: ✅ **PASS with Acknowledged Complexity - Ready for Implementation**

All design artifacts (research.md, data-model.md, contracts/routes.md, quickstart.md) updated for Next.js/Supabase stack and constitution-compliant. One complexity violation (React vs SSR) documented and justified in Complexity Tracking section.
