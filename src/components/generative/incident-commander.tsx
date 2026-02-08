"use client";

import React, { useState } from "react";
import { z } from "zod";
import { 
  Brain, 
  Zap, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  ArrowRight,
  Sparkles,
  Code2,
  FileText,
  Cpu
} from "lucide-react";

export const incidentCommanderSchema = z.object({
  incident: z.object({
    id: z.string().default("unknown"),
    title: z.string().default("Unknown incident"),
    severity: z.enum(["critical", "high", "medium", "low"]).default("medium"),
    affectedUsers: z.number().default(0),
  }).optional().default({ id: "unknown", title: "Unknown incident", severity: "medium", affectedUsers: 0 }),
  analysis: z.object({
    rootCause: z.string().default("Analyzing..."),
    confidence: z.number().min(0).max(100).default(0),
    affectedFiles: z.array(z.string()).default([]),
    relatedCommits: z.array(z.string()).default([]),
  }).optional().default({ rootCause: "Analyzing...", confidence: 0, affectedFiles: [], relatedCommits: [] }),
  suggestedFix: z.object({
    description: z.string().default("Generating fix..."),
    code: z.string().optional(),
    steps: z.array(z.string()).default([]),
    estimatedTime: z.string().default("Unknown"),
    riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
  }).optional().default({ description: "Generating fix...", steps: [], estimatedTime: "Unknown", riskLevel: "medium" }),
  actions: z.array(
    z.object({
      label: z.string().default("Action"),
      type: z.preprocess(
        (val) => {
          // Normalize action types to handle common variations
          if (typeof val !== 'string') return 'investigate';
          const normalized = val.toLowerCase().trim();
          const typeMap: Record<string, string> = {
            "rollback": "rollback",
            "roll back": "rollback",
            "revert": "rollback",
            "hotfix": "hotfix",
            "hot fix": "hotfix",
            "patch": "hotfix",
            "fix": "hotfix",
            "pr": "pr",
            "pull request": "pr",
            "pullrequest": "pr",
            "create pr": "pr",
            "investigate": "investigate",
            "analyze": "investigate",
            "debug": "investigate",
            "check": "investigate",
          };
          return typeMap[normalized] || "investigate";
        },
        z.enum(["rollback", "hotfix", "pr", "investigate"])
      ).default("investigate"),
      enabled: z.boolean().default(true),
    })
  ).default([]),
});

type IncidentCommanderProps = z.infer<typeof incidentCommanderSchema>;

/**
 * IncidentCommander Component
 * AI-powered incident analysis and auto-resolution
 * The killer feature that orchestrates multiple components for intelligent incident response
 */
export const IncidentCommander: React.FC<IncidentCommanderProps> = ({
  incident,
  analysis,
  suggestedFix,
  actions,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      case "high":
        return "bg-orange-500/20 border-orange-500/50 text-orange-400";
      case "medium":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
      default:
        return "bg-blue-500/20 border-blue-500/50 text-blue-400";
    }
  };

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-400 bg-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      default:
        return "text-green-400 bg-green-500/20";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "rollback":
        return <GitBranch className="w-4 h-4" />;
      case "hotfix":
        return <Zap className="w-4 h-4" />;
      case "pr":
        return <Code2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const steps = [
    { label: "Detect", icon: AlertTriangle, complete: true },
    { label: "Analyze", icon: Brain, complete: analysis.confidence > 0 },
    { label: "Generate Fix", icon: Sparkles, complete: suggestedFix.code !== undefined },
    { label: "Deploy", icon: Zap, complete: false },
  ];

  return (
    <div className="w-full rounded-lg border border-[#2a2a3e] bg-[#14141f] p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
      
      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/50">
              <Cpu className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Incident Commander
                <Sparkles className="w-5 h-5 text-purple-400" />
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Autonomous incident analysis & resolution
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border ${getSeverityStyle(incident.severity)} text-xs font-bold uppercase`}>
            {incident.severity}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isComplete = step.complete;
            
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      isComplete
                        ? "border-green-500 bg-green-500/20"
                        : isActive
                        ? "border-purple-500 bg-purple-500/20 animate-pulse"
                        : "border-gray-600 bg-gray-800/50"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : "text-gray-500"}`} />
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${isComplete ? "text-green-400" : isActive ? "text-purple-400" : "text-gray-500"}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 ${step.complete ? "bg-green-500" : "bg-gray-700"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Incident Info */}
      <div className="relative mb-6 p-4 rounded-lg bg-[#0a0a0f]/50 border border-[#2a2a3e]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white mb-1">{incident.title}</h4>
            <p className="text-sm text-gray-400">
              Incident ID: <span className="text-purple-400 font-mono">{incident.id}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-400">{incident.affectedUsers}</p>
            <p className="text-xs text-gray-400">Affected Users</p>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="relative mb-6 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-blue-400" />
          <h4 className="font-bold text-white">AI Analysis</h4>
          {isAnalyzing && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Root Cause</p>
            <p className="text-sm text-white leading-relaxed">{analysis.rootCause}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      analysis.confidence >= 80
                        ? "bg-green-500"
                        : analysis.confidence >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${analysis.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white">{analysis.confidence}%</span>
              </div>
            </div>
          </div>

          {analysis.affectedFiles.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Affected Files</p>
              <div className="flex flex-wrap gap-2">
                {analysis.affectedFiles.map((file, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30"
                  >
                    {file}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Fix */}
      <div className="relative mb-6 p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-green-400" />
          <h4 className="font-bold text-white">Suggested Fix</h4>
          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${getRiskStyle(suggestedFix.riskLevel)}`}>
            {suggestedFix.riskLevel} risk
          </span>
        </div>

        <p className="text-sm text-white mb-3">{suggestedFix.description}</p>

        {suggestedFix.code && (
          <div className="mb-3 p-3 rounded bg-black/50 border border-green-500/20">
            <pre className="text-xs text-green-300 font-mono overflow-x-auto">
              {suggestedFix.code}
            </pre>
          </div>
        )}

        {suggestedFix.steps.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Implementation Steps</p>
            <ol className="space-y-1">
              {suggestedFix.steps.map((step, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 font-bold">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>Estimated time: <span className="text-white font-semibold">{suggestedFix.estimatedTime}</span></span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            disabled={!action.enabled}
            className={`group relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-semibold transition-all ${
              action.enabled
                ? "border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-500 text-cyan-300 hover:scale-105"
                : "border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed"
            }`}
          >
            {getActionIcon(action.type)}
            {action.label}
            {action.enabled && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        ))}
      </div>

      {/* Animated scan line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 animate-pulse" />
    </div>
  );
};
