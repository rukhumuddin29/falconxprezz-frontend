import { defineStore } from 'pinia'
import api from '@/api/http'

const STORAGE_KEY = 'fx_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem(STORAGE_KEY) || '',
    loading: false,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    roles: (state) => state.user?.roles || [],
    hasRole: (state) => (roles) => {
      if (!roles || roles.length === 0) return true
      const allowed = Array.isArray(roles) ? roles : [roles]
      return state.user?.roles?.some((role) => allowed.includes(role))
    },
    defaultDashboardRoute(state) {
      const priority = ['super_admin', 'admin', 'vendor', 'agent', 'customer']
      const map = {
        super_admin: { name: 'super.dashboard' },
        admin: { name: 'admin.dashboard' },
        vendor: { name: 'vendor.dashboard' },
        agent: { name: 'agent.dashboard' },
        customer: { name: 'customer.dashboard' },
      }

      const next = priority.find((role) => state.user?.roles?.includes(role))
      return map[next] || { name: 'login' }
    },
  },
  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem(STORAGE_KEY, token)
    },
    clearSession() {
      this.token = ''
      this.user = null
      localStorage.removeItem(STORAGE_KEY)
    },
    async login(payload) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/login', payload)
        this.setSession(data.token, data.user)
        return data.user
      } finally {
        this.loading = false
      }
    },
    async fetchUser() {
      if (!this.token) return null
      const { data } = await api.get('/auth/me')
      this.user = data.data ?? data // Resource wraps data by default
      return this.user
    },
    async logout() {
      try {
        if (this.token) {
          await api.post('/auth/logout')
        }
      } catch (error) {
        // ignore network errors on logout
      } finally {
        this.clearSession()
      }
    },
    async bootstrap() {
      if (this.initialized) return
      this.initialized = true

      if (this.token) {
        try {
          await this.fetchUser()
        } catch (error) {
          this.clearSession()
        }
      }
    },
  },
})
