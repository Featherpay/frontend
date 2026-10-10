"use client";

// Simple earnings chart using SVG - no heavy dependencies.
import { tokens } from "@/styles/tokens";

interface EarningsChartProps {
  history: Array<{
    amount_cents: number;
    created_at: string;
    status: string;
  }>;
}

export function EarningsChart({ history }: EarningsChartProps) {
  // Filter to settled tips only, group by day for last 30 days
  const settledTips = history.filter((tip) => tip.status === "settled");
  const dailyEarnings = new Map<string, number>();

  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    dailyEarnings.set(key, 0);
  }

  settledTips.forEach((tip) => {
    const date = new Date(tip.created_at).toISOString().split("T")[0];
    if (dailyEarnings.has(date)) {
      dailyEarnings.set(date, (dailyEarnings.get(date) || 0) + tip.amount_cents / 100);
    }
  });

  const dataPoints = Array.from(dailyEarnings.entries()).map(([date, amount]) => ({ date, amount }));
  const maxAmount = Math.max(...dataPoints.map((d) => d.amount), 1);
  const width = 700;
  const height = 200;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xScale = (i: number) => padding.left + (i / (dataPoints.length - 1)) * chartWidth;
  const yScale = (amount: number) => padding.top + chartHeight - (amount / maxAmount) * chartHeight;

  // Generate path for line
  const pathData = dataPoints
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.amount)}`)
    .join(" ");

  // Generate area path
  const areaPathData =
    dataPoints
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.amount)}`)
      .join(" ") +
    ` L${xScale(dataPoints.length - 1)} ${padding.top + chartHeight} L${padding.left} ${padding.top + chartHeight} Z`;

  return (
    <div style={{ width: "100%", maxWidth: width, margin: "0 auto" }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Earnings over the last 30 days"
      >
        <title>Earnings Chart - Last 30 Days</title>
        <desc>
          Line chart showing daily earnings over the last 30 days. X-axis: days. Y-axis: earnings in dollars.
        </desc>

        {/* Grid lines */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tokens.color.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={tokens.color.accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines and labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padding.top + chartHeight * frac;
          const label = (maxAmount * (1 - frac)).toFixed(0);
          return (
            <g key={frac}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={tokens.color.border}
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill={tokens.color.textMuted}
                fontFamily={tokens.typography.fontFamily.sans}
              >
                ${label}
              </text>
            </g>
          );
        })}

        {/* X-axis labels (every 5 days) */}
        {dataPoints.map((d, i) => {
          if (i % 5 !== 0 && i !== dataPoints.length - 1) return null;
          const x = xScale(i);
          const date = new Date(d.date);
          return (
            <text
              key={i}
              x={x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize={11}
              fill={tokens.color.textMuted}
              fontFamily={tokens.typography.fontFamily.sans}
            >
              {date.getMonth() + 1}/{date.getDate()}
            </text>
          );
        })}

        {/* Area under line */}
        <path d={areaPathData} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={pathData} stroke={tokens.color.accent} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {dataPoints.map((d, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(d.amount)}
            r={4}
            fill={tokens.color.accent}
            stroke={tokens.color.background}
            strokeWidth={2}
          />
        ))}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight}
          stroke={tokens.color.border}
          strokeWidth={1}
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke={tokens.color.border}
          strokeWidth={1}
        />
      </svg>

      {/* Empty state */}
      {dataPoints.every((d) => d.amount === 0) && (
        <div style={{ textAlign: "center", padding: tokens.spacing["2xl"], color: tokens.color.textMuted }}>
          No earnings yet. Your chart will populate as you receive tips.
        </div>
      )}
    </div>
  );
}