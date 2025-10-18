import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, X, TrendingUp, TrendingDown } from 'lucide-react';
import { transactionAPI, categoryAPI } from '../services/api';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    categoryName: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  // Totals from backend
  const [totals, setTotals] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    transactionCount: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [categoriesRes] = await Promise.all([
        categoryAPI.getAll()
      ]);
      setCategories(categoriesRes.data);
      await applyFilters(); // Load initial transactions
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);

      // Remove empty filters for API call
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      // Always use the filter endpoint which now returns transactions + totals
      const response = await transactionAPI.getWithFilters(activeFilters);
      const responseData = response.data;

      setTransactions(responseData.transactions || []);
      setTotals({
        totalIncome: responseData.totalIncome || 0,
        totalExpenses: responseData.totalExpenses || 0,
        netAmount: responseData.netAmount || 0,
        transactionCount: responseData.transactionCount || 0
      });

    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      categoryName: '',
      type: '',
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-gray-900 text-sm sm:text-base"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">All Transactions</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                {totals.transactionCount} transactions
              </span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors text-xs sm:text-sm"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filters</span>
                {showFilters ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
        {/* Summary Cards - Using backend calculated totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  ₹{totals.totalIncome.toLocaleString()}
                </p>
                {hasActiveFilters && (
                  <p className="text-xs text-green-600 mt-1">Filtered Result</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6 border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 sm:p-3 rounded-full">
                <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  ₹{totals.totalExpenses.toLocaleString()}
                </p>
                {hasActiveFilters && (
                  <p className="text-xs text-blue-600 mt-1">Filtered Calculation</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
            <div className="flex items-center">
              <div className={`p-2 sm:p-3 rounded-full ${totals.netAmount >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                {totals.netAmount >= 0 ? (
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                )}
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-lg sm:text-2xl font-bold ${totals.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ₹{totals.netAmount.toLocaleString()}
                </p>
                {hasActiveFilters && (
                  <p className="text-xs text-gray-600 mt-1">After filters</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Category
                </label>
                <select
                  value={filters.categoryName}
                  onChange={(e) => setFilters({...filters, categoryName: e.target.value})}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                >
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Active Filters & Clear Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-3 sm:mt-4">
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                {hasActiveFilters && (
                  <span className="text-xs text-gray-600">Active filters:</span>
                )}
                {filters.categoryName && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    Category: {filters.categoryName}
                  </span>
                )}
                {filters.type && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Type: {filters.type}
                  </span>
                )}
                {(filters.startDate || filters.endDate) && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    Date: {filters.startDate || '...'} to {filters.endDate || '...'}
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium flex items-center gap-1 self-start sm:self-auto"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white shadow-soft rounded-xl sm:rounded-2xl">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                Transactions ({totals.transactionCount})
                {hasActiveFilters && ' - Filtered Results'}
              </h3>
              <div className="text-xs sm:text-sm text-gray-600">
                Totals update automatically with filters
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm sm:text-base">
                {hasActiveFilters
                  ? 'No transactions match your filters.'
                  : 'No transactions yet.'
                }
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`p-1 sm:p-2 rounded-full flex-shrink-0 ${
                      transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'INCOME' ? (
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                      )}
                    </div>
                    <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {typeof transaction.category === 'object'
                          ? transaction.category?.name
                          : transaction.category}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {transaction.note || 'No description'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm sm:text-lg font-semibold flex-shrink-0 ml-2 sm:ml-4 ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;