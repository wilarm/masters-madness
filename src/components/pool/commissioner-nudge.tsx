"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, X } from "lucide-react";

type Props = {
  poolSlug: string;
};

const DISMISS_KEY_PREFIX = "commissioner-nudge-dismissed-";

export function CommissionerNudge({ poolSlug }: Props) {
  const [dismissed, setDismissed] = useState(true); // default hidden to prevent flash

  useEffect(() => {
    const key = `${DISMISS_KEY_PREFIX}${poolSlug}`;
    setDismissed(localStorage.getItem(key) === "true");
  }, [poolSlug]);

  if (dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(`${DISMISS_KEY_PREFIX}${poolSlug}`, "true");
    setDismissed(true);
  }

  return (
    <div className="bg-masters-green-light border-b border-masters-green/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
        <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-masters-green/10 border border-masters-green/20">
          <Settings className="h-3.5 w-3.5 text-masters-green" />
        </span>
        <p className="flex-1 text-sm text-foreground min-w-0">
          <span className="font-semibold">You&apos;re the commissioner!</span>{" "}
          <span className="text-foreground/70">Set up payments, track entries, and send announcements from your dashboard.</span>
        </p>
        <Link
          href={`/pool/${poolSlug}/commissioner`}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-masters-green hover:bg-masters-green/90 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
        >
          Manage Pool
        </Link>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-md text-muted hover:text-foreground hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
