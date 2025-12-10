// TapFeast – Tablet Menu Logic
// Handles: landing → app, theme toggle, category filter, cart, and sending orders to localStorage.

const STORAGE_KEYS = {
  THEME: "tapfeast_theme",
  ORDERS: "tapfeast_orders",
};

const MENU_ITEMS = [
  // STARTERS
  {
    id: "st1",
    name: "Crispy Garlic Fries",
    desc: "Hand-cut fries tossed in garlic butter, parsley & parmesan.",
    price: 7.5,
    category: "starters",
    tag: "Most ordered",
    img: "images/Crispy-Garlic-Fries.jpg",
  },
  {
    id: "st2",
    name: "Street-Style Nachos",
    desc: "Corn chips with queso, pico de gallo & jalapeños.",
    price: 9.25,
    category: "starters",
    tag: "Perfect for sharing",
    img: "images/Street-Style-Nachos.jpg",
  },
  {
    id: "st3",
    name: "Tandoori Wings",
    desc: "Smoky tandoori-spiced chicken wings with mint yogurt dip.",
    price: 10.9,
    category: "starters",
    tag: "Spicy",
    img: "images/Tandoori-Wings.jpg",
  },

  // MAINS
  {
    id: "mn1",
    name: "Butter Chicken Bowl",
    desc: "Creamy tomato gravy, basmati rice & charred naan.",
    price: 17.5,
    category: "mains",
    tag: "Chef special",
    img: "images/Butter-Chicken.jpg",
  },
  {
    id: "mn2",
    name: "Grilled Paneer Bowl",
    desc: "Marinated paneer, veggies, herbed rice & cilantro chutney.",
    price: 16.25,
    category: "mains",
    tag: "Vegetarian",
    img: "images/Grilled-Paneer-Bowl.jpg",
  },
  {
    id: "mn3",
    name: "Sizzling Veggie Sizzler",
    desc: "Seasonal veggies on a hot plate, pepper sauce & fries.",
    price: 18.0,
    category: "mains",
    tag: "Sizzles on arrival",
    img: "images/Sizzling-Veggie-Sizzler.jpg",
  },

  // DESSERTS
  {
    id: "ds1",
    name: "Chocolate Lava Cake",
    desc: "Warm cake, molten center & vanilla ice cream.",
    price: 8.75,
    category: "desserts",
    tag: "Best seller",
    img: "images/Chocolate-Lava-Cake.jpg",
  },
  {
    id: "ds2",
    name: "Gulab Jamun Sundae",
    desc: "Gulab jamun with ice cream, nuts & saffron syrup.",
    price: 7.95,
    category: "desserts",
    tag: "Indian fusion",
    img: "images/Gulab-Jamun-Sundae.jpg",
  },

  // DRINKS
  {
    id: "dr1",
    name: "Masala Lemon Soda",
    desc: "Sparkling lemonade with roasted cumin & black salt.",
    price: 4.5,
    category: "drinks",
    tag: "Refreshing",
    img: "images/Masala-Lemon-Soda.jpg",
  },
  {
    id: "dr2",
    name: "Mango Lassi",
    desc: "Thick mango yogurt drink with cardamom.",
    price: 5.25,
    category: "drinks",
    tag: "Classic",
    img: "images/mango-lassi-7556631_1920.jpg",
  },
  {
    id: "dr3",
    name: "Iced Espresso Tonic",
    desc: "Double espresso with citrus tonic & ice.",
    price: 5.9,
    category: "drinks",
    tag: "Barista pick",
    img: "images/Iced-Espresso-Tonic.jpg",
  },
];

let cart = {}; // { itemId: { item, qty } }

// DOM REFS
const landingSection = document.getElementById("landing");
const startOrderingBtn = document.getElementById("startOrderingBtn");
const appShell = document.getElementById("appShell");

const menuGrid = document.getElementById("menuGrid");
const categoryTabs = document.getElementById("categoryTabs");
const cartList = document.getElementById("cartList");
const cartBadge = document.getElementById("cartBadge");
const cartTotalEl = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const tableInput = document.getElementById("tableInput");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

// ---------- THEME ----------
function applyStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  if (stored === "dark" || stored === "light") {
    document.documentElement.setAttribute("data-theme", stored);
    if (themeToggle) themeToggle.textContent = stored === "dark" ? "☀️" : "🌙";
  }
}

function setTheme(next) {
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(STORAGE_KEYS.THEME, next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
}

function onThemeToggle() {
  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
}

// ---------- LANDING ----------
function enterApp() {
  landingSection.style.display = "none";
  appShell.classList.remove("app-hidden");
  requestAnimationFrame(() => {
    appShell.classList.add("app-enter");
  });
}

// ---------- MENU RENDER ----------
function createMenuCard(item) {
  const card = document.createElement("article");
  card.className = "menu-card";
  card.dataset.category = item.category;

  card.innerHTML = `
    <div class="menu-card-image-wrap">
      <img src="${item.img}" alt="${item.name}" />
      ${
        item.tag
          ? `<span class="menu-card-badge">
              ${item.tag}
            </span>`
          : ""
      }
    </div>
    <div class="menu-card-body">
      <h3 class="menu-card-title">${item.name}</h3>
      <p class="menu-card-desc">${item.desc}</p>
      <div class="menu-card-meta">
        <span class="menu-card-price">$${item.price.toFixed(2)}</span>
        <div class="menu-card-cta">
          <span class="qty-badge" data-qty-for="${item.id}">0</span>
          <button class="menu-add-btn" data-add-id="${item.id}">
            Add
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}

function renderMenu(category = "all") {
  menuGrid.innerHTML = "";
  const filtered =
    category === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === category);
  filtered.forEach((item) => {
    const card = createMenuCard(item);
    menuGrid.appendChild(card);
  });
  syncQtyBadges();
}

// ---------- CATEGORY FILTER ----------
function onCategoryClick(e) {
  const btn = e.target.closest(".category-tab");
  if (!btn) return;

  const category = btn.dataset.category;
  document
    .querySelectorAll(".category-tab")
    .forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");

  renderMenu(category);
}

// ---------- CART LOGIC ----------
function addToCart(itemId) {
  const item = MENU_ITEMS.find((i) => i.id === itemId);
  if (!item) return;

  if (!cart[itemId]) {
    cart[itemId] = { item, qty: 0 };
  }
  cart[itemId].qty += 1;
  renderCart();
  syncQtyBadges();
  showToast(`${item.name} added to order`);
}

function changeCartQty(itemId, delta) {
  if (!cart[itemId]) return;
  cart[itemId].qty += delta;
  if (cart[itemId].qty <= 0) {
    delete cart[itemId];
  }
  renderCart();
  syncQtyBadges();
}

function clearCart() {
  cart = {};
  renderCart();
  syncQtyBadges();
}

function renderCart() {
  cartList.innerHTML = "";

  const entries = Object.values(cart);
  if (!entries.length) {
    cartList.innerHTML =
      '<p class="cart-empty">No items added yet. Tap “Add” to start.</p>';
    cartBadge.textContent = "0 items";
    cartTotalEl.textContent = "$0.00";
    return;
  }

  let total = 0;
  let count = 0;

  entries.forEach(({ item, qty }) => {
    total += item.price * qty;
    count += qty;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-main">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">$${item.price.toFixed(
          2
        )} · ${item.category}</div>
      </div>
      <div class="cart-item-controls">
        <div class="cart-qty-controls">
          <button class="cart-qty-btn" data-change="-1" data-id="${item.id}">-</button>
          <span class="cart-qty">${qty}</span>
          <button class="cart-qty-btn" data-change="1" data-id="${item.id}">+</button>
        </div>
        <div class="cart-item-price">$${(item.price * qty).toFixed(2)}</div>
      </div>
    `;
    cartList.appendChild(row);
  });

  cartBadge.textContent = `${count} item${count !== 1 ? "s" : ""}`;
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

function syncQtyBadges() {
  document.querySelectorAll("[data-qty-for]").forEach((badge) => {
    const id = badge.dataset.qtyFor;
    const entry = cart[id];
    badge.textContent = entry ? entry.qty : 0;
  });
}

// ---------- ORDER + LOCALSTORAGE ----------
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

function placeOrder() {
  const entries = Object.values(cart);
  if (!entries.length) {
    showToast("Add at least one item before sending.");
    return;
  }

  const tableNumber = (tableInput.value || "").trim() || "1";

  const items = entries.map(({ item, qty }) => ({
    id: item.id,
    name: item.name,
    qty,
    price: item.price,
  }));

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const order = {
    id: `ord_${Date.now()}`,
    table: tableNumber,
    items,
    total,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const existing = getOrdersFromStorage();
  existing.push(order);
  saveOrdersToStorage(existing);

  clearCart();
  showToast(`Order sent to kitchen (Table ${tableNumber})`);
}

// ---------- TOAST ----------
let toastTimeout;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 220);
  }, 2000);
}

// ---------- EVENTS ----------
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add-id]");
  if (addBtn) {
    addToCart(addBtn.dataset.addId);
  }

  const qtyBtn = e.target.closest(".cart-qty-btn");
  if (qtyBtn) {
    const delta = parseInt(qtyBtn.dataset.change, 10) || 0;
    const id = qtyBtn.dataset.id;
    changeCartQty(id, delta);
  }
});

if (categoryTabs) {
  categoryTabs.addEventListener("click", onCategoryClick);
}

if (startOrderingBtn) {
  startOrderingBtn.addEventListener("click", enterApp);
}

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", clearCart);
}

if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", placeOrder);
}

if (themeToggle) {
  themeToggle.addEventListener("click", onThemeToggle);
}

// INITIALIZE
applyStoredTheme();
renderMenu("all");
renderCart();
