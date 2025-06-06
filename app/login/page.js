'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Eye, EyeOff, AlertTriangle, User, ArrowLeft, Zap } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const success = await login(username, password)
      if (success) {
        router.push('/')
        router.refresh()
        setError('')
      } else {
        setError('Invalid username or password')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push('/')
  }

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
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Bug<span className="text-cyan-400">Hound</span>
                </h1>
                <p className="text-xs text-gray-400">Secure Access Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">System Secure</span>
            </div>
          </div>
        </nav>

        {/* Login Form */}
        <div className="flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <Lock className="w-16 h-16 text-cyan-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Secure Access
              </h2>
              <p className="text-gray-400">
                Enter your credentials to access BugHound Security Scanner
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-cyan-500/25"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Secure Login
                    </>
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Protected by military-grade encryption</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Need help? Contact your system administrator
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-lg font-bold text-white">
                Bug<span className="text-cyan-400">Hound</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              © 2024 BugHound Security Scanner. All access monitored and logged.
            </p>
            <div className="flex items-center justify-center mt-2 space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Secure connection established</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}