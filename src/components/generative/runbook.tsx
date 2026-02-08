"use client";

import React from "react";
import { z } from "zod";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";

export const runbookSchema = z.object({
  title: z.string().default("Runbook"),
  problem: z.string().default("No problem description"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  estimatedTime: z.string().default("Unknown"),
  steps: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      command: z.string().optional(),
      warning: z.string().optional(),
      checkpoints: z.array(z.string()).optional(),
    })
  ).default([]),
  prerequisites: z.array(z.string()).optional(),
  troubleshooting: z.array(
    z.object({
      issue: z.string(),
      solution: z.string(),
    })
  ).optional(),
});

type RunbookProps = z.infer<typeof runbookSchema>;

/**
 * Runbook Component
 * AI-generated step-by-step troubleshooting guides
 * Incredibly valuable for DevOps, debugging, and learning
 */
export const Runbook: React.FC<RunbookProps> = ({
  title,
  problem,
  difficulty,
  estimatedTime,
  steps,
  prerequisites,
  troubleshooting,
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400 bg-green-500/20 border-green-500/50";
      case "intermediate":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/50";
      case "advanced":
        return "text-red-400 bg-red-500/20 border-red-500/50";
    }
  };

  return (
    <div className="w-full rounded-lg border border-[#2a2a3e] bg-[#14141f] p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
          <p className="text-gray-400">{problem}</p>
        </div>
        <div className="flex gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getDifficultyColor()}`}
          >
            {difficulty}
          </span>
          <span className="rounded-full border border-blue-500/50 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
            ⏱️ {estimatedTime}
          </span>
        </div>
      </div>

      {/* Prerequisites */}
      {prerequisites && prerequisites.length > 0 && (
        <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Circle className="h-4 w-4" />
            Prerequisites
          </h4>
          <ul className="ml-6 list-disc space-y-1 text-sm text-gray-300">
            {prerequisites.map((prereq, i) => (
              <li key={i}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white">Steps</h4>
        {steps.map((step, index) => (
          <div key={index} className="relative flex gap-4">
            {/* Step number */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
              {index + 1}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-4">
              <h5 className="mb-2 font-semibold text-white">{step.title}</h5>
              <p className="mb-3 text-sm text-gray-400">{step.description}</p>

              {/* Command */}
              {step.command && (
                <div className="group relative mb-3 overflow-hidden rounded-lg border border-[#2a2a3e] bg-[#0a0a0f] p-3">
                  <code className="text-sm text-cyan-400">{step.command}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(step.command!)}
                    className="absolute right-2 top-2 rounded bg-[#2a2a3e] px-2 py-1 text-xs text-gray-400 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                  >
                    Copy
                  </button>
                </div>
              )}

              {/* Warning */}
              {step.warning && (
                <div className="mb-3 flex gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
                  <p className="text-xs text-yellow-200">{step.warning}</p>
                </div>
              )}

              {/* Checkpoints */}
              {step.checkpoints && step.checkpoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500">
                    Verify:
                  </p>
                  {step.checkpoints.map((checkpoint, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-400"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                      <span>{checkpoint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-12 h-full w-0.5 bg-cyan-500/30" />
            )}
          </div>
        ))}
      </div>

      {/* Troubleshooting */}
      {troubleshooting && troubleshooting.length > 0 && (
        <div className="mt-6 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
          <h4 className="mb-3 text-sm font-semibold text-orange-400">
            Common Issues
          </h4>
          <div className="space-y-3">
            {troubleshooting.map((item, i) => (
              <div key={i}>
                <p className="mb-1 text-sm font-semibold text-white">
                  Issue: {item.issue}
                </p>
                <p className="text-sm text-gray-300">
                  Solution: {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
