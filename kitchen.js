// TapFeast – Kitchen display logic (real-time via Firestore)

// Firebase (real-time shared orders across devices)
import { db, collection, query, orderBy, onSnapshot, doc, updateDoc } from "./firebase.js";

const STORAGE_KEYS = {
  ORDERS: "tapfeast_orders", // (no longer used for orders, kept for compatibility)
  THEME: "tapfeast_theme",
};

let ordersCache = []; // live orders from Firestore

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  startRealtimeOrders();

  // Manual refresh just re-renders what we already have
  document
    .getElementById("refreshOrders")
    .addEventListener("click", () => renderOrdersFromArray(ordersCache));

  document
    .getElementById("themeToggle")
    .addEventListener("click", handleThemeToggle);
});

function startRealtimeOrders() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

  onSnapshot(
    q,
    (snapshot) => {
      ordersCache = snapshot.docs.map((d) => ({ docId: d.id, ...d.data() }));
      renderOrdersFromArray(ordersCache);
    },
    (err) => {
      console.error("Firestore listen error:", err);
      renderOrdersFromArray([]);
      const board = document.getElementById("ordersBoard");
      const p = document.createElement("p");
      p.textContent =
        "Unable to load live orders. Check internet connection / Firestore rules.";
      p.style.color = "#b91c1c";
      p.style.marginTop = "1rem";
      board.appendChild(p);
    }
  );
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initial = saved || (prefersDark ? "dark" : "light");
  setTheme(initial);
}

function setTheme(theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  const toggle = document.getElementById("themeToggle");
  if (toggle) toggle.setAttribute("aria-label", `Theme: ${theme}`);
}

function handleThemeToggle() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
}

function renderOrdersFromArray(orders) {
  const board = document.getElementById("ordersBoard");
  board.innerHTML = "";

  if (orders.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No orders yet. Orders placed from the tablet will appear here.";
    p.className = "muted";
    board.appendChild(p);
    return;
  }

  orders.forEach((order) => {
    const card = document.createElement("section");
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

    const created = order.createdAt?.toDate
      ? order.createdAt.toDate()
      : (order.createdAtISO ? new Date(order.createdAtISO) : new Date());

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

    (order.items || []).forEach((it) => {
      const li = document.createElement("li");
      li.className = "order-item";
      li.innerHTML = `<span>${it.qty}× ${it.name}</span><span>$${(it.price * it.qty).toFixed(2)}</span>`;
      ul.appendChild(li);
    });

    const total = document.createElement("div");
    total.className = "order-total";
    total.textContent = `Total: $${Number(order.total || 0).toFixed(2)}`;

    const statusPill = document.createElement("span");
    statusPill.className =
      "status-pill " + (order.status === "done" ? "status-done" : "status-pending");
    statusPill.textContent = order.status === "done" ? "Ready" : "In queue";

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
    doneBtn.textContent = order.status === "done" ? "Undo" : "Mark Ready";

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

async function toggleOrderStatus(orderId) {
  // Find the Firestore doc for this order
  const target = ordersCache.find((o) => o.id === orderId);
  if (!target || !target.docId) return;

  const nextStatus = target.status === "done" ? "pending" : "done";

  try {
    await updateDoc(doc(db, "orders", target.docId), { status: nextStatus });
  } catch (err) {
    console.error("Failed to update status:", err);
  }
}
