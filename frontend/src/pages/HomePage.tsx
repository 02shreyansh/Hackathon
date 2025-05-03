import { 
  Upload, 
  GitCompare, 
  FileText, 
  PieChart, 
  Shield, 
  Zap, 
  BrainCircuit, 
  Clock 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate=useNavigate()
  const features = [
    {
      icon: <Upload className="h-10 w-10 text-blue-600" />,
      title: "Simple File Upload",
      description: "Easily upload your bank statements and ledger files in CSV format without any complicated steps."
    },
    {
      icon: <GitCompare className="h-10 w-10 text-blue-600" />,
      title: "Intelligent Matching",
      description: "Our algorithm automatically matches transactions with high accuracy using smart pattern recognition."
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-blue-600" />,
      title: "Learning System",
      description: "The system learns from your feedback to continuously improve matching accuracy over time."
    },
    {
      icon: <FileText className="h-10 w-10 text-blue-600" />,
      title: "Detailed Reports",
      description: "Generate comprehensive reconciliation reports and export them as PDF for your records."
    }
  ];

  const benefits = [
    {
      icon: <Clock className="h-6 w-6 text-green-600" />,
      title: "Save Time",
      description: "Reduce reconciliation time by up to 80% compared to manual matching."
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Reduce Errors",
      description: "Minimize human error with our precise matching algorithm."
    },
    {
      icon: <Zap className="h-6 w-6 text-green-600" />,
      title: "Increase Efficiency",
      description: "Focus on resolving discrepancies, not finding them."
    },
    {
      icon: <PieChart className="h-6 w-6 text-green-600" />,
      title: "Better Insights",
      description: "Gain valuable insights from transaction patterns and analytics."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <Badge className="mb-4" variant="outline">NEW</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
                Automate Your Bank Reconciliation
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md">
                Stop spending hours manually matching bank statements to your ledger. 
                ReconcileAI uses intelligent algorithms to do the work for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" 
                onClick={()=>navigate("/signup")}
                >
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={()=>navigate("/watchDemo")}>
                  Watch Demo
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative mx-auto">
                <div className="shadow-2xl rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src="https://itchronicles.com/wp-content/uploads/2020/11/where-is-ai-used.jpg" 
                    alt="ReconcileAI Dashboard" 
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium">95% Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our straightforward process makes reconciliation simple and efficient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Upload Files", desc: "Upload your bank statement and ledger files in CSV format" },
              { step: "2", title: "Run Matching", desc: "Our algorithm automatically matches transactions" },
              { step: "3", title: "Review & Confirm", desc: "Review suggested matches and confirm or correct them" },
              { step: "4", title: "Export Report", desc: "Generate a comprehensive reconciliation report" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">{item.step}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block w-12 h-1 border-t-2 border-dashed border-gray-300 mt-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools to streamline your reconciliation process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose ReconcileAI</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your financial reconciliation process with these benefits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className="mr-4 bg-white p-2 rounded-md shadow-sm">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to simplify your reconciliation process?
              </h2>
              <p className="text-blue-100">
                Get started today and save hours on your financial reconciliation tasks.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 cursor-pointer" onClick={()=>navigate("/reconciliation")}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-black border-white hover:bg-blue-50 cursor-pointer" onClick={()=>navigate("/contact")}>
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}