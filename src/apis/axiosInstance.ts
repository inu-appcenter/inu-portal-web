import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 응답 인터셉터
axiosInstance.interceptors.response.use((response) => {
  // 모든 응답의 response.data.msg 콘솔 출력
  if (response.data && response.data.msg) {
    console.log(response.data.msg);
  }
  return response;
});

export default axiosInstance;
