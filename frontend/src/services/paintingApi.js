import api from "./axiosClient";
export const paintings = (p) =>
  api.get("/paintings", { params: p }).then((r) => r.data);
export const painting = (id) => api.get(`/paintings/${id}`).then((r) => r.data);
export const favorite = (id) =>
  api.post(`/paintings/${id}/favorite`).then((r) => r.data);
export const downloadUrl = (id, format = "pdf") =>
  `${api.defaults.baseURL}/paintings/${id}/download?format=${format}`;
