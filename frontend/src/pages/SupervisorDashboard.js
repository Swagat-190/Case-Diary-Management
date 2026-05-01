import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, AppBar, Toolbar, Button, TextField, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, IconButton, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    openCases: 0,
    underInvestigation: 0,
    closedCases: 0
  });
  const [pendingCases, setPendingCases] = useState([]);
  const [pendencyAlerts, setPendencyAlerts] = useState([]);
  const [creatingIo, setCreatingIo] = useState(false);
  const [ioForm, setIoForm] = useState({
    fullName: '',
    batch: '',
    email: '',
    phoneNumber: '',
    policeStation: '',
    designation: ''
  });
  const [ioAccount, setIoAccount] = useState(null);
  const [ioError, setIoError] = useState('');
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [selectedCaseForAssignment, setSelectedCaseForAssignment] = useState(null);
  const [ioOfficers, setIoOfficers] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigningCase, setAssigningCase] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [casesResponse, alertsResponse, ioResponse] = await Promise.all([
      axios.get('http://localhost:8080/api/cases', config),
      axios.get('http://localhost:8080/api/supervisor/pendency-alerts', config),
      axios.get('http://localhost:8080/api/supervisor/io-officers', config).catch(() => ({ data: [] }))
    ]);

    const allCases = casesResponse.data || [];
    const openCases = allCases.filter((caseItem) => caseItem.caseStatus === 'OPEN');
    const underInvestigationCases = allCases.filter((caseItem) => caseItem.caseStatus === 'UNDER_INVESTIGATION');
    const closedCases = allCases.filter((caseItem) => caseItem.caseStatus === 'CLOSED');
    const assignedCases = allCases.filter((caseItem) => caseItem.investigationOfficer);

    setStats({
      openCases: openCases.length,
      underInvestigation: underInvestigationCases.length,
      closedCases: closedCases.length
    });
    setPendingCases(assignedCases);
    setPendencyAlerts(alertsResponse.data);
    setIoOfficers(ioResponse.data || []);
  };

  useEffect(() => {
    fetchDashboardData().catch((error) => {
      console.error('Error fetching dashboard data:', error);
    });
    fetchUnreadNotifications();
  }, []);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'UNDER_INVESTIGATION': return 'warning';
      case 'CLOSED': return 'success';
      default: return 'default';
    }
  };

  const getAssignedOfficerLabel = (caseItem) => {
    const officer = caseItem?.investigationOfficer;

    if (!officer) {
      return 'To be assigned';
    }

    return officer.fullName || officer.username || 'To be assigned';
  };

  const handleIoFormChange = (event) => {
    setIoForm({ ...ioForm, [event.target.name]: event.target.value });
  };

  const handleCreateIoOfficer = async (event) => {
    event.preventDefault();
    setCreatingIo(true);
    setIoError('');
    setIoAccount(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/api/supervisor/io-officers',
        ioForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchDashboardData();

      setIoAccount(response.data);
      setIoForm({
        fullName: '',
        batch: '',
        email: '',
        phoneNumber: '',
        policeStation: '',
        designation: ''
      });
    } catch (error) {
      setIoError(error.response?.data?.message || 'Failed to create IO officer');
    } finally {
      setCreatingIo(false);
    }
  };

  const handleOpenAssignmentDialog = (caseItem) => {
    setSelectedCaseForAssignment(caseItem);
    setSelectedOfficerId(caseItem.investigationOfficer?.id || '');
    setAssignmentNotes('');
    setAssignmentError('');
    setAssignmentSuccess(false);
    setAssignmentDialog(true);
  };

  const handleCloseAssignmentDialog = () => {
    setAssignmentDialog(false);
    setSelectedCaseForAssignment(null);
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
      const endpoint = selectedCaseForAssignment.investigationOfficer ? 
        `http://localhost:8080/api/cases/${selectedCaseForAssignment.id}/reassign` :
        `http://localhost:8080/api/cases/${selectedCaseForAssignment.id}/assign`;

      await axios.post(
        endpoint,
        {
          newOfficerId: parseInt(selectedOfficerId),
          notes: assignmentNotes || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchDashboardData();

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
            Supervisor Dashboard
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Card sx={{ mb: 4, borderRadius: '16px' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#C3B091' }}>
              Create IO Officer
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Enter the officer details below. The system will create the account and generate login credentials for sharing.
            </Typography>

            {ioError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {ioError}
              </Alert>
            )}

            {ioAccount && (
              <Alert severity="success" sx={{ mb: 2 }}>
                IO officer created. Username: {ioAccount.username} | Temporary password: {ioAccount.temporaryPassword}
              </Alert>
            )}

            <Box component="form" onSubmit={handleCreateIoOfficer}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="fullName"
                    value={ioForm.fullName}
                    onChange={handleIoFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Batch"
                    name="batch"
                    value={ioForm.batch}
                    onChange={handleIoFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={ioForm.email}
                    onChange={handleIoFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={ioForm.phoneNumber}
                    onChange={handleIoFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Police Station"
                    name="policeStation"
                    value={ioForm.policeStation}
                    onChange={handleIoFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    name="designation"
                    value={ioForm.designation}
                    onChange={handleIoFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={creatingIo}
                    sx={{
                      background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
                      fontWeight: 'bold',
                      px: 4
                    }}
                  >
                    {creatingIo ? 'Creating...' : 'Create IO Account'}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {ioAccount && (
              <Card sx={{ mt: 3, backgroundColor: '#fbf7f0', border: '1px solid #e6d9c7' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Shared Credentials
                  </Typography>
                  <Typography variant="body2">Username: {ioAccount.username}</Typography>
                  <Typography variant="body2">Temporary Password: {ioAccount.temporaryPassword}</Typography>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 4, borderRadius: '16px' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#C3B091' }}>
              Diary Pendency Alerts
            </Typography>
            {pendencyAlerts.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#666' }}>
                No delayed diaries at the moment.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {pendencyAlerts.map((alert) => (
                  <Grid item xs={12} md={6} key={alert.caseId}>
                    <Card variant="outlined" sx={{ borderRadius: '14px', borderColor: '#e6d9c7' }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          FIR {alert.firNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Police Station: {alert.policeStation}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Days since last entry: {alert.daysSinceLastDiaryEntry}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Last entry: {new Date(alert.lastDiaryEntryDate).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

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
        Assigned Cases
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>FIR Number</TableCell>
              <TableCell>Police Station</TableCell>
              <TableCell>Case Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned Officer</TableCell>
              <TableCell>Date of FIR</TableCell>
              <TableCell>Actions</TableCell>
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
                <TableCell>{getAssignedOfficerLabel(caseItem)}</TableCell>
                <TableCell>{caseItem.dateOfFir}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AssignmentIcon />}
                    onClick={() => handleOpenAssignmentDialog(caseItem)}
                    sx={{
                      background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
                      fontWeight: 'bold',
                      textTransform: 'none'
                    }}
                  >
                    Assign Officer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog} onClose={handleCloseAssignmentDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#C3B091' }}>
          Assign Investigation Officer
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
          
          {selectedCaseForAssignment && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#fbf7f0', borderRadius: '8px' }}>
              <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                <strong>Case:</strong> FIR {selectedCaseForAssignment.firNumber}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#666' }}>
                <strong>Police Station:</strong> {selectedCaseForAssignment.policeStation}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Investigation Officer</InputLabel>
            <Select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              label="Investigation Officer"
            >
              {ioOfficers.map((officer) => (
                <MenuItem key={officer.id} value={officer.id}>
                  {officer.fullName} ({officer.username})
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
            disabled={assigningCase || !selectedOfficerId}
            sx={{
              background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
              fontWeight: 'bold'
            }}
          >
            {assigningCase ? 'Assigning...' : 'Assign Officer'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default SupervisorDashboard;