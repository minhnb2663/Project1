import api from "./axiosClient";
export const categories = () => api.get("/categories").then((r) => r.data);
