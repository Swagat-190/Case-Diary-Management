import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/CaseList';
import CaseDetails from './pages/CaseDetails';
import CaseDiaryForm from './pages/CaseDiaryForm';
import EvidenceUpload from './pages/EvidenceUpload';
import SupervisorDashboard from './pages/SupervisorDashboard';
import Analytics from './pages/Analytics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#C3B091',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// Role Protected Route Component
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/cases" element={
            <RoleProtectedRoute allowedRoles={[ 'SUPERVISOR', 'IO' ]}>
              <CaseList />
            </RoleProtectedRoute>
          } />
          <Route path="/cases/:id" element={
            <RoleProtectedRoute allowedRoles={[ 'SUPERVISOR', 'IO' ]}>
              <CaseDetails />
            </RoleProtectedRoute>
          } />
          <Route path="/case-diary/:caseId" element={
            <RoleProtectedRoute allowedRoles={[ 'SUPERVISOR', 'IO' ]}>
              <CaseDiaryForm />
            </RoleProtectedRoute>
          } />
          <Route path="/evidence/:caseId" element={
            <RoleProtectedRoute allowedRoles={[ 'SUPERVISOR', 'IO' ]}>
              <EvidenceUpload />
            </RoleProtectedRoute>
          } />
          <Route path="/supervisor" element={
            <RoleProtectedRoute allowedRoles={[ 'SUPERVISOR' ]}>
              <SupervisorDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/analytics" element={
            <RoleProtectedRoute allowedRoles={[ 'SUPERVISOR', 'IO' ]}>
              <Analytics />
            </RoleProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;