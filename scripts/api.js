// axios cdn
import "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";

// api
const base_url = "https://livejs-api.hexschool.io/api/livejs/v1";

// api token
const api_token = "v0Lk6ZZjcpWXjTVTXuQVFCquH0u1";

const frontEndRequest = axios.create({
  baseURL: `${base_url}/customer/ashen`,
  headers: { "Content-Type": "application/json" },
});

// 產品
export const _getProducts = () => frontEndRequest.get("/products");

// 購物車
export const _getCarts = () => frontEndRequest.get("/carts");
export const _addCarts = (data) => frontEndRequest.post("/carts", data);
