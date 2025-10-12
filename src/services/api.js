import axios from 'axios';

const BASE_URL = 'https://finacialtracker-a527.onrender.com/';

const api = axios.create({
  baseURL: BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('register', userData),
  login: (credentials) => api.post('login', credentials),
  test: () => api.get('/test'),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/api/categories/all'),
  add: (categoryData) => api.post('/api/categories/add', categoryData),
  getByName: (name) => api.get(`/api/categories/${name}`),
  update: (name, categoryData) => api.put(`/api/categories/${name}`, categoryData),
  delete: (name) => api.delete(`/api/categories/${name}`),
};
// Transaction APIs
export const transactionAPI = {
  add: (transactionData, categoryName) =>
    api.post(`/api/transactions/add?categoryName=${categoryName}`, transactionData),
  getAll: () => api.get('/api/transactions/all'),
  getByCategory: (categoryName) =>
    api.get(`/api/transactions/category?categoryName=${categoryName}`),
  getByDate: (startDate, endDate) =>
    api.get(`/api/transactions/byDate?start=${startDate}&end=${endDate}`),
  getByType: (type) =>
    api.get(`/api/transactions/byType?type=${type}`),
};


// Dashboard APIs
export const dashboardAPI = {
  getSummary: (month = null) => {
    const params = month ? { month } : {};
    return api.get('/api/dashboard/summary', { params });
  }
};
export default api;