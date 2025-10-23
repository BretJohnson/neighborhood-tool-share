import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type TypedSupabaseClient = SupabaseClient<Database>;

export function getSupabaseServerClient(): TypedSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase server client env vars are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return (createServerComponentClient<Database>(
    { cookies },
    {
      supabaseUrl: url,
      supabaseKey: anonKey,
    },
  ) as unknown) as TypedSupabaseClient;
}
