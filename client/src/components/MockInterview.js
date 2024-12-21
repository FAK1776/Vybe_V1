import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Slide,
  Fade,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useInterview } from '../contexts/InterviewContext';
import AudioRecorder from './AudioRecorder';
import LoadingAnimation from './LoadingAnimation';
import config from '../config';

function MockInterview() {
  const navigate = useNavigate();
  const {
    jobDescription,
    resume,
    currentQuestion,
    setCurrentQuestion,
    interviewResponses,
    setInterviewResponses,
  } = useInterview();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);

  const getNextQuestion = useCallback(async () => {
    setLoading(true);
    setLoadingMessage('Generating your next question...');
    try {
      const response = await fetch(`${config.apiUrl}/api/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          resume,
          previousResponses: interviewResponses,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentQuestion(data.question);
    } catch (error) {
      console.error('Error getting question:', error);
      setLoadingMessage('Error generating question. Please try again.');
    }
    setLoading(false);
  }, [jobDescription, resume, interviewResponses, setCurrentQuestion]);

  useEffect(() => {
    if (!jobDescription) {
      navigate('/');
      return;
    }
    getNextQuestion();
  }, [jobDescription, navigate, getNextQuestion]);

  const handleResponseComplete = async (transcript, duration) => {
    setLoading(true);
    setLoadingMessage('Analyzing your response...');
    try {
      const response = await fetch(`${config.apiUrl}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          response: transcript,
          duration,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFeedback(data.feedback);
      
      setInterviewResponses([
        ...interviewResponses,
        {
          question: currentQuestion,
          response: transcript,
          duration,
          feedback: data.feedback,
        },
      ]);
    } catch (error) {
      console.error('Error evaluating response:', error);
      setLoadingMessage('Error analyzing response. Please try again.');
    }
    setLoading(false);
  };

  const handleNext = () => {
    setFeedback(null);
    getNextQuestion();
  };

  const handleEndInterview = () => {
    setInterviewComplete(true);
  };

  const handleRetry = () => {
    setFeedback(null);
  };

  const renderFeedback = (feedbackData) => (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Feedback
        </Typography>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 1 }}>
              Strengths
            </Typography>
            <Typography>{feedbackData.strengths}</Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: 'rgba(220, 0, 78, 0.1)',
              border: '1px solid rgba(220, 0, 78, 0.2)',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: '#ff4081', mb: 1 }}>
              Areas for Improvement
            </Typography>
            <Typography>{feedbackData.weaknesses}</Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: '#4caf50', mb: 1 }}>
              Opportunities
            </Typography>
            <Typography>{feedbackData.opportunities}</Typography>
          </Paper>
        </Stack>
      </Box>
    </Fade>
  );

  if (loading) {
    return <LoadingAnimation message={loadingMessage} />;
  }

  if (interviewComplete) {
    return (
      <Fade in timeout={500}>
        <Container maxWidth="md">
          <Box sx={{ mt: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <IconButton onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4">Interview Complete</Typography>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack spacing={4}>
                {interviewResponses.map((response, index) => (
                  <Fade in timeout={500 + index * 100} key={index}>
                    <Box>
                      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                        Question {index + 1}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        {response.question}
                      </Typography>
                      {renderFeedback(response.feedback)}
                    </Box>
                  </Fade>
                ))}
                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  }}
                >
                  Start New Interview
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Container>
      </Fade>
    );
  }

  return (
    <Fade in timeout={500}>
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
              <ArrowBackIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h4" gutterBottom>
                Mock Interview
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Question {interviewResponses.length + 1}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={handleEndInterview}
              sx={{
                borderColor: '#ff4081',
                color: '#ff4081',
                '&:hover': {
                  borderColor: '#f50057',
                  backgroundColor: 'rgba(245, 0, 87, 0.08)',
                },
              }}
            >
              End Interview
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Slide direction="left" in={!feedback} mountOnEnter unmountOnExit>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Question {interviewResponses.length + 1}
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  {currentQuestion}
                </Typography>
                <AudioRecorder onComplete={handleResponseComplete} />
              </Box>
            </Slide>

            {feedback && (
              <Slide direction="left" in={!!feedback} mountOnEnter unmountOnExit>
                <Box>
                  {renderFeedback(feedback)}
                  <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={handleRetry}
                      sx={{ borderWidth: 2 }}
                    >
                      Retry Question
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      }}
                    >
                      Next Question
                    </Button>
                  </Stack>
                </Box>
              </Slide>
            )}
          </Paper>
        </Box>
      </Container>
    </Fade>
  );
}

export default MockInterview; 