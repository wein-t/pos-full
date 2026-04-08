import axios from "axios";

// 1. Define the URL dynamically
// It checks Vercel for the link first. If missing, it uses localhost.
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
    baseURL: API_URL, 
    withCredentials: true,
    headers: { "Content-Type": "application/json", Accept: "application/json" }
});

api.interceptors.request.use(
    (config) => {
        const userInfoString = localStorage.getItem('userInfo');
        if (userInfoString) {
            const userInfo = JSON.parse(userInfoString);
            const token = userInfo?.token;
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// USER APIs
export const login = (data) => api.post("/api/user/login", data);
export const register = (data) => api.post("/api/user/register", data);
export const getUserData = () => api.get("/api/user");
export const logout = () => api.post("/api/user/logout");

export const getAllUsers = () => api.get("/api/user/all");
export const deleteUser = (userId) => api.delete(`/api/user/${userId}`);
export const updateUserRole = ({ userId, role }) => api.put(`/api/user/role/${userId}`, { role });

// ORDER APIs
export const getAllOrders = () => api.get("/api/orders"); 
export const addOrder = (orderData) => api.post("/api/orders", orderData); 
export const updateOrderStatus = ({ orderId, status }) => api.put(`/api/orders/${orderId}`, { orderStatus: status });

// DATA & AUDIT APIs
export const getAnalytics = () => api.get("/api/data/analytics/dashboard");
export const getDashboardStats = () => api.get("/api/data/stats");
export const getAuditLogs = () => api.get("/api/audit");
export const logAuditAction = (action, details) => api.post("/api/audit", { action, details });

// MENU APIs
const fetchMenusRequest = () => api.get("/api/menu");
export const getAllMenus = fetchMenusRequest; 
export const getMenus = fetchMenusRequest; 

export const addCategory = (data) => api.post("/api/menu/category", data);
export const deleteCategory = (id) => api.delete(`/api/menu/category/${id}`);
export const addItemToCategory = ({ categoryId, name, price }) => api.post(`/api/menu/category/${categoryId}/items`, { name, price });
export const deleteItemFromCategory = ({ categoryId, itemId }) => api.delete(`/api/menu/category/${categoryId}/items/${itemId}`);

// NEWLY ADDED: Update Item Price
export const updateItemPrice = async (data) => {
    return api.put(`/api/menu/category/${data.categoryId}/items/${data.itemId}`, { price: data.price });
};

export default api;