import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the image from the request
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image of a tool and provide detailed information about it. Return a JSON object with the following fields:
- name: The specific name/model of the tool (e.g., "DeWalt 20V Cordless Drill")
- description: A detailed description of the tool, its features, and typical uses (2-3 sentences)
- category: One of: "Power Tools", "Hand Tools", "Garden", "Ladders", "Automotive", "Cleaning", or "Other"
- model: The model number if visible, otherwise null

Be specific and helpful. If you can't identify the exact tool, make your best educated guess based on what you see.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response (handle markdown code blocks)
    try {
      // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
      let jsonContent = content.trim();

      // Check if wrapped in markdown code block
      const codeBlockMatch = jsonContent.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }

      const toolInfo = JSON.parse(jsonContent);
      return NextResponse.json({
        name: toolInfo.name || 'Unknown Tool',
        description: toolInfo.description || '',
        category: toolInfo.category || 'Other',
        model: toolInfo.model || null,
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response:', content);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response. The AI returned an unexpected format.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in AI tool identification:', error);

    // Handle OpenAI API errors with descriptive messages
    if (error?.error) {
      const { type, code, message } = error.error;

      // Sanitize error message to remove sensitive information (API keys)
      const sanitizedMessage = message
        ? message.replace(/[a-zA-Z0-9_-]{20,}/g, '***')
        : 'Unknown error';

      let userMessage = 'AI identification failed. ';

      // Provide specific guidance based on error type
      switch (code) {
        case 'invalid_api_key':
          userMessage += 'The AI service is not properly configured. Please contact the site administrator. (Error: Invalid API key)';
          break;
        case 'insufficient_quota':
          userMessage += 'The AI service has reached its usage limit. Please try again later or contact the site administrator. (Error: Quota exceeded)';
          break;
        case 'rate_limit_exceeded':
          userMessage += 'Too many requests to the AI service. Please wait a moment and try again. (Error: Rate limit exceeded)';
          break;
        case 'model_not_found':
          userMessage += 'The AI model is not available. Please contact the site administrator. (Error: Model not found)';
          break;
        case 'invalid_request_error':
          if (message?.includes('API key')) {
            userMessage += 'The AI service is not properly configured. Please contact the site administrator. (Error: Invalid API configuration)';
          } else {
            userMessage += `Request error: ${sanitizedMessage}`;
          }
          break;
        default:
          userMessage += `Technical error (${type || 'unknown'}): ${sanitizedMessage}`;
      }

      return NextResponse.json(
        { error: userMessage },
        { status: error.status || 500 }
      );
    }

    // Handle other types of errors
    if (error?.message) {
      const sanitizedMessage = error.message.replace(/[a-zA-Z0-9_-]{20,}/g, '***');
      return NextResponse.json(
        { error: `AI identification failed: ${sanitizedMessage}` },
        { status: 500 }
      );
    }

    // Fallback error message
    return NextResponse.json(
      { error: 'Failed to identify tool. Please try again or enter details manually.' },
      { status: 500 }
    );
  }
}
