import React, { useEffect, useState } from 'react';
import { 
  Grid, Card, CardContent, Typography, Button, Box, Container, 
  AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon,
  ListItemText, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';

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

const StatCard = styled(StyledCard)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${color}0a 0%, ${color}15 100%)`,
  borderLeft: `5px solid ${color}`,
  '& .stat-number': {
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold'
  }
}));

const Dashboard = () => {
  const [stats, setStats] = useState({ openCases: 0, closedCases: 0, totalCases: 0 });
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const casesResponse = await axios.get('http://localhost:8080/api/cases', config);
      const allCases = casesResponse.data;
      
      const openCases = allCases.filter(c => c.caseStatus === 'OPEN').length;
      const closedCases = allCases.filter(c => c.caseStatus === 'CLOSED').length;

      setStats({
        openCases,
        closedCases,
        totalCases: allCases.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { label: 'Cases', icon: <FolderIcon />, path: '/cases' },
    { label: 'Case Diary', icon: <AssignmentIcon />, path: '/case-diary/1' },
    { label: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' }
  ];

  if (user?.role === 'SUPERVISOR') {
    menuItems.push({ label: 'Supervisor Dashboard', icon: <PeopleIcon />, path: '/supervisor' });
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px 0 rgba(102, 126, 234, 0.3)'
        }}
      >
        <Toolbar>
          <Button 
            color="inherit" 
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Case Diary System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{user?.username}</Typography>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ px: 2, mb: 2, fontWeight: 'bold', color: '#667eea' }}
          >
            Navigation
          </Typography>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f0f0f0'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#667eea' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: 8,
          width: '100%'
        }}
      >
        <Container maxWidth="lg">
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome, {user?.username}!
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Here's your case management overview
            </Typography>
          </Box>

          {/* Statistics Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard color="#667eea">
                <CardContent>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                      Total Cases
                    </Typography>
                    <Typography variant="h3" className="stat-number">
                      {stats.totalCases}
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard color="#f093fb">
                <CardContent>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                      Open Cases
                    </Typography>
                    <Typography variant="h3" className="stat-number">
                      {stats.openCases}
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard color="#4facfe">
                <CardContent>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                      Closed Cases
                    </Typography>
                    <Typography variant="h3" className="stat-number">
                      {stats.closedCases}
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;