import api from "./axiosClient";
export const search = (q) =>
  api.get("/search", { params: { q } }).then((r) => r.data);
