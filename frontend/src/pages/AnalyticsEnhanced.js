import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, AppBar, Toolbar, Button } from '@mui/material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '15px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.2)'
  }
}));

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

const AnalyticsEnhanced = () => {
  const [stats, setStats] = useState({
    casesByStatus: [],
    casesTrend: [],
    typeDistribution: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/cases', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cases = response.data;
      
      // Status distribution
      const statusCount = {};
      cases.forEach(c => {
        statusCount[c.caseStatus] = (statusCount[c.caseStatus] || 0) + 1;
      });

      const casesByStatus = Object.entries(statusCount).map(([status, count]) => ({
        name: status.replace(/_/g, ' '),
        value: count
      }));

      // Case type distribution
      const typeCount = {};
      cases.forEach(c => {
        typeCount[c.caseType] = (typeCount[c.caseType] || 0) + 1;
      });

      const typeDistribution = Object.entries(typeCount).map(([type, count]) => ({
        name: type,
        value: count
      }));

      // Monthly trend data (real)
      const monthlyMap = {};
      cases.forEach(c => {
        const date = new Date(c.dateOfFir);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] || 0) + 1;
      });

      const casesTrend = Object.entries(monthlyMap).map(([month, cases]) => ({
        month,
        cases
      }));

      setStats({
        casesByStatus,
        casesTrend,
        typeDistribution
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px 0 rgba(102, 126, 234, 0.3)'
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Analytics & Reports
          </Typography>
          <Button 
            color="inherit" 
            onClick={fetchAnalytics}
            startIcon={<RefreshIcon />}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Title */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          📊 Case Analytics Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Cases Trend */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  📈 Cases Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.casesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="cases" 
                      stroke="#667eea" 
                      strokeWidth={3}
                      dot={{ fill: '#667eea', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Case Status Distribution */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  🎯 Cases by Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.casesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.casesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Case Type Distribution */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  📋 Cases by Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AnalyticsEnhanced;