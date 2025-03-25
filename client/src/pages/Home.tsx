import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BudgetComparisonChart } from '../components/charts/BudgetComparisonChart';
import { SpendingPieChart } from '../components/charts/SpendingPieChart';
import { ExpenditureTrendChart } from '../components/charts/ExpenditureTrendChart';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Mock data for testing
const mockDepartmentData = [
  {
    department: 'Education',
    allocated: 5000000,
    spent: 3500000,
    budgetCount: 5,
    utilizationRate: 70
  },
  {
    department: 'Healthcare',
    allocated: 8000000,
    spent: 6000000,
    budgetCount: 8,
    utilizationRate: 75
  },
  {
    department: 'Infrastructure',
    allocated: 12000000,
    spent: 9000000,
    budgetCount: 12,
    utilizationRate: 75
  },
  {
    department: 'Defense',
    allocated: 15000000,
    spent: 12000000,
    budgetCount: 15,
    utilizationRate: 80
  },
  {
    department: 'Agriculture',
    allocated: 3000000,
    spent: 2000000,
    budgetCount: 3,
    utilizationRate: 67
  }
];

const mockMonthlyData = [
  {
    month: '2024-01',
    amount: 2500000,
    cumulativeAmount: 2500000
  },
  {
    month: '2024-02',
    amount: 3000000,
    cumulativeAmount: 5500000
  },
  {
    month: '2024-03',
    amount: 2800000,
    cumulativeAmount: 8300000
  },
  {
    month: '2024-04',
    amount: 3200000,
    cumulativeAmount: 11500000
  },
  {
    month: '2024-05',
    amount: 3500000,
    cumulativeAmount: 15000000
  }
];

const mockSpendingData = mockDepartmentData.map(item => ({
  department: item.department,
  spent: item.spent
}));

const Home = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Use mock data instead of API calls for testing
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      try {
        const response = await axios.get('/reports');
        return response.data;
      } catch (error) {
        console.error('Error fetching reports:', error);
        return { departmentSummary: mockDepartmentData };
      }
    }
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly'],
    queryFn: async () => {
      try {
        const response = await axios.get('/reports/monthly');
        console.log('Monthly API Response:', response.data);
        return response.data.data || mockMonthlyData;
      } catch (error) {
        console.error('Error fetching monthly data:', error);
        console.log('Using mock data:', mockMonthlyData);
        return mockMonthlyData;
      }
    }
  });

  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>(['budgets'], async () => {
    try {
      const response = await axios.get<ApiResponse>('/budgets');
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  });

  // Add console logging for debugging
  React.useEffect(() => {
    console.log('Monthly Data:', monthlyData);
  }, [monthlyData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center p-4 flex-1">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to Government Expenditure Tracker
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Track and analyze government spending in real-time
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reportsLoading || monthlyLoading || budgetsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Here's an overview of government spending
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Budget Overview
              </h2>
              <BudgetComparisonChart
                data={reportsData?.departmentSummary || mockDepartmentData}
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Spending Distribution
              </h2>
              <SpendingPieChart
                data={mockSpendingData}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Expenditure Trend
            </h2>
            <ExpenditureTrendChart
              data={mockMonthlyData}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Budgets</h2>
            <div className="space-y-4">
              {(budgets || []).map((budget: any) => (
                <div
                  key={budget._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{budget.projectName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{budget.governmentDepartment}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        budget.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : budget.status === 'active'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Allocated</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">${budget.allocatedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">${budget.spentAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(budget.spentAmount / budget.allocatedAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 