import { beforeEach, describe, expect, it } from 'vitest'
import { DemoRepository, emptyWorkspace, normalizeWorkspace } from './repository'

describe('workspace persistence', () => {
  beforeEach(() => localStorage.clear())

  it('migrates legacy workspaces with durable-operation defaults', () => {
    expect(normalizeWorkspace({ tasks: [], proposals: [] })).toEqual(emptyWorkspace())
  })

  it('round-trips outbox and processed notification state in demo mode', async () => {
    const repository = new DemoRepository()
    const workspace = emptyWorkspace()
    workspace.processedNotificationIds.push('proposal:p1')
    await repository.save(workspace)
    expect(await repository.load()).toEqual(workspace)
  })

  it('reports corrupt demo data instead of silently accepting it', async () => {
    localStorage.setItem('otaku-demo-workspace', '{bad json')
    await expect(new DemoRepository().load()).rejects.toThrow('Demo workspace data is corrupt')
  })
})
