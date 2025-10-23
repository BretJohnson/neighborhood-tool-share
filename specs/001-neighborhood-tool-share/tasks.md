---

description: "Task list for Abbington Neighborhood Tool Share implementation"
---

# Tasks: Abbington Neighborhood Tool Share

**Input**: Design documents from `/specs/001-neighborhood-tool-share/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routes.md

**Tests**: Per constitution (Pragmatic Testing principle), automated tests are OPTIONAL. Manual testing workflow documented in quickstart.md. No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js 14+ App Router structure:
- **App routes**: `app/` directory (file-based routing)
- **Components**: `components/` directory
- **Utilities**: `lib/` directory
- **Database**: `supabase/migrations/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

      - [x] T001 Initialize Next.js 14+ project with TypeScript and Tailwind CSS
      - [x] T002 [P] Install dependencies: next, react, typescript, tailwindcss, @supabase/supabase-js, @supabase/auth-helpers-nextjs, zod, react-hook-form, @hookform/resolvers
      - [x] T003 [P] Configure TypeScript in tsconfig.json with strict mode and path aliases (@/)
      - [x] T004 [P] Configure Tailwind CSS in tailwind.config.js and app/globals.css
      - [x] T005 [P] Create .env.local template with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY placeholders
      - [x] T006 [P] Configure next.config.js with image domains for Supabase storage
      - [x] T007 [P] Create .gitignore entries for .env.local, .next, node_modules
      - [x] T008 Create project folder structure: app/, components/, lib/, public/, supabase/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Authentication Foundation

- [x] T09 Create Supabase migration file supabase/migrat0ions/20251022000001_initial_schema.sql with users and tools tables
- [x] T010 [P] Add Row Level Security (RLS) policies for users table in migration
- [x] T011 [P] Add Row Level Security (RLS) policies for tools table in migration
- [x] T012 [P] Add database triggers for updated_at timestamps in migration
- [x] T013 [P] Add full-text search function search_tools() in migration
- [x] T014 [P] Create Supabase storage bucket configuration for tool photos

### TypeScript Types & Validation

- [x] T015 [P] Generate TypeScript types from Supabase schema in lib/supabase/database.types.ts
- [x] T016 [P] Create Zod validation schema for user profile in lib/schemas/user.ts
- [x] T017 [P] Create Zod validation schema for tools in lib/schemas/tool.ts

### Supabase Client Setup

- [x] T018 [P] Create client-side Supabase client in lib/supabase/client.ts
- [x] T019 [P] Create server-side Supabase client in lib/supabase/server.ts
- [x] T020 [P] Create utility functions for formatting in lib/utils/formatting.ts

### Base UI Components

- [x] T021 [P] Create Button component in components/ui/Button.tsx
- [x] T022 [P] Create Input component in components/ui/Input.tsx
- [x] T023 [P] Create Card component in components/ui/Card.tsx
- [x] T024 [P] Create Dialog component in components/ui/Dialog.tsx

### Layout & Navigation

- [x] T025 Create root layout in app/layout.tsx with navigation and metadata
- [x] T026 [P] Create Navigation component in components/layout/Navigation.tsx
- [x] T027 [P] Create Footer component in components/layout/Footer.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 2 - First-Time Registration and Agreement (Priority: P1) 🎯 MVP Foundation

**Goal**: Enable Facebook authentication and user profile creation with agreement to tool share rules

**Why First**: Authentication is foundational - all other features require knowing who the user is. Without this, no one can access the system.

**Independent Test**: Go through signup flow as a new Facebook user, verify profile data is collected and stored, confirm user can access authenticated pages after signup.

### Implementation for User Story 2

- [x] T028 [P] [US2] Create SignInButton component with Facebook OAuth in components/auth/SignInButton.tsx
- [x] T029 [P] [US2] Create landing page in app/page.tsx with Facebook login button and tool share rules preview
- [x] T030 [P] [US2] Create OAuth callback route handler in app/auth/callback/route.ts
- [x] T031 [US2] Create signup page in app/signup/page.tsx with auth check and redirect logic
- [x] T032 [US2] Create SignupForm client component in components/auth/SignupForm.tsx with React Hook Form and Zod validation
- [x] T033 [US2] Create completeSignup server action in lib/actions/auth.ts
- [x] T034 [US2] Add phone number validation regex to user schema
- [x] T035 [US2] Add error handling for Facebook OAuth unavailability in callback route
- [ ] T036 [US2] Configure Supabase Auth provider for Facebook OAuth (manual step in Supabase dashboard)

**Checkpoint**: Users can sign in with Facebook, complete profile, and access authenticated pages

---

## Phase 4: User Story 1 - Browse and Search Available Tools (Priority: P1) 🎯 MVP Core Value

**Goal**: Enable logged-in users to browse all tools and search by keywords

**Why Second**: This is the core value proposition - seeing what's available. Depends on authentication (US2) but delivers immediate value once implemented.

**Independent Test**: Add sample tools to database, log in as user, verify all tools display, test search filtering by typing keywords.

### Implementation for User Story 1

- [ ] T037 [P] [US1] Create tools browse/search page in app/tools/page.tsx with server component for data fetching
- [ ] T038 [P] [US1] Create SearchBox client component in components/tools/SearchBox.tsx with debounced search
- [ ] T039 [P] [US1] Create ToolCard component in components/tools/ToolCard.tsx for grid display
- [ ] T040 [US1] Create ToolGrid component in components/tools/ToolGrid.tsx
- [ ] T041 [US1] Add authentication check and redirect logic to tools page
- [ ] T042 [US1] Implement search query parameter handling in tools page
- [ ] T043 [US1] Add full-text search query using Supabase or ILIKE pattern matching
- [ ] T044 [US1] Add responsive grid layout with Tailwind CSS for mobile and desktop
- [ ] T045 [US1] Fetch tools with owner information using Supabase join query

**Checkpoint**: Users can browse all tools in responsive grid and filter by search keywords

---

## Phase 5: User Story 3 - Add Tools to Share (Priority: P1) 🎯 MVP Tool Inventory

**Goal**: Enable users to add tools they own with name, description, and optional photo

**Why Third**: Without tools in the system, there's nothing to browse. This completes the core MVP loop: signup → browse → add tools.

**Independent Test**: Log in as user, add several tools with different attributes (with/without photos), verify tools appear in browse/search results.

### Implementation for User Story 3

- [ ] T046 [P] [US3] Create add tool page in app/tools/add/page.tsx with auth check
- [ ] T047 [P] [US3] Create AddToolForm client component in components/tools/ToolForm.tsx with photo upload
- [ ] T048 [P] [US3] Create createTool server action in lib/actions/tools.ts
- [ ] T049 [P] [US3] Create uploadToolPhoto utility in lib/actions/tools.ts for Supabase storage
- [ ] T050 [US3] Add photo preview functionality in ToolForm component
- [ ] T051 [US3] Add file type and size validation for photo uploads
- [ ] T052 [US3] Implement form validation with Zod schema
- [ ] T053 [US3] Add error handling for storage upload failures
- [ ] T054 [US3] Add success redirect to tool detail page after creation
- [ ] T055 [P] [US3] Create tool detail page in app/tools/[id]/page.tsx showing tool info and owner contact
- [ ] T056 [US3] Add authorization check in tool detail page (authenticated users only)
- [ ] T057 [US3] Display owner name, address, and phone number for logged-in users
- [ ] T058 [US3] Add edit/delete buttons for tool owners on detail page
- [ ] T059 [P] [US3] Create edit tool page in app/tools/[id]/edit/page.tsx with ownership verification
- [ ] T060 [US3] Create EditToolForm component reusing ToolForm with pre-populated data
- [ ] T061 [US3] Create updateTool server action in lib/actions/tools.ts
- [ ] T062 [US3] Add photo replacement functionality (upload new or remove existing)
- [ ] T063 [P] [US3] Create DeleteToolButton client component in components/tools/DeleteConfirm.tsx
- [ ] T064 [US3] Create deleteTool server action in lib/actions/tools.ts
- [ ] T065 [US3] Add confirmation dialog before deleting tool
- [ ] T066 [US3] Add photo cleanup from storage when tool is deleted

**Checkpoint**: Users can add, view, edit, and delete their own tools with photos

---

## Phase 6: User Profile Management (Priority: P1) 🎯 MVP Profile Updates

**Goal**: Enable users to edit their profile information (name, address, phone) after signup

**Why Fourth**: Users need ability to update contact info. Completes the MVP feature set for launch.

**Independent Test**: Log in as existing user, update profile fields, verify changes persist and display correctly.

### Implementation for User Profile

- [ ] T067 [P] [US2] Create profile edit page in app/profile/edit/page.tsx with auth check
- [ ] T068 [US2] Create ProfileForm client component with React Hook Form
- [ ] T069 [US2] Create updateProfile server action in lib/actions/profile.ts
- [ ] T070 [US2] Add phone number validation on profile update
- [ ] T071 [US2] Add success message and redirect after profile update

**Checkpoint**: Users can edit all profile fields and changes are validated and saved

---

## Phase 7: User Story 4 - AI-Assisted Tool Entry via Photo (Priority: P2) 🚀 Enhanced UX

**Goal**: Enable users to upload a photo of a tool with visible model number and have AI auto-populate tool details

**Why P2**: This is a convenience feature that reduces friction but core functionality (manual entry) works without it.

**Independent Test**: Upload photos of various tools with visible model numbers, verify auto-populated information is accurate, test fallback when AI cannot identify.

### Implementation for User Story 4

- [ ] T072 [P] [US4] Create AI tool identification API route in app/api/ai/identify-tool/route.ts
- [ ] T073 [P] [US4] Install OpenAI SDK dependency: openai
- [ ] T074 [US4] Implement OpenAI Vision API call to extract tool information from photo
- [ ] T075 [US4] Add OPENAI_API_KEY to environment variables
- [ ] T076 [US4] Create response parser to extract tool name, brand, description from AI response
- [ ] T077 [US4] Add "Use AI to identify tool" toggle to ToolForm component
- [ ] T078 [US4] Add photo upload and AI identification flow in ToolForm
- [ ] T079 [US4] Display AI-populated fields as editable (user can review/modify)
- [ ] T080 [US4] Add error handling when AI cannot identify tool
- [ ] T081 [US4] Add guidance message for taking good photos (model number visible)
- [ ] T082 [US4] Add loading state during AI processing

**Checkpoint**: Users can optionally use AI to identify tools from photos, with manual override capability

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T083 [P] Add loading states for all server actions
- [ ] T084 [P] Add error boundary components for graceful error handling
- [ ] T085 [P] Add toast notifications for success/error feedback
- [ ] T086 [P] Optimize images with Next.js Image component
- [ ] T087 [P] Add metadata and SEO tags to all pages
- [ ] T088 [P] Test responsive design on mobile devices (320px-768px)
- [ ] T089 [P] Test responsive design on desktop (1024px-1920px+)
- [ ] T090 Add loading.tsx files for route segments
- [ ] T091 Add error.tsx files for error handling
- [ ] T092 Add not-found.tsx for 404 pages
- [ ] T093 [P] Add favicon and logo to public/images/
- [ ] T094 [P] Create README.md with setup instructions
- [ ] T095 Run quickstart.md manual test workflow to validate all features
- [ ] T096 Configure Vercel deployment settings
- [ ] T097 Configure Supabase environment variables in Vercel
- [ ] T098 Test production build with npm run build
- [ ] T099 Deploy to Vercel and verify all features work in production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - **US2 (Phase 3)**: Must complete first (authentication foundation)
  - **US1 (Phase 4)**: Can start after US2 complete (needs auth)
  - **US3 (Phase 5)**: Can start after US2 complete (needs auth, independent of US1 but builds on it)
  - **Profile (Phase 6)**: Can start after US2 complete (extends US2 functionality)
  - **US4 (Phase 7)**: Can start after US3 complete (extends tool creation)
- **Polish (Phase 8)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 2 (P1 - Auth)**: Can start after Foundational (Phase 2) - BLOCKS all other stories
- **User Story 1 (P1 - Browse)**: Depends on US2 (needs authentication) - Independent of US3
- **User Story 3 (P1 - Add Tools)**: Depends on US2 (needs authentication) - Can work in parallel with US1
- **Profile Management (P1)**: Depends on US2 (extends auth functionality)
- **User Story 4 (P2 - AI)**: Depends on US3 (extends tool creation) - P2 feature, optional for MVP

### Within Each User Story

- Server Actions before Client Components that call them
- Base components before composed components
- Data fetching logic before UI rendering
- Validation schemas before forms that use them

### Parallel Opportunities

**Phase 1 (Setup)**: T002-T008 can all run in parallel

**Phase 2 (Foundational)**:
- Database group: T010, T011, T012, T013, T014 can run in parallel
- Types group: T015, T016, T017 can run in parallel (after T009)
- Clients group: T018, T019, T020 can run in parallel
- UI components: T021, T022, T023, T024 can run in parallel
- Layout: T026, T027 can run in parallel (after T025)

**Phase 3 (US2)**: T028, T029, T030 can run in parallel

**Phase 4 (US1)**: T037, T038, T039 can run in parallel

**Phase 5 (US3)**:
- T046, T047, T048, T049 can run in parallel
- T055, T059, T063 can run in parallel (detail/edit/delete pages)

**Phase 6 (Profile)**: T067 can start in parallel with other profile tasks

**Phase 7 (US4)**: T072, T073 can run in parallel

**Phase 8 (Polish)**: Most tasks marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all database policies together (Phase 2):
Task: "Add Row Level Security (RLS) policies for users table in migration"
Task: "Add Row Level Security (RLS) policies for tools table in migration"
Task: "Add database triggers for updated_at timestamps in migration"
Task: "Add full-text search function search_tools() in migration"

# Launch all UI base components together:
Task: "Create Button component in components/ui/Button.tsx"
Task: "Create Input component in components/ui/Input.tsx"
Task: "Create Card component in components/ui/Card.tsx"
Task: "Create Dialog component in components/ui/Dialog.tsx"
```

---

## Parallel Example: User Story 1

```bash
# Launch page and components together (Phase 4):
Task: "Create tools browse/search page in app/tools/page.tsx with server component for data fetching"
Task: "Create SearchBox client component in components/tools/SearchBox.tsx with debounced search"
Task: "Create ToolCard component in components/tools/ToolCard.tsx for grid display"
```

---

## Implementation Strategy

### MVP First (Phase 1-6: Setup → Auth → Browse → Add Tools → Profile)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T027) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 2 - Authentication (T028-T036)
4. Complete Phase 4: User Story 1 - Browse Tools (T037-T045)
5. Complete Phase 5: User Story 3 - Add Tools (T046-T066)
6. Complete Phase 6: Profile Management (T067-T071)
7. **STOP and VALIDATE**: Run quickstart.md manual tests for all MVP features
8. **Deploy MVP**: Core functionality ready for neighborhood use

### Post-MVP Enhancement

9. Complete Phase 7: User Story 4 - AI Tool Identification (T072-T082) - P2 feature
10. Complete Phase 8: Polish (T083-T099)
11. **Final Validation**: Full manual test cycle
12. **Production Deploy**: Complete system with all features

### Incremental Delivery

1. **Foundation** (Phases 1-2): Project structure and database → Foundation ready
2. **MVP Increment 1** (Phase 3): Authentication → Users can sign up
3. **MVP Increment 2** (Phase 4): Browse tools → Users can see available tools (requires sample data)
4. **MVP Increment 3** (Phase 5): Add tools → Users can list their tools
5. **MVP Increment 4** (Phase 6): Profile updates → Users can update contact info
6. **🎯 MVP COMPLETE** - Ready for neighborhood launch
7. **Enhancement** (Phase 7): AI identification → Easier tool entry
8. **Polish** (Phase 8): Production ready

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup (Phase 1) + Foundational (Phase 2)
2. **Sequential for MVP**: US2 (Auth) → US1 (Browse) → US3 (Add Tools) → Profile
   - Auth must complete first (blocks others)
   - Browse and Add Tools could be parallel but share UI patterns, so sequential is cleaner
3. **Parallel post-MVP**:
   - Developer A: Phase 7 (AI feature)
   - Developer B: Phase 8 (Polish tasks)

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Constitution compliance**: No automated tests per Pragmatic Testing principle (manual test workflow in quickstart.md)
- **Tech stack**: Next.js 14+ App Router, TypeScript, Supabase, Tailwind CSS
- **File paths**: All paths follow Next.js App Router conventions
- **Server Components default**: Most pages are Server Components, Client Components only for interactivity
- **Server Actions**: Mutations use Server Actions (lib/actions/) instead of API routes
- **Type safety**: TypeScript throughout, auto-generated types from Supabase
- **Authentication**: Supabase Auth with Facebook OAuth
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage for tool photos
- **Deployment**: Vercel (frontend + API routes) + Supabase (database + storage)

**MVP Scope**: Phases 1-6 (99 tasks: T001-T071 + foundation tasks)
**Full Feature Set**: Phases 1-8 (99 total tasks)

**Estimated MVP Timeline**: 8-10 days (per research.md)
**Estimated Full Timeline**: 12 days including AI feature and polish
