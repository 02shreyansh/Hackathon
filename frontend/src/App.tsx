import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout';
import HomePage from './pages/HomePage';
import SignupForm from './pages/Signup';
import SigninPage from './pages/Signin';
import UploadPage from './pages/UploadPage';
import Profile from './pages/Profile';
import Dashboard from './pages/dashboard';
import Reconciliation from './pages/reconcillation';
import NotFound from './pages/notFound';
import SettingsPage from './pages/settings';
import ScheduleDemoPage from './pages/Contact';
import  HomeDashboard  from './pages/AuthHome';
import { useUserStore } from './store/useUserStore';
import WatchDemoPage from './pages/watchDemo';
import BankReconciliationAnalytics from './pages/Analytics';
import ReportsPage from './pages/Reports';
const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserStore();
  if (!isAuthenticated) {
    return <Navigate to={"/signin"} replace />
  }
  return <>{children}</>;
}
const AuthenticatedUser = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserStore();
  if (isAuthenticated) {
    return <Navigate to={"/auth"} replace />
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path='auth' element={<HomeDashboard/>}/>
          <Route path='profile' element={<Profile/>}/>
          <Route path='dashboard' element={<Dashboard/>}/>
          <Route path='reconciliation' element={<Reconciliation/>}/>
          <Route path='settings' element={<SettingsPage/>}/>
          <Route path='contact' element={<ScheduleDemoPage/>}/>
          <Route path='watchDemo' element={<WatchDemoPage/>}/>
          <Route path='analytics' element={<BankReconciliationAnalytics/>}/>
          <Route path='reports' element={<ReportsPage/>}/>
        </Route>
        <Route path="signup" element={<SignupForm />} />
        <Route path="signin" element={<SigninPage />} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </Router>
  )
}

export default App
