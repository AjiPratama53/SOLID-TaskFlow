// // @vitest-environment node
// import { beforeEach, describe, expect, it, vi } from 'vitest'
// import { createMemoryHistory, createRouter } from 'vue-router'

// const { mockRestoreSession } = vi.hoisted(() => ({
//   mockRestoreSession: vi.fn(),
// }))

// vi.mock('@/services/auth', () => ({
//   restoreSession: mockRestoreSession,
// }))

// vi.mock('@/views/Dashboard.vue', () => ({ default: { template: '<div />' } }))
// vi.mock('@/views/Home.vue', () => ({ default: { template: '<div />' } }))
// vi.mock('@/views/Login.vue', () => ({ default: { template: '<div />' } }))
// vi.mock('@/views/TaskDetail.vue', () => ({ default: { template: '<div />' } }))
// vi.mock('@/views/ValidateSubmission.vue', () => ({
//   default: { template: '<div />' },
// }))

// import { authGuard, routes } from './routes'

// function makeRouter() {
//   const router = createRouter({
//     history: createMemoryHistory(),
//     routes,
//   })
//   router.beforeEach(authGuard)
//   return router
// }

// describe('routes auth guard', () => {
//   beforeEach(() => {
//     mockRestoreSession.mockReset()
//   })

//   it('redirects unauthenticated users from / to /login', async () => {
//     mockRestoreSession.mockResolvedValue({ isLoggedIn: false })
//     const router = makeRouter()

//     await router.push('/')
//     await router.isReady()

//     expect(router.currentRoute.value.fullPath).toBe('/login')
//   })

//   it('preserves deep-link redirect target when unauthenticated', async () => {
//     mockRestoreSession.mockResolvedValue({ isLoggedIn: false })
//     const router = makeRouter()

//     await router.push('/tasks/tsk_001')
//     await router.isReady()

//     expect(router.currentRoute.value.path).toBe('/login')
//     expect(router.currentRoute.value.query).toEqual({ redirect: '/tasks/tsk_001' })
//   })

//   it('redirects unauthenticated users to /login when restoreSession rejects', async () => {
//     mockRestoreSession.mockRejectedValue(new Error('oidc error'))
//     const router = makeRouter()

//     await router.push('/')
//     await router.isReady()

//     expect(router.currentRoute.value.fullPath).toBe('/login')
//   })

//   it('redirects authenticated users from /login to /dashboard', async () => {
//     mockRestoreSession.mockResolvedValue({
//       isLoggedIn: true,
//       webId: 'https://alice.solidcommunity.net/profile/card#me',
//     })
//     const router = makeRouter()

//     await router.push('/login')
//     await router.isReady()

//     expect(router.currentRoute.value.fullPath).toBe('/dashboard')
//   })

//   it('allows authenticated users to access / and resolves to /dashboard', async () => {
//     mockRestoreSession.mockResolvedValue({
//       isLoggedIn: true,
//       webId: 'https://alice.solidcommunity.net/profile/card#me',
//     })
//     const router = makeRouter()

//     await router.push('/')
//     await router.isReady()

//     expect(router.currentRoute.value.fullPath).toBe('/dashboard')
//   })
// })
