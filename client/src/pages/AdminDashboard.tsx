import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import FraudDetectionDashboard from '../components/FraudDetectionDashboard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

// List of government departments
const DEPARTMENTS = [
  'Ministry of Finance',
  'Ministry of Defense',
  'Ministry of Education',
  'Ministry of Health',
  'Ministry of Agriculture',
  'Ministry of Transportation',
  'Ministry of Energy',
  'Ministry of Environment',
  'Ministry of Justice',
  'Ministry of Foreign Affairs',
  'Ministry of Interior',
  'Ministry of Labor',
  'Ministry of Commerce',
  'Ministry of Technology',
  'Ministry of Culture',
  'Ministry of Sports',
  'Ministry of Tourism',
  'Ministry of Housing',
  'Ministry of Water Resources',
  'Ministry of Rural Development'
];

interface Budget {
  _id: string;
  projectName: string;
  department: string;
  allocatedAmount: number;
  spentAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  description: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  fraudAnalysis?: {
    riskScore: number;
    fraudFlags: string[];
    lastAnalysisDate: Date;
    spendingVariance: number;
    transactionFrequency: number;
    allocationDeviation: number;
    historicalComparison: {
      previousYear: number;
      currentYear: number;
      variance: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

const AdminDashboard = () => {
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch budgets
  const { data: budgets = [], isLoading } = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await axios.get('/budgets');
      return response.data.data || [];
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: async (updatedBudget: Partial<Budget>) => {
      const { data } = await axios.put(`/budgets/${updatedBudget._id}`, updatedBudget);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setEditingBudget(null);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update budget');
    }
  });

  // Add budget mutation
  const addBudgetMutation = useMutation({
    mutationFn: async (newBudget: Omit<Budget, '_id' | 'createdBy'>) => {
      const { data } = await axios.post('/budgets', {
        ...newBudget,
        createdBy: {
          _id: user?.id,
          name: user?.name || '',
          email: user?.email || ''
        }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowAddForm(false);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to add budget');
    }
  });

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setError(null);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBudget) return;

    const formData = new FormData(e.currentTarget);
    const updatedBudget = {
      _id: editingBudget._id,
      projectName: formData.get('projectName') as string,
      department: formData.get('department') as string,
      allocatedAmount: Number(formData.get('allocatedAmount')),
      spentAmount: Number(formData.get('spentAmount')),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: formData.get('status') as 'active' | 'completed' | 'pending',
      description: formData.get('description') as string
    };

    try {
      await updateBudgetMutation.mutateAsync(updatedBudget);
    } catch (err) {
      // Error is handled by mutation error callback
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBudget = {
      projectName: formData.get('projectName') as string,
      department: formData.get('department') as string,
      allocatedAmount: Number(formData.get('allocatedAmount')),
      spentAmount: Number(formData.get('spentAmount')),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: formData.get('status') as 'active' | 'completed' | 'pending',
      description: formData.get('description') as string
    };

    try {
      await addBudgetMutation.mutateAsync(newBudget);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      // Error is handled by mutation error callback
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowAddForm(true)}>
            Add New Budget
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Budget Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" name="projectName" required />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  name="department"
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="allocatedAmount">Allocated Amount</Label>
                <Input
                  id="allocatedAmount"
                  name="allocatedAmount"
                  type="number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="spentAmount">Spent Amount</Label>
                <Input
                  id="spentAmount"
                  name="spentAmount"
                  type="number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Budget
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <Card key={budget._id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {budget.projectName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-600 dark:text-gray-400">Department:</Label>
                  <span className="text-gray-900 dark:text-white">{budget.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-gray-600 dark:text-gray-400">Allocated:</Label>
                  <span className="text-gray-900 dark:text-white">
                    Ksh {budget.allocatedAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-gray-600 dark:text-gray-400">Spent:</Label>
                  <span className="text-gray-900 dark:text-white">
                    Ksh {budget.spentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-gray-600 dark:text-gray-400">Status:</Label>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    budget.status === 'active' ? 'bg-green-100 text-green-800' :
                    budget.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-gray-600 dark:text-gray-400">Created By:</Label>
                  <span className="text-gray-900 dark:text-white">
                    {budget.createdBy?.name || 'Unknown'}
                  </span>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(budget)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="w-full max-w-md p-4 my-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Edit Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-projectName">Project Name</Label>
                    <Input
                      id="edit-projectName"
                      name="projectName"
                      defaultValue={editingBudget.projectName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-department">Department</Label>
                    <select
                      id="edit-department"
                      name="department"
                      className="w-full p-2 border rounded"
                      defaultValue={editingBudget.department}
                      required
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-allocatedAmount">Allocated Amount</Label>
                    <Input
                      id="edit-allocatedAmount"
                      name="allocatedAmount"
                      type="number"
                      defaultValue={editingBudget.allocatedAmount}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-spentAmount">Spent Amount</Label>
                    <Input
                      id="edit-spentAmount"
                      name="spentAmount"
                      type="number"
                      defaultValue={editingBudget.spentAmount}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-startDate">Start Date</Label>
                    <Input
                      id="edit-startDate"
                      name="startDate"
                      type="date"
                      defaultValue={editingBudget.startDate}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-endDate">End Date</Label>
                    <Input
                      id="edit-endDate"
                      name="endDate"
                      type="date"
                      defaultValue={editingBudget.endDate}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      name="status"
                      className="w-full p-2 border rounded"
                      defaultValue={editingBudget.status}
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      name="description"
                      defaultValue={editingBudget.description}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingBudget(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Budget
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Fraud Detection Dashboard */}
      <FraudDetectionDashboard />
    </div>
  );
};

export default AdminDashboard; 