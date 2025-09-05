import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createSupabaseServer } from '@/lib/supabase/server';
import { FLUTTER_WIDGET_SYSTEM_PROMPT } from '@/lib/prompts/system-prompt';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = {
  role: "system" as const,
  content: FLUTTER_WIDGET_SYSTEM_PROMPT
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        SYSTEM_PROMPT,
        {
          role: "user",
          content: `Please generate the Flutter widget code based on the following user request: ${prompt}`,
        },
      ],
      model: "moonshotai/kimi-k2-instruct-0905",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error("No response from AI");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid response format from AI");
    }

    // Validate the response has the required fields
    if (!parsedResponse.code || !parsedResponse.description) {
      throw new Error("Response missing required fields");
    }

    return NextResponse.json({
      description: parsedResponse.description,
      code: parsedResponse.code,
    });

  } catch (error) {
    console.error("Error generating widget:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate widget" },
      { status: 500 }
    );
  }
}