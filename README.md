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

**Interview room (`/room/[roomId]/editor`):** the live workspace combines code editor, shared canvas, and run output in a **draggable/resizable grid** (`react-grid-layout`); layout is stored in `localStorage` per room. Video is a **floating, resizable** panel (`react-rnd`). The `/room/[roomId]/canvas` route redirects to the editor workspace.

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
