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

export const _getProducts = () => frontEndRequest.get("/products");
