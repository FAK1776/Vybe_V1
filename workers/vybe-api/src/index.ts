/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { OpenAI } from 'openai';

interface Env {
	OPENAI_API_KEY: string;
}

// Enhanced logging with request details
function logRequest(request: Request, response: Response, startTime: number, extraData: any = {}) {
	const duration = Date.now() - startTime;
	const logData = {
		timestamp: new Date().toISOString(),
		method: request.method,
		url: request.url,
		path: new URL(request.url).pathname,
		status: response.status,
		duration: duration,
		userAgent: request.headers.get('user-agent') || 'unknown',
		contentType: request.headers.get('content-type'),
		...extraData
	};
	console.log(JSON.stringify(logData));
}

// Error tracking function
function trackError(error: any, request: Request, context: string) {
	const errorData = {
		timestamp: new Date().toISOString(),
		type: 'error',
		context: context,
		error: {
			message: error.message,
			stack: error.stack,
			name: error.name
		},
		request: {
			url: request.url,
			method: request.method,
			headers: Object.fromEntries(request.headers)
		}
	};
	console.error(JSON.stringify(errorData));
}

// Health metrics
const metrics = {
	totalRequests: 0,
	successfulRequests: 0,
	failedRequests: 0,
	averageResponseTime: 0,
	totalResponseTime: 0
};

function updateMetrics(duration: number, isSuccess: boolean) {
	metrics.totalRequests++;
	if (isSuccess) {
		metrics.successfulRequests++;
	} else {
		metrics.failedRequests++;
	}
	metrics.totalResponseTime += duration;
	metrics.averageResponseTime = metrics.totalResponseTime / metrics.totalRequests;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const startTime = Date.now();
		
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		try {
			// Handle CORS preflight
			if (request.method === 'OPTIONS') {
				const response = new Response(null, { headers: corsHeaders });
				logRequest(request, response, startTime);
				return response;
			}

			const url = new URL(request.url);

			// Health check endpoint
			if (url.pathname === '/health') {
				const healthData = {
					status: 'healthy',
					uptime: process.uptime(),
					metrics: metrics
				};
				const response = new Response(JSON.stringify(healthData), {
					headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
				logRequest(request, response, startTime, { type: 'health_check' });
				return response;
			}

			const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

			if (url.pathname === '/api/question') {
				if (request.method !== 'POST') {
					const response = new Response('Method not allowed', { status: 405 });
					logRequest(request, response, startTime, { error: 'method_not_allowed' });
					updateMetrics(Date.now() - startTime, false);
					return response;
				}

				const { jobDescription, resume, previousResponses } = await request.json();
				
				console.log('Generating question for job description:', jobDescription.substring(0, 100));
				
				const systemPrompt = resume 
					? "You are an expert interviewer. Generate ONE relevant interview question based on both the job description and the candidate's resume. The question should be specific and focused on evaluating the candidate's fit for this role."
					: "You are an expert interviewer. Generate ONE relevant interview question based solely on the job description. Do not make any assumptions about the candidate's experience. Focus on understanding their potential fit for the role requirements.";

				const userPrompt = resume
					? `Job Description: ${jobDescription}\nResume: ${resume}\nPrevious Questions: ${JSON.stringify(previousResponses)}`
					: `Job Description: ${jobDescription}\nPrevious Questions: ${JSON.stringify(previousResponses)}`;
				
				const response = await openai.chat.completions.create({
					model: "gpt-4",
					messages: [
						{
							role: "system",
							content: systemPrompt
						},
						{
							role: "user",
							content: userPrompt
						}
					]
				});

				const apiResponse = new Response(JSON.stringify({ 
					question: response.choices[0].message.content 
				}), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
				
				logRequest(request, apiResponse, startTime, { 
					type: 'question_generation',
					jobDescriptionLength: jobDescription.length,
					resumeLength: resume?.length || 0,
					previousQuestionsCount: previousResponses.length
				});
				updateMetrics(Date.now() - startTime, true);
				return apiResponse;
			}

			if (url.pathname === '/api/evaluate') {
				if (request.method !== 'POST') {
					const response = new Response('Method not allowed', { status: 405 });
					logRequest(request, response, startTime, { error: 'method_not_allowed' });
					updateMetrics(Date.now() - startTime, false);
					return response;
				}

				const { question, response: answer, duration, jobDescription } = await request.json();
				
				console.log('Evaluating response for question:', question.substring(0, 100));
				
				const evaluation = await openai.chat.completions.create({
					model: "gpt-4",
					messages: [
						{
							role: "system",
							content: "You are an expert interviewer. Evaluate the candidate's response to the interview question."
						},
						{
							role: "user",
							content: `Question: ${question}\nResponse: ${answer}\nDuration: ${duration} seconds\nJob Description: ${jobDescription}`
						}
					]
				});

				const apiResponse = new Response(JSON.stringify({ 
					feedback: {
						strengths: evaluation.choices[0].message.content.split('\n')[0],
						weaknesses: evaluation.choices[0].message.content.split('\n')[1],
						opportunities: evaluation.choices[0].message.content.split('\n')[2]
					}
				}), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
				
				logRequest(request, apiResponse, startTime, {
					type: 'response_evaluation',
					questionLength: question.length,
					answerLength: answer.length,
					responseDuration: duration
				});
				updateMetrics(Date.now() - startTime, true);
				return apiResponse;
			}

			if (url.pathname === '/api/transcribe') {
				if (request.method !== 'POST') {
					const response = new Response('Method not allowed', { status: 405 });
					logRequest(request, response, startTime, { error: 'method_not_allowed' });
					updateMetrics(Date.now() - startTime, false);
					return response;
				}

				try {
					const { audio } = await request.json();
					
					if (!audio) {
						throw new Error('No audio data provided');
					}

					// Convert base64 to buffer
					const buffer = Buffer.from(audio, 'base64');
					const tempFile = new File([buffer], 'audio.webm', { type: 'audio/webm' });

					console.log('Processing audio data:', {
						size: buffer.length,
						type: 'audio/webm'
					});

					const response = await openai.audio.transcriptions.create({
						file: tempFile,
						model: 'whisper-1',
						language: 'en',
						response_format: 'json'
					});

					console.log('Transcription response:', response);

					const apiResponse = new Response(JSON.stringify({ 
						text: response.text 
					}), {
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
					
					logRequest(request, apiResponse, startTime, { 
						type: 'audio_transcription',
						audioDataSize: buffer.length
					});
					updateMetrics(Date.now() - startTime, true);
					return apiResponse;
				} catch (error) {
					console.error('Transcription error:', error);
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					const response = new Response(JSON.stringify({ 
						error: 'Transcription failed',
						details: errorMessage,
						timestamp: new Date().toISOString()
					}), {
						status: 500,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
					logRequest(request, response, startTime, { 
						error: errorMessage,
						type: 'transcription_error'
					});
					updateMetrics(Date.now() - startTime, false);
					return response;
				}
			}

			const response = new Response('Not found', { status: 404 });
			logRequest(request, response, startTime, { error: 'not_found' });
			updateMetrics(Date.now() - startTime, false);
			return response;

		} catch (error) {
			trackError(error, request, 'api_error');
			const response = new Response(JSON.stringify({ 
				error: 'Internal Server Error',
				requestId: startTime.toString()
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});
			logRequest(request, response, startTime, { 
				error: error.message,
				errorType: error.name,
				stackTrace: error.stack
			});
			updateMetrics(Date.now() - startTime, false);
			return response;
		}
	},
};
