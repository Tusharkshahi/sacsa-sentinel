"use client";

import React from "react";
import { z } from "zod";
import { GitCommit, GitBranch, FileCode, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Zod Schema for FortressDiff
 * Defines the shape of GitHub commit data with code diffs
 */
export const fortressDiffSchema = z.object({
  commit: z.object({
    sha: z.string().default('unknown'),
    message: z.string().default('No commit message'),
    author: z.string().default('Unknown'),
    date: z.string().default(new Date().toISOString()),
    branch: z.string().default('main'),
    url: z.string().optional(),
  }).optional().default({ sha: 'unknown', message: 'No commit message', author: 'Unknown', date: new Date().toISOString(), branch: 'main' }),
  diff: z.object({
    fileName: z.string().default('unknown'),
    language: z.string().default('text'),
    additions: z.number().default(0),
    deletions: z.number().default(0),
    changes: z.array(
      z.object({
        lineNumber: z.number(),
        type: z.enum(["add", "remove", "context"]),
        content: z.string(),
      })
    ).default([]),
  }).optional().default({ fileName: 'unknown', language: 'text', additions: 0, deletions: 0, changes: [] }),
  analysis: z.object({
    severity: z.enum(["high", "medium", "low"]).default("low"),
    potentialIssues: z.array(z.string()).default([]),
    recommendation: z.string().optional(),
  }).optional().default({ severity: "low", potentialIssues: [] }),
});

export type FortressDiffData = z.infer<typeof fortressDiffSchema>;

export type FortressDiffProps = FortressDiffData & React.HTMLAttributes<HTMLDivElement>;

/**
 * FortressDiff Component
 * 
 * A syntax-highlighted code viewer that inspects specific commits identified
 * as problematic via the GitHub MCP. Displays diffs with context and AI analysis.
 */
export const FortressDiff: React.FC<FortressDiffProps> = (props) => {
  const { commit, diff, analysis, className, ...rest } = props;
  
  const [isLoading, setIsLoading] = React.useState(!commit);
  const getLineTypeStyles = (type: string) => {
    switch (type) {
      case "add":
        return {
          bg: "bg-green-500/10",
          border: "border-l-green-500",
          text: "text-green-400",
          prefix: "+",
        };
      case "remove":
        return {
          bg: "bg-red-500/10",
          border: "border-l-red-500",
          text: "text-red-400",
          prefix: "-",
        };
      default:
        return {
          bg: "bg-fortress-black/30",
          border: "border-l-fortress-border",
          text: "text-fortress-muted",
          prefix: " ",
        };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-amber-400";
      case "low":
        return "text-green-400";
      default:
        return "text-fortress-muted";
    }
  };

  if (isLoading || !commit) {
    return (
      <div className="w-full h-full p-6 border border-fortress-border rounded-xl bg-fortress-surface/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-xl font-bold text-fortress-white">Fortress Diff</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 bg-fortress-black/50 rounded animate-pulse"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full p-6 border border-fortress-border rounded-xl bg-fortress-surface/80 backdrop-blur flex flex-col", className)} {...rest}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GitCommit className="h-6 w-6 text-fortress-white" />
          <h2 className="text-xl font-bold text-fortress-white">Fortress Diff</h2>
        </div>
        <div
          className={cn(
            "px-2 py-1 rounded text-xs font-semibold uppercase",
            analysis.severity === "high" && "bg-red-500/20 text-red-400",
            analysis.severity === "medium" && "bg-amber-500/20 text-amber-400",
            analysis.severity === "low" && "bg-green-500/20 text-green-400"
          )}
        >
          {analysis.severity} Risk
        </div>
      </div>

      {/* Commit Info */}
      <div className="mb-4 p-3 bg-fortress-black/50 rounded-lg border border-fortress-border/50">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-fortress-muted flex-shrink-0" />
              <span className="text-sm font-mono text-fortress-white truncate">
                {commit.sha.substring(0, 8)}
              </span>
              <span className="text-xs text-fortress-muted">on {commit.branch}</span>
            </div>
            <p className="text-sm text-fortress-white mb-2">{commit.message}</p>
            <div className="flex items-center gap-3 text-xs text-fortress-muted">
              <span>{commit.author}</span>
              <span>•</span>
              <span>{new Date(commit.date).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Header */}
      <div className="flex items-center justify-between mb-3 p-2 bg-fortress-black/30 rounded border border-fortress-border/30">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-fortress-muted" />
          <span className="text-sm font-mono text-fortress-white">{diff.fileName}</span>
          <span className="text-xs text-fortress-muted">({diff.language})</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-400">+{diff.additions}</span>
          <span className="text-red-400">-{diff.deletions}</span>
        </div>
      </div>

      {/* Code Diff */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
        <div className="font-mono text-xs">
          {diff.changes.map((change: FortressDiffData['diff']['changes'][0], idx: number) => {
            const styles = getLineTypeStyles(change.type);
            return (
              <div
                key={idx}
                className={cn(
                  "flex items-start border-l-2 transition-colors",
                  styles.bg,
                  styles.border
                )}
              >
                <span className="px-3 py-1 text-fortress-muted/50 select-none min-w-[3rem] text-right">
                  {change.lineNumber}
                </span>
                <span className={cn("px-2 py-1 select-none", styles.text)}>
                  {styles.prefix}
                </span>
                <pre className={cn("px-2 py-1 flex-1", styles.text)}>
                  {change.content}
                </pre>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis Panel */}
      {analysis.potentialIssues.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">
                Potential Issues Detected
              </h4>
              <ul className="space-y-1 text-xs text-fortress-muted">
                {analysis.potentialIssues.map((issue: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
              {analysis.recommendation && (
                <p className="mt-3 text-xs text-fortress-white">
                  <span className="font-semibold">Recommendation:</span>{" "}
                  {analysis.recommendation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

