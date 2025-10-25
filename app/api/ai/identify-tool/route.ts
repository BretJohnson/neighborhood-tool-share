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
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are helping identify a tool from a photo for a neighborhood tool sharing application.

Please analyze this image and provide:
1. Tool name (e.g., "Pressure Washer", "Cordless Drill")
2. Brand (if visible)
3. Model number (if visible)
4. A brief description including condition if apparent

Format your response as JSON with these exact fields:
{
  "name": "Tool name",
  "brand": "Brand name or null",
  "model": "Model number or null",
  "description": "Brief description"
}

If you cannot identify the tool or the image does not contain a tool, set name to "Unknown Tool" and provide a helpful message in the description.`,
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
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      const toolInfo = JSON.parse(content);
      return NextResponse.json({
        name: toolInfo.name || 'Unknown Tool',
        brand: toolInfo.brand || null,
        model: toolInfo.model || null,
        description: toolInfo.description || '',
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response:', content);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          rawResponse: content,
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
