import { CreatePoolWizard } from "@/components/pool/create-pool-wizard";

export const metadata = {
  title: "Create a Pool | Masters Madness",
  description: "Start your own Masters Tournament fantasy golf pool.",
};

export default function CreatePoolPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg py-8 px-4 pb-24 sm:pb-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Create Your Pool
          </h1>
          <p className="mt-2 text-muted">
            Set up your own Masters Tournament fantasy pool in minutes.
            Customize tiers, scoring, and payouts.
          </p>
        </div>
        <CreatePoolWizard />
      </div>
    </div>
  );
}
