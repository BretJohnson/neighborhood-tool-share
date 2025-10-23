"use client";

import { useCallback, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button, type ButtonProps } from "@/components/ui/Button";

interface SignInButtonProps extends Omit<ButtonProps, "onClick"> {
  redirectTo?: string;
}

export function SignInButton({
  redirectTo = "/auth/callback",
  ...buttonProps
}: SignInButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSignIn = useCallback(async () => {
    setError(null);
    setPending(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const redirectUrl = origin ? `${origin}${redirectTo}` : redirectTo;

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: redirectUrl,
          scopes: "public_profile,email",
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (err) {
      console.error("[SignInButton] Facebook OAuth failed", err);
      setError(
        "Facebook is unavailable right now. Please try again in a moment.",
      );
      setPending(false);
    }
  }, [redirectTo]);

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        type="button"
        onClick={handleSignIn}
        loading={pending}
        className="w-full"
        {...buttonProps}
      >
        Continue with Facebook
      </Button>
      {error && (
        <span className="text-sm text-red-500" role="status">
          {error}
        </span>
      )}
    </div>
  );
}
