# AstraAI — AI Chat Assistant

A ChatGPT-style AI chat assistant with user accounts, persistent chat history, and message editing and regeneration — built with the MERN stack and powered by either a local Ollama model or the hosted Groq API.

**Live demo:** https://astra-ai-hazel.vercel.app

## Features

- **Authentication** — JWT-based auth with hashed passwords and client-side validation (email format, password strength, matching confirmation)
- **Chat Interface** — send messages and view Markdown-formatted AI responses, including headings, lists, code blocks, tables, and blockquotes
- **Pluggable AI Backend** — switch between a local Ollama model and the hosted Groq API with a single environment variable, no code changes needed
- **Message Controls** — edit a sent message and regenerate the conversation from that point, regenerate the latest response, copy any response, or stop generation mid-reply
- **Chat History** — create, rename, delete, and search past conversations, with auto-generated chat titles
- **Settings** — toggle dark/light mode, clear the current chat, export a chat as a `.txt` file, or log out
- **Profile Popup** — view your account name and email at a glance
- **Dark / Light Mode** — theme preference persists across sessions
- **Responsive Design** — full mobile support with a slide-in sidebar drawer, touch-friendly controls, and a safe-area aware layout
- **Auto-growing Input** — the textarea expands with long messages, then scrolls internally
- **Custom Branding** — welcome landing page and a consistent star logo across the app

## Tech Stack

**Frontend**

- React (Vite)
- react-markdown

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing
- Groq API (hosted) or Ollama (local) for all AI generation

**Deployment**

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Project Structure

```
AstraAI/
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── pages/          # Route-level pages (Login, Register, Chat, etc.)
│   │   ├── components/     # Reusable UI components (Sidebar, MessageBubble, etc.)
│   │   ├── context/        # React context (auth, theme)
│   │   └── services/       # API client
│   └── ...
└── server/                 # Express backend
    ├── controllers/        # Route handler logic
    ├── models/             # Mongoose schemas (User, Chat)
    ├── routes/             # Express route definitions
    ├── services/           # Groq / Ollama integration
    ├── middleware/         # Auth middleware
    └── index.js            # App entry point
```

## Running Locally

### Prerequisites

- Node.js (v18+)
- A MongoDB Atlas connection string (or local MongoDB instance)
- A Groq API key (or Ollama installed locally with a model pulled)

### 1. Clone the repo

```
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Backend setup

```
cd server
npm install
```

Create a `server/.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

Run the server:

```
node index.js
```

### 3. Frontend setup

```
cd ../client
npm install
```

Create a `client/.env` file:

```
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```
npm run dev
```

The app will be available at http://localhost:5173.

## Notes

- Ollama runs on your own machine, so the deployed demo uses the hosted Groq API. Ollama is intended for local development and offline use.
- Set `AI_PROVIDER` to `groq` or `ollama` to switch backends. Only the variables for the selected provider are required.
- Never commit your `.env` files — keep them listed in `.gitignore`.

## License

This project is for educational and portfolio purposes.
