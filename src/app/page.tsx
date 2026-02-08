"use client";

import Link from "next/link";
import { MessageSquare, Zap, Shield, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2a3e_1px,transparent_1px),linear-gradient(to_bottom,#2a2a3e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Glow orbs */}
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {/* Hero Section */}
        <div
          className={`max-w-5xl text-center transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Title */}
          <h1 className="mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-6xl font-bold leading-tight text-transparent md:text-7xl lg:text-8xl">
            Sacsa-Sentinel
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-xl text-gray-300 md:text-2xl">
            Your AI Developer Copilot - Just Ask, Watch Components Appear
          </p>

          {/* Description */}
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-400">
            Not just a chat interface. Not just a dashboard. A{" "}
            <span className="font-semibold text-blue-400">
              true Generative UI platform
            </span>{" "}
            where AI dynamically creates the perfect component for your question—whether
            it's debugging production, comparing technologies, or explaining complex code.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/60"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <MessageSquare className="relative h-5 w-5" />
              <span className="relative">Start Conversation</span>
            </Link>

            <Link
              href="/sentinel"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a3e] bg-[#14141f]/80 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-[#3a3a4e] hover:bg-[#1a1a2f]"
            >
              <Shield className="h-5 w-5" />
              <span>View Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div
          className={`mt-24 grid max-w-5xl gap-6 md:grid-cols-3 transition-all duration-1000 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Feature 1 - AI Incident Commander (NEW!) */}
          <div className="group relative rounded-lg border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-purple-500 text-xs font-bold text-white shadow-lg">
              NEW ✨
            </div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              AI Incident Commander
            </h3>
            <p className="text-sm text-gray-400">
              Autonomous incident analysis & resolution. Detects errors, analyzes root cause, generates fixes, and creates PRs—all in one intelligent workflow.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group rounded-lg border border-[#2a2a3e] bg-[#14141f]/50 p-6 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-[#1a1a2f]">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Context-Aware Chat
            </h3>
            <p className="text-sm text-gray-400">
              Natural language understanding. "Fix the TypeError" → AI knows you mean production. "Debug login" → Fetches logs, analyzes code, suggests fix.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-lg border border-[#2a2a3e] bg-[#14141f]/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-[#1a1a2f]">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
              <Zap className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              11 Intelligent Components
            </h3>
            <p className="text-sm text-gray-400">
              From runbooks to code explainers, decision matrices to timelines.
              Every component is specialized, beautifully designed, and generated
              on-demand by AI.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-lg border border-[#2a2a3e] bg-[#14141f]/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-[#1a1a2f]">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Real Integrations
            </h3>
            <p className="text-sm text-gray-400">
              Connected to Sentry, GitHub, and Vercel via MCP. Monitor prod
              errors, analyze commits, and manage deployments—all through natural
              conversation.
            </p>
          </div>
        </div>

        {/* Example Prompts */}
        <div
          className={`mt-16 w-full max-w-3xl transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-gray-500">
            Try asking...
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "🚨 Analyze and fix production error",
              "💡 Explain this TypeScript code",
              "⚖️ Should I use REST or GraphQL?",
              "🔥 Show critical Sentry issues",
              "📊 Compare React vs Vue",
              "🚀 Debug failed deployment",
            ].map((prompt, i) => (
              <Link
                key={i}
                href="/chat"
                className="rounded-full border border-[#2a2a3e] bg-[#14141f]/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:text-white hover:scale-105"
              >
                {prompt}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pb-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by{" "}
            <span className="font-semibold text-blue-400">Tambo SDK</span> •
            Built for The UI Strikes Back
          </p>
        </div>
      </div>
    </div>
  );
}
