// ============================================
// GEMINI AI SERVICE - Wrapper for Google Generative AI
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
      console.warn('⚠️  GEMINI_API_KEY not set. Bots will use fallback logic.');
      return null;
    }
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 400,
        responseMimeType: 'application/json',
      },
    });
  }
  return model;
}

// ============================================
// RATE LIMITER - Gemini Free: 15 req/min
// ============================================

const requestTimestamps = [];
const MAX_REQUESTS_PER_MINUTE = 14; // Leave headroom

async function waitForSlot() {
  const now = Date.now();
  // Remove timestamps older than 60s
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > 60000) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const waitTime = 60000 - (now - requestTimestamps[0]) + 500;
    console.log(`🤖 Rate limit: waiting ${Math.round(waitTime / 1000)}s`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return waitForSlot(); // Recheck
  }
}

// ============================================
// GENERATE BOT DECISION
// ============================================

/**
 * Call Gemini API with a prompt and return parsed JSON response
 * @param {string} prompt - The full prompt to send
 * @param {number} temperature - Creativity level (0-1)
 * @returns {object|null} Parsed JSON response or null on failure
 */
export async function generateDecision(prompt, temperature = 0.85) {
  const m = getModel();
  if (!m) return null; // API not configured

  await waitForSlot();
  requestTimestamps.push(Date.now());

  try {
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: 400,
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    
    // Try to parse JSON from response
    try {
      return JSON.parse(text);
    } catch {
      // Try to extract JSON from response text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      console.warn('🤖 Gemini returned non-JSON:', text.substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('🤖 Gemini API error:', error.message);
    return null;
  }
}

/**
 * Check if the Gemini API is configured and available
 */
export function isAvailable() {
  return !!(API_KEY && API_KEY !== 'your_gemini_api_key_here');
}
