import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

interface GenerateRequest {
  prompt: string;
}

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  console.log("Groq API route hit");
  
  try {
    const body: GenerateRequest = await request.json();
    console.log("Request body:", body);
    
    if (!body.prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY not found");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    console.log("Making Groq API call...");
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: body.prompt,
        },
      ],
      model: "llama-3.1-8b-instant", // FREE model with high speed
      // model: "llama-3.1-70b-versatile", // More powerful, still free
      max_tokens: 150,
      temperature: 0.7,
    });

    const result = chatCompletion.choices[0]?.message?.content || "";
    console.log("Groq response received:", result);

    return NextResponse.json({ 
      result: result
    });
    
  } catch (error) {
    console.error("Detailed error:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      
      if (error.message.includes('API key')) {
        return NextResponse.json({ error: "Invalid Groq API key" }, { status: 401 });
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
      
      return NextResponse.json({ 
        error: `Groq API Error: ${error.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Unknown server error" }, { status: 500 });
  }
}
