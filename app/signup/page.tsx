import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card } from "@/components/ui/Card";
import { TOOL_SHARE_RULES } from "@/lib/constants/community";

export default async function SignupPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profileData } = await supabase
    .from("users")
    .select("full_name, address, phone_number")
    .eq("id", user.id)
    .maybeSingle<{
      full_name: string | null;
      address: string | null;
      phone_number: string | null;
    }>();

  const profile = profileData as
    | {
        full_name: string | null;
        address: string | null;
        phone_number: string | null;
      }
    | null;

  if (profile) {
    redirect("/tools");
  }

  const defaultValues = {
    full_name:
      (user.user_metadata?.["full_name"] as string | undefined) ??
      "",
    address: "",
    phone_number: "",
    agreeToRules: false,
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <Card className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Complete your profile</h1>
          <p className="text-sm text-muted">
            We only need an address and mobile number so neighbors can coordinate
            safely.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background/40 px-4 py-3 text-sm text-muted">
          <p className="font-medium text-foreground">
            Abbington Tool Share rules
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {TOOL_SHARE_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <SignupForm
          defaultValues={defaultValues}
          email={user.email}
        />
      </Card>
    </div>
  );
}
