This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` to your Spring API origin. For LiveKit SFU, set `NEXT_PUBLIC_VIDEO_TRANSPORT=livekit` and `NEXT_PUBLIC_LIVEKIT_URL` to your LiveKit WebSocket URL; the app requests a JWT from `GET /api/rooms/{roomId}/token`. Local Postgres, Redis, Piston, and service startup are documented in the monorepo `_helper/00 Run/README.md`.

**Interview room (`/room/[roomId]/editor`):** the live workspace uses **split panes** ([`react-resizable-panels`](https://github.com/bvaughn/react-resizable-panels)): code beside canvas, **console** full width below (**Piston run** / **Session judge** tabs). A small **Layout** toolbar offers Focus code / Split / Focus canvas presets plus **Reset**. Sizes persist under `react-resizable-panels:innerview-ws-v2-vert-{roomId}` and `react-resizable-panels:innerview-ws-v2-horiz-{roomId}`. **Video** opens from the **right rail** ([`RoomRightRail.tsx`](src/components/room/RoomRightRail.tsx)) on large viewports. The `/room/[roomId]/canvas` and `/room/[roomId]/video` routes redirect to the editor workspace. Optional `NEXT_PUBLIC_SEED_PROBLEM_UUID` pre-fills the judge tab’s problem id for local demos (see `.env.example`).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
