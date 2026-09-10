import api from "./axiosClient";
export const login = (x) => api.post("/auth/login", x).then((r) => r.data);
export const register = (x) =>
  api.post("/auth/register", x).then((r) => r.data);
export const me = () => api.get("/auth/me").then((r) => r.data);
