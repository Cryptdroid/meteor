'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function APIDebugger() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (title: string, status: 'success' | 'error' | 'loading', data: any) => {
    setResults(prev => [...prev, {
      id: Date.now(),
      title,
      status,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testHealthAPI = async () => {
    setLoading(true);
    addResult('Health Check', 'loading', 'Testing...');
    
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      addResult('Health Check', response.ok ? 'success' : 'error', {
        status: response.status,
        data
      });
    } catch (error: any) {
      addResult('Health Check', 'error', { error: error.message });
    }
    setLoading(false);
  };

  const testAsteroidsAPI = async () => {
    setLoading(true);
    addResult('Asteroids API', 'loading', 'Testing...');
    
    try {
      const response = await fetch('/api/asteroids');
      const data = await response.json();
      addResult('Asteroids API', response.ok ? 'success' : 'error', {
        status: response.status,
        count: data.count || 'N/A',
        data: Array.isArray(data.asteroids) ? `${data.asteroids.length} asteroids` : data
      });
    } catch (error: any) {
      addResult('Asteroids API', 'error', { error: error.message });
    }
    setLoading(false);
  };

  const testSimulationAPI = async () => {
    setLoading(true);
    addResult('Simulation API (GET)', 'loading', 'Testing...');
    
    try {
      const response = await fetch('/api/simulation');
      const data = await response.json();
      addResult('Simulation API (GET)', response.ok ? 'success' : 'error', {
        status: response.status,
        data
      });
    } catch (error: any) {
      addResult('Simulation API (GET)', 'error', { error: error.message });
    }
    setLoading(false);
  };

  const testSimulationPOST = async () => {
    setLoading(true);
    addResult('Simulation POST', 'loading', 'Testing...');
    
    try {
      const testData = {
        diameter: 100,
        velocity: 20,
        angle: 45,
        density: 2600,
        target_location: { lat: 40.7128, lng: -74.0060 }
      };

      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      addResult('Simulation POST', response.ok ? 'success' : 'error', {
        status: response.status,
        input: testData,
        results: data.results || data
      });
    } catch (error: any) {
      addResult('Simulation POST', 'error', { error: error.message });
    }
    setLoading(false);
  };

  const checkEnvironmentVars = () => {
    const envVars = {
      'NEXT_PUBLIC_USE_BACKEND': process.env.NEXT_PUBLIC_USE_BACKEND,
      'NEXT_PUBLIC_BACKEND_URL': process.env.NEXT_PUBLIC_BACKEND_URL,
      'NEXT_PUBLIC_ENVIRONMENT': process.env.NEXT_PUBLIC_ENVIRONMENT,
      'NEXT_PUBLIC_NASA_API_KEY': process.env.NEXT_PUBLIC_NASA_API_KEY ? 'SET' : 'NOT SET'
    };

    addResult('Environment Variables', 'success', envVars);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">API Connection Debugger</h1>
        <p className="text-gray-600">Test frontend-backend connectivity in production</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={testHealthAPI} disabled={loading}>
          Test Health
        </Button>
        <Button onClick={testAsteroidsAPI} disabled={loading}>
          Test Asteroids
        </Button>
        <Button onClick={testSimulationAPI} disabled={loading}>
          Test Simulation (GET)
        </Button>
        <Button onClick={testSimulationPOST} disabled={loading}>
          Test Simulation (POST)
        </Button>
        <Button onClick={checkEnvironmentVars} variant="outline">
          Check Environment
        </Button>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{result.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{result.timestamp}</span>
                <span className={`inline-block w-3 h-3 rounded-full ${
                  result.status === 'success' ? 'bg-green-500' :
                  result.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              </div>
            </div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );
}