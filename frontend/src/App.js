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
    mode: 'light',
    primary: {
      main: '#264653',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#e9c46a',
      contrastText: '#1f2937'
    },
    error: {
      main: '#d62828'
    },
    warning: {
      main: '#f4a261'
    },
    info: {
      main: '#2a9d8f'
    },
    background: {
      default: '#f4f7fb',
      paper: '#ffffff'
    },
    text: {
      primary: '#1f2937',
      secondary: '#4b5563'
    }
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'sans-serif'].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  shape: {
    borderRadius: 14
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.92)',
          color: '#1f2937',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '18px',
          boxShadow: '0 14px 35px rgba(15, 23, 42, 0.06)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '18px',
          boxShadow: '0 14px 35px rgba(15, 23, 42, 0.06)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px'
        },
        contained: {
          boxShadow: 'none'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined'
      },
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 12,
          '& .MuiOutlinedInput-root': {
            borderRadius: 12
          }
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(180deg, #f4f7fb 0%, #e9eef4 100%)',
          minHeight: '100vh',
          color: '#1f2937'
        },
        '*, *::before, *::after': {
          boxSizing: 'border-box'
        }
      }
    }
  }
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