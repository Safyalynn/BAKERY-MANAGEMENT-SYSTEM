
/* Customer self-registration. Creates a customer login and a record visible to Admin / Staff. */

// Gets the registration form and alert message element.
const form = document.getElementById("register-form");
const alertBox = document.getElementById("register-alert");

// Displays the current year in the footer.
document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

// Redirects users who are already logged in to their respective pages.
const existing = Bakery.getSession();
if (existing) location.replace(existing.role === "admin" ? "index.html" : "shop.html");

// Displays an error message when registration validation fails.
function showError(message) { alertBox.textContent = message; alertBox.classList.remove("d-none"); alertBox.scrollIntoView({block:"nearest"}); }

// Handles customer registration when the form is submitted.
form.addEventListener("submit", function (event) {
  event.preventDefault();
  alertBox.classList.add("d-none");

  // Gets the registration details entered by the customer.
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone").value.trim() || "Not provided";
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm").value;

  // Checks that all required fields are filled in.
  if (!name || !email || !username || !password) return showError("Please fill in all required fields.");

  // Validates the email address format.
  if (!/^[^\s@]+@[^\s@]+**\\.**[^\s@]+$/.test(email)) return showError("Please enter a valid email address.");

  // Checks username length and allows only letters, numbers and underscores.
  if (!/^[A-Za-z0-9\_]{3,20}$/.test(username)) return showError("Username must be 3 to 20 characters: letters, numbers or underscore.");

  // Checks password length and confirms both password fields match.
  if (password.length < 6) return showError("Password must be at least 6 characters.");
  if (password !== confirm) return showError("Passwords do not match.");

  // Retrieves existing user accounts and customer records.
  const users = Bakery.getUsers(), customers = Bakery.getCustomers();

  // Prevents duplicate usernames and email addresses.
  if (username.toLowerCase() === Bakery.adminAccount.username || users.some(u => u.username.toLowerCase() === username.toLowerCase())) return showError("That username is already taken. Please choose another.");
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase()) ) return showError("An account with this email already exists. Try signing in instead.");

  // Creates a new customer login account.
  users.push({username, password, role: "customer", name, email, phone});
  Bakery.saveUsers(users);

  // Adds the customer to the customer directory if the email is not already registered.
  if (!customers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    customers.push({id: Bakery.nextId(customers), name, email, phone});
    Bakery.saveCustomers(customers);
  }

  // Redirects the customer to the login page after successful registration.
  location.href = "login.html?registered=1";
});
