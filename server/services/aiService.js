const axios = require("axios");

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "qwen2.5:0.5b";

const generateAIResponse = async (messages, signal = undefined) => {
  try {
    const cleanedMessages = messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: String(msg.content || "")
        .replace(/^(User|Assistant|AstraAI)\s*:\s*/i, "")
        .trim(),
    }));

    const systemPrompt = `
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

    const response = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...cleanedMessages,
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

    return response.data?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    if (
      error.name === "CanceledError" ||
      error.code === "ERR_CANCELED" ||
      error.message === "canceled"
    ) {
      const cancelError = new Error("AI generation cancelled");
      cancelError.code = "AI_GENERATION_CANCELLED";
      throw cancelError;
    }

    console.error("Ollama Error:", error.message);
    throw error;
  }
};

module.exports = {
  generateAIResponse,
};