import api from "./axiosClient";
export const recommendations = () =>
  api.get("/recommendations/me").then((r) => r.data);
