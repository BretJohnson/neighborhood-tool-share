"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  UserSignupSchema,
  type UserSignupInput,
} from "@/lib/schemas/user";

type SignupSuccess = { success: true };
type SignupFailure = { success: false; message: string };
export type SignupActionResult = SignupSuccess | SignupFailure;

function extractFacebookId(user: {
  identities?: Array<{
    provider?: string;
    identity_data?: Record<string, unknown>;
  }> | null;
  user_metadata?: Record<string, unknown>;
  id: string;
}): string {
  const identityId = user.identities
    ?.find((identity) => identity.provider === "facebook")
    ?.identity_data?.id;

  const metadataId =
    user.user_metadata?.["provider_id"] ??
    user.user_metadata?.["sub"] ??
    user.user_metadata?.["id"];

  return (
    (typeof identityId === "string" && identityId) ||
    (typeof metadataId === "string" && metadataId) ||
    user.id
  );
}

export async function completeSignup(
  rawInput: UserSignupInput,
): Promise<SignupActionResult> {
  const parsed = UserSignupSchema.safeParse(rawInput);
  if (!parsed.success) {
    const message =
      parsed.error.errors[0]?.message ?? "Please review the signup form.";
    return { success: false, message };
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "We could not verify your Facebook session. Please sign in again.",
    };
  }

  const facebookId = extractFacebookId(user);
  const payload = {
    id: user.id,
    facebook_id: facebookId,
    full_name: parsed.data.full_name.trim(),
    address: parsed.data.address.trim(),
    phone_number: parsed.data.phone_number.trim(),
    agreed_to_rules_at: new Date().toISOString(),
    email:
      typeof user.email === "string"
        ? user.email
        : (user.user_metadata?.["email"] as string | undefined) ?? null,
  };

  const { error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("[completeSignup] Failed to persist profile", error);
    return {
      success: false,
      message:
        "We couldn't save your profile right now. Please retry in a moment.",
    };
  }

  revalidatePath("/");
  revalidatePath("/signup");
  revalidatePath("/tools");
  return { success: true };
}
