# WebLLM Chat Application

A modern, real-time chat application powered by WebLLM that runs language models directly in your browser. This project demonstrates the capabilities of client-side AI processing using the MLCEngine.

## Features

- 🤖 Real-time AI chat interface
- 🚀 Client-side model processing (no server required)
- 💫 Modern, responsive UI with smooth animations
- 🔄 Real-time message updates
- 📊 Runtime statistics display
- 🎨 Beautiful gradient design
- ⚡ Fast and efficient message handling

## Tech Stack

- Next.js
- React
- TailwindCSS
- @mlc-ai/web-llm
- Client-side AI processing

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/OnurUcarD4/WebLLM-Chat-App
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

The application uses the MLCEngine from @mlc-ai/web-llm to process language models directly in the browser. This means:

- No server-side processing required
- Privacy-focused (all processing happens locally)
- Fast response times
- Works offline

## Project Structure

- `components/ChatComponent/` - Main chat interface component
- `lib/ChatUI.js` - Chat UI logic and handlers
- `app/page.js` - Main application page
- `app/layout.js` - Root layout component
- `core/SELECTED_MODEL.js` - Selected Model
Model List : https://github.com/mlc-ai/web-llm/blob/main/src/config.ts


## License

MIT
