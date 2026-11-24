# client

Scaffolded with Vuetify CLI.

## ❗️ Documentation

- Primary docs: https://vuetifyjs.com/
- Getting started guide: https://vuetifyjs.com/en/getting-started/installation/
- Community support: https://community.vuetifyjs.com/
- Issue tracker: https://issues.vuetifyjs.com/

## 🧱 Stack

- Framework: Vue 3 + Vite
- UI Library: Vuetify
- Language: TypeScript
- Package manager: npm

## 🧭 Start Here

- Main entry: `src/main.ts`
- Main app component: `src/App.vue`
- Main styles: `src/styles/`
- Plugin setup: `src/plugins/`

## 📁 Project Structure

- `src/main.ts` — application entry point
- `src/App.vue` — root component
- `src/components/` — reusable Vue components
- `src/plugins/` — plugin registration and setup
- `src/styles/` — global styles and theme settings
- `public/` — static public files

## ✨ Enabled Features

- Tailwind CSS

## 🔐 Solid Authentication

- Sign in from `/login` with an HTTPS Solid provider URL.
- The app restores the Inrupt browser session before navigation. Unauthenticated visits to `/` and other private routes redirect to `/login`.
- After session restoration, the client fetches the WebID profile as RDF using the authenticated session fetch, including the profile name, avatar, and `pim:storage` Pod URLs.
- Friend WebIDs are read from `foaf:knows` in the signed-in user's WebID profile; each friend's public WebID profile supplies the displayed name and avatar. Friends that cannot be fetched are omitted with a warning.
- Tasks and submissions still use local mock data. Invited users remain local and are not written to a Solid Pod.

## 💿 Install

Use your selected package manager (npm) to install dependencies:

```bash
npm install
```

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🧪 Available Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run build-only`
- `npm run type-check`

## 💪 Support Vuetify Development

This project uses Vuetify - an MIT licensed Open Source project. We are glad to welcome contributors and any support for ongoing development:

- Contribute to Vuetify and ecosystem projects: https://github.com/vuetifyjs
- Request enterprise support: https://support.vuetifyjs.com/
- Sponsor on GitHub: https://github.com/sponsors/vuetifyjs
- Support on Open Collective: https://opencollective.com/vuetify
