import  { useState } from 'react';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Mock data for demonstration
const mockReportData = {
  summary: {
    totalTransactions: 847,
    matchedTransactions: 723,
    unmatchedTransactions: 124,
    matchingAccuracy: 85.4,
    totalAmount: 45672.89,
    matchedAmount: 41234.56,
    unmatchedAmount: 4438.33
  },
  monthlyData: [
    { month: 'Jan 2025', matched: 156, unmatched: 23, accuracy: 87.2 },
    { month: 'Dec 2024', matched: 142, unmatched: 18, accuracy: 88.8 },
    { month: 'Nov 2024', matched: 134, unmatched: 21, accuracy: 86.5 },
    { month: 'Oct 2024', matched: 151, unmatched: 19, accuracy: 88.8 },
    { month: 'Sep 2024', matched: 140, unmatched: 24, accuracy: 85.4 }
  ],
  unmatchedReasons: [
    { reason: 'No close match found', count: 67, percentage: 54.0 },
    { reason: 'Amount mismatch', count: 28, percentage: 22.6 },
    { reason: 'Date variance > 3 days', count: 19, percentage: 15.3 },
    { reason: 'Duplicate in ledger', count: 10, percentage: 8.1 }
  ],
  confidenceDistribution: [
    { range: '90-100%', count: 425, color: 'bg-green-500' },
    { range: '80-89%', count: 185, color: 'bg-blue-500' },
    { range: '70-79%', count: 113, color: 'bg-yellow-500' },
    { range: '60-69%', count: 78, color: 'bg-orange-500' },
    { range: '<60%', count: 46, color: 'bg-red-500' }
  ]
};

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last-6-months');
  const [selectedReport, setSelectedReport] = useState('summary');
  const [searchTerm, setSearchTerm] = useState('');

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'text-gray-900' }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  const UnmatchedReasonsChart = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Unmatched Transaction Reasons</h3>
      <div className="space-y-4">
        {mockReportData.unmatchedReasons.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ConfidenceDistribution = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Score Distribution</h3>
      <div className="space-y-3">
        {mockReportData.confidenceDistribution.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm font-medium text-gray-700">{item.range}</div>
            <div className="flex-1 mx-3">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4 mr-3">
                  <div 
                    className={`${item.color} h-4 rounded-full transition-all duration-300`}
                    style={{ width: `${(item.count / mockReportData.summary.totalTransactions) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 min-w-[40px]">{item.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MonthlyTrends = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Matching Trends</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-600">Month</th>
              <th className="text-right py-2 font-medium text-gray-600">Matched</th>
              <th className="text-right py-2 font-medium text-gray-600">Unmatched</th>
              <th className="text-right py-2 font-medium text-gray-600">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {mockReportData.monthlyData.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-900">{item.month}</td>
                <td className="py-3 text-right text-green-600 font-medium">{item.matched}</td>
                <td className="py-3 text-right text-red-600 font-medium">{item.unmatched}</td>
                <td className="py-3 text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.accuracy >= 88 ? 'bg-green-100 text-green-800' :
                    item.accuracy >= 85 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.accuracy}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reconciliation Reports</h1>
                <p className="text-sm text-gray-600 mt-1">Bank transaction matching analysis and insights</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'summary', label: 'Summary', icon: Activity },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'unmatched', label: 'Unmatched Analysis', icon: AlertTriangle },
            { id: 'confidence', label: 'Confidence Scores', icon: PieChart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                selectedReport === tab.id
                  ? 'text-blue-600 border-blue-600 bg-blue-50'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Summary Dashboard */}
        {selectedReport === 'summary' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Transactions"
                value={mockReportData.summary.totalTransactions.toLocaleString()}
                icon={FileText}
                trend="+12% from last month"
              />
              <StatCard
                title="Matching Accuracy"
                value={`${mockReportData.summary.matchingAccuracy}%`}
                subtitle={`${mockReportData.summary.matchedTransactions} matched`}
                icon={CheckCircle}
                color="text-green-600"
                trend="+2.1% improvement"
              />
              <StatCard
                title="Total Amount"
                value={`$${mockReportData.summary.totalAmount.toLocaleString()}`}
                subtitle={`$${mockReportData.summary.matchedAmount.toLocaleString()} matched`}
                icon={TrendingUp}
              />
              <StatCard
                title="Unmatched Items"
                value={mockReportData.summary.unmatchedTransactions}
                subtitle={`$${mockReportData.summary.unmatchedAmount.toLocaleString()} unmatched`}
                icon={AlertTriangle}
                color="text-red-600"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UnmatchedReasonsChart />
              <ConfidenceDistribution />
            </div>

            <MonthlyTrends />
          </div>
        )}

        {/* Trends View */}
        {selectedReport === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Historical Matching Performance</h2>
              <MonthlyTrends />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy Trend</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive chart would go here</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Trends</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2" />
                    <p>Line chart would go here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unmatched Analysis */}
        {selectedReport === 'unmatched' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Unmatched Transaction Analysis</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            <UnmatchedReasonsChart />

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Unmatched Transactions Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Description</th>
                      <th className="text-right py-3 px-6 font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Reason</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { date: '2025-01-15', description: 'Amazon Prime Subscription', amount: -12.99, reason: 'No close match found' },
                      { date: '2025-01-14', description: 'Starbucks Coffee', amount: -4.85, reason: 'Amount mismatch' },
                      { date: '2025-01-13', description: 'Salary Deposit', amount: 3500.00, reason: 'Date variance > 3 days' },
                      { date: '2025-01-12', description: 'Gas Station', amount: -45.20, reason: 'Duplicate in ledger' },
                    ].map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-gray-900">{transaction.date}</td>
                        <td className="py-4 px-6 text-gray-900">{transaction.description}</td>
                        <td className={`py-4 px-6 text-right font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {transaction.reason}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Scores */}
        {selectedReport === 'confidence' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Confidence Score Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConfidenceDistribution />
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">High Confidence Matches</p>
                      <p className="text-xs text-green-600">610 transactions (72%) with >80% confidence</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Medium Confidence</p>
                      <p className="text-xs text-yellow-600">191 transactions need review (60-80% confidence)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Low Confidence</p>
                      <p className="text-xs text-red-600">46 transactions require manual matching</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Low Confidence Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Bank Transaction</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Suggested Match</th>
                      <th className="text-center py-3 px-6 font-medium text-gray-600">Confidence</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { 
                        bank: 'APPLE.COM/BILL - $9.99 - 2025-01-15',
                        suggested: 'Apple Music Subscription - $9.99 - 2025-01-14',
                        confidence: 55
                      },
                      { 
                        bank: 'PAYPAL TRANSFER - $150.00 - 2025-01-13',
                        suggested: 'PayPal Payment - $148.50 - 2025-01-13',
                        confidence: 48
                      },
                      { 
                        bank: 'ATM WITHDRAWAL - $40.00 - 2025-01-12',
                        suggested: 'Cash Withdrawal - $40.00 - 2025-01-11',
                        confidence: 42
                      }
                    ].map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-gray-900 text-xs">{item.bank}</td>
                        <td className="py-4 px-6 text-gray-700 text-xs">{item.suggested}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.confidence >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.confidence}%
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-800 text-xs font-medium">Accept</button>
                            <button className="text-red-600 hover:text-red-800 text-xs font-medium">Reject</button>
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;