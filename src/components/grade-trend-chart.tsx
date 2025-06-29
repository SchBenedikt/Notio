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
  
  // Calculate linear regression for the trend line
  const n = sortedGrades.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  sortedGrades.forEach((g, i) => {
    sumX += i;
    sumY += g.value;
    sumXY += i * g.value;
    sumX2 += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;


  const chartData = sortedGrades.map((g, i) => ({
    name: g.name || g.type,
    date: format(new Date(g.date), 'dd.MM.yy'),
    Note: g.value,
    Trend: parseFloat((slope * i + intercept).toFixed(2)),
  }));

  const chartConfig = {
    Note: {
      label: "Note",
      color: "hsl(var(--primary))",
    },
    Trend: {
      label: "Trend",
      color: "hsl(var(--muted-foreground))",
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
                             if (props.payload && name === 'Note') {
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
                <Line type="monotone" dataKey="Trend" stroke="var(--color-Trend)" strokeWidth={2} strokeDasharray="3 3" dot={false} activeDot={false} />
            </LineChart>
        </ChartContainer>
    </div>
  );
}
