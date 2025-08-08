'use client';
import Link from 'next/link';
import { useState, FormEvent, KeyboardEvent, MouseEvent } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLTextAreaElement>) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    console.log(prompt);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.result);
      } else {
        console.error(data.error);
        setResponse("Error: Unable to generate response");
      }
    } catch (error) {
      console.error("Network error:", error);
      setResponse("Error: Network connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href={"/home"}>
            <p className='text-black'>GO home</p>
          </Link>
          <h1 className="text-3xl font-light text-black mb-2">
            AI Assistant
          </h1>
          <p className="text-gray-600 text-sm">
            Enter your prompt and get an AI-generated response
          </p>
        </div>
        {/* Input Area */}
        <div className="space-y-6">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like to know?"
              className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-black placeholder-gray-400"
              disabled={isLoading}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim() && !isLoading) {
                    handleSubmit(e);
                  }
                }
              }}
            />
          </div>
          
          <button 
            onClick={(e: MouseEvent<HTMLButtonElement>) => handleSubmit(e)}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Response"
            )}
          </button>
        </div>
        {/* Response */}
        {response && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-medium text-black border-b border-purple-200 pb-2">
              Response
            </h2>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
