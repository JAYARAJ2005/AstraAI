const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const {
  generateAIResponse,
} = require("../services/aiService");

// ==========================================
// CREATE AUTOMATIC CHAT TITLE
// ==========================================

const createConversationTitle = (message) => {
  let title = message
    .replace(/\s+/g, " ")
    .trim();

  title = title.replace(/[?.!,]+$/, "");

  if (title.length > 32) {
    title =
      title.substring(0, 32).trim() +
      "...";
  }

  return title;
};

// ==========================================
// CREATE ABORT CONTROLLER
// ==========================================

const createRequestAbortController = (req, res) => {
  const controller = new AbortController();

  const handleAbort = () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  };

  req.on("aborted", handleAbort);

  res.on("close", () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });

  return controller;
};

// ==========================================
// CREATE NEW CONVERSATION
// ==========================================

const createConversation = async (
  req,
  res
) => {
  try {
    const conversation =
      await Conversation.create({
        user: req.user,
        title: "New Chat",
      });

    res.status(201).json({
      message:
        "Conversation created successfully",

      conversation,
    });
  } catch (error) {
    console.error(
      "Create conversation error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET USER CONVERSATIONS
// ==========================================

const getConversations = async (
  req,
  res
) => {
  try {
    const conversations =
      await Conversation.find({
        user: req.user,
      }).sort({
        updatedAt: -1,
      });

    res.status(200).json({
      conversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET MESSAGES
// ==========================================

const getMessages = async (
  req,
  res
) => {
  try {
    const { conversationId } =
      req.params;

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        user: req.user,
      });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const messages =
      await Message.find({
        conversation: conversationId,
      }).sort({
        createdAt: 1,
      });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// SEND MESSAGE
// ==========================================

const sendMessage = async (
  req,
  res
) => {
  const abortController =
    createRequestAbortController(
      req,
      res
    );

  try {
    const { conversationId } =
      req.params;

    const { message } = req.body;

    // Validate message
    if (
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    // Find conversation
    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        user: req.user,
      });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const cleanMessage =
      message.trim();

    // ==========================================
    // SAVE USER MESSAGE
    // ==========================================

    const userMessage =
      await Message.create({
        conversation:
          conversationId,

        role: "user",

        content: cleanMessage,
      });

    // ==========================================
    // AUTOMATIC CHAT TITLE
    // ==========================================

    if (
      conversation.title ===
      "New Chat"
    ) {
      conversation.title =
        createConversationTitle(
          cleanMessage
        );

      await conversation.save();
    }

    // ==========================================
    // GET CONVERSATION HISTORY
    // ==========================================

    const conversationMessages =
      await Message.find({
        conversation:
          conversationId,
      })
        .sort({
          createdAt: 1,
        })
        .lean();

    const aiMessages =
      conversationMessages.map(
        (msg) => ({
          role: msg.role,
          content: msg.content,
        })
      );

    // ==========================================
    // GENERATE AI RESPONSE
    // ==========================================

    const aiResponse =
      await generateAIResponse(
        aiMessages,
        abortController.signal
      );

    // ==========================================
    // CHECK IF GENERATION WAS CANCELLED
    // ==========================================

    if (
      abortController.signal.aborted
    ) {
      return;
    }

    // ==========================================
    // SAVE AI RESPONSE
    // ==========================================

    const assistantMessage =
      await Message.create({
        conversation:
          conversationId,

        role: "assistant",

        content: aiResponse,
      });

    // ==========================================
    // UPDATE CONVERSATION TIME
    // ==========================================

    conversation.updatedAt =
      new Date();

    await conversation.save();

    // ==========================================
    // SEND RESPONSE
    // ==========================================

    if (!res.writableEnded) {
      res.status(200).json({
        message:
          "AI response generated successfully",

        userMessage,

        assistantMessage,
      });
    }
  } catch (error) {
    if (
      error.code ===
      "AI_GENERATION_CANCELLED"
    ) {
      console.log(
        "AI generation cancelled by user."
      );

      return;
    }

    console.error(
      "Send message error:",
      error.message
    );

    if (!res.writableEnded) {
      res.status(500).json({
        message:
          "Failed to generate AI response",
      });
    }
  }
};

// ==========================================
// REGENERATE AI RESPONSE
// ==========================================

const regenerateMessage = async (
  req,
  res
) => {
  const abortController =
    createRequestAbortController(
      req,
      res
    );

  try {
    const { conversationId } =
      req.params;

    // Find conversation
    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        user: req.user,
      });

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    // Get messages
    const messages =
      await Message.find({
        conversation:
          conversationId,
      }).sort({
        createdAt: 1,
      });

    if (messages.length === 0) {
      return res.status(400).json({
        message:
          "No messages to regenerate",
      });
    }

    // Get last message
    const lastMessage =
      messages[messages.length - 1];

    if (
      lastMessage.role !==
      "assistant"
    ) {
      return res.status(400).json({
        message:
          "There is no AI response to regenerate",
      });
    }

    // ==========================================
    // DELETE OLD AI RESPONSE
    // ==========================================

    await Message.deleteOne({
      _id: lastMessage._id,
    });

    // ==========================================
    // GET REMAINING HISTORY
    // ==========================================

    const history =
      await Message.find({
        conversation:
          conversationId,
      })
        .sort({
          createdAt: 1,
        })
        .lean();

    const aiMessages =
      history.map(
        (msg) => ({
          role: msg.role,
          content: msg.content,
        })
      );

    // ==========================================
    // GENERATE NEW RESPONSE
    // ==========================================

    const aiResponse =
      await generateAIResponse(
        aiMessages,
        abortController.signal
      );

    // ==========================================
    // CHECK IF GENERATION WAS CANCELLED
    // ==========================================

    if (
      abortController.signal.aborted
    ) {
      return;
    }

    // ==========================================
    // SAVE NEW AI RESPONSE
    // ==========================================

    const newAssistantMessage =
      await Message.create({
        conversation:
          conversationId,

        role: "assistant",

        content: aiResponse,
      });

    // ==========================================
    // UPDATE CONVERSATION
    // ==========================================

    conversation.updatedAt =
      new Date();

    await conversation.save();

    if (!res.writableEnded) {
      res.status(200).json({
        message:
          "AI response regenerated successfully",

        assistantMessage:
          newAssistantMessage,
      });
    }
  } catch (error) {
    if (
      error.code ===
      "AI_GENERATION_CANCELLED"
    ) {
      console.log(
        "AI regeneration cancelled by user."
      );

      return;
    }

    console.error(
      "Regenerate message error:",
      error.message
    );

    if (!res.writableEnded) {
      res.status(500).json({
        message:
          "Failed to regenerate AI response",
      });
    }
  }
};

// ==========================================
// EDIT USER MESSAGE
// ==========================================

const editMessage = async (
  req,
  res
) => {
  try {
    const {
      conversationId,
      messageId,
    } = req.params;

    const { message } = req.body;

    if (
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        user: req.user,
      });

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    const userMessage =
      await Message.findOne({
        _id: messageId,

        conversation:
          conversationId,

        role: "user",
      });

    if (!userMessage) {
      return res.status(404).json({
        message:
          "User message not found",
      });
    }

    const cleanMessage =
      message.trim();

    await Message.deleteMany({
      conversation:
        conversationId,

      createdAt: {
        $gt: userMessage.createdAt,
      },
    });

    userMessage.content =
      cleanMessage;

    await userMessage.save();

    const conversationMessages =
      await Message.find({
        conversation:
          conversationId,
      })
        .sort({
          createdAt: 1,
        })
        .lean();

    const aiMessages =
      conversationMessages.map(
        (msg) => ({
          role: msg.role,
          content: msg.content,
        })
      );

    const aiResponse =
      await generateAIResponse(
        aiMessages
      );

    const assistantMessage =
      await Message.create({
        conversation:
          conversationId,

        role: "assistant",

        content: aiResponse,
      });

    if (
      conversation.title ===
      "New Chat"
    ) {
      conversation.title =
        createConversationTitle(
          cleanMessage
        );
    }

    conversation.updatedAt =
      new Date();

    await conversation.save();

    res.status(200).json({
      message:
        "Message edited successfully",

      userMessage,

      assistantMessage,
    });
  } catch (error) {
    console.error(
      "Edit message error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to edit message",
    });
  }
};

// ==========================================
// RENAME CONVERSATION
// ==========================================

const renameConversation = async (
  req,
  res
) => {
  try {
    const { conversationId } =
      req.params;

    const { title } = req.body;

    if (
      !title ||
      !title.trim()
    ) {
      return res.status(400).json({
        message:
          "Chat title is required",
      });
    }

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        user: req.user,
      });

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    let newTitle =
      title.trim();

    if (newTitle.length > 50) {
      newTitle =
        newTitle.substring(0, 50) +
        "...";
    }

    conversation.title =
      newTitle;

    await conversation.save();

    res.status(200).json({
      message:
        "Conversation renamed successfully",

      conversation,
    });
  } catch (error) {
    console.error(
      "Rename conversation error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// DELETE CONVERSATION
// ==========================================

const deleteConversation = async (
  req,
  res
) => {
  try {
    const { conversationId } =
      req.params;

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        user: req.user,
      });

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    await Message.deleteMany({
      conversation:
        conversationId,
    });

    await Conversation.deleteOne({
      _id: conversationId,
    });

    res.status(200).json({
      message:
        "Conversation deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete conversation error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  regenerateMessage,
  editMessage,
  renameConversation,
  deleteConversation,
};