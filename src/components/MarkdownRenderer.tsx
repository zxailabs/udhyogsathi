"use client";

import React from "react";
import Link from "next/link";

function renderInline(text: string): React.ReactNode[] {
  // Parse markdown links [label](url or /path), bold **text**, and inline code `code`
  const tokenRegex = /(\[[^\]]+\]\((?:https?:\/\/[^)]+|\/[^)]+)\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)$/);
      if (match) {
        const href = match[2];
        if (href.startsWith("/")) {
          return (
            <Link
              key={idx}
              href={href}
              className="text-orange-400 underline decoration-orange-400/50 hover:text-orange-300 font-medium"
            >
              {match[1]}
            </Link>
          );
        }
        return (
          <a
            key={idx}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 underline decoration-orange-400/50 hover:text-orange-300 font-medium break-all"
          >
            {match[1]}
          </a>
        );
      }
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-white/10 text-orange-200 font-space text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);

  return (
    <div className="space-y-2 text-[14.5px] leading-relaxed text-slate-200">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) return <div key={index} className="h-1" />;

        if (line.startsWith("### ")) {
          return (
            <h4 key={index} className="text-sm font-bold text-orange-300 pt-1">
              {renderInline(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={index} className="text-base font-bold text-white pt-1">
              {renderInline(line.slice(3))}
            </h3>
          );
        }
        if (line.startsWith("> ")) {
          return (
            <div
              key={index}
              className="border-l-2 border-[#FF6B00] bg-[#FF6B00]/10 px-3 py-2 rounded-r-lg text-xs text-orange-100"
            >
              {renderInline(line.slice(2))}
            </div>
          );
        }
        if (/^[-*•]\s+/.test(line)) {
          const body = line.replace(/^[-*•]\s+/, "");
          return (
            <div key={index} className="flex items-start gap-2.5 pl-1">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
              <div className="flex-1">{renderInline(body)}</div>
            </div>
          );
        }
        if (/^\d+\.\s+/.test(line)) {
          const match = line.match(/^(\d+\.)\s+(.*)$/);
          if (match) {
            return (
              <div key={index} className="flex items-start gap-2.5 pl-2">
                <span className="text-xs font-bold text-orange-400 mt-0.5 shrink-0 font-space">
                  {match[1]}
                </span>
                <div className="flex-1">{renderInline(match[2])}</div>
              </div>
            );
          }
        }
        return <p key={index}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

