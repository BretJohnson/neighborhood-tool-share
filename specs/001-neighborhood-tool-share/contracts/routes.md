# Routes Contract: Abbington Neighborhood Tool Share

**Framework**: Next.js 14+ App Router
**Rendering**: React Server Components (default) + Client Components (interactive)
**Authentication**: Supabase Auth with Facebook OAuth

**Note**: This uses Next.js App Router with Server Components for most pages and Server Actions for mutations.

---

## Route Overview

| Route | Type | Auth Required | Purpose |
|-------|------|---------------|---------|
| `/` | Page | No | Landing page with login button |
| `/auth/callback` | Route Handler | No | Supabase auth callback |
| `/signup` | Page | Partial* | Complete signup form after OAuth |
| `/tools` | Page | Yes | Browse/search all tools |
| `/tools/add` | Page | Yes | Add new tool form |
| `/tools/[id]` | Page | Yes | View tool details |
| `/tools/[id]/edit` | Page | Yes | Edit tool (owner only) |
| `/profile/edit` | Page | Yes | Edit user profile |
| `/api/ai/identify-tool` | API Route | Yes | AI tool identification (P2) |

*Partial auth: User authenticated via Facebook but hasn't completed signup form

---

##Route Specifications

### Public Routes (No Authentication)

#### `app/page.tsx` - Landing Page

**Type**: Server Component

**Purpose**: Landing page

**Behavior**:
```typescript
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // If logged in, redirect to tools
  if (session) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (user) {
      redirect('/tools');
    } else {
      redirect('/signup');
    }
  }

  // Show landing page with Facebook login button
  return <LandingPage />;
}
```

**UI Components**:
- Hero section with app description
- "Sign in with Facebook" button (Client Component)
- Tool share rules preview

---

#### `app/auth/callback/route.ts` - OAuth Callback

**Type**: Route Handler

**Purpose**: Handle Supabase/Facebook OAuth callback

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to signup or tools page
  return NextResponse.redirect(new URL('/signup', request.url));
}
```

**Error Handling**:
- Invalid code: Redirect to `/` with error message
- Facebook OAuth down: Show friendly error (FR-018)

---

### Authenticated Routes (Partial - Signup Required)

#### `app/signup/page.tsx` - Signup Form

**Type**: Server Component (form) + Client Component (interactive validation)

**Purpose**: Complete signup after Facebook OAuth

**Auth Check**:
```typescript
export default async function SignupPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/');

  // Check if user already completed signup
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (existingUser) redirect('/tools');

  return <SignupForm user={session.user} />;
}
```

**Form** (Client Component with React Hook Form + Zod):
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
  full_name: z.string().min(1).max(255),
  address: z.string().min(1).max(1000),
  phone_number: z.string().regex(/^\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/),
  agree_to_rules: z.boolean().refine(val => val === true, 'Must agree to rules'),
});

export function SignupForm({ user }) {
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: user.user_metadata.full_name || '',
      address: '',
      phone_number: '',
      agree_to_rules: false,
    },
  });

  async function onSubmit(data) {
    await completeSignup(data);
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

**Server Action**:
```typescript
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function completeSignup(formData: {
  full_name: string;
  address: string;
  phone_number: string;
  agree_to_rules: boolean;
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error('Not authenticated');
  if (!formData.agree_to_rules) throw new Error('Must agree to rules');

  const { error } = await supabase.from('users').insert({
    id: session.user.id,
    facebook_id: session.user.id,
    email: session.user.email,
    full_name: formData.full_name,
    address: formData.address,
    phone_number: formData.phone_number,
    agreed_to_rules_at: new Date().toISOString(),
  });

  if (error) throw error;

  revalidatePath('/tools');
  redirect('/tools');
}
```

---

### Fully Authenticated Routes

#### `app/tools/page.tsx` - Browse & Search Tools

**Type**: Server Component (list) + Client Component (search box)

**Purpose**: Browse and search all tools

**Server Component**:
```typescript
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/');

  // Check user completed signup
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!user) redirect('/signup');

  // Fetch tools with owner info
  let query = supabase
    .from('tools')
    .select('*, owner:users(*)');

  if (searchParams.q) {
    // Use full-text search or ILIKE
    query = query.or(
      `name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`
    );
  }

  const { data: tools } = await query;

  return (
    <>
      <SearchBox defaultValue={searchParams.q} />
      <ToolGrid tools={tools} currentUserId={session.user.id} />
    </>
  );
}
```

**Client Component** (search):
```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function SearchBox({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.replace(`/tools?${params.toString()}`);
  }, 300);

  return (
    <input
      type="search"
      placeholder="Search tools..."
      defaultValue={defaultValue}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```

---

#### `app/tools/add/page.tsx` - Add Tool Form

**Type**: Server Component (form wrapper) + Client Component (form with photo upload)

**Server Component**:
```typescript
export default async function AddToolPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/');

  return <AddToolForm userId={session.user.id} />;
}
```

**Client Component Form**:
```typescript
'use client';

export function AddToolForm({ userId }: { userId: string }) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(toolSchema),
  });

  async function onSubmit(data) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    if (data.photo) formData.append('photo', data.photo);

    await createTool(formData);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      form.setValue('photo', file);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      <textarea {...form.register('description')} />
      <input type="file" accept="image/*" onChange={handlePhotoChange} />
      {photoPreview && <img src={photoPreview} alt="Preview" />}
      <button type="submit">Add Tool</button>
    </form>
  );
}
```

**Server Action**:
```typescript
'use server';

export async function createTool(formData: FormData) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error('Not authenticated');

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const photo = formData.get('photo') as File | null;

  // Create tool record
  const { data: tool, error: toolError } = await supabase
    .from('tools')
    .insert({
      owner_id: session.user.id,
      name,
      description: description || null,
    })
    .select()
    .single();

  if (toolError) throw toolError;

  // Upload photo if provided
  if (photo && photo.size > 0) {
    const photoUrl = await uploadToolPhoto(session.user.id, tool.id, photo);

    await supabase
      .from('tools')
      .update({ photo_url: photoUrl })
      .eq('id', tool.id);
  }

  revalidatePath('/tools');
  redirect(`/tools/${tool.id}`);
}

async function uploadToolPhoto(
  userId: string,
  toolId: string,
  file: File
): Promise<string> {
  const supabase = createServerClient();
  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${toolId}_${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from('tools')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('tools')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

---

#### `app/tools/[id]/page.tsx` - Tool Details

**Type**: Server Component

**Purpose**: View tool details with owner info

```typescript
export default async function ToolDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/');

  const { data: tool } = await supabase
    .from('tools')
    .select('*, owner:users(*)')
    .eq('id', params.id)
    .single();

  if (!tool) notFound();

  const isOwner = tool.owner_id === session.user.id;

  return (
    <div>
      <h1>{tool.name}</h1>
      {tool.photo_url && <img src={tool.photo_url} alt={tool.name} />}
      <p>{tool.description}</p>

      <div>
        <h2>Owner</h2>
        <p>{tool.owner.full_name}</p>
        <p>{tool.owner.address}</p>
        <p>{tool.owner.phone_number}</p>
      </div>

      {isOwner && (
        <div>
          <Link href={`/tools/${tool.id}/edit`}>Edit</Link>
          <DeleteToolButton toolId={tool.id} />
        </div>
      )}
    </div>
  );
}
```

---

#### `app/tools/[id]/edit/page.tsx` - Edit Tool

**Type**: Server Component (wrapper) + Client Component (form)

**Authorization Check**:
```typescript
export default async function EditToolPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/');

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!tool) notFound();

  // Authorization check
  if (tool.owner_id !== session.user.id) {
    redirect('/tools'); // Or show 403 page
  }

  return <EditToolForm tool={tool} />;
}
```

**Server Action**:
```typescript
'use server';

export async function updateTool(toolId: string, formData: FormData) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error('Not authenticated');

  // Verify ownership (RLS will also enforce, but explicit check for better UX)
  const { data: tool } = await supabase
    .from('tools')
    .select('owner_id')
    .eq('id', toolId)
    .single();

  if (tool?.owner_id !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const photo = formData.get('photo') as File | null;
  const removePhoto = formData.get('remove_photo') === 'true';

  let updates: any = { name, description: description || null };

  if (removePhoto) {
    // Delete photo from storage and clear URL
    updates.photo_url = null;
    // TODO: Delete from storage
  } else if (photo && photo.size > 0) {
    // Upload new photo
    const photoUrl = await uploadToolPhoto(session.user.id, toolId, photo);
    updates.photo_url = photoUrl;
  }

  const { error } = await supabase
    .from('tools')
    .update(updates)
    .eq('id', toolId);

  if (error) throw error;

  revalidatePath(`/tools/${toolId}`);
  redirect(`/tools/${toolId}`);
}
```

---

#### Delete Tool (Client Component + Server Action)

**Client Component** (confirmation):
```typescript
'use client';

export function DeleteToolButton({ toolId }: { toolId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    if (confirm('Are you sure you want to delete this tool? This cannot be undone.')) {
      await deleteTool(toolId);
    }
  }

  return <button onClick={handleDelete}>Delete Tool</button>;
}
```

**Server Action**:
```typescript
'use server';

export async function deleteTool(toolId: string) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error('Not authenticated');

  // Get tool to delete photo
  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('id', toolId)
    .single();

  if (!tool) throw new Error('Tool not found');
  if (tool.owner_id !== session.user.id) throw new Error('Unauthorized');

  // Delete photo from storage
  if (tool.photo_url) {
    // Extract file path from URL and delete
    // TODO: Implement storage deletion
  }

  // Delete tool (RLS enforces ownership)
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', toolId);

  if (error) throw error;

  revalidatePath('/tools');
  redirect('/tools');
}
```

---

#### `app/profile/edit/page.tsx` - Edit Profile

**Type**: Server Component (wrapper) + Client Component (form)

```typescript
export default async function EditProfilePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/');

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!user) redirect('/signup');

  return <EditProfileForm user={user} />;
}
```

**Server Action**:
```typescript
'use server';

export async function updateProfile(formData: {
  full_name: string;
  address: string;
  phone_number: string;
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('users')
    .update({
      full_name: formData.full_name,
      address: formData.address,
      phone_number: formData.phone_number,
    })
    .eq('id', session.user.id);

  if (error) throw error;

  revalidatePath('/tools');
  redirect('/tools');
}
```

---

### API Routes (P2 Feature)

#### `app/api/ai/identify-tool/route.ts` - AI Tool Identification

**Type**: API Route Handler

**Purpose**: Use OpenAI Vision API to intelligently identify tool from photo

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo') as File;

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    // Convert to base64 data URL
    const buffer = Buffer.from(await photo.arrayBuffer());
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${photo.type};base64,${base64Image}`;

    // Call OpenAI Vision API with structured prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4 with vision support
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this tool image and extract information.
              Return ONLY valid JSON with these keys:
              - toolType: the type of tool (e.g., "Cordless Drill", "Pressure Washer")
              - brand: brand name if visible (or null)
              - model: model number if visible (or null)
              - features: brief description of notable features (e.g., "18V battery, 2-speed")

              If you cannot identify the tool, return:
              {"toolType": null, "brand": null, "model": null, "features": "Could not identify tool from image"}`,
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.1, // Low temperature for more consistent results
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse structured JSON response
    const toolInfo = JSON.parse(content);

    // Generate suggested name from components
    const nameParts = [toolInfo.brand, toolInfo.model, toolInfo.toolType]
      .filter(Boolean);
    const suggestedName = nameParts.length > 0
      ? nameParts.join(' ')
      : 'Unknown Tool';

    return NextResponse.json({
      success: true,
      toolInfo,
      suggestedName,
      suggestedDescription: toolInfo.features || '',
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to identify tool',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

**Response Format**:
```typescript
{
  success: true,
  toolInfo: {
    toolType: "Cordless Drill",
    brand: "DeWalt",
    model: "DCD771C2",
    features: "20V MAX, 1/2 inch chuck, LED light"
  },
  suggestedName: "DeWalt DCD771C2 Cordless Drill",
  suggestedDescription: "20V MAX, 1/2 inch chuck, LED light"
}
```

**Error Response**:
```typescript
{
  error: "Failed to identify tool",
  details: "Rate limit exceeded"
}
```

---

## Middleware (Authentication)

**middleware.ts** (root):
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## Error Handling

### Error Pages

**app/not-found.tsx**:
```typescript
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link href="/tools">Go to Tools</Link>
    </div>
  );
}
```

**app/error.tsx**:
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## Form Validation Schemas

**lib/validations.ts**:
```typescript
import { z } from 'zod';

export const userProfileSchema = z.object({
  full_name: z.string().min(1).max(255),
  address: z.string().min(1).max(1000),
  phone_number: z.string().regex(
    /^\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    'Invalid US phone number'
  ),
});

export const toolSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  photo: z.instanceof(File).optional(),
});

export const signupSchema = userProfileSchema.extend({
  agree_to_rules: z.boolean().refine(val => val === true),
});
```

---

## Security Patterns

### CSRF Protection
- Next.js Server Actions have built-in CSRF protection
- No additional setup needed

### XSS Prevention
- React auto-escapes JSX by default
- Dangerous HTML must explicitly use `dangerouslySetInnerHTML`

### Authorization
- Row Level Security (RLS) in Supabase enforces ownership
- Application checks provide better error messages
- Always check ownership before mutations

### Input Validation
- Zod schemas on server and client
- Server Actions validate before database operations
- Supabase types ensure type safety

---

## Performance Optimizations

### Server Components (Default)
- Reduce JavaScript sent to client
- Fetch data close to source (Supabase)
- Automatic code splitting

### Client Components (Sparingly)
- Only for interactivity (search, forms, dialogs)
- Use `'use client'` directive minimally
- Leverage React 18 concurrent features

### Caching Strategy
```typescript
// Revalidate tool list when tools change
revalidatePath('/tools');

// Revalidate specific tool
revalidatePath(`/tools/${toolId}`);

// Opt out of caching for dynamic data
export const revalidate = 0; // or fetchCache = 'force-no-store'
```

---

## URL Patterns

| Pattern | Example | Purpose |
|---------|---------|---------|
| `/` | `/` | Landing |
| `/auth/callback` | `/auth/callback?code=...` | OAuth |
| `/signup` | `/signup` | Complete profile |
| `/tools` | `/tools` | All tools |
| `/tools?q=drill` | `/tools?q=drill` | Search |
| `/tools/add` | `/tools/add` | Add tool |
| `/tools/[id]` | `/tools/abc-123` | Tool details |
| `/tools/[id]/edit` | `/tools/abc-123/edit` | Edit tool |
| `/profile/edit` | `/profile/edit` | Edit profile |
| `/api/ai/identify-tool` | POST `/api/ai/identify-tool` | AI feature (P2) |
