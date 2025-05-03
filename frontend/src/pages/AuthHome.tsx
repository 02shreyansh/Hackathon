/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
   Clock, FileText, Upload, CheckCircle2, AlertCircle, 
  TrendingUp, ChevronRight, BarChart2, 
  PieChart, Settings, HelpCircle, Bell
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const professionalTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8
}

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

export default function ProfessionalDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'quickActions'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [statsHovered, setStatsHovered] = useState<number | null>(null)
  
  // Window scroll effects
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 100], [0, -20])
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.9])

  // Mock data
  const stats = [
    { title: 'Processed', value: '1,248', change: '+12%', positive: true, icon: <BarChart2 className="h-5 w-5" /> },
    { title: 'Reconciled', value: '876', change: '+8%', positive: true, icon: <CheckCircle2 className="h-5 w-5" /> },
    { title: 'Discrepancies', value: '142', change: '-3%', positive: false, icon: <AlertCircle className="h-5 w-5" /> },
    { title: 'Time Saved', value: '28h', change: '+15%', positive: true, icon: <Clock className="h-5 w-5" /> },
  ]

  const recentActivities = [
    { id: 1, type: 'upload', description: 'Q3 Bank Statements.csv uploaded', time: '2 mins ago', icon: <Upload className="h-4 w-4" /> },
    { id: 2, type: 'match', description: '87 transactions auto-matched', time: '5 mins ago', icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
    { id: 3, type: 'alert', description: '12 discrepancies found', time: '10 mins ago', icon: <AlertCircle className="h-4 w-4 text-amber-500" /> },
    { id: 4, type: 'report', description: 'Monthly reconciliation report', time: '1 hour ago', icon: <FileText className="h-4 w-4 text-blue-500" /> },
  ]

  const quickActions = [
    { 
      title: 'New Reconciliation', 
      description: 'Upload bank and ledger files', 
      icon: <Upload className="h-5 w-5" />, 
      action: () => navigate('/upload'),
      color: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      title: 'Review Matches', 
      description: 'Verify suggested matches', 
      icon: <CheckCircle2 className="h-5 w-5" />, 
      action: () => navigate('/reconciliation'),
      color: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    { 
      title: 'Generate Report', 
      description: 'Create audit-ready PDF', 
      icon: <FileText className="h-5 w-5" />, 
      action: () => navigate('/reports'),
      color: 'bg-purple-50 dark:bg-purple-900/20'
    },
    { 
      title: 'System Settings', 
      description: 'Configure matching rules', 
      icon: <Settings className="h-5 w-5" />, 
      action: () => navigate('/settings'),
      color: 'bg-gray-50 dark:bg-gray-800'
    },
  ]

  useEffect(() => {
    // Simulate data loading
    const loadTimer = setTimeout(() => setIsLoading(false), 1200)
    
    const progressTimer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return Math.min(oldProgress + 10, 100)
      })
    }, 120)

    return () => {
      clearTimeout(loadTimer)
      clearInterval(progressTimer)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { duration: 2, repeat: Infinity, ease: "linear" }
          }}
          className="mb-6"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary">
            <path d="M12 2v4" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 18v4" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.93 4.93l2.83 2.83" strokeWidth="2" strokeLinecap="round" />
            <path d="M16.24 16.24l2.83 2.83" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12h4" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 12h4" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.93 19.07l2.83-2.83" strokeWidth="2" strokeLinecap="round" />
            <path d="M16.24 7.76l2.83-2.83" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
        
        <div className="w-64 mb-4">
          <Progress value={progress} className="h-[3px]" />
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          Loading financial dashboard...
        </motion.p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Scroll Effects */}
      <motion.div
        style={{ y: headerY, opacity: headerOpacity }}
        className="mb-8 sticky top-0 bg-background/90 backdrop-blur-sm z-10 pt-6 pb-2"
      >
        <div className="flex justify-between items-start">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...professionalTransition, delay: 0.1 }}
              className="text-2xl font-semibold tracking-tight"
            >
              Financial Reconciliation Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              Last updated: {new Date().toLocaleString()}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="outline" size="sm" className="gap-1">
              <Bell className="h-3.5 w-3.5" />
              <span>Alerts</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.2
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={fadeIn}
            transition={professionalTransition}
            onHoverStart={() => setStatsHovered(index)}
            onHoverEnd={() => setStatsHovered(null)}
          >
            <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <CardDescription className="text-sm">{stat.title}</CardDescription>
                  <motion.div
                    animate={{
                      rotate: statsHovered === index ? [0, 10, -10, 0] : 0,
                      transition: { duration: 0.6 }
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                </div>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Badge 
                    variant={stat.positive ? 'outline' : 'destructive'} 
                    className={`rounded-sm mr-2 ${stat.positive ? 'border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400' : ''}`}
                  >
                    {stat.change}
                  </Badge>
                  <TrendingUp className={`h-3.5 w-3.5 ${stat.positive ? 'text-emerald-500' : 'text-destructive'}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Area */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'overview' | 'quickActions')}
        className="mb-6"
      >
        <motion.div layout>
          <TabsList className="grid w-full grid-cols-2 bg-background p-0 h-auto relative border-b">
            <motion.div
              layoutId="tabUnderline"
              animate={{
                left: activeTab === 'overview' ? '0%' : '50%',
                width: '50%'
              }}
              transition={professionalTransition}
              className="absolute bottom-0 h-[2px] bg-primary z-0"
            />
            <TabsTrigger 
              value="overview" 
              className="relative z-10 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="quickActions" 
              className="relative z-10 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Quick Actions
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={professionalTransition}
          >
            <TabsContent value={activeTab} className="mt-6">
              {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Reconciliation Progress */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Reconciliation Status</CardTitle>
                      <CardDescription>Current matching progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        {[
                          { label: 'Automatically Matched', value: 70, color: 'bg-emerald-500' },
                          { label: 'Requires Review', value: 12, color: 'bg-amber-500' },
                          { label: 'Unmatched Items', value: 18, color: 'bg-destructive' }
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            <div className="flex justify-between text-sm mb-1.5">
                              <span>{item.label}</span>
                              <span className="text-muted-foreground">{item.value}%</span>
                            </div>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                              className={`h-[3px] rounded-full ${item.color}`}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => navigate('/reconciliation')} 
                        className="w-full"
                        variant="outline"
                      >
                        Review Discrepancies
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>System events</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentActivities.map((activity) => (
                        <motion.div
                          key={activity.id}
                          whileHover={{ 
                            x: 5,
                            transition: { duration: 0.2 }
                          }}
                          className="flex items-start pb-4 last:pb-0 border-b last:border-b-0 border-border/20"
                        >
                          <div className="flex-shrink-0 mt-0.5 mr-3">
                            {activity.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recent Reports */}
                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Generated Reports</CardTitle>
                      <CardDescription>Available for download</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { 
                            title: 'Q3 Reconciliation', 
                            date: 'Oct 15, 2023',
                            type: 'Audit',
                            icon: <FileText className="h-5 w-5 text-blue-500" />
                          },
                          { 
                            title: 'Vendor Analysis', 
                            date: 'Oct 10, 2023',
                            type: 'Analysis',
                            icon: <PieChart className="h-5 w-5 text-purple-500" />
                          },
                          { 
                            title: 'Monthly Summary', 
                            date: 'Oct 1, 2023',
                            type: 'Summary',
                            icon: <BarChart2 className="h-5 w-5 text-emerald-500" />
                          }
                        ].map((report) => (
                          <motion.div
                            key={report.title}
                            whileHover={{ 
                              y: -2,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card 
                              className="cursor-pointer border-border/50 hover:border-primary/30 transition-colors h-full"
                              onClick={() => navigate('/reports')}
                            >
                              <CardHeader className="pb-3">
                                {report.icon}
                                <CardTitle className="text-lg">{report.title}</CardTitle>
                                <CardDescription className="text-xs">{report.date}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Badge variant="outline" className="rounded-sm">
                                  {report.type}
                                </Badge>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...professionalTransition, delay: index * 0.05 }}
                      whileHover={{ y: -3 }}
                    >
                      <Card 
                        className={`h-full cursor-pointer border-border/50 hover:border-primary/30 transition-colors ${action.color}`}
                        onClick={action.action}
                      >
                        <CardHeader className="pb-4">
                          <div className={`p-2.5 rounded-lg ${action.color.replace('bg-', 'bg-').replace('/20', '/30')} w-fit mb-3`}>
                            {action.icon}
                          </div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <CardDescription className="text-sm">{action.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary pl-0 hover:bg-transparent"
                          >
                            Get started
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* System Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>System Insights</CardTitle>
            <CardDescription>Optimization suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  title: 'Matching Efficiency', 
                  content: '87% of transactions matched automatically',
                  action: 'Configure rules →',
                  progress: 87
                },
                { 
                  title: 'Processing Speed', 
                  content: '28% faster than last month',
                  action: 'View analytics →',
                  progress: 72
                },
                { 
                  title: 'Data Accuracy', 
                  content: '99.2% of entries validated',
                  action: 'Run validation →',
                  progress: 99
                }
              ].map((insight) => (
                <motion.div
                  key={insight.title}
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  className="p-4 rounded-lg bg-muted/30 border border-border/20"
                >
                  <h3 className="font-medium text-sm mb-2">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{insight.content}</p>
                  <div className="flex items-center justify-between">
                    <Button variant="link" size="sm" className="h-auto p-0 text-sm">
                      {insight.action}
                    </Button>
                    <div className="text-xs font-medium text-muted-foreground">
                      {insight.progress}%
                    </div>
                  </div>
                  <Progress value={insight.progress} className="h-[2px] mt-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-6 right-6"
      >
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shadow-sm border-border/50 hover:border-primary/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  )
}