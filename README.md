# TTS

A Svelte-based web game for practicing pronunciation using Twister-style word challenges and speech recognition.

## Setup

1. Clone the repo
1. Copy `.env.example` to `.env` and configure the API endpoint if needed:
   ```
   VITE_SOCKET_URL=http://localhost:3001
   VITE_API_TARGET=http://localhost:3001
   ```
1. Run `npm install`
1. Ensure the backend API server is running on port 3001 (or adjust the proxy in `vite.config.ts`).
1. Run `npm run dev`
1. Visit http://localhost:5173/ in your browser. Note: Brave currently does not support [speech recognition api](https://github.com/brave/brave-browser/issues/3725#issuecomment-555694620).
