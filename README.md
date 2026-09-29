
---

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18 or later)
- A MongoDB connection string (local MongoDB or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- Either:
  - A [Groq API key](https://console.groq.com) (free tier), **or**
  - [Ollama](https://ollama.com) installed locally with a model pulled (e.g. `ollama pull qwen2.5:0.5b`)

### 1. Clone the repository
```bash
git clone https://github.com/JAYARAJ2005/AstraAI.git
cd AstraAI
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `server/.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string

# Choose one AI provider:
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b

# — or, to use local Ollama instead —
# AI_PROVIDER=ollama
# OLLAMA_URL=http://localhost:11434/api/chat
# OLLAMA_MODEL=qwen2.5:0.5b

# Optional, only needed once you deploy the frontend elsewhere:
# FRONTEND_URL=https://your-deployed-frontend.vercel.app
```

Start the backend:
```bash
node server.js
```

### 3. Frontend setup
```bash
cd ../client
npm install
```

By default the frontend talks to `http://localhost:5000/api`. To point it at a different backend, create `client/.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Deployment

AstraAI is deployed as three separate free-tier services:

| Service | Host |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| AI | [Groq API](https://groq.com) |

**Backend (Render):** Root directory `server`, build command `npm install`, start command `node server.js`. Set the environment variables listed above, plus `FRONTEND_URL` pointing to your deployed frontend's address.

**Frontend (Vercel):** Root directory `client`, framework preset Vite. Set `VITE_API_URL` to your deployed backend's address, ending in `/api`.

---

## License

This project was built as a final-year academic project.