import { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Alert, LinearProgress } from '@mui/material';
import { useInterview } from '../contexts/InterviewContext';

function AudioRecorder({ onComplete }) {
  const { isRecording, setIsRecording } = useInterview();
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Initialize audio context for visualization
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    } catch (err) {
      console.error('Error initializing audio context:', err);
      setError('Error initializing audio. Please try again.');
    }

    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    audioChunksRef.current = [];
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume level (0-100)
    const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
    setAudioLevel((average / 255) * 100);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const convertToText = async (audioBlob) => {
    try {
      // First, convert audio to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;
      
      // Send base64 audio to backend
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio.split(',')[1] // Remove data URL prefix
        })
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const { text } = await response.json();
      return text;
    } catch (err) {
      console.error('Error converting audio to text:', err);
      throw err;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      setTimer(0);
      
      // Get audio stream with noise reduction
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;

      // Set up audio visualization
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      updateAudioLevel();

      // Create MediaRecorder with MP3 encoding if available
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          // Convert audio to text
          const text = await convertToText(audioBlob);
          
          if (text?.trim()) {
            onComplete(text, timer);
          } else {
            setError('No speech was detected. Please try again.');
          }
        } catch (err) {
          console.error('Error processing audio:', err);
          setError('Error processing audio. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone was found. Please connect a microphone and try again.');
      } else {
        setError('Error starting recording. Please try again.');
      }
      cleanup();
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      cleanup();
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Error stopping recording. Please try again.');
      cleanup();
    }
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {isProcessing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Processing your response...
        </Alert>
      )}
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </Typography>

      {isRecording && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Audio Level:
          </Typography>
          <LinearProgress
            variant="determinate"
            value={audioLevel}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: audioLevel > 75 ? '#f44336' : audioLevel > 50 ? '#fb8c00' : '#4caf50',
                borderRadius: 5,
              },
            }}
          />
          <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
            Recording... (Speak clearly into your microphone)
          </Typography>
        </Box>
      )}
      
      <Button
        variant="contained"
        color={isRecording ? "error" : "primary"}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing || (!!error && !isRecording)}
        sx={{
          background: isRecording 
            ? 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)'
            : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
    </Box>
  );
}

export default AudioRecorder; 