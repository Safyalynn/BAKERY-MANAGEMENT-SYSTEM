// Get the current user's login session
const session = Bakery.getSession();

// Run the storefront functions only if the logged-in user is a customer
if (session && session.role === "customer") {

  // Get the product grid, order modal and alert message elements
  const grid = document.getElementById("shop-grid");
  const buyModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("buy-modal"));
  const alertBox = document.getElementById("shop-alert");

  // Return an icon based on the product category
  const icon = c => c === "Bread" ? "bi-basket" : c === "Cake" ? "bi-cake2" : c === "Drinks" ? "bi-cup-straw" : "bi-cookie";

  // Display the logged-in customer's name, avatar and welcome message
  document.getElementById("shop-name").textContent = session.name;
  document.getElementById("shop-avatar").textContent = session.name.charAt(0).toUpperCase();
  document.getElementById("shop-greeting").textContent = "Hello, " + session.name.split(" ")[0] + ".";

  // Sign out the customer when the logout button is clicked
  document.getElementById("shop-logout").addEventListener("click", Bakery.signOut);

  // Automatically display the current year in the footer
  document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

  // Display a temporary success or information message
  function flash(message) { alertBox.textContent = message; alertBox.classList.remove("d-none"); setTimeout(() => alertBox.classList.add("d-none"), 4000); }

  // Check whether an order belongs to the currently logged-in customer
  const isMine = o => o.username ? o.username === session.username : o.customer.toLowerCase() === session.name.toLowerCase();

  // Display available products and apply search and category filters
  function renderProducts() {

    // Retrieve all products and get the customer's search and category selections
    const all = Bakery.getProducts(), q = document.getElementById("shop-search").value.toLowerCase(), cat = document.getElementById("shop-category").value;

    // Filter products based on the search keyword and selected category
    const rows = all.filter(p => (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) && (cat === "all" || p.category === cat));

    // Display the number of products matching the search
    document.getElementById("shop-results").textContent = `Showing ${rows.length} of ${all.length} products`;

    // Generate product cards with price, stock status and order button
    grid.innerHTML = rows.length ? rows.map(p => {

      // Check whether the product is out of stock or has low stock
      const out = p.stock <= 0, low = p.stock > 0 && p.stock <= 5;

      return `<div class="col-12 col-sm-6 col-lg-4"><article class="shop-card">
        <div class="shop-thumb"><i class="bi ${icon(p.category)}"></i></div>
        <div class="shop-card-body"><span class="subtle-tag">${Bakery.escapeHTML(p.category)}</span>
          <h3>${Bakery.escapeHTML(p.name)}</h3>
          <div class="shop-card-foot"><strong>${Bakery.money(p.price)}</strong>
            <span class="status-pill ${out ? "status-cancelled" : low ? "status-pending" : "status-completed"}">${out ? "Sold out" : low ? "Only " + p.stock + " left" : "In stock"}</span></div>
          <button class="btn btn-dark w-100 mt-3" ${out ? "disabled" : ""} onclick="openBuy(${p.id})"><i class="bi bi-bag-plus me-2"></i>Order</button>
        </div></article></div>`;
    }).join("") : '<div class="col-12"><div class="empty-state"><i class="bi bi-basket"></i>No products match your search.</div></div>';
  }

  // Display the order history of the currently logged-in customer
  function renderMyOrders() {

    // Retrieve only the customer's orders and sort them by newest date first
    const mine = Bakery.getOrders().filter(isMine).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    // Generate the order table with details and cancellation option
    document.getElementById("my-orders-table").innerHTML = mine.length ? mine.map(o => `<tr>
      <td><strong>${Bakery.escapeHTML(o.id)}</strong></td><td>${o.quantity} × ${Bakery.escapeHTML(o.product)}</td>
      <td>${new Date(o.date + "T00:00:00").toLocaleDateString("en-MY", {day:"2-digit", month:"short", year:"numeric"})}</td>
      <td>${Bakery.money(o.total)}</td><td><span class="status-pill ${Bakery.statusClass(o.status)}">${Bakery.escapeHTML(o.status)}</span></td>
      <td class="text-end">${o.status === "Pending" ? `<button class="action-btn danger" onclick="cancelMyOrder('${Bakery.escapeHTML(o.id)}')">Cancel</button>` : ""}</td></tr>`).join("")
      : '<tr><td colspan="6" class="empty-state"><i class="bi bi-receipt"></i>You have not placed any orders yet.</td></tr>';
  }

  // Open the order modal for the selected product
  window.openBuy = function (id) {

    // Find the selected product from the product list
    const p = Bakery.getProducts().find(x => x.id === id); if (!p) return;

    // Display the selected product details in the order modal
    document.getElementById("buy-id").value = p.id;
    document.getElementById("buy-title").textContent = p.name;
    document.getElementById("buy-meta").textContent = `${Bakery.money(p.price)} each · ${p.stock} available`;

    // Set the maximum quantity based on available stock
    const qty = document.getElementById("buy-qty"); qty.max = p.stock; qty.value = 1;

    // Calculate the total price and display the order modal
    updateTotal(); buyModal.show();
  };

  // Calculate and display the order total based on product price and quantity
  function updateTotal() {
    const p = Bakery.getProducts().find(x => x.id === Number(document.getElementById("buy-id").value));
    document.getElementById("buy-total").textContent = Bakery.money(p ? p.price * (Number(document.getElementById("buy-qty").value) || 0) : 0);
  }

  // Recalculate the order total whenever the customer changes the quantity
  document.getElementById("buy-qty").addEventListener("input", updateTotal);

  // Handle the order form submission
  document.getElementById("buy-form").addEventListener("submit", e => {
    e.preventDefault();

    // Retrieve the selected product and entered quantity
    const products = Bakery.getProducts(), p = products.find(x => x.id === Number(document.getElementById("buy-id").value));
    const qty = Number(document.getElementById("buy-qty").value);

    // Validate the quantity against the available stock
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > p.stock) { alert("Please enter a quantity within the available stock."); return; }

    // Retrieve existing orders and generate the next order ID
    const orders = Bakery.getOrders();
    const next = orders.reduce((m, o) => Math.max(m, Number(o.id.split("-")[1]) || 1000), 1000) + 1;

    // Create a new order with the customer's details and order status
    orders.push({id: "CC-" + next, customer: session.name, username: session.username, product: p.name, quantity: qty, total: p.price * qty, date: new Date().toISOString().slice(0, 10), status: "Pending"});

    // Reduce the product stock based on the ordered quantity
    p.stock -= qty;

    // Save the updated product and order records
    Bakery.saveProducts(products); Bakery.saveOrders(orders);

    // Close the modal, display a confirmation message and refresh the page data
    buyModal.hide(); flash(`Order CC-${next} placed: ${qty} × ${p.name}. Thank you!`);
    renderProducts(); renderMyOrders();
  });

  // Allow customers to cancel their own pending orders
  window.cancelMyOrder = function (id) {

    // Find the selected order and verify that it belongs to the current customer
    const orders = Bakery.getOrders(), o = orders.find(x => x.id === id);
    if (!o || !isMine(o) || o.status !== "Pending") return;

    // Ask for confirmation before cancelling the order
    if (!confirm(`Cancel order ${o.id}?`)) return;

    // Update the order status to cancelled
    o.status = "Cancelled";

    // Restore the product stock after the order is cancelled
    const products = Bakery.getProducts(), p = products.find(x => x.name === o.product);
    if (p) { p.stock += Number(o.quantity); Bakery.saveProducts(products); }

    // Save the updated order and refresh the product and order displays
    Bakery.saveOrders(orders); flash(`Order ${o.id} cancelled.`); renderProducts(); renderMyOrders();
  };

  // Refresh the product list when the customer searches or changes the category
  document.getElementById("shop-search").addEventListener("input", renderProducts);
  document.getElementById("shop-category").addEventListener("change", renderProducts);

  /* ---- My profile: customers edit their own details; changes carry through to login, customer record and orders ---- */

  // Load the current customer's profile information into the form
  function loadProfile() {
    const user = Bakery.getUsers().find(u => u.username === session.username);
    if (!user) return;

    // Display the username and fill in the customer's existing details
    document.getElementById("profile-username").textContent = "@" + user.username;
    document.getElementById("pf-name").value = user.name;
    document.getElementById("pf-email").value = user.email || "";
    document.getElementById("pf-phone").value = user.phone && user.phone !== "Not provided" ? user.phone : "";
  }

  // Display profile update messages using the selected alert type
  function profileMsg(type, text) {
    const box = document.getElementById("profile-alert");
    box.className = "alert alert-" + type; box.textContent = text;
  }

  // Handle the customer profile form submission
  document.getElementById("profile-form").addEventListener("submit", e => {
    e.preventDefault();

    // Get the updated personal details and password inputs
    const name = document.getElementById("pf-name").value.trim();
    const email = document.getElementById("pf-email").value.trim();
    const phone = document.getElementById("pf-phone").value.trim() || "Not provided";
    const current = document.getElementById("pf-current").value;
    const next = document.getElementById("pf-new").value;
    const confirmPw = document.getElementById("pf-confirm").value;

    // Validate the required name and email fields
    if (!name || !email) return profileMsg("danger", "Name and email are required.");

    // Check whether the email address follows a valid format
    if (!/^[^\s@]+@[^\s@]+**\\.**[^\s@]+$/.test(email)) return profileMsg("danger", "Please enter a valid email address.");

    // Find the customer's account and retrieve the customer records
    const users = Bakery.getUsers(), user = users.find(u => u.username === session.username);
    if (!user) return profileMsg("danger", "Account not found. Please sign in again.");

    const customers = Bakery.getCustomers();

    // Store the customer's previous details for matching existing records
    const oldEmail = (user.email || "").toLowerCase(), oldName = user.name;
    const lower = email.toLowerCase();

    // Prevent the customer from using an email address already registered by another account
    if (users.some(u => u !== user && (u.email || "").toLowerCase() === lower) || customers.some(c => c.email.toLowerCase() === lower && c.email.toLowerCase() !== oldEmail))
      return profileMsg("danger", "That email address is already used by another account.");

    // Validate the current password and new password if the customer chooses to change it
    if (current || next || confirmPw) {
      if (current !== user.password) return profileMsg("danger", "Your current password is incorrect.");
      if (next.length < 6) return profileMsg("danger", "New password must be at least 6 characters.");
      if (next !== confirmPw) return profileMsg("danger", "New passwords do not match.");
      user.password = next;
    }

    // Update the customer's previous orders with the latest username and name
    const orders = Bakery.getOrders();
    orders.forEach(o => { if (isMine(o)) { o.username = session.username; o.customer = name; } });
    Bakery.saveOrders(orders);

    // Find and update the existing customer record, or create a new one if not found
    let record = customers.find(c => c.email.toLowerCase() === oldEmail) || customers.find(c => c.name.toLowerCase() === oldName.toLowerCase());
    if (record) { record.name = name; record.email = email; record.phone = phone; }
    else customers.push({id: Bakery.nextId(customers), name, email, phone});
    Bakery.saveCustomers(customers);

    // Save the updated user account details
    user.name = name; user.email = email; user.phone = phone;
    Bakery.saveUsers(users);

    // Update the current session and refresh the customer information displayed on the page
    session.name = name; Bakery.write(Bakery.keys.session, session);
    document.getElementById("shop-name").textContent = name;
    document.getElementById("shop-avatar").textContent = name.charAt(0).toUpperCase();
    document.getElementById("shop-greeting").textContent = "Hello, " + name.split(" ")[0] + ".";

    // Clear the password fields after a successful profile update
    ["pf-current", "pf-new", "pf-confirm"].forEach(id => document.getElementById(id).value = "");

    // Display a success message and refresh the customer's order history
    profileMsg("success", "Your profile has been updated.");
    renderMyOrders();
  });

  // Load the profile and display products and orders when the page opens
  loadProfile();
  renderProducts(); renderMyOrders();

}
