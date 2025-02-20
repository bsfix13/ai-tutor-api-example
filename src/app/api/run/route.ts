// app/api/run/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { story } = await req.json();

    // More robust input validation
    if (!story || typeof story !== 'string' || story.trim() === '') {
      return NextResponse.json({ error: 'Invalid story prompt' }, { status: 400 });
    }

    const workflowId = process.env.WORKFLOW_ID;
    const apiKey = process.env.AITUTOR_API_KEY;

    // Better error handling for missing environment variables
    if (!workflowId) {
      console.error("WORKFLOW_ID environment variable is missing!");
      return NextResponse.json({ error: 'Internal Server Error: Missing Workflow ID' }, { status: 500 });
    }
    if (!apiKey) {
      console.error("AITUTOR_API_KEY environment variable is missing!");
      return NextResponse.json({ error: 'Internal Server Error: Missing API Key' }, { status: 500 });
    }


    const response = await fetch(`https://aitutor-api.vercel.app/api/v1/run/${workflowId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story }),
    });

    // Handle various HTTP error statuses more explicitly.
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error from external API' }));
      console.error(`External API Error (${response.status}):`, errorData);
      return NextResponse.json({ error: `External API Error: ${errorData.error || response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

