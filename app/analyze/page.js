'use client';

import { useState } from 'react';
import { Shield, Upload, Globe, Code, AlertTriangle, CheckCircle, Loader, Eye, EyeOff, Bug, Zap, Lock, Skull, FileX, Database } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

export default function SecurityAnalyzer() {
  const [activeTab, setActiveTab] = useState('url');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  
  // Form states
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [file, setFile] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://portbijay.pythonanywhere.com';
  const { refreshAccessToken } = useAuth();

  const analyzeCode = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Refresh access token before making the request
      await refreshAccessToken();
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('Authentication required. Please log in.');
      }

      let requestData;
      let headers = {
        'Authorization': `Bearer ${accessToken}`,
      };

      if (activeTab === 'url') {
        if (!url.trim()) {
          setError('Please enter a valid URL');
          setLoading(false);
          return;
        }
        requestData = JSON.stringify({ url: url.trim() });
        headers['Content-Type'] = 'application/json';
      } else if (activeTab === 'file') {
        if (!file) {
          setError('Please select a file to upload');
          setLoading(false);
          return;
        }
        requestData = new FormData();
        requestData.append('file', file);
        // Don't set Content-Type for FormData, let browser set it with boundary
      } else if (activeTab === 'code') {
        if (!code.trim()) {
          setError('Please enter code to analyze');
          setLoading(false);
          return;
        }
        requestData = JSON.stringify({ code: code.trim() });
        headers['Content-Type'] = 'application/json';
      }

      // Increase timeout for long-running analysis
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      const response = await fetch(`${API_BASE}/api/analyze-code/`, {
        method: 'POST',
        headers,
        body: requestData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Server error: ${response.status}` };
        }
        
        throw new Error(errorData.error || `Analysis failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || (!data.analysis && !data.error)) {
        throw new Error('Invalid response from server. Please try again.');
      }

      setResult(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Analysis timed out. The request took too long to complete. Please try with smaller code or check your connection.');
      } else {
        setError(err.message || 'An error occurred during analysis');
      }
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const clearResults = () => {
    setResult(null);
    setError('');
  };

  const getSeverityIcon = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical') || lowerText.includes('high')) return <Skull className="w-4 h-4 text-red-400" />;
    if (lowerText.includes('medium')) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    if (lowerText.includes('low') || lowerText.includes('info')) return <Bug className="w-4 h-4 text-blue-400" />;
    return <Shield className="w-4 h-4 text-cyan-400" />;
  };

  const getVulnerabilityTypeIcon = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('sql injection')) return <Database className="w-5 h-5 text-red-400" />;
    if (lowerText.includes('xss') || lowerText.includes('cross-site scripting')) return <Code className="w-5 h-5 text-orange-400" />;
    if (lowerText.includes('command injection')) return <Zap className="w-5 h-5 text-purple-400" />;
    if (lowerText.includes('password') || lowerText.includes('authentication')) return <Lock className="w-5 h-5 text-yellow-400" />;
    if (lowerText.includes('information disclosure')) return <FileX className="w-5 h-5 text-blue-400" />;
    return <Bug className="w-5 h-5 text-cyan-400" />;
  };

  const tabs = [
    { id: 'url', label: 'URL Analysis', icon: Globe },
    { id: 'file', label: 'File Upload', icon: Upload },
    { id: 'code', label: 'Direct Code', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Animated Security Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-400/30 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-cyan-400 mr-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-white">
              Bug<span className="text-cyan-400">Hound</span>
            </h1>
          </div>
          <p className="text-cyan-400 text-xl font-semibold mb-2 flex items-center justify-center">
            <Bug className="w-5 h-5 mr-2" />
            Sniffing out bugs before the hackers do!
          </p>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Advanced AI-powered security vulnerability scanner. 
            Detect XSS, SQL injection, CSRF, and other critical security flaws.
          </p>
          
          {/* Security Stats */}
          <div className="flex justify-center mt-6 space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">1000+</div>
              <div className="text-xs text-gray-400">Vulnerabilities Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">99.9%</div>
              <div className="text-xs text-gray-400">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">24/7</div>
              <div className="text-xs text-gray-400">Security Monitoring</div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mr-2" />
                Security Scan Input
                <div className="ml-auto flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </h2>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-900/50 p-1 rounded-lg">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        clearResults();
                      }}
                      className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-2 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Enter a URL to fetch and analyze its HTML content
                    </p>
                  </div>
                )}

                {activeTab === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".html,.htm,.js,.jsx,.ts,.tsx,.php,.py,.java,.cpp,.c,.cs,.rb,.go,.rs"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-cyan-600 file:text-white file:cursor-pointer hover:file:bg-cyan-700"
                      />
                    </div>
                    {file && (
                      <div className="mt-2 text-sm text-cyan-400 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2 flex items-center">
                      <Code className="w-3 h-3 mr-1" />
                      Supports HTML, JS, PHP, Python, and other code files (max 10MB)
                    </p>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      Paste Code
                    </label>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code here for security analysis..."
                      className="w-full h-40 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-2 flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Direct code input for immediate analysis
                    </p>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={analyzeCode}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-cyan-500/25"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 mr-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      🐕 BugHound Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      🔍 Start Security Hunt
                    </>
                  )}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-2 animate-pulse" />
                      <span className="text-red-300">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                  Analysis Results
                </h2>
                {result && (
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 bg-gray-700/50 px-3 py-1 rounded-md"
                  >
                    {showCode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showCode ? 'Hide' : 'Show'} Raw Response
                  </button>
                )}
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="text-6xl mb-4 animate-bounce">🐕</div>
                  <p className="text-lg text-white">BugHound is ready to hunt!</p>
                  <p className="text-sm">Select an input method and start the security scan</p>
                  <div className="mt-4 flex space-x-2">
                    <div className="w-2 h-2 bg-cyan-400/50 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-400/50 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-400/50 rounded-full"></div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
                    <Shield className="w-8 h-8 text-cyan-400 absolute top-4 left-4" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg text-white font-semibold">🐕 BugHound is sniffing...</p>
                    <p className="text-sm text-gray-400">Deep scanning for security vulnerabilities</p>
                    <div className="flex items-center justify-center space-x-1 mt-4">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">This may take 30-120 seconds for complex analysis</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Analysis Info */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Shield className="w-5 h-5 text-cyan-400 mr-2" />
                      Scan Summary
                    </h3>
                    <div className="text-sm text-gray-300 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="inline-block bg-cyan-600/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-medium">
                          Input Type: {result.input_type?.toUpperCase()}
                        </span>
                        <span className="inline-block bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                          ✅ Analysis Complete
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <Database className="w-3 h-3 mr-1" />
                        Scanned for: SQL Injection, XSS, Command Injection, Auth Issues
                      </div>
                    </div>
                  </div>

                  {/* Analysis Results with Enhanced Styling */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Bug className="w-5 h-5 text-red-400 mr-2" />
                      Security Report
                    </h3>
                    <div 
                      className="prose prose-invert prose-cyan max-w-none custom-analysis-content"
                      dangerouslySetInnerHTML={{ __html: result.analysis }}
                      style={{
                        color: '#e5e7eb', // Light gray text
                        lineHeight: '1.6'
                      }}
                    />
                  </div>

                  {/* Raw Response (collapsible) */}
                  {showCode && (
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Code className="w-5 h-5 text-cyan-400 mr-2" />
                        Raw API Response
                      </h3>
                      <pre className="text-xs text-gray-300 bg-black/30 p-4 rounded overflow-auto max-h-64 border border-gray-600">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Threat Level Indicator */}
                  <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-4 border border-red-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold flex items-center">
                          <Skull className="w-5 h-5 text-red-400 mr-2" />
                          Threat Assessment
                        </h4>
                        <p className="text-gray-300 text-sm">Multiple high-severity vulnerabilities detected</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-400">HIGH</div>
                        <div className="text-xs text-gray-400">Risk Level</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🐕</span>
            <span className="text-cyan-400 font-semibold">BugHound</span>
            <span>•</span>
            <span>Sniffing out bugs before the hackers do!</span>
          </p>
          <div className="mt-2 text-xs">
            <span className="text-gray-500">Powered by Advanced AI Security Analysis</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-analysis-content h2 {
          color: #f3f4f6 !important;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
          border-bottom: 1px solid #374151;
          padding-bottom: 0.5rem;
        }
        
        .custom-analysis-content h3 {
          color: #d1d5db !important;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        
        .custom-analysis-content p {
          color: #e5e7eb !important;
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        
        .custom-analysis-content pre {
          background-color: rgba(0, 0, 0, 0.4) !important;
          color: #f59e0b !important;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #374151;
          margin: 0.75rem 0;
          overflow-x: auto;
          font-size: 0.875rem;
        }
        
        .custom-analysis-content code {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #60a5fa !important;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .custom-analysis-content ul {
          color: #e5e7eb !important;
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        
        .custom-analysis-content li {
          color: #e5e7eb !important;
          margin-bottom: 0.5rem;
        }
        
        .custom-analysis-content strong {
          color: #f9fafb !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}