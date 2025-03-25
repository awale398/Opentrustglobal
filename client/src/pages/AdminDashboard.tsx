import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../utils/axios';
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
}

const AdminDashboard = () => {
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch budgets
  const { data: budgets = [], isLoading } = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await axios.get('/api/budgets');
      return data.data;
    }
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: async (updatedBudget: Partial<Budget>) => {
      const { data } = await axios.put(`/api/budgets/${updatedBudget._id}`, updatedBudget);
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
    mutationFn: async (newBudget: Omit<Budget, '_id'>) => {
      const { data } = await axios.post('/api/budgets', newBudget);
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Budget'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Budget Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  required
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  name="department"
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
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
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={addBudgetMutation.isPending}>
                  {addBudgetMutation.isPending ? 'Adding...' : 'Add Budget'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Budget Form */}
      {editingBudget && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="hidden" name="_id" value={editingBudget._id} />
              
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  defaultValue={editingBudget.projectName}
                  required
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  name="department"
                  className="w-full p-2 border rounded"
                  defaultValue={editingBudget.department}
                  required
                >
                  <option value="">Select a department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="allocatedAmount">Allocated Amount</Label>
                <Input
                  id="allocatedAmount"
                  name="allocatedAmount"
                  type="number"
                  defaultValue={editingBudget.allocatedAmount}
                  required
                />
              </div>

              <div>
                <Label htmlFor="spentAmount">Spent Amount</Label>
                <Input
                  id="spentAmount"
                  name="spentAmount"
                  type="number"
                  defaultValue={editingBudget.spentAmount}
                  required
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={editingBudget.startDate.split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={editingBudget.endDate.split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="w-full p-2 border rounded"
                  defaultValue={editingBudget.status}
                  required
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full p-2 border rounded"
                  defaultValue={editingBudget.description}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={updateBudgetMutation.isPending}>
                  {updateBudgetMutation.isPending ? 'Updating...' : 'Update Budget'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingBudget(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budget List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <Card key={budget._id}>
            <CardHeader>
              <CardTitle>{budget.projectName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Department:</strong> {budget.department}</p>
                <p><strong>Allocated:</strong> ${budget.allocatedAmount.toLocaleString()}</p>
                <p><strong>Spent:</strong> ${budget.spentAmount.toLocaleString()}</p>
                <p><strong>Status:</strong> {budget.status}</p>
                <p><strong>Start Date:</strong> {new Date(budget.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(budget.endDate).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {budget.description}</p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleEdit(budget)}
              >
                Edit Budget
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fraud Detection Dashboard */}
      <FraudDetectionDashboard />
    </div>
  );
};

export default AdminDashboard; 