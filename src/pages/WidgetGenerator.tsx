import React, { useEffect, useState } from 'react';
import { backendRequest } from '../Helper/BackendReques';
import { FiCheck, FiCopy, FiRefreshCw } from 'react-icons/fi';

const WidgetGenerator: React.FC = () => {
  const [embedCode, setEmbedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateWidgetCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await backendRequest<{ success: true, embed_code: string }>(
        'POST',
        '/generate-widget',
        {}
      );
      
      if ('embed_code' in response) {
        setEmbedCode(response.embed_code);
      } else {
        setError('Failed to generate widget code');
      }
    } catch (err) {
      setError('An error occurred while generating the widget code');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!embedCode) return;
    
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setError('Failed to copy to clipboard');
      });
  };

  useEffect(()=> {
    generateWidgetCode()
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Widget</h1>
        
        <div className="mb-6">
            {isLoading && (
              <>
                <FiRefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            )
          }
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {embedCode && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Your Embed Code</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
              >
                {isCopied ? (
                  <>
                    <FiCheck className="w-5 h-5 mr-1 " />
                    Copied!
                  </>
                ) : (
                  <>
                    <FiCopy className="w-5 h-5 mr-1" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 relative">
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                {embedCode}
              </pre>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Instructions:</h3>
              <p className="text-gray-700">
                Copy this code and paste it into your website's HTML Header Tag where you want the widget to appear.
                Usually this would be just before the closing &lt;/header&gt; tag.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetGenerator;