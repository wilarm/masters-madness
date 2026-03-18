"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { FileText, RefreshCw, Plus, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";
import type { RulesContent, PayoutRow } from "@/lib/db/settings";
import { cn } from "@/lib/utils";

interface RulesEditorProps {
  initialRules: RulesContent;
}

export function RulesEditor({ initialRules }: RulesEditorProps) {
  const [rules, setRules] = useState<RulesContent>(initialRules);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function setField<K extends keyof RulesContent>(key: K, value: RulesContent[K]) {
    setRules((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updatePayout(index: number, field: keyof PayoutRow, value: string | boolean) {
    setRules((prev) => {
      const payouts = [...prev.payouts];
      payouts[index] = { ...payouts[index], [field]: value };
      return { ...prev, payouts };
    });
    setSaved(false);
  }

  function addPayout() {
    setRules((prev) => ({
      ...prev,
      payouts: [...prev.payouts, { place: "", amount: "", highlight: false }],
    }));
    setSaved(false);
  }

  function removePayout(index: number) {
    setRules((prev) => ({
      ...prev,
      payouts: prev.payouts.filter((_, i) => i !== index),
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-masters-green-light text-masters-green">
            <FileText className="h-4 w-4" />
          </div>
          <CardTitle className="text-xl">Edit Rules Page</CardTitle>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <span className="text-xs font-medium">
            {expanded ? "Collapse" : "Expand"}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {/* Community Message */}
          <Field label="Community / Why Participate Message">
            <textarea
              value={rules.communityMessage}
              onChange={(e) => setField("communityMessage", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
            />
          </Field>

          {/* Entry Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Entry Deadline">
              <input
                type="text"
                value={rules.deadline}
                onChange={(e) => setField("deadline", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Entry Fee">
              <input
                type="text"
                value={rules.entryFee}
                onChange={(e) => setField("entryFee", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Max Entries">
              <input
                type="text"
                value={rules.maxEntries}
                onChange={(e) => setField("maxEntries", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Payment Instructions">
              <input
                type="text"
                value={rules.paymentInfo}
                onChange={(e) => setField("paymentInfo", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Payouts */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Payout Rows</p>
            <div className="space-y-2">
              {rules.payouts.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Place (e.g. 1st)"
                    value={row.place}
                    onChange={(e) => updatePayout(i, "place", e.target.value)}
                    className={cn(inputCls, "w-28")}
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g. $1,000)"
                    value={row.amount}
                    onChange={(e) => updatePayout(i, "amount", e.target.value)}
                    className={cn(inputCls, "flex-1")}
                  />
                  <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={row.highlight}
                      onChange={(e) => updatePayout(i, "highlight", e.target.checked)}
                      className="rounded"
                    />
                    Highlight
                  </label>
                  <button
                    onClick={() => removePayout(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addPayout}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-masters-green hover:text-masters-green/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add payout row
            </button>
          </div>

          {/* Payout Note */}
          <Field label="Payout Note (shown below payout rows)">
            <input
              type="text"
              value={rules.payoutNote}
              onChange={(e) => setField("payoutNote", e.target.value)}
              className={inputCls}
            />
          </Field>

          {/* Share URL */}
          <Field label="Share URL (shown on rules page)">
            <input
              type="text"
              value={rules.shareUrl}
              onChange={(e) => setField("shareUrl", e.target.value)}
              className={inputCls}
              placeholder="mastersmadness.com"
            />
          </Field>

          {/* Save */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <p className="text-xs text-muted flex-1">
              Changes apply to the public rules page within 60 seconds.
            </p>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                saved
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-masters-green text-white hover:bg-masters-green/90",
                saving && "opacity-60 cursor-not-allowed"
              )}
            >
              {saving ? (
                <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</>
              ) : saved ? (
                <><Check className="h-3.5 w-3.5" /> Saved</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-masters-green/40";
