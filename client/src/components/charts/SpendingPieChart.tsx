import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface DepartmentSummary {
  department: string;
  spent: number;
}

interface SpendingPieChartProps {
  data: DepartmentSummary[];
}

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#6366F1', // indigo
  '#EC4899', // pink
  '#8B5CF6', // purple
  '#14B8A6', // teal
];

export const SpendingPieChart = ({ data }: SpendingPieChartProps) => {
  // Transform data to ensure numbers are properly formatted
  const totalSpending = data.reduce((sum, item) => sum + Number(item.spent), 0);

  const chartData = data.map((item) => ({
    name: item.department,
    value: Number(item.spent),
    percentage: ((Number(item.spent) / totalSpending) * 100).toFixed(1),
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              percent,
              name,
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="white"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize={12}
                >
                  {`${(percent * 100).toFixed(1)}%`}
                </text>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}; 