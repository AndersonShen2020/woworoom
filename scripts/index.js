import * as api from "./api.js";
import { debounce } from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

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
// 找出所有的 form 輸入欄位(要驗證的欄位)
const inputs = orderInfoForm.querySelectorAll("input[type=text],input[type=tel],input[type=email]");
// 所有表單 inupt
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");

// validate 套件的驗證規則
const constraints = {
  姓名: {
    presence: {
      message: "是必填的欄位",
    },
  },
  電話: {
    presence: {
      message: "是必填的欄位",
    },
    format: {
      pattern: /^09\d{8}$/,
      message: "號碼開頭需為 09",
    },
    length: {
      is: 10,
      message: "長度須為10碼",
    },
  },
  信箱: {
    presence: {
      message: "是必填的欄位",
    },
    email: true,
  },
  寄送地址: {
    presence: {
      message: "是必填欄位",
    },
  },
  交易方式: {
    presence: {
      message: "是必填欄位",
    },
  },
};

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
    console.error(err?.response?.data?.message);
  }
}

// 產品 -  渲染產品列表
function renderProducts(products) {
  let result = ``;
  products.forEach((item) => {
    result += `<li class="productCard" data-title="${item.title}">
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

  // 綁定加入購物車按鈕
  const addCardBtn = document.querySelectorAll(".addCardBtn");
  addCardBtn.forEach((item) => {
    // 綁定
    item.addEventListener("click", (e) => {
      let productId = "";
      // 找出產品 ID
      productsData.forEach((item) => {
        if (item.title === e.target.closest("li").dataset.title) {
          productId = item.id;
        }
      });
      addCarts(productId);
    });
  });
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
async function addCarts(productId, productNum = 1) {
  let data = {
    data: {
      productId: productId,
      quantity: productNum,
    },
  };
  // 打 API(加入購物車)
  try {
    let result = await api._addCart(data);
    cartsData = result.data;
    // console.table(cartsData);
    console.log(cartsData);
    renderCarts();
  } catch (err) {
    console.error(err);
  }
}

// 購物車 - 取得購物車列表
async function getCarts() {
  try {
    let { data } = await api._getCarts();
    cartsData = data;
    // console.table(cartsData);
    console.log(cartsData);
    renderCarts();
  } catch (err) {
    console.error(err?.response?.data?.message);
  }
}

// 購物車 - 渲染購物車列表
function renderCarts() {
  let result = ``;
  cartsData.carts.forEach((item) => {
    result += `<tr data-title="${item.product.title}">
    <td>
      <div class="cardItem-title">
        <img src="${item.product.images}" alt="" />
        <p>${item.product.title}</p>
      </div>
    </td>
    <td>NT$ ${item.product.price}</td>
    <td>
      <input class="shoppingCart-num" type="number" min="1" value="${item.quantity}" />
    </td>
    <td>NT$ ${item.product.price * item.quantity}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons" id="deleteCartItem"> clear </a>
    </td>
  </tr>`;
  });
  cartsList.innerHTML = result;

  const totalCartsCost = document.querySelector("#totalCartsCost");
  totalCartsCost.innerHTML = `NT$ ${cartsData.finalTotal}`;

  const shoppingCartNum = document.querySelectorAll(".shoppingCart-num");
  shoppingCartNum.forEach((item) => {
    item.addEventListener("change", debounce(patchCarts, 500));
  });

  const deleteCartItem = document.querySelectorAll("#deleteCartItem");
  deleteCartItem.forEach((item) => {
    item.addEventListener("click", deleteCart);
  });
}

// 購物車 - 修改數量
async function patchCarts(e) {
  const title = e.target.closest("tr").dataset.title;
  const num = parseInt(e.target.value);
  let id = "";

  cartsData.carts.forEach((item) => {
    if (item.product.title === title) {
      id = item.id;
    }
  });

  let data = {
    data: {
      id,
      quantity: num,
    },
  };
  console.log(data);
  try {
    let result = await api._patchCart(data);
    cartsData = result.data;
    renderCarts();
  } catch (err) {
    console.error(err?.response?.data?.message);
  }
}

// 購物車 - 單筆刪除
async function deleteCart(e) {
  const title = e.target.closest("tr").dataset.title;
  let id = "";

  cartsData.carts.forEach((item) => {
    if (item.product.title === title) {
      id = item.id;
    }
  });

  try {
    let result = await api._deleteCart(id);
    cartsData = result.data;
    renderCarts();
  } catch (err) {
    console.error(err?.response?.data?.message);
  }
}

// 購物車 - 清空購物車
deleteCartsBtn.addEventListener("click", async () => {
  try {
    let result = await api._deleteAllCart();
    cartsData = result.data;
    renderCarts();
  } catch (err) {
    console.error(err?.response?.data?.message);
  }
});

// 表單 - 驗證功能

function formVerify() {
  // 將所有錯誤訊息清除歸零
  inputs.forEach((input) => {
    input.nextElementSibling.textContent = "";
  });

  // 按下 submit 時要進行驗證
  orderInfoForm.addEventListener("submit", (e) => formCheck(e));
}

// 表單 - 驗證錯誤提示訊息
function formCheck(e) {
  e.preventDefault();

  // 驗證回傳的內容
  let errors = validate(orderInfoForm, constraints);

  // 購物車中有沒有東西
  if (cartsData.carts.length !== 0) {
    if (errors) {
      // 有錯誤，找出對應的錯誤並渲染到畫面上

      // 將所有錯誤訊息清除歸零
      inputs.forEach((input) => {
        input.nextElementSibling.textContent = "";
      });

      // 列出所有 errors 中的 key 值
      let errorKeys = Object.keys(errors);
      errorKeys.forEach((key) => {
        // 渲染到畫面上
        document.querySelector(`[data-message=${key}]`).textContent = errors[key];
      });
    } else {
      // 沒有錯誤，將訂單送到後端
      sendOrder();
    }
  }
}

// 表單 - 送出購買訂單
async function sendOrder() {
  // 要送出去的訂單資料
  const data = {
    data: {
      user: {
        name: customerName.value,
        tel: customerPhone.value,
        email: customerEmail.value,
        address: customerAddress.value,
        payment: tradeWay.value,
      },
    },
  };
  try {
    let result = await api._postOrders(data);
    cartsData = result.data;
    getCarts();
    orderInfoForm.reset();
  } catch (err) {
    console.error(err?.response?.data?.message);
  }
}

// 初始化
async function init() {
  await getProducts();
  await getCarts();
  formVerify();
}

init();
