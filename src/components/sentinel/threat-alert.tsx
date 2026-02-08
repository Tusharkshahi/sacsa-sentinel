"use client";

import React from "react";
import { z } from "zod";
import { AlertCircle, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Zod Schema for ThreatAlert
 * Defines the shape of Sentry issue data with traffic light severity
 */
export const threatAlertSchema = z.object({
  issues: z.array(
    z.object({
      id: z.string().default("unknown"),
      title: z.string().default("Unknown issue"),
      severity: z.enum(["critical", "warning", "resolved"]).default("warning"),
      count: z.number().default(0),
      lastSeen: z.string().default(new Date().toISOString()),
      project: z.string().default("unknown"),
      affectedUsers: z.number().optional(),
      stackTrace: z.string().optional(),
    })
  ).default([]),
  summary: z.object({
    critical: z.number().default(0),
    warning: z.number().default(0),
    resolved: z.number().default(0),
    totalEvents: z.number().default(0),
  }).optional().default({ critical: 0, warning: 0, resolved: 0, totalEvents: 0 }),
  timestamp: z.string().optional().default(new Date().toISOString()),
});

export type ThreatAlertData = z.infer<typeof threatAlertSchema>;

export type ThreatAlertProps = ThreatAlertData & React.HTMLAttributes<HTMLDivElement>;

/**
 * ThreatAlert Component
 * 
 * A generative component that displays Sentry issues using Traffic Light signaling.
 * Red = Critical, Amber = Warning, Green = Resolved
 * 
 * This component is AI-controlled and will automatically fetch and display
 * real-time threat data from Sentry via the MCP integration.
 */
export const ThreatAlert: React.FC<ThreatAlertProps> = (props) => {
  const { issues, summary, timestamp, className, ...rest } = props;
  
  const [isLoading, setIsLoading] = React.useState(!issues);
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: "bg-red-500",
          glow: "shadow-red-500/20",
        };
      case "warning":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/50",
          text: "text-amber-400",
          icon: "bg-amber-500",
          glow: "shadow-amber-500/20",
        };
      case "resolved":
        return {
          bg: "bg-green-500/10",
          border: "border-green-500/50",
          text: "text-green-400",
          icon: "bg-green-500",
          glow: "shadow-green-500/20",
        };
      default:
        return {
          bg: "bg-fortress-surface",
          border: "border-fortress-border",
          text: "text-fortress-muted",
          icon: "bg-fortress-muted",
          glow: "",
        };
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  if (isLoading || !issues) {
    return (
      <div className="w-full h-full p-6 border border-fortress-border rounded-xl bg-fortress-surface/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-xl font-bold text-fortress-white">Threat Alert</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-fortress-black/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full p-6 border border-fortress-border rounded-xl bg-fortress-surface/80 backdrop-blur flex flex-col", className)} {...rest}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-fortress-white" />
          <h2 className="text-xl font-bold text-fortress-white">Threat Alert</h2>
        </div>
        <div className="text-xs text-fortress-muted">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Traffic Light Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 border border-red-500/30 rounded-lg bg-red-500/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-red-400">CRITICAL</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{summary.critical}</div>
        </div>
        <div className="p-3 border border-amber-500/30 rounded-lg bg-amber-500/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-400">WARNING</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{summary.warning}</div>
        </div>
        <div className="p-3 border border-green-500/30 rounded-lg bg-green-500/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-400">RESOLVED</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{summary.resolved}</div>
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle className="h-12 w-12 text-green-500/50 mb-3" />
            <p className="text-sm text-fortress-muted">No active threats detected</p>
          </div>
        ) : (
          issues.map((issue: ThreatAlertData['issues'][0]) => {
            const styles = getSeverityStyles(issue.severity);
            return (
              <div
                key={issue.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]",
                  styles.bg,
                  styles.border,
                  styles.glow,
                  "shadow-lg"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 rounded-full", styles.icon)}>
                    <div className="text-white">{getIcon(issue.severity)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn("font-semibold text-sm mb-1", styles.text)}>
                      {issue.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-fortress-muted">
                      <span>{issue.project}</span>
                      <span>•</span>
                      <span>{issue.count} events</span>
                      {issue.affectedUsers && (
                        <>
                          <span>•</span>
                          <span>{issue.affectedUsers} users</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-fortress-muted mt-2">
                      Last seen: {new Date(issue.lastSeen).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-fortress-border">
        <div className="text-xs text-fortress-muted text-center">
          Total Events: <span className="text-fortress-white font-semibold">{summary.totalEvents}</span>
        </div>
      </div>
    </div>
  );
};
