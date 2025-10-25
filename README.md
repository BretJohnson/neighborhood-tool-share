# Abbington Neighborhood Tool Share

A web application for sharing tools among neighbors in the Abbington community. Built with Next.js, TypeScript, and Supabase.

## Features

- **Facebook Authentication**: Sign in with your Facebook account to access the platform
- **Browse Tools**: Search and browse all available tools in the neighborhood
- **Add Tools**: Share your tools with photos and descriptions
- **Edit/Delete Tools**: Manage your own tool listings
- **AI Tool Identification** (P2): Upload a photo and let AI identify the tool details
- **User Profiles**: Update your contact information
- **Responsive Design**: Works seamlessly on mobile and desktop devices

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript 5.x
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Facebook OAuth
- **Storage**: Supabase Storage for tool photos
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod validation
- **AI**: OpenAI GPT-4 Vision API (P2 feature)

## Prerequisites

- Node.js 18+ installed
- A Supabase account with a project set up
- Facebook Developer account (for OAuth)
- OpenAI API key (optional, for AI tool identification feature)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd neighborhood-tool-share
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.local` file and fill in your credentials:

```bash
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# OpenAI configuration (optional - for P2 AI feature)
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set up Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migration**: Go to the SQL Editor in Supabase and run the migration from `supabase/migrations/20251022000001_initial_schema.sql`

3. **Configure Facebook OAuth**:
   - Go to Authentication > Providers in Supabase
   - Enable Facebook provider
   - Add your Facebook App ID and App Secret
   - Add the callback URL to your Facebook app settings

4. **Create the storage bucket**:
   - Go to Storage in Supabase
   - Create a public bucket named `tools`
   - Set file size limit to 5MB
   - Allow JPEG, PNG, and WebP formats

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                    # Next.js App Router pages
├── api/               # API routes (AI identification)
├── auth/              # Authentication callbacks
├── profile/           # User profile pages
├── tools/             # Tool browsing, adding, editing
└── layout.tsx         # Root layout with navigation

components/            # React components
├── auth/             # Authentication components
├── layout/           # Navigation and footer
├── profile/          # Profile form
├── tools/            # Tool-related components
└── ui/               # Reusable UI components

lib/                   # Utilities and helpers
├── actions/          # Server Actions (auth, tools, profile)
├── schemas/          # Zod validation schemas
├── supabase/         # Supabase client setup
└── utils/            # Utility functions

supabase/migrations/   # Database migration files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Type check without emitting files

## Key Features

### Facebook Authentication

Users sign in with their Facebook account. On first login, they complete a signup form with:
- Full name
- Address (within Abbington)
- Phone number
- Agreement to tool share rules

### Tool Management

**Browse Tools**: View all available tools with search functionality

**Add Tools**:
- Enter tool name and description
- Upload optional photo
- AI identification (P2): Upload a photo and have AI auto-populate tool details

**Tool Details**: View owner contact information to arrange borrowing

**Edit/Delete**: Owners can edit or delete their own tools

### User Profiles

Users can update their contact information anytime from the profile page.

## Database Schema

### Users Table

- `id` (UUID, primary key)
- `facebook_id` (unique)
- `full_name`
- `address`
- `phone_number`
- `email` (optional)
- `agreed_to_rules_at` (timestamp)
- `created_at`, `updated_at`

### Tools Table

- `id` (UUID, primary key)
- `owner_id` (foreign key → users)
- `name`
- `description` (optional)
- `photo_url` (optional)
- `created_at`, `updated_at`

## Security

- **Row Level Security (RLS)**: Enforced at database level
- **Authentication**: Required for all tool operations
- **Authorization**: Users can only modify their own tools
- **Input Validation**: Zod schemas on client and server
- **XSS Prevention**: React auto-escaping
- **SQL Injection Prevention**: Parameterized queries via Supabase

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel settings
4. Deploy!

Vercel automatically handles:
- HTTPS
- Automatic deployments on push
- Preview deployments for branches

### Configure Supabase Environment

Make sure to set the same environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY` (if using AI feature)

## Contributing

This is a private neighborhood application. For feature requests or bug reports, please contact the Abbington community administrators.

## License

Private - Abbington Community Use Only
