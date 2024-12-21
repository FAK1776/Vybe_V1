import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeResume(req, res) {
  const { jobDescription, resume } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert hiring manager. Analyze the resume against the job description and provide feedback in JSON format with strengths, weaknesses, and opportunities."
        },
        {
          role: "user",
          content: `Job Description: ${jobDescription}\n\nResume: ${resume}`
        }
      ],
    });

    const feedback = JSON.parse(completion.choices[0].message.content);
    res.json({ feedback });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Error analyzing resume' });
  }
}

export async function generateQuestion(req, res) {
  const { jobDescription, resume, previousResponses } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer. Generate a relevant interview question based on the job description and previous responses. Focus on behavioral and technical questions that assess the candidate's fit for the role."
        },
        {
          role: "user",
          content: `Job Description: ${jobDescription}\nPrevious Questions and Responses: ${JSON.stringify(previousResponses)}\nResume (if provided): ${resume || 'Not provided'}`
        }
      ],
    });

    const question = completion.choices[0].message.content;
    res.json({ question });
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ error: 'Error generating question' });
  }
}

export async function evaluateResponse(req, res) {
  const { question, response, duration, jobDescription } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer. Evaluate the candidate's response and provide feedback in JSON format with strengths, weaknesses, and opportunities. Consider both the content and the duration of the response."
        },
        {
          role: "user",
          content: `
Question: ${question}
Candidate's Response: ${response}
Response Duration: ${duration} seconds
Job Description: ${jobDescription}

Please evaluate the response considering:
1. Content relevance and completeness
2. Structure and clarity
3. Response duration appropriateness
4. Alignment with job requirements
`
        }
      ],
    });

    const feedback = JSON.parse(completion.choices[0].message.content);
    res.json({ feedback });
  } catch (error) {
    console.error('Error evaluating response:', error);
    res.status(500).json({ error: 'Error evaluating response' });
  }
} 