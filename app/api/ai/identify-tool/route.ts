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
  } catch (error) {
    console.error('Error in AI tool identification:', error);
    return NextResponse.json(
      { error: 'Failed to identify tool. Please try again.' },
      { status: 500 }
    );
  }
}
