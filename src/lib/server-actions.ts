"use server";

/**
 * @file server-actions.ts
 * @description Server Actions for MCP tools to access environment variables
 * 
 * These server actions wrap API client calls so they can execute on the server
 * where process.env is available. This allows MCP tools to access real APIs
 * when called from the client-side chat interface.
 */

import {
  fetchSentryIssues,
  fetchGitHubCommitDiff,
  fetchVercelDeployments,
  executeVercelRollback,
} from "./api-clients";

/**
 * Server action to fetch Sentry issues
 */
export async function getSentryIssuesAction(input: {
  projectId?: string;
  severity?: "critical" | "warning" | "resolved";
  limit?: number;
}) {
  try {
    return await fetchSentryIssues(input);
  } catch (error) {
    console.error("Error in getSentryIssuesAction:", error);
    // Return safe mock data on error
    return {
      issues: [],
      summary: { critical: 0, warning: 0, resolved: 0, totalEvents: 0 },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server action to fetch GitHub commit diff
 */
export async function getGitHubCommitDiffAction(input: {
  owner: string;
  repo: string;
  commitSha: string;
  fileName?: string;
}) {
  try {
    return await fetchGitHubCommitDiff(input);
  } catch (error) {
    console.error("Error in getGitHubCommitDiffAction:", error);
    // Return safe mock data on error
    return {
      commit: {
        sha: input.commitSha,
        message: "Error fetching commit",
        author: "unknown",
        date: new Date().toISOString(),
        branch: "main",
        url: "",
      },
      diff: {
        fileName: input.fileName || "unknown",
        language: "text",
        additions: 0,
        deletions: 0,
        changes: [],
      },
      analysis: {
        severity: "low" as const,
        potentialIssues: [],
        recommendation: "Unable to analyze changes at this time.",
      },
    };
  }
}

/**
 * Server action to fetch Vercel deployments
 */
export async function getVercelDeploymentsAction(input: {
  projectName: string;
  limit?: number;
}) {
  try {
    return await fetchVercelDeployments(input);
  } catch (error) {
    console.error("Error in getVercelDeploymentsAction:", error);
    // Return safe mock data on error
    return {
      deployments: [],
      summary: { total: 0, successful: 0, failed: 0, building: 0 },
      currentProduction: null,
    };
  }
}

/**
 * Server action to execute Vercel rollback
 */
export async function executeVercelRollbackAction(input: {
  deploymentId: string;
  projectName: string;
  targetDeploymentId?: string;
}) {
  try {
    return await executeVercelRollback(input);
  } catch (error) {
    console.error("Error in executeVercelRollbackAction:", error);
    // Return safe error response
    return {
      success: false,
      deploymentId: input.deploymentId,
      message: `Failed to rollback: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: new Date().toISOString(),
    };
  }
}
