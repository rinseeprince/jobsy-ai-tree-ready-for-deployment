import { supabase } from './supabase'

export class SessionManager {
  private static instance: SessionManager
  private currentUser: any = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  async initialize() {
    if (this.isInitialized) return this.currentUser

    try {
      if (!supabase) {
        console.error('Supabase not configured')
        return null
      }

      const response = await supabase.auth.getUser()
      
      if (response.error) {
        console.error('Session initialization error:', response.error)
        return null
      }

      this.currentUser = response.data.user
      this.isInitialized = true
      
      // Set up auth state listener
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        this.currentUser = session?.user || null
        this.isInitialized = true
      })

      return response.data.user
    } catch (error) {
      console.error('Session initialization failed:', error)
      return null
    }
  }

  async getUser() {
    if (!this.isInitialized) {
      return await this.initialize()
    }
    return this.currentUser
  }

  async refreshSession() {
    try {
      if (!supabase) {
        console.error('Supabase not configured')
        return null
      }

      const response = await supabase.auth.refreshSession()
      
      if (response.error) {
        console.error('Session refresh error:', response.error)
        return null
      }

      this.currentUser = response.data.user
      return response.data.user
    } catch (error) {
      console.error('Session refresh failed:', error)
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUser
  }

  clearSession() {
    this.currentUser = null
    this.isInitialized = false
  }
}

export const sessionManager = SessionManager.getInstance() 