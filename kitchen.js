// TapFeast – Kitchen display logic
const STORAGE_KEYS = {
  ORDERS: "tapfeast_orders",
  THEME: "tapfeast_theme",
};

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderOrders();

  document
    .getElementById("refreshOrders")
    .addEventListener("click", renderOrders);

  document
    .getElementById("themeToggle")
    .addEventListener("click", handleThemeToggle);

  // Light auto-refresh every 10 seconds
  setInterval(renderOrders, 10000);
});

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initial = saved || (prefersDark ? "dark" : "light");
  setTheme(initial);
}

function setTheme(theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  const toggleBtn = document.getElementById("themeToggle");
  if (toggleBtn) {
    toggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

function handleThemeToggle() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
}

function renderOrders() {
  const board = document.getElementById("ordersBoard");
  board.innerHTML = "";

  const raw = localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]";
  let orders;
  try {
    orders = JSON.parse(raw);
    if (!Array.isArray(orders)) orders = [];
  } catch {
    orders = [];
  }

  if (orders.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No orders yet. Orders placed from the tablet will appear here.";
    p.className = "empty-cart";
    board.appendChild(p);
    return;
  }

  // Show newest orders first
  orders
    .slice()
    .sort((a, b) => b.id - a.id)
    .forEach((order) => {
      const card = document.createElement("article");
      card.className = "order-card";

      const header = document.createElement("div");
      header.className = "order-header";

      const title = document.createElement("h2");
      title.className = "order-title";
      title.textContent = `Table ${order.table}`;

      const metaWrap = document.createElement("div");

      const idSpan = document.createElement("div");
      idSpan.className = "order-meta";
      idSpan.textContent = `Order #${order.id}`;

      const timeSpan = document.createElement("div");
      timeSpan.className = "order-meta";
      const created = order.createdAt ? new Date(order.createdAt) : new Date();
      timeSpan.textContent = created.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      metaWrap.appendChild(idSpan);
      metaWrap.appendChild(timeSpan);

      header.appendChild(title);
      header.appendChild(metaWrap);

      const ul = document.createElement("ul");
      ul.className = "order-items";

      order.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.qty} × ${item.name}`;
        ul.appendChild(li);
      });

      const total = document.createElement("div");
      total.className = "order-meta";
      total.textContent = `Total: $${order.total.toFixed(2)}`;

      const statusPill = document.createElement("span");
      statusPill.className =
        "status-pill " + (order.status === "done" ? "status-done" : "status-pending");
      statusPill.textContent =
        order.status === "done" ? "Ready" : "In queue";

      const footerRow = document.createElement("div");
      footerRow.style.display = "flex";
      footerRow.style.justifyContent = "space-between";
      footerRow.style.alignItems = "center";
      footerRow.style.marginTop = "0.4rem";

      footerRow.appendChild(statusPill);

      const actions = document.createElement("div");
      actions.className = "order-actions";

      const doneBtn = document.createElement("button");
      doneBtn.className = "primary-btn";
      doneBtn.style.width = "auto";
      doneBtn.style.paddingInline = "1rem";
      doneBtn.textContent =
        order.status === "done" ? "Undo" : "Mark Ready";

      doneBtn.addEventListener("click", () => {
        toggleOrderStatus(order.id);
      });

      actions.appendChild(doneBtn);
      footerRow.appendChild(actions);

      card.appendChild(header);
      card.appendChild(ul);
      card.appendChild(total);
      card.appendChild(footerRow);

      board.appendChild(card);
    });
}

function toggleOrderStatus(orderId) {
  const raw = localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]";
  let orders;
  try {
    orders = JSON.parse(raw);
    if (!Array.isArray(orders)) orders = [];
  } catch {
    orders = [];
  }

  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;

  const current = orders[idx];
  current.status = current.status === "done" ? "pending" : "done";

  orders[idx] = current;
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  renderOrders();
}
