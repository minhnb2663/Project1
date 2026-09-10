import api from "./axiosClient";
export const artists = (params) =>
  api.get("/artists", { params }).then((r) => r.data);
export const artist = (slug) => api.get(`/artists/${slug}`).then((r) => r.data);
