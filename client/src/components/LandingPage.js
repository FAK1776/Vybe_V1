import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  Fade,
} from '@mui/material';
import { useInterview } from '../contexts/InterviewContext';

function LandingPage() {
  const navigate = useNavigate();
  const { setJobDescription, setResume } = useInterview();
  const [jobDescInput, setJobDescInput] = useState('');
  const [resumeInput, setResumeInput] = useState('');
  const [activeSection, setActiveSection] = useState(null);

  const handleAction = (action) => {
    setJobDescription(jobDescInput);
    setResume(resumeInput);
    navigate(action === 'evaluate' ? '/evaluation' : '/interview');
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 8 }}>
      <Stack spacing={8} alignItems="center">
        {/* Hero Section */}
        <Box textAlign="center">
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ace Your Next Interview
          </Typography>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: 'text.secondary',
              fontWeight: 400 
            }}
          >
            AI-powered interview preparation that adapts to you
          </Typography>
        </Box>

        {/* Document Input Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            width: '100%',
            maxWidth: 800,
            p: 4,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Stack spacing={4}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Paste Job Description"
              placeholder="Paste the job description you want to prepare for..."
              value={jobDescInput}
              onChange={(e) => setJobDescInput(e.target.value)}
              onClick={() => setActiveSection('job')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  transition: 'transform 0.2s',
                  transform: activeSection === 'job' ? 'scale(1.02)' : 'scale(1)',
                }
              }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Paste Your Resume (Optional)"
              placeholder="Paste your resume to get personalized feedback..."
              value={resumeInput}
              onChange={(e) => setResumeInput(e.target.value)}
              onClick={() => setActiveSection('resume')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  transition: 'transform 0.2s',
                  transform: activeSection === 'resume' ? 'scale(1.02)' : 'scale(1)',
                }
              }}
            />
          </Stack>
        </Paper>

        {/* Action Buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ width: '100%', maxWidth: 800 }}
        >
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!jobDescInput}
            onClick={() => handleAction('evaluate')}
            sx={{
              py: 2,
              borderRadius: 3,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            }}
          >
            Evaluate Fit
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            disabled={!jobDescInput}
            onClick={() => handleAction('practice')}
            sx={{
              py: 2,
              borderRadius: 3,
              fontSize: '1.1rem',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              }
            }}
          >
            Practice Interview
          </Button>
        </Stack>

        {/* Features Section */}
        <Box sx={{ width: '100%', maxWidth: 800 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
            What you'll get:
          </Typography>
          <Stack spacing={2}>
            {[
              'AI-powered analysis of your fit for the role',
              'Personalized interview questions based on the job description',
              'Real-time feedback on your responses',
              'Detailed strengths and improvement areas',
            ].map((feature, index) => (
              <Fade in timeout={500 + index * 100} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Typography>{feature}</Typography>
                </Paper>
              </Fade>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

export default LandingPage; 