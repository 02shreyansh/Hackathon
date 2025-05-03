import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  UploadCloud, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  BarChart3, 
  Search, 
  Download
} from 'lucide-react';

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  source: 'bank' | 'ledger';
};

export type Match = {
  bankTransaction: Transaction;
  ledgerTransaction: Transaction;
  confidenceScore: number;
  status: 'pending' | 'confirmed' | 'rejected';
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('upload');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reconciliationCompleted, setReconciliationCompleted] = useState(false);
  
  // Mock statistics for the dashboard
  const stats = {
    totalTransactions: 78,
    matchedCount: 62,
    unmatchedCount: 16,
    matchPercentage: 79,
    confidenceThreshold: 70
  };
  
  const startProcessing = () => {
    setIsProcessing(true);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 5;
      setProcessingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        setReconciliationCompleted(true);
      }
    }, 100);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
            <p className="text-gray-600 mt-1">Match and reconcile your bank and ledger transactions</p>
          </div>
          
          {reconciliationCompleted && (
            <div className="mt-4 md:mt-0 flex items-center space-x-1">
              <span className="text-green-600 font-medium">Last run:</span>
              <span className="text-gray-600">Today, 2:45 PM</span>
            </div>
          )}
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-700">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold">{stats.totalTransactions}</span>
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-700">Match Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold">{stats.matchPercentage}%</span>
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
              <div className="mt-3">
                <Progress value={stats.matchPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-700">Needs Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold">{stats.unmatchedCount}</span>
                <Search className="h-6 w-6 text-amber-500" />
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {stats.unmatchedCount} transactions need manual review
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs 
          defaultValue="upload" 
          className="space-y-4"
          value={activeSection}
          onValueChange={setActiveSection}
        >
          <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="matching">Matching</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="unmatched" className="hidden lg:block">Unmatched</TabsTrigger>
            <TabsTrigger value="reports" className="hidden lg:block">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Statement</CardTitle>
                  <CardDescription>Upload your bank statement CSV file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm font-medium">
                        Drop CSV file here or click to browse
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        CSV must include date, description, and amount columns
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ledger Data</CardTitle>
                  <CardDescription>Upload your ledger CSV file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                      <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                      <span className="text-sm font-medium">
                        42 transactions loaded
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Start Reconciliation</CardTitle>
                <CardDescription>
                  Begin the reconciliation process once both files are uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Processing transactions...</span>
                        <span>{processingProgress}%</span>
                      </div>
                      <Progress value={processingProgress} />
                    </div>
                  )}
                  <Button
                    onClick={startProcessing}
                    disabled={isProcessing}
                    className="w-full md:w-auto"
                  >
                    {isProcessing ? 'Processing...' : 'Start Reconciliation'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="matching">
            <Card>
              <CardHeader>
                <CardTitle>Matching Configuration</CardTitle>
                <CardDescription>
                  Configure how transactions are matched between bank and ledger data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Confidence Threshold</label>
                    <div className="flex items-center mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={stats.confidenceThreshold}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-2 text-sm font-medium">{stats.confidenceThreshold}%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Matches below this threshold require manual review
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Matching</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                        <option value="exact">Exact match</option>
                        <option value="fuzzy" selected>Within ±1 day</option>
                        <option value="month">Same month</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description Matching</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                        <option value="exact">Exact match</option>
                        <option value="contains" selected>Contains substring</option>
                        <option value="fuzzy">Fuzzy match</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Matching Rules</CardTitle>
                <CardDescription>
                  Custom rules to help match transactions more accurately
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 px-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div>
                      <p className="font-medium text-sm">Amazon orders</p>
                      <p className="text-xs text-gray-600">
                        Bank: Contains "AMZN" → Ledger: Contains "Amazon"
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div>
                      <p className="font-medium text-sm">Payroll deposits</p>
                      <p className="text-xs text-gray-600">
                        Bank: Contains "PAYROLL" → Ledger: Contains "Salary"
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <span className="mr-1">+</span> Add New Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="review">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Review Matches</CardTitle>
                  <CardDescription>
                    Review and confirm suggested transaction matches
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" /> Accept All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Bank Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Ledger Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">04/12/2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$1,250.00</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">PAYROLL DIRECT DEP</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">Salary Payment</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            95%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center text-xs font-medium text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmed
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <XCircle className="h-4 w-4 text-gray-400" />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">04/15/2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$42.99</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">AMZN MKTP US*2H82D</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">Amazon - Office Supplies</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            72%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center text-xs font-medium text-gray-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <CheckCircle className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <XCircle className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">04/17/2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$83.75</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">POS PURCHASE WHOLEFDS</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">Whole Foods - Groceries</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            88%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center text-xs font-medium text-gray-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <CheckCircle className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <XCircle className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing 3 of 62 matches
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="unmatched">
            <Card>
              <CardHeader>
                <CardTitle>Unmatched Transactions</CardTitle>
                <CardDescription>
                  Transactions that couldn't be automatically matched
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Button variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Bank Transactions (10)
                    </Button>
                    <Button variant="outline">
                      Ledger Transactions (6)
                    </Button>
                  </div>
                  
                  <div className="rounded-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">04/19/2025</td>
                          <td className="px-4 py-3 text-sm text-gray-500">VENMO PAYMENT 7346352</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">$125.00</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="outline" size="sm">Find Match</Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">04/20/2025</td>
                          <td className="px-4 py-3 text-sm text-gray-500">UBER TRIP 58493WEFH</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">$24.50</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="outline" size="sm">Find Match</Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">04/21/2025</td>
                          <td className="px-4 py-3 text-sm text-gray-500">SQ *COFFEE SHOP</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">$5.75</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="outline" size="sm">Find Match</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Reports</CardTitle>
                <CardDescription>
                  Generate and download reconciliation reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Summary Report</CardTitle>
                        <CardDescription>High-level overview of reconciliation</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button className="w-full mt-4">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate PDF
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Detailed Report</CardTitle>
                        <CardDescription>All transactions with match status</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button className="w-full mt-4">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate PDF
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Exception Report</CardTitle>
                        <CardDescription>Only unmatched transactions</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button className="w-full mt-4">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate PDF
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recent Reports</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium">Bank Reconciliation - Summary</p>
                            <p className="text-xs text-gray-500">Generated on Apr 21, 2025</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium">Bank Reconciliation - Detailed</p>
                            <p className="text-xs text-gray-500">Generated on Apr 21, 2025</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}