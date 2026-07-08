"use client";

import React, { useState } from "react";
import { OrchestratorAgent } from "../lib/agents/orchestrator";
import { BookOpen, Sparkles, UploadCloud } from "lucide-react";

interface KnowledgeIngestorProps {
  onIngestionComplete: () => void;
}

const PRESET_EXAMPLES = [
  {
    title: "Bubble Sort Algorithm",
    fileName: "bubble_sort.md",
    content: `# Bubble Sort Essentials
Bubble Sort is a simple comparison-based sorting algorithm.

## CON_006_BSORT
Name: Bubble Sort Basics
Prerequisites: CON_005_LOOP
Anchors:
- Bubble Sort compares adjacent elements and swaps them if they are in the wrong order.
- This process is repeated until no swaps are needed.
- The average and worst-case time complexity is O(N^2).

Content:
### Bubble Sort Basics
Bubble sort works by repeatedly swapping adjacent elements that are out of order. In each pass, the largest unsorted element 'bubbles' up to its correct position.

\`\`\`python
# Simple Bubble Sort
arr = [5, 1, 4, 2, 8]
n = len(arr)
for i in range(n):
    for j in range(0, n-i-1):
        if arr[j] > arr[j+1]:
            # swap
            arr[j], arr[j+1] = arr[j+1], arr[j]
\`\`\`
`
  },
  {
    title: "Introduction to NAND Gate",
    fileName: "nand_gate.md",
    content: `# NAND Gate Foundations
A NAND (Not-AND) Gate is a universal logic gate in electronics.

## CON_007_NAND
Name: NAND Gate Logic
Prerequisites: CON_001_AND
Anchors:
- A NAND gate outputs 0 (False) ONLY if BOTH of its inputs are 1 (True).
- It is the exact opposite of an AND gate.
- Truth Table: 0 NAND 0 = 1, 0 NAND 1 = 1, 1 NAND 0 = 1, 1 NAND 1 = 0.

Content:
### The NAND Gate
The NAND gate stands for NOT-AND. It outputs True in all scenarios except when both inputs are True.

In code, this represents NOT(A AND B), i.e., \`!(A && B)\` in Javascript. Because NAND can be combined to implement any other boolean function, it is called a "universal gate".`
  }
];

export const KnowledgeIngestor: React.FC<KnowledgeIngestorProps> = ({ onIngestionComplete }) => {
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleIngest = async (name: string, text: string) => {
    if (!name.trim() || !text.trim()) return;
    setIsProcessing(true);
    const success = await OrchestratorAgent.ingestContent(name, text);
    setIsProcessing(false);
    if (success) {
      setFileName("");
      setContent("");
      onIngestionComplete();
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-full">
      <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2 mb-3">
        <UploadCloud className="w-5 h-5 text-indigo-400" />
        Ingest Course Material
      </h2>
      <p className="text-xs text-zinc-400 mb-4">
        Paste learning content or use a preset. The **Parser Agent** will analyze the text, extract atomic concepts, resolve prerequisites, and dynamically expand your syllabus graph!
      </p>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {PRESET_EXAMPLES.map((example, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isProcessing}
            onClick={() => {
              setFileName(example.fileName);
              setContent(example.content);
            }}
            className="flex items-center justify-between text-left p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all group disabled:opacity-50"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-zinc-300 truncate">{example.title}</span>
              <span className="text-[9px] text-zinc-500 font-mono truncate">{example.fileName}</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 transition-colors shrink-0 ml-1" />
          </button>
        ))}
      </div>

      {/* Manual Input */}
      <div className="flex-1 flex flex-col gap-3">
        <input
          type="text"
          placeholder="File name (e.g. recursion.md)"
          disabled={isProcessing}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
        />

        <textarea
          placeholder="Paste Markdown / Learning text syllabus here..."
          value={content}
          disabled={isProcessing}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 min-h-[140px] w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all font-mono resize-none"
        />

        <button
          type="button"
          disabled={isProcessing || !fileName.trim() || !content.trim()}
          onClick={() => handleIngest(fileName, content)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Parser Agent Analyzing...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Ingest & Build Syllabus
            </>
          )}
        </button>
      </div>
    </div>
  );
};
