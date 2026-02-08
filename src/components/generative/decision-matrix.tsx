"use client";

import React from "react";
import { z } from "zod";
import { ThumbsUp, ThumbsDown, TrendingUp, DollarSign, Zap, Users } from "lucide-react";

export const decisionMatrixSchema = z.object({
  title: z.string().default("Decision Matrix"),
  context: z.string().default("No context provided"),
  options: z.array(
    z.object({
      name: z.string().default("Unknown Option"),
      score: z.number().min(0).max(10).default(5),
      recommended: z.boolean().optional().default(false),
      pros: z.array(z.string()).default([]),
      cons: z.array(z.string()).default([]),
      metrics: z.object({
        performance: z.number().min(0).max(10).optional().default(5),
        cost: z.number().min(0).max(10).optional().default(5),
        complexity: z.number().min(0).max(10).optional().default(5),
        community: z.number().min(0).max(10).optional().default(5),
      }).optional().default({ performance: 5, cost: 5, complexity: 5, community: 5 }),
      useCases: z.array(z.string()).optional().default([]),
    })
  ).default([]),
  recommendation: z.string().default("No recommendation available"),
});

type DecisionMatrixProps = z.infer<typeof decisionMatrixSchema>;

/**
 * DecisionMatrix Component
 * AI-powered technology/architecture decision helper
 * Helps developers choose between frameworks, libraries, architectures, etc.
 */
export const DecisionMatrix: React.FC<DecisionMatrixProps> = ({
  title,
  context,
  options,
  recommendation,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400 bg-green-500/20";
    if (score >= 6) return "text-blue-400 bg-blue-500/20";
    if (score >= 4) return "text-yellow-400 bg-yellow-500/20";
    return "text-red-400 bg-red-500/20";
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "performance":
        return <Zap className="h-4 w-4" />;
      case "cost":
        return <DollarSign className="h-4 w-4" />;
      case "complexity":
        return <TrendingUp className="h-4 w-4" />;
      case "community":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full rounded-lg border border-[#2a2a3e] bg-[#14141f] p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400">{context}</p>
      </div>

      {/* Options Grid */}
      <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-lg border bg-[#1a1a2f]/30 p-6 transition-all hover:bg-[#1a1a2f]/50 ${
              option.recommended
                ? "border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                : "border-[#2a2a3e]"
            }`}
          >
            {/* Recommended badge */}
            {option.recommended && (
              <div className="absolute right-0 top-0 rounded-bl-lg bg-cyan-500 px-3 py-1 text-xs font-bold text-black">
                RECOMMENDED
              </div>
            )}

            {/* Option name & score */}
            <div className="mb-4 flex items-start justify-between gap-2">
              <h4 className="text-xl font-bold text-white">{option.name}</h4>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold ${getScoreColor(
                  option.score
                )}`}
              >
                {option.score}
              </div>
            </div>

            {/* Metrics bars */}
            {option.metrics && (
              <div className="mb-4 space-y-2">
                {Object.entries(option.metrics).map(([key, value]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-400">
                        {getMetricIcon(key)}
                        {key}
                      </span>
                      <span className="text-gray-500">{value}/10</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0a0a0f]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                        style={{ width: `${value * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pros */}
            <div className="mb-4">
              <h5 className="mb-2 flex items-center gap-1 text-sm font-semibold text-green-400">
                <ThumbsUp className="h-4 w-4" />
                Pros
              </h5>
              <ul className="space-y-1">
                {option.pros.slice(0, 3).map((pro, i) => (
                  <li key={i} className="text-xs text-gray-300">
                    • {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="mb-4">
              <h5 className="mb-2 flex items-center gap-1 text-sm font-semibold text-red-400">
                <ThumbsDown className="h-4 w-4" />
                Cons
              </h5>
              <ul className="space-y-1">
                {option.cons.slice(0, 3).map((con, i) => (
                  <li key={i} className="text-xs text-gray-300">
                    • {con}
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Cases */}
            {option.useCases && option.useCases.length > 0 && (
              <div>
                <h5 className="mb-2 text-sm font-semibold text-blue-400">
                  Best For
                </h5>
                <div className="flex flex-wrap gap-1">
                  {option.useCases.slice(0, 3).map((useCase, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6">
        <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-cyan-400">
          <Zap className="h-5 w-5" />
          AI Recommendation
        </h4>
        <p className="leading-relaxed text-gray-300">{recommendation}</p>
      </div>
    </div>
  );
};
