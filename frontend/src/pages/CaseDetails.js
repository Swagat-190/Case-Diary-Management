import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Grid, Chip, Box, Container, AppBar, Toolbar,
  Button, Card, CardContent, Alert
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '15px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.2)'
  }
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  borderBottom: '1px solid #eee',
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchCaseDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCaseData(response.data);
    } catch (error) {
      console.error('Error fetching case details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCaseDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const updatedCase = { ...caseData, caseStatus: newStatus };
      await axios.put(`http://localhost:8080/api/cases/${id}`, updatedCase, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCaseData(updatedCase);
    } catch (error) {
      console.error('Error updating case status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'info';
      case 'UNDER_INVESTIGATION': return 'warning';
      case 'CLOSED': return 'success';
      case 'CHARGE_SHEETED': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ color: '#666' }}>Loading case details...</Typography>
      </Box>
    );
  }

  if (!caseData) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">Case not found</Alert>
      </Box>
    );
  }

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
          <Button 
            color="inherit" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/cases')}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Case Details
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
        {/* FIR Number and Status */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {caseData.firNumber}
          </Typography>
          <Chip
            label={caseData.caseStatus.replace(/_/g, ' ')}
            color={getStatusColor(caseData.caseStatus)}
            size="medium"
            sx={{ fontWeight: 'bold', fontSize: '14px' }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#667eea' }}>
                  📋 Basic Information
                </Typography>
                <DetailRow>
                  <Typography variant="subtitle2" sx={{ color: '#666' }}>Police Station:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600' }}>{caseData.policeStation}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="subtitle2" sx={{ color: '#666' }}>Case Type:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600' }}>{caseData.caseType}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="subtitle2" sx={{ color: '#666' }}>Status:</Typography>
                  <Chip
                    label={caseData.caseStatus.replace(/_/g, ' ')}
                    color={getStatusColor(caseData.caseStatus)}
                    size="small"
                  />
                </DetailRow>
                <DetailRow>
                  <Typography variant="subtitle2" sx={{ color: '#666' }}>Date of FIR:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600' }}>
                    {new Date(caseData.dateOfFir).toLocaleDateString()}
                  </Typography>
                </DetailRow>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#667eea' }}>
                  ⚡ Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                    onClick={() => navigate(`/case-diary/${id}`)}
                  >
                    Add Diary Entry
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                    onClick={() => navigate(`/evidence/${id}`)}
                  >
                    Upload Evidence
                  </Button>
                  {(user?.role === 'IO' || user?.role === 'SUPERVISOR') && caseData.caseStatus === 'OPEN' && (
                    <Button 
                      variant="contained" 
                      fullWidth
                      sx={{ 
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                      onClick={() => handleStatusChange('CLOSED')}
                    >
                      Mark as Closed
                    </Button>
                  )}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Additional Details */}
        <StyledCard>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#667eea' }}>
              📌 Additional Details
            </Typography>
            <DetailRow>
              <Typography variant="subtitle2" sx={{ color: '#666' }}>FIR ID:</Typography>
              <Typography variant="body2" sx={{ fontWeight: '600' }}>{caseData.id}</Typography>
            </DetailRow>
            <DetailRow>
              <Typography variant="subtitle2" sx={{ color: '#666' }}>Created Date:</Typography>
              <Typography variant="body2" sx={{ fontWeight: '600' }}>
                {new Date(caseData.dateOfFir).toLocaleDateString()}
              </Typography>
            </DetailRow>
          </CardContent>
        </StyledCard>
      </Container>
    </Box>
  );
};

export default CaseDetails;