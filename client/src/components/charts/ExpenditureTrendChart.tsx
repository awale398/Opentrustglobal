import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MonthlyExpenditure {
  month: string;
  amount: number;
  cumulativeAmount: number;
}

interface ExpenditureTrendChartProps {
  data: MonthlyExpenditure[];
}

export const ExpenditureTrendChart = ({ data }: ExpenditureTrendChartProps) => {
  // Add console logging for debugging
  React.useEffect(() => {
    console.log('Chart Data:', data);
  }, [data]);

  // Ensure data is an array and has the correct structure
  const chartData = React.useMemo(() => {
    if (!Array.isArray(data)) {
      console.error('Invalid data format:', data);
      return [];
    }
    return data.map(item => ({
      ...item,
      amount: Number(item.amount),
      cumulativeAmount: Number(item.cumulativeAmount)
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            dataKey="month"
            tick={{ fontSize: 12 }}
            interval={0}
            padding={{ left: 30, right: 30 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            labelStyle={{ color: '#111827' }}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            name="Monthly Spending"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="cumulativeAmount"
            name="Cumulative Spending"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 