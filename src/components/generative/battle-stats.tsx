"use client";

import React from "react";
import { z } from "zod";

export const battleStatsSchema = z.object({
  title: z.string().default("Metrics"),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      change: z.number().optional(),
      icon: z.string().optional(),
    })
  ).default([]),
  status: z.enum(["victory", "neutral", "alert"]).optional().default("neutral"),
});

type BattleStatsProps = z.infer<typeof battleStatsSchema>;

/**
 * BattleStats Component
 * Displays metrics in a Star Wars command center style
 * Perfect for showing real-time statistics, performance metrics, or battle readiness
 */
export const BattleStats: React.FC<BattleStatsProps> = ({
  title,
  metrics,
  status = "neutral",
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "victory":
        return "from-green-500/20 to-emerald-500/20 border-green-500/50";
      case "alert":
        return "from-red-500/20 to-orange-500/20 border-red-500/50";
      default:
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/50";
    }
  };

  return (
    <div
      className={`w-full rounded-lg border bg-gradient-to-br ${getStatusColor()} p-6 backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:bg-black/60"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-20" />

            <div className="relative">
              {/* Label */}
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">
                {metric.label}
              </p>

              {/* Value */}
              <p className="text-2xl font-bold text-white">
                {typeof metric.value === "number"
                  ? metric.value.toLocaleString()
                  : metric.value}
              </p>

              {/* Change indicator */}
              {metric.change !== undefined && (
                <p
                  className={`mt-1 text-xs font-semibold ${
                    metric.change > 0
                      ? "text-green-400"
                      : metric.change < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {metric.change > 0 ? "↑" : metric.change < 0 ? "↓" : "→"}{" "}
                  {Math.abs(metric.change)}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Scanning line effect */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      </div>
    </div>
  );
};
