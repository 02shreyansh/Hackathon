import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileSpreadsheet, Check, X, AlertCircle, FileDown, ChevronDown, RefreshCw } from "lucide-react";
import { Toaster as toast } from "@/components/ui/sonner"

// Types
type TransactionStatus = 'matched' | 'unmatched' | 'review';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  source: 'bank' | 'ledger';
  matchId?: string;
  confidence?: number;
  status: TransactionStatus;
  category?: string;
}

function Reconciliation() {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [ledgerFile, setLedgerFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReconciled, setIsReconciled] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [progress, setProgress] = useState(0);

  // File upload handlers
  const handleBankFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBankFile(e.target.files[0]);
    }
  };

  const handleLedgerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLedgerFile(e.target.files[0]);
    }
  };

  const startReconciliation = async () => {
    if (!bankFile || !ledgerFile) {
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Create form data to send files
      const formData = new FormData();
      formData.append('bank', bankFile);
      formData.append('ledger', ledgerFile);

      // Simulate progress while API processes files
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);

      // Send files to API
      const response = await fetch('http://localhost:8000/reconcile', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      // Process the API response
      const data = await response.json();
      setProgress(100);
      
      // Transform API response to match our Transaction interface
      const processedTransactions = processApiResponse(data);
      setTransactions(processedTransactions);
      
      setIsProcessing(false);
      setIsReconciled(true);
    } catch (error) {
      console.error('Error during reconciliation:', error);
      toast({
        title: "Reconciliation Failed",
        description: "There was an error processing your files. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Process API response and transform to our Transaction interface
  const processApiResponse = (data: any): Transaction[] => {
    // Replace this with actual mapping based on your API response structure
    // This is just a placeholder assuming API returns transactions in some format
    const transformedTransactions: Transaction[] = [];
    
    // Process bank transactions
    if (data.bankData && Array.isArray(data.bankData)) {
      data.bankData.forEach((item: any, index: number) => {
        const transaction: Transaction = {
          id: `bank-${index}`,
          date: item.date || '',
          description: item.description || '',
          amount: parseFloat(item.amount) || 0,
          source: 'bank',
          status: item.status || 'unmatched',
          category: item.category || undefined,
          matchId: item.matchId || undefined,
          confidence: item.confidence || undefined
        };
        transformedTransactions.push(transaction);
      });
    }
    
    // Process ledger transactions
    if (data.ledgerData && Array.isArray(data.ledgerData)) {
      data.ledgerData.forEach((item: any, index: number) => {
        const transaction: Transaction = {
          id: `ledger-${index}`,
          date: item.date || '',
          description: item.description || '',
          amount: parseFloat(item.amount) || 0,
          source: 'ledger',
          status: item.status || 'unmatched',
          category: item.category || undefined,
          matchId: item.matchId || undefined,
          confidence: item.confidence || undefined
        };
        transformedTransactions.push(transaction);
      });
    }
    
    return transformedTransactions;
  };

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'matched') return transaction.status === 'matched';
    if (activeTab === 'unmatched') return transaction.status === 'unmatched';
    if (activeTab === 'review') return transaction.status === 'review';
    return true;
  });

  // Count transactions by status
  const matchedCount = transactions.filter(t => t.status === 'matched').length / 2;
  const unmatchedCount = transactions.filter(t => t.status === 'unmatched').length;
  const reviewCount = transactions.filter(t => t.status === 'review').length / 2;
  
  // Calculate completion percentage
  const totalItems = matchedCount + unmatchedCount + reviewCount;
  const completionPercentage = totalItems > 0 ? Math.round((matchedCount / totalItems) * 100) : 0;

  // Handle match confirmation and rejection
  const confirmMatch = async (id: string) => {
    try {
      // Send match confirmation to API
      const matchedTransaction = transactions.find(t => t.id === id || t.matchId === id);
      
      if (!matchedTransaction) return;
      
      // You can send a request to your API to confirm this match
      // For now, we'll just update the local state
      setTransactions(transactions.map(t => {
        if (t.id === id || t.matchId === id) {
          return {...t, status: 'matched', confidence: 100};
        }
        return t;
      }));
    } catch (error) {
      console.error('Error confirming match:', error);
      toast({
        title: "Error",
        description: "Failed to confirm match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const rejectMatch = async (id: string) => {
    try {
      // Send match rejection to API
      const rejectedTransaction = transactions.find(t => t.id === id || t.matchId === id);
      
      if (!rejectedTransaction) return;
      
      // You can send a request to your API to reject this match
      // For now, we'll just update the local state
      setTransactions(transactions.map(t => {
        if (t.id === id || t.matchId === id) {
          return {...t, status: 'unmatched', matchId: undefined, confidence: undefined};
        }
        return t;
      }));
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast({
        title: "Error",
        description: "Failed to reject match. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Refresh data by reprocessing the files
  const refreshData = () => {
    if (bankFile && ledgerFile) {
      startReconciliation();
    }
  };

  // Export report (placeholder function)
  const exportReport = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated and will download shortly.",
    });
    
    // Implement actual export functionality here
    // For example, convert transactions to CSV and download
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Date,Description,Amount,Source,Status,Confidence\n" +
        transactions.map(t => 
          `${t.date},${t.description},${t.amount},${t.source},${t.status},${t.confidence || ''}`
        ).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "reconciliation_report.csv");
      document.body.appendChild(link);
      link.click();
    }, 500);
  };

  // Render confidence badge with appropriate color
  const renderConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    let color = 'bg-red-500';
    if (confidence >= 90) color = 'bg-green-500';
    else if (confidence >= 70) color = 'bg-yellow-500';
    else if (confidence >= 50) color = 'bg-orange-500';
    
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full text-white ${color}`}>
        {confidence}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold text-gray-900">Financial Reconciliation Tool</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isReconciled ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Statement</CardTitle>
                <CardDescription>Upload your bank statement CSV file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {bankFile ? (
                        <>
                          <FileSpreadsheet className="w-8 h-8 mb-2 text-green-500" />
                          <p className="text-sm text-gray-500">{bankFile.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Click to upload bank statement</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv" 
                      onChange={handleBankFileUpload}
                      disabled={isProcessing}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ledger Entries</CardTitle>
                <CardDescription>Upload your accounting ledger CSV file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {ledgerFile ? (
                        <>
                          <FileSpreadsheet className="w-8 h-8 mb-2 text-green-500" />
                          <p className="text-sm text-gray-500">{ledgerFile.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Click to upload ledger entries</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv" 
                      onChange={handleLedgerFileUpload}
                      disabled={isProcessing}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Process Button */}
            <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
              <Button 
                onClick={startReconciliation}
                disabled={!bankFile || !ledgerFile || isProcessing}
                className="w-full md:w-1/3"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Reconciliation'
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="col-span-1 md:col-span-2 mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-gray-500 mt-2">
                  Processing files... {progress}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Results Dashboard */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">Progress</span>
                      <span className="text-sm font-medium">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Matched</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{matchedCount}</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Unmatched</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center">
                  <X className="mr-2 h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold">{unmatchedCount}</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Need Review</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{reviewCount}</span>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={refreshData}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={exportReport}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center ml-auto">
                    Actions <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Auto-match similar</DropdownMenuItem>
                  <DropdownMenuItem>Clear all matches</DropdownMenuItem>
                  <DropdownMenuItem>Save rules</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Transaction Table with Tabs */}
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                  <TabsTrigger value="matched">Matched</TabsTrigger>
                  <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
                  <TabsTrigger value="review">Need Review</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.map((transaction) => (
                            <TableRow key={transaction.id} className={
                              transaction.status === 'matched' ? 'bg-green-50' :
                              transaction.status === 'review' ? 'bg-yellow-50' : ''
                            }>
                              <TableCell>{transaction.date}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{transaction.description}</span>
                                  {transaction.category && (
                                    <Badge variant="outline" className="w-fit mt-1">{transaction.category}</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                                ${Math.abs(transaction.amount).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {transaction.source === 'bank' ? 'Bank' : 'Ledger'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {renderConfidenceBadge(transaction.confidence)}
                              </TableCell>
                              <TableCell className="text-right">
                                {transaction.status === 'review' && (
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => confirmMatch(transaction.id)}
                                    >
                                      <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => rejectMatch(transaction.id)}
                                    >
                                      <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredTransactions.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                                No transactions found in this category
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

export default Reconciliation;