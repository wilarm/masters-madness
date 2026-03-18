import { NextResponse } from "next/server";
import { getAuthUserId, isPlatformAdmin } from "@/lib/auth";
import { getRulesContent, updateRulesContent } from "@/lib/db/settings";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId || !isPlatformAdmin(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rules = await getRulesContent();
  return NextResponse.json(rules);
}

export async function PATCH(request: Request) {
  const userId = await getAuthUserId();
  if (!userId || !isPlatformAdmin(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const ok = await updateRulesContent(body);

  if (!ok) {
    return NextResponse.json({ error: "Failed to update rules" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
