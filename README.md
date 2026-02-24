# Tone TTS

A React-based web game for practicing pronunciation using Twister-style word challenges and speech recognition.

## Setup

1. Clone the repo
1. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```
1. Run `npm install`
1. Run `npm run dev`
1. Visit http://localhost:5173/ in your browser. Note: Brave currently does not support [speech recognition api](https://github.com/brave/brave-browser/issues/3725#issuecomment-555694620).
