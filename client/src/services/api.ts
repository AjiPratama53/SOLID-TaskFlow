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
} from '@inrupt/solid-client'
import { FOAF, VCARD } from '@inrupt/vocab-common-rdf'

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

      // 2. Ambil Thing yang merepresentasikan subjek WebID itu sendiri
      const profileThing = getThing(profileDataset, webId)

      if (!profileThing) {
        throw new Error(`Dokumen profil tidak ditemukan untuk WebID: ${webId}`)
      }

      // 3. Baca nama (cek beberapa kosakata umum karena tiap Pod server bisa berbeda)
      const name =
        getStringNoLocale(profileThing, FOAF.name) ??
        getStringNoLocale(profileThing, VCARD.fn) ??
        null

      // 4. Baca foto profil / avatar
      const avatarUrl =
        getUrl(profileThing, VCARD.hasPhoto) ??
        getUrl(profileThing, FOAF.img) ??
        null

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
