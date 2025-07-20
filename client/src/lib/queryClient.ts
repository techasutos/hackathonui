import axios, { AxiosRequestConfig, Method } from "axios";
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/constants";

// ✅ Create Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL || "/api", // fallback to proxy path in dev
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // enable if backend sets cookies
});

// ✅ Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ apiRequest function using Axios
export const apiRequest = async (
  method: Method,
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
) => {
  try {
    const response = await api.request({
      method,
      url: endpoint,
      data,
      ...config,
    });
    return response;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "API request failed");
  }
};

// ✅ Fallback fetch for SSR queryFn / non-Axios
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// ✅ Default fetch-based query function (for useQuery)
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401 }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    const res = await fetch(url, {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// ✅ TanStack Query Client setup
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});