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
  const nextParam = url.searchParams.get("next");
  const nextPath =
    typeof nextParam === "string" && nextParam.startsWith("/")
      ? nextParam
      : "/tools";

  const errorRedirect = buildUrl("/?error=facebook_unavailable", request);

  if (oauthError) {
    return NextResponse.redirect(errorRedirect);
  }

  if (!code) {
    return NextResponse.redirect(errorRedirect);
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code,
    );

    if (exchangeError) {
      throw exchangeError;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(errorRedirect);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.redirect(buildUrl("/signup", request));
    }

    return NextResponse.redirect(buildUrl(nextPath, request));
  } catch (error) {
    console.error("[auth/callback] Exchange failed", error);
    return NextResponse.redirect(errorRedirect);
  }
}
