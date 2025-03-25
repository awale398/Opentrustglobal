import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DepartmentData {
  department: string;
  allocated: number;
  spent: number;
  budgetCount?: number;
  utilizationRate?: number;
}

interface BudgetComparisonChartProps {
  data: DepartmentData[];
}

export const BudgetComparisonChart = ({ data }: BudgetComparisonChartProps) => {
  // Transform data to ensure numbers are properly formatted
  const chartData = data.map(item => ({
    ...item,
    allocated: Number(item.allocated),
    spent: Number(item.spent)
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="department"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            labelStyle={{ color: '#111827' }}
          />
          <Legend />
          <Bar
            dataKey="allocated"
            name="Allocated Budget"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="spent"
            name="Spent Amount"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 