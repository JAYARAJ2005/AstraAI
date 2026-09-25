import {
  useEffect,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./components/Settings";

import {
  sendMessage,
  regenerateMessage,
  editMessage,
  createConversation,
  getConversations,
  getMessages,
  renameConversation,
  deleteConversation,
  logoutUser,
} from "./services/api";

import "./App.css";

function App() {
  // =====================================================
  // AUTH
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] =
    useState(!!localStorage.getItem("token"));

  const [showRegister, setShowRegister] =
    useState(false);

  // =====================================================
  // USER PROFILE
  // =====================================================

  const [showProfile, setShowProfile] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState(() => {
      try {
        const savedUser =
          localStorage.getItem("user");

        return savedUser
          ? JSON.parse(savedUser)
          : null;
      } catch {
        return null;
      }
    });

  // =====================================================
  // UI
  // =====================================================

  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem("darkMode") ===
        "true"
    );

  const [showSettings, setShowSettings] =
    useState(false);

  // =====================================================
  // CHAT
  // =====================================================

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    conversationId,
    setConversationId,
  ] = useState(null);

  // =====================================================
  // SEARCH
  // =====================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);

  // =====================================================
  // COPY
  // =====================================================

  const [
    copiedIndex,
    setCopiedIndex,
  ] = useState(null);

  // =====================================================
  // EDIT
  // =====================================================

  const [
    editingIndex,
    setEditingIndex,
  ] = useState(null);

  const [
    editingText,
    setEditingText,
  ] = useState("");

  // =====================================================
  // REFS
  // =====================================================

  const messagesEndRef =
    useRef(null);

  const generationControllerRef =
    useRef(null);

  // =====================================================
  // LOAD USER
  // =====================================================

  const loadCurrentUser = () => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (savedUser) {
        setCurrentUser(
          JSON.parse(savedUser)
        );
      }
    } catch (error) {
      console.error(
        "Load user error:",
        error
      );
    }
  };

  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================

  const loadConversations =
    async () => {
      try {
        const data =
          await getConversations();

        setConversations(
          data.conversations || []
        );
      } catch (error) {
        console.error(
          "Load conversations error:",
          error
        );
      }
    };

  // =====================================================
  // FILTER CONVERSATIONS
  // =====================================================

  const filteredConversations =
    conversations.filter(
      (conversation) =>
        conversation.title
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    );

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatChatTime = (date) => {
    if (!date) {
      return "";
    }

    const chatDate =
      new Date(date);

    const now =
      new Date();

    if (
      isNaN(
        chatDate.getTime()
      )
    ) {
      return "";
    }

    if (
      chatDate.toDateString() ===
      now.toDateString()
    ) {
      return chatDate.toLocaleTimeString(
        [],
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      chatDate.toDateString() ===
      yesterday.toDateString()
    ) {
      return "Yesterday";
    }

    if (
      chatDate.getFullYear() ===
      now.getFullYear()
    ) {
      return chatDate.toLocaleDateString(
        [],
        {
          day: "numeric",
          month: "short",
        }
      );
    }

    return chatDate.toLocaleDateString(
      [],
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (isLoggedIn) {
      loadCurrentUser();
      loadConversations();
    }
  }, [isLoggedIn]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =====================================================
  // DARK MODE
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "darkMode",
      darkMode
    );
  }, [darkMode]);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (user) => {
    setIsLoggedIn(true);

    if (user) {
      setCurrentUser(user);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    } else {
      loadCurrentUser();
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    if (
      generationControllerRef.current
    ) {
      generationControllerRef.current.abort();

      generationControllerRef.current =
        null;
    }

    logoutUser();

    setIsLoggedIn(false);

    setCurrentUser(null);

    setMessages([]);

    setConversations([]);

    setConversationId(null);

    setMessage("");

    setSearchQuery("");

    setEditingIndex(null);

    setEditingText("");

    setLoading(false);

    setShowSettings(false);

    setShowProfile(false);
  };

  // =====================================================
  // NEW CHAT
  // =====================================================

  const handleNewChat = async () => {
    if (
      generationControllerRef.current
    ) {
      generationControllerRef.current.abort();

      generationControllerRef.current =
        null;

      setLoading(false);
    }

    try {
      const data =
        await createConversation();

      setConversationId(
        data.conversation._id
      );

      setMessages([]);

      setMessage("");

      setEditingIndex(null);

      setEditingText("");

      setSearchQuery("");

      setShowSettings(false);

      setShowProfile(false);

      await loadConversations();
    } catch (error) {
      console.error(
        "New chat error:",
        error
      );

      alert(
        "Unable to create new chat."
      );
    }
  };

  // =====================================================
  // SELECT CONVERSATION
  // =====================================================

  const handleSelectConversation =
    async (id) => {
      if (
        generationControllerRef.current
      ) {
        generationControllerRef.current.abort();

        generationControllerRef.current =
          null;

        setLoading(false);
      }

      try {
        setHistoryLoading(true);

        setConversationId(id);

        setEditingIndex(null);

        setEditingText("");

        setShowProfile(false);

        const data =
          await getMessages(id);

        setMessages(
          data.messages || []
        );
      } catch (error) {
        console.error(
          "Load messages error:",
          error
        );

        alert(
          "Unable to load conversation."
        );
      } finally {
        setHistoryLoading(false);
      }
    };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage =
    async () => {
      if (
        !message.trim() ||
        loading
      ) {
        return;
      }

      let activeConversationId =
        conversationId;

      try {
        if (!activeConversationId) {
          const newConversation =
            await createConversation();

          activeConversationId =
            newConversation
              .conversation._id;

          setConversationId(
            activeConversationId
          );
        }

        const cleanMessage =
          message.trim();

        setMessage("");

        setLoading(true);

        generationControllerRef.current =
          new AbortController();

        setEditingIndex(null);

        setEditingText("");

        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: cleanMessage,
          },
        ]);

        const data =
          await sendMessage(
            activeConversationId,
            cleanMessage,
            generationControllerRef.current
              .signal
          );

        if (
          generationControllerRef.current
            ?.signal.aborted
        ) {
          return;
        }

        setMessages((prev) => {
          const updated = [
            ...prev,
          ];

          updated[
            updated.length - 1
          ] = data.userMessage;

          updated.push(
            data.assistantMessage
          );

          return updated;
        });

        await loadConversations();
      } catch (error) {
        if (
          error.code ===
            "ERR_CANCELED" ||
          error.name ===
            "CanceledError"
        ) {
          console.log(
            "AstraAI generation paused."
          );

          try {
            if (activeConversationId) {
              const updatedData =
                await getMessages(
                  activeConversationId
                );

              setMessages(
                updatedData.messages ||
                  []
              );

              await loadConversations();
            }
          } catch (reloadError) {
            console.error(
              "Reload after pause error:",
              reloadError
            );
          }

          return;
        }

        console.error(
          "Send message error:",
          error
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't generate a response.",
          },
        ]);
      } finally {
        generationControllerRef.current =
          null;

        setLoading(false);
      }
    };

  // =====================================================
  // PAUSE GENERATION
  // =====================================================

  const handlePauseGeneration = () => {
    if (
      generationControllerRef.current
    ) {
      generationControllerRef.current.abort();

      generationControllerRef.current =
        null;
    }

    setLoading(false);
  };

  // =====================================================
  // KEYBOARD
  // =====================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!loading) {
        handleSendMessage();
      }
    }
  };

  // =====================================================
  // COPY
  // =====================================================

  const handleCopy = async (
    content,
    index
  ) => {
    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );
    }
  };

  // =====================================================
  // REGENERATE
  // =====================================================

  const handleRegenerate =
    async (index) => {
      if (
        !conversationId ||
        loading
      ) {
        return;
      }

      if (
        index !==
        messages.length - 1
      ) {
        alert(
          "Regenerate is available for the latest AI response."
        );

        return;
      }

      const currentMessage =
        messages[index];

      if (
        !currentMessage ||
        currentMessage.role !==
          "assistant"
      ) {
        return;
      }

      try {
        setLoading(true);

        generationControllerRef.current =
          new AbortController();

        setCopiedIndex(null);

        const data =
          await regenerateMessage(
            conversationId,
            generationControllerRef.current
              .signal
          );

        if (
          generationControllerRef.current
            ?.signal.aborted
        ) {
          return;
        }

        setMessages((prev) => {
          const updated = [
            ...prev,
          ];

          updated[
            updated.length - 1
          ] =
            data.assistantMessage;

          return updated;
        });

        await loadConversations();
      } catch (error) {
        if (
          error.code ===
            "ERR_CANCELED" ||
          error.name ===
            "CanceledError"
        ) {
          console.log(
            "AstraAI regeneration paused."
          );

          return;
        }

        console.error(
          "Regenerate error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to regenerate response."
        );
      } finally {
        generationControllerRef.current =
          null;

        setLoading(false);
      }
    };

  // =====================================================
  // START EDIT
  // =====================================================

  const startEditing = (
    index
  ) => {
    const selectedMessage =
      messages[index];

    if (
      !selectedMessage ||
      selectedMessage.role !==
        "user"
    ) {
      return;
    }

    setEditingIndex(index);

    setEditingText(
      selectedMessage.content
    );

    setCopiedIndex(null);
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEditing = () => {
    setEditingIndex(null);

    setEditingText("");
  };

  // =====================================================
  // EDIT MESSAGE
  // =====================================================

  const handleEditMessage =
    async () => {
      if (
        editingIndex === null ||
        !conversationId ||
        loading
      ) {
        return;
      }

      const selectedMessage =
        messages[editingIndex];

      if (
        !selectedMessage ||
        selectedMessage.role !==
          "user"
      ) {
        return;
      }

      if (!editingText.trim()) {
        return;
      }

      try {
        setLoading(true);

        setCopiedIndex(null);

        // Get real database messages
        const latestData =
          await getMessages(
            conversationId
          );

        const latestMessages =
          latestData.messages || [];

        const latestUserMessages =
          latestMessages.filter(
            (msg) =>
              msg.role === "user"
          );

        const userMessagePosition =
          messages
            .slice(
              0,
              editingIndex + 1
            )
            .filter(
              (msg) =>
                msg.role === "user"
            ).length - 1;

        const realMessage =
          latestUserMessages[
            userMessagePosition
          ];

        if (
          !realMessage ||
          !realMessage._id
        ) {
          alert(
            "Unable to find this message in the database. Please reload the chat and try again."
          );

          return;
        }

        const data =
          await editMessage(
            conversationId,
            realMessage._id,
            editingText.trim()
          );

        const previousMessages =
          messages.slice(
            0,
            editingIndex
          );

        setMessages([
          ...previousMessages,
          data.userMessage,
          data.assistantMessage,
        ]);

        setEditingIndex(null);

        setEditingText("");

        await loadConversations();
      } catch (error) {
        console.error(
          "Edit message error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to edit message."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // RENAME
  // =====================================================

  const handleRename = async (
    id,
    currentTitle
  ) => {
    const newTitle =
      window.prompt(
        "Enter new chat name:",
        currentTitle
      );

    if (
      !newTitle ||
      !newTitle.trim()
    ) {
      return;
    }

    try {
      await renameConversation(
        id,
        newTitle.trim()
      );

      await loadConversations();
    } catch (error) {
      console.error(
        "Rename error:",
        error
      );

      alert(
        "Unable to rename chat."
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) {
      return;
    }

    try {
      if (
        conversationId === id &&
        generationControllerRef.current
      ) {
        generationControllerRef.current.abort();

        generationControllerRef.current =
          null;

        setLoading(false);
      }

      await deleteConversation(id);

      if (
        conversationId === id
      ) {
        setConversationId(null);

        setMessages([]);

        setEditingIndex(null);

        setEditingText("");
      }

      await loadConversations();
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Unable to delete chat."
      );
    }
  };

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  const clearCurrentChat =
    () => {
      if (
        generationControllerRef.current
      ) {
        generationControllerRef.current.abort();

        generationControllerRef.current =
          null;
      }

      setLoading(false);

      setMessages([]);

      setConversationId(null);

      setMessage("");

      setEditingIndex(null);

      setEditingText("");

      setShowSettings(false);

      setShowProfile(false);
    };

  // =====================================================
  // EXPORT CHAT
  // =====================================================

  const handleExportChat = () => {
    if (!messages.length) {
      alert(
        "There is no chat to export."
      );

      return;
    }

    let chatText =
      "ASTRAAI CHAT\n";

    chatText +=
      "==============================\n\n";

    messages.forEach((msg) => {
      chatText +=
        msg.role === "user"
          ? "You:\n"
          : "AstraAI:\n";

      chatText +=
        `${msg.content}\n\n`;
    });

    chatText +=
      "==============================\n";

    chatText +=
      "Generated by AstraAI";

    const blob = new Blob(
      [chatText],
      {
        type:
          "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "AstraAI-Chat.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // DARK MODE
  // =====================================================

  const toggleDarkMode = () => {
    setDarkMode(
      (previous) => !previous
    );
  };

  // =====================================================
  // SUGGESTION
  // =====================================================

  const handleSuggestion = (
    text
  ) => {
    setMessage(text);
  };

  // =====================================================
  // USER DISPLAY
  // =====================================================

  const getUserName = () => {
    return (
      currentUser?.name ||
      currentUser?.username ||
      "User"
    );
  };

  const getUserEmail = () => {
    return (
      currentUser?.email ||
      "No email available"
    );
  };

  const getUserInitial = () => {
    return getUserName()
      .charAt(0)
      .toUpperCase();
  };

  // =====================================================
  // AUTH SCREEN
  // =====================================================

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <Register
          onRegister={() =>
            setShowRegister(false)
          }
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() =>
          setShowRegister(true)
        }
      />
    );
  }

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div
      className={
        darkMode
          ? "app dark"
          : "app"
      }
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        {/* LOGO */}

        <div className="sidebar-logo">

          <div className="logo-icon">
            ✦
          </div>

          <span>
            AstraAI
          </span>

        </div>

        {/* NEW CHAT */}

        <button
          className="new-chat-btn"
          onClick={handleNewChat}
        >
          <span>＋</span>
          New Chat
        </button>

        {/* RECENT */}

        <div className="recent-title">
          RECENT CHATS
        </div>

        {/* SEARCH */}

        <div className="chat-search">

          <span className="chat-search-icon">
            🔍
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search chats..."
          />

          {searchQuery && (
            <button
              className="chat-search-clear"
              onClick={() =>
                setSearchQuery("")
              }
            >
              ×
            </button>
          )}

        </div>

        {/* CHAT LIST */}

        <div className="conversation-list">

          {filteredConversations.length ===
          0 ? (
            <div className="no-chats">

              {searchQuery
                ? "No chats found"
                : "No conversations yet"}

            </div>
          ) : (
            filteredConversations.map(
              (conversation) => (

                <div
                  key={
                    conversation._id
                  }
                  className={
                    conversationId ===
                    conversation._id
                      ? "conversation-item active"
                      : "conversation-item"
                  }
                >

                  <button
                    className="conversation-select"
                    onClick={() =>
                      handleSelectConversation(
                        conversation._id
                      )
                    }
                  >

                    <span className="chat-icon">
                      💬
                    </span>

                    <div className="conversation-info">

                      <span className="conversation-title">
                        {
                          conversation.title
                        }
                      </span>

                      <span className="conversation-time">
                        {formatChatTime(
                          conversation.updatedAt ||
                            conversation.createdAt
                        )}
                      </span>

                    </div>

                  </button>

                  <button
                    className="conversation-action edit-chat"
                    onClick={() =>
                      handleRename(
                        conversation._id,
                        conversation.title
                      )
                    }
                    title="Rename"
                  >
                    ✎
                  </button>

                  <button
                    className="conversation-action delete-chat"
                    onClick={() =>
                      handleDelete(
                        conversation._id
                      )
                    }
                    title="Delete"
                  >
                    🗑
                  </button>

                </div>

              )
            )
          )}

        </div>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          {/* PROFILE */}

          <button
            className="sidebar-profile-btn"
            onClick={() =>
              setShowProfile(
                (previous) =>
                  !previous
              )
            }
          >

            <div className="sidebar-profile-avatar">
              {getUserInitial()}
            </div>

            <div className="sidebar-profile-info">

              <span className="sidebar-profile-name">
                {getUserName()}
              </span>

              <span className="sidebar-profile-email">
                {getUserEmail()}
              </span>

            </div>

            <span className="sidebar-profile-arrow">
              ›
            </span>

          </button>

          {/* SETTINGS */}

          <button
            className="settings-btn"
            onClick={() =>
              setShowSettings(true)
            }
          >
            ⚙️ Settings
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">

        {/* TOP BAR */}

        <div className="top-bar">

          <button
            className="dark-mode-btn"
            onClick={
              toggleDarkMode
            }
            title="Toggle Dark Mode"
          >
            {darkMode
              ? "☀️"
              : "🌙"}
          </button>

        </div>

        {/* =================================================
            PROFILE POPUP
        ================================================= */}

        {showProfile && (

          <div className="profile-popup">

            <div className="profile-popup-header">

              <div className="profile-large-avatar">
                {getUserInitial()}
              </div>

              <div>
                <h2>
                  {getUserName()}
                </h2>

                <p>
                  {getUserEmail()}
                </p>
              </div>

            </div>

            <div className="profile-divider" />

            <div className="profile-details">

              <div className="profile-detail-item">

                <span className="profile-detail-label">
                  Name
                </span>

                <span className="profile-detail-value">
                  {getUserName()}
                </span>

              </div>

              <div className="profile-detail-item">

                <span className="profile-detail-label">
                  Email
                </span>

                <span className="profile-detail-value">
                  {getUserEmail()}
                </span>

              </div>

              <div className="profile-detail-item">

                <span className="profile-detail-label">
                  Account
                </span>

                <span className="profile-detail-value">
                  AstraAI User
                </span>

              </div>

            </div>

            <button
              className="profile-close-btn"
              onClick={() =>
                setShowProfile(false)
              }
            >
              Close
            </button>

            <button
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

          </div>

        )}

        {/* =================================================
            CHAT AREA
        ================================================= */}

        <div className="chat-area">

          {/* WELCOME */}

          {messages.length ===
            0 &&
            !historyLoading && (

              <div className="welcome">

                <div className="welcome-icon">
                  ✦
                </div>

                <h1>
                  Welcome to AstraAI
                </h1>

                <p>
                  Your intelligent
                  generative AI
                  assistant.
                </p>

                <div className="suggestions">

                  <button
                    onClick={() =>
                      handleSuggestion(
                        "Explain AI"
                      )
                    }
                  >
                    Explain AI
                  </button>

                  <button
                    onClick={() =>
                      handleSuggestion(
                        "Help me with my project"
                      )
                    }
                  >
                    Project Help
                  </button>

                  <button
                    onClick={() =>
                      handleSuggestion(
                        "Help me with coding"
                      )
                    }
                  >
                    Coding Help
                  </button>

                  <button
                    onClick={() =>
                      handleSuggestion(
                        "Help me study"
                      )
                    }
                  >
                    Study Help
                  </button>

                </div>

              </div>

            )}

          {/* HISTORY LOADING */}

          {historyLoading && (
            <div className="history-loading">
              Loading conversation...
            </div>
          )}

          {/* MESSAGES */}

          <div className="messages">

            {messages.map(
              (msg, index) => {

                const isUser =
                  msg.role ===
                  "user";

                const isEditing =
                  editingIndex ===
                  index;

                const isLatestAssistant =
                  !isUser &&
                  index ===
                    messages.length -
                      1;

                return (

                  <div
                    key={
                      msg._id ||
                      `${msg.role}-${index}`
                    }
                    className={
                      isUser
                        ? "message-row user-row"
                        : "message-row assistant-row"
                    }
                  >

                    {/* USER */}

                    {isUser ? (

                      <div className="user-message-wrapper">

                        <div className="message-author user-author">
                          You
                        </div>

                        {isEditing ? (

                          <div className="edit-message-box">

                            <textarea
                              value={
                                editingText
                              }
                              onChange={(
                                event
                              ) =>
                                setEditingText(
                                  event
                                    .target
                                    .value
                                )
                              }
                              autoFocus
                              rows={3}
                              onKeyDown={(
                                event
                              ) => {

                                if (
                                  event.key ===
                                    "Enter" &&
                                  !event.shiftKey
                                ) {

                                  event.preventDefault();

                                  handleEditMessage();

                                }

                              }}
                            />

                            <div className="edit-message-actions">

                              <button
                                className="edit-cancel-btn"
                                onClick={
                                  cancelEditing
                                }
                                disabled={
                                  loading
                                }
                              >
                                Cancel
                              </button>

                              <button
                                className="edit-save-btn"
                                onClick={
                                  handleEditMessage
                                }
                                disabled={
                                  loading ||
                                  !editingText.trim()
                                }
                              >
                                {loading
                                  ? "Saving..."
                                  : "Save & Send"}
                              </button>

                            </div>

                          </div>

                        ) : (

                          <div className="user-message-content">
                            {msg.content}
                          </div>

                        )}

                        {!isEditing && (

                          <div className="user-message-actions">

                            <button
                              className="message-action-btn"
                              onClick={() =>
                                startEditing(
                                  index
                                )
                              }
                              title="Edit message"
                            >
                              ✏️ Edit
                            </button>

                          </div>

                        )}

                      </div>

                    ) : (

                      /* ASSISTANT */

                      <div className="assistant-message-wrapper">

                        <div className="assistant-avatar">
                          ✦
                        </div>

                        <div className="assistant-content-wrapper">

                          <div className="message-author">
                            AstraAI
                          </div>

                          <div className="assistant-message-content">

                            <ReactMarkdown>
                              {msg.content}
                            </ReactMarkdown>

                          </div>

                          <div className="ai-actions">

                            <button
                              onClick={() =>
                                handleCopy(
                                  msg.content,
                                  index
                                )
                              }
                            >
                              📋{" "}
                              {copiedIndex ===
                              index
                                ? "Copied"
                                : "Copy"}
                            </button>

                            {isLatestAssistant && (

                              <button
                                onClick={() =>
                                  handleRegenerate(
                                    index
                                  )
                                }
                                disabled={
                                  loading
                                }
                              >
                                🔄 Regenerate
                              </button>

                            )}

                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                );
              }
            )}

            {/* TYPING */}

            {loading && (

              <div className="message-row assistant-row">

                <div className="assistant-message-wrapper">

                  <div className="assistant-avatar">
                    ✦
                  </div>

                  <div className="assistant-content-wrapper">

                    <div className="message-author">
                      AstraAI
                    </div>

                    <div className="typing-indicator">

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>

                  </div>

                </div>

              </div>

            )}

            <div
              ref={messagesEndRef}
            />

          </div>

        </div>

        {/* =================================================
            INPUT
        ================================================= */}

        <div className="input-area">

          <div className="input-wrapper">

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ask AstraAI anything..."
              rows={1}
              disabled={loading}
            />

            {loading ? (

              <button
                type="button"
                className="send-btn stop-generation-btn"
                onClick={
                  handlePauseGeneration
                }
                title="Stop generating"
              >
                <span className="stop-icon"></span>
              </button>

            ) : (

              <button
                type="button"
                className="send-btn"
                onClick={
                  handleSendMessage
                }
                disabled={
                  !message.trim()
                }
                title="Send message"
              >
                ➤
              </button>

            )}

          </div>

          <div className="disclaimer">
            AstraAI can make mistakes.
            Check important
            information.
          </div>

        </div>

      </main>

      {/* =================================================
          SETTINGS
      ================================================= */}

      {showSettings && (

        <Settings
          darkMode={darkMode}
          onToggleDarkMode={
            toggleDarkMode
          }
          onClearChat={
            clearCurrentChat
          }
          onExportChat={
            handleExportChat
          }
          onLogout={
            handleLogout
          }
          onClose={() =>
            setShowSettings(false)
          }
        />

      )}

    </div>
  );
}

export default App;