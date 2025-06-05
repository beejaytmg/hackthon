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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://portbijay.pythonanywhere.com';

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
      // Mock authentication for demo
      const accessToken = 'demo-token';

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

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult = {
        input_type: activeTab,
        analysis: `# Security Analysis Report

## Executive Summary
Our BugHound scan has detected several critical vulnerabilities in your code that require immediate attention.

### 1. SQL Injection Vulnerability
**Risk:** Critical
**Location:** Line 45, user input processing
**Description:** User input is directly concatenated into SQL queries without proper sanitization.

Vulnerable Code:
\`\`\`sql
SELECT * FROM users WHERE id = ' + userId + '
\`\`\`

Secure Fix:
\`\`\`sql
SELECT * FROM users WHERE id = ?
\`\`\`

### 2. Cross-Site Scripting (XSS)
**Risk:** High
**Location:** Output rendering function
**Description:** User data is rendered without HTML encoding.

- User input validation missing
- Output encoding not implemented
- CSP headers not configured

### 3. Command Injection
**Risk:** Medium
**Location:** File processing module
**Description:** System commands are executed with user-controlled input.

- Input sanitization bypassed
- Shell command execution detected
- Privilege escalation possible

### 4. Authentication Bypass
**Risk:** High
**Location:** Login verification
**Description:** Authentication mechanism can be circumvented.

## Recommendations
- Implement input validation and sanitization
- Use parameterized queries for database operations
- Apply proper output encoding for XSS prevention
- Enable comprehensive security headers
- Implement proper authentication mechanisms
- Add rate limiting and monitoring`
      };

      setResult(mockResult);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
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
                      <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                        <span className="text-red-300">{error}</span>
                      </div>
                    )}
{/* Enhanced Analyze Button */}
                    <button
                      onClick={analyzeCode}
                      disabled={loading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-2xl border border-red-500/30"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Scanning for Threats...</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 animate-pulse" />
                          <span>🐕 Unleash BugHound</span>
                          <Crosshair className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Results Panel */}
              <div className="bg-gray-800/60 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white flex items-center">
                      <div className="p-2 bg-green-400/20 rounded-lg mr-3">
                        <Shield className="w-6 h-6 text-green-400 animate-pulse" />
                      </div>
                      Analysis Results
                    </h2>
                    {result && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowCode(!showCode)}
                          className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 bg-gray-700/50 px-3 py-1 rounded-lg transition-all border border-cyan-500/30"
                        >
                          {showCode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                          {showCode ? 'Hide' : 'Show'} Raw
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
                          className="text-sm text-red-400 hover:text-red-300 bg-gray-700/50 px-3 py-1 rounded-lg transition-all border border-red-500/30"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {loading && (
                    <div className="text-center py-12">
                      <div className="relative">
                        <div className="absolute inset-0 animate-ping">
                          <Shield className="w-16 h-16 text-cyan-400/30 mx-auto" />
                        </div>
                        <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse relative z-10" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">🐕 BugHound is Hunting...</h3>
                      <p className="text-gray-400 mb-4">Analyzing code for vulnerabilities and security threats</p>
                      <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  )}

                  {!loading && !result && (
                    <div className="text-center py-12 text-gray-400">
                      <div className="mb-4">
                        <Bug className="w-16 h-16 mx-auto text-gray-600 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Ready for Analysis</h3>
                      <p>Select your input method and initiate the security scan</p>
                      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30">
                          <Server className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <div className="text-blue-400 font-medium">Web Analysis</div>
                          <div className="text-gray-500">Scan live websites</div>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30">
                          <Terminal className="w-6 h-6 text-green-400 mx-auto mb-2" />
                          <div className="text-green-400 font-medium">Code Analysis</div>
                          <div className="text-gray-500">Review source code</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result && !showCode && (
                    <div className="space-y-4">
                      <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300">Scan Type:</span>
                          <span className="text-sm text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded border border-cyan-500/30">
                            {result.input_type?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Status:</span>
                          <span className="text-sm text-green-400 bg-green-900/30 px-2 py-1 rounded border border-green-500/30 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </span>
                        </div>
                      </div>

                      <div 
                        className="analysis-results bg-gray-900/30 p-6 rounded-lg border border-gray-700/30 max-h-96 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: processedAnalysis || result.analysis }}
                      />
                    </div>
                  )}

                  {result && showCode && (
                    <div className="space-y-4">
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 flex items-center">
                        <Code className="w-5 h-5 text-yellow-400 mr-2" />
                        <span className="text-yellow-300 text-sm">Raw API Response Data</span>
                      </div>
                      <pre className="text-sm text-gray-300 bg-black/60 p-6 rounded-lg overflow-auto max-h-96 border border-gray-700/30 font-mono">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced CSS Styles */}
        <style jsx global>{`
          .analysis-results {
            color: #e5e7eb;
            line-height: 1.8;
          }
          
          .cyber-container {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(147, 51, 234, 0.05));
            border: 1px solid rgba(6, 182, 212, 0.2);
            border-radius: 12px;
            padding: 24px;
            backdrop-filter: blur(10px);
          }
          
          .section-header.level-1 h2 {
            color: #06b6d4;
            font-size: 1.875rem;
            font-weight: 700;
            margin: 24px 0 16px 0;
            padding: 12px 0;
            border-bottom: 2px solid rgba(6, 182, 212, 0.3);
            text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
          }
          
          .section-header.level-2 h3 {
            color: #a855f7;
            font-size: 1.5rem;
            font-weight: 600;
            margin: 20px 0 12px 0;
            text-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
          }
          
          .vulnerability-container {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            position: relative;
            overflow: hidden;
          }
          
          .vulnerability-container.critical {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(153, 27, 27, 0.1));
            border-color: rgba(239, 68, 68, 0.5);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
          }
          
          .vulnerability-container.high {
            background: linear-gradient(135deg, rgba(251, 146, 60, 0.12), rgba(194, 65, 12, 0.08));
            border-color: rgba(251, 146, 60, 0.4);
          }
          
          .vulnerability-container.medium {
            background: linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(161, 98, 7, 0.05));
            border-color: rgba(250, 204, 21, 0.3);
          }
          
          .vulnerability-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #f3f4f6;
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }
          
          .vuln-text {
            display: flex;
            align-items: center;
          }
          
          .threat-badge {
            font-size: 0.75rem;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .threat-badge.critical {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.5);
          }
          
          .threat-badge.high {
            background: rgba(251, 146, 60, 0.2);
            color: #fed7aa;
            border: 1px solid rgba(251, 146, 60, 0.5);
          }
          
          .threat-badge.medium {
            background: rgba(250, 204, 21, 0.2);
            color: #fef3c7;
            border: 1px solid rgba(250, 204, 21, 0.5);
          }
          
          .code-block-container {
            margin: 16px 0;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(75, 85, 99, 0.5);
            background: rgba(17, 24, 39, 0.8);
          }
          
          .code-header {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(147, 51, 234, 0.1));
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(75, 85, 99, 0.3);
          }
          
          .code-lang {
            color: #06b6d4;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          
          .code-icon {
            color: #fbbf24;
          }
          
          .code-block {
            background: rgba(0, 0, 0, 0.6);
            color: #e5e7eb;
            padding: 16px;
            margin: 0;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
          }
          
          .inline-code {
            background: rgba(6, 182, 212, 0.15);
            color: #67e8f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            border: 1px solid rgba(6, 182, 212, 0.3);
          }
          
          .list-container {
            margin: 16px 0;
          }
          
          .custom-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .list-item, .numbered-item {
            background: rgba(75, 85, 99, 0.2);
            margin: 8px 0;
            padding: 12px 16px;
            border-left: 4px solid rgba(6, 182, 212, 0.5);
            border-radius: 0 6px 6px 0;
            transition: all 0.3s ease;
          }
          
          .list-item:hover, .numbered-item:hover {
            background: rgba(75, 85, 99, 0.3);
            border-left-color: rgba(6, 182, 212, 0.8);
            transform: translateX(4px);
          }
          
          .risk-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
          }
          
          .risk-item.critical {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(153, 27, 27, 0.1));
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          
          .risk-item.high {
            background: linear-gradient(135deg, rgba(251, 146, 60, 0.12), rgba(194, 65, 12, 0.08));
            border: 1px solid rgba(251, 146, 60, 0.3);
          }
          
          .risk-item.medium {
            background: linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(161, 98, 7, 0.05));
            border: 1px solid rgba(250, 204, 21, 0.3);
          }
          
          .risk-meter {
            width: 60px;
            height: 4px;
            background: rgba(75, 85, 99, 0.3);
            border-radius: 2px;
            margin-left: auto;
            overflow: hidden;
          }
          
          .risk-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 0.3s ease;
          }
          
          .risk-fill.critical {
            width: 100%;
            background: linear-gradient(90deg, #ef4444, #dc2626);
          }
          
          .risk-fill.high {
            width: 80%;
            background: linear-gradient(90deg, #fb923c, #c2410c);
          }
          
          .risk-fill.medium {
            width: 60%;
            background: linear-gradient(90deg, #facc15, #a16207);
          }
          
          .vulnerable-indicator.critical {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid rgba(239, 68, 68, 0.5);
            font-weight: 600;
          }
          
          .vulnerable-label {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid rgba(239, 68, 68, 0.5);
            font-weight: 700;
            display: inline-block;
            margin: 8px 0;
          }
          
          .secure-label {
            background: rgba(34, 197, 94, 0.2);
            color: #86efac;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid rgba(34, 197, 94, 0.5);
            font-weight: 700;
            display: inline-block;
            margin: 8px 0;
          }
          
          .content-paragraph {
            margin: 16px 0;
            text-align: left;
          }
          
          .cyber-text {
            text-shadow: 0 0 8px currentColor;
          }
          
          .cyber-emphasis {
            color: #06b6d4;
            text-shadow: 0 0 6px rgba(6, 182, 212, 0.4);
          }
          
          .cyber-dim {
            color: #9ca3af;
          }
          
          .fullscreen-analysis {
            max-height: none !important;
            font-size: 1rem;
          }
          
          .fullscreen-analysis .section-header.level-1 h2 {
            font-size: 2.25rem;
          }
          
          .fullscreen-analysis .section-header.level-2 h3 {
            font-size: 1.75rem;
          }
          
          .fullscreen-analysis .vulnerability-container {
            margin: 24px 0;
            padding: 24px;
          }
          
          .fullscreen-analysis .code-block {
            font-size: 1rem;
            padding: 24px;
          }
        `}</style>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal />
    </>
  );
}