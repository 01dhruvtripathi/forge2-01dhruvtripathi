import api from './client'

export const authApi = {
  login: (email, password) => api.post('/api/login', { email, password }),
  register: (data) => api.post('/api/register', data),
  logout: () => api.post('/api/logout'),
  me: () => api.get('/api/me'),
}

export const ticketApi = {
  list: (params) => api.get('/api/tickets', { params }),
  get: (id) => api.get(`/api/tickets/${id}`),
  create: (data) => api.post('/api/tickets', data),
  update: (id, data) => api.put(`/api/tickets/${id}`, data),
  delete: (id) => api.delete(`/api/tickets/${id}`),
}

export const commentApi = {
  list: (ticketId) => api.get(`/api/tickets/${ticketId}/comments`),
  create: (ticketId, data) => api.post(`/api/tickets/${ticketId}/comments`, data),
}

export const dashboardApi = {
  metrics: () => api.get('/api/dashboard'),
}

export const activityApi = {
  list: (ticketId) => api.get(`/api/tickets/${ticketId}/activity`),
}

export const slaApi = {
  list: () => api.get('/api/sla-policies'),
  update: (id, data) => api.put(`/api/sla-policies/${id}`, data),
}
