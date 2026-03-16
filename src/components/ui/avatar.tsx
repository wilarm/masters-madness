"use client";

import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const imageSizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({
  name,
  imageUrl,
  size = "md",
  className,
  showTooltip = false,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);

  return (
    <div className="relative group">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden font-semibold transition-transform duration-200",
          sizeMap[size],
          !imageUrl || imgError
            ? "bg-masters-green text-white"
            : "",
          className
        )}
      >
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={name}
            width={imageSizeMap[size]}
            height={imageSizeMap[size]}
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          {name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}
