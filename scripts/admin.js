import * as api from "./api.js";
import { isLoading } from "./common/loading.js";

// DOM
const orderList = document.querySelector("#orderList");
const deleteAllOrders = document.querySelector("#deleteAllOrders");
const orderCategory = document.querySelector("#orderCategory");
const orderTitle = document.querySelector("#orderTitle");
const orderChartTitle = document.querySelector(".section-title");
const chart = document.querySelector("#chart");

orderCategory.addEventListener("click", (e) => getOrders("category"));
orderTitle.addEventListener("click", (e) => getOrders("title"));

// 訂單 - 獲取訂單
async function getOrders(state = "title") {
  try {
    isLoading(true);
    let res = await api._getOrders();
    let orders = res.data.orders;
    renderOrdersList(orders);

    if (state === "title") {
      orderChartTitle.innerText = "全品項營收比重";
      orderSortWithTitle(orders);
    } else if (state === "category") {
      orderChartTitle.innerText = "全產品類別營收比重";
      orderSortWithCategory(orders);
    }
    isLoading(false);
  } catch (err) {
    console.error(err);
  }
}

// 表格渲染
function renderOrdersList(orders) {
  isLoading(true);

  let result = ``;
  orders.forEach((order) => {
    let time = new Date(order.createdAt * 1000);
    result += `
    <tr>
      <td>${order.id}</td>
      <td>
        <p>${order.user.name}</p>
        <p>${order.user.tel}</p>
      </td>
      <td>${order.user.address}</td>
      <td>${order.user.email}</td>
      <td>
      `;

    order.products.forEach((product) => {
      result += `<p>${product.title} x ${product.quantity}</ p>`;
    });

    result += `
        </td>
        <td>${time.getFullYear()}/${time.getMonth()}/${time.getDay()}</td>
        <td class="orderStatus">
          <a href="#" id="changeState" style="${order.paid ? "" : "color:red"}">${
      order.paid ? "已處理" : "未處理"
    }</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除" />
        </td>
      </tr>
    `;
  });
  orderList.innerHTML = result;

  // 切換訂單狀態
  const changeStateList = document.querySelectorAll("#changeState");
  changeStateList.forEach((changeStateItem) => {
    changeStateItem.addEventListener("click", (e) => {
      e.preventDefault();
      const orderId = e.target.closest("tr").cells[0].innerText;
      const state = e.target.closest("tr").cells[6].innerText === "未處理" ? false : true;
      changeOrderState(orderId, state);
    });
  });

  // 刪除特定訂單
  const delSingleOrder = document.querySelectorAll(".delSingleOrder-Btn");
  delSingleOrder.forEach((delSingleOrderItem) => {
    delSingleOrderItem.addEventListener("click", (e) => {
      e.preventDefault();
      const orderId = e.target.closest("tr").cells[0].innerText;
      deleteOrder(orderId);
    });
  });

  isLoading(false);
}

// 表格操作 - 訂單狀態切換
async function changeOrderState(orderId, state) {
  let data = {
    data: {
      id: orderId,
      paid: !state,
    },
  };
  try {
    let res = await api._putOrder(data);
    let orders = res.data.orders;
    renderOrdersList(orders);
  } catch (err) {
    console.error(err?.response?.data?.message);
  }
}

// 表格操作 - 刪除單筆
async function deleteOrder(orderId) {
  try {
    await api._deleteOrder(orderId);
    getOrders();
  } catch (err) {
    console.error(err?.response?.data?.message);
  }
}

// 表格操作 - 刪除所有項目
deleteAllOrders.addEventListener("click", (e) => {
  e.preventDefault();
  api
    ._deleteOrders()
    .then((res) => {
      getOrders();
    })
    .catch((err) => {
      console.error(err);
    });
});

// 全產品類別營收比重 - 類別含三項，共有：床架、收納、窗簾
// C3 要的資料 => [["Louvre 雙人床架", 1],["Antony 雙人床架", 2],["Anty 雙人床架", 3],["其他", 4],]
function orderSortWithCategory(orders) {
  // 資料存放
  let temp = {};
  let c3Data = [];

  if (orders.length) {
    // 計算每個項目的數量
    orders.forEach((order) => {
      order.products.forEach(({ category, quantity }) => {
        if (temp[category]) {
          temp[category] += quantity;
        } else {
          temp[category] = 0;
          temp[category] += quantity;
        }
      });
    });

    // 轉換成 C3 資料格式
    Object.keys(temp).forEach((key) => {
      c3Data.push([key, temp[key]]);
    });
  }
  // 資料送去渲染
  chartGenerate(c3Data);
}

// 全品項營收比重 - 篩選出前三名營收品項，其他 4~8 名都統整為「其它」
// C3 要的資料 => [["Louvre 雙人床架", 1],["Antony 雙人床架", 2],["Anty 雙人床架", 3],["其他", 4],]
function orderSortWithTitle(orders) {
  // 資料存放
  let temp = {};
  let c3Data = [];

  if (orders.length) {
    // 計算每個項目的數量
    orders.forEach((order) => {
      order.products.forEach(({ title, quantity }) => {
        if (temp[title]) {
          temp[title] += quantity;
        } else {
          temp[title] = 0;
          temp[title] += quantity;
        }
      });
    });

    // 轉換成 C3 資料格式
    Object.keys(temp).forEach((key) => {
      c3Data.push([key, temp[key]]);
    });

    // 排序
    c3Data.sort((x, y) => y[1] - x[1]);

    // 將 4~8 統整為「其它」並計算總數
    if (c3Data.length > 3) {
      let newData = ["其他", 0];
      for (let i = 3; i < c3Data.length; i++) {
        newData[1] += c3Data[i][1];
      }

      c3Data = c3Data.slice(0, 3);
      c3Data.push(newData);
    }
  }
  // 資料送去渲染
  chartGenerate(c3Data);
}

// C3 渲染
function chartGenerate(c3Data) {
  if (c3Data.length) {
    chart.classList.remove("d-none");
    c3.generate({
      bindto: "#chart", // HTML 元素綁定
      data: {
        type: "pie",
        columns: c3Data,
      },
      color: {
        pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"],
      },
    });
  } else {
    chart.classList.add("d-none");
  }
}

async function init() {
  await getOrders();
}

init();
