import axios, { AxiosInstance } from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const runnerClient = axios.create({
  baseURL: 'http://localhost:8001/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const orchestratorClient = axios.create({
  baseURL: 'http://localhost:8002/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const handleLogout = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const attachAuthInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await axiosClient.post("/auth/refresh");

          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token expired or failed", refreshError);
          handleLogout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

attachAuthInterceptors(axiosClient);
attachAuthInterceptors(runnerClient);
attachAuthInterceptors(orchestratorClient);

export { axiosClient, runnerClient, orchestratorClient };