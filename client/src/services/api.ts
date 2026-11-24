// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { users } from '@/.local/users'

// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { tasks } from '@/.local/tasks'

// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { submissions } from '@/.local/submissions'

import type { User } from '@/schemas/user'
import type { InputTask, Task } from '@/schemas/task'
import type { Submission } from '@/schemas/submission'
import type { SolidUserProfile } from '@/schemas/session'

import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  getUrl,
  getUrlAll,
  type SolidDataset,
} from '@inrupt/solid-client'
import { FOAF, VCARD } from '@inrupt/vocab-common-rdf'

function getProfileDetails(profileDataset: SolidDataset, webId: string) {
  const profileThing = getThing(profileDataset, webId)

  if (!profileThing) {
    throw new Error(`Dokumen profil tidak ditemukan untuk WebID: ${webId}`)
  }

  return {
    profileThing,
    name:
      getStringNoLocale(profileThing, FOAF.name) ??
      getStringNoLocale(profileThing, VCARD.fn) ??
      null,
    avatarUrl:
      getUrl(profileThing, VCARD.hasPhoto) ??
      getUrl(profileThing, FOAF.img) ??
      null,
  }
}

export const api = {
  session: {
    get: async (webId: string): Promise<SolidUserProfile> => {
      const PIM = {
        storage: 'http://www.w3.org/ns/pim/space#storage',
      } as const

      const session = getDefaultSession()
      // Gunakan session.fetch jika login agar profil privat (bila ada) ikut terbaca
      const fetchFn = session.info.isLoggedIn ? session.fetch : fetch

      // 1. Ambil dataset dari URL WebID (klien otomatis menangani fragment #me)
      const profileDataset = await getSolidDataset(webId, { fetch: fetchFn })
      const { profileThing, name, avatarUrl } = getProfileDetails(
        profileDataset,
        webId,
      )

      // 5. Ambil URL root Pod (pim:storage) untuk keperluan CRUD data selanjutnya
      const podUrls = getUrlAll(profileThing, PIM.storage)

      return {
        webId,
        name,
        avatarUrl,
        podUrls,
      }
    },
  },
  user: {
    getFriends: async (
      webId: string,
    ): Promise<{ users: User[]; failedCount: number }> => {
      const session = getDefaultSession()
      if (!session.info.isLoggedIn || session.info.webId !== webId) {
        throw new Error('Sesi Solid aktif tidak cocok dengan WebID pengguna.')
      }

      const profileDataset = await getSolidDataset(webId, {
        fetch: session.fetch,
      })
      const { profileThing } = getProfileDetails(profileDataset, webId)
      const friendWebIds = [
        ...new Set(getUrlAll(profileThing, FOAF.knows)),
      ].filter((friendWebId) => friendWebId !== webId)

      const results = await Promise.allSettled(
        friendWebIds.map(async (friendWebId): Promise<User> => {
          const friendDataset = await getSolidDataset(friendWebId, {
            fetch: session.fetch,
          })
          const friendProfile = getProfileDetails(friendDataset, friendWebId)

          return {
            id: friendWebId,
            name: friendProfile.name ?? friendWebId,
            ...(friendProfile.avatarUrl
              ? { avatar: friendProfile.avatarUrl }
              : {}),
          }
        }),
      )

      const users: User[] = []
      let failedCount = 0

      for (const result of results) {
        if (result.status === 'fulfilled') {
          users.push(result.value)
        } else {
          failedCount += 1
        }
      }

      return { users, failedCount }
    },
    get: async (): Promise<User[]> => {
      // GET users
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return users
      } catch (error) {
        throw error
      }
    },
    post: async (user: User) => {
      // POST user
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        users.push(user)
      } catch (error) {
        throw error
      }
    },
  },

  task: {
    get: async () => {
      // GET tasks
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return tasks
      } catch (error) {
        throw error
      }
    },
    post: async (task: Task) => {
      // POST task
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        tasks.push(task)
      } catch (error) {
        throw error
      }
    },
    patch: async (id: string, task: InputTask) => {
      // PATCH task
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))

        const selectedTask = tasks.find((t) => t.id === id)

        if (!selectedTask) return
        selectedTask.title = task.title
        selectedTask.description = task.description
        selectedTask.deadline = task.deadline
        selectedTask.editedAt = new Date()
      } catch (error) {
        throw error
      }
    },
  },

  submission: {
    get: async () => {
      // GET submissions
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return submissions
      } catch (error) {
        throw error
      }
    },
    post: async (submission: Submission) => {
      // POST submission
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        submissions.push(submission)
      } catch (error) {
        throw error
      }
    },
  },
}
