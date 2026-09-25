import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// =====================================================
// AUTH
// =====================================================

export const registerUser = async (userData) => {
  const response = await API.post(
    "/auth/register",
    userData
  );

  return response.data;
};


export const loginUser = async (userData) => {
  const response = await API.post(
    "/auth/login",
    userData
  );

  if (response.data.token) {
    localStorage.setItem(
      "token",
      response.data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};


// =====================================================
// CONVERSATIONS
// =====================================================

export const createConversation = async () => {
  const response = await API.post(
    "/chat/conversations"
  );

  return response.data;
};


export const getConversations = async () => {
  const response = await API.get(
    "/chat/conversations"
  );

  return response.data;
};


export const renameConversation = async (
  conversationId,
  title
) => {
  const response = await API.put(
    `/chat/conversations/${conversationId}`,
    {
      title,
    }
  );

  return response.data;
};


export const deleteConversation = async (
  conversationId
) => {
  const response = await API.delete(
    `/chat/conversations/${conversationId}`
  );

  return response.data;
};


// =====================================================
// MESSAGES
// =====================================================

export const getMessages = async (
  conversationId
) => {
  const response = await API.get(
    `/chat/conversations/${conversationId}/messages`
  );

  return response.data;
};


// =====================================================
// SEND MESSAGE
// =====================================================

export const sendMessage = async (
  conversationId,
  message,
  signal
) => {
  const response = await API.post(
    `/chat/conversations/${conversationId}/messages`,
    {
      message,
    },
    {
      signal,
    }
  );

  return response.data;
};


// =====================================================
// REGENERATE MESSAGE
// =====================================================

export const regenerateMessage = async (
  conversationId,
  signal
) => {
  const response = await API.post(
    `/chat/conversations/${conversationId}/regenerate`,
    {},
    {
      signal,
    }
  );

  return response.data;
};


// =====================================================
// EDIT MESSAGE
// =====================================================

export const editMessage = async (
  conversationId,
  messageId,
  message
) => {
  const response = await API.put(
    `/chat/conversations/${conversationId}/messages/${messageId}`,
    {
      message,
    }
  );

  return response.data;
};


// =====================================================
// LOGOUT
// =====================================================

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};


export default API;