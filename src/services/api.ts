import axios from "axios";
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
} from "@/utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        console.warn("Sem refreshToken, redirecionando para login...");
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/refresh-token`,
          { refreshToken }
        );

        const { token, refreshToken: newRefresh } = res.data;

        setToken(token);
        setRefreshToken(newRefresh);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Erro ao renovar token:", err);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
