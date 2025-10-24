import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { SearchBox } from "@/components/tools/SearchBox";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSearchTerm } from "@/lib/utils/formatting";

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
      "id, name, description, photo_url, owner:users!tools_owner_id_fkey (id, full_name, address, phone_number)",
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
      photo_url: tool.photo_url,
      owner: {
        id: tool.owner?.id ?? "",
        full_name: tool.owner?.full_name ?? "Unknown owner",
        address: tool.owner?.address ?? "Address unavailable",
        phone_number: tool.owner?.phone_number ?? "",
      },
    }));

  return (
    <div className="space-y-10">
      <Card className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
            Browse Neighborhood Tools
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Search the Abbington library to find the perfect tool for your next
            project. Reach out to the owner directly to coordinate pickup.
          </p>
        </div>

        <SearchBox />
      </Card>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          We couldn&apos;t load tools right now. Please refresh or try again in
          a moment.
        </div>
      ) : (
        <ToolGrid tools={tools} />
      )}
    </div>
  );
}
