import React from "react";
import { ThreatAlert, FortressDiff, TacticalRollback } from "@/components/sentinel";
import { BattleStats } from "@/components/generative/battle-stats";
import { Timeline } from "@/components/generative/timeline";
import {
  fetchSentryIssues,
  fetchGitHubCommitDiff,
  fetchVercelDeployments,
} from "@/lib/api-clients";
import { Activity, Zap, Shield, Clock, RefreshCw, AlertTriangle, TrendingUp } from "lucide-react";

/**
 * Sacsa-Sentinel: Incident Response Command Center
 * 
 * Inspired by the Incan fortress Sacsayhuaman, this watchpoint provides
 * strategic oversight for DevOps teams through generative AI components
 * and real-time monitoring integration with Sentry, GitHub, and Vercel.
 * 
 * This is a Server Component that fetches real data from external APIs.
 */
export default async function SentinelPage() {
  // Fetch real data from APIs (with fallbacks to mock data if env vars not set)
  const threatData = await fetchSentryIssues({ limit: 10 });
  
  // For demo purposes, using a specific commit - in production this would be dynamic
  // You can customize these values or make them dynamic based on your needs
  const githubOwner = process.env.GITHUB_REPO_OWNER || "vercel";
  const githubRepo = process.env.GITHUB_REPO_NAME || "next.js";
  const commitSha = process.env.GITHUB_COMMIT_SHA || "main";
  
  const diffData = await fetchGitHubCommitDiff({
    owner: githubOwner,
    repo: githubRepo,
    commitSha: commitSha,
  });

  const vercelProjectName = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME || "demo-project";
  const deploymentsData = await fetchVercelDeployments({ 
    projectName: vercelProjectName, 
    limit: 5 
  }).catch(err => {
    console.error("Error fetching Vercel deployments:", err);
    return { deployments: [] };
  });

  // Prepare rollback data from latest deployment
  const latestDeployment = deploymentsData.deployments[0];
  const rollbackData = {
    deploymentId: latestDeployment?.id || "dpl_demo",
    projectName: vercelProjectName,
    targetVersion: latestDeployment?.url || "",
    reason: "Monitoring for potential rollback scenarios",
  };

  // Prepare metrics data
  const metricsData = {
    title: "System Vitals",
    metrics: [
      { label: "Response Time", value: "247ms", change: -12, icon: "⚡" },
      { label: "Uptime", value: "99.98%", change: 0.1, icon: "🛡️" },
      { label: "Active Incidents", value: threatData.summary.critical + threatData.summary.warning, change: -25, icon: "🚨" },
      { label: "Deployments Today", value: deploymentsData.deployments?.length || 0, change: 15, icon: "🚀" },
    ],
    status: threatData.summary.critical > 0 ? "alert" as const : "victory" as const,
  };

  // Prepare timeline data from recent issues
  const timelineData = {
    title: "Recent Activity",
    events: [
      ...threatData.issues.slice(0, 3).map((issue) => ({
        title: issue.title,
        description: `${issue.project} • ${issue.severity.toUpperCase()} • ${issue.count} events`,
        timestamp: issue.lastSeen,
        status: issue.severity === "resolved" ? "completed" as const : "failed" as const,
        meta: `${issue.affectedUsers} users affected`,
      })),
      ...(deploymentsData.deployments || []).slice(0, 2).map((deploy: any) => {
        // Safe date handling - check if created exists and is valid
        let timestamp: string;
        try {
          if (deploy.created) {
            // Try to parse the date
            const date = new Date(deploy.created);
            timestamp = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
          } else {
            timestamp = new Date().toISOString();
          }
        } catch {
          timestamp = new Date().toISOString();
        }

        return {
          title: `Deployment to ${deploy.target || 'production'}`,
          description: deploy.name || 'Deployment',
          timestamp,
          status: deploy.state === "READY" ? "completed" as const : "in-progress" as const,
          meta: deploy.creator?.username || 'System',
        };
      }),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f8f9fa] relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2a3e_1px,transparent_1px),linear-gradient(to_bottom,#2a2a3e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <header className="border-b border-[#2a2a3e] bg-[#14141f]/80 backdrop-blur-xl relative z-10 sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#f8f9fa] flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan-400" />
                Sacsa-Sentinel
              </h1>
              <p className="text-sm text-[#8b8b9e] mt-1 font-mono">
                ⚡ Incident Response Command Center
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Live indicator */}
              <div className="flex items-center gap-2 text-xs text-[#8b8b9e] px-3 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold">LIVE</span>
              </div>
              {/* Auto-refresh */}
              <div className="flex items-center gap-2 text-xs text-[#8b8b9e] px-3 py-2 rounded-full bg-[#14141f] border border-[#2a2a3e]">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Auto-refresh: 30s</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[
            { icon: Activity, label: "Active Alerts", value: threatData.summary.critical + threatData.summary.warning, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            { icon: TrendingUp, label: "Resolved", value: threatData.summary.resolved, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            { icon: Zap, label: "Deployments", value: deploymentsData.deployments?.length || 0, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
            { icon: Clock, label: "Avg Response", value: "247ms", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`relative rounded-lg border ${stat.border} ${stat.bg} p-4 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-transform duration-300`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#8b8b9e] uppercase tracking-wider font-semibold">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                </div>
                {/* Scan line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 animate-pulse" />
              </div>
            );
          })}
        </div>

        {/* System Vitals - Battle Stats */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-30" />
          <div className="relative">
            <BattleStats {...metricsData} />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-auto">
          {/* ThreatAlert - Top Left, spanning 2 rows */}
          <div className="lg:col-span-5 lg:row-span-2 flex relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative w-full">
              <ThreatAlert {...threatData} />
            </div>
          </div>

          {/* FortressDiff - Top Right */}
          <div className="lg:col-span-7 lg:row-span-1 flex relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative w-full">
              <FortressDiff {...diffData} />
            </div>
          </div>

          {/* TacticalRollback - Bottom Right */}
          <div className="lg:col-span-7 lg:row-span-1 flex relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative w-full">
              <TacticalRollback {...rollbackData} />
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur opacity-30" />
          <div className="relative">
            <Timeline {...timelineData} />
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-lg border border-[#2a2a3e] bg-[#14141f]/80 backdrop-blur-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
          <div className="relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Acknowledge All", icon: Shield, colorClasses: "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-cyan-400" },
                { label: "View Logs", icon: Activity, colorClasses: "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 text-blue-400" },
                { label: "Create Incident", icon: AlertTriangle, colorClasses: "border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/40 text-orange-400" },
                { label: "Run Diagnostics", icon: Zap, colorClasses: "border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 text-purple-400" },
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    className={`group relative rounded-lg border ${action.colorClasses} px-4 py-3 text-left transition-all duration-300 hover:scale-105`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-semibold text-white">{action.label}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Strategic Notes */}
        <div className="rounded-lg border border-[#2a2a3e]/50 bg-gradient-to-br from-[#14141f]/80 to-[#0a0a0f]/80 p-6 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,255,0.05),transparent_50%)]" />
          <div className="relative">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-cyan-400 mt-1 animate-pulse" />
              <div>
                <p className="text-xs text-[#8b8b9e] leading-relaxed">
                  <span className="text-cyan-400 font-bold uppercase tracking-wide">Watchpoint Protocol:</span>{" "}
                  This command center employs <span className="text-white font-semibold">generative AI</span> to synthesize production signals in real-time.
                  <br className="my-2" />
                  🔴 <span className="text-red-400 font-semibold">ThreatAlert</span> monitors Sentry for critical issues • 
                  🔵 <span className="text-blue-400 font-semibold">FortressDiff</span> identifies problematic commits via GitHub • 
                  🟣 <span className="text-purple-400 font-semibold">TacticalRollback</span> orchestrates Vercel deployment recovery.
                  <br className="my-2" />
                  All metrics update automatically. System is operational and monitoring <span className="text-green-400 font-semibold">{threatData.issues.length}</span> data points.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
