// src/lib/api.js
import axios from "axios";

/**
 * ✅ Docker/nginx frontend chạy ở http://localhost:3003
 * => gọi API bằng same-origin /api để nginx proxy sang backend trong docker network
 */
export const API_BASE = window.location.origin;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  // withCredentials: false, // nếu bạn không dùng cookie auth
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Network Error";
    err._prettyMessage = msg;
    return Promise.reject(err);
  }
);

export default api;
