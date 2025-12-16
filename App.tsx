import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tree from './pages/Tree';
import WalletPage from './pages/Wallet';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import MobileMenu from './pages/MobileMenu';
import Sidebar from './components/Sidebar';
import { ArrowLeft, LogOut, Menu } from 'lucide-react';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { logout } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isMobileMenu = location.pathname === '/menu';

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isMobileMenu) {
      return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm">
          <button 
            onClick={() => navigate('/menu')} 
            className="md:hidden flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors py-2 px-1 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={24} />
            <span className="font-medium text-sm sr-only">{t('back')}</span>
          </button>

          <button 
            onClick={() => navigate(-1)} 
            className="hidden md:flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
            <span className="font-medium text-sm">{t('back')}</span>
          </button>
          
          <button 
             onClick={() => navigate('/menu')}
             className="md:hidden p-2 text-slate-600"
          >
             <Menu size={24} />
          </button>

          <button 
            onClick={handleLogout}
            className="hidden md:flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors py-2 px-3 rounded-lg hover:bg-red-50"
          >
            <span className="font-medium text-sm">{t('logout')}</span>
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/menu" element={
            <PrivateRoute>
              <MobileMenu />
            </PrivateRoute>
        } />
        
        <Route path="/tree" element={
          <PrivateRoute>
            <Tree />
          </PrivateRoute>
        } />
        
        <Route path="/wallet" element={
          <PrivateRoute>
            <WalletPage />
          </PrivateRoute>
        } />

        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <PrivateRoute>
            {user?.username === 'admin' ? <Admin /> : <Navigate to="/" replace />}
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;