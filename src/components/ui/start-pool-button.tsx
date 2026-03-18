"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function StartPoolButton({ className = "" }: { className?: string }) {
  return (
    <Link href="/pool/create" className={className}>
      <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(2,89,40,0.4)] active:scale-[0.98] cursor-pointer bg-gradient-to-r from-masters-green via-[#047a35] to-masters-green bg-[length:200%_100%] hover:bg-right">
        {/* Shimmer effect */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
        <span className="relative">Start a Pool</span>
      </button>
    </Link>
  );
}
