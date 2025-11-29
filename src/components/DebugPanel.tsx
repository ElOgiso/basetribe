import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    setResults(null);

    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
    };

    // Test 1: Environment Variables Check
    try {
      const envResponse = await fetch('/api/test-env');
      const envData = await envResponse.json();
      diagnostics.tests.push({
        name: 'Environment Variables',
        status: envData.all_variables_present ? 'success' : 'warning',
        data: envData,
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'Environment Variables',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 2: Neynar API - Get FID from Wallet (test with known wallet)
    try {
      const testWallet = '0x4114e33eb831858649ea3702e1c9a2db3f626446'; // Known Base team wallet
      const fidResponse = await fetch(`/api/neynar?action=getFidFromWallet&wallet=${testWallet}`);
      const fidData = await fidResponse.json();
      diagnostics.tests.push({
        name: 'Neynar API - getFidFromWallet',
        status: fidResponse.ok ? 'success' : 'error',
        statusCode: fidResponse.status,
        data: fidData,
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'Neynar API - getFidFromWallet',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 3: Neynar API - Get User Profile (test with known FID)
    try {
      const testFid = '3'; // Dan Romero's FID
      const profileResponse = await fetch(`/api/neynar?action=getUserProfile&fid=${testFid}`);
      const profileData = await profileResponse.json();
      diagnostics.tests.push({
        name: 'Neynar API - getUserProfile',
        status: profileResponse.ok ? 'success' : 'error',
        statusCode: profileResponse.status,
        data: profileData,
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'Neynar API - getUserProfile',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 4: Google Sheets Access
    try {
      const sheetResponse = await fetch(
        'https://docs.google.com/spreadsheets/d/1P9pEdiosAkkqRyb7a8fSGU4JlO6fQJEpQ2RJrhjPIFM/gviz/tq?tqx=out:json&sheet=Users'
      );
      const text = await sheetResponse.text();
      const jsonText = text.substring(47, text.length - 2);
      const sheetData = JSON.parse(jsonText);
      diagnostics.tests.push({
        name: 'Google Sheets Access',
        status: sheetResponse.ok ? 'success' : 'error',
        statusCode: sheetResponse.status,
        data: {
          rowCount: sheetData.table?.rows?.length || 0,
          accessible: true,
        },
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'Google Sheets Access',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setResults(diagnostics);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-[#7B2CBF] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#9D4EDD] transition-all z-50 text-sm font-medium"
      >
        🔧 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <Card className="bg-[#001F3F] border-2 border-[#7B2CBF] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#39FF14]" />
              System Diagnostics
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-white/70 text-sm">
            This panel helps diagnose connection issues with APIs and services.
          </p>

          <Button
            onClick={runDiagnostics}
            disabled={testing}
            className="w-full bg-gradient-to-r from-[#39FF14] to-[#00D4FF] text-[#001F3F] font-bold hover:opacity-90 transition-opacity"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-3">
              <div className="text-xs text-white/50">
                Test completed at: {new Date(results.timestamp).toLocaleString()}
              </div>

              {results.tests.map((test: any, index: number) => (
                <Card
                  key={index}
                  className="bg-[#003366]/50 border border-white/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(test.status)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-1">{test.name}</h3>
                      
                      {test.statusCode && (
                        <p className="text-xs text-white/60 mb-2">
                          HTTP Status: {test.statusCode}
                        </p>
                      )}

                      {test.error && (
                        <p className="text-xs text-red-400 mb-2">
                          Error: {test.error}
                        </p>
                      )}

                      {test.data && (
                        <details className="text-xs">
                          <summary className="text-white/70 cursor-pointer hover:text-white transition-colors">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-black/30 rounded text-[10px] text-white/80 overflow-x-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Summary */}
              <Card className="bg-[#003366]/70 border-2 border-[#39FF14]/30 p-4">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#39FF14]" />
                  Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-white/90">
                    ✅ Passed: {results.tests.filter((t: any) => t.status === 'success').length}
                  </p>
                  <p className="text-yellow-400">
                    ⚠️ Warnings: {results.tests.filter((t: any) => t.status === 'warning').length}
                  </p>
                  <p className="text-red-400">
                    ❌ Failed: {results.tests.filter((t: any) => t.status === 'error').length}
                  </p>
                </div>
              </Card>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-white font-medium mb-2 text-sm">Common Issues:</h4>
            <ul className="text-xs text-white/70 space-y-2">
              <li>• <strong>Environment Variables:</strong> Make sure all keys are set in Vercel Dashboard → Settings → Environment Variables</li>
              <li>• <strong>After adding variables:</strong> You must redeploy the app for changes to take effect</li>
              <li>• <strong>API Keys:</strong> Verify your Neynar API key is valid at neynar.com</li>
              <li>• <strong>Google Sheets:</strong> Make sure the sheet is published and publicly accessible</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
