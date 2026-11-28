import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from './App.vue'
import { restoreSession } from './services/auth'

vi.mock('./services/auth', () => ({
  restoreSession: vi.fn(async () => ({ isLoggedIn: false })),
  sessionInfo: () => ({ isLoggedIn: false, webId: undefined }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  authFetch: vi.fn(),
}))

vi.mock('./services/repository', async (importOriginal) => {
  const original = await importOriginal<typeof import('./services/repository')>()
  return {
    ...original,
    PodRepository: class {
      async load() { return { tasks: [], proposals: [] } }
      async save() {}
    },
  }
})

function render() {
  return mount(App)
}

describe('App layout', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(restoreSession).mockResolvedValue({ isLoggedIn: false, sessionId: 'test-session' })
  })

  it('leaves the login page after Solid restores an authorized session', async () => {
    vi.mocked(restoreSession).mockResolvedValueOnce({
      isLoggedIn: true,
      sessionId: 'authorized-session',
      webId: 'https://alice.example/profile/card#me',
    })

    const wrapper = render()
    await flushPromises()

    expect(wrapper.find('.login-shell').exists()).toBe(false)
    expect(wrapper.text()).toContain('https://alice.example/profile/card#me')
  })

  it('presents the sign-in screen before any session starts', async () => {
    const wrapper = render()
    await flushPromises()

    expect(wrapper.text()).toContain('Sign in to OTAku')
    expect(wrapper.text()).toContain('Solid identity provider')
    expect(wrapper.find('.login-card').exists()).toBe(true)
  })

  it('opens the workspace shell with an empty project list in demo mode', async () => {
    const wrapper = render()
    await flushPromises()

    const demoButton = wrapper.findAll('button').find((button) => button.text().includes('Explore demo mode'))
    expect(demoButton).toBeDefined()
    await demoButton!.trigger('click')
    await flushPromises()

    expect(wrapper.find('.login-shell').exists()).toBe(false)
    expect(wrapper.find('.sidebar-head').exists()).toBe(true)
    expect(wrapper.text()).toContain('Your responsibilities, clearly connected.')
    expect(wrapper.find('.empty-small').text()).toContain('No projects yet')
  })

  it('shows a new project in the sidebar and detail pane after creation', async () => {
    const wrapper = render()
    await flushPromises()

    const demoButton = wrapper.findAll('button').find((button) => button.text().includes('Explore demo mode'))
    await demoButton!.trigger('click')
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text().includes('Create project'))!.trigger('click')
    await flushPromises()

    const nameField = wrapper.findAll('input').find((input) => input.attributes('type') !== 'date')!
    await nameField.setValue('Build a Website')
    await wrapper.find('#create-project-form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.task-tree button').text()).toContain('Build a Website')
    expect(wrapper.find('.detail-copy h1').text()).toBe('Build a Website')
    expect(wrapper.find('.facts dd').text()).toContain('demo')
  })
})
