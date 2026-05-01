import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Grid, Chip, Box, Container, AppBar, Toolbar,
  Button, Card, CardContent, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, TextField, IconButton, Badge
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';

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
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [evidenceEntries, setEvidenceEntries] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [ioOfficers, setIoOfficers] = useState([]);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigningCase, setAssigningCase] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [loadingIoOfficers, setLoadingIoOfficers] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchCaseDetails = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`http://localhost:8080/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCaseData(response.data);

      const diaryResponse = await axios.get(`http://localhost:8080/api/case-diary/case/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiaryEntries(diaryResponse.data);

      const evidenceResponse = await axios.get(`http://localhost:8080/api/evidence/case/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvidenceEntries(evidenceResponse.data);

      const historyResponse = await axios.get(`http://localhost:8080/api/cases/${id}/assignment-history`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: [] }));
      setAssignmentHistory(historyResponse.data || []);

    } catch (error) {
      console.error('Error fetching case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIoOfficers = async () => {
    try {
      setLoadingIoOfficers(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/supervisor/io-officers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIoOfficers(response.data || []);
    } catch (error) {
      console.error('Error fetching IO officers:', error);
      setIoOfficers([]);
    } finally {
      setLoadingIoOfficers(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchIoOfficers();
    fetchCaseDetails();
    fetchUnreadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadNotifications(response.data || 0);
    } catch (error) {
      setUnreadNotifications(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/cases/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCaseDetails();
    } catch (error) {
      console.error('Error updating case status:', error);
    }
  };

  const handleApproveEvidence = async (evidenceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/evidence/${evidenceId}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCaseDetails();
      await fetchUnreadNotifications();
    } catch (error) {
      console.error('Error approving evidence:', error);
    }
  };

  const handleOpenAssignmentDialog = async () => {
    setSelectedOfficerId(caseData?.investigationOfficer?.id || '');
    setAssignmentNotes('');
    setAssignmentError('');
    setAssignmentSuccess(false);
    if (ioOfficers.length === 0) {
      await fetchIoOfficers();
    }
    setAssignmentDialog(true);
  };

  const handleCloseAssignmentDialog = () => {
    setAssignmentDialog(false);
    setSelectedOfficerId('');
    setAssignmentNotes('');
  };

  const handleAssignOfficer = async () => {
    if (!selectedOfficerId) {
      setAssignmentError('Please select an officer');
      return;
    }

    setAssigningCase(true);
    setAssignmentError('');

    try {
      const token = localStorage.getItem('token');
      const endpoint = caseData?.investigationOfficer
        ? `http://localhost:8080/api/cases/${id}/reassign`
        : `http://localhost:8080/api/cases/${id}/assign`;

      const response = await axios.post(
        endpoint,
        {
          newOfficerId: parseInt(selectedOfficerId),
          notes: assignmentNotes || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedCase = {
        ...caseData,
        investigationOfficer: ioOfficers.find(o => o.id === parseInt(selectedOfficerId))
      };
      setCaseData(updatedCase);

      setAssignmentHistory([response.data, ...assignmentHistory]);
      await fetchCaseDetails();

      setAssignmentSuccess(true);
      setTimeout(() => {
        handleCloseAssignmentDialog();
      }, 1500);
    } catch (error) {
      setAssignmentError(error.response?.data?.message || 'Failed to assign officer');
    } finally {
      setAssigningCase(false);
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
          background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
          boxShadow: '0 4px 20px 0 rgba(195, 176, 145, 0.3)'
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
          <IconButton
            color="inherit"
            onClick={() => {
              if (user?.role === 'SUPERVISOR' || user?.role === 'ADMIN') {
                navigate('/supervisor');
              } else {
                navigate('/cases');
              }
            }}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
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
              background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#C3B091' }}>
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#C3B091' }}>
                  ⚡ Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {user?.role === 'SUPERVISOR' && (
                    <Button 
                      variant="contained" 
                      fullWidth
                      startIcon={<AssignmentIcon />}
                      sx={{ 
                        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                      onClick={handleOpenAssignmentDialog}
                    >
                      {caseData?.investigationOfficer ? 'Reassign Officer' : 'Assign Officer'}
                    </Button>
                  )}
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ 
                      background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
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
                  {user?.role === 'IO' && caseData.caseStatus === 'OPEN' && (
                    <Button 
                      variant="contained" 
                      fullWidth
                      sx={{ 
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                      onClick={() => handleStatusChange('UNDER_INVESTIGATION')}
                    >
                      Mark Under Investigation
                    </Button>
                  )}
                  {(user?.role === 'SUPERVISOR' || user?.role === 'ADMIN') && caseData.caseStatus !== 'CLOSED' && (
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

        <Dialog open={assignmentDialog} onClose={handleCloseAssignmentDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#C3B091' }}>
            {caseData?.investigationOfficer ? 'Reassign Investigation Officer' : 'Assign Investigation Officer'}
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            {assignmentError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {assignmentError}
              </Alert>
            )}
            {assignmentSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Officer assigned successfully!
              </Alert>
            )}
            {!loadingIoOfficers && ioOfficers.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No IO officers found. Create IO officers first, then assign this case.
              </Alert>
            )}

            {caseData && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#fbf7f0', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                  <strong>Case:</strong> FIR {caseData.firNumber}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#666' }}>
                  <strong>Police Station:</strong> {caseData.policeStation}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Investigation Officer</InputLabel>
              <Select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                label="Investigation Officer"
                disabled={loadingIoOfficers || ioOfficers.length === 0}
              >
                {loadingIoOfficers && (
                  <MenuItem value="" disabled>
                    Loading IO officers...
                  </MenuItem>
                )}
                {!loadingIoOfficers && ioOfficers.length === 0 && (
                  <MenuItem value="" disabled>
                    No IO officers available
                  </MenuItem>
                )}
                {ioOfficers.map((officer) => (
                  <MenuItem key={officer.id} value={officer.id}>
                    {officer.fullName || officer.username || `IO ${officer.id}`} ({officer.username || 'unknown'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Assignment Notes (Optional)"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="Add any notes about this assignment..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseAssignmentDialog} disabled={assigningCase}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignOfficer}
              variant="contained"
              disabled={assigningCase || !selectedOfficerId || loadingIoOfficers}
              sx={{
                background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
                fontWeight: 'bold'
              }}
            >
              {assigningCase ? 'Assigning...' : 'Assign Officer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Additional Details */}
        <StyledCard>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#C3B091' }}>
               Case Diary Timeline
            </Typography>
            {diaryEntries.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#666' }}>
                No diary entries yet.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {diaryEntries.map((entry) => (
                  <Grid item xs={12} key={entry.id}>
                    <Card variant="outlined" sx={{ borderRadius: '14px', borderColor: '#e6d9c7' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#A8926A' }}>
                            {entry.section}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {new Date(entry.entryDate).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#333', mb: 1 }}>
                          {entry.content}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          By {entry.officer?.fullName || entry.officer?.username || 'Unknown Officer'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#C3B091' }}>
              🎞 Evidence Log
            </Typography>
            {evidenceEntries.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#666' }}>
                No evidence uploaded yet.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {evidenceEntries.map((evidence) => {
                  const mediaUrl = evidence.downloadUrl;
                  const isImage = evidence.contentType?.startsWith('image/');
                  const isVideo = evidence.contentType?.startsWith('video/');
                  const isAudio = evidence.contentType?.startsWith('audio/');

                  return (
                    <Grid item xs={12} md={6} key={evidence.id}>
                      <Card variant="outlined" sx={{ borderRadius: '14px', borderColor: '#e6d9c7' }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#A8926A' }}>
                            {evidence.evidenceType.replace(/_/g, ' ')}
                          </Typography>
                          {evidence.status && (
                            <Box sx={{ mt: 1, mb: 1 }}>
                              <Chip
                                size="small"
                                label={evidence.status}
                                color={evidence.status === 'PENDING' ? 'warning' : 'success'}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>
                          )}
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            File: {evidence.fileName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            Uploaded: {new Date(evidence.uploadDate).toLocaleString()}
                          </Typography>
                          {evidence.description && (
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                              {evidence.description}
                            </Typography>
                          )}
                          {isImage && (
                            <Box component="img" src={mediaUrl} alt={evidence.fileName} sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: '10px', mb: 1 }} />
                          )}
                          {isVideo && (
                            <Box component="video" src={mediaUrl} controls sx={{ width: '100%', maxHeight: 240, borderRadius: '10px', mb: 1 }} />
                          )}
                          {isAudio && (
                            <Box component="audio" src={mediaUrl} controls sx={{ width: '100%', mb: 1 }} />
                          )}
                          <Button
                            variant="outlined"
                            href={mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ textTransform: 'none' }}
                          >
                            Download / Open File
                          </Button>

                          {(user?.role === 'SUPERVISOR' || user?.role === 'ADMIN') && evidence.status === 'PENDING' && (
                            <Button
                              variant="contained"
                              onClick={() => handleApproveEvidence(evidence.id)}
                              sx={{ ml: 1, textTransform: 'none' }}
                            >
                              Approve
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </StyledCard>
      </Container>
    </Box>
  );
};

export default CaseDetails;