import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    openCases: 0,
    underInvestigation: 0,
    closedCases: 0
  });
  const [pendingCases, setPendingCases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [openResponse, underInvResponse, closedResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/cases/status/OPEN', config),
          axios.get('http://localhost:8080/api/cases/status/UNDER_INVESTIGATION', config),
          axios.get('http://localhost:8080/api/cases/status/CLOSED', config)
        ]);

        setStats({
          openCases: openResponse.data.length,
          underInvestigation: underInvResponse.data.length,
          closedCases: closedResponse.data.length
        });

        // Get pending cases (open + under investigation)
        setPendingCases([...openResponse.data, ...underInvResponse.data]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'UNDER_INVESTIGATION': return 'warning';
      case 'CLOSED': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px 0 rgba(102, 126, 234, 0.3)'
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
            Supervisor Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Open Cases
              </Typography>
              <Typography variant="h3" color="error">
                {stats.openCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Under Investigation
              </Typography>
              <Typography variant="h3" color="warning.main">
                {stats.underInvestigation}
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
                {stats.closedCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Pending Cases
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>FIR Number</TableCell>
              <TableCell>Police Station</TableCell>
              <TableCell>Case Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Investigation Officer</TableCell>
              <TableCell>Date of FIR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingCases.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell>{caseItem.firNumber}</TableCell>
                <TableCell>{caseItem.policeStation}</TableCell>
                <TableCell>{caseItem.caseType}</TableCell>
                <TableCell>
                  <Chip
                    label={caseItem.caseStatus.replace('_', ' ')}
                    color={getStatusColor(caseItem.caseStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{caseItem.investigationOfficer?.username || 'Not Assigned'}</TableCell>
                <TableCell>{caseItem.dateOfFir}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>
    </Box>
  );
};

export default SupervisorDashboard;