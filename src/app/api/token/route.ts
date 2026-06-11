import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { apiKey } = await request.json().catch(() => ({ apiKey: undefined }));
  const assemblyApiKey = apiKey || process.env.ASSEMBLYAI_API_KEY;

  if (!assemblyApiKey) {
    return NextResponse.json(
      { error: "API key required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      "https://agents.assemblyai.com/v1/token?expires_in_seconds=300&max_session_duration_seconds=8640",
      {
        headers: {
          Authorization: `Bearer ${assemblyApiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
