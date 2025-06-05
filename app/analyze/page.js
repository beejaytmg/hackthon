'use client';
import { useState } from 'react';
import { Shield, Upload, Globe, Code, AlertTriangle, CheckCircle, Eye, EyeOff, Bug, Zap, Lock, Skull, FileX, Database } from 'lucide-react';
// Make sure this path is correct for your project structure
// import { useAuth } from '@/app/hooks/useAuth'; 

// Mock useAuth if not available in this environment
const useAuth = () => ({
  refreshAccessToken: async () => {
    console.log("Mock refreshAccessToken called");
    // Simulate token refresh if needed for local testing without actual auth
    if (!localStorage.getItem('accessToken')) {
      // localStorage.setItem('accessToken', 'mock-access-token');
      // console.log("Mock access token set");
    }
    return Promise.resolve();
  },
});

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
  
  // Fallback for process.env.NEXT_PUBLIC_API_URL if not set
  const API_BASE = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'https://portbijay.pythonanywhere.com';

  const { refreshAccessToken } = useAuth();

  const analyzeCode = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    // Simple mock response for testing UI without API calls
    const MOCK_ANALYSIS = false; // Set to true to use mock data

    if (MOCK_ANALYSIS) {
      setTimeout(() => {
        setResult({
          input_type: activeTab,
          analysis: `<h2>Mock Security Vulnerabilities</h2>
                     <h3>1. Mock SQL Injection</h3>
                     <ul>
                         <li><strong>Location:</strong> <code>mock_login.php</code></li>
                         <li><strong>Description:</strong> This is a <strong>very long</strong> un-sanitized user input directly interpolated into SQL queries without any form of sanitization or validation being applied, potentially leading to unauthorized database access. This_is_a_very_long_string_meant_to_test_overflow_behavior_abcdefghijklmnopqrstuvwxyz_0123456789_abcdefghijklmnopqrstuvwxyz_0123456789.</li>
                         <li><strong>Risk:</strong> High</li>
                         <li><strong>Fix:</strong> Use prepared statements. <pre><code>SELECT * FROM users WHERE username = ?;</code></pre></li>
                     </ul>
                     <h3>2. Mock XSS</h3>
                     <p>User input <code>&lt;script&gt;alert('xss')&lt;/script&gt;</code> is not escaped.</p>
                     <p>Another long paragraph to test wrapping: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. SomeReallyLongWordThatShouldWrapProperlyWithoutBreakingTheLayout.</p>`,
        });
        setLoading(false);
      }, 2000);
      return;
    }

    try {
      await refreshAccessToken();
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        // If still no token after refresh, throw error
        // This could happen if refreshAccessToken doesn't actually set one or fails silently
        // For this example, we'll let it proceed and the API will return 401 if it's truly missing/invalid
        console.warn("Access token might be missing after refresh attempt.");
        // throw new Error('Authentication required. Please log in.'); 
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
      } else {
        setError('Invalid analysis type selected.');
        setLoading(false);
        return;
      }

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
          throw new Error('Authentication failed. Your session may have expired. Please log in again.');
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, use status text or a generic message
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        
        throw new Error(errorData.detail || errorData.error || `Analysis failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || (!data.analysis && !data.error)) {
        // Check if 'detail' field exists for errors, common in Django Rest Framework
        if (data && data.detail) {
            throw new Error(data.detail);
        }
        throw new Error('Invalid response from server. The analysis data is missing or malformed. Please try again.');
      }
      if (data.error) { // Handle cases where API returns a JSON with an error field
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Analysis timed out. The request took too long to complete. Please try with smaller code or check your connection.');
      } else {
        setError(err.message || 'An unknown error occurred during analysis. Please check console for details.');
      }
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        setFile(null); // Clear the invalid file
        return;
      }
      setFile(selectedFile);
      setError(''); // Clear previous errors
    }
  };

  const clearResults = () => {
    setResult(null);
    setError('');
    setUrl('');
    setCode('');
    setFile(null);
    // If you have a file input ref, you might want to reset it:
    // e.g., fileInputRef.current.value = null;
  };

  // These icon functions are not used in the current JSX but kept for potential future use
  // const getSeverityIcon = (text) => { 
  //   // ... implementation
  // };
  // const getVulnerabilityTypeIcon = (text) => {
  //   // ... implementation
  // };

  const tabs = [
    { id: 'url', label: 'URL Analysis', icon: Globe },
    { id: 'file', label: 'File Upload', icon: Upload },
    { id: 'code', label: 'Direct Code', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" style={{zIndex: -1}}></div>
      {/* Animated Security Particles - using fixed positioning to stay in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{zIndex: -1}}>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-400/30 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 mr-3 sm:mr-4 animate-pulse" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Bug<span className="text-cyan-400">Hound</span>
            </h1>
          </div>
          <p className="text-cyan-300 text-lg sm:text-xl font-semibold mb-2 flex items-center justify-center">
            <Bug className="w-5 h-5 mr-2" />
            Sniffing out bugs before the hackers do!
          </p>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl sm:max-w-2xl mx-auto">
            Advanced AI-powered security vulnerability scanner. 
            Detect XSS, SQL injection, CSRF, and other critical security flaws.
          </p>
          
          <div className="flex justify-center mt-6 space-x-6 sm:space-x-8">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-400">1000+</div>
              <div className="text-xs text-gray-400">Vulnerabilities Found</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-400">99.9%</div>
              <div className="text-xs text-gray-400">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">24/7</div>
              <div className="text-xs text-gray-400">Security Monitoring</div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto"> {/* Reduced max-width for better focus on smaller screens */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Input Panel */}
            <div className="bg-gray-800/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-5 sm:p-6 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-5 sm:mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mr-2" />
                Security Scan Input
                <div className="ml-auto flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </h2>

              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 mb-5 sm:mb-6 bg-gray-900/60 p-1 rounded-lg">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        // Do not clear results here, let user decide if they want to clear inputs
                      }}
                      className={`flex-1 flex items-center justify-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out ${
                        activeTab === tab.id
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/80'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1.5 sm:mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-5 sm:space-y-6">
                {activeTab === 'url' && (
                  <div>
                    <label htmlFor="urlInput" className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Website URL
                    </label>
                    <input
                      id="urlInput"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gray-900/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1.5 sm:mt-2 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Enter a URL to fetch and analyze its HTML content.
                    </p>
                  </div>
                )}

                {activeTab === 'file' && (
                  <div>
                    <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2 flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </label>
                    <input
                      id="fileUpload"
                      type="file"
                      onChange={handleFileChange}
                      accept=".html,.htm,.js,.jsx,.ts,.tsx,.php,.py,.java,.cpp,.c,.cs,.rb,.go,.rs,.txt,.json,.xml"
                      className="w-full text-sm text-gray-300 file:mr-3 sm:file:mr-4 file:py-2 sm:file:py-2.5 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 transition-colors cursor-pointer block border border-gray-600 rounded-lg bg-gray-900/70 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    {file && (
                      <div className="mt-2 text-xs sm:text-sm text-cyan-400 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                     <p className="text-xs text-gray-400 mt-1.5 sm:mt-2 flex items-center">
                      <Code className="w-3 h-3 mr-1" />
                      Max 10MB. Supports common code and text file types.
                    </p>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div>
                    <label htmlFor="codeInput" className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2 flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      Paste Code
                    </label>
                    <textarea
                      id="codeInput"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code here for security analysis..."
                      rows="6"
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gray-900/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1.5 sm:mt-2 flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Direct code input for immediate analysis.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={analyzeCode}
                      disabled={loading}
                      className="flex-grow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-3.5 px-5 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-cyan-500/30 active:scale-95"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2.5 sm:mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Start Hunt
                        </>
                      )}
                    </button>
                    {(result || error || url || code || file) && (
                         <button
                            onClick={clearResults}
                            disabled={loading}
                            title="Clear inputs and results"
                            className="sm:flex-shrink-0 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-medium py-3 sm:py-3.5 px-4 sm:px-5 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md active:scale-95"
                        >
                            <FileX className="w-4 h-4 sm:w-5 sm:h-5 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>


                {error && (
                  <div className="bg-red-900/30 border border-red-500/60 rounded-lg p-3.5 sm:p-4 backdrop-blur-sm mt-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                      <span className="text-red-300 text-sm break-words">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-gray-800/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-5 sm:p-6 shadow-2xl min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mr-2" />
                  Analysis Results
                </h2>
                {result && (
                  <button
                    onClick={() => setShowCode(!showCode)}
                    title={showCode ? "Hide Raw API Response" : "Show Raw API Response"}
                    className="flex items-center text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 bg-gray-700/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors"
                  >
                    {showCode ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />}
                    {showCode ? 'Hide' : 'Show'} Raw
                  </button>
                )}
              </div>

              <div className="flex-grow">
                {!result && !loading && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center py-10">
                    <div className="text-5xl sm:text-6xl mb-4 animate-bounce">🐕</div>
                    <p className="text-base sm:text-lg text-white">BugHound is ready to hunt!</p>
                    <p className="text-xs sm:text-sm">Select an input method and start the security scan.</p>
                    <div className="mt-4 flex space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400/50 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-purple-400/50 rounded-full"></div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <div className="relative mb-5 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                      <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center space-y-1.5 sm:space-y-2">
                      <p className="text-base sm:text-lg text-white font-semibold">🐕 BugHound is sniffing...</p>
                      <p className="text-xs sm:text-sm text-gray-400">Deep scanning for security vulnerabilities.</p>
                      <div className="flex items-center justify-center space-x-1 mt-3 sm:mt-4">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 sm:mt-4">This may take 30-120 seconds for complex analysis.</p>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div className="bg-gray-900/60 rounded-lg p-3.5 sm:p-4 border border-gray-700/60">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2.5 sm:mb-3 flex items-center">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mr-2" />
                        Scan Summary
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-300 space-y-1.5 sm:space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-block bg-cyan-600/30 text-cyan-300 px-2.5 py-1 rounded-full text-xs font-medium">
                            Input Type: {result.input_type?.toUpperCase() || 'N/A'}
                          </span>
                          <span className="inline-block bg-green-600/30 text-green-300 px-2.5 py-1 rounded-full text-xs font-medium">
                            ✅ Analysis Complete
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Database className="w-3 h-3 mr-1.5" />
                          Scanned for common web vulnerabilities.
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900/60 rounded-lg p-3.5 sm:p-4 border border-gray-700/60">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                        <Bug className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2" />
                        Security Report
                      </h3>
                      <div 
                        className="prose prose-sm sm:prose-base prose-invert prose-cyan max-w-none custom-analysis-content"
                        dangerouslySetInnerHTML={{ __html: result.analysis || "<p>No analysis data available.</p>" }}
                      />
                    </div>

                    {showCode && (
                      <div className="bg-gray-900/60 rounded-lg p-3.5 sm:p-4 border border-gray-700/60">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                          <Code className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mr-2" />
                          Raw API Response
                        </h3>
                        <pre className="text-xs text-gray-300 bg-black/40 p-3 sm:p-4 rounded-md overflow-auto max-h-60 sm:max-h-64 border border-gray-600/80">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* This is a generic threat level indicator, you might want to make this dynamic based on results */}
                    <div className="bg-gradient-to-r from-red-800/30 via-orange-800/30 to-yellow-800/30 rounded-lg p-3.5 sm:p-4 border border-red-500/40">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-white font-semibold flex items-center text-sm sm:text-base">
                            <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2" />
                            Threat Assessment
                          </h4>
                          <p className="text-gray-300 text-xs sm:text-sm">Review findings carefully. Severity may vary.</p>
                        </div>
                        <div className="text-right mt-1 sm:mt-0">
                           {/* Example: Dynamically set this based on keywords in result.analysis */}
                          <div className="text-lg sm:text-xl font-bold text-red-400">POTENTIAL ISSUES</div>
                          <div className="text-xs text-gray-400">Risk Level Indication</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 sm:mt-16 text-gray-400">
          <p className="flex items-center justify-center space-x-1.5 sm:space-x-2 text-sm">
            <span className="text-xl sm:text-2xl">🐕</span>
            <span className="text-cyan-400 font-semibold">BugHound</span>
            <span>•</span>
            <span>Advanced AI Security Analysis</span>
          </p>
          <div className="mt-2 text-xs">
            &copy; {new Date().getFullYear()} BugHound. Sniffing out bugs, day and night.
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          overscroll-behavior-y: contain; /* Prevents pull-to-refresh on mobile if page is short */
        }
      `}</style>
      <style jsx>{`
        /* Ensure prose styles from Tailwind are applied, then override */
        .custom-analysis-content {
          color: #d1d5db; /* prose-invert default is often gray-300 */
          line-height: 1.65;
        }
        .custom-analysis-content h2 {
          color: #e5e7eb !important; /* gray-200 */
          font-size: 1.125rem !important; /* text-lg */
          font-weight: 600 !important; /* semibold */
          margin-bottom: 0.6rem !important; /* mb-2.5 */
          margin-top: 1.25rem !important; /* mt-5 */
          border-bottom: 1px solid #4b5563 !important; /* gray-600 */
          padding-bottom: 0.4rem !important; /* pb-1.5 */
        }
        .custom-analysis-content h2:first-child {
            margin-top: 0.25rem !important; /* Reduce top margin for the very first h2 */
        }
        
        .custom-analysis-content h3 {
          color: #cccccc !important; /* Lighter gray */
          font-size: 1rem !important; /* text-base */
          font-weight: 600 !important; /* semibold */
          margin-bottom: 0.5rem !important; /* mb-2 */
          margin-top: 1rem !important; /* mt-4 */
        }
        
        .custom-analysis-content p {
          color: #b0b0b0 !important; /* Slightly softer gray for paragraphs */
          margin-bottom: 0.75rem !important; /* mb-3 */
          overflow-wrap: break-word;
          word-break: break-word; /* More aggressive word breaking if needed */
          -webkit-hyphens: auto; /* Enable hyphenation for better flow */
          -ms-hyphens: auto;
          hyphens: auto;
        }
        
        .custom-analysis-content pre {
          background-color: rgba(10, 20, 30, 0.7) !important; /* Darker, slightly transparent */
          color: #fde047 !important; /* Tailwind yellow-300 for better contrast on dark bg */
          padding: 0.75rem 1rem !important; /* p-3 or p-4 */
          border-radius: 0.375rem !important; /* rounded-md */
          border: 1px solid #374151 !important; /* border-gray-700 */
          margin: 0.75rem 0 !important; /* my-3 */
          overflow-x: auto !important;
          font-size: 0.85rem !important; /* Slightly smaller for dense code */
          line-height: 1.6 !important;
          white-space: pre-wrap !important; /* Allow wrapping within pre, but preserve spaces */
          word-break: break-all; /* Break long unbroken strings within pre */
        }
        
        /* Styles for <code> tags directly within <pre> for consistency */
        .custom-analysis-content pre code {
          color: inherit !important; 
          background-color: transparent !important;
          padding: 0 !important;
          font-size: inherit !important;
          border-radius: 0 !important; /* Reset border-radius for code inside pre */
          white-space: inherit !important; /* Inherit from pre */
          word-break: inherit !important; /* Inherit from pre */
        }
        
        /* Styles for inline <code> tags (not within <pre>) */
        .custom-analysis-content code:not(pre > code) {
          background-color: rgba(59, 130, 246, 0.2) !important; /* blue-500 with alpha */
          color: #93c5fd !important; /* Tailwind blue-300 */
          padding: 0.15rem 0.35rem !important;
          border-radius: 0.25rem !important; /* rounded-sm */
          font-size: 0.85em !important; /* Relative to parent, slightly smaller */
          overflow-wrap: break-word;
          word-break: break-all; /* Break long inline code snippets */
        }
        
        .custom-analysis-content ul, .custom-analysis-content ol {
          color: #b0b0b0 !important;
          margin: 0.75rem 0 !important;
          padding-left: 1.75rem !important; /* More indentation */
        }
        
        .custom-analysis-content li {
          color: #b0b0b0 !important;
          margin-bottom: 0.5rem !important;
          padding-left: 0.25rem !important; /* Small padding for text after bullet */
          overflow-wrap: break-word;
          word-break: break-word;
          -webkit-hyphens: auto;
          -ms-hyphens: auto;
          hyphens: auto;
        }
        
        .custom-analysis-content strong {
          color: #e0e7ff !important; /* Tailwind indigo-100 for strong text */
          font-weight: 600 !important;
        }

        .custom-analysis-content a {
          color: #7dd3fc !important; /* Tailwind sky-300 */
          text-decoration: underline !important;
          text-decoration-color: #38bdf8 !important; /* sky-500 */
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .custom-analysis-content a:hover {
          color: #e0f2fe !important; /* Tailwind sky-100 */
          text-decoration-color: #7dd3fc !important; /* sky-300 */
        }

        /* Custom scrollbar for webkit browsers, subtle */
        .custom-analysis-content pre::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .custom-analysis-content pre::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.5); /* slate-800/50 */
            border-radius: 4px;
        }
        .custom-analysis-content pre::-webkit-scrollbar-thumb {
            background: #4b5563; /* gray-600 */
            border-radius: 4px;
        }
        .custom-analysis-content pre::-webkit-scrollbar-thumb:hover {
            background: #6b7280; /* gray-500 */
        }
      `}</style>
    </div>
  );
}
