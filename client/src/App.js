import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import LandingPage from './components/LandingPage';
import MockInterview from './components/MockInterview';
import EvaluationPage from './components/EvaluationPage';
import { InterviewProvider } from './contexts/InterviewContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <InterviewProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/interview" element={<MockInterview />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
          </Routes>
        </Router>
      </InterviewProvider>
    </ThemeProvider>
  );
}

export default App; 