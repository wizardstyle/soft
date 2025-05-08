import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RepairProvider } from './context/RepairContext';
import useThemeStore from './store/themeStore';
import { useRepairNotifications } from './hooks/useRepairNotifications';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RepairList from './pages/RepairList';
import RepairForm from './pages/RepairForm';
import RepairDetails from './pages/RepairDetails';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  useRepairNotifications();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="repairs" element={<RepairList />} />
          <Route path="repairs/new" element={<RepairForm />} />
          <Route path="repairs/:id" element={<RepairDetails />} />
          <Route path="repairs/:id/edit" element={<RepairForm />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <RepairProvider>
      <AppContent />
    </RepairProvider>
  );
}

export default App;