"use client";

import React from "react";

/**
 * Lightweight Markdown renderer — no external dependencies.
 * Handles: ### headings, --- rules, > blockquotes, **bold**, `code`, bullet lists, numbered lists.
 */

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className = "" }) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;
  const key = () => `md-${keyCounter++}`;

  // Inline formatter: bold, inline code, italic
  const formatInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    // Split on **bold**, *italic*, `code`
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const raw = match[0];
      if (raw.startsWith("**")) {
        parts.push(<strong key={key()} className="font-semibold text-zinc-100">{raw.slice(2, -2)}</strong>);
      } else if (raw.startsWith("*")) {
        parts.push(<em key={key()} className="italic text-zinc-300">{raw.slice(1, -1)}</em>);
      } else if (raw.startsWith("`")) {
        parts.push(
          <code key={key()} className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-[11px]">
            {raw.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length === 1 ? parts[0] : parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Blank line → spacer
    if (line.trim() === "") {
      elements.push(<div key={key()} className="h-2" />);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={key()} className="border-zinc-700/60 my-3" />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key()} className="text-sm font-bold text-indigo-300 mt-3 mb-1 tracking-wide">
          {formatInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key()} className="text-base font-bold text-indigo-200 mt-4 mb-1.5">
          {formatInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key()} className="text-lg font-extrabold text-white mt-4 mb-2">
          {formatInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={key()}
          className="border-l-2 border-indigo-500 pl-3 py-1 my-2 bg-indigo-500/5 rounded-r-lg"
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="text-[12.5px] text-indigo-200/90 leading-relaxed italic">
              {formatInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Bullet list (- or *)
    if (/^(\s*)([-*])\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^(\s*)([-*])\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^(\s*)([-*])\s/, ""));
        i++;
      }
      elements.push(
        <ul key={key()} className="list-none space-y-1 my-2 pl-1">
          {listItems.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-[12.5px] text-zinc-300 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      let numStart = 1;
      const firstMatch = line.match(/^(\d+)\.\s/);
      if (firstMatch) numStart = parseInt(firstMatch[1]);

      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key()} className="space-y-1 my-2 pl-1">
          {listItems.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2.5 text-[12.5px] text-zinc-300 leading-relaxed">
              <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-[9px] font-bold text-indigo-400 flex items-center justify-center">
                {numStart + ii}
              </span>
              <span>{formatInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Code block (fenced)
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={key()} className="my-2 rounded-xl overflow-hidden border border-zinc-700/50">
          {lang && (
            <div className="px-3 py-1 bg-zinc-800 border-b border-zinc-700/50 text-[10px] font-mono text-zinc-500">
              {lang}
            </div>
          )}
          <pre className="bg-zinc-900/80 p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key()} className="text-[12.5px] text-zinc-300 leading-relaxed">
        {formatInline(line)}
      </p>
    );
    i++;
  }

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
};
