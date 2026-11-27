import type { SolidUserProfile } from '@/schemas/session'
import { api } from '@/services/api'
import {
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from '@inrupt/solid-client-authn-browser'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
  // States
  const isLoggedIn = ref(false)
  const webId = ref<string | null>(null)
  const isRestoring = ref(true)
  const error = ref<string | null>(null)
  const profile = ref<SolidUserProfile | null>(null)

  let listenersAttached = false
  let sessionInitialization: Promise<void> | null = null

  // Getters
  const isAuthenticated = computed(
    () => isLoggedIn.value && Boolean(webId.value),
  )

  const getProfile = computed(() => profile.value)

  // Actions
  function syncFromSession() {
    const { info } = getDefaultSession()
    isLoggedIn.value = Boolean(info.isLoggedIn)
    webId.value = info.webId ?? null
    if (!isLoggedIn.value) profile.value = null
  }

  function attachSessionListeners() {
    if (listenersAttached) return
    const session = getDefaultSession()

    session.events?.on('login', syncFromSession)
    session.events?.on('logout', syncFromSession)
    listenersAttached = true
  }

  async function restoreSession() {
    isRestoring.value = true
    error.value = null

    try {
      attachSessionListeners()
      await handleIncomingRedirect({ restorePreviousSession: true })
      syncFromSession()
      if (isAuthenticated.value) await loadProfile()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memulihkan sesi Solid.'
      syncFromSession()
    } finally {
      isRestoring.value = false
    }
  }

  function initSession() {
    sessionInitialization ??= restoreSession()
    return sessionInitialization
  }

  async function signIn(oidcIssuer: string, callbackPath = '/dashboard') {
    error.value = null

    try {
      if (!oidcIssuer.trim()) {
        throw new Error('Masukkan URL provider Solid.')
      }

      const issuer = new URL(oidcIssuer.trim())
      const isLocalHttp =
        issuer.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(issuer.hostname)

      if (
        (issuer.protocol !== 'https:' && !isLocalHttp) ||
        issuer.username ||
        issuer.password
      ) {
        throw new Error('Gunakan URL provider HTTPS yang valid.')
      }

      if (!callbackPath.startsWith('/') || callbackPath.startsWith('//')) {
        throw new Error('Path callback login tidak valid.')
      }

      const callbackUrl = new URL(callbackPath, window.location.href)
      if (callbackUrl.origin !== window.location.origin) {
        throw new Error('Path callback login harus berasal dari aplikasi ini.')
      }

      await login({
        oidcIssuer: issuer.toString(),
        redirectUrl: callbackUrl.toString(),
        clientName: 'SOLID TaskFlow',
      })
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memulai login Solid.'
      throw err
    }
  }

  async function signOut() {
    error.value = null
    try {
      await logout()
      syncFromSession()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal mengakhiri sesi Solid.'
      throw err
    }
  }

  async function loadProfile() {
    if (!webId.value) {
      profile.value = null
      return
    }

    try {
      profile.value = await api.session.get(webId.value)
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memuat profil WebID.'
    }
  }

  return {
    isLoggedIn,
    webId,
    isRestoring,
    error,
    isAuthenticated,
    getProfile,
    syncFromSession,
    initSession,
    signIn,
    signOut,
    loadProfile,
  }
})
