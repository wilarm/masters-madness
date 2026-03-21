import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase";

const BASE = "https://mastersmadness.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const static_routes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/join`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/standings`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/leaderboard`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/research`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/rules`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  // Public pool pages
  try {
    const db = createServiceClient();
    const { data } = await db
      .from("pools")
      .select("slug, updated_at")
      .order("created_at", { ascending: false });

    const pool_routes: MetadataRoute.Sitemap = (data ?? []).map((pool) => ({
      url: `${BASE}/pool/${pool.slug}`,
      lastModified: new Date(pool.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    return [...static_routes, ...pool_routes];
  } catch {
    return static_routes;
  }
}
