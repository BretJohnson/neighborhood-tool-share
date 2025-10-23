# neighborhood-tool-share Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-22

## Active Technologies

- TypeScript 5.x + Node.js 18+, Next.js 14+ (App Router), React 18+, Supabase (PostgreSQL + Auth + Storage), Tailwind CSS, Zod, React Hook Form, OpenAI API (P2) (001-neighborhood-tool-share)

## Project Structure

```text
app/                 # Next.js App Router pages and layouts
components/          # Reusable React components (UI, auth, tools, layout)
lib/                 # Utilities (Supabase clients, Server Actions, schemas, utils)
public/              # Static assets
supabase/            # Supabase migrations and config
```

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Next.js development server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check without emitting files
```

## Code Style

- TypeScript 5.x: Strict mode enabled, use explicit types
- React: Prefer Server Components (default), use Client Components only for interactivity
- Naming: PascalCase for components, camelCase for functions/variables
- Imports: Use `@/` alias for absolute imports from project root
- Validation: Use Zod schemas for all form inputs

## Architecture Patterns

### Server Components (Default)
- Use for pages that don't need client-side interactivity
- Can directly access Supabase from Server Components
- Example: `app/tools/page.tsx` (tool listing)

### Client Components
- Add `'use client'` directive at top of file
- Use only when you need: useState, useEffect, event handlers, browser APIs
- Example: `components/tools/SearchBox.tsx`

### Server Actions
- Create in `lib/actions/` directory
- Add `'use server'` directive at top of file
- Use for form mutations (create, update, delete)
- Example: `lib/actions/tools.ts`

### Supabase Access
- Server-side: `createServerClient()` from `lib/supabase/server.ts`
- Client-side: `createClient()` from `lib/supabase/client.ts`
- Always check auth before mutations: `await supabase.auth.getSession()`

### Validation
- Define Zod schemas in `lib/schemas/`
- Validate on both client (form feedback) and server (security)
- Example:
  ```typescript
  import { z } from 'zod';
  export const toolSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(5000).optional(),
  });
  ```

## Recent Changes

- 001-neighborhood-tool-share: Updated to Next.js 14+ + TypeScript + Supabase stack (replaced Flask/Python)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
