// main.js
// Put <script src="main.js"></script> in each HTML page (before page-specific scripts)

const API_BASE = "http://localhost:3001/api";

// ---------- Auth helpers ----------
function setToken(token) { localStorage.setItem("token", token); }
function getToken() { return localStorage.getItem("token"); }
function removeToken() { localStorage.removeItem("token"); }

function setUser(user) { localStorage.setItem("user", JSON.stringify(user)); }
function getUser() { const u = localStorage.getItem("user"); return u ? JSON.parse(u) : null; }
function clearAuth() { removeToken(); localStorage.removeItem("user"); }

// ---------- API request helper ----------
async function apiRequest(path, method='GET', body=null, auth=false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (!token) throw new Error('No auth token');
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { message: text }; }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ---------- Navbar rendering (call on every page) ----------
function renderNavbar() {
  const navRoot = document.getElementById('app-navbar');
  if (!navRoot) return;
  const user = getUser();

  navRoot.innerHTML = `
    <div class="navbar">
      <div class="inner">
        <div style="display:flex;align-items:center;gap:1rem;">
          <div class="brand"><a href="index.html" style="color:white;text-decoration:none;">Animal NGO</a></div>
          <div class="small" style="color:white">Community rescue & donations</div>
        </div>
        <div class="nav-links" style="display:flex;align-items:center;">
          <a href="donations.html">Donations</a>
          <a href="rescue-nearby.html">Nearby Rescues</a>
          ${user ? `
            <a href="dashboard.html">Dashboard</a>
            <a href="#" id="nav-logout">Logout</a>
          ` : `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
          `}
        </div>
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      clearAuth();
      window.location.href = 'login.html';
    });
  }
}

// ---------- Small helpers ----------
function requireAuth(redirect='login.html') {
  if (!getToken()) {
    window.location.href = redirect;
    return false;
  }
  return true;
}

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
}

// Call this on pages to init navbar
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
});
