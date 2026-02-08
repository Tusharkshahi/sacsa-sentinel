"use client";

import React from "react";
import { z } from "zod";
import { CheckCircle, Clock, AlertCircle, Circle } from "lucide-react";

export const timelineSchema = z.object({
  title: z.string().default("Timeline"),
  events: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      timestamp: z.string(),
      status: z.enum(["completed", "in-progress", "pending", "failed"]),
      meta: z.string().optional(),
    })
  ).default([]),
});

type TimelineProps = z.infer<typeof timelineSchema>;

/**

 * Timeline Component
 * Displays chronological events with status indicators
 * Perfect for deployment history, project milestones, or process tracking
 */
export const Timeline: React.FC<TimelineProps> = ({ title, events }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bg: "bg-green-500/20",
          border: "border-green-500/50",
          line: "bg-green-500/30",
        };
      case "in-progress":
        return {
          icon: Clock,
          color: "text-blue-400",
          bg: "bg-blue-500/20",
          border: "border-blue-500/50",
          line: "bg-blue-500/30",
        };
      case "failed":
        return {
          icon: AlertCircle,
          color: "text-red-400",
          bg: "bg-red-500/20",
          border: "border-red-500/50",
          line: "bg-red-500/30",
        };
      default:
        return {
          icon: Circle,
          color: "text-gray-400",
          bg: "bg-gray-500/20",
          border: "border-gray-500/50",
          line: "bg-gray-500/30",
        };
    }
  };

  return (
    <div className="w-full rounded-lg border border-[#2a2a3e] bg-[#14141f] p-6">
      <h3 className="mb-6 text-2xl font-bold text-white">{title}</h3>

      <div className="relative space-y-6">
        {events.map((event, index) => {
          const config = getStatusConfig(event.status);
          const Icon = config.icon;
          const isLast = index === events.length - 1;

          return (
            <div key={index} className="relative flex gap-4">
              {/* Timeline line */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-12 h-full w-0.5 ${config.line}`}
                />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${config.border} ${config.bg} backdrop-blur-sm`}
              >
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="rounded-lg border border-[#2a2a3e]/50 bg-[#0a0a0f]/50 p-4 backdrop-blur-sm transition-all hover:border-[#2a2a3e] hover:bg-[#0a0a0f]/80">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-white">{event.title}</h4>
                    <span className="shrink-0 text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-gray-300">
                    {event.description}
                  </p>
                  {event.meta && (
                    <p className="text-xs text-gray-500">{event.meta}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
