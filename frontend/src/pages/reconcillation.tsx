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
import { toast } from "sonner";

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
      toast.error("Please upload both bank and ledger files");
      return;
    }
    
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Create form data to send files
      const formData = new FormData();
      formData.append('bank', bankFile);
      formData.append('ledger', ledgerFile);
      formData.append('modify_bank', 'true'); // Default to modifying bank data
    
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
        const errorData = await response.json();
        throw new Error(errorData.detail || `API responded with status: ${response.status}`);
      }
      
     
      const data = await response.json();
      setProgress(100);
      
      
      if (data.success) {

        const processedTransactions = data.transactions.map((transaction: any) => {
          
          return {
            id: transaction.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
            date: transaction.date || new Date().toISOString().split('T')[0],
            description: transaction.description || 'Unknown transaction',
            amount: parseFloat(transaction.amount) || 0,
            source: transaction.source || 'unknown',
            status: transaction.status || 'unmatched',
            matchId: transaction.matchId,
            confidence: transaction.confidence,
            category: transaction.category || undefined
          };
        });
        
        setTransactions(processedTransactions);
        
        toast.success(
          `Reconciliation Complete`, 
          {
            description: `Successfully reconciled files. Modified ${data.source} data with ${data.modification_count} changes.`
          }
        );
      } else {
        throw new Error("API returned success: false");
      }
      
      setIsProcessing(false);
      setIsReconciled(true);
    } catch (error) {
      console.error('Error during reconciliation:', error);
      toast.error(
        "Reconciliation Failed", 
        { 
          description: error instanceof Error ? error.message : "There was an error processing your files. Please try again."
        }
      );
      setIsProcessing(false);
      setProgress(0);
    }  
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
  const matchedCount = transactions.filter(t => t.status === 'matched').length / 2 || 0;
  const unmatchedCount = transactions.filter(t => t.status === 'unmatched').length || 0;
  const reviewCount = transactions.filter(t => t.status === 'review').length / 2 || 0;
  
  // Calculate completion percentage
  const totalTransactionPairs = transactions.length > 0 
    ? (transactions.filter(t => t.matchId).length / 2) + unmatchedCount 
    : 0;
  const completionPercentage = totalTransactionPairs > 0 
    ? Math.round((matchedCount / totalTransactionPairs) * 100) 
    : 0;
  
  // Handle match confirmation and rejection
  const confirmMatch = async (id: string) => {
    try {
      // Find the transaction and its matching pair
      const transaction = transactions.find(t => t.id === id);
      if (!transaction || !transaction.matchId) return;
      
      // Update both transactions in the pair
      setTransactions(transactions.map(t => {
        if (t.id === id || t.matchId === transaction.matchId) {
          return {...t, status: 'matched', confidence: 100};
        }
        return t;
      }));
      
      toast.success("Match confirmed successfully");
    } catch (error) {
      console.error('Error confirming match:', error);
      toast.error("Failed to confirm match. Please try again.");
    }
  };
  
  const rejectMatch = async (id: string) => {
    try {
      // Find the transaction and its matching pair
      const transaction = transactions.find(t => t.id === id);
      if (!transaction || !transaction.matchId) return;
      
      const matchId = transaction.matchId;
      
      // Update both transactions in the pair
      setTransactions(transactions.map(t => {
        if (t.id === id || t.matchId === matchId) {
          return {...t, status: 'unmatched', matchId: undefined, confidence: undefined};
        }
        return t;
      }));
      
      toast.success("Match rejected successfully");
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast.error("Failed to reject match. Please try again.");
    }
  };
  
  // Refresh data by reprocessing the files
  const refreshData = () => {
    if (bankFile && ledgerFile) {
      startReconciliation();
    } else {
      toast.error("Please ensure both files are uploaded before refreshing");
    }
  };
  
  // Export report
  const exportReport = () => {
    if (transactions.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    toast.success("Export Started", {
      description: "Your report is being generated and will download shortly."
    });
    
    try {
      const headers = ["Date", "Description", "Amount", "Source", "Status", "Confidence"];
      
      const csvContent = "data:text/csv;charset=utf-8," + 
        headers.join(",") + "\n" +
        transactions.map(t => 
          `${t.date},${t.description.replace(/,/g, ";")},${t.amount},${t.source},${t.status},${t.confidence || ''}`
        ).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "reconciliation_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };
  
  // Render confidence badge with appropriate color
  const renderConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    let badgeVariant = 'bg-red-500';
    if (confidence >= 90) badgeVariant = 'bg-green-500';
    else if (confidence >= 70) badgeVariant = 'bg-yellow-500';
    else if (confidence >= 50) badgeVariant = 'bg-orange-500';
    
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full text-white ${badgeVariant}`}>
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
                          {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => (
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
                            ))
                          ) : (
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