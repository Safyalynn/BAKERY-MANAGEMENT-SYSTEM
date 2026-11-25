const orderBody = document.getElementById("orders-table");
const orderModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("order-modal"));
const ORDER_STATUSES = ["Pending", "Preparing", "Completed", "Cancelled"];

// Gets the numeric part of an order ID for sorting.
const orderNumber = order => Number(String(order.id).split("-")[1]) || 0;

// Formats the order date into a readable date format.
const formatOrderDate = iso => new Date(iso + "T00:00:00").toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });

/* ---------- "Create order" modal ---------- */
// Loads products with available stock into the product dropdown.
function renderOrderProductOptions() {
  const select = document.getElementById("order-product");
  const available = Bakery.getProducts().filter(p => p.stock > 0);
  select.innerHTML = available.length
    ? available.map(p => `<option value="${p.id}">${Bakery.escapeHTML(p.name)} - ${Bakery.money(p.price)} (${p.stock} available)</option>`).join("")
    : '<option value="">No available stock</option>';
  updatePreview();
}

// Calculates and displays the total price based on product and quantity.
function updatePreview() {
  const product = Bakery.getProducts().find(p => p.id === Number(document.getElementById("order-product").value));
  const quantity = Number(document.getElementById("order-quantity").value) || 0;
  document.getElementById("order-total-preview").textContent = Bakery.money(product ? product.price * quantity : 0);
}

/* ---------- Orders table ---------- */
// Displays orders, applies search and status filters, and updates the summary.
function renderOrders() {
  const all = Bakery.getOrders();
  const query = document.getElementById("order-search").value.toLowerCase();
  const status = document.getElementById("status-filter").value;
  const rows = all.filter(o =>
    (o.id.toLowerCase().includes(query) || o.customer.toLowerCase().includes(query)) &&
    (status === "all" || o.status === status)
  );

  // Summary counters
  document.getElementById("orders-all").textContent = all.length;
  document.getElementById("orders-pending").textContent = all.filter(o => ["Pending", "Preparing"].includes(o.status)).length;
  document.getElementById("orders-completed").textContent = all.filter(o => o.status === "Completed").length;
  document.getElementById("order-results").textContent = `Showing ${rows.length} of ${all.length} orders`;

  // Sorts orders by date, with the newest orders displayed first.
  rows.sort((a, b) => b.date.localeCompare(a.date) || orderNumber(b) - orderNumber(a));

  // Generates the order table rows or displays a message if no orders are found.
  orderBody.innerHTML = rows.length
    ? rows.map(o => `<tr>
        <td><strong>${Bakery.escapeHTML(o.id)}</strong></td>
        <td>${Bakery.escapeHTML(o.customer)}</td>
        <td>${o.quantity} × ${Bakery.escapeHTML(o.product)}</td>
        <td>${formatOrderDate(o.date)}</td>
        <td>${Bakery.money(o.total)}</td>
        <td><span class="status-pill ${Bakery.statusClass(o.status)}">${Bakery.escapeHTML(o.status)}</span></td>
        <td class="text-end">
          <select class="form-select form-select-sm d-inline-block" style="width:125px" aria-label="Update order status ${Bakery.escapeHTML(o.id)}" onchange="changeOrderStatus('${o.id}', this.value)">
            ${ORDER_STATUSES.map(s => `<option ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
      </tr>`).join("")
    : '<tr><td colspan="7" class="empty-state">No orders match your search.</td></tr>';
}

// Updates an order's status when the admin selects a new status.
window.changeOrderStatus = function (id, status) {
  const all = Bakery.getOrders();
  const order = all.find(o => o.id === id);
  if (!order) return;
  order.status = status;
  Bakery.saveOrders(all);
  renderOrders();
};

/* ---------- Save a new order ---------- */
// Handles the order form submission and checks product availability.
document.getElementById("order-form").addEventListener("submit", e => {
  e.preventDefault();
  const products = Bakery.getProducts();
  const product = products.find(p => p.id === Number(document.getElementById("order-product").value));
  const quantity = Number(document.getElementById("order-quantity").value);
  if (!product || quantity < 1 || quantity > product.stock) {
    alert("Please select an available product and enter a quantity within the current stock.");
    return;
  }

  // Gets the customer name and generates a new unique order number.
  const customerName = document.getElementById("customer-name").value.trim();
  const orders = Bakery.getOrders();
  const nextNumber = orders.reduce((max, o) => Math.max(max, orderNumber(o), 1000), 1000) + 1;
  orders.push({
    id: "CC-" + nextNumber,
    customer: customerName,
    product: product.name,
    quantity,
    total: product.price * quantity,
    date: new Date().toISOString().slice(0, 10),
    status: document.getElementById("order-status").value
  });

  // Reduces product stock after the order is created.
  product.stock -= quantity; // keep stock in sync
  Bakery.saveProducts(products);
  Bakery.saveOrders(orders);

  // Automatically adds new customer names to the customer directory.
  const customers = Bakery.getCustomers();
  if (!customers.some(c => c.name.toLowerCase() === customerName.toLowerCase())) {
    customers.push({ id: Bakery.nextId(customers), name: customerName, email: "Not provided", phone: "Not provided" });
    Bakery.saveCustomers(customers);
  }

  // Closes and resets the form, then refreshes the order table.
  orderModal.hide();
  document.getElementById("order-form").reset();
  renderOrderProductOptions();
  renderOrders();
});

/* ---------- Events & first render ---------- */
// Updates the preview, filters, and product options based on user actions.
document.getElementById("order-product").addEventListener("change", updatePreview);
document.getElementById("order-quantity").addEventListener("input", updatePreview);
document.getElementById("order-search").addEventListener("input", renderOrders);
document.getElementById("status-filter").addEventListener("change", renderOrders);
document.getElementById("order-modal").addEventListener("show.bs.modal", renderOrderProductOptions);

// Loads the product options and order table when the page opens.
renderOrderProductOptions();
renderOrders();
