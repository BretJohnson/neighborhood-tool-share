import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatPhoneNumber } from "@/lib/utils/formatting";

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23eef2ff'/%3E%3Cpath d='M80 220h240M110 190l50-70 60 40 70-100' stroke='%2394a3b8' stroke-width='16' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E";

export interface ToolOwnerInfo {
  id: string;
  full_name: string;
  address: string;
  phone_number: string;
}

export interface ToolCardProps {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  owner: ToolOwnerInfo;
}

export function ToolCard({
  id,
  name,
  description,
  photo_url,
  owner,
}: ToolCardProps) {
  const phone = formatPhoneNumber(owner.phone_number);

  return (
    <Card className="flex h-full flex-col gap-4 p-0">
      <Link
        href={`/tools/${id}`}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-t-xl"
      >
        <Image
          src={photo_url ?? IMAGE_PLACEHOLDER}
          alt={name}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 25vw, 50vw"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 px-6 pb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{name}</h3>
          {description ? (
            <p className="line-clamp-3 text-sm text-muted">{description}</p>
          ) : (
            <p className="text-sm text-muted italic">No description provided.</p>
          )}
        </div>

        <div className="mt-auto rounded-lg border border-border bg-background/60 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">{owner.full_name}</p>
          <p className="text-muted">{owner.address}</p>
          {phone && <p className="text-muted">📞 {phone}</p>}
        </div>
      </div>
    </Card>
  );
}
