import React, { useState } from 'react';
import { 
  TextField, Button, Typography, Box, Alert, FormControl, InputLabel, 
  Select, MenuItem, Container, Card, Tab, Tabs 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: '15px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  padding: theme.spacing(3),
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    }
  }
}));

const Login = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'SUPERVISOR',
    policeStation: '',
    designation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
    if (newValue === 1) {
      setFormData({
        username: '',
        password: '',
        email: '',
        role: 'SUPERVISOR',
        policeStation: '',
        designation: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const isLogin = tabValue === 0;
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      const response = await axios.post(`http://localhost:8080${endpoint}`, formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (isLogin) {
        navigate('/');
      } else {
        setSuccess('Registration successful! You are now logged in.');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || (tabValue === 0 ? 'Invalid username or password' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
        padding: '20px'
      }}
    >
      <Container maxWidth="sm">
        <FormCard>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Case Diary System
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#666',
                fontWeight: '500'
              }}
            >
              Odisha Police Digital Case Management
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ 
              mb: 3, 
              borderBottom: '1px solid #eee',
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)'
              }
            }}
          >
            <Tab label="Login" sx={{ fontWeight: 'bold' }} />
            <Tab label="Register" sx={{ fontWeight: 'bold' }} />
          </Tabs>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              size="small"
            />

            {tabValue === 1 && (
              <>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Police Station"
                  name="policeStation"
                  value={formData.policeStation}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  size="small"
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2,
                background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A8926A 0%, #C3B091 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(195, 176, 145, 0.35)'
                }
              }}
            >
              {loading ? 'Processing...' : (tabValue === 0 ? 'Login' : 'Register')}
            </Button>
          </form>

        </FormCard>
      </Container>
    </Box>
  );
};

export default Login;