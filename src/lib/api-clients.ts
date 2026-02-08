/**
 * @file api-clients.ts
 * @description Real API client implementations for Sentry, GitHub, and Vercel
 */

/**
 * Sentry API Client
 */
export async function fetchSentryIssues(options: {
  projectId?: string;
  severity?: "critical" | "warning" | "resolved";
  limit?: number;
}) {
  const authToken = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;
  const project = options.projectId || process.env.SENTRY_PROJECT_SLUG;

  if (!authToken || !org || !project) {
    console.warn("Sentry credentials missing, using mock data");
    return getMockSentryData();
  }

  try {
    const url = `https://sentry.io/api/0/projects/${org}/${project}/issues/?statsPeriod=14d&query=is:unresolved`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Sentry API error: ${response.status} ${response.statusText}`);
      throw new Error(`Sentry API error: ${response.statusText}`);
    }

    const issues = await response.json();
    
    if (!Array.isArray(issues)) {
      console.error("Sentry API returned non-array response");
      throw new Error("Invalid Sentry API response");
    }
    
    // Transform Sentry API response to our schema
    const transformedIssues = issues.slice(0, options.limit || 10).map((issue: any) => ({
      id: issue.id,
      title: issue.title || issue.metadata?.type || "Unknown error",
      severity: (issue.level === "error" || issue.level === "fatal" ? "critical" : "warning") as "critical" | "warning" | "resolved",
      count: issue.count || 0,
      lastSeen: issue.lastSeen,
      project: project || "unknown",
      affectedUsers: issue.userCount || 0,
      stackTrace: issue.metadata?.value || "",
    }));

    // Calculate summary
    const summary = {
      critical: transformedIssues.filter((i: any) => i.severity === "critical").length,
      warning: transformedIssues.filter((i: any) => i.severity === "warning").length,
      resolved: 0,
      totalEvents: transformedIssues.reduce((sum: number, i: any) => sum + i.count, 0),
    };

    return {
      issues: transformedIssues,
      summary,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching Sentry issues:", error);
    return getMockSentryData();
  }
}

/**
 * GitHub API Client
 */
export async function fetchGitHubCommitDiff(options: {
  owner: string;
  repo: string;
  commitSha: string;
  fileName?: string;
}) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn("GitHub token missing, using mock data");
    return getMockGitHubData(options);
  }

  try {
    // Fetch commit details
    const commitUrl = `https://api.github.com/repos/${options.owner}/${options.repo}/commits/${options.commitSha}`;
    const commitResponse = await fetch(commitUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!commitResponse.ok) {
      throw new Error(`GitHub API error: ${commitResponse.statusText}`);
    }

    const commitData = await commitResponse.json();
    
    // Get the first file or specified file
    const file = options.fileName 
      ? commitData.files.find((f: any) => f.filename === options.fileName)
      : commitData.files[0];

    if (!file) {
      throw new Error("No files found in commit");
    }

    // Parse the patch into structured changes
    const changes = parsePatch(file.patch || "");

    return {
      commit: {
        sha: commitData.sha,
        message: commitData.commit.message,
        author: commitData.commit.author.email,
        date: commitData.commit.author.date,
        branch: "main", // GitHub API doesn't provide this directly in commit endpoint
        url: commitData.html_url,
      },
      diff: {
        fileName: file.filename,
        language: getLanguageFromFilename(file.filename),
        additions: file.additions,
        deletions: file.deletions,
        changes,
      },
      analysis: {
        severity: "medium" as const,
        potentialIssues: analyzeChanges(changes, file.filename),
        recommendation: "Review changes for potential issues before deploying to production.",
      },
    };
  } catch (error) {
    console.error("Error fetching GitHub commit:", error);
    return getMockGitHubData(options);
  }
}

/**
 * Vercel API Client
 */
export async function fetchVercelDeployments(options: { projectName: string; limit?: number }) {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token) {
    console.warn("Vercel token missing, using mock data");
    return getMockVercelDeployments(options);
  }

  try {
    const url = teamId
      ? `https://api.vercel.com/v6/deployments?projectId=${options.projectName}&limit=${options.limit || 5}&teamId=${teamId}`
      : `https://api.vercel.com/v6/deployments?projectId=${options.projectName}&limit=${options.limit || 5}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      deployments: data.deployments.map((dep: any) => ({
        id: dep.uid,
        projectName: options.projectName,
        status: dep.state,
        url: `https://${dep.url}`,
        createdAt: new Date(dep.created).toISOString(),
        commitSha: dep.meta?.githubCommitSha,
        branch: dep.meta?.githubCommitRef,
      })),
    };
  } catch (error) {
    console.error("Error fetching Vercel deployments:", error);
    return getMockVercelDeployments(options);
  }
}

export async function executeVercelRollback(options: {
  deploymentId: string;
  projectName: string;
  targetVersion?: string;
  reason?: string;
}) {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token) {
    console.warn("Vercel token missing, simulating rollback");
    return getMockRollbackResult(options);
  }

  try {
    // Vercel doesn't have a direct "rollback" endpoint
    // We need to promote a previous deployment
    // First, get the deployment to rollback to
    const deploymentsData = await fetchVercelDeployments({ 
      projectName: options.projectName, 
      limit: 10 
    });

    // Find a successful deployment before the current one
    const targetDeployment = deploymentsData.deployments.find(
      (d: any) => d.id !== options.deploymentId && d.status === "READY"
    );

    if (!targetDeployment) {
      throw new Error("No suitable deployment found for rollback");
    }

    // Promote the previous deployment
    const promoteUrl = teamId
      ? `https://api.vercel.com/v13/deployments/${targetDeployment.id}/promote?teamId=${teamId}`
      : `https://api.vercel.com/v13/deployments/${targetDeployment.id}/promote`;

    const response = await fetch(promoteUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Vercel rollback error: ${response.statusText}`);
    }

    return {
      success: true,
      deploymentId: options.deploymentId,
      previousDeploymentId: targetDeployment.id,
      status: "completed" as const,
      progress: 100,
      message: `Successfully rolled back ${options.projectName} to deployment ${targetDeployment.id}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error executing Vercel rollback:", error);
    return {
      success: false,
      deploymentId: options.deploymentId,
      status: "failed" as const,
      progress: 0,
      message: `Rollback failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function parsePatch(patch: string) {
  const lines = patch.split("\n");
  const changes: Array<{
    lineNumber: number;
    type: "add" | "remove" | "context";
    content: string;
  }> = [];

  let lineNumber = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      // Parse line number from hunk header
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        lineNumber = parseInt(match[2]);
      }
      continue;
    }

    if (line.startsWith("+")) {
      changes.push({
        lineNumber: lineNumber++,
        type: "add",
        content: line.substring(1),
      });
    } else if (line.startsWith("-")) {
      changes.push({
        lineNumber: lineNumber,
        type: "remove",
        content: line.substring(1),
      });
    } else if (line.startsWith(" ")) {
      changes.push({
        lineNumber: lineNumber++,
        type: "context",
        content: line.substring(1),
      });
    }
  }

  return changes.slice(0, 20); // Limit to first 20 lines for display
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    go: "go",
    java: "java",
    rb: "ruby",
    php: "php",
    css: "css",
    html: "html",
  };
  return langMap[ext || ""] || "text";
}

function analyzeChanges(
  changes: Array<{ type: string; content: string }>,
  filename: string
): string[] {
  const issues: string[] = [];
  const addedLines = changes.filter((c) => c.type === "add").map((c) => c.content);

  // Simple heuristics for potential issues
  if (addedLines.some((line) => line.includes("console.log"))) {
    issues.push("Debug logging statement added - consider removing before production");
  }

  if (addedLines.some((line) => line.includes("TODO") || line.includes("FIXME"))) {
    issues.push("TODO/FIXME comments found - incomplete work may exist");
  }

  if (addedLines.some((line) => line.includes("any"))) {
    issues.push("TypeScript 'any' type used - consider using specific types");
  }

  if (issues.length === 0) {
    issues.push("No obvious issues detected - changes appear safe");
  }

  return issues;
}

// ============================================================================
// Mock Data Fallbacks
// ============================================================================

function getMockSentryData() {
  return {
    issues: [
      {
        id: "SENTRY-MOCK-001",
        title: "Mock Error: Configure SENTRY_AUTH_TOKEN to see real data",
        severity: "warning" as const,
        count: 0,
        lastSeen: new Date().toISOString(),
        project: "demo-project",
        affectedUsers: 0,
        stackTrace: "Set SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT_SLUG in .env.local",
      },
    ],
    summary: {
      critical: 0,
      warning: 1,
      resolved: 0,
      totalEvents: 0,
    },
    timestamp: new Date().toISOString(),
  };
}

function getMockGitHubData(options: { commitSha: string; fileName?: string }) {
  return {
    commit: {
      sha: options.commitSha,
      message: "Mock commit - Configure GITHUB_TOKEN to see real data",
      author: "demo@example.com",
      date: new Date().toISOString(),
      branch: "main",
      url: `https://github.com/example/repo/commit/${options.commitSha}`,
    },
    diff: {
      fileName: options.fileName || "README.md",
      language: "markdown",
      additions: 1,
      deletions: 0,
      changes: [
        {
          lineNumber: 1,
          type: "add" as const,
          content: "Set GITHUB_TOKEN in .env.local to see real commit diffs",
        },
      ],
    },
    analysis: {
      severity: "low" as const,
      potentialIssues: ["Configure GitHub API token to analyze real commits"],
      recommendation: "Add GITHUB_TOKEN to .env.local file",
    },
  };
}

function getMockVercelDeployments(options: { projectName: string }) {
  return {
    deployments: [
      {
        id: "dpl_mock_current",
        projectName: options.projectName,
        status: "READY",
        url: `https://${options.projectName}.vercel.app`,
        createdAt: new Date().toISOString(),
        commitSha: "mock_sha_123",
        branch: "main",
      },
    ],
  };
}

function getMockRollbackResult(options: { deploymentId: string; projectName: string }) {
  return {
    success: true,
    deploymentId: options.deploymentId,
    previousDeploymentId: "dpl_mock_previous",
    status: "completed" as const,
    progress: 100,
    message: `Mock rollback completed for ${options.projectName}. Set VERCEL_TOKEN in .env.local for real rollbacks.`,
    timestamp: new Date().toISOString(),
  };
}
