/**
 * @file vercel-server-example.js
 * @description Example MCP Server implementation for Vercel integration
 * 
 * This is a reference implementation showing how to create a custom MCP server
 * for Vercel deployment management. You'll need to implement the actual Vercel
 * API calls based on your requirements.
 * 
 * To use this server:
 * 1. Install dependencies: npm install @modelcontextprotocol/sdk
 * 2. Set environment variables: VERCEL_TOKEN, VERCEL_TEAM_ID
 * 3. Run: node vercel-server-example.js
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Vercel API configuration
const VERCEL_API_BASE = "https://api.vercel.com";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

if (!VERCEL_TOKEN) {
  console.error("VERCEL_TOKEN environment variable is required");
  process.exit(1);
}

// Helper function to make Vercel API requests
async function vercelApiRequest(endpoint, options = {}) {
  const url = `${VERCEL_API_BASE}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (VERCEL_TEAM_ID) {
    headers["X-Vercel-Team-Id"] = VERCEL_TEAM_ID;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.statusText}`);
  }

  return response.json();
}

// Create MCP server
const server = new Server(
  {
    name: "vercel-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_deployments",
        description: "List recent deployments for a Vercel project",
        inputSchema: {
          type: "object",
          properties: {
            projectName: {
              type: "string",
              description: "Name of the Vercel project",
            },
            limit: {
              type: "number",
              description: "Maximum number of deployments to return",
              default: 10,
            },
          },
          required: ["projectName"],
        },
      },
      {
        name: "get_deployment",
        description: "Get details of a specific deployment",
        inputSchema: {
          type: "object",
          properties: {
            deploymentId: {
              type: "string",
              description: "Unique identifier of the deployment",
            },
          },
          required: ["deploymentId"],
        },
      },
      {
        name: "rollback_deployment",
        description: "Rollback to a previous deployment",
        inputSchema: {
          type: "object",
          properties: {
            deploymentId: {
              type: "string",
              description: "Current deployment ID to rollback from",
            },
            projectName: {
              type: "string",
              description: "Name of the Vercel project",
            },
            targetVersion: {
              type: "string",
              description: "Target deployment ID to rollback to (optional)",
            },
            reason: {
              type: "string",
              description: "Reason for the rollback",
            },
          },
          required: ["deploymentId", "projectName"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_deployments": {
        const { projectName, limit = 10 } = args;
        
        // Example API call to Vercel
        const data = await vercelApiRequest(
          `/v6/deployments?projectId=${projectName}&limit=${limit}`
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                deployments: data.deployments.map((d) => ({
                  id: d.uid,
                  projectName: d.name,
                  status: d.readyState,
                  url: d.url,
                  createdAt: new Date(d.created).toISOString(),
                  commitSha: d.meta?.githubCommitSha,
                  branch: d.meta?.githubCommitRef,
                })),
              }),
            },
          ],
        };
      }

      case "get_deployment": {
        const { deploymentId } = args;
        
        const data = await vercelApiRequest(`/v13/deployments/${deploymentId}`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: data.uid,
                projectName: data.name,
                status: data.readyState,
                url: data.url,
                createdAt: new Date(data.created).toISOString(),
                commitSha: data.meta?.githubCommitSha,
                branch: data.meta?.githubCommitRef,
              }),
            },
          ],
        };
      }

      case "rollback_deployment": {
        const { deploymentId, projectName, targetVersion, reason } = args;
        
        // Vercel doesn't have a direct rollback API, so we simulate it by:
        // 1. Finding the previous successful deployment
        // 2. Creating a new deployment from that state
        
        // Get previous deployments
        const deploymentsData = await vercelApiRequest(
          `/v6/deployments?projectId=${projectName}&limit=5`
        );

        const previousDeployment = targetVersion
          ? deploymentsData.deployments.find((d) => d.uid === targetVersion)
          : deploymentsData.deployments.find(
              (d) => d.uid !== deploymentId && d.readyState === "READY"
            );

        if (!previousDeployment) {
          throw new Error("No suitable previous deployment found for rollback");
        }

        // In a real implementation, you would:
        // 1. Promote the previous deployment
        // 2. Or redeploy from the previous commit

        // Simulated response
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                deploymentId: deploymentId,
                previousDeploymentId: previousDeployment.uid,
                status: "completed",
                progress: 100,
                message: `Successfully rolled back ${projectName} to deployment ${previousDeployment.uid.substring(0, 8)}`,
                timestamp: new Date().toISOString(),
              }),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error.message,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vercel MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
