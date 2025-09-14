'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAIChatPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAIChat = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔧 Testing AI Chat API...');
      
      // Test 1: Initialize conversation
      console.log('🔧 Step 1: Initialize conversation');
      const initResponse = await apiClient.startAIConversation({});
      console.log('🔧 Init Response:', initResponse);
      
      if (!initResponse.success) {
        throw new Error(`Init failed: ${initResponse.message || 'Unknown error'}`);
      }

      // Test 2: Send a message
      console.log('🔧 Step 2: Send message');
      const messageResponse = await apiClient.startAIConversation({
        message: 'Hello, this is a test message',
        conversationId: initResponse.data.id
      });
      console.log('🔧 Message Response:', messageResponse);

      if (!messageResponse.success) {
        throw new Error(`Message failed: ${messageResponse.message || 'Unknown error'}`);
      }

      setResult({
        init: initResponse,
        message: messageResponse
      });

    } catch (err: any) {
      console.error('🔧 Test Error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>AI Chat API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testAIChat} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test AI Chat API'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-semibold text-red-800">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-800 mb-2">✅ Success!</h3>
                
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium">Initialize Response:</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.init, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Message Response:</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.message, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}