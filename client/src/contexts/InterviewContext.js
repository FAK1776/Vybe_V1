import { createContext, useContext, useState } from 'react';

const InterviewContext = createContext();

export function InterviewProvider({ children }) {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewResponses, setInterviewResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const value = {
    jobDescription,
    setJobDescription,
    resume,
    setResume,
    analysis,
    setAnalysis,
    currentQuestion,
    setCurrentQuestion,
    interviewResponses,
    setInterviewResponses,
    isRecording,
    setIsRecording,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
} 