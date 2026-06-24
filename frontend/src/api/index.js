import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

// Products
export const getProducts = (page = 1, limit = 12) =>
  api.get(`/products?page=${page}&limit=${limit}`)
export const searchProducts = (q) => api.get(`/products/search?q=${encodeURIComponent(q)}`)
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// Cart
export const getCart = () => api.get('/cart')
export const addToCart = (product_id, quantity) =>
  api.post('/cart/add', { product_id, quantity })
export const removeFromCart = (id) => api.delete(`/cart/remove/${id}`)

// Orders
export const checkout = () => api.post('/orders/checkout')
export const payOrder = (id, method = 'card') => api.post('/orders/pay', { id, method })
export const cancelOrder = (id) => api.post('/orders/cancel', { id })
export const getOrders = () => api.get('/orders')
export const getOrder = (id) => api.get(`/orders/${id}`)
