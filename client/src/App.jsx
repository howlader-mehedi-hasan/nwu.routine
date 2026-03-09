import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import RoutineView from './components/RoutineView';
import WeekRoutineView from './components/WeekRoutineView';
import AdminPanel from './components/AdminPanel';
import FacultyList from './components/FacultyList';
import AuthPage from './components/AuthPage';
import UserManagement from './components/UserManagement';
import UserDashboard from './components/UserDashboard';
import SettingsLayout from './components/layout/SettingsLayout';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Unauthenticated -> Force login
  if (!user) return <Navigate to="/auth" replace />;

  // Insufficient permissions -> Route to Home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const [overtimeVisibility, setOvertimeVisibility] = React.useState({
    "Monday": false, "Tuesday": false, "Wednesday": false, "Thursday": false, "Friday": false, "Saturday": false
  });

  return (
    <Routes>
      <Route path="/auth" element={<DashboardLayout><AuthPage /></DashboardLayout>} />

      <Route path="/" element={<DashboardLayout><RoutineView overtimeVisibility={overtimeVisibility} setOvertimeVisibility={setOvertimeVisibility} /></DashboardLayout>} />
      <Route path="/week-routine" element={<DashboardLayout fullWidth={true}><WeekRoutineView overtimeVisibility={overtimeVisibility} setOvertimeVisibility={setOvertimeVisibility} /></DashboardLayout>} />
      <Route path="/faculty" element={<DashboardLayout><FacultyList /></DashboardLayout>} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout><SettingsLayout><UserDashboard /></SettingsLayout></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
          <DashboardLayout><SettingsLayout><AdminPanel /></SettingsLayout></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <DashboardLayout><SettingsLayout><UserManagement /></SettingsLayout></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout><SettingsLayout>&nbsp;</SettingsLayout></DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <AppRoutes />
        </Router>
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
