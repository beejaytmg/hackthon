'use client'
import { useState, useEffect } from "react"
export function useAuth(){
    const [accessToken, setAccessToken] = useState(null)
    const [refreshToken, setRefreshToken] = useState(null)  
    useEffect(() => {
      // Load tokens from localStorage on initial render
      const storedAccessToken = localStorage.getItem('accessToken')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      if (storedAccessToken && storedRefreshToken) {
        setAccessToken(storedAccessToken)
        setRefreshToken(storedRefreshToken)
      }
    }, [])
    const login = async (username, password) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })
          const data = await response.json()
          if (response.ok) {
            setAccessToken(data.access)
            setRefreshToken(data.refresh)
            localStorage.setItem('accessToken', data.access)
            localStorage.setItem('refreshToken', data.refresh)
            return true
          }
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      }
      const refreshAccessToken = async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          })
          const data = await response.json()
          if (response.ok) {
            setAccessToken(data.access)
            localStorage.setItem('accessToken', data.access)
            return true
          }
          return false
        } catch (error) {
          console.error('Token refresh error:', error)
          return false
        }
      }
    return {login, refreshAccessToken}
}