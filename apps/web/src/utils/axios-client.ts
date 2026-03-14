import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleLogout = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config!;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axiosClient.post("/auth/refresh");

        return axiosClient(originalRequest);

      } catch (error) {

        console.log(error);
        handleLogout();

        return Promise.reject(error);
      }
    }
  }
)

export default axiosClient;