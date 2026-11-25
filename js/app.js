(function () {
  "use strict";

  /* ---------- Storage keys & constants ---------- */
  // Define the localStorage keys used to store system data
  const KEYS = {
    products: "crumb_products",
    orders: "crumb_orders",
    customers: "crumb_customers",
    session: "crumb_session",
    users: "crumb_users",
    seedVersion: "crumb_seed_version"
  };

  // Update this version whenever the built-in sample data changes
  const SEED_VERSION = "4";

  // Store the default admin account details
  const ADMIN_ACCOUNT = { username: "admin", password: "admin1122", role: "admin", name: "Bakery Admin" };

  /* ---------- Sample data ---------- */
  // Provide default customer account information
  const initialUsers = [
    { username: "safia", password: "safia123", role: "customer", name: "Safia Amalin", email: "safia.amalin@gmail.com", phone: "013-456 7890" }
  ];

  // Provide the initial product records with their prices and stock quantities
  const initialProducts = [
    { id: 1, name: "Butter Croissant", category: "Pastry", price: 7.5, stock: 32 },
    { id: 2, name: "Sourdough Loaf", category: "Bread", price: 14, stock: 18 },
    { id: 3, name: "Chocolate Fudge Cake", category: "Cake", price: 95, stock: 7 },
    { id: 4, name: "Almond Danish", category: "Pastry", price: 8.5, stock: 24 },
    { id: 5, name: "Sea Salt Cookies", category: "Cookies", price: 5, stock: 4 },
    { id: 6, name: "Iced Latte", category: "Drinks", price: 11, stock: 40 },
    // ----- PASTRY -----
    { id: 7, name: "Chocolate Croissant", category: "Pastry", price: 8, stock: 30 },
    { id: 8, name: "Blueberry Danish", category: "Pastry", price: 8, stock: 25 },
    { id: 9, name: "Apple Turnover", category: "Pastry", price: 7, stock: 25 },
    { id: 10, name: "Pain au Chocolat", category: "Pastry", price: 8.5, stock: 20 },
    // ----- BREAD -----
    { id: 11, name: "Garlic Bread", category: "Bread", price: 8, stock: 30 },
    { id: 12, name: "Chocolate Bun", category: "Bread", price: 5.5, stock: 35 },
    { id: 13, name: "Soft Milk Bun", category: "Bread", price: 5, stock: 35 },
    { id: 14, name: "Cheese Bun", category: "Bread", price: 6, stock: 30 },
    { id: 15, name: "Wholemeal Bread", category: "Bread", price: 9, stock: 20 },
    // ----- CAKE -----
    { id: 16, name: "Red Velvet Cake", category: "Cake", price: 90, stock: 8 },
    { id: 17, name: "New York Cheesecake", category: "Cake", price: 100, stock: 6 },
    { id: 18, name: "Strawberry Shortcake", category: "Cake", price: 95, stock: 8 },
    { id: 19, name: "Carrot Cake", category: "Cake", price: 85, stock: 10 },
    { id: 20, name: "Chocolate Cupcake", category: "Cake", price: 8, stock: 25 },
    // ----- COOKIES -----
    { id: 21, name: "Chocolate Chip Cookies", category: "Cookies", price: 5.5, stock: 35 },
    { id: 22, name: "Double Chocolate Cookies", category: "Cookies", price: 6, stock: 30 },
    { id: 23, name: "Red Velvet Cookies", category: "Cookies", price: 6, stock: 30 },
    { id: 24, name: "Matcha Cookies", category: "Cookies", price: 6.5, stock: 25 },
    { id: 25, name: "Oatmeal Raisin Cookies", category: "Cookies", price: 5.5, stock: 30 },
    // ----- DRINKS -----
    { id: 26, name: "Iced Americano", category: "Drinks", price: 8, stock: 40 },
    { id: 27, name: "Hot Cappuccino", category: "Drinks", price: 10, stock: 35 },
    { id: 28, name: "Iced Chocolate", category: "Drinks", price: 10, stock: 35 },
    { id: 29, name: "Matcha Latte", category: "Drinks", price: 12, stock: 30 },
    { id: 30, name: "Strawberry Smoothie", category: "Drinks", price: 12, stock: 25 },
    { id: 31, name: "Hot Chocolate", category: "Drinks", price: 9, stock: 35 }
  ];

  // Provide the initial customer records for the system
  const initialCustomers = [
    { id: 1, name: "Noru Saidah", email: "noru.saidah@gmail.com", phone: "012-345 6789" },
    { id: 2, name: "Safia Amalin", email: "safia.amalin@gmail.com", phone: "013-456 7890" },
    { id: 3, name: "Izwan Hakimi", email: "izwan.hakimi@gmail.com", phone: "014-567 8901" },
    { id: 4, name: "Rifa Basheerah", email: "rifa.basheerah@gmail.com", phone: "016-678 9012" },
    { id: 5, name: "Muhammad Naim", email: "muhammad.naim@gmail.com", phone: "017-789 0123" },
    { id: 6, name: "Che Muhammad Aiman", email: "che.aiman@gmail.com", phone: "018-890 1234" }
  ];

  // Returns the ISO date (YYYY-MM-DD) for "today minus <days>".
  const dateOffset = days => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };

  // Provide the initial sample orders with different dates and statuses
  const initialOrders = [
    { id: "CC-1001", customer: "Safia Amalin", product: "Chocolate Croissant", quantity: 4, total: 32, date: dateOffset(0), status: "Completed" },
    { id: "CC-1002", customer: "Noru Saidah", product: "Red Velvet Cake", quantity: 1, total: 90, date: dateOffset(0), status: "Pending" },
    { id: "CC-1003", customer: "Izwan Hakimi", product: "Garlic Bread", quantity: 2, total: 16, date: dateOffset(1), status: "Preparing" },
    { id: "CC-1004", customer: "Rifa Basheerah", product: "Matcha Latte", quantity: 3, total: 36, date: dateOffset(2), status: "Completed" },
    { id: "CC-1006", customer: "Muhammad Naim", product: "Oatmeal Raisin Cookies", quantity: 6, total: 33, date: dateOffset(2), status: "Completed" },
    { id: "CC-1007", customer: "Che Muhammad Aiman", product: "Strawberry Smoothie", quantity: 2, total: 24, date: dateOffset(3), status: "Completed" },
    { id: "CC-1005", customer: "Safia Amalin", product: "Blueberry Danish", quantity: 5, total: 40, date: dateOffset(3), status: "Completed" }
  ];

  /**
   * Builds about six months of past orders so the dashboard chart shows a real trend.
   * Older months have fewer orders (6, 8, 10, 12, 14) to model a growing bakery, and this month
   * gets extra orders dated before the five recent sample orders above.
   * The generator is deterministic: the same inputs always give the same orders.
   */
  function buildHistoricalOrders() {
    const orders = [];
    const now = new Date();
    const dayPattern = [2, 4, 6, 9, 11, 13, 16, 18, 20, 22, 24, 26, 27, 28];

    // Select products to generate a repeated mix of historical sales
    const productMix = [6, 0, 15, 10, 20, 25, 3, 12, 17, 28, 1, 22, 8, 29];
    let counter = 100;

    // Generate sample orders for the previous six months
    for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
      let days = dayPattern;
      let count = 6 + (5 - monthsAgo) * 2;

      if (monthsAgo === 0) {
        // Exclude the dates already covered by the recent sample orders
        days = dayPattern.filter(d => d <= now.getUTCDate() - 4);
        count = Math.min(days.length, 8);
      }

      // Create orders using the selected product, customer, quantity and date
      for (let i = 0; i < count; i++) {
        const product = initialProducts[productMix[i % productMix.length]];
        const customer = initialCustomers[(i + monthsAgo) % initialCustomers.length];
        const quantity = 1 + (i % 3);
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, days[i % days.length]));
        counter++;

        orders.push({
          id: "CC-" + String(counter).padStart(4, "0"),
          customer: customer.name,
          product: product.name,
          quantity,
          total: product.price * quantity,
          date: date.toISOString().slice(0, 10),
          status: counter % 23 === 0 ? "Cancelled" : "Completed"
        });
      }
    }
    return orders;
  }

  /* ---------- localStorage helpers ---------- */

  // Retrieve stored data from localStorage or return the default value
  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  // Convert data into JSON format and save it in localStorage
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /* ---------- Seeding & migrations ---------- */

  // Initialize sample data when the system is opened for the first time
  function seed() {
    resetSampleData();
    if (!localStorage.getItem(KEYS.products)) write(KEYS.products, initialProducts);
    if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders, initialOrders);
    if (!localStorage.getItem(KEYS.customers)) write(KEYS.customers, initialCustomers);
    if (!localStorage.getItem(KEYS.users)) write(KEYS.users, initialUsers);
    addHistoricalOrders();
  }

  // Clear old sample records when the sample data version changes
  function resetSampleData() {
    if (read(KEYS.seedVersion, null) === SEED_VERSION) return;
    [KEYS.products, KEYS.orders, KEYS.customers, KEYS.users, KEYS.session].forEach(k => localStorage.removeItem(k));
  }

  // Add historical sample orders once without duplicating existing order IDs
  function addHistoricalOrders() {
    if (read(KEYS.seedVersion, null) === SEED_VERSION) return;
    const orders = read(KEYS.orders, []);
    const known = new Set(orders.map(o => o.id));
    buildHistoricalOrders().forEach(o => { if (!known.has(o.id)) orders.push(o); });
    write(KEYS.orders, orders);
    write(KEYS.seedVersion, SEED_VERSION);
  }

  /* ---------- Formatting helpers ---------- */

  // Format a number as Malaysian Ringgit with two decimal places
  function money(value) {
    return "RM " + Number(value || 0).toFixed(2);
  }

  // Escape special HTML characters to prevent unsafe HTML from being displayed
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Generate a CSS class based on the order status
  function statusClass(status) {
    return "status-" + String(status).toLowerCase();
  }

  /* ---------- Session & role-based access ---------- */

  // Check whether the stored session belongs to a valid user role
  function getSession() {
    const session = read(KEYS.session, null);
    if (session && (session.role === "admin" || session.role === "customer")) return session;
    if (session) localStorage.removeItem(KEYS.session);
    return null;
  }

  // Restrict pages based on the required user role
  function requireAuth(requiredRole) {
    const session = getSession();
    if (!session) {
      location.replace("login.html");
      return false;
    }
    if (session.role !== requiredRole) {
      location.replace(session.role === "admin" ? "index.html" : "shop.html");
      return false;
    }
    return true;
  }

  // Remove the current session and redirect the user to the login page
  function signOut() {
    localStorage.removeItem(KEYS.session);
    location.href = "login.html";
  }

  /* ---------- Admin sidebar (collapsible on mobile) ---------- */

  // Generate the admin sidebar and highlight the current page
  function renderShell() {
    const host = document.getElementById("app-shell");
    if (!host) return;
    const page = document.body.dataset.page;
    const session = getSession();

    // Define the navigation links available in the admin dashboard
    const links = [
      ["dashboard", "index.html", "bi-grid-1x2", "Dashboard"],
      ["products", "products.html", "bi-basket2", "Products"],
      ["orders", "orders.html", "bi-receipt", "Orders"],
      ["customers", "customers.html", "bi-people", "Customers"]
    ];

    // Generate navigation links and highlight the active page
    const navLinks = links.map(([id, url, icon, label]) =>
      `<a href="${url}" class="${page === id ? "active" : ""}" ${page === id ? 'aria-current="page"' : ""}><i class="bi ${icon}"></i>${label}</a>`
    ).join("");

    const displayName = session && session.name || "Bakery Admin";

    // Display the sidebar with navigation, user information and sign-out button
    host.innerHTML = `<aside class="sidebar" id="sidebar">
      <div class="sidebar-top">
        <a href="index.html" class="brand brand-light text-decoration-none"><span class="brand-mark"><i class="bi bi-cake2"></i></span><span>crumb <b>& co.</b></span></a>
        <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="sidebar-menu"><i class="bi bi-list"></i></button>
      </div>
      <div class="sidebar-menu" id="sidebar-menu">
        <p class="side-label">WORKSPACE</p>
        <nav class="side-nav" aria-label="Main navigation">${navLinks}</nav>
        <div class="sidebar-bottom">
          <div class="profile-row"><div class="avatar">${escapeHTML(displayName.charAt(0).toUpperCase())}</div><div><div class="profile-name">${escapeHTML(displayName)}</div><div class="profile-role">Admin / Staff</div></div></div>
          <button class="logout-link" id="logout-btn" type="button"><i class="bi bi-box-arrow-left me-2"></i>Sign out</button>
        </div>
      </div>
    </aside>`;

    // Attach the sign-out function and mobile sidebar toggle event
    document.getElementById("logout-btn").addEventListener("click", signOut);
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("nav-toggle");
    toggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = open ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
    });
  }

  function setYears() {
    document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());
  }

  /* ---------- Start-up ---------- */

  // Initialize the sample data and check user access when the page loads
  seed();
  if (document.body.dataset.page) {
    if (requireAuth("admin")) renderShell();
  } else if (document.body.dataset.role === "customer") {
    requireAuth("customer");
  }
  setYears();

  /* ---------- Public API ---------- */

  // Make shared functions and data methods available to other JavaScript files
  window.Bakery = {
    keys: KEYS,
    adminAccount: ADMIN_ACCOUNT,
    signOut, read, write, money, escapeHTML, statusClass, getSession,
    getProducts: () => read(KEYS.products, []),
    saveProducts: value => write(KEYS.products, value),
    getOrders: () => read(KEYS.orders, []),
    saveOrders: value => write(KEYS.orders, value),
    getUsers: () => read(KEYS.users, []),
    saveUsers: value => write(KEYS.users, value),
    getCustomers: () => read(KEYS.customers, []),
    saveCustomers: value => write(KEYS.customers, value),
    nextId: items => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
  };
})();
