import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { image, apiKey } = await req.json()

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Extract all text from this image and return it exactly as it appears, preserving line breaks and formatting."
          }, {
            inline_data: {
              mime_type: "image/jpeg",
              data: image.split(',')[1]
            }
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const result = await response.json()
    const extractedText = result.candidates[0].content.parts[0].text

    return NextResponse.json({ text: extractedText })
  } catch (error) {
    console.error('OCR Error:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
} 