import { Card } from "@/components/ui/card";
import { ClipboardList, Lock } from "lucide-react";

export default function PicksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          My Picks
        </h1>
        <p className="text-muted mt-1">
          Select 1 golfer from each of the 9 tiers
        </p>
      </div>

      <Card className="text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-masters-green-light">
            <ClipboardList className="h-8 w-8 text-masters-green" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Pick System Coming Soon
          </h2>
          <p className="text-muted max-w-md">
            The native pick system is under development. You&apos;ll be able to
            select your golfers tier-by-tier, save drafts, and lock in your
            picks before the deadline.
          </p>
          <div className="flex items-center gap-2 text-sm text-masters-green font-medium mt-2">
            <Lock className="h-4 w-4" />
            Picks lock Thursday, April 9th @ 5:00 AM MT
          </div>
        </div>
      </Card>
    </div>
  );
}
