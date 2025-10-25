import { redirect } from "next/navigation";
import { Metadata } from "next";
import { ToolsBrowse } from "@/components/tools/ToolsBrowse";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSearchTerm } from "@/lib/utils/formatting";

export const metadata: Metadata = {
  title: "Browse Tools",
  description: "Browse and search available tools in the Abbington neighborhood",
};

type ToolOwnerRow = {
  id: string;
  full_name: string;
  address: string;
  phone_number: string;
};

type ToolRow = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  photo_url: string | null;
  owner: ToolOwnerRow | null;
};

type SearchParams = {
  search?: string | string[];
};

export default async function ToolsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/signup");
  }

  const rawSearch =
    typeof searchParams?.search === "string" ? searchParams?.search : "";
  const searchTerm = normalizeSearchTerm(rawSearch);

  const baseQuery = supabase
    .from("tools")
    .select(
      "id, name, description, category, photo_url, owner:users!tools_owner_id_fkey (id, full_name, address, phone_number)",
    )
    .order("created_at", { ascending: false });

  const { data: toolsData, error } = searchTerm
    ? await baseQuery.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
      )
    : await baseQuery;

  if (error) {
    console.error("[tools/page] Failed to load tools", error);
  }

  const typedTools = (toolsData ?? []) as ToolRow[];

  const tools = typedTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      photo_url: tool.photo_url,
      owner: {
        id: tool.owner?.id ?? "",
        full_name: tool.owner?.full_name ?? "Unknown owner",
        address: tool.owner?.address ?? "Address unavailable",
        phone_number: tool.owner?.phone_number ?? "",
      },
    }));

  return <ToolsBrowse initialTools={tools} error={!!error} />;
}
