"use client";

import { useState } from "react";
import { Share2, Check, Copy, Link } from "lucide-react";

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  label?: string;
  className?: string;
}

export function ShareButton({
  url,
  title = "Masters Madness Pool",
  text = "Join my Masters Madness pool!",
  label = "Share",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Use native share sheet if available (mobile / modern browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or API unavailable — fall through to clipboard
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Last resort: prompt
      window.prompt("Copy the pool link:", url);
    }
  }

  if (copied) {
    return (
      <button
        className={
          className ??
          "inline-flex items-center gap-2 rounded-xl bg-white/20 border border-white/30 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
        }
        disabled
      >
        <Check className="h-4 w-4" />
        Link copied!
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 active:scale-[0.97] transition-all backdrop-blur-sm cursor-pointer"
      }
    >
      <Share2 className="h-4 w-4" />
      {label}
    </button>
  );
}

/** Compact copy-only variant for use outside the hero */
export function CopyShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy the pool link:", url);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-bg-muted transition-colors cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          Copied!
        </>
      ) : (
        <>
          <Link className="h-3.5 w-3.5" />
          Copy link
        </>
      )}
    </button>
  );
}
