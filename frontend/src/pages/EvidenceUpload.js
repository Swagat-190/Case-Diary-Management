import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Paper, Typography, Grid, LinearProgress, Box, AppBar, Toolbar, TextField, MenuItem } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';

const EvidenceUpload = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [evidenceData, setEvidenceData] = useState({
    evidenceType: 'PHOTO',
    description: ''
  });

  const evidenceTypes = [
    { value: 'PHOTO', label: 'Photo / Image' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'AUDIO', label: 'Audio' },
    { value: 'DOCUMENT', label: 'Document' },
    { value: 'FORENSIC_REPORT', label: 'Forensic Report' }
  ];

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    setEvidenceData({ ...evidenceData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('caseId', caseId);
    formData.append('evidenceType', evidenceData.evidenceType);
    formData.append('description', evidenceData.description);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/evidence/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Evidence uploaded successfully!');
      setSelectedFile(null);
      setEvidenceData({ evidenceType: 'PHOTO', description: '' });
    } catch (error) {
      console.error('Error uploading evidence:', error);
      alert('Error uploading evidence');
    } finally {
      setUploading(false);
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
            Upload Evidence
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <input
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                style={{ display: 'none' }}
                id="evidence-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="evidence-file">
                <Button variant="outlined" component="span" fullWidth>
                  Choose File
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Evidence Type"
                name="evidenceType"
                value={evidenceData.evidenceType}
                onChange={handleInputChange}
              >
                {evidenceTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                placeholder="Description"
                value={evidenceData.description}
                onChange={handleInputChange}
                label="Description"
              />
            </Grid>
            <Grid item xs={12}>
              {uploading && <LinearProgress />}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Upload Evidence'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      </Box>
    </Box>
  );
};

export default EvidenceUpload;