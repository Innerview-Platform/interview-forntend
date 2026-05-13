# Frontend technology stack

Quick reference for **01 Fontend Repo** (`web`).

## Core

| Technology | Role |
|------------|------|
| **Next.js** `16.x` | App framework, routing, SSR/SSG, API rewrites to backend |
| **React** `19.x` | UI library |
| **TypeScript** `5.x` | Static typing |
| **Turbopack** | Default dev/build bundler (Next 16) |
| **Webpack** (hook in `next.config.ts`) | Aliases for `yjs` / Monaco where needed |

## Styling & UI

| Technology | Role |
|------------|------|
| **Tailwind CSS** `4.x` | Utility-first CSS |
| **PostCSS** | Tailwind pipeline (`@tailwindcss/postcss`) |
| **Lucide React** | Icon set |
| **react-grid-layout** | Draggable/resizable interview workspace (code / canvas / console) |
| **react-rnd** | Floating resizable video shell on the editor page |
| **react-resizable** | Peer dependency for grid resize handles |

## Editor & collaboration

| Technology | Role |
|------------|------|
| **Monaco Editor** | VS Code–engine in-browser editor |
| **@monaco-editor/react** | React wrapper for Monaco |
| **Yjs** | CRDT for shared document state |
| **y-monaco** | Binding between Yjs and Monaco |
| **y-protocols** | Yjs protocol helpers (dependency) |

## Realtime & media

| Technology | Role |
|------------|------|
| **@stomp/stompjs** | STOMP client over WebSocket |
| **SockJS** | WebSocket transport (Spring-compatible) |
| **LiveKit client** | SFU video when `NEXT_PUBLIC_VIDEO_TRANSPORT=livekit` |
| **WebRTC** (browser APIs) | Peer-to-peer AV when transport is `p2p` |
| **Media capture APIs** | `getUserMedia`, `getDisplayMedia` for camera/mic/screen |

## Canvas

| Technology | Role |
|------------|------|
| **tldraw** `3.x` | Shared whiteboard / system design canvas |

## Tooling & quality

| Technology | Role |
|------------|------|
| **ESLint** `9.x` | Linting |
| **eslint-config-next** | Next.js + React rules preset |
| **Node.js** types (`@types/node`, `@types/react*`) | TypeScript definitions |

## Project conventions

- **Path alias:** `@/*` → `./src/*` (`tsconfig.json`)
- **Env-driven:** backend origin (`BACKEND_ORIGIN`), LiveKit URL, video transport mode — see `next.config.ts` and `src/lib/video-config.ts`

## Not in `package.json` but used in-app

- **Fetch / REST** — browser `fetch` to same-origin `/api/*` (rewritten to Spring)
- **Cookies / localStorage** — session token and user snapshot (`src/lib/auth-api.ts`, `client-session`)
- **JWT** — parsed client-side where needed (e.g. subject / user id)

---

*Generated from `package.json` and config files; bump versions there when the stack changes.*
