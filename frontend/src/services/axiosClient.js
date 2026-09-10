import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});
api.interceptors.request.use((c) => {
  const token = localStorage.getItem("art_token");
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (e) =>
    Promise.reject(
      new Error(
        e.response?.data?.message ||
          "Không thể kết nối máy chủ. Vui lòng thử lại.",
      ),
    ),
);
export default api;
