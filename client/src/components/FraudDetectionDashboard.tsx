import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface FraudReport {
  budgetId: string;
  projectName: string;
  department: string;
  allocatedAmount: number;
  spentAmount: number;
  riskScore: number;
  fraudFlags: string[];
  spendingVariance: number;
  transactionFrequency: number;
  allocationDeviation: number;
  historicalComparison: {
    previousYear: number;
    currentYear: number;
    variance: number;
  };
  lastAnalysisDate: string;
  status: string;
}

interface ApiResponse {
  success: boolean;
  data: FraudReport[];
}

const FraudDetectionDashboard: React.FC = () => {
  const { data: response, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['fraudReports'],
    queryFn: async () => {
      const { data } = await axios.get('/fraud/reports');
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load fraud detection reports. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const reports = response?.data || [];
  const highRiskReports = reports.filter(report => report.riskScore >= 70);
  const mediumRiskReports = reports.filter(report => report.riskScore >= 50 && report.riskScore < 70);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Budgets Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Risk Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{highRiskReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medium Risk Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{mediumRiskReports.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">High Risk Budgets</h2>
        {highRiskReports.length > 0 ? (
          highRiskReports.map(report => (
            <Card key={report.budgetId} className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">{report.projectName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className="text-sm font-medium">{report.riskScore}%</span>
                    </div>
                    <Progress value={report.riskScore} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Fraud Flags:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {report.fraudFlags.map((flag, index) => (
                        <li key={index} className="text-sm text-red-600">{flag}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Allocated Amount:</span>
                      <p className="text-lg">Ksh {report.allocatedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Spent Amount:</span>
                      <p className="text-lg">Ksh {report.spentAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>No High Risk Budgets</AlertTitle>
            <AlertDescription>
              All budgets are currently within acceptable risk levels.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Medium Risk Budgets</h2>
        {mediumRiskReports.length > 0 ? (
          mediumRiskReports.map(report => (
            <Card key={report.budgetId} className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-600">{report.projectName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className="text-sm font-medium">{report.riskScore}%</span>
                    </div>
                    <Progress value={report.riskScore} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Fraud Flags:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {report.fraudFlags.map((flag, index) => (
                        <li key={index} className="text-sm text-yellow-600">{flag}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Allocated Amount:</span>
                      <p className="text-lg">Ksh {report.allocatedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Spent Amount:</span>
                      <p className="text-lg">Ksh {report.spentAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Medium Risk Budgets</AlertTitle>
            <AlertDescription>
              All budgets are either high risk or low risk.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default FraudDetectionDashboard; 