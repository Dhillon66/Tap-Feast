// TapFeast Tablet Menu – Radio categories + images + send to kitchen via Firestore (shared across devices)

// Firebase (shared orders across devices)
import { db, collection, addDoc, serverTimestamp } from "./firebase.js";

const MENU_ITEMS = [
  {
    id: "st1",
    name: "Crispy Garlic Fries",
    desc: "Hand-cut fries tossed in garlic butter, parsley & parmesan.",
    price: 7.5,
    category: "Starters",
    tag: "Most ordered",
    img: "Crispy-Garlic-Fries.jpg",
  },
  {
    id: "st2",
    name: "Street-Style Nachos",
    desc: "Corn chips, queso, pico de gallo, jalapeño & crema.",
    price: 11.0,
    category: "Starters",
    tag: "Shareable",
    img: "Street-Style-Nachos.jpg",
  },
  {
    id: "st3",
    name: "Tandoori Wings",
    desc: "Charred chicken wings with smoky tandoori spice.",
    price: 13.0,
    category: "Starters",
    tag: "Spicy",
    img: "Tandoori-Wings.jpg", // use your wings image here
  },

  {
    id: "m1",
    name: "Signature Smash Burger",
    desc: "Double smashed beef, cheddar, house sauce, pickles & brioche.",
    price: 16.5,
    category: "Mains",
    tag: "Chef’s pick",
    img: "Signature-Smash-Burger.jpg",
  },
  {
    id: "m2",
    name: "Butter Chicken Bowl",
    desc: "Creamy butter chicken served over basmati rice + naan.",
    price: 18.0,
    category: "Mains",
    tag: "Comfort",
    img: "Butter-Chicken-Bowl.jpg",
  },
  {
    id: "m3",
    name: "Paneer Tikka Wrap",
    desc: "Grilled paneer, onions, peppers, mint chutney in a warm wrap.",
    price: 14.0,
    category: "Mains",
    tag: "Veg",
    img: "Paneer-Tikka-Wrap.jpg",
  },

  {
    id: "d1",
    name: "Chocolate Lava Cake",
    desc: "Warm chocolate cake with molten center + vanilla scoop.",
    price: 9.0,
    category: "Desserts",
    tag: "Hot",
    img: "Chocolate-Lava-Cake.jpg",
  },
  {
    id: "d2",
    name: "Classic Cheesecake",
    desc: "Creamy cheesecake with berry compote.",
    price: 8.5,
    category: "Desserts",
    tag: "Classic",
    img: "Classic-Cheesecake.jpg",
  },
  {
    id: "d3",
    name: "Mango Kulfi",
    desc: "Traditional frozen mango dessert (kulfi).",
    price: 6.5,
    category: "Desserts",
    tag: "Desi",
    img: "Mango-Kulfi.jpg",
  },

  {
    id: "dr1",
    name: "Sparkling Lemon Mint",
    desc: "Fresh lemon, mint, soda, and ice.",
    price: 5.5,
    category: "Drinks",
    tag: "Fresh",
    img: "Sparkling-Lemon-Mint.jpg",
  },
  {
    id: "dr2",
    name: "Iced Coffee",
    desc: "Cold brew style iced coffee with milk.",
    price: 5.0,
    category: "Drinks",
    tag: "Caffeine",
    img: "Iced-Coffee.jpg",
  },
  {
    id: "dr3",
    name: "Masala Chai",
    desc: "Spiced tea brewed with milk.",
    price: 4.5,
    category: "Drinks",
    tag: "Warm",
    img: "Masala-Chai.jpg",
  },
];

const STORAGE_KEYS = {
  ORDERS: "tapfeast_orders", // (no longer used for orders, kept for compatibility)
  THEME: "tapfeast_theme",
};

let cart = {}; // { itemId: quantity }

const CATEGORY_ORDER = ["Starters", "Mains", "Desserts", "Drinks"];

document.addEventListener("DOMContentLoaded", () => {
  // THEME + MENU INITIALISATION
  initTheme();
  buildCategoryRadios();
  renderMenu(CATEGORY_ORDER[0]);
  renderCart();

  // PLACE ORDER BUTTON
  document
    .getElementById("placeOrderBtn")
    .addEventListener("click", handlePlaceOrder);

  // TABLE NUMBER CLAMP
  const tableInput = document.getElementById("tableNumber");
  tableInput.addEventListener("change", () => {
    const v = parseInt(tableInput.value, 10);
    if (Number.isNaN(v) || v < 1) tableInput.value = 1;
    if (v > 50) tableInput.value = 50;
  });

  // THEME TOGGLE
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", handleThemeToggle);
  }

  // LANDING SCREEN → APP TRANSITION (if exists)
  const startBtn = document.getElementById("startOrderingBtn");
  const landing = document.getElementById("landingScreen");
  const appShell = document.getElementById("appShell");
  if (startBtn && landing && appShell) {
    startBtn.addEventListener("click", () => {
      startBtn.classList.add("start-ordering-pressed");
      setTimeout(() => {
        landing.classList.add("hidden");
        appShell.classList.remove("hidden");
      }, 260);
    });
  }
});

function buildCategoryRadios() {
  const wrap = document.getElementById("categoryRadios");
  if (!wrap) return;

  wrap.innerHTML = "";

  CATEGORY_ORDER.forEach((cat, idx) => {
    const label = document.createElement("label");
    label.className = "radio-pill";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "menuCategory";
    input.value = cat;
    input.checked = idx === 0;

    input.addEventListener("change", () => {
      renderMenu(cat);
    });

    const span = document.createElement("span");
    span.textContent = cat;

    label.appendChild(input);
    label.appendChild(span);
    wrap.appendChild(label);
  });
}

function renderMenu(category) {
  const list = document.getElementById("menuList");
  if (!list) return;

  list.innerHTML = "";

  const items = MENU_ITEMS.filter((i) => i.category === category);

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "menu-card";

    const imgWrap = document.createElement("div");
    imgWrap.className = "menu-img-wrap";

    const img = document.createElement("img");
    img.className = "menu-img";
    img.src = item.img;
    img.alt = item.name;

    imgWrap.appendChild(img);

    const content = document.createElement("div");
    content.className = "menu-content";

    const topRow = document.createElement("div");
    topRow.className = "menu-top";

    const h3 = document.createElement("h3");
    h3.className = "menu-title";
    h3.textContent = item.name;

    const price = document.createElement("div");
    price.className = "menu-price";
    price.textContent = formatCurrency(item.price);

    topRow.appendChild(h3);
    topRow.appendChild(price);

    const desc = document.createElement("p");
    desc.className = "menu-desc";
    desc.textContent = item.desc;

    const metaRow = document.createElement("div");
    metaRow.className = "menu-meta";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.tag;

    const addBtn = document.createElement("button");
    addBtn.className = "primary-btn";
    addBtn.textContent = "Add";
    addBtn.addEventListener("click", () => addToCart(item.id));

    metaRow.appendChild(tag);
    metaRow.appendChild(addBtn);

    content.appendChild(topRow);
    content.appendChild(desc);
    content.appendChild(metaRow);

    card.appendChild(imgWrap);
    card.appendChild(content);

    list.appendChild(card);
  });
}

function addToCart(itemId) {
  cart[itemId] = (cart[itemId] || 0) + 1;
  renderCart();
}

function removeFromCart(itemId) {
  if (!cart[itemId]) return;
  cart[itemId] -= 1;
  if (cart[itemId] <= 0) delete cart[itemId];
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");
  if (!cartList || !totalEl) return;

  cartList.innerHTML = "";

  const itemIds = Object.keys(cart);
  if (countEl) countEl.textContent = itemIds.reduce((sum, id) => sum + cart[id], 0);

  let total = 0;

  if (itemIds.length === 0) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Your cart is empty. Add items to place an order.";
    cartList.appendChild(p);
    totalEl.textContent = formatCurrency(0);
    return;
  }

  itemIds.forEach((id) => {
    const qty = cart[id];
    const item = MENU_ITEMS.find((m) => m.id === id);
    if (!item) return;

    total += item.price * qty;

    const row = document.createElement("div");
    row.className = "cart-row";

    const left = document.createElement("div");

    const name = document.createElement("div");
    name.className = "cart-name";
    name.textContent = item.name;

    const sub = document.createElement("div");
    sub.className = "cart-sub";
    sub.textContent = `${qty} × ${formatCurrency(item.price)}`;

    left.appendChild(name);
    left.appendChild(sub);

    const right = document.createElement("div");
    right.className = "cart-actions";

    const minus = document.createElement("button");
    minus.className = "ghost-btn";
    minus.textContent = "−";
    minus.addEventListener("click", () => removeFromCart(id));

    const plus = document.createElement("button");
    plus.className = "ghost-btn";
    plus.textContent = "+";
    plus.addEventListener("click", () => addToCart(id));

    right.appendChild(minus);
    right.appendChild(plus);

    row.appendChild(left);
    row.appendChild(right);

    cartList.appendChild(row);
  });

  totalEl.textContent = formatCurrency(total);
}

async function handlePlaceOrder() {
  const messageEl = document.getElementById("orderMessage");
  messageEl.textContent = "";

  const itemIds = Object.keys(cart);
  if (itemIds.length === 0) {
    messageEl.textContent = "Add some items to your order first.";
    messageEl.style.color = "#b91c1c";
    return;
  }

  const tableInput = document.getElementById("tableNumber");
  const tableNumber = parseInt(tableInput.value, 10);
  if (Number.isNaN(tableNumber) || tableNumber <= 0) {
    messageEl.textContent = "Please enter a valid table number.";
    messageEl.style.color = "#b91c1c";
    return;
  }

  const now = new Date();

  const orderItems = itemIds.map((id) => {
    const qty = cart[id];
    const item = MENU_ITEMS.find((m) => m.id === id);
    return {
      id,
      name: item.name,
      qty,
      price: item.price,
    };
  });

  const total = orderItems.reduce((sum, it) => sum + it.price * it.qty, 0);

  const order = {
    id: now.getTime(),
    table: tableNumber,
    items: orderItems,
    total,
    status: "pending",
    createdAt: now.toISOString(),
  };

  // ✅ Send to Firestore so the kitchen screen can see orders from ANY device
  try {
    await addDoc(collection(db, "orders"), {
      id: order.id,
      table: order.table,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: serverTimestamp(),
      createdAtISO: order.createdAt, // fallback for display if timestamp hasn't arrived yet
    });
  } catch (err) {
    console.error("Failed to send order:", err);
    messageEl.textContent =
      "Could not send order. Check internet connection and try again.";
    messageEl.style.color = "#b91c1c";
    return;
  }

  cart = {};
  renderCart();

  const checkedRadio = document.querySelector("input[name='menuCategory']:checked");
  const category = checkedRadio ? checkedRadio.value : CATEGORY_ORDER[0];
  renderMenu(category);

  messageEl.textContent = `Order #${order.id} sent to kitchen for Table ${tableNumber}.`;
  messageEl.style.color = "#166534";

  setTimeout(() => {
    messageEl.textContent = "";
  }, 4000);
}

/* THEME */

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initial = saved || (prefersDark ? "dark" : "light");
  setTheme(initial);
}

function handleThemeToggle() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
}

function setTheme(theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  const toggle = document.getElementById("themeToggle");
  if (toggle) toggle.setAttribute("aria-label", `Theme: ${theme}`);
}

/* HELPERS */

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}
