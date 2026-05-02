import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { TextField, Button, Paper, Typography, Grid, Box, AppBar, Toolbar, MenuItem } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';

const CaseDiaryForm = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    section: '',
    content: ''
  });

  const diarySections = [
    'Case Facts',
    'Witness Statement',
    'Seizure List',
    'Evidence Log',
    'Investigation Update',
    'Other'
  ];

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
            Add Case Diary Entry
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mt: 2, borderRadius: '16px' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#C3B091' }}>
            Section-wise Case Diary Entry
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
            Add a timestamped entry for facts, witnesses, seizures, evidence, or any investigation update.
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                >
                  {diarySections.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Content"
                  name="content"
                  multiline
                  rows={8}
                  value={formData.content}
                  onChange={handleChange}
                  required
                  helperText="Write the factual diary entry. The system stores the timestamp automatically."
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ background: 'linear-gradient(135deg, #C3B091 0%, #A8926A 100%)', fontWeight: 'bold' }}
                >
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