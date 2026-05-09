import axios from "axios";

const ACCESS_TOKEN_COOKIE_KEY = "vy_access_token";
const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";

const isSecureContext = () => window.location.protocol === "https:";

export const setAccessTokenCookie = (token) => {
  if (!token) return;
  const secureFlag = isSecureContext() ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secureFlag}`;
};

export const getAccessTokenCookie = () => {
  const cookieParts = document.cookie ? document.cookie.split("; ") : [];
  const cookie = cookieParts.find((part) => part.startsWith(`${ACCESS_TOKEN_COOKIE_KEY}=`));
  if (!cookie) return null;
  const [, value] = cookie.split("=");
  return value ? decodeURIComponent(value) : null;
};

export const clearAccessTokenCookie = () => {
  document.cookie = `${ACCESS_TOKEN_COOKIE_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
};

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

AxiosInstance.interceptors.request.use((config) => {
  const token = getAccessTokenCookie();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default AxiosInstance;