// TapFeast – Kitchen Screen
// Reads orders from localStorage and displays them.

const STORAGE_KEYS = {
  ORDERS: "tapfeast_orders",
};

const ordersBoard = document.getElementById("ordersBoard");
const clearAllOrdersBtn = document.getElementById("clearAllOrdersBtn");

function getOrdersFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrdersToStorage(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderOrders() {
  const orders = getOrdersFromStorage();

  ordersBoard.innerHTML = "";
  if (!orders.length) {
    ordersBoard.innerHTML =
      '<p class="cart-empty">No active orders. Waiting for tables to order…</p>';
    return;
  }

  orders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.dataset.id = order.id;

    const itemsHtml = order.items
      .map(
        (it) =>
          `<li><strong>${it.qty}x</strong> ${it.name} <span>– $${(
            it.qty * it.price
          ).toFixed(2)}</span></li>`
      )
      .join("");

    card.innerHTML = `
      <div class="order-header">
        <div>
          <div class="order-table">Table ${order.table}</div>
          <div class="order-time">${formatTime(order.createdAt)}</div>
        </div>
        <div class="order-status-pill">${
          order.status === "done" ? "Done" : "In queue"
        }</div>
      </div>
      <ul class="order-items">${itemsHtml}</ul>
      <div class="order-total">Total: $${order.total.toFixed(2)}</div>
      <div class="order-footer">
        <button class="order-done-btn" data-done-id="${
          order.id
        }">Mark as Done</button>
      </div>
    `;

    ordersBoard.appendChild(card);
  });
}

function markOrderDone(orderId) {
  const orders = getOrdersFromStorage();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  orders.splice(idx, 1);
  saveOrdersToStorage(orders);
  renderOrders();
}

function clearAllOrders() {
  saveOrdersToStorage([]);
  renderOrders();
}

// EVENTS
document.addEventListener("click", (e) => {
  const doneBtn = e.target.closest("[data-done-id]");
  if (doneBtn) {
    markOrderDone(doneBtn.dataset.doneId);
  }
});

if (clearAllOrdersBtn) {
  clearAllOrdersBtn.addEventListener("click", clearAllOrders);
}

// INITIAL
renderOrders();

// Optional: poll every few seconds to auto-refresh if the same machine
// is used for both tablet + kitchen.
setInterval(renderOrders, 4000);
