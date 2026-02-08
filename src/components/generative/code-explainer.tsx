"use client";

import React from "react";
import { z } from "zod";
import { Code2, Lightbulb, AlertCircle, Sparkles } from "lucide-react";

export const codeExplainerSchema = z.object({
  title: z.string().default("Code Explanation"),
  language: z.string().default("javascript"),
  code: z.string().default("// No code provided"),
  explanation: z.string().default("No explanation available"),
  breakdown: z.array(
    z.object({
      lineRange: z.string().default("1-1"),
      explanation: z.string().default("No explanation"),
      concept: z.string().optional().default(""),
    })
  ).default([]),
  keyTakeaways: z.array(z.string()).default([]),
  gotchas: z.array(z.string()).optional().default([]),
  improvements: z.array(z.string()).optional().default([]),
});

type CodeExplainerProps = z.infer<typeof codeExplainerSchema>;

/**
 * CodeExplainer Component
 * AI-powered code breakdown and explanation
 * Perfect for learning, code reviews, and understanding complex logic
 */
export const CodeExplainer: React.FC<CodeExplainerProps> = ({
  title,
  language,
  code,
  explanation,
  breakdown,
  keyTakeaways,
  gotchas,
  improvements,
}) => {
  return (
    <div className="w-full rounded-lg border border-[#2a2a3e] bg-[#14141f] p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{explanation}</p>
        </div>
        <span className="shrink-0 rounded-full border border-purple-500/50 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400">
          {language}
        </span>
      </div>

      {/* Code Block */}
      <div className="mb-6 overflow-hidden rounded-lg border border-[#2a2a3e]">
        <div className="flex items-center justify-between border-b border-[#2a2a3e] bg-[#0a0a0f] px-4 py-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-gray-400">
              Source Code
            </span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-xs text-gray-400 transition-colors hover:text-white"
          >
            Copy
          </button>
        </div>
        <pre className="overflow-x-auto bg-[#0a0a0f] p-4">
          <code className="text-sm text-gray-300">{code}</code>
        </pre>
      </div>

      {/* Line-by-Line Breakdown */}
      <div className="mb-6">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          Line-by-Line Breakdown
        </h4>
        <div className="space-y-4">
          {breakdown.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-[#2a2a3e]/50 bg-[#1a1a2f]/30 p-4 transition-all hover:border-cyan-500/50 hover:bg-[#1a1a2f]/50"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-400">
                  {item.lineRange}
                </span>
                {item.concept && (
                  <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-400">
                    {item.concept}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-300">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-400">
          <Lightbulb className="h-4 w-4" />
          Key Takeaways
        </h4>
        <ul className="space-y-2">
          {keyTakeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="mt-1 text-green-400">✓</span>
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Gotchas */}
      {gotchas && gotchas.length > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            Watch Out For
          </h4>
          <ul className="space-y-2">
            {gotchas.map((gotcha, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <span className="mt-1 text-yellow-400">⚠</span>
                <span>{gotcha}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Sparkles className="h-4 w-4" />
            Potential Improvements
          </h4>
          <ul className="space-y-2">
            {improvements.map((improvement, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <span className="mt-1 text-blue-400">→</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
