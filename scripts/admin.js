import * as api from "./api.js";

// 訂單 - 獲取訂單
function getOrders() {
  api._getOrders().then((res) => {
    let orders = res.data.orders;
    console.log(orders);
    calOrders(orders);
  });
}

// 表格渲染

// 表格操作 - 訂單狀態切換
// 表格操作 - 刪除單筆
// 表格操作 - 刪除所有項目

// 訂單排列計算 - 篩選出前三名營收品項，其他 4~8 名都統整為「其它」
// C3 要的資料 => [["Louvre 雙人床架", 1],["Antony 雙人床架", 2],["Anty 雙人床架", 3],["其他", 4],]
function calOrders(orders) {
  // 資料存放
  let temp = {};
  let c3Data = [];

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
  console.log(temp);
  Object.keys(temp).forEach((key) => {
    c3Data.push([key, temp[key]]);
  });
  console.log(c3Data);

  // 排序
  c3Data.sort((x, y) => y[1] - x[1]);
  console.log(c3Data);

  // 將 4~8 統整為「其它」並計算總數
  let newData = ["其他", 0];
  for (let i = 3; i < c3Data.length; i++) {
    newData[1] += c3Data[i][1];
  }
  console.log(newData);
  c3Data = c3Data.slice(0, 3);
  c3Data.push(newData);

  // 資料送去渲染
  chartGenerate(c3Data);
}

// C3 渲染
function chartGenerate(c3Data) {
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
}

function init() {
  getOrders();
}

init();
