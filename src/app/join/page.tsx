import { getPublicPools } from "@/lib/db/pools";
import { getAuthUserId } from "@/lib/auth";
import { getPoolsForUser } from "@/lib/db/pools";
import { PoolDiscoveryCard } from "@/components/pool/pool-discovery-card";
import { Search, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 30;

const PAGE_SIZE = 10;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10));

  // Fetch in parallel: pool list + current user's memberships
  const userId = await getAuthUserId();
  const [{ pools, total }, userPools] = await Promise.all([
    getPublicPools(page, q),
    userId ? getPoolsForUser(userId) : Promise.resolve([]),
  ]);

  const userPoolIds = new Set(userPools.map((p) => p.id));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (params.page && params.page !== "1") p.set("page", params.page);
    Object.entries(params).forEach(([k, v]) => p.set(k, v));
    const str = p.toString();
    return `/join${str ? `?${str}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Home
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          Find a Pool
        </h1>
        <p className="text-muted mt-2">
          Browse open pools and join to submit your picks before the April 9 deadline.
        </p>
      </div>

      {/* Search */}
      <form method="GET" action="/join" className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by pool name…"
            className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-masters-green/30 focus:border-masters-green"
          />
          {/* Hidden page reset on new search */}
          <button type="submit" className="sr-only">Search</button>
        </div>
        {q && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted">
              Results for <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>
            </span>
            <Link href="/join" className="text-xs text-masters-green hover:underline font-medium">
              Clear
            </Link>
          </div>
        )}
      </form>

      {/* Pool List */}
      {pools.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">
            {q ? `No pools found for "${q}"` : "No pools yet"}
          </p>
          <p className="text-sm mt-1">
            {q ? "Try a different search term." : "Be the first — create a pool!"}
          </p>
          <Link
            href="/pool/create"
            className="inline-flex items-center gap-2 mt-4 rounded-lg bg-masters-green px-4 py-2 text-sm font-semibold text-white hover:bg-masters-green-dark transition-colors"
          >
            Create a Pool
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pools.map((pool) => (
            <PoolDiscoveryCard
              key={pool.id}
              pool={pool}
              isMember={userPoolIds.has(pool.id)}
              isSignedIn={!!userId}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {page > 1 ? (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <div />
          )}

          <span className="text-sm text-muted">
            Page {page} of {totalPages} &middot; {total} pool{total !== 1 ? "s" : ""}
          </span>

          {page < totalPages ? (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-bg-muted transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Footer CTA */}
      {!q && pools.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          Don&apos;t see your pool?{" "}
          <Link href="/pool/create" className="text-masters-green font-semibold hover:underline">
            Create one
          </Link>{" "}
          and invite your friends.
        </div>
      )}
    </div>
  );
}
