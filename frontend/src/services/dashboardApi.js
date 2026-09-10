import api from "./axiosClient";
export const dashboard = () => api.get("/dashboard").then((r) => r.data);
export const trending = () =>
  api.get("/dashboard/trending").then((r) => r.data);
