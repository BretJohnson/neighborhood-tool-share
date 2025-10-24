"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserSignupSchema,
  type UserSignupInput,
} from "@/lib/schemas/user";
import { completeSignup } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SignupFormProps {
  defaultValues?: (Partial<UserSignupInput> & { agreeToRules?: boolean });
  email?: string | null;
}

export function SignupForm({
  defaultValues,
  email,
}: SignupFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSignupInput>({
    resolver: zodResolver(UserSignupSchema),
    defaultValues: {
      full_name: "",
      address: "",
      phone_number: "",
      agreeToRules: false,
      ...defaultValues,
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await completeSignup(values);
      if (!result.success) {
        setFormError(result.message);
        return;
      }

      router.push("/tools");
      router.refresh();
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
        <Input
          label="Full name"
          placeholder="Pat Neighbor"
          {...register("full_name")}
          error={errors.full_name?.message}
          autoComplete="name"
        />

        <Input
          label="Street address within Abbington"
          placeholder="123 Elm Street"
          {...register("address")}
          error={errors.address?.message}
          autoComplete="street-address"
        />

        <Input
          label="Mobile number"
          placeholder="+1 (919) 555-1234"
          {...register("phone_number")}
          error={errors.phone_number?.message}
          autoComplete="tel"
          inputMode="tel"
        />

        {email && (
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium">{email}</span>
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 rounded-md border-2 border-input text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background"
          {...register("agreeToRules")}
        />
        <span>
          I have read the Abbington Tool Share rules and agree to return borrowed
          tools on time and in good condition.
        </span>
      </label>
      {errors.agreeToRules?.message && (
        <p className="text-sm text-destructive">{errors.agreeToRules.message}</p>
      )}

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" loading={pending} className="w-full">
        Complete signup
      </Button>
    </form>
  );
}
