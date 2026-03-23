// =========================
// 🌐 BASE URL (AUTO SWITCH)
// =========================
const BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:8081"
        : "https://hrenterprise-saas.onrender.com";

// =========================
// 🔐 AUTH FUNCTIONS
// =========================

// LOGIN
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Invalid credentials");
        return res.text();
    })
    .then(token => {
        token = token.trim();
        localStorage.setItem("token", token);

        const roles = parseJwt(token).roles || [];

        if (roles.includes("EMPLOYEE")) {
            window.location.href = "employee.html";
        } else {
            window.location.href = "dashboard.html";
        }
    })
    .catch(err => {
        console.error(err);
        alert("Login failed ❌ " + err.message);
    });
}

// REGISTER (REAL API CALL)
function register() {
    const companyName = document.getElementById("companyName")?.value.trim();
    const companyEmail = document.getElementById("companyEmail")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!companyName || !companyEmail || !username || !password) {
        alert("Please fill all fields");
        return;
    }

    fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            companyName,
            companyEmail,
            username,
            password
        })
    })
    .then(res => {
        if (!res.ok) return res.text().then(err => { throw new Error(err) });
        return res.text();
    })
    .then(() => {
        alert("Workspace created successfully ✅");
        window.location.href = "login.html";
    })
    .catch(err => {
        console.error(err);
        alert("Registration failed ❌ " + err.message);
    });
}

// REDIRECT TO REGISTER PAGE
function goToRegister() {
    window.location.href = "register.html";
}

// LOGOUT
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// =========================
// 🔐 JWT HELPERS
// =========================

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return {};
    }
}

function getRoles() {
    const token = localStorage.getItem("token");
    if (!token) return [];
    return parseJwt(token).roles || [];
}

function isAdmin() { return getRoles().includes("ADMIN"); }
function isHR() { return getRoles().includes("HR"); }
function isEmployee() { return getRoles().includes("EMPLOYEE"); }

// =========================
// 🔒 PAGE PROTECTION
// =========================

function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const page = window.location.pathname;

    if (page.includes("dashboard") && isEmployee()) {
        window.location.href = "employee.html";
    }

    if (page.includes("employee") && !isEmployee()) {
        window.location.href = "dashboard.html";
    }
}

// =========================
// 🔧 COMMON HELPERS
// =========================

function authHeader() {
    return {
        "Authorization": "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json"
    };
}

function disableAllButtons() {
    document.querySelectorAll("button").forEach(btn => btn.disabled = true);
}

function enableAllButtons() {
    document.querySelectorAll("button").forEach(btn => btn.disabled = false);
}

// =========================
// 👨‍💼 EMPLOYEE MODULE
// =========================

function applyLeave() {
    const data = {
        leaveType: document.getElementById("leaveType").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        reason: document.getElementById("reason").value
    };

    if (!data.startDate || !data.endDate || !data.reason) {
        alert("Fill all fields");
        return;
    }

    fetch(`${BASE_URL}/api/leaves/apply`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
        alert("Leave Applied ✅");
        loadMyLeaves();
    })
    .catch(() => alert("Error ❌"));
}

function loadMyLeaves() {
    fetch(`${BASE_URL}/api/leaves/my`, {
        headers: authHeader()
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("leaveList");

        if (!data.length) {
            container.innerHTML = "<p>No leaves</p>";
            return;
        }

        container.innerHTML = data.map(l => `
            <div class="card">
                <p>${l.leaveType}</p>
                <p>${l.startDate} → ${l.endDate}</p>
                <p>${l.status}</p>
            </div>
        `).join("");
    });
}

// =========================
// 🏢 ADMIN / HR MODULE
// =========================

function loadEmployees() {
    fetch(`${BASE_URL}/employees`, {
        headers: authHeader()
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("employees");

        container.innerHTML = data.map(emp => `
            <div class="card">
                <p>${emp.name}</p>
                <p>${emp.email}</p>
                <p>${emp.department}</p>
            </div>
        `).join("");
    });
}