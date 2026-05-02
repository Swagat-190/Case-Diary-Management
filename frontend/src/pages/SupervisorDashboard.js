import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Box, AppBar,
  Toolbar, Button, TextField, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl,
  InputLabel, IconButton, Badge
} from '@mui/material';
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
  const [ioSuccessMessage, setIoSuccessMessage] = useState('');

  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [selectedCaseForAssignment, setSelectedCaseForAssignment] = useState(null);
  const [ioOfficers, setIoOfficers] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigningCase, setAssigningCase] = useState(false);

  // ✅ FIXED STATES
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Filter states
  const [policeStationFilter, setPoliceStationFilter] = useState('');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState('');
  const [ioFilter, setIoFilter] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    if (!user || user.role !== 'SUPERVISOR') {
      navigate('/');
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [casesResponse, alertsResponse, ioResponse] = await Promise.all([
      axios.get('http://localhost:8080/api/cases', config),
      axios.get('http://localhost:8080/api/supervisor/pendency-alerts', config),
      axios.get('http://localhost:8080/api/supervisor/io-officers', config).catch(() => ({ data: [] }))
    ]);

    const allCases = casesResponse.data || [];

    setStats({
      openCases: allCases.filter(c => c.caseStatus === 'OPEN').length,
      underInvestigation: allCases.filter(c => c.caseStatus === 'UNDER_INVESTIGATION').length,
      closedCases: allCases.filter(c => c.caseStatus === 'CLOSED').length
    });

    setPendingCases(allCases.filter(c => c.investigationOfficer));
    setPendencyAlerts(alertsResponse.data);
    setIoOfficers(ioResponse.data || []);
  };

  useEffect(() => {
    fetchDashboardData().catch(console.error);
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8080/api/notifications/unread-count',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadNotifications(response.data || 0);
    } catch {
      setUnreadNotifications(0);
    }
  };

  // Get unique values for filters
  const getUniquePoliceStations = () => {
    const stations = pendingCases.map(c => c.policeStation).filter(Boolean);
    return [...new Set(stations)].sort();
  };

  const getUniqueCrimeTypes = () => {
    const types = pendingCases.map(c => c.caseType).filter(Boolean);
    return [...new Set(types)].sort();
  };

  const getUniqueIOs = () => {
    const ios = pendingCases
      .filter(c => c.investigationOfficer)
      .map(c => c.investigationOfficer);
    const uniqueIos = [];
    const seen = new Set();
    ios.forEach(io => {
      if (io && io.id && !seen.has(io.id)) {
        seen.add(io.id);
        uniqueIos.push(io);
      }
    });
    return uniqueIos.sort((a, b) => a.fullName.localeCompare(b.fullName));
  };

  // Apply filters to pending cases
  const getFilteredCases = () => {
    return pendingCases.filter(caseItem => {
      const policeStationMatch = !policeStationFilter || caseItem.policeStation === policeStationFilter;
      const crimeTypeMatch = !crimeTypeFilter || caseItem.caseType === crimeTypeFilter;
      const ioMatch = !ioFilter || caseItem.investigationOfficer?.id === parseInt(ioFilter);
      return policeStationMatch && crimeTypeMatch && ioMatch;
    });
  };

  const handleIoFormChange = (e) => {
    setIoForm({ ...ioForm, [e.target.name]: e.target.value });
  };

  const handleCreateIoOfficer = async (e) => {
    e.preventDefault();
    setCreatingIo(true);
    setIoError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/supervisor/io-officers',
        ioForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchDashboardData();

      setIoSuccessMessage(`IO created. Credentials sent to ${ioForm.email}`);
      setIoForm({
        fullName: '', batch: '', email: '',
        phoneNumber: '', policeStation: '', designation: ''
      });

    } catch (error) {
      setIoError(error.response?.data?.message || 'Failed to create IO');
    } finally {
      setCreatingIo(false);
    }
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

      await axios.post(
        `http://localhost:8080/api/cases/${selectedCaseForAssignment.id}/assign`,
        {
          newOfficerId: parseInt(selectedOfficerId),
          notes: assignmentNotes || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchDashboardData();

      setAssignmentSuccess(true);
      setTimeout(() => setAssignmentDialog(false), 1500);

    } catch (error) {
      setAssignmentError(error.response?.data?.message || 'Failed to assign');
    } finally {
      setAssigningCase(false);
    }
  };

  const handleOpenChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setChangePasswordOpen(true);
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitPasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordSuccess('Password changed successfully');
      setChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }}>Supervisor Dashboard</Typography>

          {/* ✅ FIXED NOTIFICATION */}
          <IconButton color="inherit">
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            color="inherit"
            onClick={handleOpenChangePassword}
            sx={{ textTransform: 'none' }}
          >
            Change Password
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Open Cases</Typography>
                <Typography variant="h4">{stats.openCases}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Under Investigation</Typography>
                <Typography variant="h4">{stats.underInvestigation}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Closed Cases</Typography>
                <Typography variant="h4">{stats.closedCases}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Create IO Officer Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Create IO Officer</Typography>
            {ioError && <Alert severity="error" sx={{ mb: 2 }}>{ioError}</Alert>}
            {ioSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{ioSuccessMessage}</Alert>}
            <form onSubmit={handleCreateIoOfficer}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
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
                  <Button type="submit" variant="contained" disabled={creatingIo}>
                    {creatingIo ? 'Creating...' : 'Create IO Officer'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Pending Cases Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Pending Cases</Typography>
            
            {/* Filter Section */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Filters</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Police Station</InputLabel>
                    <Select
                      value={policeStationFilter}
                      label="Police Station"
                      onChange={(e) => setPoliceStationFilter(e.target.value)}
                    >
                      <MenuItem value="">All Police Stations</MenuItem>
                      {getUniquePoliceStations().map((station) => (
                        <MenuItem key={station} value={station}>{station}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Crime Type</InputLabel>
                    <Select
                      value={crimeTypeFilter}
                      label="Crime Type"
                      onChange={(e) => setCrimeTypeFilter(e.target.value)}
                    >
                      <MenuItem value="">All Crime Types</MenuItem>
                      {getUniqueCrimeTypes().map((crimeType) => (
                        <MenuItem key={crimeType} value={crimeType}>{crimeType}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Investigation Officer</InputLabel>
                    <Select
                      value={ioFilter}
                      label="Investigation Officer"
                      onChange={(e) => setIoFilter(e.target.value)}
                    >
                      <MenuItem value="">All Officers</MenuItem>
                      {getUniqueIOs().map((io) => (
                        <MenuItem key={io.id} value={io.id}>{io.fullName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setPoliceStationFilter('');
                      setCrimeTypeFilter('');
                      setIoFilter('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>FIR Number</TableCell>
                    <TableCell>Police Station</TableCell>
                    <TableCell>Crime Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned Officer</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredCases().length > 0 ? (
                    getFilteredCases().map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell>{caseItem.firNumber}</TableCell>
                        <TableCell>{caseItem.policeStation}</TableCell>
                        <TableCell>{caseItem.caseType}</TableCell>
                        <TableCell>
                          <Chip
                            label={caseItem.caseStatus}
                            color={caseItem.caseStatus === 'OPEN' ? 'warning' : 'info'}
                          />
                        </TableCell>
                        <TableCell>{caseItem.investigationOfficer?.fullName || 'Not Assigned'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedCaseForAssignment(caseItem);
                              setAssignmentDialog(true);
                            }}
                          >
                            Reassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          No cases match the selected filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog} onClose={() => setAssignmentDialog(false)}>
        <DialogTitle>Assign Officer to Case {selectedCaseForAssignment?.firNumber}</DialogTitle>
        <DialogContent>
          {/* ✅ FIXED ERROR DISPLAY */}
          {assignmentError && <Alert severity="error" sx={{ mb: 2 }}>{assignmentError}</Alert>}
          {assignmentSuccess && <Alert severity="success" sx={{ mb: 2 }}>Assigned successfully</Alert>}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Officer</InputLabel>
            <Select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
            >
              {ioOfficers.map((officer) => (
                <MenuItem key={officer.id} value={officer.id}>
                  {officer.fullName} - {officer.designation}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Assignment Notes"
            multiline
            rows={3}
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignOfficer} disabled={assigningCase}>
            {assigningCase ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordInputChange}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSubmitPasswordChange} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupervisorDashboard;