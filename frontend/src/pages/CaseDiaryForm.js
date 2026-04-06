import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Grid, Box, AppBar, Toolbar } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';

const CaseDiaryForm = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    section: '',
    content: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/case-diary', {
        caseId: parseInt(caseId),
        ...formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Case diary entry added successfully!');
      setFormData({ section: '', content: '' });
    } catch (error) {
      console.error('Error adding diary entry:', error);
      alert('Error adding diary entry');
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
            Add Case Diary Entry
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                name="content"
                multiline
                rows={6}
                value={formData.content}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Add Diary Entry
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      </Box>
    </Box>
  );
};

export default CaseDiaryForm;