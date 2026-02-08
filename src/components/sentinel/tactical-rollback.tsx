"use client";

import React, { useState, useEffect } from "react";
import { withInteractable } from "@tambo-ai/react";
import { z } from "zod";
import { RotateCcw, Activity, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Zod Schema for TacticalRollback
 * Defines the input/output for Vercel deployment rollback operations
 */
export const tacticalRollbackInputSchema = z.object({
  deploymentId: z.string().default('unknown'),
  projectName: z.string().default('unknown-project'),
  targetVersion: z.string().optional().default(''),
  reason: z.string().optional().default(''),
});

export const tacticalRollbackOutputSchema = z.object({
  success: z.boolean().default(false),
  deploymentId: z.string().default('unknown'),
  previousDeploymentId: z.string().optional().default(''),
  status: z.enum(["initiated", "in-progress", "completed", "failed"]).default("initiated"),
  progress: z.number().min(0).max(100).default(0),
  message: z.string().default(''),
  timestamp: z.string().default(new Date().toISOString()),
  estimatedCompletion: z.string().optional().default(''),
});

export type TacticalRollbackInput = z.infer<typeof tacticalRollbackInputSchema>;
export type TacticalRollbackOutput = z.infer<typeof tacticalRollbackOutputSchema>;

type TacticalRollbackProps = TacticalRollbackInput & {
  onExecute?: (input: TacticalRollbackInput) => Promise<TacticalRollbackOutput>;
};

/**
 * TacticalRollback Component
 * 
 * An interactable component that orchestrates Vercel deployment rollbacks.
 * Features real-time progress tracking with contextual empathy (micro-delays
 * before success confirmation to build trust).
 */
const TacticalRollbackBase: React.FC<TacticalRollbackProps> = (props) => {
  const { deploymentId, projectName, targetVersion, reason, onExecute } = props;
  
  const [localProgress, setLocalProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [outputData, setOutputData] = useState<TacticalRollbackOutput | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate contextual empathy with micro-delay before showing success
  useEffect(() => {
    if (outputData?.status === "completed" && outputData.success) {
      const timer = setTimeout(() => {
        setShowSuccess(true);
      }, 800); // 800ms micro-delay to mimic human verification time
      return () => clearTimeout(timer);
    } else {
      setShowSuccess(false);
    }
  }, [outputData]);

  // Animate progress bar
  useEffect(() => {
    if (outputData?.progress !== undefined) {
      const interval = setInterval(() => {
        setLocalProgress((prev) => {
          if (prev < outputData.progress) {
            return Math.min(prev + 2, outputData.progress);
          }
          return outputData.progress;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [outputData?.progress]);

  const handleRollback = async () => {
    if (onExecute && !isExecuting) {
      setIsExecuting(true);
      setError(null);
      try {
        const result = await onExecute({
          deploymentId,
          projectName,
          targetVersion,
          reason,
        });
        setOutputData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rollback failed");
      } finally {
        setIsExecuting(false);
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "in-progress":
      case "initiated":
        return "text-blue-400";
      default:
        return "text-fortress-muted";
    }
  };

  const getStatusIcon = (status?: string) => {
    if (showSuccess && status === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-400 animate-in fade-in zoom-in" />;
    }
    switch (status) {
      case "completed":
        return <Activity className="h-5 w-5 text-green-400 animate-pulse" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "in-progress":
      case "initiated":
        return <Activity className="h-5 w-5 text-blue-400 animate-pulse" />;
      default:
        return <RotateCcw className="h-5 w-5 text-fortress-white" />;
    }
  };

  return (
    <div className="w-full h-full p-6 border border-fortress-border rounded-xl bg-fortress-surface/80 backdrop-blur flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RotateCcw className="h-6 w-6 text-fortress-white" />
          <h2 className="text-xl font-bold text-fortress-white">Tactical Rollback</h2>
        </div>
        {outputData?.status && (
          <div className="flex items-center gap-2">
            {getStatusIcon(outputData.status)}
            <span className={cn("text-sm font-semibold uppercase", getStatusColor(outputData.status))}>
              {outputData.status.replace("-", " ")}
            </span>
          </div>
        )}
      </div>

      {/* Deployment Info */}
      {deploymentId && (
        <div className="mb-6 p-4 bg-fortress-black/50 rounded-lg border border-fortress-border/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-fortress-muted mb-1">Project</p>
              <p className="text-sm font-semibold text-fortress-white">{projectName}</p>
            </div>
            <div>
              <p className="text-xs text-fortress-muted mb-1">Deployment ID</p>
              <p className="text-sm font-mono text-fortress-white truncate">
                {deploymentId.substring(0, 12)}...
              </p>
            </div>
            {targetVersion && (
              <div>
                <p className="text-xs text-fortress-muted mb-1">Target Version</p>
                <p className="text-sm text-fortress-white">{targetVersion}</p>
              </div>
            )}
            {reason && (
              <div className="col-span-2">
                <p className="text-xs text-fortress-muted mb-1">Reason</p>
                <p className="text-sm text-fortress-white">{reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {outputData && (outputData.status === "in-progress" || outputData.status === "initiated") && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-fortress-muted">Rollback Progress</span>
            <span className="text-xs font-semibold text-fortress-white">{localProgress}%</span>
          </div>
          <div className="h-2 bg-fortress-black/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out"
              style={{ width: `${localProgress}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          {outputData.estimatedCompletion && (
            <div className="flex items-center gap-2 mt-2 text-xs text-fortress-muted">
              <Clock className="h-3 w-3" />
              <span>ETA: {new Date(outputData.estimatedCompletion).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {outputData?.message && (
        <div
          className={cn(
            "p-4 rounded-lg mb-6 border",
            outputData.success
              ? "bg-green-500/10 border-green-500/30"
              : error
              ? "bg-red-500/10 border-red-500/30"
              : "bg-blue-500/10 border-blue-500/30"
          )}
        >
          <div className="flex items-start gap-3">
            {getStatusIcon(outputData.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-fortress-white">{outputData.message}</p>
              {outputData.previousDeploymentId && (
                <p className="text-xs text-fortress-muted mt-2">
                  Previous deployment: {outputData.previousDeploymentId.substring(0, 12)}...
                </p>
              )}
              <p className="text-xs text-fortress-muted mt-1">
                {new Date(outputData.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg mb-6 bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-400 mb-1">Rollback Failed</p>
              <p className="text-xs text-fortress-muted">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto">
        <button
          onClick={handleRollback}
          disabled={isExecuting || !deploymentId || outputData?.status === "in-progress"}
          className={cn(
            "w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "enabled:hover:scale-[1.02] enabled:active:scale-[0.98]",
            outputData?.success && showSuccess
              ? "bg-green-500/20 text-green-400 border-2 border-green-500/50"
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          )}
        >
          {isExecuting || outputData?.status === "in-progress" ? (
            <span className="flex items-center justify-center gap-2">
              <Activity className="h-4 w-4 animate-spin" />
              Executing Rollback...
            </span>
          ) : outputData?.success && showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Rollback Completed Successfully
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Initiate Rollback
            </span>
          )}
        </button>
      </div>

      {/* Footer Note */}
      <div className="mt-4 text-xs text-center text-fortress-muted">
        <p>Rollback operations are logged and can be audited in Vercel dashboard</p>
      </div>
    </div>
  );
};

// Create the interactable component
export const TacticalRollback = withInteractable(TacticalRollbackBase, {
  componentName: "TacticalRollback",
  description:
    "Orchestrates Vercel deployment rollbacks with real-time progress tracking. Allows AI to monitor and trigger deployment recovery operations.",
  propsSchema: tacticalRollbackInputSchema,
});
