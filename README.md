# ✦ AstraAI

A ChatGPT-style AI chat assistant with user accounts, persistent chat history, and message editing and regeneration. Built with the MERN stack and powered by either a local Ollama model or the hosted Groq API.

## 🔗 Live Demo

* https://astra-ai-chatassistant.vercel.app

## ✨ Features

* Register and log in with JWT authentication and client-side validation (email format, password strength, matching confirmation)
* Chat interface with Markdown-formatted AI replies: headings, lists, code blocks, tables and blockquotes
* Math rendering for formulas and equations in AI replies, powered by KaTeX (LaTeX syntax)
* GitHub-style Markdown tables, rendered as real tables that scroll sideways on small screens
* Switch between a local Ollama model and the hosted Groq API with a single environment variable, with no code changes
* Edit a sent message and regenerate the conversation from that point
* Regenerate the latest AI response, copy any response, or stop generation mid-reply
* Chat history: create, rename, delete and search past conversations, with auto-generated chat titles
* Settings to toggle dark/light mode, clear the current chat, export a chat as a `.txt` file, or log out
* Profile popup showing your account name and email
* Dark and light themes that persist across sessions
* Responsive design with a slide-in sidebar drawer, touch-friendly controls and a safe-area aware layout on mobile
* Auto-growing message box that expands with long text, then scrolls internally
* Custom branding with a welcome landing page and a consistent star logo

## 🛠️ Technologies Used

* React (Vite)
* react-markdown with remark-gfm (tables), remark-math and rehype-katex (math formulas)
* KaTeX for fast, high-quality math typesetting
* Node.js and Express
* MongoDB with Mongoose
* JWT authentication and bcrypt password hashing
* Groq API (hosted) or Ollama (local) for AI responses
* HTML5 and CSS3 (flexbox, grid, animations, responsive layouts)
* GitHub for version control
* Vercel (frontend), Render (backend) and MongoDB Atlas (database) for deployment

## 🚀 How to Run Locally

1. Clone this repository and open the project folder.

```
git clone https://github.com/JAYARAJ2005/AstraAI.git
cd AstraAI
```

2. Set up the backend.

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
FRONTEND_URL=http://localhost:5173
```

Start the server:

```
node server.js
```

3. Set up the frontend.

```
cd ../client
npm install
```

Create a `client/.env` file:

```
VITE_API_URL=http://localhost:5000
```

Start the app:

```
npm run dev
```

4. Open http://localhost:5173 and start chatting.

## 📖 How It Works

1. The user registers or logs in, and the server returns a JWT.
2. The user sends a message, and the backend saves it to MongoDB.
3. The backend sends the conversation to the selected AI provider (Groq or Ollama).
4. The AI reply is saved, returned and displayed as formatted Markdown, with tables and math formulas rendered.
5. The sidebar lists past conversations, which can be searched, renamed or deleted.

## ⚠️ Limitations

* Ollama runs on your own machine, so the deployed demo uses the hosted Groq API
* The backend is on a free hosting tier, so the first request after a period of inactivity can take a while
* AI responses can be inaccurate, so important information should be double-checked
* Never commit your `.env` files. Keep them listed in `.gitignore`

## 🔮 Future Scope

* Streaming responses as they are generated
* File and image uploads in chat
* Voice input and text-to-speech
* Sharing a conversation with a public link
* Multiple model choices inside the app
* Mobile app version

## 📄 License

This project is for educational and portfolio purposes.
