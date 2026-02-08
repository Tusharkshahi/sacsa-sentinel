"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Check, X } from "lucide-react";

export const comparisonMatrixSchema = z.object({
  title: z.string().default("Comparison"),
  items: z.array(
    z.object({
      name: z.string().default("Unknown"),
      features: z.array(
        z.object({
          name: z.string().default("Unknown"),
          value: z.union([z.boolean(), z.string()]).default(false),
        })
      ).default([]),
      highlighted: z.boolean().optional().default(false),
    })
  ).default([]),
  featureLabels: z.array(z.string()).default([]),
});

type ComparisonMatrixProps = z.infer<typeof comparisonMatrixSchema>;

/**
 * ComparisonMatrix Component  
 * Side-by-side feature comparison with elegant design
 * Perfect for comparing products, plans, technologies, or options
 */
export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  title,
  items,
  featureLabels,
}) => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className="w-full rounded-lg border border-[#2a2a3e] bg-[#14141f] p-6">
      <h3 className="mb-6 text-2xl font-bold text-white">{title}</h3>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#2a2a3e]">
              <th className="p-4 text-left text-sm font-semibold text-gray-400">
                Features
              </th>
              {items.map((item, index) => (
                <th
                  key={index}
                  className={`p-4 text-center text-sm font-bold transition-all ${
                    item.highlighted
                      ? "bg-gradient-to-b from-blue-500/20 to-transparent text-blue-400"
                      : "text-white"
                  } ${hoveredItem === index ? "scale-105" : ""}`}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex flex-col items-center gap-2">
                    {item.name}
                    {item.highlighted && (
                      <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                        Recommended
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureLabels.map((feature, featureIndex) => (
              <tr
                key={featureIndex}
                className="border-b border-[#2a2a3e]/50 transition-colors hover:bg-[#2a2a3e]/20"
              >
                <td className="p-4 text-sm text-gray-300">{feature}</td>
                {items.map((item, itemIndex) => {
                  const featureData = item.features.find(f => f.name === feature);
                  const value = featureData?.value;
                  return (
                    <td
                      key={itemIndex}
                      className={`p-4 text-center transition-all ${
                        hoveredItem === itemIndex ? "bg-[#2a2a3e]/30" : ""
                      }`}
                    >
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check className="inline h-5 w-5 text-green-400" />
                        ) : (
                          <X className="inline h-5 w-5 text-red-400/50" />
                        )
                      ) : value ? (
                        <span className="text-sm text-white">{String(value)}</span>
                      ) : (
                        <span className="text-sm text-gray-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
