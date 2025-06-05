'use client';
import { useState, useEffect } from 'react';
import { Shield, Upload, Globe, Code, AlertTriangle, CheckCircle, Loader, Eye, EyeOff, Bug, Zap, Lock, Skull, FileX, Database } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

export default function SecurityAnalyzer() {
  const [activeTab, setActiveTab] = useState('url');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [processedAnalysis, setProcessedAnalysis] = useState(null);
  
  // Form states
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [file, setFile] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://portbijay.pythonanywhere.com';
  const { refreshAccessToken } = useAuth();

  // Process the analysis response to improve formatting
  useEffect(() => {
    if (result?.analysis) {
      const formattedAnalysis = formatAnalysisResponse(result.analysis);
      setProcessedAnalysis(formattedAnalysis);
    }
  }, [result]);

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const formatAnalysisResponse = (analysis) => {
    // Convert Markdown headings to HTML
    let formatted = analysis
      .replace(/^# (.*$)/gm, '<h2>$1</h2>')
      .replace(/^## (.*$)/gm, '<h3>$1</h3>')
      .replace(/^### (.*$)/gm, '<h4>$1</h4>');

    // Convert code blocks with language indicators
    formatted = formatted.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const language = lang || 'plaintext';
      return `<pre class="code-block"><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
    });

    // Convert inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert lists (both ordered and unordered)
    formatted = formatted.replace(/^\s*\*\s(.*$)/gm, '<li>$1</li>');
    formatted = formatted.replace(/^\s*-\s(.*$)/gm, '<li>$1</li>');
    formatted = formatted.replace(/^\s*(\d+)\.\s(.*$)/gm, '<li>$2</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)+/g, (match) => `<ul>${match}</ul>`);

    // Convert bold and italic
    formatted = formatted.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert line breaks to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');

    // Add icons to vulnerability headings
    formatted = formatted.replace(/<h3>(\d+\. )?(.*?)<\/h3>/g, (match, p1, p2) => {
      const icon = getVulnerabilityTypeIcon(p2);
      return `<h3 class="vulnerability-heading">${icon}${p1 || ''}${p2}</h3>`;
    });

    // Add severity indicators to risk items
    formatted = formatted.replace(/<li><strong>Risk:<\/strong> (.*?)<\/li>/g, (match, p1) => {
      const severityIcon = getSeverityIcon(p1);
      return `<li class="risk-item"><strong>Risk:</strong> ${severityIcon}${p1}</li>`;
    });

    // Highlight vulnerable code sections
    formatted = formatted.replace(/❌ Not sanitized/g, '<span class="vulnerable-code">❌ Not sanitized</span>');
    formatted = formatted.replace(/Vulnerable Code/g, '<span class="vulnerable-label">Vulnerable Code</span>');
    formatted = formatted.replace(/Secure Fix/g, '<span class="secure-label">Secure Fix</span>');

    // Add section dividers
    formatted = formatted.replace(/<\/h3>/g, '</h3><div class="vulnerability-section">');
    formatted = formatted.replace(/<\/h4>/g, '</h4><div class="subsection">');
    formatted = formatted.replace(/<\/h2>/g, '</h2><div class="section-divider"></div>');

    // Wrap the entire content in a container
    formatted = `<div class="markdown-content">${formatted}</div>`;

    return formatted;
  };

  const analyzeCode = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setProcessedAnalysis(null);

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
      } else if (activeTab === 'code') {
        if (!code.trim()) {
          setError('Please enter code to analyze');
          setLoading(false);
          return;
        }
        requestData = JSON.stringify({ code: code.trim() });
        headers['Content-Type'] = 'application/json';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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
    setProcessedAnalysis(null);
  };

  const getSeverityIcon = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical') || lowerText.includes('high')) return <Skull className="w-4 h-4 text-red-400 inline mr-1" />;
    if (lowerText.includes('medium')) return <AlertTriangle className="w-4 h-4 text-yellow-400 inline mr-1" />;
    if (lowerText.includes('low') || lowerText.includes('info')) return <Bug className="w-4 h-4 text-blue-400 inline mr-1" />;
    return <Shield className="w-4 h-4 text-cyan-400 inline mr-1" />;
  };

  const getVulnerabilityTypeIcon = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('sql injection')) return <Database className="w-5 h-5 text-red-400 inline mr-2" />;
    if (lowerText.includes('xss') || lowerText.includes('cross-site scripting')) return <Code className="w-5 h-5 text-orange-400 inline mr-2" />;
    if (lowerText.includes('command injection')) return <Zap className="w-5 h-5 text-purple-400 inline mr-2" />;
    if (lowerText.includes('password') || lowerText.includes('authentication')) return <Lock className="w-5 h-5 text-yellow-400 inline mr-2" />;
    if (lowerText.includes('information disclosure')) return <FileX className="w-5 h-5 text-blue-400 inline mr-2" />;
    return <Bug className="w-5 h-5 text-cyan-400 inline mr-2" />;
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
            <Shield className="w-12 h-12 text-cyan-400 mr-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-white">
              Bug<span className="text-cyan-400">Hound</span>
            </h1>
          </div>
          <p className="text-cyan-400 text-xl font-semibold mb-2 flex items-center justify-center">
            <Bug className="w-5 h-5 mr-2" />
            Sniffing out bugs before the hackers do!
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
                  <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                  Analysis Results
                </h2>
                {result && (
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="flex items-center text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    {showCode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showCode ? 'Hide' : 'Show'} Raw Response
                  </button>
                )}
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="text-6xl mb-4">🐕</div>
                  <p className="text-lg">BugHound is ready to hunt!</p>
                  <p className="text-sm">Select an input method and start the security scan</p>
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
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Analysis Info */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Scan Summary</h3>
                    <div className="text-sm text-gray-300">
                      <span className="inline-block bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded mr-2">
                        Input Type: {result.input_type?.toUpperCase()}
                      </span>
                      <span className="inline-block bg-green-600/20 text-green-300 px-2 py-1 rounded">
                        Analysis Complete
                      </span>
                    </div>
                  </div>

                  {/* Analysis Results */}
                  <div className="bg-gray-900/50 rounded-lg p-4 overflow-auto max-h-[calc(100vh-400px)]">
                    <h3 className="text-lg font-semibold text-white mb-4">Security Report</h3>
                    <div 
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ __html: processedAnalysis || result.analysis }}
                    />
                  </div>

                  {/* Raw Response (collapsible) */}
                  {showCode && (
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Raw API Response</h3>
                      <pre className="text-xs text-gray-300 bg-black/30 p-4 rounded overflow-auto max-h-64">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .markdown-content {
          color: #e5e7eb;
          line-height: 1.6;
          overflow-wrap: break-word;
          word-wrap: break-word;
          hyphens: auto;
        }
        
        .markdown-content h2 {
          color: #f3f4f6 !important;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          border-bottom: 1px solid #374151;
          padding-bottom: 0.5rem;
        }
        
        .markdown-content h3 {
          color: #d1d5db !important;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
          margin-top: 1.25rem;
          display: flex;
          align-items: center;
        }
        
        .markdown-content h4 {
          color: #d1d5db !important;
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        
        .markdown-content p {
          color: #e5e7eb !important;
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .markdown-content ul {
          color: #e5e7eb !important;
          margin: 1rem 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }
        
        .markdown-content li {
          color: #e5e7eb !important;
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }
        
        .markdown-content pre {
          background-color: rgba(0, 0, 0, 0.4) !important;
          color: #f59e0b !important;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #374151;
          margin: 1rem 0;
          overflow-x: auto;
          font-size: 0.875rem;
        }
        
        .markdown-content code {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #60a5fa !important;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .markdown-content strong {
          color: #f9fafb !important;
          font-weight: 600;
        }
        
        .markdown-content em {
          font-style: italic;
        }
        
        .vulnerability-heading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .risk-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .vulnerability-section {
          background: rgba(239, 68, 68, 0.05);
          border-left: 3px solid rgba(239, 68, 68, 0.3);
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .subsection {
          margin: 0.75rem 0;
          padding-left: 1rem;
          border-left: 2px solid rgba(156, 163, 175, 0.3);
        }
        
        .vulnerable-code {
          color: #f87171;
          font-weight: bold;
        }
        
        .vulnerable-label {
          color: #f87171;
          font-weight: bold;
        }
        
        .secure-label {
          color: #4ade80;
          font-weight: bold;
        }
        
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56, 178, 172, 0.5), transparent);
          margin: 1rem 0;
        }
        
        .code-block {
          background-color: #1e293b !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          border: 1px solid #334155 !important;
          overflow-x: auto !important;
          margin: 1rem 0 !important;
          position: relative;
        }
        
        .code-block:before {
          content: attr(class);
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          padding: 0.25rem 0.5rem;
          font-size: 0.7rem;
          border-radius: 0 0.5rem 0 0.5rem;
        }
        
        .language-php {
          color: #a78bfa;
        }
        
        .language-html {
          color: #f472b6;
        }
        
        .language-sql {
          color: #60a5fa;
        }
        
        .language-javascript, .language-js {
          color: #fbbf24;
        }
      `}</style>
    </div>
  );
}