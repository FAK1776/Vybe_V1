import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import { useInterview } from '../contexts/InterviewContext';

function JobInput() {
  const navigate = useNavigate();
  const { 
    setJobDescription, 
    setResume, 
    setAnalysis 
  } = useInterview();
  const [jobDescInput, setJobDescInput] = useState('');
  const [resumeInput, setResumeInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setJobDescription(jobDescInput);
    setResume(resumeInput);

    try {
      // Call API to analyze resume against job description
      if (resumeInput) {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobDescription: jobDescInput,
            resume: resumeInput,
          }),
        });
        
        const data = await response.json();
        setAnalysis(data);
      }
      
      navigate('/interview');
    } catch (error) {
      console.error('Error analyzing inputs:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Interview Preparation Assistant
        </Typography>
        
        <Paper sx={{ p: 3, mt: 2 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Job Description"
              required
              value={jobDescInput}
              onChange={(e) => setJobDescInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Resume (Optional)"
              value={resumeInput}
              onChange={(e) => setResumeInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Button 
              variant="contained" 
              type="submit" 
              size="large"
            >
              Start Interview Prep
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default JobInput; 