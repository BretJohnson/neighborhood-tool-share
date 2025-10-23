# Quickstart Guide: Abbington Neighborhood Tool Share

**Purpose**: Get the application running locally for development and testing

**Prerequisites**:
- Node.js 18+ and npm (or pnpm/yarn)
- Facebook Developer account (for OAuth app credentials)
- Supabase account (free tier available)
- Git
- Basic command line familiarity

---

## 1. Initial Setup

### Clone Repository & Install Dependencies

```bash
# Clone the repository
cd /path/to/neighborhood-tool-share

# Install dependencies
npm install

# Or using pnpm:
# pnpm install

# Or using yarn:
# yarn install
```

---

## 2. Supabase Project Setup

### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: "Abbington Tool Share"
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to provision (~2 minutes)

### Get Supabase Credentials

1. In your project dashboard, go to Settings → API
2. Note the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) key**: `eyJhbGc...` (long string)
   - **Service role key**: `eyJhbGc...` (different long string) - **Keep secret!**

### Initialize Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the schema from `specs/001-neighborhood-tool-share/data-model.md`
3. Run the SQL migration script:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facebook_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  agreed_to_rules_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_tools_owner_id ON tools(owner_id);
CREATE INDEX idx_tools_search ON tools USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Tools policies
CREATE POLICY "Authenticated users can view all tools"
  ON tools FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own tools"
  ON tools FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own tools"
  ON tools FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own tools"
  ON tools FOR DELETE
  USING (auth.uid() = owner_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Create Storage Bucket

1. In Supabase dashboard, go to Storage
2. Click "New bucket"
3. Create bucket:
   - **Name**: `tools`
   - **Public bucket**: Yes (checked)
   - Click "Create bucket"
4. Set up storage policy:
   - Click on the `tools` bucket
   - Go to "Policies" tab
   - Add policy for INSERT:
     ```sql
     CREATE POLICY "Authenticated users can upload tool photos"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'tools');
     ```
   - Add policy for SELECT (public read):
     ```sql
     CREATE POLICY "Anyone can view tool photos"
     ON storage.objects FOR SELECT
     TO public
     USING (bucket_id = 'tools');
     ```
   - Add policy for DELETE (owner only):
     ```sql
     CREATE POLICY "Users can delete own photos"
     ON storage.objects FOR DELETE
     TO authenticated
     USING (
       bucket_id = 'tools' AND
       auth.uid()::text = (storage.foldername(name))[1]
     );
     ```

---

## 3. Facebook OAuth Setup

### Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" app type
4. Fill in app details:
   - **App Name**: "Abbington Tool Share (Dev)"
   - **App Contact Email**: Your email
5. Click "Create App"

### Configure Facebook Login

1. In app dashboard, add "Facebook Login" product
2. Go to Settings → Basic:
   - Note your **App ID** and **App Secret**
3. Go to Facebook Login → Settings:
   - **Valid OAuth Redirect URIs**:
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://your-supabase-project.supabase.co/auth/v1/callback` (replace with your Supabase URL)
   - Save changes

### Configure Supabase Facebook Auth

1. In Supabase dashboard, go to Authentication → Providers
2. Find "Facebook" in the list and enable it
3. Enter your Facebook credentials:
   - **Facebook Client ID**: Your Facebook App ID
   - **Facebook Client Secret**: Your Facebook App Secret
4. Click "Save"

### Get Credentials

You'll need:
- **Facebook App ID**: Found in Facebook Developer Console → Settings → Basic
- **Facebook App Secret**: Found in Settings → Basic (click "Show")

---

## 4. Environment Configuration

### Create `.env.local` File

Create a file named `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...your-publishable-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...

# Site URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# OpenAI API (P2 Feature - Optional for initial development)
# OPENAI_API_KEY=sk-...
```

**Important**: Never commit `.env.local` to git! It should already be in `.gitignore`.

### Verify Environment Variables

Create a simple test file to verify configuration:

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has publishable key:', !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
console.log('Has service key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
"
```

---

## 5. Generate TypeScript Types from Supabase

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xxxxx

# Generate TypeScript types
npx supabase gen types typescript --project-id xxxxx > lib/supabase/database.types.ts
```

Replace `xxxxx` with your Supabase project ID (found in Project Settings → General).

---

## 6. Run the Application

### Start Development Server

```bash
# Start Next.js development server
npm run dev

# Or with pnpm:
# pnpm dev

# Or with yarn:
# yarn dev

# Application will be available at: http://localhost:3000
```

### Expected Output

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in 2.3s

✓ Compiled in 1.2s
```

---

## 7. Test the Application

### Manual Test Workflow

1. **Open browser**: Navigate to `http://localhost:3000`

2. **Test landing page**:
   - Should see "Sign in with Facebook" button
   - Should see welcome message
   - Navigation should show "Sign In" link

3. **Test Facebook login**:
   - Click "Sign in with Facebook"
   - Authorize the app in Facebook dialog
   - Should redirect to signup form (first time) or tools page (returning user)

4. **Complete signup** (first time only):
   - Fill in:
     - Full Name: "Test User"
     - Address: "123 Test St, Abbington"
     - Phone: "(555) 123-4567"
   - Check "I understand and agree to return all tools in good condition"
   - Click "Complete Signup"
   - Should redirect to tools page

5. **Add a tool**:
   - Click "Add Tool" button
   - Fill in:
     - Name: "Test Drill"
     - Description: "Cordless drill for testing"
   - Upload a photo (optional)
   - Click "Save"
   - Should redirect to tool detail page

6. **Browse tools**:
   - Navigate to "Browse Tools"
   - Should see "Test Drill" in grid
   - Should see owner's name and contact info (click "Show Contact")

7. **Test search**:
   - Type "drill" in search box
   - Should see "Test Drill" (real-time filtering)
   - Type "hammer" - should see "No tools found"

8. **View tool details**:
   - Click on "Test Drill"
   - Should see full description, photo, owner info
   - Should see "Edit" and "Delete" buttons (own tools only)

9. **Edit tool**:
   - Click "Edit" button
   - Change description to "Updated description"
   - Click "Save Changes"
   - Verify changes appear immediately

10. **Delete tool**:
    - Click "Delete" button
    - Should see confirmation dialog: "Are you sure you want to delete this tool?"
    - Click "Delete" to confirm
    - Should redirect to tools list
    - Tool should be gone

11. **Edit profile**:
    - Click user avatar/name in navigation
    - Click "Edit Profile"
    - Change phone number to "(555) 999-8888"
    - Click "Save Changes"
    - Verify change saved (check contact info on tools)

12. **Logout**:
    - Click "Logout" in navigation
    - Should redirect to landing page
    - Should no longer see authenticated navigation

---

## 8. Sample Data (Optional)

### Add Test Data via Supabase Dashboard

1. Go to Supabase dashboard → Table Editor
2. Select `users` table
3. Click "Insert row" and add:
   ```
   facebook_id: test_user_1
   email: alice@example.com
   full_name: Alice Johnson
   address: 123 Oak St, Abbington
   phone_number: (555) 111-2222
   agreed_to_rules_at: 2025-10-22T10:00:00Z
   ```

4. Select `tools` table
5. Click "Insert row" and add:
   ```
   owner_id: [select Alice's UUID from dropdown]
   name: Pressure Washer
   description: 2000 PSI, great for driveways and decks
   ```

### Add Test Data via SQL

In Supabase SQL Editor, run:

```sql
-- Insert test users (use real Facebook IDs for testing, or fake ones for demo)
INSERT INTO users (facebook_id, email, full_name, address, phone_number, agreed_to_rules_at)
VALUES
  ('test_user_1', 'alice@example.com', 'Alice Johnson', '123 Oak St, Abbington', '(555) 111-2222', now()),
  ('test_user_2', 'bob@example.com', 'Bob Williams', '456 Maple Ave, Abbington', '(555) 333-4444', now());

-- Insert test tools (replace UUIDs with actual user IDs from above)
INSERT INTO tools (owner_id, name, description)
SELECT
  u.id,
  tool.name,
  tool.description
FROM users u
CROSS JOIN (
  VALUES
    ('Pressure Washer', '2000 PSI, great for driveways and decks'),
    ('Cordless Drill', 'Ryobi 18V with 2 batteries'),
    ('Lawn Mower', 'Gas powered, self-propelled')
) AS tool(name, description)
WHERE u.facebook_id IN ('test_user_1', 'test_user_2')
LIMIT 3;
```

---

## 9. Troubleshooting

### Issue: "Facebook OAuth Error"

**Symptoms**: Redirect loop or error after Facebook login

**Solutions**:
1. Check redirect URI matches exactly in Facebook app settings:
   - Should be: `https://xxxxx.supabase.co/auth/v1/callback`
   - Get your exact URL from Supabase dashboard → Authentication → Providers → Facebook
2. Verify Facebook App ID and Secret in Supabase Authentication settings
3. Make sure Facebook app is not in "Development Mode" blocking your account
4. Add your Facebook account as a test user in Facebook app dashboard
5. Check browser console for CORS errors
6. Verify `NEXT_PUBLIC_SITE_URL` matches your current URL

---

### Issue: "Supabase Connection Error"

**Symptoms**: `Failed to fetch` or authentication errors

**Solutions**:
1. Verify `.env.local` has correct values:
   ```bash
   npm run env-check  # If you create this script
   ```
2. Check Supabase project is not paused (free tier pauses after 1 week inactivity)
3. Verify API keys are correct in Supabase dashboard → Settings → API
4. Check browser network tab for 401/403 errors
5. Restart Next.js dev server after changing `.env.local`

---

### Issue: "Row Level Security Policy Violation"

**Symptoms**: `new row violates row-level security policy` errors

**Solutions**:
1. Verify you're authenticated (check `supabase.auth.getSession()` returns valid session)
2. Check RLS policies are created correctly in Supabase dashboard → Authentication → Policies
3. For INSERT errors, verify `auth.uid()` matches the user ID you're inserting
4. Run this query to check your session:
   ```sql
   SELECT auth.uid(), auth.role();
   ```
5. Temporarily disable RLS for debugging (re-enable after!):
   ```sql
   ALTER TABLE tools DISABLE ROW LEVEL SECURITY;
   ```

---

### Issue: "Image Upload Fails"

**Symptoms**: 403 error when uploading photos

**Solutions**:
1. Verify storage bucket `tools` exists and is public
2. Check storage policies allow INSERT for authenticated users
3. Verify bucket name in code matches Supabase bucket name
4. Check file size (Supabase free tier limit: 50MB per file)
5. Check allowed MIME types in storage bucket settings
6. Inspect network tab for specific error message

---

### Issue: "Module Not Found" or Import Errors

**Symptoms**: `Cannot find module '@/lib/...'` errors

**Solutions**:
1. Verify dependencies installed: `npm install`
2. Check `tsconfig.json` has correct path aliases:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```
3. Restart TypeScript server in VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
4. Delete `.next` folder and restart dev server:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

### Issue: "TypeScript Errors"

**Symptoms**: Type errors in IDE or build

**Solutions**:
1. Regenerate Supabase types:
   ```bash
   npx supabase gen types typescript --project-id xxxxx > lib/supabase/database.types.ts
   ```
2. Check schema matches TypeScript interfaces
3. Run type checking:
   ```bash
   npx tsc --noEmit
   ```
4. Update `@types/node` and `@types/react` if needed

---

## 10. Development Tips

### Hot Reload

Next.js development server auto-reloads on code changes. Just save your file and the browser will refresh automatically.

### Server Components vs Client Components

**Default to Server Components** (no `'use client'` directive):
- Faster page loads (less JavaScript sent to browser)
- Direct database access via Supabase
- SEO-friendly

**Use Client Components** (`'use client'` at top of file) only when you need:
- React hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`)
- Real-time interactivity

### Database Inspection

Use Supabase dashboard:
- **Table Editor**: View and edit data in spreadsheet format
- **SQL Editor**: Run custom queries
- **Database** → **Roles**: Check permissions
- **Authentication** → **Users**: View authenticated users

Useful SQL queries:

```sql
-- View all users
SELECT * FROM users ORDER BY created_at DESC;

-- View all tools with owner info
SELECT
  t.*,
  u.full_name AS owner_name,
  u.phone_number AS owner_phone
FROM tools t
JOIN users u ON t.owner_id = u.id
ORDER BY t.created_at DESC;

-- Search tools
SELECT * FROM tools
WHERE to_tsvector('english', name || ' ' || COALESCE(description, ''))
      @@ to_tsquery('english', 'drill');

-- Count tools per user
SELECT
  u.full_name,
  COUNT(t.id) AS tool_count
FROM users u
LEFT JOIN tools t ON u.id = t.owner_id
GROUP BY u.id, u.full_name
ORDER BY tool_count DESC;
```

### Clear All Data

```sql
-- Delete all tools (CASCADE will handle foreign keys)
DELETE FROM tools;

-- Delete all users
DELETE FROM users;

-- Reset storage bucket (do this in Supabase dashboard → Storage → tools → Empty bucket)
```

### Debugging Authentication

Add this to any Server Component:

```typescript
import { createServerClient } from '@/lib/supabase/server';

export default async function DebugPage() {
  const supabase = createServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  return (
    <pre>{JSON.stringify({ session, error }, null, 2)}</pre>
  );
}
```

### Inspect Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for requests to Supabase:
   - `/auth/v1/...` - authentication
   - `/rest/v1/...` - database queries
   - `/storage/v1/...` - file uploads

---

## 11. Next Steps

### Ready to Deploy to Vercel?

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [https://vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_SITE_URL` (set to your Vercel domain)

4. **Update Facebook OAuth**:
   - Add Vercel domain to Facebook redirect URIs:
     - `https://your-app.vercel.app/auth/callback`

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Every push to `main` will trigger a new deployment

### Add P2 AI Feature (Tool Identification)?

1. **Set up OpenAI API**:
   - Create account at [https://platform.openai.com](https://platform.openai.com)
   - Generate API key in Dashboard → API Keys
   - Add to `.env.local`:
     ```bash
     OPENAI_API_KEY=sk-...your-api-key...
     ```
   - **Cost**: ~$0.01 per image identification (very affordable)

2. **Install OpenAI SDK**:
   ```bash
   npm install openai
   ```

3. **Create API route** (`app/api/ai/identify-tool/route.ts`):
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import OpenAI from 'openai';

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   });

   export async function POST(request: NextRequest) {
     try {
       const formData = await request.formData();
       const image = formData.get('image') as File;

       if (!image) {
         return NextResponse.json({ error: 'No image provided' }, { status: 400 });
       }

       // Convert image to base64
       const buffer = Buffer.from(await image.arrayBuffer());
       const base64Image = buffer.toString('base64');
       const dataUrl = `data:${image.type};base64,${base64Image}`;

       // Call OpenAI Vision API
       const response = await openai.chat.completions.create({
         model: 'gpt-4o', // or 'gpt-4-vision-preview'
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
                 - features: brief description of notable features

                 If you cannot identify the tool, return {"toolType": null, "brand": null, "model": null, "features": "Could not identify tool from image"}`,
               },
               {
                 type: 'image_url',
                 image_url: { url: dataUrl },
               },
             ],
           },
         ],
         max_tokens: 300,
       });

       const content = response.choices[0]?.message?.content;
       if (!content) {
         return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
       }

       // Parse JSON response
       const toolInfo = JSON.parse(content);

       return NextResponse.json({
         success: true,
         toolInfo,
       });
     } catch (error) {
       console.error('OpenAI API error:', error);
       return NextResponse.json(
         { error: 'Failed to identify tool', details: error.message },
         { status: 500 }
       );
     }
   }
   ```

4. **Add UI** (in `app/tools/add/page.tsx`):
   - Add "Identify from photo" button
   - Show loading state during API call
   - Pre-fill form with AI suggestions (toolType + brand + model → name field)
   - Display features in description field
   - Allow user to review and edit before saving

### Development Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feature/add-notifications
   ```

2. **Make changes** and test locally

3. **Test manually** (per constitution: manual testing preferred):
   - Run through all user flows
   - Test on mobile (Chrome DevTools device emulation)
   - Test with different Facebook accounts

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add email notifications for tool requests"
   git push origin feature/add-notifications
   ```

5. **Deploy preview** (Vercel automatic):
   - Vercel creates preview deployment for every branch
   - Share preview URL with neighbors for feedback

6. **Merge to main**:
   ```bash
   git checkout main
   git merge feature/add-notifications
   git push origin main
   ```

7. **Monitor production**:
   - Check Vercel deployment logs
   - Monitor Supabase dashboard for errors
   - Gather feedback from neighbors

---

## 12. Performance Optimization

### Image Optimization

Next.js automatically optimizes images when using the `<Image>` component:

```tsx
import Image from 'next/image';

<Image
  src={tool.photo_url}
  alt={tool.name}
  width={400}
  height={300}
  className="rounded-lg"
/>
```

**Benefits**:
- Automatic WebP/AVIF conversion
- Lazy loading
- Responsive images
- Automatic sizing

### Caching

Enable Supabase query caching:

```typescript
const { data: tools } = await supabase
  .from('tools')
  .select('*, owner:users(*)')
  .cache(60); // Cache for 60 seconds
```

Use Next.js caching:

```typescript
// Revalidate page every 60 seconds
export const revalidate = 60;

// Or use on-demand revalidation:
import { revalidatePath } from 'next/cache';

async function createTool() {
  // ... create tool
  revalidatePath('/tools');
}
```

### Database Indexes

Already created in schema, but verify in Supabase dashboard → Database → Indexes:
- `idx_tools_owner_id` - speeds up joins
- `idx_tools_search` - speeds up full-text search

---

## Appendix: Full package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  },
  "optionalDependencies": {
    "openai": "^4.20.0"
  }
}
```

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review constitution.md for project principles
3. Review spec.md for requirements
4. Check data-model.md for database schema
5. Review contracts/routes.md for route specifications
6. Check Supabase logs in dashboard → Logs
7. Check Vercel deployment logs
8. Review Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
9. Review Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
