import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface Transaction {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  receiptUrl?: string;
}

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 1000,
      features: [
        'View basic budget information',
        'Access to public reports',
        'Email notifications'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 2500,
      features: [
        'All Basic features',
        'Detailed budget analytics',
        'Priority support',
        'Custom reports'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 5000,
      features: [
        'All Premium features',
        'Advanced data analytics',
        'Dedicated support team',
        'Custom integrations',
        'API access',
        'Team management',
        'Advanced reporting tools'
      ]
    }
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/payments/transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handlePhoneNumberChange = (planId: string, value: string) => {
    setPhoneNumbers(prev => ({
      ...prev,
      [planId]: value
    }));
  };

  const handlePayment = async (planId: string, amount: number) => {
    const phoneNumber = phoneNumbers[planId];
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format phone number (remove leading 0 if present)
      const formattedPhone = phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber;
      const fullPhoneNumber = `254${formattedPhone}`;

      const response = await axios.post('/api/payments/mpesa', {
        amount,
        phoneNumber: fullPhoneNumber
      });

      // Start polling for transaction status
      const transactionId = response.data.transactionId;
      pollTransactionStatus(transactionId);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const pollTransactionStatus = async (transactionId: string) => {
    const maxAttempts = 10;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await axios.get(`/api/payments/status/${transactionId}`);
        const { status, receiptUrl } = response.data;

        if (status === 'completed') {
          setLoading(false);
          fetchTransactions(); // Refresh transactions list
          alert('Payment successful!');
        } else if (status === 'failed') {
          setLoading(false);
          setError('Payment failed. Please try again.');
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setLoading(false);
          setError('Payment status check timed out. Please contact support.');
        }
      } catch (error) {
        console.error('Error polling transaction status:', error);
        setLoading(false);
        setError('Failed to check payment status');
      }
    };

    poll();
  };

  const downloadReceipt = async (receiptUrl: string) => {
    try {
      window.open(receiptUrl, '_blank');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setError('Failed to download receipt');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Select the plan that best suits your needs
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg shadow-lg overflow-hidden ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
              } ${
                plan.id === 'enterprise' 
                  ? 'transform scale-105 border-2 border-blue-500 shadow-xl' 
                  : ''
              }`}
            >
              <div className={`px-6 py-8 ${
                plan.id === 'enterprise' 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : 'bg-white dark:bg-gray-800'
              }`}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
                  KES {plan.price}
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className={`flex-shrink-0 h-6 w-6 ${
                          plan.id === 'enterprise' 
                            ? 'text-blue-500 dark:text-blue-400' 
                            : 'text-green-500 dark:text-green-400'
                        }`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-base text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`px-6 py-8 ${
                plan.id === 'enterprise' 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-gray-50 dark:bg-gray-800/50'
              }`}>
                <div className="space-y-4">
                  <input
                    type="tel"
                    placeholder="Enter phone number (e.g., 0712345678)"
                    value={phoneNumbers[plan.id] || ''}
                    onChange={(e) => handlePhoneNumberChange(plan.id, e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    onClick={() => handlePayment(plan.id, plan.price)}
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      plan.id === 'enterprise'
                        ? 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Processing...' : 'Pay with M-Pesa'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Transaction History</h3>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <li key={transaction._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                          KES {transaction.amount}
                        </p>
                        <span
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : transaction.status === 'failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                        {transaction.receiptUrl && (
                          <button
                            onClick={() => downloadReceipt(transaction.receiptUrl!)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Download Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 