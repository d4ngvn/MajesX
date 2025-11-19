import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
// Note: In a real production app, this key should be proxied via backend
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generates a formal announcement based on a rough draft or key points.
 */
export const generateAnnouncement = async (topic: string, tone: 'Formal' | 'Urgent' | 'Friendly'): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an AI assistant for a residential building manager.
      Draft a ${tone.toLowerCase()} announcement for residents regarding: "${topic}".
      Keep it concise, professional, and clear. Do not include markdown formatting or headers, just the body text.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Unable to generate announcement at this time.";
  } catch (error) {
    console.error("Error generating announcement:", error);
    return "Error generating content. Please try again.";
  }
};

/**
 * Analyzes chat sentiment (simulation for admin dashboard insight)
 */
export const analyzeCommunitySentiment = async (messages: string[]): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Analyze the following anonymous community chat messages and provide a 1-sentence summary of the overall sentiment and main topics:
      ${messages.slice(-10).join('\n')}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Sentiment analysis unavailable.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "Could not analyze sentiment.";
  }
};