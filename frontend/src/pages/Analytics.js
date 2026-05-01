import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Paper, Button, Box, AppBar, Toolbar } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';

const Analytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState({
    caseStats: { totalCases: 0, openCases: 0, closedCases: 0 },
    caseTypes: [],
    monthlyData: []
  });

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/cases', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cases = response.data;

      // Calculate real statistics
      const totalCases = cases.length;
      const openCases = cases.filter(c => c.caseStatus === 'OPEN').length;
      const closedCases = cases.filter(c => c.caseStatus === 'CLOSED').length;

      // Case types distribution
      const caseTypesMap = {};
      cases.forEach(c => {
        caseTypesMap[c.caseType] = (caseTypesMap[c.caseType] || 0) + 1;
      });

      const caseTypes = Object.entries(caseTypesMap).map(([name, value], index) => ({
        name,
        value,
        color: ['#C3B091', '#A8926A', '#D1C2A1', '#BFA57D', '#E2D6C4'][index % 5]
      }));

      // Monthly data (group by month from dateOfFir)
      const monthlyMap = {};
      cases.forEach(c => {
        const date = new Date(c.dateOfFir);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] || 0) + 1;
      });

      const monthlyData = Object.entries(monthlyMap).map(([month, cases]) => ({
        month,
        cases
      }));

      setAnalyticsData({
        caseStats: { totalCases, openCases, closedCases },
        caseTypes,
        monthlyData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
          boxShadow: '0 4px 20px 0 rgba(195, 176, 145, 0.3)'
        }}
      >
        <Toolbar>
          <Button 
            color="inherit" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Analytics & Reports
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Total Cases
              </Typography>
              <Typography variant="h3" color="primary">
                {analyticsData.caseStats.totalCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Open Cases
              </Typography>
              <Typography variant="h3" color="error">
                {analyticsData.caseStats.openCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Closed Cases
              </Typography>
              <Typography variant="h3" color="success.main">
                {analyticsData.caseStats.closedCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Case Trends
            </Typography>
            <BarChart width={400} height={300} data={analyticsData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cases" fill="#C3B091" />
            </BarChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Case Types Distribution
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={analyticsData.caseTypes}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#C3B091"
                dataKey="value"
              >
                {analyticsData.caseTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default Analytics;