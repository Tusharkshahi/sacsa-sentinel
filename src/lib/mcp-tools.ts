/**
 * @file mcp-tools.ts
 * @description MCP Tool configurations for Sentry, GitHub, and Vercel integrations
 * 
 * This file defines the MCP tools that enable AI to communicate with external
 * DevOps services for the Sacsa-Sentinel incident response system.
 * 
 * Uses server actions to ensure environment variables are accessible.
 */

import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import {
  getSentryIssuesAction,
  getGitHubCommitDiffAction,
  getVercelDeploymentsAction,
  executeVercelRollbackAction,
} from "./server-actions";

/**
 * Sentry MCP Tools
 * Fetches error tracking and issue monitoring data
 */

export const getSentryIssues: TamboTool = {
  name: "getSentryIssues",
  description:
    "Fetches active Sentry issues with severity levels, event counts, and affected users. Returns data formatted for ThreatAlert component.",
  tool: async (input: {
    projectId?: string;
    severity?: "critical" | "warning" | "resolved";
    limit?: number;
  }) => {
    return await getSentryIssuesAction(input);
  },
  inputSchema: z.object({
    projectId: z.string().optional(),
    severity: z.enum(["critical", "warning", "resolved"]).optional(),
    limit: z.number().optional(),
  }),
  outputSchema: z.object({
    issues: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        severity: z.enum(["critical", "warning", "resolved"]),
        count: z.number(),
        lastSeen: z.string(),
        project: z.string(),
        affectedUsers: z.number().optional(),
        stackTrace: z.string().optional(),
      })
    ),
    summary: z.object({
      critical: z.number(),
      warning: z.number(),
      resolved: z.number(),
      totalEvents: z.number(),
    }),
    timestamp: z.string(),
  }),
};

/**
 * GitHub MCP Tools
 * Fetches commit diffs and repository data
 */

export const getGitHubCommitDiff: TamboTool = {
  name: "getGitHubCommitDiff",
  description:
    "Fetches a specific commit diff from GitHub with syntax highlighting context. Provides AI analysis of potential issues in the code changes.",
  tool: async (input: {
    owner: string;
    repo: string;
    commitSha: string;
    fileName?: string;
  }) => {
    return await getGitHubCommitDiffAction(input);
  },
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    commitSha: z.string(),
    fileName: z.string().optional(),
  }),
  outputSchema: z.object({
    commit: z.object({
      sha: z.string(),
      message: z.string(),
      author: z.string(),
      date: z.string(),
      branch: z.string(),
      url: z.string().optional(),
    }),
    diff: z.object({
      fileName: z.string(),
      language: z.string(),
      additions: z.number(),
      deletions: z.number(),
      changes: z.array(
        z.object({
          lineNumber: z.number(),
          type: z.enum(["add", "remove", "context"]),
          content: z.string(),
        })
      ),
    }),
    analysis: z.object({
      severity: z.enum(["high", "medium", "low"]),
      potentialIssues: z.array(z.string()),
      recommendation: z.string().optional(),
    }),
  }),
};

/**
 * Vercel MCP Tools
 * Manages deployment operations and rollbacks
 */

export const executeVercelRollback: TamboTool = {
  name: "executeVercelRollback",
  description:
    "Initiates a Vercel deployment rollback operation. Monitors progress and returns status updates with real-time progress tracking.",
  tool: async (input: {
    deploymentId: string;
    projectName: string;
    targetVersion?: string;
    reason?: string;
  }) => {
    return await executeVercelRollbackAction(input);
  },
  inputSchema: z.object({
    deploymentId: z.string(),
    projectName: z.string(),
    targetVersion: z.string().optional(),
    reason: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    deploymentId: z.string(),
    previousDeploymentId: z.string().optional(),
    status: z.enum(["initiated", "in-progress", "completed", "failed"]),
    progress: z.number().min(0).max(100),
    message: z.string(),
    timestamp: z.string(),
    estimatedCompletion: z.string().optional(),
  }),
};

export const getVercelDeployments: TamboTool = {
  name: "getVercelDeployments",
  description:
    "Lists recent Vercel deployments for a project with status and metadata",
  tool: async (input: { projectName: string; limit?: number }) => {
    return await getVercelDeploymentsAction(input);
  },
  inputSchema: z.object({
    projectName: z.string(),
    limit: z.number().optional(),
  }),
  outputSchema: z.object({
    deployments: z.array(
      z.object({
        id: z.string(),
        projectName: z.string(),
        status: z.string(),
        url: z.string(),
        createdAt: z.string(),
        commitSha: z.string().optional(),
        branch: z.string().optional(),
      })
    ),
  }),
};

/**
 * Export all MCP tools as an array for registration
 */
export const mcpTools: TamboTool[] = [
  getSentryIssues,
  getGitHubCommitDiff,
  executeVercelRollback,
  getVercelDeployments,
];
