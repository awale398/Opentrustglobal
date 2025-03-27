import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface Expense {
  _id: string;
  amount: number;
  description: string;
  date: string;
  createdBy: {
    name: string;
    email: string;
  };
}

interface Budget {
  _id: string;
  projectName: string;
  allocatedAmount: number;
  spentAmount: number;
  governmentDepartment: string;
  status: string;
}

export const BudgetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: budget } = useQuery<Budget>(['budget', id], async () => {
    const response = await axios.get(`/budgets/${id}`);
    return response.data.data;
  });

  const { data: expenses } = useQuery<Expense[]>(['expenses', id], async () => {
    const response = await axios.get(`/expenses/budget/${id}`);
    return response.data.data;
  });

  const addExpenseMutation = useMutation(
    async (expenseData: { amount: number; description: string }) => {
      return axios.post('/expenses', {
        ...expenseData,
        budgetId: id,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expenses', id]);
        queryClient.invalidateQueries(['budget', id]);
      },
    }
  );

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const amount = parseFloat(form.amount.value);
    const description = form.description.value;

    try {
      await addExpenseMutation.mutateAsync({ amount, description });
      form.reset();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  if (!budget) {
    return <div>Loading...</div>;
  }

  const remainingBudget = budget.allocatedAmount - budget.spentAmount;
  const utilizationRate = (budget.spentAmount / budget.allocatedAmount) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {budget.projectName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {budget.governmentDepartment}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Allocated Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Ksh {budget.allocatedAmount.toLocaleString()}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Spent Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Ksh {budget.spentAmount.toLocaleString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Remaining Budget</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Ksh {remainingBudget.toLocaleString()}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Utilization Rate</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {utilizationRate.toFixed(2)}%
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      budget.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : budget.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : budget.status === 'on-hold'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {budget.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Expense</h3>
              <form onSubmit={handleAddExpense} className="mt-5 sm:flex sm:items-center">
                <div className="w-full sm:max-w-xs">
                  <label htmlFor="amount" className="sr-only">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Amount"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="w-full sm:max-w-xs mt-3 sm:mt-0 sm:ml-3">
                  <label htmlFor="description" className="sr-only">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    id="description"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Description"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Expense
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Expenses</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {expenses?.map((expense) => (
              <li key={expense._id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      Added by {expense.createdBy.name} on{' '}
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Ksh {expense.amount.toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}; 