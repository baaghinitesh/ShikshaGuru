'use client';

import React from 'react';

// Placeholder component while we fix the AI Chat Assistant import issue
const AIChatAssistantPlaceholder: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg">
        <div className="w-6 h-6 flex items-center justify-center">
          💬
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistantPlaceholder;