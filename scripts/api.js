// axios cdn
import "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";

// api
const base_url = "https://livejs-api.hexschool.io/api/livejs/v1";

// api path
const api_path = "ashen";

// api token
const api_token = "v0Lk6ZZjcpWXjTVTXuQVFCquH0u1";

const contentType = { "Content-Type": "application/json" };

// 前台
const frontEndRequest = axios.create({
  baseURL: `${base_url}/customer/${api_path}`,
  headers: contentType,
});

// 產品
export const _getProducts = () => frontEndRequest.get("/products");

// 購物車
export const _getCarts = () => frontEndRequest.get("/carts");
export const _addCart = (data) => frontEndRequest.post("/carts", data);
export const _patchCart = (data) => frontEndRequest.patch("/carts", data);
export const _deleteCart = (id) => frontEndRequest.delete(`/carts/${id}`);
export const _deleteAllCart = () => frontEndRequest.delete(`/carts`);

// 前台訂單
export const _postOrders = (data) => frontEndRequest.post(`/orders`, data);

// 後台
const BackEndRequest = axios.create({
  baseURL: `${base_url}/admin/${api_path}`,
  headers: {
    ...contentType,
    Authorization: api_token,
  },
});

// 後台訂單
export const _getOrders = (data) => BackEndRequest.get(`/orders`, data);
export const _putOrder = (data) => BackEndRequest.put(`/orders`, data);
export const _deleteOrder = (id) => BackEndRequest.delete(`/orders/${id}`);
export const _deleteOrders = () => BackEndRequest.delete(`/orders`);
