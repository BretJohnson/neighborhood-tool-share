import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";

function buildUrl(path: string, request: Request) {
  const origin = new URL(request.url).origin;
  return new URL(path, origin);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthErrorDescription = url.searchParams.get("error_description");
  const nextParam = url.searchParams.get("next");
  const nextPath =
    typeof nextParam === "string" && nextParam.startsWith("/")
      ? nextParam
      : "/tools";

  const errorRedirect = buildUrl("/?error=facebook_unavailable", request);

  // Log OAuth errors for debugging
  if (oauthError) {
    console.error("[auth/callback] OAuth error:", oauthError, oauthErrorDescription);
    return NextResponse.redirect(errorRedirect);
  }

  if (!code) {
    console.error("[auth/callback] No authorization code provided");
    return NextResponse.redirect(errorRedirect);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase env vars missing for route handler. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
    return NextResponse.redirect(errorRedirect);
  }

  const supabase = createRouteHandlerClient<Database>(
    { cookies },
    {
      supabaseUrl,
      supabaseKey,
    },
  );

  try {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code,
    );

    if (exchangeError) {
      // Log specific exchange errors for debugging
      console.error("[auth/callback] Code exchange failed:", {
        name: exchangeError.name,
        message: exchangeError.message,
        status: exchangeError.status,
      });

      // Handle specific error cases
      if (exchangeError.message?.includes('refresh_token_not_found')) {
        console.error("[auth/callback] Refresh token not found - possible replay attack or expired code");
      } else if (exchangeError.status === 429) {
        console.error("[auth/callback] Rate limit exceeded - too many auth requests");
      }

      throw exchangeError;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("[auth/callback] No user after successful code exchange");
      return NextResponse.redirect(errorRedirect);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      console.log("[auth/callback] New user detected, redirecting to signup");
      return NextResponse.redirect(buildUrl("/signup", request));
    }

    console.log("[auth/callback] Existing user authenticated successfully");
    return NextResponse.redirect(buildUrl(nextPath, request));
  } catch (error: any) {
    console.error("[auth/callback] Exchange failed", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });
    return NextResponse.redirect(errorRedirect);
  }
}
