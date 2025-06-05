'use client';

import { useState } from 'react';
import { Shield, Upload, Globe, Code, AlertTriangle, CheckCircle, Loader, Eye, EyeOff, Bug, Zap, XCircle, Info } from 'lucide-react';
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

  // Enhanced formatting function for analysis results
  const formatAnalysisResult = (analysisHtml) => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = analysisHtml;
    
    // Get the text content and format it
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Split into sections and format
    const sections = textContent.split(/(?=\*\*|##|\n\n)/).filter(section => section.trim());
    
    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          const trimmedSection = section.trim();
          
          // Skip empty sections
          if (!trimmedSection) return null;
          
          // Header detection
          if (trimmedSection.startsWith('**') && trimmedSection.endsWith('**')) {
            const headerText = trimmedSection.replace(/\*\*/g, '');
            return (
              <div key={index} className="border-l-4 border-cyan-400 pl-4 py-2 bg-cyan-900/10">
                <h4 className="text-lg font-bold text-cyan-300 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  {headerText}
                </h4>
              </div>
            );
          }
          
          // Vulnerability detection
          if (trimmedSection.toLowerCase().includes('vulnerability') || 
              trimmedSection.toLowerCase().includes('security') ||
              trimmedSection.toLowerCase().includes('xss') ||
              trimmedSection.toLowerCase().includes('sql injection') ||
              trimmedSection.toLowerCase().includes('csrf')) {
            return (
              <div key={index} className="border border-red-500/30 rounded-lg p-4 bg-red-900/10">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-red-200 leading-relaxed">{trimmedSection}</p>
                </div>
              </div>
            );
          }
          
          // Recommendation detection
          if (trimmedSection.toLowerCase().includes('recommend') || 
              trimmedSection.toLowerCase().includes('fix') ||
              trimmedSection.toLowerCase().includes('solution')) {
            return (
              <div key={index} className="border border-green-500/30 rounded-lg p-4 bg-green-900/10">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-green-200 leading-relaxed">{trimmedSection}</p>
                </div>
              </div>
            );
          }
          
          // Code snippets
          if (trimmedSection.includes('```') || trimmedSection.includes('<') || trimmedSection.includes('{')) {
            return (
              <div key={index} className="border border-purple-500/30 rounded-lg p-4 bg-purple-900/10">
                <div className="flex items-start">
                  <Code className="w-5 h-5 text-purple-400 mr-3 mt-1 flex-shrink-0" />
                  <pre className="text-purple-200 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {trimmedSection}
                  </pre>
                </div>
              </div>
            );
          }
          
          // Default paragraph
          return (
            <div key={index} className="border-l-2 border-gray-600 pl-4">
              <p className="text-gray-200 leading-relaxed">{trimmedSection}</p>
            </div>
          );
        })}
      </div>
    );
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
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-cyan-400 mr-4" />
            <h1 className="text-4xl font-bold text-white">
              Bug<span className="text-cyan-400">Hound</span>
            </h1>
          </div>
          <p className="text-cyan-400 text-xl font-semibold mb-2">
            Sniffing out bugs before the hackers do!
          </p>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Advanced AI-powered security vulnerability scanner. 
            Detect XSS, SQL injection, CSRF, and other critical security flaws.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mr-2" />
                Security Scan Input
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
                          ? 'bg-cyan-600 text-white'
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Enter a URL to fetch and analyze its HTML content
                    </p>
                  </div>
                )}

                {activeTab === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      <div className="mt-2 text-sm text-cyan-400">
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Supports HTML, JS, PHP, Python, and other code files (max 10MB)
                    </p>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Paste Code
                    </label>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code here for security analysis..."
                      className="w-full h-40 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Direct code input for immediate analysis
                    </p>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={analyzeCode}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
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
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                      <span className="text-red-300">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <Bug className="w-6 h-6 text-green-400 mr-2" />
                  Security Report
                </h2>
                {result && (
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showCode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showCode ? 'Hide' : 'Show'} Raw Data
                  </button>
                )}
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="text-6xl mb-4">🐕</div>
                  <p className="text-lg font-semibold text-white">BugHound is ready to hunt!</p>
                  <p className="text-sm text-gray-300">Select an input method and start the security scan</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <span className="bg-red-900/20 text-red-300 px-2 py-1 rounded">Vulnerabilities</span>
                    <span className="bg-yellow-900/20 text-yellow-300 px-2 py-1 rounded">Warnings</span>
                    <span className="bg-green-900/20 text-green-300 px-2 py-1 rounded">Secure Code</span>
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
                <div className="space-y-6">
                  {/* Analysis Info */}
                  <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Info className="w-5 h-5 text-cyan-400 mr-2" />
                      Scan Summary
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center bg-cyan-600/20 text-cyan-300 px-3 py-1 rounded-full text-sm font-medium">
                        <Globe className="w-4 h-4 mr-1" />
                        {result.input_type?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className="inline-flex items-center bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Analysis Complete
                      </span>
                      <span className="inline-flex items-center bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                        <Shield className="w-4 h-4 mr-1" />
                        Security Scan
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Analysis Results */}
                  <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center border-b border-gray-700 pb-2">
                      <Bug className="w-6 h-6 text-red-400 mr-2" />
                      🔍 Security Analysis Report
                    </h3>
                    <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {result.analysis ? formatAnalysisResult(result.analysis) : (
                        <div className="text-gray-300 text-center py-8">
                          <XCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p>No analysis data available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Raw Response (collapsible) */}
                  {showCode && (
                    <div className="bg-gray-900/50 border border-purple-500/20 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Code className="w-5 h-5 text-purple-400 mr-2" />
                        Raw API Response
                      </h3>
                      <pre className="text-xs text-gray-300 bg-black/50 p-4 rounded-lg overflow-auto max-h-64 border border-gray-700">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p className="flex items-center justify-center">
            🐕 <span className="mx-2 text-cyan-400 font-semibold">BugHound</span> • Sniffing out bugs before the hackers do!
          </p>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.8);
        }
      `}</style>
    </div>
  );
}