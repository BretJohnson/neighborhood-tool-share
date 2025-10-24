import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { SignInButton } from "@/components/auth/SignInButton";
import { TOOL_SHARE_RULES } from "@/lib/constants/community";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Home({ searchParams }: PageProps) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasProfile = false;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    hasProfile = Boolean(profile);
  }

  const errorParam = searchParams?.error;
  const errorCode = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  let authErrorMessage: string | null = null;
  if (errorCode === "facebook_unavailable") {
    authErrorMessage =
      "Facebook sign-in is temporarily unavailable. Please try again in a minute.";
  }

  return (
    <div className="space-y-8">
      {authErrorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {authErrorMessage}
        </div>
      )}

      <Card className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold md:text-5xl">
            Welcome to the Abbington Neighborhood Tool Share
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Save money, save space, and borrow tools from trusted neighbors. We
            use Facebook for quick sign-in so you always know who you&apos;re
            coordinating with.
          </p>
        </div>

        {user ? (
          <div className="flex flex-wrap items-center gap-3">
            {hasProfile ? (
              <>
                <span className="text-sm text-muted-foreground">
                  You&apos;re signed in and ready to browse.
                </span>
                <Link
                  href="/tools"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-card transition hover:shadow-card-hover hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Go to tool list
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">
                  Finish setting up your profile so neighbors know how to reach
                  you.
                </span>
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-card transition hover:shadow-card-hover hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Complete signup
                </Link>
              </>
            )}
          </div>
        ) : (
          <SignInButton />
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-2xl font-medium text-foreground">Tool share rules</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Agreeing to the rules keeps the program running smoothly for everyone
          in Abbington. Here&apos;s what we ask:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground">
          {TOOL_SHARE_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          You&apos;ll confirm these during signup, and you can revisit them any
          time from your profile page.
        </p>
      </Card>
    </div>
  );
}
