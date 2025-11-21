import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

export const runtime = "nodejs";
export const maxDuration = 30;

// Simple GET-based health check for the server-side OPENAI_API_KEY env var.
// This lets you visit /api/test-key in the browser on Vercel and see if the
// deployment can reach OpenAI with the configured key.
export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY env var is not set on this deployment." },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is set but does not start with 'sk-'. Check for copy/paste issues." },
        { status: 400 }
      );
    }

    const openaiClient = createOpenAI({
      apiKey,
      baseURL: "https://api.openai.com/v1",
    });

    const { text } = await generateText({
      model: openaiClient("gpt-4o-mini"),
      system: "You are a diagnostic helper. Respond with exactly: 'OPENAI env key test successful'",
      prompt: "Test env key",
      temperature: 0,
      maxTokens: 10,
    });

    if (typeof text === "string" && text.includes("successful")) {
      return NextResponse.json({
        success: true,
        message: "✅ OPENAI_API_KEY is valid and working from this deployment.",
      });
    }

    return NextResponse.json(
      { error: "Env key test failed - unexpected response from OpenAI" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Env OPENAI_API_KEY test error:", error);

    let errorMessage = "Env key test failed";

    if (error.status === 401) {
      errorMessage = "❌ Invalid OPENAI_API_KEY - OpenAI returned 401";
    } else if (error.status === 402) {
      errorMessage = "❌ Insufficient credits for OPENAI_API_KEY";
    } else if (error.status === 429) {
      errorMessage = "❌ Rate limit for OPENAI_API_KEY - try again later";
    } else if (typeof error.message === "string") {
      errorMessage = `❌ Env key test failed: ${error.message}`;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: "Invalid API key format. Keys should start with 'sk-'" },
        { status: 400 }
      );
    }

    // Test the API key with a simple request
    const openaiClient = createOpenAI({
      apiKey,
      baseURL: 'https://api.openai.com/v1',
    });

    const result = await generateText({
      model: openaiClient("gpt-4o-mini"),
      system: "You are a helpful assistant. Respond with exactly: 'API key test successful'",
      prompt: "Test",
      temperature: 0,
      maxTokens: 10,
    });

    if (result.text.includes("successful")) {
      return NextResponse.json({
        success: true,
        message: "✅ API key is valid and working!"
      });
    } else {
      return NextResponse.json(
        { error: "API key test failed - unexpected response" },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("API key test error:", error);

    let errorMessage = "API key test failed";
    
    if (error.status === 401) {
      errorMessage = "❌ Invalid API key - please check your key";
    } else if (error.status === 402) {
      errorMessage = "❌ Insufficient credits - please add funds to your OpenAI account";
    } else if (error.status === 429) {
      errorMessage = "❌ Rate limit exceeded - please wait and try again";
    } else if (error.message?.includes("API key")) {
      errorMessage = "❌ API key error - please verify your key is correct";
    } else {
      errorMessage = `❌ Test failed: ${error.message || "Unknown error"}`;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error.status || 500 }
    );
  }
}
