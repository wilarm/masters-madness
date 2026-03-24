import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mastersmadness.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const static_routes: MetadataRoute.Sitemap = [
    { url: BASE,                         lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/leaderboard`,        lastModified: new Date(), changeFrequency: "always",  priority: 0.9 },
    { url: `${BASE}/standings`,          lastModified: new Date(), changeFrequency: "always",  priority: 0.9 },
    { url: `${BASE}/research`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/picks`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/join`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/guide`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/setup`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/strategy`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/compare`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/pool/create`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/analytics`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.6 },
    { url: `${BASE}/rules`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic pool pages
  try {
    const db = createServiceClient();
    const { data } = await db
      .from("pools")
      .select("slug, updated_at")
      .order("created_at", { ascending: false });

    const pool_routes: MetadataRoute.Sitemap = (data ?? []).map((pool) => ({
      url: `${BASE}/pool/${pool.slug}`,
      lastModified: pool.updated_at ? new Date(pool.updated_at) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    return [...static_routes, ...pool_routes];
  } catch {
    return static_routes;
  }
}
