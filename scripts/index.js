import * as api from "./api.js";

// DOM
// 產品列表
const productWrap = document.querySelector(".productWrap");
// 產品下拉選單
const productSelect = document.querySelector(".productSelect");
// 購物車列表
const cartsList = document.querySelector("#shoppingCart-table-list");
// 刪除全部購物車產品
const deleteCartsBtn = document.querySelector(".discardAllBtn");
// 表單
const orderInfoForm = document.querySelector(".orderInfo-form");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

// 儲存遠端資料
let productsData = [];
let cartsData = [];

// 產品 -  取得產品列表
async function getProducts() {
  try {
    const res = await api._getProducts();
    productsData = res.data.products;
    console.table(productsData);
    renderProducts(productsData);
  } catch (err) {
    console.error(err.response.data.message);
  }
}

// 產品 -  渲染產品列表
function renderProducts(products) {
  let result = ``;
  products.forEach((item) => {
    result += `<li class="productCard">
    <h4 class="productType">${item.category}</h4>
    <img
      src=${item.images}
      alt=${item.title}
    />
    <a href="#" class="addCardBtn">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$ ${item.origin_price}</del>
    <p class="nowPrice">NT$ ${item.price}</p>
  </li>`;
  });
  productWrap.innerHTML = result;
}

// 產品 - 顯示 select 下拉選單選項
productSelect.addEventListener("change", (e) => {
  let select = e.target.value;
  let data = filterProducts(select);
  renderProducts(data);
});

// 產品 -  篩選產品類別
function filterProducts(category) {
  let result =
    category === "全部" ? productsData : productsData.filter((item) => item.category === category);
  return result;
}

// 產品 - 新增產品到購物車
// 購物車 - 取得購物車列表
// 購物車 - 顯示購物車列表
// 購物車 - 新增產品
// 購物車 - 功能整合(單筆刪除、修改數量)
// 購物車 - 修改數量
// 購物車 - 單筆刪除
// 購物車 - 清空購物車
// 表單 - 驗證功能
// validate 套件的驗證規則
// 表單 -  驗證錯誤提示訊息
// 表單 - 送出購買訂單
// 初始化
async function init() {
  await getProducts();
}

init();
