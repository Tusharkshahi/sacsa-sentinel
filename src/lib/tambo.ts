/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

// Import Sentinel components
import { ThreatAlert, threatAlertSchema } from "@/components/sentinel/threat-alert";
import { FortressDiff, fortressDiffSchema } from "@/components/sentinel/fortress-diff";
import { TacticalRollback, tacticalRollbackInputSchema, tacticalRollbackOutputSchema } from "@/components/sentinel/tactical-rollback";

// Import new generative components
import { BattleStats, battleStatsSchema } from "@/components/generative/battle-stats";
import { ComparisonMatrix, comparisonMatrixSchema } from "@/components/generative/comparison-matrix";
import { Timeline, timelineSchema } from "@/components/generative/timeline";
import { Runbook, runbookSchema } from "@/components/generative/runbook";
import { CodeExplainer, codeExplainerSchema } from "@/components/generative/code-explainer";
import { DecisionMatrix, decisionMatrixSchema } from "@/components/generative/decision-matrix";
import { IncidentCommander, incidentCommanderSchema } from "@/components/generative/incident-commander";

// Import MCP tools for Sentry, GitHub, and Vercel
import { mcpTools } from "@/lib/mcp-tools";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  // Sentinel MCP Tools - Sentry, GitHub, and Vercel integrations
  ...mcpTools,
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  // AI Incident Commander - The Killer Feature ⭐
  {
    name: "IncidentCommander",
    description:
      "AI-powered autonomous incident analysis and resolution. Analyzes errors, identifies root causes, generates fixes, and suggests actions. Orchestrates ThreatAlert, CodeExplainer, and Runbook for intelligent incident response.",
    component: IncidentCommander,
    propsSchema: incidentCommanderSchema,
  },
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // Sentinel Components - Incident Response Command Center
  {
    name: "ThreatAlert",
    description:
      "Displays Sentry issues with traffic light severity signaling (red/amber/green). Provides real-time threat monitoring for production incidents.",
    component: ThreatAlert,
    propsSchema: threatAlertSchema,
  },
  {
    name: "FortressDiff",
    description:
      "Displays syntax-highlighted code diffs from GitHub commits. Identifies problematic changes with AI analysis.",
    component: FortressDiff,
    propsSchema: fortressDiffSchema,
  },
  {
    name: "TacticalRollback",
    description:
      "Orchestrates Vercel deployment rollbacks with real-time progress tracking. Interactable component for deployment recovery.",
    component: TacticalRollback,
    propsSchema: tacticalRollbackInputSchema,
  },
  // New Generative Components - Versatile UI elements for any use case
  {
    name: "BattleStats",
    description:
      "Displays real-time metrics in a command center style. Perfect for dashboards, KPIs, analytics, or any numerical data with status indicators.",
    component: BattleStats,
    propsSchema: battleStatsSchema,
  },
  {
    name: "ComparisonMatrix",
    description:
      "Side-by-side feature comparison table. Ideal for comparing products, services, plans, technologies, or any options with multiple attributes.",
    component: ComparisonMatrix,
    propsSchema: comparisonMatrixSchema,
  },
  {
    name: "Timeline",
    description:
      "Chronological event display with status indicators. Great for deployment history, project milestones, roadmaps, or process tracking.",
    component: Timeline,
    propsSchema: timelineSchema,
  },
  // High-Value Developer Tools
  {
    name: "Runbook",
    description:
      "AI-generated step-by-step troubleshooting and deployment guides. Perfect for debugging, incident response, setup instructions, or any procedural documentation.",
    component: Runbook,
    propsSchema: runbookSchema,
  },
  {
    name: "CodeExplainer",
    description:
      "Line-by-line code breakdown and explanation. Ideal for learning, code reviews, onboarding, or understanding complex algorithms and patterns.",
    component: CodeExplainer,
    propsSchema: codeExplainerSchema,
  },
  {
    name: "DecisionMatrix",
    description:
      "Technology and architecture decision helper with scoring. Helps choose between frameworks, libraries, databases, cloud providers, or architectural patterns.",
    component: DecisionMatrix,
    propsSchema: decisionMatrixSchema,
  },
  // Add more components here
];
