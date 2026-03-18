import { requirePlatformAdmin } from "@/lib/auth";
import { getAllPoolsWithStats, getSystemStats } from "@/lib/db/admin";
import { getRulesContent } from "@/lib/db/settings";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminPage() {
  await requirePlatformAdmin();

  const [pools, stats, rules] = await Promise.all([
    getAllPoolsWithStats(),
    getSystemStats(),
    getRulesContent(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <AdminShell pools={pools} stats={stats} rules={rules} />
    </div>
  );
}
