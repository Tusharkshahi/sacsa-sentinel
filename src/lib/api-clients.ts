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
    const transformedIssues = issues.slice(0, options.limit || 10).map((issue: any) => {
      // Extract stack trace from various possible locations in Sentry response
      let stackTrace = "";
      if (issue.metadata?.value) {
        stackTrace = issue.metadata.value;
      } else if (issue.culprit) {
        stackTrace = `at ${issue.culprit}`;
      } else if (issue.lastEvent?.entries) {
        const exceptionEntry = issue.lastEvent.entries.find((e: any) => e.type === 'exception');
        if (exceptionEntry?.data?.values?.[0]?.stacktrace) {
          const frames = exceptionEntry.data.values[0].stacktrace.frames || [];
          stackTrace = frames.slice(-5).map((frame: any) => 
            `at ${frame.function || 'anonymous'} (${frame.filename}:${frame.lineno}:${frame.colno})`
          ).join('\n');
        }
      }

      return {
        id: issue.id,
        title: issue.title || issue.metadata?.type || "Unknown error",
        severity: (issue.level === "error" || issue.level === "fatal" ? "critical" : "warning") as "critical" | "warning" | "resolved",
        count: issue.count || 0,
        lastSeen: issue.lastSeen,
        project: project || "unknown",
        affectedUsers: issue.userCount || 0,
        stackTrace: stackTrace || `${issue.title} (no stack trace available)`,
      };
    });

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
        id: "94486645",
        title: "ReferenceError: myUndefinedFunction is not defined",
        severity: "critical" as const,
        count: 6,
        lastSeen: new Date().toISOString(),
        project: "javascript",
        affectedUsers: 5,
        stackTrace: `ReferenceError: myUndefinedFunction is not defined
    at handleSubmit (src/components/ContactForm.tsx:45:12)
    at HTMLButtonElement.callCallback (react-dom.production.min.js:3945:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:3994:16)
    at invokeGuardedCallback (react-dom.production.min.js:4056:31)
    at executeDispatch (react-dom.production.min.js:8551:3)

Likely cause: Function was renamed from 'validateAndSubmit' to 'handleFormValidation' in commit abc123f but one call site was missed.
File: src/components/ContactForm.tsx, Line 45
Suggested fix: Import and use 'handleFormValidation' instead or restore 'myUndefinedFunction' as an alias.`,
      },
    ],
    summary: {
      critical: 1,
      warning: 0,
      resolved: 0,
      totalEvents: 6,
    },
    timestamp: new Date().toISOString(),
  };
}

function getMockGitHubData(options: { commitSha: string; fileName?: string }) {
  return {
    commit: {
      sha: "abc123f",
      message: "Refactor: Rename validateAndSubmit to handleFormValidation for clarity",
      author: "dev@example.com",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      branch: "main",
      url: `https://github.com/example/repo/commit/abc123f`,
    },
    diff: {
      fileName: "src/utils/formHelpers.ts",
      language: "typescript",
      additions: 3,
      deletions: 3,
      changes: [
        {
          lineNumber: 12,
          type: "remove" as const,
          content: "export function validateAndSubmit(data: FormData) {",
        },
        {
          lineNumber: 13,
          type: "remove" as const,
          content: "  // Validate form data",
        },
        {
          lineNumber: 14,
          type: "remove" as const,
          content: "  return apiClient.post('/submit', data);",
        },
        {
          lineNumber: 12,
          type: "add" as const,
          content: "export function handleFormValidation(data: FormData) {",
        },
        {
          lineNumber: 13,
          type: "add" as const,
          content: "  // Validate form data before submission",
        },
        {
          lineNumber: 14,
          type: "add" as const,
          content: "  return apiClient.post('/submit', data);",
        },
        {
          lineNumber: 15,
          type: "context" as const,
          content: "}",
        },
      ],
    },
    analysis: {
      severity: "high" as const,
      potentialIssues: [
        "Function renamed but not all call sites updated",
        "Missing import update in ContactForm.tsx:45",
        "Breaking change deployed without backward compatibility"
      ],
      recommendation: "Add backward-compatible alias or update all references before deploying",
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
