import api from "./axiosClient";
export const createOrder = (data) =>
  api.post("/orders", data).then((r) => r.data);
export const myOrders = () => api.get("/orders/mine").then((r) => r.data);
