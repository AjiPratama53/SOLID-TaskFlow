import { getDefaultSession, handleIncomingRedirect, login, logout } from '@inrupt/solid-client-authn-browser'

const session = getDefaultSession()

export async function restoreSession() {
  await handleIncomingRedirect({ restorePreviousSession: true })
  return session.info
}

export function signIn(oidcIssuer: string) {
  return login({ oidcIssuer, redirectUrl: window.location.href, clientName: 'OTAku' })
}

export const signOut = () => logout()
export const authFetch = (...args: Parameters<typeof fetch>) => session.fetch(...args)
export const sessionInfo = () => session.info
