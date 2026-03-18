"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";

interface ExpandableTableProps {
  headers: string[];
  rows: ReactNode[][];
  initialVisibleRows?: number;
  className?: string;
  title?: string;
}

export function ExpandableTable({
  headers,
  rows,
  initialVisibleRows = 5,
  className = "",
  title,
}: ExpandableTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const visibleRows = expanded ? rows : rows.slice(0, initialVisibleRows);
  const hasMore = rows.length > initialVisibleRows;

  const tableContent = (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-white ${
        fullscreen
          ? "fixed inset-0 z-50 overflow-y-auto rounded-none border-none p-6"
          : ""
      } ${className}`}
    >
      {/* Header bar */}
      {(title || hasMore) && (
        <div className="flex items-center justify-between border-b border-border bg-bg-muted/50 px-4 py-2.5">
          {title && (
            <span className="text-sm font-semibold text-foreground">
              {title}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted">
              {expanded ? rows.length : Math.min(initialVisibleRows, rows.length)}{" "}
              of {rows.length}
            </span>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="flex items-center justify-center h-7 w-7 rounded-md text-muted hover:text-foreground hover:bg-bg-muted transition-colors cursor-pointer"
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="sticky top-0 bg-masters-green px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white first:rounded-tl-none last:rounded-tr-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-border/50 transition-colors duration-150 hover:bg-masters-green-light/50 last:border-0"
                style={{
                  animationDelay: `${rowIdx * 30}ms`,
                }}
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-4 py-3 text-sm text-foreground"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expand/Collapse bar */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 border-t border-border bg-bg-muted/30 py-2.5 text-sm font-medium text-masters-green transition-colors hover:bg-masters-green-light cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show full field ({rows.length - initialVisibleRows} more)
            </>
          )}
        </button>
      )}

      {/* Fullscreen overlay backdrop */}
      {fullscreen && (
        <div
          className="fixed inset-0 -z-10 bg-black/50"
          onClick={() => setFullscreen(false)}
        />
      )}
    </div>
  );

  return tableContent;
}
