import api from "./axiosClient";

export const getCollection = () =>
  api.get("/collections").then((response) => response.data);

export const addToCollection = (paintingId) =>
  api.post(`/collections/${paintingId}`).then((response) => response.data);

export const removeFromCollection = (paintingId) =>
  api.delete(`/collections/${paintingId}`).then((response) => response.data);

export const clearCollection = () =>
  api.delete("/collections").then((response) => response.data);
