const axios = require("axios");

// =====================================================
// AI PROVIDER SETTINGS (from .env)
// =====================================================
//
// AI_PROVIDER=groq      -> hosted AI (use this when deployed)
// AI_PROVIDER=ollama    -> local Ollama on your own PC (default)
//
// Groq:    GROQ_API_KEY, GROQ_MODEL
// Ollama:  OLLAMA_URL,   OLLAMA_MODEL
// =====================================================

const AI_PROVIDER = (
  process.env.AI_PROVIDER || "ollama"
).toLowerCase();

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL =
  process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const OLLAMA_URL =
  process.env.OLLAMA_URL ||
  "http://localhost:11434/api/chat";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "qwen2.5:0.5b";

const SYSTEM_PROMPT = `
You are AstraAI, an intelligent and helpful AI assistant.

Rules:
- Give clear and useful answers.
- Use simple language when explaining academic topics.
- For academic questions, organize answers using numbered points or headings.
- For coding questions, provide correct and practical code.
- Keep answers reasonably concise unless the user asks for detail.
- Do not unnecessarily repeat the question.
- Use Markdown formatting when useful.
- Do not add "User:", "Assistant:", or "AstraAI:" before your answer.
`;

const FALLBACK_REPLY =
  "Sorry, I couldn't generate a response.";

// =====================================================
// GROQ (hosted, OpenAI-compatible)
// =====================================================

const generateWithGroq = async (
  chatMessages,
  signal
) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is missing. Add it to your .env file."
    );
  }

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...chatMessages,
      ],
      temperature: 0.3,
      top_p: 0.9,
      stream: false,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 60000,
      signal,
    }
  );

  return (
    response.data?.choices?.[0]?.message
      ?.content || FALLBACK_REPLY
  );
};

// =====================================================
// OLLAMA (local)
// =====================================================

const generateWithOllama = async (
  chatMessages,
  signal
) => {
  const response = await axios.post(
    OLLAMA_URL,
    {
      model: OLLAMA_MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...chatMessages,
      ],
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        repeat_penalty: 1.1,
      },
    },
    {
      timeout: 120000,
      signal,
    }
  );

  return (
    response.data?.message?.content ||
    FALLBACK_REPLY
  );
};

// =====================================================
// MAIN FUNCTION (used by chatController.js)
// =====================================================

const generateAIResponse = async (
  messages,
  signal = undefined
) => {
  try {
    const cleanedMessages = messages.map(
      (msg) => ({
        role:
          msg.role === "assistant"
            ? "assistant"
            : "user",
        content: String(msg.content || "")
          .replace(
            /^(User|Assistant|AstraAI)\s*:\s*/i,
            ""
          )
          .trim(),
      })
    );

    if (AI_PROVIDER === "groq") {
      return await generateWithGroq(
        cleanedMessages,
        signal
      );
    }

    return await generateWithOllama(
      cleanedMessages,
      signal
    );
  } catch (error) {
    // Stop generating button -> keep the same error code
    if (
      error.name === "CanceledError" ||
      error.code === "ERR_CANCELED" ||
      error.message === "canceled"
    ) {
      const cancelError = new Error(
        "AI generation cancelled"
      );

      cancelError.code =
        "AI_GENERATION_CANCELLED";

      throw cancelError;
    }

    // Helpful log for the server terminal
    if (error.response) {
      console.error(
        `${AI_PROVIDER} error ${error.response.status}:`,
        JSON.stringify(
          error.response.data
        ).slice(0, 300)
      );
    } else {
      console.error(
        `${AI_PROVIDER} error:`,
        error.message
      );
    }

    throw error;
  }
};

module.exports = {
  generateAIResponse,
};