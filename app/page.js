'use client';

import { useState, useEffect } from 'react';
import { Shield, Bug, Zap, Lock, Globe, Code, AlertTriangle, CheckCircle, ArrowRight, Eye, Target, Database, FileSearch, Skull, TrendingUp, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';

export default function HomePage() {
  const [stats, setStats] = useState({
    scansCompleted: 0,
    vulnerabilitiesFound: 0,
    threatsBlocked: 0
  });
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  // Animate stats on load
  useEffect(() => {
    const animateStats = () => {
      const targets = { scansCompleted: 15847, vulnerabilitiesFound: 3421, threatsBlocked: 892 };
      const duration = 2000;
      const steps = 60;
      const increment = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setStats({
          scansCompleted: Math.floor(targets.scansCompleted * progress),
          vulnerabilitiesFound: Math.floor(targets.vulnerabilitiesFound * progress),
          threatsBlocked: Math.floor(targets.threatsBlocked * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
          setStats(targets);
        }
      }, increment);
    };

    animateStats();
  }, []);

  const handleStartScanning = () => {
    router.push('/analyze');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  const vulnerabilityTypes = [
    { icon: Database, name: 'SQL Injection', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    { icon: Code, name: 'XSS Attacks', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    { icon: Lock, name: 'Auth Bypass', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    { icon: Zap, name: 'Command Injection', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { icon: FileSearch, name: 'Info Disclosure', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { icon: Globe, name: 'CSRF Flaws', color: 'text-green-400', bgColor: 'bg-green-500/10' }
  ];

  const features = [
    {
      icon: Target,
      title: 'Precision Detection',
      description: 'Advanced AI algorithms detect even the most sophisticated vulnerabilities with 99.9% accuracy.',
      color: 'text-cyan-400'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Complete security analysis in under 2 minutes. No more waiting hours for scan results.',
      color: 'text-yellow-400'
    },
    {
      icon: Shield,
      title: 'Enterprise Grade',
      description: 'Military-grade security scanning trusted by Fortune 500 companies worldwide.',
      color: 'text-green-400'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Monitoring',
      description: '24/7 continuous monitoring and instant alerts for emerging security threats.',
      color: 'text-purple-400'
    }
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
        <div className="absolute top-1/3 left-2/3 w-1 h-1 bg-red-400/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Bug<span className="text-cyan-400">Hound</span>
                </h1>
                <p className="text-xs text-gray-400">Sniffing out bugs before the hackers do!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">System Online</span>
              </div>
              
              {/* Conditional Login/User Section */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="text-white">{user?.username || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Bug className="w-16 h-16 text-red-400 mr-4 animate-bounce" />
              <div className="text-6xl font-bold text-white">
                🐕
              </div>
              <Skull className="w-16 h-16 text-red-400 ml-4 animate-pulse" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Bug<span className="text-cyan-400">Hound</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-cyan-400 font-semibold mb-4">
              Sniffing out bugs before the hackers do!
            </p>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-powered security vulnerability scanner that detects XSS, SQL injection, 
              CSRF, and other critical security flaws in your applications before malicious actors can exploit them.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={handleStartScanning}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-cyan-500/25"
              >
                <Shield className="w-6 h-6 mr-2" />
                Start Security Hunt
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button className="border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              🐕 BugHound in Action
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  {stats.scansCompleted.toLocaleString()}
                </div>
                <div className="text-gray-300 mb-2">Security Scans Completed</div>
                <div className="flex items-center justify-center text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% this week
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-red-400 mb-2">
                  {stats.vulnerabilitiesFound.toLocaleString()}
                </div>
                <div className="text-gray-300 mb-2">Vulnerabilities Found</div>
                <div className="flex items-center justify-center text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Critical threats detected
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {stats.threatsBlocked.toLocaleString()}
                </div>
                <div className="text-gray-300 mb-2">Threats Blocked</div>
                <div className="flex items-center justify-center text-green-400 text-sm">
                  <Shield className="w-4 h-4 mr-1" />
                  99.9% success rate
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vulnerability Types */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Threats We Hunt Down
            </h2>
            <p className="text-gray-400 text-center mb-12">
              BugHound's AI detects and neutralizes these common security vulnerabilities
            </p>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              {vulnerabilityTypes.map((vuln, index) => {
                const Icon = vuln.icon;
                return (
                  <div
                    key={index}
                    className={`${vuln.bgColor} border border-gray-700/50 rounded-xl p-6 text-center hover:scale-105 transition-transform duration-200`}
                  >
                    <Icon className={`w-12 h-12 ${vuln.color} mx-auto mb-3`} />
                    <h3 className="text-white font-semibold text-sm">{vuln.name}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why Choose BugHound?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <Icon className={`w-12 h-12 ${feature.color} mb-4`} />
                    <h3 className="text-white font-semibold text-lg mb-3">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-12">
              <div className="text-6xl mb-6">🐕</div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Hunt Some Bugs?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of developers who trust BugHound to keep their applications secure.
              </p>
              <button
                onClick={handleStartScanning}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
              >
                🔍 Start Your First Hunt
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-cyan-400 mr-2" />
              <span className="text-xl font-bold text-white">
                Bug<span className="text-cyan-400">Hound</span>
              </span>
            </div>
            <p className="text-gray-400 mb-2">Sniffing out bugs before the hackers do!</p>
            <p className="text-xs text-gray-500">
              © 2024 BugHound Security Scanner. Powered by Advanced AI Security Analysis.
            </p>
            <div className="flex items-center justify-center mt-4 space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Securing the web, one scan at a time</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}