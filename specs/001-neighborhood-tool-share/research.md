# Technical Research: Abbington Neighborhood Tool Share

**Date**: 2025-10-22 (Updated)
**Purpose**: Document technology choices for Next.js/React/TypeScript web application

## Research Questions

1. ~~What language/framework combination optimizes for development speed and simplicity?~~ **RESOLVED** by user
2. ~~What database solution aligns with "Simple Solutions" principle?~~ **RESOLVED** by user
3. ~~Should we use server-side or client-side rendering?~~ **RESOLVED** (Next.js App Router)
4. What AI/OCR service should we use for P2 tool identification feature?

---

## Decision 1: Language & Framework

**Decision**: Next.js 14+ with React 18+ and TypeScript

**Rationale**:
- **User infrastructure**: Existing paid Vercel account reduces deployment friction
- **Well-established**: Next.js is industry standard for React apps (Vercel backing, large community)
- **Development speed**: App Router with Server Components reduces boilerplate
- **TypeScript**: Type safety prevents bugs, excellent IDE support
- **Facebook OAuth**: NextAuth.js has first-class Facebook provider support
- **Image handling**: Next.js Image component optimized, automatic formats/sizes
- **Deployment**: Zero-config deployment to Vercel (already paid for)

**Constitution Alignment**:
- ✅ **Boring & well-established**: Next.js/React mainstream (not experimental)
- ✅ **Development speed**: Leverages existing Vercel infrastructure
- ⚠️ **Complexity note**: React is more complex than server-side templates, BUT user already paying for Vercel suggests familiarity with this stack
- ✅ **Simple deployment**: `git push` → automatic deployment

**Alternatives Considered** (not applicable - user specified):
- Python/Flask: Simpler but requires separate hosting setup
- Ruby/Rails: No infrastructure advantage

---

## Decision 2: Database & Backend

**Decision**: Supabase (PostgreSQL + Auth + Storage)

**Rationale**:
- **User preference**: Explicitly requested Supabase
- **All-in-one**: Database + Authentication + File Storage + Row Level Security
- **PostgreSQL**: Production-grade database (better than SQLite for <100 users)
- **Built-in auth**: Supabase Auth supports Facebook OAuth natively
- **Storage**: File uploads handled via Supabase Storage (S3-compatible)
- **Real-time**: Built-in subscriptions if needed later (live tool updates)
- **Free tier**: Generous limits (500MB database, 1GB storage, 50k monthly active users)
- **TypeScript SDK**: First-class TypeScript support

**Constitution Alignment**:
- ✅ **Well-established**: Supabase mature (2020+), large community
- ✅ **Simple**: No server management, no database setup
- ✅ **Security essentials**: Row Level Security (RLS) built-in
- ✅ **Development speed**: Auto-generated types from schema

**Alternatives Considered** (not applicable - user specified):
- SQLite: Too limited for multi-user with file uploads
- Self-hosted PostgreSQL: More complex deployment

---

## Decision 3: Rendering Approach

**Decision**: Next.js App Router with Server Components + Client Components (hybrid)

**Rationale**:
- **Server Components by default**: Most pages can be server-rendered (fast, SEO-friendly)
- **Client Components where needed**: Interactive features (search, delete confirmation)
- **Server Actions**: Form submissions without API routes (simpler code)
- **Built-in**: App Router is Next.js default (not fighting framework)
- **Performance**: Automatic code splitting, streaming, parallel data fetching

**Constitution Alignment**:
- ⚠️ **Deviation noted**: More complex than pure server-side rendering (Jinja2)
- ✅ **Justification**: User already invested in Vercel ecosystem suggests React familiarity
- ✅ **Modern React**: App Router is current best practice (not experimental beta)
- ✅ **Performance**: Server Components reduce JavaScript sent to client

**Implementation Strategy**:
- **Server Components** (default):
  - Tool listing page
  - Tool detail page
  - Profile edit form (initial render)
  - Layout/navigation

- **Client Components** ('use client'):
  - Search box with live filtering
  - Delete confirmation dialog
  - Photo upload with preview
  - Form validation feedback

---

## Decision 4: AI/OCR Service for Tool Identification (P2 Feature)

**Decision**: OpenAI Vision API (GPT-4 Vision)

**Rationale**:
- **Intelligent understanding**: LLM can interpret tool images contextually, not just OCR
- **Natural language extraction**: Can identify tool name, brand, model from image with reasoning
- **Flexible prompting**: Can ask "What tool is this?" and get structured response
- **Single API**: OpenAI provides both vision and text generation in one service
- **Simple integration**: REST API, works from Next.js API route or Server Action
- **Pay-as-you-go**: $0.01 per image (standard resolution), no free tier but very affordable
- **Fallback graceful**: If API fails or quota exceeded, fallback to manual entry

**Alternatives Considered**:
- **Google Cloud Vision API**: Good OCR but less intelligent interpretation of tool details
- **AWS Rekognition**: Object detection focused, not optimized for tool identification
- **Azure Computer Vision**: Similar to Google Vision, less flexible than LLM approach
- **Tesseract (open source)**: Pure OCR only, no intelligent interpretation

**Implementation Notes**:
- Call from Next.js API route (secure, API key not exposed to client)
- Send image with prompt: "Identify this tool. Extract the brand, model number, and tool type. Return as JSON."
- Parse structured response to auto-fill tool name and description
- Use GPT-4 Vision (or GPT-4o with vision) for best accuracy
- Allow user to review and edit before saving
- Handle errors gracefully (show manual entry form if API fails)

**Example Prompt**:
```
Analyze this tool image and extract:
1. Tool type (e.g., "Cordless Drill", "Pressure Washer")
2. Brand name (if visible)
3. Model number (if visible)
4. Any notable features

Return as JSON with keys: toolType, brand, model, features
```

---

## Supporting Libraries & Tools

### Core Dependencies

**Frontend**:
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0"
}
```

**Supabase**:
```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0"
}
```

**Authentication**:
```json
{
  "next-auth": "^4.24.0"
}
```

**Forms & Validation**:
```json
{
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0"
}
```

**UI (Optional - Keep Simple)**:
```json
{
  "tailwindcss": "^3.3.0"
}
```

**P2 Feature**:
```json
{
  "openai": "^4.20.0"
}
```

### Development Tools
```json
{
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0"
}
```

---

## Architecture Summary

```text
┌─────────────────────────────────────────┐
│    Browser (Mobile/Desktop)             │
│    React Components                      │
└──────────────────┬──────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────┐
│       Vercel (Next.js App)               │
│  ┌───────────────────────────────────┐  │
│  │ App Router Pages (Server Components)│ │
│  │  - app/page.tsx (landing)          │  │
│  │  - app/tools/page.tsx (list)       │  │
│  │  - app/tools/[id]/page.tsx         │  │
│  │  - app/profile/edit/page.tsx       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Server Actions                     │  │
│  │  - auth actions                    │  │
│  │  - tool CRUD actions               │  │
│  │  - profile update actions          │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ API Routes (if needed)             │  │
│  │  - /api/ai/identify-tool (P2)     │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│         Supabase                          │
│  ┌────────────────────────────────────┐  │
│  │ PostgreSQL Database                │  │
│  │  - users table                     │  │
│  │  - tools table                     │  │
│  │  - Full-text search (pg_trgm)     │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Supabase Auth                      │  │
│  │  - Facebook OAuth provider         │  │
│  │  - Session management              │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Supabase Storage                   │  │
│  │  - tools bucket (public photos)    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘

External Services:
- Facebook OAuth API (authentication)
- Google Cloud Vision API (P2 - tool identification)
```

---

## Development Timeline Estimate

**Phase 1 - Setup & Core Features** (P1 priority):
- Next.js project setup + Supabase config: 1 day
- Facebook OAuth with NextAuth.js: 1 day
- User profiles & signup flow: 1 day
- Tool CRUD + listing: 2 days
- Search functionality: 1 day
- Responsive styling (Tailwind): 1 day
- **Total: 7 days**

**Phase 2 - Enhancement** (P2 priority):
- AI tool identification: 2 days
- **Total: 2 days**

**Phase 3 - Deployment & Polish**:
- Vercel deployment + environment vars: 0.5 days (already have account)
- Supabase production setup: 0.5 days
- Manual testing & fixes: 2 days
- **Total: 3 days**

**Overall: 12 days of development time**

(Slightly longer than Flask due to React component development, but saved on deployment setup)

---

## Deployment Strategy

**Frontend (Vercel)**:
- Connect GitHub repository to Vercel
- Automatic deployments on push to `main`
- Environment variables set in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `FACEBOOK_CLIENT_ID`
  - `FACEBOOK_CLIENT_SECRET`
  - `OPENAI_API_KEY` (P2)

**Backend (Supabase)**:
- Create Supabase project
- Run migrations to create tables
- Configure Row Level Security policies
- Create storage bucket for tool photos
- Enable Facebook OAuth provider
- Set up database functions for search (pg_trgm)

**Custom Domain** (optional):
- Configure in Vercel dashboard
- Automatic SSL via Vercel

---

## Risk Assessment

### Low Risks
- Next.js/React/Supabase all proven and stable
- Vercel deployment extremely reliable
- User already familiar with Vercel ecosystem

### Medium Risks
- React complexity vs pure server-side (mitigation: minimize client components)
- Facebook OAuth API changes (mitigation: NextAuth.js abstracts provider details)
- Supabase free tier limits (mitigation: generous limits, paid tier cheap)
- Google Cloud Vision costs (mitigation: free tier, P2 feature can be disabled)

### Mitigation Strategies
- Keep client-side JavaScript minimal (prefer Server Components)
- Use Server Actions instead of API routes where possible (less code)
- Implement feature flags for P2 AI feature (can disable if costs spike)
- Monitor Supabase usage dashboard

---

## Constitution Alignment Review

### ✅ Speed Over Perfection
- Leveraging existing Vercel infrastructure = faster deployment
- Supabase eliminates backend setup time
- Next.js App Router reduces boilerplate vs custom API

### ⚠️ Simple Solutions (Partial Compliance)
- **Concern**: React more complex than server-side templates
- **Justification**: User already paying for Vercel suggests familiarity
- **Mitigation**: Use Server Components by default, minimize client JS
- **Trade-off accepted**: Deployment simplicity (Vercel) outweighs code complexity

### ✅ Security Essentials
- Supabase RLS handles authorization automatically
- NextAuth.js handles OAuth security
- Vercel HTTPS automatic
- TypeScript prevents many bugs at compile time

### ✅ Pragmatic Testing
- Manual testing sufficient
- TypeScript catches many bugs before runtime
- Supabase type generation ensures database safety

---

## Conclusion

Technology stack chosen:
- **Frontend**: Next.js 14+ with React 18+ and TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (frontend), Supabase (backend)
- **AI/OCR**: Google Cloud Vision API (P2)

**Constitution compliance**:
- ⚠️ **Minor deviation**: React complexity vs pure SSR
- ✅ **Justified by**: User infrastructure, deployment simplicity, type safety
- ✅ **Mitigated by**: Server Components preference, minimal client JS

Ready to proceed to Phase 1 (data model and contracts design).
