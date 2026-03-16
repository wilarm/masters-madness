import { Card } from "@/components/ui/card";
import { BarChart3, Lock } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Analytics Dashboard
        </h1>
        <p className="text-muted mt-1">
          Risk vs. reward analysis of every entry in the pool
        </p>
      </div>

      <Card className="text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-masters-gold/15">
            <BarChart3 className="h-8 w-8 text-masters-gold-dark" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Analytics Available After Picks Lock
          </h2>
          <p className="text-muted max-w-lg">
            Once picks are locked on Thursday morning, this page will show a
            risk-reward matrix where you can see how everyone&apos;s lineup
            compares. Hover over initials or profile pictures to see each
            player&apos;s full name and lineup breakdown.
          </p>
          <div className="flex items-center gap-2 text-sm text-masters-gold-dark font-medium mt-2">
            <Lock className="h-4 w-4" />
            Unlocks after picks deadline
          </div>
        </div>
      </Card>

      {/* Preview of what the matrix will look like */}
      <Card className="mt-6">
        <h2 className="font-heading text-xl font-bold text-foreground mb-4">
          What You&apos;ll See
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-bg-muted p-4">
            <h3 className="font-semibold text-foreground mb-1">Risk Matrix</h3>
            <p className="text-sm text-muted">
              2D scatter plot showing where each entry falls on the safe-to-risky
              spectrum
            </p>
          </div>
          <div className="rounded-lg bg-bg-muted p-4">
            <h3 className="font-semibold text-foreground mb-1">Popular Picks</h3>
            <p className="text-sm text-muted">
              See which golfers were the most and least popular choices
            </p>
          </div>
          <div className="rounded-lg bg-bg-muted p-4">
            <h3 className="font-semibold text-foreground mb-1">Bold Moves</h3>
            <p className="text-sm text-muted">
              Highlights of the most contrarian and unexpected picks
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
