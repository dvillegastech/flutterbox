import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createSupabaseServer } from '@/lib/supabase/server';
import { FLUTTER_WIDGET_SYSTEM_PROMPT } from '@/lib/prompts/system-prompt';
import { validateFlutterCode, generateFixPrompt } from '@/lib/flutter-validator';

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

    const { prompt, attemptFix = false, previousCode = null } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let userPrompt = prompt;
    
    // If attempting to fix previous code with errors
    if (attemptFix && previousCode) {
      const validation = validateFlutterCode(previousCode);
      if (!validation.isValid) {
        userPrompt = generateFixPrompt(previousCode, validation.errors);
      }
    }

    const completion = await groq.chat.completions.create({
      messages: [
        SYSTEM_PROMPT,
        {
          role: "user",
          content: attemptFix 
            ? userPrompt 
            : `Create a Flutter widget for: ${prompt}.`,
        },
      ],
      model: "moonshotai/kimi-k2-instruct-0905", 
      response_format: { type: "json_object" },
      temperature: attemptFix ? 0.5 : 0.6,
      max_tokens: 8000,
      stop: ["\n\n\n", "```\n\n"],
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error("No response from AI");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse AI response, attempting to fix:", response);
      
      // Try to fix truncated JSON by finding the last complete property
      let fixedResponse = response;
      
      // Check if response is truncated (doesn't end with })
      if (!response.trim().endsWith('}')) {
        // Try to close the JSON structure
        const hasCode = response.includes('"code"');
        const hasDescription = response.includes('"description"');
        
        if (hasCode && !response.includes('"description"')) {
          // Code exists but description might be cut off
          fixedResponse = response + '"}';
        } else if (hasCode) {
          // Both exist but JSON is incomplete
          fixedResponse = response + '}';
        } else {
          // Severely truncated, add minimal structure
          fixedResponse = response + '""}';
        }
        
        // Try to add missing quotes if needed
        if (fixedResponse.split('"').length % 2 === 0) {
          fixedResponse = fixedResponse.slice(0, -1) + '"}';
        }
      }
      
      try {
        parsedResponse = JSON.parse(fixedResponse);
      } catch (secondError) {
        // If still failing, extract code and description manually
        console.error("Could not fix JSON, extracting manually");
        
        const codeMatch = response.match(/"code"\s*:\s*"([^"]*(?:\\"[^"]*)*)"/s);
        const descMatch = response.match(/"description"\s*:\s*"([^"]*)"/s);
        
        if (codeMatch) {
          parsedResponse = {
            code: codeMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\'),
            description: descMatch ? descMatch[1] : "Flutter widget generated successfully"
          };
        } else {
          throw new Error("Could not extract code from response");
        }
      }
    }

    // Validate the response has the required fields
    if (!parsedResponse.code || !parsedResponse.description) {
      throw new Error("Response missing required fields");
    }

    // Validate the generated code
    const validation = validateFlutterCode(parsedResponse.code);
    
    return NextResponse.json({
      description: parsedResponse.description,
      code: parsedResponse.code,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        stats: {
          hasMain: validation.hasMain,
          hasRunApp: validation.hasRunApp,
          hasImports: validation.hasImports,
          widgetCount: validation.widgetCount
        }
      }
    });

  } catch (error: any) {
    console.error("Error generating widget:", error);
    
    // Handle JSON generation errors specifically
    if (error?.error?.code === 'json_validate_failed') {
      return NextResponse.json(
        { 
          error: "The response was too long. Please try a simpler request or break it into smaller parts.",
          suggestion: "Try requesting fewer features or a simpler design"
        },
        { status: 400 }
      );
    }
    
    // Handle rate limit errors
    if (error?.status === 429) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please wait a moment and try again.",
          suggestion: "Wait 60 seconds before retrying"
        },
        { status: 429 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate widget. Please try again with a simpler request." },
      { status: 500 }
    );
  }
}