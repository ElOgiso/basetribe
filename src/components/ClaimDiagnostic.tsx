/**
 * Claim Diagnostic Component
 * Helps troubleshoot why claims aren't working
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

export function ClaimDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      tests: [],
    };

    // Test 1: Environment Variables
    try {
      console.log('🔍 Test 1: Checking environment variables...');
      const envResponse = await fetch('/api/test-env');
      const envData = await envResponse.json();
      
      diagnostics.tests.push({
        name: 'Environment Variables',
        status: envData.success ? 'pass' : 'fail',
        details: envData.env,
        message: envData.message,
      });
      
      console.log('✅ Environment check:', envData);
    } catch (error) {
      diagnostics.tests.push({
        name: 'Environment Variables',
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('❌ Environment check failed:', error);
    }

    // Test 2: Claim API - BTRIBE
    try {
      console.log('🔍 Test 2: Testing BTRIBE claim API...');
      const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1'; // Test address
      const claimResponse = await fetch('/api/claim?action=claimBTRIBE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: testAddress,
          amount: 1,
        }),
      });

      const claimData = await claimResponse.json();
      
      diagnostics.tests.push({
        name: 'BTRIBE Claim API',
        status: claimResponse.ok ? 'pass' : 'fail',
        httpStatus: claimResponse.status,
        response: claimData,
      });
      
      console.log('BTRIBE claim test:', claimData);
    } catch (error) {
      diagnostics.tests.push({
        name: 'BTRIBE Claim API',
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('❌ BTRIBE claim test failed:', error);
    }

    // Test 3: Claim API - JESSE
    try {
      console.log('🔍 Test 3: Testing JESSE claim API...');
      const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
      const claimResponse = await fetch('/api/claim?action=claimJESSE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: testAddress,
          amount: 1,
        }),
      });

      const claimData = await claimResponse.json();
      
      diagnostics.tests.push({
        name: 'JESSE Claim API',
        status: claimResponse.ok ? 'pass' : 'fail',
        httpStatus: claimResponse.status,
        response: claimData,
      });
      
      console.log('JESSE claim test:', claimData);
    } catch (error) {
      diagnostics.tests.push({
        name: 'JESSE Claim API',
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('❌ JESSE claim test failed:', error);
    }

    // Test 4: Claim API - USDC
    try {
      console.log('🔍 Test 4: Testing USDC claim API...');
      const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
      const claimResponse = await fetch('/api/claim?action=claimUSDC', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: testAddress,
          amount: 1,
        }),
      });

      const claimData = await claimResponse.json();
      
      diagnostics.tests.push({
        name: 'USDC Claim API',
        status: claimResponse.ok ? 'pass' : 'fail',
        httpStatus: claimResponse.status,
        response: claimData,
      });
      
      console.log('USDC claim test:', claimData);
    } catch (error) {
      diagnostics.tests.push({
        name: 'USDC Claim API',
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('❌ USDC claim test failed:', error);
    }

    setResults(diagnostics);
    setTesting(false);
    
    console.log('🎯 All diagnostics complete:', diagnostics);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-[#001F3F] to-[#000B1A] border-[#39FF14]/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">🔧 Claim Diagnostics</h3>
            <p className="text-white/60 text-sm">Test why claims aren't working</p>
          </div>
          
          <Button
            onClick={runDiagnostics}
            disabled={testing}
            className="bg-gradient-to-r from-[#39FF14] to-[#2ECC11] hover:from-[#2ECC11] hover:to-[#26B30E] text-black font-bold"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Diagnostics'
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-3 mt-6">
            <div className="text-white/80 text-sm mb-4">
              <strong>Test Time:</strong> {new Date(results.timestamp).toLocaleString()}
            </div>
            
            {results.tests.map((test: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{test.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        test.status === 'pass' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {test.status.toUpperCase()}
                      </span>
                    </div>

                    {test.message && (
                      <p className="text-white/70 text-sm mb-2">{test.message}</p>
                    )}

                    {test.httpStatus && (
                      <p className="text-white/60 text-xs mb-2">
                        HTTP Status: <span className={test.httpStatus === 200 ? 'text-green-400' : 'text-red-400'}>
                          {test.httpStatus}
                        </span>
                      </p>
                    )}

                    {test.details && (
                      <div className="mt-2 p-2 bg-black/30 rounded text-xs font-mono text-white/80 overflow-auto max-h-40">
                        <pre>{JSON.stringify(test.details, null, 2)}</pre>
                      </div>
                    )}

                    {test.response && (
                      <div className="mt-2">
                        <p className="text-white/60 text-xs mb-1">Response:</p>
                        <div className="p-2 bg-black/30 rounded text-xs font-mono text-white/80 overflow-auto max-h-40">
                          <pre>{JSON.stringify(test.response, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {test.error && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                        <p className="text-red-400 text-xs">
                          <strong>Error:</strong> {test.error}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-[#39FF14]/10 to-[#2ECC11]/10 border border-[#39FF14]/20 rounded-lg">
              <h4 className="font-bold text-white mb-2">📋 Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Total Tests:</span>
                  <span className="text-white font-bold ml-2">{results.tests.length}</span>
                </div>
                <div>
                  <span className="text-white/60">Passed:</span>
                  <span className="text-green-400 font-bold ml-2">
                    {results.tests.filter((t: any) => t.status === 'pass').length}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Failed:</span>
                  <span className="text-red-400 font-bold ml-2">
                    {results.tests.filter((t: any) => t.status === 'fail').length}
                  </span>
                </div>
              </div>
              
              {results.tests.some((t: any) => t.status === 'fail') && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                  <p className="text-red-400 text-sm font-bold mb-1">⚠️ Issues Detected</p>
                  <p className="text-red-300/80 text-xs">
                    Check the failed tests above. Common fixes:
                  </p>
                  <ul className="text-red-300/80 text-xs mt-2 ml-4 list-disc space-y-1">
                    <li>Make sure .env.local has TREASURY_PRIVATE_KEY</li>
                    <li>Make sure .env.local has NEYNAR_API_KEY</li>
                    <li>Restart dev server after adding env variables</li>
                    <li>Check treasury wallet has ETH for gas</li>
                    <li>Check treasury wallet has tokens to send</li>
                  </ul>
                </div>
              )}
              
              {results.tests.every((t: any) => t.status === 'pass') && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
                  <p className="text-green-400 text-sm font-bold">✅ All Tests Passed!</p>
                  <p className="text-green-300/80 text-xs mt-1">
                    Claims should be working. If they're not, check browser console for errors.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!results && !testing && (
          <div className="text-center py-8 text-white/60">
            <p>Click "Run Diagnostics" to test claim functionality</p>
          </div>
        )}
      </div>
    </Card>
  );
}
