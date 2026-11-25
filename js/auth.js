// Get the login form and alert message elements
const loginForm = document.getElementById("login-form");
const alertBox = document.getElementById("login-alert");

// Check whether the user has successfully registered
const registered = new URLSearchParams(location.search).get("registered");
if (registered) {
  const ok = document.getElementById("login-success");
  if (ok) ok.classList.remove("d-none");
}

// Automatically display the current year in the footer
document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

// Check whether a user is already logged in and redirect based on their role
const existing = Bakery.getSession();
if (existing) location.replace(existing.role === "admin" ? "index.html" : "shop.html");

// Show or hide the password when the toggle button is clicked
document.getElementById("toggle-password").addEventListener("click", function () {
  const input = document.getElementById("password");
  const visible = input.type === "password";
  input.type = visible ? "text" : "password";
  this.innerHTML = visible ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
  this.setAttribute("aria-label", visible ? "Hide password" : "Show password");
});

// Function to display an error message when login fails
function showError(message) { alertBox.textContent = message; alertBox.classList.remove("d-none"); }

// Handle the login form submission
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  alertBox.classList.add("d-none");

  // Get the username and password entered by the user
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Validate that both username and password are entered
  if (!username || !password) { showError("Please enter both your username and password."); return; }

  // Combine the admin account and registered customer accounts
  const accounts = [Bakery.adminAccount, ...Bakery.getUsers()];

  // Check whether the entered login details match an existing account
  const account = accounts.find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === password);

  // Display an error message if the login details are incorrect
  if (!account) { showError("Invalid username or password. Please check your details and try again."); return; }

  // Save the logged-in user's information and session details
  Bakery.write(Bakery.keys.session, {username: account.username, name: account.name, role: account.role, signedInAt: new Date().toISOString()});

  // Redirect the user to the correct page based on their role
  location.href = account.role === "admin" ? "index.html" : "shop.html";
});
