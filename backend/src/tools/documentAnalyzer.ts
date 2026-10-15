import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DocumentAnalyzerOutput } from '../types/agent.js';

export interface DocumentAnalyzerParams {
  fileName: string;
  content: string;
  mimeType?: string;
}

export async function executeDocumentAnalyzer(params: DocumentAnalyzerParams): Promise<DocumentAnalyzerOutput> {
  const { fileName, content } = params;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error(`Document "${fileName || 'unknown'}" is empty. Please provide accessible text content.`);
  }

  const trimmed = content.trim();
  if (trimmed.length < 20) {
    throw new Error(`Document content is too short for meaningful analysis (minimum 20 characters required, received ${trimmed.length}).`);
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const fileSize = Buffer.byteLength(trimmed, 'utf8');

  const apiKey = process.env.GEMINI_API_KEY;
  let summary = '';
  let keyPoints: string[] = [];

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are JarvisOS Document Intelligence Analyzer. Analyze the following document text and provide:
1. A concise, high-value executive summary (2-3 paragraphs).
2. 3 to 5 key bullet points highlighting critical findings, data, or action items.

Document Name: ${fileName}
Content:
"""
${trimmed.slice(0, 15000)}
"""

Format your response as JSON:
{
  "summary": "...",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = res.response.text();
      const parsed = JSON.parse(responseText);
      summary = parsed.summary || '';
      keyPoints = Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [];
    } catch (err) {
      console.warn('[documentAnalyzer] Gemini API error, falling back to heuristic extractor:', err);
    }
  }

  // Fallback heuristic extraction if Gemini was not available or encountered an error
  if (!summary) {
    const sentences = trimmed.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 10);
    summary = sentences.slice(0, 3).join(' ') || trimmed.slice(0, 300);

    // Extract bullet points from headers, lists, or sentences
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    const bullets = lines.filter(l => l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l));

    if (bullets.length >= 3) {
      keyPoints = bullets.slice(0, 5).map(b => b.replace(/^[-*\d.]+\s*/, ''));
    } else {
      keyPoints = sentences.slice(1, 5).map(s => s.slice(0, 120));
    }
  }

  return {
    fileName: fileName || 'uploaded_document.txt',
    fileSize,
    wordCount,
    summary,
    keyPoints: keyPoints.length > 0 ? keyPoints : ['Document analyzed and parsed successfully.'],
    metadata: {
      analyzedAt: new Date().toISOString(),
      extractor: apiKey ? 'Gemini 1.5 Flash' : 'Native Text Intelligence Engine',
    },
  };
}
