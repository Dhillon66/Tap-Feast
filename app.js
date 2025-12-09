// TapFeast Tablet Menu – Radio categories + images + send to kitchen via localStorage

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
    id: "mn1",
    name: "Grilled Paneer Bowl",
    desc: "Masala paneer, turmeric rice, roasted veggies & mint yogurt.",
    price: 17.5,
    category: "Mains",
    tag: "Vegetarian",
    img: "Grilled-Paneer-Bowl.jpg",
  },
  {
    id: "mn2",
    name: "Butter Chicken",
    desc: "Creamy tomato sauce, charred chicken, basmati rice & naan.",
    price: 18.5,
    category: "Mains",
    tag: "Signature",
    img: "Butter-Chicken.jpg",
  },
  {
    id: "mn3",
    name: "Sizzling Veggie Sizzler",
    desc: "Seasonal vegetables on a sizzling platter with herb butter.",
    price: 16.0,
    category: "Mains",
    tag: "New",
    img: "Sizzling-Veggie-Sizzler.jpg",
  },
  {
    id: "ds1",
    name: "Gulab Jamun Sundae",
    desc: "Warm gulab jamun over vanilla ice cream & pistachio dust.",
    price: 9.0,
    category: "Desserts",
    tag: "House special",
    img: "Gulab-Jamun-Sundae.jpg",
  },
  {
    id: "ds2",
    name: "Chocolate Lava Cake",
    desc: "Molten chocolate centre with whipped cream.",
    price: 9.5,
    category: "Desserts",
    tag: "Rich",
    img: "Chocolate-Lava-Cake.jpg",
  },
  {
    id: "dr1",
    name: "Masala Lemon Soda",
    desc: "Fresh lime, masala spice & fizz.",
    price: 5.0,
    category: "Drinks",
    tag: "Refreshing",
    img: "Masala-Lemon-Soda.jpg",
  },
  {
    id: "dr2",
    name: "Classic Mango Lassi",
    desc: "Yogurt, mango pulp & saffron.",
    price: 6.0,
    category: "Drinks",
    tag: "Sweet",
    img: "mango-lassi-7556631_1920.jpg",
  },
  {
    id: "dr3",
    name: "Iced Espresso Tonic",
    desc: "Double espresso over tonic & orange peel.",
    price: 6.5,
    category: "Drinks",
    tag: "Caffeinated",
    img: "Iced-Espresso-Tonic.jpg",
  },
];

const STORAGE_KEYS = {
  ORDERS: "tapfeast_orders",
  THEME: "tapfeast_theme",
};

let cart = {}; // { itemId: quantity }

const CATEGORY_ORDER = ["Starters", "Mains", "Desserts", "Drinks"];

document.addEventListener("DOMContentLoaded", () => {
  // THEME + MENU INITIALISATION
  initTheme();
  buildCategoryRadios();
  const defaultCategory = CATEGORY_ORDER[0];
  renderMenu(defaultCategory);
  renderCart();

  // ORDER BUTTON
  document
    .getElementById("placeOrderBtn")
    .addEventListener("click", handlePlaceOrder);

  // TABLE NUMBER CLAMP
  const tableInput = document.getElementById("tableNumber");
  tableInput.addEventListener("change", () => {
    const v = parseInt(tableInput.value, 10);
    if (Number.isNaN(v) || v <= 0) {
      tableInput.value = 1;
    }
  });

  // THEME TOGGLE
  document
    .getElementById("themeToggle")
    .addEventListener("click", handleThemeToggle);

  // LANDING SCREEN → APP TRANSITION
  const startBtn = document.getElementById("startOrderingBtn");
  const landing = document.getElementById("landing");
  const appShell = document.getElementById("appShell");

  if (startBtn && landing && appShell) {
    startBtn.addEventListener("click", () => {
      startBtn.classList.add("start-ordering-pressed");

      landing.classList.add("landing-exit");

      setTimeout(() => {
        landing.style.display = "none";
        appShell.classList.remove("hidden");
        appShell.classList.add("app-enter");
      }, 550);
    });
  }
});

/* THEME */

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark =
    window.matchMedia &&
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
  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
}

/* RADIO CATEGORY UI */

function buildCategoryRadios() {
  const container = document.getElementById("categoryRadios");
  container.innerHTML = "";

  CATEGORY_ORDER.forEach((cat, index) => {
    const id = `cat-radio-${cat.toLowerCase()}`;

    const wrapper = document.createElement("label");
    wrapper.className = "category-radio";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "menuCategory";
    input.value = cat;
    input.id = id;
    if (index === 0) input.checked = true;

    const labelSpan = document.createElement("span");
    labelSpan.className = "category-radio-label";

    const dot = document.createElement("span");
    dot.className = "dot";

    const text = document.createElement("span");
    text.textContent = cat;

    labelSpan.appendChild(dot);
    labelSpan.appendChild(text);
    wrapper.appendChild(input);
    wrapper.appendChild(labelSpan);

    input.addEventListener("change", () => {
      if (input.checked) {
        renderMenu(cat);
      }
    });

    container.appendChild(wrapper);
  });
}

/* MENU RENDER */

function renderMenu(category) {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = "";

  const items = MENU_ITEMS.filter((i) => i.category === category);

  items.forEach((item, index) => {
    const card = createMenuCard(item, index);
    grid.appendChild(card);
  });
}

function createMenuCard(item, index) {
  const card = document.createElement("article");
  card.className = "menu-card";
  card.style.animationDelay = `${(index % 5) * 0.04}s`;

  // image
  const imgWrap = document.createElement("div");
  imgWrap.className = "menu-image-wrap";

  const img = document.createElement("img");
  img.src = item.img;
  img.alt = item.name;

  imgWrap.appendChild(img);

  // body
  const body = document.createElement("div");
  body.className = "menu-card-body";

  const header = document.createElement("div");
  header.className = "menu-card-header";

  const textWrap = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "menu-title";
  title.textContent = item.name;

  const desc = document.createElement("p");
  desc.className = "menu-desc";
  desc.textContent = item.desc;

  textWrap.appendChild(title);
  textWrap.appendChild(desc);

  const metaTop = document.createElement("div");
  metaTop.className = "menu-meta";

  const price = document.createElement("span");
  price.className = "menu-price";
  price.textContent = formatCurrency(item.price);

  metaTop.appendChild(price);

  if (item.tag) {
    const tag = document.createElement("span");
    tag.className = "tag-pill";
    tag.textContent = item.tag;
    metaTop.appendChild(tag);
  }

  header.appendChild(textWrap);
  header.appendChild(metaTop);

  // controls
  const controlsWrap = document.createElement("div");
  controlsWrap.className = "card-controls";

  const qtyControls = document.createElement("div");
  qtyControls.className = "quantity-controls";

  const minusBtn = document.createElement("button");
  minusBtn.className = "qty-btn";
  minusBtn.textContent = "−";

  const qtyDisplay = document.createElement("span");
  qtyDisplay.className = "qty-display";
  qtyDisplay.textContent = cart[item.id] || 0;

  const plusBtn = document.createElement("button");
  plusBtn.className = "qty-btn";
  plusBtn.textContent = "+";

  minusBtn.addEventListener("click", () => {
    updateCartQuantity(item.id, -1);
    qtyDisplay.textContent = cart[item.id] || 0;
  });

  plusBtn.addEventListener("click", () => {
    updateCartQuantity(item.id, 1);
    qtyDisplay.textContent = cart[item.id] || 0;
  });

  qtyControls.appendChild(minusBtn);
  qtyControls.appendChild(qtyDisplay);
  qtyControls.appendChild(plusBtn);

  const addBtn = document.createElement("button");
  addBtn.className = "add-btn";
  addBtn.textContent = "Add";
  addBtn.addEventListener("click", () => {
    updateCartQuantity(item.id, 1);
    qtyDisplay.textContent = cart[item.id] || 0;
  });

  controlsWrap.appendChild(qtyControls);
  controlsWrap.appendChild(addBtn);

  body.appendChild(header);
  body.appendChild(controlsWrap);

  card.appendChild(imgWrap);
  card.appendChild(body);

  return card;
}

/* CART */

function updateCartQuantity(itemId, delta) {
  const current = cart[itemId] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) {
    delete cart[itemId];
  } else {
    cart[itemId] = next;
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  container.innerHTML = "";

  const itemIds = Object.keys(cart);
  if (itemIds.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-cart";
    p.textContent = "No items yet. Tap + to add to your order.";
    container.appendChild(p);
    document.getElementById("cartTotal").textContent = "$0.00";
    return;
  }

  let total = 0;

  itemIds.forEach((id) => {
    const qty = cart[id];
    const item = MENU_ITEMS.find((m) => m.id === id);
    if (!item) return;

    const lineTotal = item.price * qty;
    total += lineTotal;

    const row = document.createElement("div");
    row.className = "cart-item";

    const title = document.createElement("h4");
    title.className = "cart-item-title";
    title.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "cart-item-meta";
    meta.textContent = `${qty} × ${formatCurrency(item.price)}`;

    const price = document.createElement("div");
    price.className = "cart-item-price";
    price.textContent = formatCurrency(lineTotal);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const qtyControls = document.createElement("div");
    qtyControls.className = "quantity-controls";

    const minusBtn = document.createElement("button");
    minusBtn.className = "qty-btn";
    minusBtn.textContent = "−";

    const qtyDisplay = document.createElement("span");
    qtyDisplay.className = "qty-display";
    qtyDisplay.textContent = qty;

    const plusBtn = document.createElement("button");
    plusBtn.className = "qty-btn";
    plusBtn.textContent = "+";

    minusBtn.addEventListener("click", () => updateCartQuantity(id, -1));
    plusBtn.addEventListener("click", () => updateCartQuantity(id, 1));

    qtyControls.appendChild(minusBtn);
    qtyControls.appendChild(qtyDisplay);
    qtyControls.appendChild(plusBtn);

    const removeBtn = document.createElement("button");
    removeBtn.className = "secondary-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      delete cart[id];
      renderCart();
    });

    controls.appendChild(qtyControls);
    controls.appendChild(removeBtn);

    row.appendChild(title);
    row.appendChild(price);
    row.appendChild(meta);
    row.appendChild(controls);

    container.appendChild(row);
  });

  document.getElementById("cartTotal").textContent = formatCurrency(total);
}

/* ORDER PLACEMENT */

function handlePlaceOrder() {
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

  const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const order = {
    id: now.getTime(),
    table: tableNumber,
    items: orderItems,
    total,
    status: "pending",
    createdAt: now.toISOString(),
  };

  const existingRaw = localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]";
  const existing = safeParse(existingRaw, []);

  existing.push(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existing));

  cart = {};
  renderCart();

  const checkedRadio = document.querySelector(
    "input[name='menuCategory']:checked"
  );
  const category = checkedRadio ? checkedRadio.value : CATEGORY_ORDER[0];
  renderMenu(category);

  messageEl.textContent = `Order #${order.id} sent to kitchen for Table ${tableNumber}.`;
  messageEl.style.color = "#166534";

  setTimeout(() => {
    messageEl.textContent = "";
  }, 4000);
}

/* HELPERS */

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function safeParse(str, fallback) {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
