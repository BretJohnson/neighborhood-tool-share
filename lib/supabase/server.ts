import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type CookieOptions = {
  secure?: boolean;
  httpOnly?: boolean;
  domain?: string;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  maxAge?: number;
  expires?: Date;
};

export function getSupabaseServerClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase server client env vars are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions = {}) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions = {}) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}
