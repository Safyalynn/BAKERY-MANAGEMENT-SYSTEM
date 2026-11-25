// Get the customer table and initialize the customer modal
const customerBody = document.getElementById("customers-table");
const customerModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("customer-modal"));

// Extract the order number from the order ID for sorting purposes
const customerOrderNumber = order => Number(String(order.id).split("-")[1]) || 0;

// Display customer records in the table and update the summary counters
function renderCustomers() {
  const all = Bakery.getCustomers();
  const orders = Bakery.getOrders();
  const query = document.getElementById("customer-search").value.toLowerCase();

  // Get all orders belonging to a specific customer
  const ordersOf = customer => orders.filter(o => o.customer.toLowerCase() === customer.name.toLowerCase());

  // Find the customer's latest order based on date and order number
  const newestOrder = customer => ordersOf(customer).sort((a, b) => b.date.localeCompare(a.date) || customerOrderNumber(b) - customerOrderNumber(a))[0];

  // Filter customers by name or email and sort them by their latest order
  const rows = all
    .filter(c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query))
    .sort((a, b) => {
      const newestA = newestOrder(a), newestB = newestOrder(b);
      if (newestA && newestB) return newestB.date.localeCompare(newestA.date) || customerOrderNumber(newestB) - customerOrderNumber(newestA);
      if (newestA) return -1;      // customers with orders come first
      if (newestB) return 1;
      return b.id - a.id;          // customers without orders: newest sign-up first
    });

  // Update the customer summary counters
  document.getElementById("customers-total").textContent = all.length;
  document.getElementById("customers-repeat").textContent = all.filter(c => ordersOf(c).length > 1).length;
  document.getElementById("customers-orders").textContent = orders.length;
  document.getElementById("customer-results").textContent = `Showing ${rows.length} of ${all.length} customers`;

  // Generate customer table rows dynamically or display an empty message
  customerBody.innerHTML = rows.length
    ? rows.map(c => `<tr>
        <td><div class="product-cell"><span class="avatar">${Bakery.escapeHTML(c.name.charAt(0).toUpperCase())}</span>${Bakery.escapeHTML(c.name)}</div></td>
        <td>${Bakery.escapeHTML(c.email)}</td>
        <td>${Bakery.escapeHTML(c.phone)}</td>
        <td>${ordersOf(c).length}</td>
        <td class="text-end"><button class="action-btn danger" aria-label="Delete ${Bakery.escapeHTML(c.name)}" onclick="deleteCustomer(${c.id})"><i class="bi bi-trash3"></i></button></td>
      </tr>`).join("")
    : '<tr><td colspan="5" class="empty-state">No customers match your search.</td></tr>';
}

// Delete a customer after confirming the action
// Existing order records are not deleted.
window.deleteCustomer = function (id) {
  const customer = Bakery.getCustomers().find(c => c.id === id);
  if (!customer) return;
  if (!confirm(`Delete customer "${customer.name}"? Existing order records will remain.`)) return;

  // Remove the selected customer and save the updated customer list
  Bakery.saveCustomers(Bakery.getCustomers().filter(c => c.id !== id));

  // Refresh the customer table after deletion
  renderCustomers();
};

// Handle the customer form submission to add a new customer
document.getElementById("customer-form").addEventListener("submit", e => {
  e.preventDefault();
  const all = Bakery.getCustomers();
  const name = document.getElementById("customer-fullname").value.trim();
  const email = document.getElementById("customer-email").value.trim();

  // Check whether the email address is already registered
  if (all.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    alert("A customer with this email address already exists.");
    return;
  }

  // Add the new customer with a unique ID
  all.push({ id: Bakery.nextId(all), name, email, phone: document.getElementById("customer-phone").value.trim() });

  // Save the updated customer list
  Bakery.saveCustomers(all);

  // Close the modal, clear the form and refresh the customer table
  customerModal.hide();
  e.target.reset();
  renderCustomers();
});

// Update the customer table whenever the search input changes
document.getElementById("customer-search").addEventListener("input", renderCustomers);

// Display customer records when the page first loads
renderCustomers();
