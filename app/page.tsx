'use client'

import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [extractedText, setExtractedText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleExtractText = async () => {
    if (!file || !apiKey) return

    setLoading(true)
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64Image = reader.result as string

        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            apiKey,
          }),
        })

        const data = await response.json()
        if (data.error) throw new Error(data.error)
        
        setExtractedText(data.text)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to extract text')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
      alert('Text copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy text')
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">OCR Text Extractor</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">
            Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />
        </div>

        <button
          onClick={handleExtractText}
          disabled={!file || !apiKey || loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Processing...' : 'Extract Text'}
        </button>
      </div>

      {extractedText && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Extracted Text:</h2>
            <button
              onClick={handleCopyText}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Copy Text
            </button>
          </div>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
            {extractedText}
          </pre>
        </div>
      )}
    </main>
  )
} 