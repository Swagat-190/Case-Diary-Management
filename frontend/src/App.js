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
            <ProtectedRoute>
              <CaseList />
            </ProtectedRoute>
          } />
          <Route path="/cases/:id" element={
            <ProtectedRoute>
              <CaseDetails />
            </ProtectedRoute>
          } />
          <Route path="/case-diary/:caseId" element={
            <ProtectedRoute>
              <CaseDiaryForm />
            </ProtectedRoute>
          } />
          <Route path="/evidence/:caseId" element={
            <ProtectedRoute>
              <EvidenceUpload />
            </ProtectedRoute>
          } />
          <Route path="/supervisor" element={
            <ProtectedRoute>
              <SupervisorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;