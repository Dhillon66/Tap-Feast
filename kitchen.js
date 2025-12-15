// TapFeast – Kitchen Screen
// Reads orders from Firestore and displays them (works across devices).

import { db, collection, query, orderBy, onSnapshot, doc, updateDoc } from "./firebase.js";

const ordersBoard = document.getElementById("ordersBoard");
const clearAllOrdersBtn = document.getElementById("clearAllOrdersBtn");

let liveOrders = []; // [{docId,...data}]

function formatTime(createdAt, createdAtISO) {
  const d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAtISO || Date.now());
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderOrders(orders) {
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

    const itemsHtml = (order.items || [])
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
          <div class="order-time">${formatTime(order.createdAt, order.createdAtISO)}</div>
        </div>
        <div class="order-status-pill">${
          order.status === "done" ? "Done" : "In queue"
        }</div>
      </div>
      <ul class="order-items">${itemsHtml}</ul>
      <div class="order-total">Total: $${Number(order.total || 0).toFixed(2)}</div>
      <div class="order-footer">
        <button class="order-done-btn" data-done-id="${order.id}">
          Mark as Done
        </button>
      </div>
    `;

    ordersBoard.appendChild(card);
  });
}

async function markOrderDone(orderId) {
  const target = liveOrders.find((o) => o.id === orderId);
  if (!target) return;

  try {
    // archive instead of delete (safer for demos)
    await updateDoc(doc(db, "orders", target.docId), {
      status: "done",
      archived: true,
    });
  } catch (err) {
    console.error("Failed to mark done:", err);
  }
}

async function clearAllOrders() {
  try {
    await Promise.all(
      liveOrders.map((o) =>
        updateDoc(doc(db, "orders", o.docId), { archived: true, status: "done" })
      )
    );
  } catch (err) {
    console.error("Failed to clear all:", err);
  }
}

// EVENTS
document.addEventListener("click", (e) => {
  const doneBtn = e.target.closest("[data-done-id]");
  if (doneBtn) markOrderDone(doneBtn.dataset.doneId);
});

if (clearAllOrdersBtn) clearAllOrdersBtn.addEventListener("click", clearAllOrders);

// REALTIME LISTENER
const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  liveOrders = snapshot.docs.map((d) => ({ docId: d.id, ...d.data() }));
  const visible = liveOrders.filter((o) => !o.archived);
  renderOrders(visible);
});
