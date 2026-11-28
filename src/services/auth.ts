import {
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";

const session = getDefaultSession();
let restorePromise: Promise<void> | null = null;
let isRestored = false;

export async function restoreSession() {
  if (isRestored) {
    return Promise.resolve();
  }

  if (!restorePromise) {
    restorePromise = (async () => {
      try {
        await handleIncomingRedirect({ restorePreviousSession: true });
        isRestored = true;
      } catch (error) {
        throw error;
      } finally {
        restorePromise = null;
      }
    })();
  }

  return restorePromise;
}

export function getAuthedFetch(): typeof fetch {
  if (!session.info.isLoggedIn) throw new Error("Session is invalid");
  return session.fetch;
}

export async function resetInvalidSession() {
  isRestored = false;
  restorePromise = null;
  await logout();
}

export async function signIn(oidcIssuer: string, callbackPath = "/") {
  const redirectUrl = new URL(callbackPath, window.location.href).toString();

  await login({
    oidcIssuer,
    redirectUrl,
    clientName: "SOLID TaskFlow",
  });
}

export async function signOut() {
  isRestored = false;
  restorePromise = null;
  await logout();
}

export const sessionInfo = () => session.info;
