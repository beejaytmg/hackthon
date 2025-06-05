'use client';
import { useState, useEffect } from 'react';
import { Shield, Upload, Globe, Code, AlertTriangle, CheckCircle, Loader, Eye, EyeOff, Bug, Zap, Lock, Skull, FileX, Database, Terminal, Wifi, Server, Activity, Maximize2, Minimize2, X, Crosshair, Radar, Cpu, HardDrive, Network } from 'lucide-react';

export default function SecurityAnalyzer() {
  const [activeTab, setActiveTab] = useState('url');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [processedAnalysis, setProcessedAnalysis] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Form states
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [file, setFile] = useState(null);

  const API_BASE = 'https://portbijay.pythonanywhere.com';

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
    // Convert Markdown headings to HTML with proper structure and consistent indentation
    let formatted = analysis
      .replace(/^# (.*$)/gm, '<div class="section-header level-1"><h2>$1</h2></div>')
      .replace(/^## (.*$)/gm, '<div class="section-header level-2"><h3>$1</h3></div>')
      .replace(/^### (.*$)/gm, '<div class="section-header level-3"><h4>$1</h4></div>');

    // Convert code blocks with language indicators
    formatted = formatted.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const language = lang || 'plaintext';
      return `<div class="code-block-container"><div class="code-header"><span class="code-lang">${language.toUpperCase()}</span><span class="code-icon">⚡</span></div><pre class="code-block"><code class="language-${language}">${escapeHtml(code)}</code></pre></div>`;
    });

    // Convert inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Convert lists with proper nesting structure
    formatted = formatted.replace(/^\s*[\*\-]\s(.*$)/gm, '<li class="list-item indent-0">$1</li>');
    formatted = formatted.replace(/^\s*(\d+)\.\s(.*$)/gm, '<li class="numbered-item indent-0">$2</li>');
    
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/(<li class="[^"]*">.*?<\/li>\s*)+/gs, (match) => {
      return `<div class="list-container"><ul class="custom-list">${match}</ul></div>`;
    });

    // Convert bold and italic with better styling
    formatted = formatted.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="bold-italic cyber-text">$1</strong>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="bold-text cyber-emphasis">$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic-text cyber-dim">$1</em>');

    // Convert line breaks to proper paragraphs
    formatted = formatted.replace(/\n\n+/g, '</p><p class="content-paragraph">');
    formatted = formatted.replace(/\n/g, '<br>');

    // Add icons to vulnerability headings with threat levels
    formatted = formatted.replace(/<h4>(\d+\. )?(.*?)<\/h4>/g, (match, p1, p2) => {
      const { icon, threatLevel } = getVulnerabilityInfo(p2);
      return `<div class="vulnerability-container ${threatLevel}"><h4 class="vulnerability-title">${icon}<span class="vuln-text">${p1 || ''}${p2}</span><span class="threat-badge ${threatLevel}">${threatLevel.toUpperCase()}</span></h4></div>`;
    });

    // Enhanced severity indicators
    formatted = formatted.replace(/<li class="[^"]*"><strong[^>]*>Risk:<\/strong> (.*?)<\/li>/g, (match, p1) => {
      const severityData = getSeverityInfo(p1);
      return `<li class="risk-item ${severityData.class}">${severityData.icon}<strong class="risk-label">Risk:</strong> <span class="risk-text">${p1}</span><div class="risk-meter"><div class="risk-fill ${severityData.class}"></div></div></li>`;
    });

    // Highlight security indicators
    formatted = formatted.replace(/❌ Not sanitized/g, '<span class="vulnerable-indicator critical">❌ Not sanitized</span>');
    formatted = formatted.replace(/Vulnerable Code/g, '<span class="vulnerable-label">🚨 Vulnerable Code</span>');
    formatted = formatted.replace(/Secure Fix/g, '<span class="secure-label">✅ Secure Fix</span>');

    // Wrap paragraphs properly with consistent indentation
    formatted = `<div class="content-paragraph">${formatted}</div>`;

    // Wrap the entire content in a container with cyber styling
    formatted = `<div class="analysis-content cyber-container">${formatted}</div>`;

    return formatted;
  };

  const analyzeCode = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setProcessedAnalysis(null);

    try {
      let endpoint = '';
      let requestData;
      let headers = {};

      if (activeTab === 'url') {
        if (!url.trim()) {
          setError('Please enter a valid URL');
          setLoading(false);
          return;
        }
        
        endpoint = `${API_BASE}/analyze-code`;
        requestData = JSON.stringify({ url: url.trim() });
        headers = {
          'Content-Type': 'application/json',
        };
      } else if (activeTab === 'file') {
        if (!file) {
          setError('Please select a file to upload');
          setLoading(false);
          return;
        }
        
        endpoint = `${API_BASE}/analyze-code`;
        requestData = new FormData();
        requestData.append('file', file);
        // Don't set Content-Type for FormData, let browser set it with boundary
      } else if (activeTab === 'code') {
        if (!code.trim()) {
          setError('Please enter code to analyze');
          setLoading(false);
          return;
        }
        
        endpoint = `${API_BASE}/analyze-code`;
        requestData = JSON.stringify({ code: code.trim() });
        headers = {
          'Content-Type': 'application/json',
        };
      }

      console.log('Making request to:', endpoint);
      console.log('Request method:', 'POST');
      console.log('Headers:', headers);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: requestData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      setResult({
        input_type: activeTab,
        analysis: responseData.analysis || responseData.result || JSON.stringify(responseData, null, 2),
        ...responseData
      });

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis. Please check your connection and try again.');
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

  const getSeverityInfo = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical')) return { 
      icon: <Skull className="w-4 h-4 text-red-400 inline mr-2" />, 
      class: 'critical' 
    };
    if (lowerText.includes('high')) return { 
      icon: <AlertTriangle className="w-4 h-4 text-red-400 inline mr-2" />, 
      class: 'high' 
    };
    if (lowerText.includes('medium')) return { 
      icon: <AlertTriangle className="w-4 h-4 text-yellow-400 inline mr-2" />, 
      class: 'medium' 
    };
    if (lowerText.includes('low') || lowerText.includes('info')) return { 
      icon: <Bug className="w-4 h-4 text-blue-400 inline mr-2" />, 
      class: 'low' 
    };
    return { 
      icon: <Shield className="w-4 h-4 text-cyan-400 inline mr-2" />, 
      class: 'info' 
    };
  };

  const getVulnerabilityInfo = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('sql injection')) return { 
      icon: <Database className="w-5 h-5 text-red-400 inline mr-2" />, 
      threatLevel: 'critical' 
    };
    if (lowerText.includes('xss') || lowerText.includes('cross-site scripting')) return { 
      icon: <Code className="w-5 h-5 text-orange-400 inline mr-2" />, 
      threatLevel: 'high' 
    };
    if (lowerText.includes('command injection')) return { 
      icon: <Terminal className="w-5 h-5 text-purple-400 inline mr-2" />, 
      threatLevel: 'high' 
    };
    if (lowerText.includes('password') || lowerText.includes('authentication')) return { 
      icon: <Lock className="w-5 h-5 text-yellow-400 inline mr-2" />, 
      threatLevel: 'high' 
    };
    if (lowerText.includes('information disclosure')) return { 
      icon: <FileX className="w-5 h-5 text-blue-400 inline mr-2" />, 
      threatLevel: 'medium' 
    };
    return { 
      icon: <Bug className="w-5 h-5 text-cyan-400 inline mr-2" />, 
      threatLevel: 'low' 
    };
  };

  const tabs = [
    { id: 'url', label: 'URL Analysis', icon: Globe },
    { id: 'file', label: 'File Upload', icon: Upload },
    { id: 'code', label: 'Direct Code', icon: Code },
  ];

  // Fullscreen Modal Component
  const FullscreenModal = () => {
    if (!isFullscreen || !result) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-cyan-500/30 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Full Security Analysis</h2>
              <p className="text-sm text-cyan-400 flex items-center">
                <Crosshair className="w-4 h-4 mr-1" />
                Fullscreen Mode Active
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 bg-gray-700/50 px-3 py-1 rounded-lg transition-all border border-cyan-500/30"
            >
              {showCode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showCode ? 'Hide' : 'Show'} Raw
            </button>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-500/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 h-[calc(100vh-100px)] overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Analysis Summary */}
            <div className="bg-gray-900/60 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Radar className="w-6 h-6 mr-2 text-cyan-400 animate-spin" />
                Threat Analysis Dashboard
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-300 text-sm">Critical Threats</p>
                      <p className="text-2xl font-bold text-red-400">2</p>
                    </div>
                    <Skull className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-300 text-sm">High Risk</p>
                      <p className="text-2xl font-bold text-yellow-400">3</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm">Medium Risk</p>
                      <p className="text-2xl font-bold text-blue-400">1</p>
                    </div>
                    <Bug className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Analysis */}
            <div className="bg-gray-900/60 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Terminal className="w-6 h-6 mr-2 text-green-400" />
                Detailed Security Report
              </h3>
              <div 
                className="analysis-results fullscreen-analysis"
                dangerouslySetInnerHTML={{ __html: processedAnalysis || result.analysis }}
              />
            </div>

            {/* Raw Response in Fullscreen */}
            {showCode && (
              <div className="bg-gray-900/60 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Code className="w-6 h-6 mr-2 text-yellow-400" />
                  Raw API Response
                </h3>
                <pre className="text-sm text-gray-300 bg-black/60 p-6 rounded-lg overflow-auto border border-gray-700/30 font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Enhanced Cyber Grid Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(6,182,212,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        </div>
        
        {/* Enhanced Floating Security Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 text-cyan-400/20 animate-pulse">
            <Terminal className="w-8 h-8" />
          </div>
          <div className="absolute top-40 right-20 text-red-400/20 animate-pulse delay-1000">
            <Skull className="w-6 h-6" />
          </div>
          <div className="absolute bottom-40 left-20 text-yellow-400/20 animate-pulse delay-2000">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="absolute bottom-20 right-10 text-green-400/20 animate-pulse delay-500">
            <Shield className="w-8 h-8" />
          </div>
          <div className="absolute top-60 left-1/2 text-purple-400/20 animate-pulse delay-1500">
            <Lock className="w-6 h-6" />
          </div>
          <div className="absolute top-32 right-1/3 text-blue-400/20 animate-pulse delay-700">
            <Network className="w-7 h-7" />
          </div>
          <div className="absolute bottom-60 right-1/4 text-cyan-400/20 animate-pulse delay-300">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="absolute top-1/2 left-16 text-orange-400/20 animate-pulse delay-1200">
            <HardDrive className="w-8 h-8" />
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 animate-ping">
                <Shield className="w-12 h-12 text-cyan-400/30 mx-auto" />
              </div>
              <Shield className="w-12 h-12 text-cyan-400 mr-4 animate-pulse relative z-10" />
              <div className="relative">
                <h1 className="text-5xl font-bold text-white">
                  Bug<span className="text-cyan-400">Hound</span>
                </h1>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-20 blur-sm"></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-cyan-400 text-xl font-semibold flex items-center justify-center">
                <Bug className="w-5 h-5 mr-2 animate-bounce" />
                🐕 Advanced Cyber Threat Detection System
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-1 text-green-400 animate-pulse" />
                  System Online
                </div>
                <div className="flex items-center">
                  <Radar className="w-4 h-4 mr-1 text-blue-400 animate-spin" />
                  AI Powered
                </div>
                <div className="flex items-center">
                  <Crosshair className="w-4 h-4 mr-1 text-purple-400" />
                  Real-time Analysis
                </div>
                <div className="flex items-center">
                  <Network className="w-4 h-4 mr-1 text-orange-400" />
                  Threat Intelligence
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Enhanced Input Panel */}
              <div className="bg-gray-800/60 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                    <div className="p-2 bg-yellow-400/20 rounded-lg mr-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                    Security Scan Input
                    <div className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                      READY
                    </div>
                  </h2>

                  {/* Enhanced Tab Navigation */}
                  <div className="flex space-x-1 mb-6 bg-gray-900/70 p-1 rounded-lg border border-gray-700/50">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            clearResults();
                          }}
                          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all relative ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg border border-cyan-400/50'
                              : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                          {tab.label}
                          {activeTab === tab.id && (
                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-pulse"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === 'url' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-cyan-400" />
                          Target Website URL
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://target-website.com"
                          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                        />
                      </div>
                    )}

                    {activeTab === 'file' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                          <Upload className="w-4 h-4 mr-2 text-cyan-400" />
                          Upload Source File
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".html,.htm,.js,.jsx,.ts,.tsx,.php,.py,.java,.cpp,.c,.cs,.rb,.go,.rs"
                            className="w-full px-4 py-3 bg-gray-900/70 border border-gray-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gradient-to-r file:from-cyan-600 file:to-blue-600 file:text-white file:cursor-pointer hover:file:from-cyan-700 hover:file:to-blue-700 transition-all"
                          />
                        </div>
                        {file && (
                          <div className="mt-2 text-sm text-cyan-400 flex items-center bg-cyan-900/20 p-2 rounded border border-cyan-500/30">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'code' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                          <Code className="w-4 h-4 mr-2 text-cyan-400" />
                          Paste Source Code
                        </label>
                        <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="// Paste your code here for security analysis..."
                          className="w-full h-40 px-4 py-3 bg-gray-900/70 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono text-sm backdrop-blur-sm"
                        />
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="text-red-300">
                          <div className="font-medium mb-1">Analysis Failed</div>
                          <div className="text-sm opacity-90">{error}</div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Analyze Button */}
                    <button
                      onClick={analyzeCode}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 border border-red-500/50 hover:border-red-400/70 shadow-lg hover:shadow-red-500/25 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-600/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <div className="relative z-10 flex items-center">
                        {loading ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                            <span>Scanning for Vulnerabilities...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 animate-pulse" />
                            <span>🔍 Initiate Security Scan</span>
                            <Crosshair className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Results Panel */}
              <div className="bg-gray-800/60 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white flex items-center">
                      <div className="p-2 bg-green-400/20 rounded-lg mr-3">
                        <Shield className="w-6 h-6 text-green-400 animate-pulse" />
                      </div>
                      Analysis Results
                      {result && (
                        <div className="ml-4 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30 animate-pulse">
                          COMPLETE
                        </div>
                      )}
                    </h2>
                    
                    {result && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowCode(!showCode)}
                          className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 bg-gray-700/50 px-3 py-1 rounded-lg transition-all border border-cyan-500/30"
                        >
                          {showCode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                          Raw
                        </button>
                        <button
                          onClick={() => setIsFullscreen(true)}
                          className="flex items-center text-sm text-purple-400 hover:text-purple-300 bg-gray-700/50 px-3 py-1 rounded-lg transition-all border border-purple-500/30"
                        >
                          <Maximize2 className="w-4 h-4 mr-1" />
                          Fullscreen
                        </button>
                        <button
                          onClick={clearResults}
                          className="flex items-center text-sm text-red-400 hover:text-red-300 bg-gray-700/50 px-3 py-1 rounded-lg transition-all border border-red-500/30"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {loading && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center space-x-4 bg-gray-900/70 px-6 py-4 rounded-lg border border-cyan-500/30">
                        <div className="relative">
                          <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
                          <div className="absolute inset-0 animate-ping">
                            <Loader className="w-8 h-8 text-cyan-400/30" />
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-white font-medium">Security Analysis in Progress</div>
                          <div className="text-cyan-400 text-sm animate-pulse">Deep scanning for vulnerabilities...</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!loading && !result && (
                    <div className="text-center py-16 text-gray-400">
                      <div className="space-y-4">
                        <div className="flex justify-center space-x-4 mb-6">
                          <div className="p-3 bg-gray-700/30 rounded-full">
                            <Server className="w-8 h-8 text-gray-500" />
                          </div>
                          <div className="p-3 bg-gray-700/30 rounded-full">
                            <Activity className="w-8 h-8 text-gray-500" />
                          </div>
                          <div className="p-3 bg-gray-700/30 rounded-full">
                            <Network className="w-8 h-8 text-gray-500" />
                          </div>
                        </div>
                        <p className="text-lg">Ready to analyze your code for security vulnerabilities</p>
                        <p className="text-sm text-gray-500">Select an input method and initiate the security scan</p>
                      </div>
                    </div>
                  )}

                  {result && !showCode && (
                    <div className="space-y-4">
                      <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Analysis Type</span>
                          <span className="text-cyan-400 font-medium capitalize">{result.input_type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Status</span>
                          <div className="flex items-center text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-1 max-h-96 overflow-auto">
                        <div 
                          className="analysis-results"
                          dangerouslySetInnerHTML={{ __html: processedAnalysis || result.analysis }}
                        />
                      </div>
                    </div>
                  )}

                  {result && showCode && (
                    <div className="space-y-4">
                      <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                          <Code className="w-5 h-5 mr-2 text-yellow-400" />
                          Raw API Response
                        </h3>
                        <pre className="text-sm text-gray-300 bg-black/50 p-4 rounded-lg overflow-auto max-h-80 font-mono border border-gray-700/30">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-6 bg-gray-800/40 backdrop-blur-lg px-6 py-3 rounded-full border border-gray-700/30">
                <div className="flex items-center text-sm text-gray-400">
                  <Wifi className="w-4 h-4 mr-2 text-green-400 animate-pulse" />
                  Connected to Security API
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="flex items-center text-sm text-gray-400">
                  <Lock className="w-4 h-4 mr-2 text-blue-400" />
                  Encrypted Analysis
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="flex items-center text-sm text-gray-400">
                  <Activity className="w-4 h-4 mr-2 text-purple-400" />
                  Real-time Threat Detection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal />

      <style jsx>{`
        .analysis-results {
          color: #e5e7eb;
          line-height: 1.7;
        }
        
        .analysis-results .cyber-container {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.6));
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.75rem;
          padding: 1.5rem;
          backdrop-filter: blur(8px);
        }
        
        .analysis-results .section-header {
          margin: 2rem 0 1rem 0;
          padding: 0.75rem 1rem;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(147, 51, 234, 0.1));
          border-left: 4px solid #06b6d4;
          border-radius: 0.5rem;
          backdrop-filter: blur(4px);
        }
        
        .analysis-results .section-header.level-1 h2 {
          color: #06b6d4;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        
        .analysis-results .section-header.level-2 h3 {
          color: #10b981;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }
        
        .analysis-results .section-header.level-3 h4 {
          color: #f59e0b;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }
        
        .analysis-results .vulnerability-container {
          margin: 1.5rem 0;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid;
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.4));
          backdrop-filter: blur(8px);
        }
        
        .analysis-results .vulnerability-container.critical {
          border-color: rgba(239, 68, 68, 0.5);
          background: linear-gradient(135deg, rgba(127, 29, 29, 0.3), rgba(17, 24, 39, 0.8));
        }
        
        .analysis-results .vulnerability-container.high {
          border-color: rgba(245, 158, 11, 0.5);
          background: linear-gradient(135deg, rgba(146, 64, 14, 0.3), rgba(17, 24, 39, 0.8));
        }
        
        .analysis-results .vulnerability-container.medium {
          border-color: rgba(59, 130, 246, 0.5);
          background: linear-gradient(135deg, rgba(29, 78, 216, 0.2), rgba(17, 24, 39, 0.8));
        }
        
        .analysis-results .vulnerability-container.low {
          border-color: rgba(16, 185, 129, 0.5);
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(17, 24, 39, 0.8));
        }
        
        .analysis-results .vulnerability-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }
        
        .analysis-results .threat-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .analysis-results .threat-badge.critical {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.5);
        }
        
        .analysis-results .threat-badge.high {
          background: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
          border: 1px solid rgba(245, 158, 11, 0.5);
        }
        
        .analysis-results .threat-badge.medium {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          border: 1px solid rgba(59, 130, 246, 0.5);
        }
        
        .analysis-results .threat-badge.low {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.5);
        }
        
        .analysis-results .code-block-container {
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(75, 85, 99, 0.5);
          background: rgba(17, 24, 39, 0.8);
        }
        
        .analysis-results .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: linear-gradient(90deg, rgba(75, 85, 99, 0.5), rgba(55, 65, 81, 0.5));
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
        }
        
        .analysis-results .code-lang {
          color: #06b6d4;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .analysis-results .code-icon {
          color: #f59e0b;
        }
        
        .analysis-results .code-block {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1.5rem;
          overflow-x: auto;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 0;
        }
        
        .analysis-results .inline-code {
          background: rgba(6, 182, 212, 0.15);
          color: #67e8f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 0.875rem;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .analysis-results .list-container {
          margin: 1rem 0;
        }
        
        .analysis-results .custom-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .analysis-results .list-item {
          padding: 0.5rem 0 0.5rem 1.5rem;
          position: relative;
          border-left: 2px solid rgba(6, 182, 212, 0.3);
          margin: 0.5rem 0;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.05), transparent);
          border-radius: 0 0.375rem 0.375rem 0;
        }
        
        .analysis-results .list-item::before {
          content: '▶';
          position: absolute;
          left: 0.5rem;
          color: #06b6d4;
          font-size: 0.75rem;
        }
        
        .analysis-results .risk-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-radius: 0.5rem;
          border: 1px solid;
          position: relative;
          overflow: hidden;
        }
        
        .analysis-results .risk-item.critical {
          border-color: rgba(239, 68, 68, 0.5);
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), transparent);
        }
        
        .analysis-results .risk-item.high {
          border-color: rgba(245, 158, 11, 0.5);
          background: linear-gradient(90deg, rgba(245, 158, 11, 0.1), transparent);
        }
        
        .analysis-results .risk-item.medium {
          border-color: rgba(59, 130, 246, 0.5);
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
        }
        
        .analysis-results .risk-item.low {
          border-color: rgba(16, 185, 129, 0.5);
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.1), transparent);
        }
        
        .analysis-results .risk-meter {
          width: 60px;
          height: 4px;
          background: rgba(75, 85, 99, 0.3);
          border-radius: 2px;
          margin-left: auto;
          overflow: hidden;
        }
        
        .analysis-results .risk-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        
        .analysis-results .risk-fill.critical {
          width: 100%;
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }
        
        .analysis-results .risk-fill.high {
          width: 80%;
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }
        
        .analysis-results .risk-fill.medium {
          width: 60%;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
        }
        
        .analysis-results .risk-fill.low {
          width: 30%;
          background: linear-gradient(90deg, #10b981, #059669);
        }
        
        .analysis-results .vulnerable-indicator {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .analysis-results .vulnerable-indicator.critical {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.5);
        }
        
        .analysis-results .vulnerable-label {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
          color: #fca5a5;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(239, 68, 68, 0.5);
          font-weight: 600;
          display: inline-block;
          margin: 0.5rem 0;
        }
        
        .analysis-results .secure-label {
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
          color: #6ee7b7;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(16, 185, 129, 0.5);
          font-weight: 600;
          display: inline-block;
          margin: 0.5rem 0;
        }
        
        .analysis-results .content-paragraph {
          margin: 1rem 0;
        }
        
        .analysis-results .bold-text {
          color: #06b6d4;
          font-weight: 700;
        }
        
        .analysis-results .cyber-emphasis {
          text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
        }
        
        .analysis-results .cyber-text {
          background: linear-gradient(90deg, #06b6d4, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .analysis-results .italic-text {
          color: #9ca3af;
        }
        
        .analysis-results .cyber-dim {
          opacity: 0.8;
        }
        
        /* Fullscreen specific styles */
        .fullscreen-analysis {
          font-size: 1.1rem;
          line-height: 1.8;
        }
        
        .fullscreen-analysis .section-header {
          margin: 2.5rem 0 1.5rem 0;
          padding: 1rem 1.5rem;
        }
        
        .fullscreen-analysis .vulnerability-container {
          margin: 2rem 0;
          padding: 1.5rem;
        }
        
        .fullscreen-analysis .code-block {
          padding: 2rem;
          font-size: 1rem;
        }
        
        /* Scrollbar styling */
        .analysis-results::-webkit-scrollbar {
          width: 8px;
        }
        
        .analysis-results::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        
        .analysis-results::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #8b5cf6);
          border-radius: 4px;
        }
        
        .analysis-results::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0891b2, #7c3aed);
        }
      `}</style>
    </>
  );
}