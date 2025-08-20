import React from 'react';

function DebugApp() {
  console.log('🔍 DEBUG: App component rendered');
  
  // Check environment variables
  const accountUrl = import.meta.env.VITE_AZURE_ACCOUNT_URL;
  const container = import.meta.env.VITE_AZURE_CONTAINER;
  const sasToken = import.meta.env.VITE_AZURE_SAS;
  
  console.log('🔍 Environment variables:', {
    accountUrl,
    container,
    sasToken: sasToken ? 'Set ✅' : 'Missing ❌',
    prefix: import.meta.env.VITE_BLOB_PREFIX
  });

  if (!accountUrl || !container || !sasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Configuration Missing</h1>
          <div className="text-left space-y-2 text-sm">
            <p>Account URL: {accountUrl ? '✅ Set' : '❌ Missing'}</p>
            <p>Container: {container ? '✅ Set' : '❌ Missing'}</p>
            <p>SAS Token: {sasToken ? '✅ Set' : '❌ Missing'}</p>
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-left">
            <p className="font-bold mb-2">Create .env file in root directory:</p>
            <pre>{`VITE_AZURE_ACCOUNT_URL=https://youraccount.blob.core.windows.net
VITE_AZURE_CONTAINER=images
VITE_AZURE_SAS=?sv=...your-sas-token...`}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Configuration OK!</h1>
        <p className="mb-4">Environment variables are set. Testing Azure connection...</p>
        <TestConnection />
      </div>
    </div>
  );
}

function TestConnection() {
  const [status, setStatus] = React.useState('Testing...');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function testAzure() {
      try {
        console.log('🔍 Testing Azure connection...');
        
        const accountUrl = import.meta.env.VITE_AZURE_ACCOUNT_URL;
        const container = import.meta.env.VITE_AZURE_CONTAINER;
        const sasToken = import.meta.env.VITE_AZURE_SAS;
        
        console.log('🔍 Testing with:', { accountUrl, container, sasToken: sasToken?.substring(0, 20) + '...' });
        
        // Fix: Use proper Azure Blob Storage List API format
        // Remove any double encoding and format correctly
        const cleanSasToken = sasToken.startsWith('?') ? sasToken : `?${sasToken}`;
        
        // Correct Azure REST API format for listing blobs
        const testUrl = `${accountUrl}/${container}${cleanSasToken}&restype=container&comp=list&maxresults=10`;
        
        console.log('🔍 Request URL (first 100 chars):', testUrl.substring(0, 100) + '...');
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/xml',
          }
        });
        
        console.log('🔍 Azure response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('🔍 Response data (first 200 chars):', data.substring(0, 200));
          setStatus('✅ Azure connection successful!');
          setError(null);
        } else {
          const errorText = await response.text();
          console.log('🔍 Error response:', errorText);
          setStatus('❌ Connection failed');
          setError(`HTTP ${response.status}: ${response.statusText}\n\n${errorText}`);
        }
      } catch (err) {
        console.error('🔍 Connection error:', err);
        setStatus('❌ Connection failed');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    testAzure();
  }, []);

  return (
    <div>
      <p className="mb-4">{status}</p>
      {error && (
        <div className="mt-4 p-4 bg-red-100 rounded text-xs text-left max-w-md overflow-auto max-h-64">
          <p className="font-bold text-red-800 mb-2">Error Details:</p>
          <pre className="whitespace-pre-wrap text-red-700">{error}</pre>
        </div>
      )}
      {status.includes('✅') && (
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Load Full Gallery
        </button>
      )}
      
      {/* Debug section */}
      <div className="mt-6 p-4 bg-gray-100 rounded text-xs">
        <p className="font-bold mb-2">🔧 Troubleshooting:</p>
        <div className="space-y-1">
          <p>1. Check your SAS token format in .env</p>
          <p>2. SAS should start with ?sv= and include ss=b, srt=sco, sp=rl</p>
          <p>3. Container name should match exactly (case-sensitive)</p>
          <p>4. Account URL should end with .blob.core.windows.net</p>
        </div>
      </div>
    </div>
  );
}

export default DebugApp;