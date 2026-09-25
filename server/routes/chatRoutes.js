const express = require("express");

const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  regenerateMessage,
  editMessage,
  renameConversation,
  deleteConversation,
} = require("../controllers/chatController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// CREATE NEW CONVERSATION
// ==========================================

router.post(
  "/conversations",
  protect,
  createConversation
);

// ==========================================
// GET USER CONVERSATIONS
// ==========================================

router.get(
  "/conversations",
  protect,
  getConversations
);

// ==========================================
// GET CONVERSATION MESSAGES
// ==========================================

router.get(
  "/conversations/:conversationId/messages",
  protect,
  getMessages
);

// ==========================================
// SEND MESSAGE
// ==========================================

router.post(
  "/conversations/:conversationId/messages",
  protect,
  sendMessage
);

// ==========================================
// EDIT USER MESSAGE
// ==========================================

router.put(
  "/conversations/:conversationId/messages/:messageId",
  protect,
  editMessage
);

// ==========================================
// REGENERATE AI RESPONSE
// ==========================================

router.post(
  "/conversations/:conversationId/regenerate",
  protect,
  regenerateMessage
);

// ==========================================
// RENAME CONVERSATION
// ==========================================

router.put(
  "/conversations/:conversationId",
  protect,
  renameConversation
);

// ==========================================
// DELETE CONVERSATION
// ==========================================

router.delete(
  "/conversations/:conversationId",
  protect,
  deleteConversation
);

module.exports = router;