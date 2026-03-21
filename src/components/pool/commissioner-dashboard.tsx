"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  Users,
  ClipboardList,
  Settings,
  Tag,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronLeft,
  Save,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Pool, PoolMember } from "@/lib/db/pools";
import type { Pick } from "@/lib/db/picks";

type Props = {
  pool: Pool;
  members: PoolMember[];
  picks: Pick[];
  currentUserId: string;
};

export function CommissionerDashboard({
  pool,
  members: initialMembers,
  picks,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Members state (optimistic updates)
  const [members, setMembers] = useState(initialMembers);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Settings state
  const config = pool.config as Record<string, unknown>;
  const [poolName, setPoolName] = useState(pool.name);
  const [entryFee, setEntryFee] = useState(String(config.entryFee ?? ""));
  const [prizePool, setPrizePool] = useState(String(config.prizePool ?? ""));
  const [venmoLink, setVenmoLink] = useState(String(config.venmoLink ?? ""));
  const [heroSubtitle, setHeroSubtitle] = useState(String(config.heroSubtitle ?? ""));
  const HERO_SUBTITLE_MAX = 200;
  const [communityMessage, setCommunityMessage] = useState(String(config.communityMessage ?? ""));
  const COMMUNITY_MESSAGE_MAX = 500;
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Customize state
  const [displayNames, setDisplayNames] = useState<Record<string, string>>(
    Object.fromEntries(initialMembers.map((m) => [m.user_id, m.display_name ?? ""]))
  );
  // Parse existing custom_tag into emoji + label parts
  function parseTag(value: string | null): { emoji: string; label: string } {
    if (!value) return { emoji: "", label: "" };
    const first = [...value][0];
    if (first && first.codePointAt(0)! > 255) {
      return { emoji: first, label: value.slice(first.length).trimStart() };
    }
    return { emoji: "", label: value };
  }
  const [tagEmojis, setTagEmojis] = useState<Record<string, string>>(
    Object.fromEntries(initialMembers.map((m) => [m.user_id, parseTag(m.custom_tag).emoji]))
  );
  const [tagLabels, setTagLabels] = useState<Record<string, string>>(
    Object.fromEntries(initialMembers.map((m) => [m.user_id, parseTag(m.custom_tag).label]))
  );
  const [customSaved, setCustomSaved] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  // Picks map
  const picksByUser = picks.reduce<Record<string, Pick[]>>((acc, pick) => {
    if (!acc[pick.user_id]) acc[pick.user_id] = [];
    acc[pick.user_id].push(pick);
    return acc;
  }, {});

  // All tier keys across all submitted picks
  const allTierKeys = Array.from(
    new Set(picks.flatMap((p) => Object.keys(p.golfer_picks)))
  ).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  const paidCount = members.filter((m) => m.paid).length;
  const unpaidCount = members.length - paidCount;
  const submittedCount = members.filter((m) => picksByUser[m.user_id]?.length > 0).length;

  async function togglePaid(member: PoolMember) {
    const key = `paid-${member.user_id}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    const newPaid = !member.paid;
    setMembers((prev) =>
      prev.map((m) => (m.user_id === member.user_id ? { ...m, paid: newPaid } : m))
    );
    await fetch(`/api/pools/${pool.slug}/members/${member.user_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: newPaid }),
    });
    setActionLoading((prev) => ({ ...prev, [key]: false }));
  }

  async function handleRemoveMember(member: PoolMember) {
    if (
      !confirm(
        `Remove ${member.display_name ?? "this member"} from the pool? This cannot be undone.`
      )
    )
      return;
    const key = `remove-${member.user_id}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    await fetch(`/api/pools/${pool.slug}/members/${member.user_id}`, {
      method: "DELETE",
    });
    setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
    setActionLoading((prev) => ({ ...prev, [key]: false }));
  }

  async function saveSettings() {
    setSettingsLoading(true);
    await fetch(`/api/pools/${pool.slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: poolName,
        entryFee: entryFee ? Number(entryFee) : undefined,
        prizePool: prizePool || undefined,
        venmoLink: venmoLink || undefined,
        heroSubtitle: heroSubtitle.trim() || undefined,
        communityMessage: communityMessage.trim() || undefined,
      }),
    });
    setSettingsLoading(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    startTransition(() => router.refresh());
  }

  async function saveCustomizations() {
    setCustomLoading(true);
    await Promise.all(
      members.map((m) =>
        fetch(`/api/pools/${pool.slug}/members/${m.user_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name: displayNames[m.user_id] || null,
            custom_tag: (() => {
              const emoji = tagEmojis[m.user_id]?.trim() ?? "";
              const label = tagLabels[m.user_id]?.trim() ?? "";
              if (!label) return null;
              return emoji ? `${emoji} ${label}` : label;
            })(),
          }),
        })
      )
    );
    setCustomLoading(false);
    setCustomSaved(true);
    setTimeout(() => setCustomSaved(false), 3000);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-masters-green">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/pool/${pool.slug}`}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to pool
          </Link>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-masters-gold/20 border border-masters-gold/40">
              <Crown className="h-5 w-5 text-masters-gold" />
            </span>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-white">
                {pool.name}
              </h1>
              <p className="text-sm text-white/70">Commissioner Dashboard</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-5 text-sm text-white/75">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {paidCount} paid
            </span>
            {unpaidCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-masters-gold" />
                {unpaidCount} unpaid
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              {submittedCount}/{members.length} picks submitted
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="members">
          <TabsList
            variant="line"
            className="w-full justify-start border-b border-border rounded-none h-auto gap-0 pb-0 mb-6"
          >
            <TabsTrigger
              value="members"
              className="gap-1.5 px-4 py-2.5 rounded-none text-sm"
            >
              <Users className="h-4 w-4" />
              Members
              <Badge variant="secondary" className="ml-0.5 h-4 text-[10px] px-1.5">
                {members.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="picks"
              className="gap-1.5 px-4 py-2.5 rounded-none text-sm"
            >
              <ClipboardList className="h-4 w-4" />
              Picks
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-1.5 px-4 py-2.5 rounded-none text-sm"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="customize"
              className="gap-1.5 px-4 py-2.5 rounded-none text-sm"
            >
              <Tag className="h-4 w-4" />
              Customize
            </TabsTrigger>
          </TabsList>

          {/* ── Members Tab ── */}
          <TabsContent value="members">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Members</CardTitle>
                {config.entryFee != null && (
                  <span className="text-sm text-muted flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    Entry fee: ${String(config.entryFee)} each
                  </span>
                )}
              </div>

              {members.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No members yet. Share the pool link to invite players.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-masters-green">
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-8">
                          #
                        </th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider">
                          Member
                        </th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-28 hidden sm:table-cell">
                          Role
                        </th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-28 hidden sm:table-cell">
                          Picks
                        </th>
                        <th className="text-center py-2.5 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-24">
                          Paid
                        </th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-20">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, i) => {
                        const isYou = member.user_id === currentUserId;
                        const hasPicks = (picksByUser[member.user_id]?.length ?? 0) > 0;
                        const paidKey = `paid-${member.user_id}`;
                        const removeKey = `remove-${member.user_id}`;

                        return (
                          <tr
                            key={member.id}
                            className="border-b border-border-light hover:bg-masters-green-light/30 transition-colors"
                          >
                            <td className="py-3.5 px-3">
                              <span className="text-sm font-mono text-muted">{i + 1}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar
                                  name={member.display_name ?? member.user_id}
                                  size="sm"
                                />
                                <div>
                                  <span className="font-medium text-foreground text-sm">
                                    {member.display_name ?? "Anonymous"}
                                  </span>
                                  {isYou && (
                                    <span className="ml-1.5 text-xs text-muted">(you)</span>
                                  )}
                                  {member.custom_tag && (
                                    <span className="ml-1.5 text-xs text-masters-green font-medium">
                                      {member.custom_tag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 hidden sm:table-cell">
                              {member.role === "commissioner" ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-masters-green">
                                  <Crown className="h-3 w-3" /> Commissioner
                                </span>
                              ) : (
                                <span className="text-xs text-muted capitalize">
                                  {member.role}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 hidden sm:table-cell">
                              {hasPicks ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                  <CheckCircle2 className="h-3 w-3" /> Submitted
                                </span>
                              ) : (
                                <span className="text-xs text-muted">Pending</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => togglePaid(member)}
                                disabled={actionLoading[paidKey]}
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                                  member.paid
                                    ? "bg-masters-green"
                                    : "bg-border"
                                }`}
                                title={member.paid ? "Mark as unpaid" : "Mark as paid"}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                                    member.paid ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              {!isYou && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={actionLoading[removeKey]}
                                  onClick={() => handleRemoveMember(member)}
                                  className="text-muted hover:text-destructive hover:bg-destructive/10"
                                  title="Remove member"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {unpaidCount > 0 && typeof config.venmoLink === "string" && config.venmoLink && (
                <div className="mt-4 p-3 rounded-lg bg-masters-gold/10 border border-masters-gold/30 flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-masters-gold flex-shrink-0" />
                  <span className="text-foreground">
                    {unpaidCount} member{unpaidCount !== 1 ? "s" : ""} still owe entry fees.
                  </span>
                  <a
                    href={String(config.venmoLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-masters-green font-medium hover:underline"
                  >
                    Venmo link
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── Picks Tab ── */}
          <TabsContent value="picks">
            {picks.length === 0 ? (
              <Card>
                <div className="text-center py-16 text-muted">
                  <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No picks submitted yet</p>
                  <p className="text-sm mt-1">
                    Picks will appear here once members start submitting.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const memberPicks = picksByUser[member.user_id] ?? [];
                  const hasPicks = memberPicks.length > 0;
                  const golferPicks =
                    memberPicks.find((p) => p.entry_num === 1)?.golfer_picks ?? {};

                  return (
                    <Card key={member.id}>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          name={member.display_name ?? member.user_id}
                          size="sm"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-sm text-foreground">
                            {member.display_name ?? "Anonymous"}
                          </span>
                          {member.role === "commissioner" && (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-masters-green font-medium">
                              <Crown className="h-3 w-3" /> Commissioner
                            </span>
                          )}
                        </div>
                        {hasPicks ? (
                          <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {Object.keys(golferPicks).length} / {allTierKeys.length} tiers
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs text-muted">
                            No picks
                          </Badge>
                        )}
                      </div>

                      {hasPicks && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                          {allTierKeys.map((tierKey) => {
                            const golfer = golferPicks[tierKey];
                            const tierLabel = tierKey
                              .replace("tier-", "Tier ")
                              .replace("write-in", "Write-In");
                            return (
                              <div
                                key={tierKey}
                                className="rounded-md border border-border bg-muted/30 px-2.5 py-2"
                              >
                                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-0.5">
                                  {tierLabel}
                                </p>
                                <p className="text-xs font-medium text-foreground truncate">
                                  {golfer ?? (
                                    <span className="text-muted italic">—</span>
                                  )}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings">
            <Card>
              <CardTitle className="mb-5">Pool Settings</CardTitle>
              <div className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  <Label htmlFor="pool-name">Pool Name</Label>
                  <Input
                    id="pool-name"
                    value={poolName}
                    onChange={(e) => setPoolName(e.target.value)}
                    placeholder="My Masters Pool"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="entry-fee">Entry Fee ($)</Label>
                  <Input
                    id="entry-fee"
                    type="number"
                    min="0"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    placeholder="100"
                  />
                  {entryFee && Number(entryFee) > 0 && (
                    <p className="text-xs text-masters-green font-medium">
                      Auto prize pool: ${(initialMembers.length * Number(entryFee)).toLocaleString()} ({initialMembers.length} members × ${entryFee})
                    </p>
                  )}
                  {(!entryFee || Number(entryFee) === 0) && (
                    <p className="text-xs text-muted">
                      Used to auto-calculate the prize pool and track payment status.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prize-pool">Prize Pool Override</Label>
                    <span className="text-xs text-muted">Optional</span>
                  </div>
                  <Input
                    id="prize-pool"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    placeholder={
                      entryFee && Number(entryFee) > 0
                        ? `Auto: $${(initialMembers.length * Number(entryFee)).toLocaleString()}`
                        : "e.g. $1,500 to winner, rest to charity"
                    }
                  />
                  <p className="text-xs text-muted">
                    Leave blank to auto-calculate from members × entry fee. Set custom text like &ldquo;$1,500 to winner, rest to charity&rdquo;.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hero-subtitle">Pool Page Subtitle</Label>
                    <span className={`text-xs ${heroSubtitle.length > HERO_SUBTITLE_MAX ? "text-destructive" : "text-muted"}`}>
                      {heroSubtitle.length}/{HERO_SUBTITLE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="hero-subtitle"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value.slice(0, HERO_SUBTITLE_MAX))}
                    placeholder="Masters Tournament Pool · Augusta National Golf Club"
                    rows={2}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-masters-green/30 focus:border-masters-green resize-none"
                  />
                  <p className="text-xs text-muted">
                    Shown below the pool name in the hero. Leave blank for the default.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="community-message">Community Message</Label>
                    <span className={`text-xs ${communityMessage.length > COMMUNITY_MESSAGE_MAX ? "text-destructive" : "text-muted"}`}>
                      {communityMessage.length}/{COMMUNITY_MESSAGE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="community-message"
                    value={communityMessage}
                    onChange={(e) => setCommunityMessage(e.target.value.slice(0, COMMUNITY_MESSAGE_MAX))}
                    placeholder="This pool is about friendly competition and bringing people together around the Masters. Good luck to everyone!"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-masters-green/30 focus:border-masters-green resize-none"
                  />
                  <p className="text-xs text-muted">
                    Shown in the &ldquo;Why Your Participation Matters&rdquo; section of the Rules page. Leave blank for the default.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="venmo-link">Venmo / PayPal Link</Label>
                  <Input
                    id="venmo-link"
                    value={venmoLink}
                    onChange={(e) => setVenmoLink(e.target.value)}
                    placeholder="https://venmo.com/u/yourname"
                  />
                  <p className="text-xs text-muted">
                    Shared with unpaid members so they know where to send money.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={saveSettings}
                    disabled={settingsLoading}
                    variant="default"
                  >
                    {settingsLoading ? (
                      <>Saving…</>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                  {settingsSaved && (
                    <span className="text-sm text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Saved!
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── Customize Tab ── */}
          <TabsContent value="customize">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <CardTitle>Customize Participants</CardTitle>
                <div className="flex items-center gap-3">
                  {customSaved && (
                    <span className="text-sm text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Saved!
                    </span>
                  )}
                  <Button
                    onClick={saveCustomizations}
                    disabled={customLoading}
                    size="sm"
                  >
                    {customLoading ? (
                      "Saving…"
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        Save All
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted mb-4">
                Customize display names and add custom tags (e.g. &ldquo;🏆 Defending Champ&rdquo;, &ldquo;🔥 Dark Horse&rdquo;) that appear next to each participant in standings.
              </p>

              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 border-b border-border-light last:border-0"
                  >
                    <div className="flex items-center gap-2.5 w-36 flex-shrink-0">
                      <Avatar
                        name={member.display_name ?? member.user_id}
                        size="sm"
                      />
                      <span className="text-xs text-muted truncate">
                        {member.user_id === currentUserId ? "You" : member.role}
                      </span>
                    </div>
                    <div className="flex flex-1 gap-3 w-full sm:w-auto">
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs mb-1">Display Name</Label>
                        <Input
                          value={displayNames[member.user_id] ?? ""}
                          onChange={(e) =>
                            setDisplayNames((prev) => ({
                              ...prev,
                              [member.user_id]: e.target.value,
                            }))
                          }
                          placeholder="Full name"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <div className="w-12">
                          <Label className="text-xs mb-1">Emoji</Label>
                          <Input
                            value={tagEmojis[member.user_id] ?? ""}
                            onChange={(e) => {
                              // Keep only the first grapheme (emoji)
                              const val = [...e.target.value][0] ?? "";
                              setTagEmojis((prev) => ({ ...prev, [member.user_id]: val }));
                            }}
                            placeholder="🏆"
                            className="text-sm text-center px-1"
                            maxLength={2}
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-xs mb-1">Tag Label</Label>
                          <Input
                            value={tagLabels[member.user_id] ?? ""}
                            onChange={(e) =>
                              setTagLabels((prev) => ({
                                ...prev,
                                [member.user_id]: e.target.value,
                              }))
                            }
                            placeholder="Dark Horse"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
