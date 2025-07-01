import  { useState } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle,  
  AlertTriangle, 
  ThumbsUp,
  ThumbsDown,
  Link,
  Search,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
} from '@/components/ui/button';
import {
  Input,
} from '@/components/ui/input';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Mock data
const mockMatches = [
  {
    id: 1,
    bankDate: '2024-06-15',
    bankAmount: -125.50,
    bankDescription: 'AMZ*Digital Services',
    ledgerDate: '2024-06-15',
    ledgerAmount: -125.50,
    ledgerDescription: 'Amazon AWS Subscription',
    confidence: 95,
    status: 'matched',
    feedback: null
  },
  {
    id: 2,
    bankDate: '2024-06-14',
    bankAmount: -45.20,
    bankDescription: 'STARBUCKS #1234',
    ledgerDate: '2024-06-14',
    ledgerAmount: -45.20,
    ledgerDescription: 'Coffee Meeting - Client',
    confidence: 88,
    status: 'matched',
    feedback: 'confirmed'
  },
  {
    id: 3,
    bankDate: '2024-06-13',
    bankAmount: -89.99,
    bankDescription: 'APPLE.COM/BILL',
    ledgerDate: '2024-06-14',
    ledgerAmount: -89.99,
    ledgerDescription: 'Software Subscription',
    confidence: 72,
    status: 'review',
    feedback: null
  },
  {
    id: 4,
    bankDate: '2024-06-12',
    bankAmount: -156.78,
    bankDescription: 'WAL-MART SUPERCENTER',
    ledgerDate: null,
    ledgerAmount: null,
    ledgerDescription: null,
    confidence: 0,
    status: 'unmatched',
    feedback: null
  },
  {
    id: 5,
    bankDate: '2024-06-11',
    bankAmount: 2500.00,
    bankDescription: 'DIRECT DEPOSIT PAYROLL',
    ledgerDate: '2024-06-11',
    ledgerAmount: 2500.00,
    ledgerDescription: 'Monthly Salary',
    confidence: 100,
    status: 'matched',
    feedback: 'confirmed'
  }
];

const mockStats = {
  totalTransactions: 156,
  matchedTransactions: 142,
  reviewRequired: 8,
  unmatched: 6,
  averageConfidence: 87.5,
  totalAmount: 15420.50,
  matchedAmount: 14890.25
};

export default function BankReconciliationAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfidence, setFilterConfidence] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    if (confidence >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string, _: number) => {
    switch (status) {
      case 'matched':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Matched</Badge>;
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Review</Badge>;
      case 'unmatched':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unmatched</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleFeedback = (matchId: number, feedback: string) => {
    console.log(`Feedback for match ${matchId}: ${feedback}`);
  };

  const filteredMatches = mockMatches.filter(match => {
    const searchMatch = match.bankDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (match.ledgerDescription && match.ledgerDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const confidenceMatch = filterConfidence === 'all' || 
                           (filterConfidence === 'high' && match.confidence >= 90) ||
                           (filterConfidence === 'medium' && match.confidence >= 70 && match.confidence < 90) ||
                           (filterConfidence === 'low' && match.confidence < 70);
    
    return searchMatch && confidenceMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation Analytics</h1>
            <p className="text-gray-600 mt-1">Automated transaction matching and reconciliation dashboard</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                ${mockStats.totalAmount.toLocaleString()} total value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matched</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockStats.matchedTransactions}</div>
              <p className="text-xs text-muted-foreground">
                {((mockStats.matchedTransactions / mockStats.totalTransactions) * 100).toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{mockStats.reviewRequired}</div>
              <p className="text-xs text-muted-foreground">
                Low confidence matches
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mockStats.averageConfidence}%</div>
              <p className="text-xs text-muted-foreground">
                Matching accuracy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="review">Review Queue</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Matching Status Distribution</CardTitle>
                  <CardDescription>Breakdown of transaction matching results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Matched ({mockStats.matchedTransactions})</span>
                      </div>
                      <span className="text-sm font-medium">
                        {((mockStats.matchedTransactions / mockStats.totalTransactions) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Review Required ({mockStats.reviewRequired})</span>
                      </div>
                      <span className="text-sm font-medium">
                        {((mockStats.reviewRequired / mockStats.totalTransactions) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Unmatched ({mockStats.unmatched})</span>
                      </div>
                      <span className="text-sm font-medium">
                        {((mockStats.unmatched / mockStats.totalTransactions) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest matching results and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">142 transactions automatically matched</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ThumbsUp className="h-4 w-4 text-blue-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">User confirmed Starbucks transaction match</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">8 transactions require manual review</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                8 transactions have low confidence matches and require your review. 
                <Button variant="link" className="p-0 h-auto ml-1" onClick={() => setActiveTab('review')}>
                  Review now →
                </Button>
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Matches</CardTitle>
                <CardDescription>Complete list of transaction matches with confidence scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterConfidence}
                      onChange={(e) => setFilterConfidence(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Confidence</option>
                      <option value="high">High (90%+)</option>
                      <option value="medium">Medium (70-89%)</option>
                      <option value="low">Low (70%)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredMatches.map((match) => (
                    <div key={match.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(match.status, match.confidence)}
                          {match.confidence > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getConfidenceColor(match.confidence)}`}
                                  style={{ width: `${match.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{match.confidence}%</span>
                            </div>
                          )}
                        </div>
                        
                        {match.status === 'review' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFeedback(match.id, 'confirm')}
                              className="flex items-center gap-1"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFeedback(match.id, 'reject')}
                              className="flex items-center gap-1"
                            >
                              <ThumbsDown className="h-3 w-3" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Link className="h-3 w-3" />
                              Link
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-600">Bank Transaction</h4>
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium">${Math.abs(match.bankAmount).toFixed(2)}</span>
                              <span className="text-sm text-gray-600">{match.bankDate}</span>
                            </div>
                            <p className="text-sm text-gray-700">{match.bankDescription}</p>
                          </div>
                        </div>

                        {match.ledgerDescription && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-600">Ledger Entry</h4>
                            <div className="bg-green-50 p-3 rounded">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium">${Math.abs(match.ledgerAmount).toFixed(2)}</span>
                                <span className="text-sm text-gray-600">{match.ledgerDate}</span>
                              </div>
                              <p className="text-sm text-gray-700">{match.ledgerDescription}</p>
                            </div>
                          </div>
                        )}

                        {match.status === 'unmatched' && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-600">Status</h4>
                            <div className="bg-red-50 p-3 rounded">
                              <p className="text-sm text-red-700">No matching ledger entry found</p>
                              <Button size="sm" variant="outline" className="mt-2">
                                Create Ledger Entry
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Queue</CardTitle>
                <CardDescription>Transactions requiring manual verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMatches.filter(match => match.status === 'review').map((match) => (
                    <div key={match.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Low Confidence Match ({match.confidence}%)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Bank:</span> {match.bankDescription}
                              <br />
                              <span className="text-gray-600">${Math.abs(match.bankAmount)} on {match.bankDate}</span>
                            </div>
                            <div>
                              <span className="font-medium">Ledger:</span> {match.ledgerDescription}
                              <br />
                              <span className="text-gray-600">${Math.abs(match.ledgerAmount)} on {match.ledgerDate}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleFeedback(match.id, 'confirm')}
                            className="flex items-center gap-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Confirm Match
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFeedback(match.id, 'reject')}
                            className="flex items-center gap-1"
                          >
                            <ThumbsDown className="h-3 w-3" />
                            Reject Match
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Link className="h-3 w-3" />
                            Find Better Match
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>Export reconciliation reports in various formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Monthly Reconciliation Report (PDF)
                  </Button>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Matched Transactions (CSV)
                  </Button>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Unmatched Items (CSV)
                  </Button>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Detailed Analytics Report (PDF)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <CardDescription>Key metrics for the current reconciliation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-700">{mockStats.matchedTransactions}</div>
                      <div className="text-sm text-green-600">Matched</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-2xl font-bold text-red-700">{mockStats.unmatched}</div>
                      <div className="text-sm text-red-600">Unmatched</div>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-700">
                      ${(mockStats.matchedAmount).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">Total Matched Amount</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-700">{mockStats.averageConfidence}%</div>
                    <div className="text-sm text-gray-600">Average Match Confidence</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}