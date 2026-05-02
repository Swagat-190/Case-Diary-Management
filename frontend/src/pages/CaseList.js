import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Chip, Box, Container, AppBar, Toolbar, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, IconButton, Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '15px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  '& .MuiTableHead-root': {
    background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
    '& .MuiTableCell-head': {
      color: 'white',
      fontWeight: 'bold'
    }
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    '&:hover': {
      backgroundColor: '#f5f5f5',
      transition: 'background-color 0.3s ease'
    }
  }
}));

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [newCase, setNewCase] = useState({
    firNumber: '',
    policeStation: '',
    caseType: '',
    ipcSections: '',
    accusedName: '',
    accusedPhone: '',
    caseStatus: 'OPEN',
    dateOfFir: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCases();
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

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/cases', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const handleCreateCase = async () => {
      if (user?.role !== 'SUPERVISOR') {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/cases', newCase, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDialog(false);
      setNewCase({
        firNumber: '',
        policeStation: '',
        caseType: '',
        ipcSections: '',
        caseStatus: 'OPEN',
        dateOfFir: new Date().toISOString().split('T')[0]
      });
      fetchCases();
    } catch (error) {
      console.error('Error creating case:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Case Management
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => {
              if (user?.role === 'SUPERVISOR') {
                navigate('/supervisor');
              } else {
                navigate('/cases');
              }
            }}
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            📋 Case List ({cases.length})
          </Typography>
          {user?.role === 'SUPERVISOR' && (
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ 
                background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              New Case
            </Button>
          )}
        </Box>

        {/* Create Case Dialog */}
        <Dialog open={openDialog && user?.role === 'SUPERVISOR'} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)', color: 'white', fontWeight: 'bold' }}>
            Create New Case
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="FIR Number"
              value={newCase.firNumber}
              onChange={(e) => setNewCase({ ...newCase, firNumber: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Police Station"
              value={newCase.policeStation}
              onChange={(e) => setNewCase({ ...newCase, policeStation: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Case Type</InputLabel>
              <Select
                value={newCase.caseType}
                onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
                label="Case Type"
              >
                <MenuItem value="Theft">Theft</MenuItem>
                <MenuItem value="Murder">Murder</MenuItem>
                <MenuItem value="Molestation">Molestation</MenuItem>
                <MenuItem value="Cyber Crime">Cyber Crime</MenuItem>
                <MenuItem value="Assault">Assault</MenuItem>
                <MenuItem value="Fraud">Fraud</MenuItem>
                <MenuItem value="Robbery">Robbery</MenuItem>
                <MenuItem value="Domestic Violence">Domestic Violence</MenuItem>
                <MenuItem value="Kidnapping">Kidnapping</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="IPC Sections"
              value={newCase.ipcSections}
              onChange={(e) => setNewCase({ ...newCase, ipcSections: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Accused Name"
              value={newCase.accusedName}
              onChange={(e) => setNewCase({ ...newCase, accusedName: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Accused Phone"
              value={newCase.accusedPhone}
              onChange={(e) => setNewCase({ ...newCase, accusedPhone: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={newCase.caseStatus}
                onChange={(e) => setNewCase({ ...newCase, caseStatus: e.target.value })}
                label="Status"
              >
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="UNDER_INVESTIGATION">Under Investigation</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
                <MenuItem value="CHARGE_SHEETED">Charge Sheeted</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Date of FIR"
              type="date"
              value={newCase.dateOfFir}
              onChange={(e) => setNewCase({ ...newCase, dateOfFir: e.target.value })}
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCase} 
              variant="contained"
              sx={{ background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)' }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cases Table */}
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>FIR Number</TableCell>
                <TableCell>Police Station</TableCell>
                <TableCell>Case Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date of FIR</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No cases found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell sx={{ fontWeight: '600' }}>{caseItem.firNumber}</TableCell>
                    <TableCell>{caseItem.policeStation}</TableCell>
                    <TableCell>{caseItem.caseType}</TableCell>
                    <TableCell>
                      <Chip
                        label={caseItem.caseStatus.replace(/_/g, ' ')}
                        color={getStatusColor(caseItem.caseStatus)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{new Date(caseItem.dateOfFir).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                        sx={{ 
                          borderRadius: '6px',
                          textTransform: 'none'
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Container>
    </Box>
  );
};

export default CaseList;