import api from "./axiosClient";
export const chat = (message, sessionId) =>
  api.post("/chatbot", { message, sessionId }).then((r) => r.data);
