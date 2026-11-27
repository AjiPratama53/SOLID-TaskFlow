// // @vitest-environment node
// import { beforeEach, describe, expect, it, vi } from 'vitest'

// const {
//   mockSession,
//   mockHandleIncomingRedirect,
//   mockLogin,
//   mockLogout,
// } = vi.hoisted(() => ({
//   mockSession: {
//     info: { isLoggedIn: false, sessionId: 'test-session', webId: undefined as string | undefined },
//     fetch: vi.fn(),
//   },
//   mockHandleIncomingRedirect: vi.fn(),
//   mockLogin: vi.fn(),
//   mockLogout: vi.fn(),
// }))

// vi.mock('@inrupt/solid-client-authn-browser', () => ({
//   getDefaultSession: () => mockSession,
//   handleIncomingRedirect: mockHandleIncomingRedirect,
//   login: mockLogin,
//   logout: mockLogout,
// }))

// import { authFetch, restoreSession, sessionInfo, signIn, signOut } from './auth'

// describe('auth service', () => {
//   beforeEach(() => {
//     mockSession.info = {
//       isLoggedIn: false,
//       sessionId: 'test-session',
//       webId: undefined,
//     }
//     mockSession.fetch.mockReset()
//     mockHandleIncomingRedirect.mockReset()
//     mockLogin.mockReset()
//     mockLogout.mockReset()
//     vi.stubGlobal('window', {
//       location: {
//         href: 'https://otaku.example/login',
//         origin: 'https://otaku.example',
//       },
//     })
//   })

//   it('restores a previous Solid session and deduplicates concurrent calls', async () => {
//     let resolveRedirect!: () => void
//     mockHandleIncomingRedirect.mockImplementation(
//       () =>
//         new Promise<void>((resolve) => {
//           resolveRedirect = () => {
//             mockSession.info = {
//               isLoggedIn: true,
//               sessionId: 'restored-session',
//               webId: 'https://alice.solidcommunity.net/profile/card#me',
//             }
//             resolve()
//           }
//         }),
//     )

//     const first = restoreSession()
//     const second = restoreSession()

//     expect(mockHandleIncomingRedirect).toHaveBeenCalledTimes(1)
//     expect(mockHandleIncomingRedirect).toHaveBeenCalledWith({
//       restorePreviousSession: true,
//     })

//     resolveRedirect()
//     const [info1, info2] = await Promise.all([first, second])

//     expect(info1.isLoggedIn).toBe(true)
//     expect(info1.webId).toBe('https://alice.solidcommunity.net/profile/card#me')
//     expect(info2).toEqual(info1)
//   })

//   it('skips handleIncomingRedirect when session is already logged in', async () => {
//     mockSession.info = {
//       isLoggedIn: true,
//       sessionId: 'active-session',
//       webId: 'https://alice.solidcommunity.net/profile/card#me',
//     }

//     const info = await restoreSession()

//     expect(mockHandleIncomingRedirect).not.toHaveBeenCalled()
//     expect(info.isLoggedIn).toBe(true)
//   })

//   it('validates issuer URL and calls Solid login with same-origin redirectUrl', async () => {
//     await signIn('https://solidcommunity.net', 'https://otaku.example/dashboard')

//     expect(mockLogin).toHaveBeenCalledWith({
//       oidcIssuer: 'https://solidcommunity.net/',
//       redirectUrl: 'https://otaku.example/dashboard',
//       clientName: 'OTAku',
//     })
//   })

//   it('rejects empty, non-HTTPS, and cross-origin login requests', () => {
//     expect(() => signIn('   ')).toThrow('Masukkan URL provider Solid.')
//     expect(() => signIn('http://solidcommunity.net')).toThrow(
//       'Gunakan URL provider HTTPS yang valid.',
//     )
//     expect(() =>
//       signIn('https://solidcommunity.net', 'https://evil.example/callback'),
//     ).toThrow('URL callback login harus berasal dari aplikasi ini.')
//     expect(mockLogin).not.toHaveBeenCalled()
//   })

//   it('delegates signOut, sessionInfo, and authFetch to the Solid session', async () => {
//     mockSession.info.isLoggedIn = true
//     mockSession.info.webId = 'https://alice.solidcommunity.net/profile/card#me'

//     expect(sessionInfo().webId).toBe(
//       'https://alice.solidcommunity.net/profile/card#me',
//     )

//     await authFetch('https://alice.solidcommunity.net/private/tasks.ttl')
//     expect(mockSession.fetch).toHaveBeenCalledWith(
//       'https://alice.solidcommunity.net/private/tasks.ttl',
//     )

//     await signOut()
//     expect(mockLogout).toHaveBeenCalledTimes(1)
//   })
// })
