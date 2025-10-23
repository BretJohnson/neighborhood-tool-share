"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type TypedSupabaseClient = SupabaseClient<Database>;

let cachedClient: TypedSupabaseClient | null = null;

export function getSupabaseBrowserClient(): TypedSupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase client env vars are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  cachedClient = (createClientComponentClient<Database>({
    supabaseUrl: url,
    supabaseKey: publishableKey,
  }) as unknown) as TypedSupabaseClient;
  return cachedClient;
}
