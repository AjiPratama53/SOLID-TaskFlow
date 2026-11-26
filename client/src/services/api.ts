// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { tasks } from '@/.local/tasks'

// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { submissions } from '@/.local/submissions'

import type { User } from '@/schemas/user'
import type { InputTask, Task, TaskQuery, TaskStatus } from '@/schemas/task'
import type { Submission } from '@/schemas/submission'
import type { SolidUserProfile } from '@/schemas/session'

import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import {
  addUrl,
  getSolidDataset,
  getSourceUrl,
  getThing,
  getStringNoLocale,
  saveSolidDatasetAt,
  setThing,
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

function validateWebId(webId: string) {
  const value = webId.trim()
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('Masukkan WebID rekanmu.')
  }

  if (
    (url.protocol !== 'https:' && url.protocol !== 'http:') ||
    url.username ||
    url.password
  ) {
    throw new Error('WebID tidak valid.')
  }

  return { value, normalized: url.toString() }
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

      // Ambil URL root Pod (pim:storage) untuk keperluan CRUD data selanjutnya
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
    get: async (
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
            name:
              friendProfile.name ??
              friendWebId.replace('https://', '').split('.')[0],
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
    post: async (ownerWebId: string, inputWebId: string): Promise<void> => {
      const session = getDefaultSession()
      const owner = validateWebId(ownerWebId)
      const friend = validateWebId(inputWebId)

      if (
        !session.info.isLoggedIn ||
        !session.info.webId ||
        validateWebId(session.info.webId).normalized !== owner.normalized
      ) {
        throw new Error('Sesi Solid aktif tidak cocok dengan WebID pengguna.')
      }

      if (friend.normalized === owner.normalized) {
        throw new Error(
          'WebID Anda sendiri tidak dapat ditambahkan sebagai teman.',
        )
      }

      const profileDataset = await getSolidDataset(owner.value, {
        fetch: session.fetch,
      })
      const { profileThing } = getProfileDetails(profileDataset, owner.value)

      if (getUrlAll(profileThing, FOAF.knows).includes(friend.value)) return

      const updatedDataset = setThing(
        profileDataset,
        addUrl(profileThing, FOAF.knows, friend.value),
      )
      const profileDocumentUrl = getSourceUrl(profileDataset)

      if (!profileDocumentUrl) {
        throw new Error('URL dokumen profil Solid tidak ditemukan.')
      }

      await saveSolidDatasetAt(profileDocumentUrl, updatedDataset, {
        fetch: session.fetch,
      })
    },
  },

  task: {
    get: async (filter: TaskQuery): Promise<Task[]> => {
      // GET tasks
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))

        let data = tasks
        const { id, status, deadlineFrom, deadlineTo, query, limit } = filter

        // Get by id
        if (id) data = data.filter((task) => task.id === id)

        // Filter by status
        if (status) data = data.filter((task) => task.status === status)

        // No deadline
        if (deadlineFrom === null && deadlineTo === null)
          data = data.filter((task) => !task.deadline)

        // Deadline from
        if (deadlineFrom)
          data = data.filter(
            (task) =>
              task.deadline &&
              new Date(task.deadline) >= new Date(deadlineFrom),
          )

        // Deadline until
        if (deadlineTo)
          data = data.filter(
            (task) =>
              task.deadline && new Date(task.deadline) <= new Date(deadlineTo),
          )

        // Seaech query
        if (query) data = data.filter((task) => task.title.includes(query))

        // Limit
        if (limit) data = data.slice(0, limit)

        return data
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
