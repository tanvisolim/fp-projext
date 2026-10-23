// ---------- Product data (shared by all pages) ----------
const cakes = [
  { id: 1, name: "Chocolate Truffle", category: "Chocolate", price: 650,
    description: "Rich chocolate layers with creamy truffle.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Strawberry Cake", category: "Fruit", price: 580,
    description: "A sweet cake with strawberry flavour.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Black Forest", category: "Classic", price: 600,
    description: "Chocolate sponge with cream and cherry decoration.",
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Red Velvet", category: "Classic", price: 720,
    description: "Soft red velvet-style cake with creamy frosting.",
    image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Chocolate Fudge", category: "Chocolate", price: 700,
    description: "A rich chocolate cake for special occasions.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Vanilla Cake", category: "Classic", price: 520,
    description: "A soft vanilla cake for every celebration.",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=700&q=80" }
];

// ---------- Cart (saved in the browser so it follows you between pages) ----------
function loadCart() {
  try { return JSON.parse(localStorage.getItem("cakeCart")) || []; }
  catch (e) { return []; }
}
function saveCart() {
  try { localStorage.setItem("cakeCart", JSON.stringify(cart)); } catch (e) {}
}

let cart = loadCart();

function formatPrice(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

// ---------- Shared layout: header, back button, footer, cart panel ----------
const pages = [
  { key: "home", href: "index.html", label: "Home" },
  { key: "cakes", href: "cakes.html", label: "Our Cakes" },
  { key: "order", href: "order.html", label: "How to Order" },
  { key: "about", href: "about.html", label: "About Us" },
  { key: "contact", href: "contact.html", label: "Contact" }
];

function buildLayout() {
  const current = document.body.dataset.page;

  const links = pages.map(p =>
    `<a href="${p.href}" class="${p.key === current ? "active" : ""}">${p.label}</a>`
  ).join("");

  document.getElementById("site-header").innerHTML = `
    <header>
      <a href="index.html" class="logo"><span class="logo-icon">🎂</span> 90° Cake Shop</a>
      <button class="menu-btn" id="menuBtn" aria-label="Open navigation">☰</button>
      <nav id="navigation">${links}</nav>
      <button class="cart-btn" id="openCart">🛒 <span class="cart-label">Cart </span>(<span id="cartCount">0</span>)</button>
    </header>`;

  // Back button on every page except Home
  if (current !== "home") {
    const main = document.querySelector("main");
    if (main) {
      main.insertAdjacentHTML("afterbegin", `
        <div class="back-bar">
          <button class="back-btn" id="backBtn" aria-label="Go back">← Back</button>
        </div>`);
    }
  }

  document.getElementById("site-footer").innerHTML = `
    <footer>
      <strong>🎂 90° Cake Shop</strong>
      <span>© ${new Date().getFullYear()} 90° Cake Shop | Student Project</span>
      <a href="#top">Back to Top ↑</a>
    </footer>
    <div class="overlay" id="overlay" hidden></div>
    <aside class="cart-panel" id="cartPanel" aria-label="Shopping cart">
      <div class="cart-header">
        <h2>Your Cart</h2>
        <button class="close-btn" id="closeCart" aria-label="Close cart">✕</button>
      </div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-total">
        <p class="total-row"><span>Total:</span><span id="cartTotal">₹0</span></p>
        <button class="btn" id="orderBtn">Prepare Order Message</button>
        <p class="notice">Demo only: this website does not process payments or send orders automatically.</p>
      </div>
    </aside>`;
}

buildLayout();

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");

// ---------- Products ----------
function productCard(cake) {
  return `
    <article class="product">
      <img src="${cake.image}" alt="${cake.name}" loading="lazy"
        onerror="this.onerror=null;this.src='https://placehold.co/700x450/fbe8ed/a93759?text=Cake';">
      <div class="product-info">
        <h3>${cake.name}</h3>
        <p>${cake.description}</p>
        <div class="product-bottom">
          <span class="price">${formatPrice(cake.price)}</span>
          <button class="add-btn" data-add="${cake.id}">+ Add to Cart</button>
        </div>
      </div>
    </article>`;
}

const productList = document.getElementById("productList");

function displayCakes(category = "All") {
  if (!productList) return;
  let list = category === "All" ? cakes : cakes.filter(c => c.category === category);

  // Home page shows only a few featured cakes
  const limit = Number(productList.dataset.limit);
  if (limit) list = list.slice(0, limit);

  productList.innerHTML = list.map(productCard).join("");
}

// ---------- Cart logic ----------
function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id: id, quantity: 1 });
  displayCart();
}

function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
  displayCart();
}

function cartTotalAmount() {
  return cart.reduce((sum, item) => {
    const cake = cakes.find(c => c.id === item.id);
    return sum + (cake ? cake.price * item.quantity : 0);
  }, 0);
}

function displayCart() {
  saveCart();

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal.textContent = formatPrice(cartTotalAmount());

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty">Your cart is empty. Add a cake to get started! 🎂</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const cake = cakes.find(c => c.id === item.id);
    if (!cake) return "";
    return `
      <div class="cart-item">
        <div>
          <h4>${cake.name}</h4>
          <small>${formatPrice(cake.price)} each</small>
          <div class="quantity">
            <button data-id="${cake.id}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button data-id="${cake.id}" data-change="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <strong>${formatPrice(cake.price * item.quantity)}</strong>
      </div>`;
  }).join("");
}

// ---------- Back button ----------
function goBack() {
  let cameFromThisSite = false;
  try {
    cameFromThisSite = document.referrer &&
      new URL(document.referrer).origin === window.location.origin;
  } catch (e) {}

  if (cameFromThisSite && window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "index.html"; // no previous page: go Home
  }
}

const backBtn = document.getElementById("backBtn");
if (backBtn) backBtn.addEventListener("click", goBack);

// ---------- Events ----------
if (productList) {
  productList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(Number(button.dataset.add));
  });
}

cartItems.addEventListener("click", function (event) {
  const button = event.target.closest("[data-id]");
  if (button) changeQuantity(Number(button.dataset.id), Number(button.dataset.change));
});

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");
    displayCakes(this.dataset.category);
  });
});

function openCart() { cartPanel.classList.add("open"); overlay.hidden = false; }
function closeCart() { cartPanel.classList.remove("open"); overlay.hidden = true; }

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// Mobile menu (☰ turns into ✕ while open)
const menuBtn = document.getElementById("menuBtn");
const navigation = document.getElementById("navigation");
menuBtn.addEventListener("click", function () {
  const isOpen = navigation.classList.toggle("open");
  menuBtn.textContent = isOpen ? "✕" : "☰";
});

// Order enquiry message
document.getElementById("orderBtn").addEventListener("click", function () {
  if (cart.length === 0) {
    alert("Please add a cake to your cart first.");
    return;
  }

  const orderLines = cart.map(item => {
    const cake = cakes.find(c => c.id === item.id);
    return `${cake.name} x ${item.quantity} = ${formatPrice(cake.price * item.quantity)}`;
  });

  const message =
    "Hello 90° Cake Shop! I would like to enquire about this order.\n\n" +
    orderLines.join("\n") +
    "\n\nEstimated Total: " + formatPrice(cartTotalAmount()) +
    "\nPlease confirm availability and delivery details.";

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message)
      .then(() => alert("Order message copied! You can paste and send it to the shop."))
      .catch(() => prompt("Copy your order message:", message));
  } else {
    prompt("Copy your order message:", message);
  }
});

// ---------- Start ----------
displayCakes();
displayCart();