import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ถ้าเจอ 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // ✅ เช็คก่อน: ถ้าเราไม่ได้อยู่ที่หน้า Login (/) ค่อยดีด
      // ถ้าอยู่ที่หน้า Login อยู่แล้ว ให้ปล่อยผ่าน (เพื่อให้หน้า Login โชว์ Error ตัวแดง)
      if (window.location.pathname !== '/') {
         console.warn("Session expired. Redirecting to login...");
         localStorage.clear();
         window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;