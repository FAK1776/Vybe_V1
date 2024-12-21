import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../contexts/InterviewContext';

const EvaluationPage = () => {
  const navigate = useNavigate();
  const { jobDescription, resume } = useInterview();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const truncateText = (text, maxLength = 2000) => {
    if (!text) return '';
    return text.substring(0, maxLength);
  };

  const evaluateFit = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Truncate and encode the data
      const truncatedJobDesc = truncateText(jobDescription);
      const truncatedResume = truncateText(resume);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: truncatedJobDesc,
          resume: truncatedResume,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('No data received from the server');
      }

      setEvaluation(data);
    } catch (error) {
      console.error('Error evaluating fit:', error);
      setError(
        error.message || 
        'Failed to evaluate job fit. Please try with a shorter job description and resume.'
      );
    } finally {
      setLoading(false);
    }
  }, [jobDescription, resume]);

  useEffect(() => {
    if (!jobDescription || !resume) {
      navigate('/');
      return;
    }
    evaluateFit();
  }, [jobDescription, resume, navigate, evaluateFit]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Job Fit Evaluation
        </Typography>
        {error ? (
          <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography color="error">
              {error}
            </Typography>
          </Paper>
        ) : evaluation ? (
          <Box sx={{ mt: 3 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Match Score
              </Typography>
              <Typography variant="body1" paragraph>
                {evaluation.matchScore}%
              </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Key Strengths
              </Typography>
              <Typography variant="body1" paragraph>
                {evaluation.strengths}
              </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Areas for Development
              </Typography>
              <Typography variant="body1" paragraph>
                {evaluation.areasForDevelopment}
              </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Recommendations
              </Typography>
              <Typography variant="body1" paragraph>
                {evaluation.recommendations}
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography color="error">
              Failed to load evaluation. Please try again.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default EvaluationPage; 