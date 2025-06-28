"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Grade } from "@/lib/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type GradeDistributionChartProps = {
  grades: Grade[];
};

export function GradeDistributionChart({ grades }: GradeDistributionChartProps) {
  const gradeCounts = [
    { name: "Note 1", grade: "1", count: 0 },
    { name: "Note 2", grade: "2", count: 0 },
    { name: "Note 3", grade: "3", count: 0 },
    { name: "Note 4", grade: "4", count: 0 },
    { name: "Note 5", grade: "5", count: 0 },
    { name: "Note 6", grade: "6", count: 0 },
  ];

  grades.forEach(g => {
    const gradeIndex = Math.round(g.value) - 1;
    if (gradeIndex >= 0 && gradeIndex < 6) {
      gradeCounts[gradeIndex].count++;
    }
  });

  const chartConfig = {
    count: {
      label: "Anzahl",
      color: "hsl(var(--primary))",
    },
  };

  if (grades.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Notenverteilung</h4>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
            <BarChart accessibilityLayer data={gradeCounts} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="grade" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 'dataMax + 1']} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        indicator="dot" 
                        formatter={(value, name, props) => {
                            if (props.payload.count > 0) {
                                return (
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{`${props.payload.count} mal`}</span>
                                    <span className="text-sm text-muted-foreground">{props.payload.name}</span>
                                </div>
                                )
                            }
                            return null;
                        }}
                    />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
        </ChartContainer>
    </div>
  );
}
