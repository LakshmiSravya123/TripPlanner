'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function ApiKeyTester() {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: data.message || 'API key is valid!' });
      } else {
        setResult({ success: false, message: data.error || 'API key test failed' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to test API key. Please try again.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Test Your OpenAI API Key</h3>
        <p className="text-gray-300 text-sm">
          Verify that your API key is working correctly
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
            disabled={testing}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <button 
          onClick={testApiKey} 
          disabled={testing || !apiKey.trim()}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test API Key'
          )}
        </button>

        {result && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            result.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">OpenAI Platform</a></p>
          <p>• Make sure you have credits in your OpenAI account</p>
          <p>• API keys start with &quot;sk-&quot; and are about 51 characters long</p>
        </div>
      </div>
    </div>
  );
}
