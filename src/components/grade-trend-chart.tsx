"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { Grade } from "@/lib/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format } from 'date-fns';

type GradeTrendChartProps = {
  grades: Grade[];
};

export function GradeTrendChart({ grades }: GradeTrendChartProps) {
  if (grades.length < 2) {
    return null; // A trend chart needs at least 2 data points
  }

  const sortedGrades = [...grades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = sortedGrades.map(g => ({
    name: g.name || g.type,
    date: format(new Date(g.date), 'dd.MM.yy'),
    Note: g.value,
  }));

  const chartConfig = {
    Note: {
      label: "Note",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="mt-6">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Notenverlauf</h4>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
            <LineChart accessibilityLayer data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[6, 1]} tickCount={6} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        indicator="dot"
                        formatter={(value, name, props) => {
                             if (props.payload) {
                                return (
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-foreground">{`Note: ${value}`}</span>
                                    <span className="text-sm text-muted-foreground">{props.payload.name}</span>
                                    <span className="text-xs text-muted-foreground">{`vom ${props.payload.date}`}</span>
                                </div>
                                )
                            }
                            return null;
                        }}
                    />}
                />
                <Line type="monotone" dataKey="Note" stroke="var(--color-Note)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-Note)" }} />
            </LineChart>
        </ChartContainer>
    </div>
  );
}
