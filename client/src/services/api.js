import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach token to outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('packcraft_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

export const packagingAPI = {
  getList: (params) => API.get('/packaging', { params }),
  getCategories: () => API.get('/packaging/categories'),
  getMaterials: () => API.get('/packaging/materials'),
  getBySlug: (slug) => API.get(`/packaging/${slug}`),
};

export const pricingAPI = {
  getEstimate: (data) => API.post('/pricing/estimate', data),
};

export const designsAPI = {
  getAll: () => API.get('/designs'),
  getById: (id) => API.get(`/designs/${id}`),
  create: (data) => API.post('/designs', data),
  update: (id, data) => API.patch(`/designs/${id}`, data),
  duplicate: (id) => API.post(`/designs/${id}/duplicate`),
  delete: (id) => API.delete(`/designs/${id}`),
};

export const quotationsAPI = {
  create: (data) => API.post('/quotations', data),
  getAll: () => API.get('/quotations'),
  getById: (id) => API.get(`/quotations/${id}`),
  accept: (id) => API.post(`/quotations/${id}/accept`),
  requestRevision: (id, data) => API.post(`/quotations/${id}/revision-request`, data),
  decline: (id) => API.post(`/quotations/${id}/decline`),
};

export const ordersAPI = {
  create: (data) => API.post('/orders', data),
  getAll: () => API.get('/orders'),
  getById: (id) => API.get(`/orders/${id}`),
};

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  createProduct: (data) => API.post('/admin/packaging', data),
  updateProduct: (id, data) => API.patch(`/admin/packaging/${id}`, data),
  deleteProduct: (id) => API.delete(`/admin/packaging/${id}`),
  getQuotations: (params) => API.get('/admin/quotations', { params }),
  updateQuotation: (id, data) => API.patch(`/admin/quotations/${id}`, data),
  getOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => API.patch(`/admin/orders/${id}`, data),
  getPricingRules: () => API.get('/admin/pricing'),
  updatePricingRule: (id, data) => API.patch(`/admin/pricing/${id}`, data),
};

export const uploadAPI = {
  uploadArtwork: (formData) =>
    API.post('/upload/artwork', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default API;
