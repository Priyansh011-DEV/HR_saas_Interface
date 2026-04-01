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
        console.log("Logged in. Roles:", roles);

        if (roles.includes("EMPLOYEE")) {
            window.location.href = "employee.html";
        } else if (roles.includes("ADMIN")) {
            window.location.href = "admin-dashboard.html";
        } else {
            window.location.href = "hr-dashboard.html"; // HR
        }
    })
    .catch(err => alert("Login failed ❌ " + err.message));
}

function register() {
    const companyName  = document.getElementById("companyName").value.trim();
    const companyEmail = document.getElementById("companyEmail").value.trim();
    const username     = document.getElementById("username").value.trim();
    const password     = document.getElementById("password").value.trim();

    if (!companyName || !companyEmail || !username || !password) {
        alert("Please fill all fields");
        return;
    }

    fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companyEmail, username, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Registration failed");
        return res.text();
    })
    .then(() => {
        alert("Workspace created ✅ Please login.");
        window.location.href = "login.html";
    })
    .catch(err => alert("Error ❌ " + err.message));
}

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
    return token ? parseJwt(token).roles || [] : [];
}

function isAdmin()    { return getRoles().includes("ADMIN"); }
function isHR()       { return getRoles().includes("HR"); }
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

    // Redirect employees away from admin/hr dashboards
    if ((page.includes("admin-dashboard") || page.includes("hr-dashboard")) && isEmployee()) {
        window.location.href = "employee.html";
        return;
    }

    // Redirect non-employees away from employee dashboard
    if (page.includes("employee.html") && !isEmployee()) {
        window.location.href = isAdmin() ? "admin-dashboard.html" : "hr-dashboard.html";
        return;
    }

    // Redirect HR away from admin dashboard
    if (page.includes("admin-dashboard") && !isAdmin()) {
        window.location.href = "hr-dashboard.html";
        return;
    }
}

// =========================
// 🔧 HELPERS
// =========================

function authHeader() {
    return {
        "Authorization": "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json"
    };
}

function getStatusColor(status) {
    if (status === "APPROVED") return "#34d399";
    if (status === "REJECTED") return "#f87171";
    return "#fbbf24";
}

function disableAllButtons() {
    document.querySelectorAll("button").forEach(btn => btn.disabled = true);
}

function enableAllButtons() {
    document.querySelectorAll("button").forEach(btn => btn.disabled = false);
}

function profileCardHTML(emp) {
    return `
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px">
        <div style="
            width:52px; height:52px;
            background: linear-gradient(135deg, #38bdf8, #818cf8);
            border-radius:50%; display:flex; align-items:center;
            justify-content:center; font-family:'Syne',sans-serif;
            font-size:22px; font-weight:800; color:#080c14">
            ${emp.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
            <div style="font-size:18px; font-weight:600; color:#e2e8f0">${emp.name}</div>
            <div style="font-size:13px; color:#64748b">${emp.email}</div>
        </div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <div style="background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.1); border-radius:10px; padding:14px">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px">Department</div>
            <div style="font-size:15px; font-weight:500; color:#e2e8f0">${emp.department || '—'}</div>
        </div>
        <div style="background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.1); border-radius:10px; padding:14px">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px">Salary</div>
            <div style="font-size:15px; font-weight:500; color:#34d399">₹${emp.salary?.toLocaleString('en-IN') || '—'}</div>
        </div>
        <div style="background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.1); border-radius:10px; padding:14px">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px">Role</div>
            <div style="font-size:15px; font-weight:500; color:#818cf8">${emp.user?.role || '—'}</div>
        </div>
        <div style="background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.1); border-radius:10px; padding:14px">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px">Company</div>
            <div style="font-size:15px; font-weight:500; color:#e2e8f0">${emp.company?.name || '—'}</div>
        </div>
    </div>`;
}

// =========================
// 🏢 DASHBOARD INIT
// =========================

function initDashboard() {
    const admin = isAdmin();
    const hr    = isHR();

    const title = document.getElementById("dashTitle");
    if (title) title.textContent = admin ? "Admin Dashboard" : "HR Dashboard";

    // Add Employee — HR + ADMIN
    const addEmpCard = document.getElementById("addEmployeeCard");
    if (addEmpCard) addEmpCard.style.display = (admin || hr) ? "block" : "none";

    // Add HR — ADMIN only
    const addHrCard = document.getElementById("addHrCard");
    if (addHrCard) addHrCard.style.display = admin ? "block" : "none";
}

// =========================
// 👤 MY PROFILE (HR + ADMIN + EMPLOYEE)
// =========================

function loadMyProfile() {
    const container = document.getElementById("myProfile");
    if (!container) return;

    fetch(`${BASE_URL}/employees/me`, { headers: authHeader() })
    .then(res => {
        if (!res.ok) throw new Error("Profile not found");
        return res.json();
    })
    .then(emp => {
        const initial = emp.name?.charAt(0).toUpperCase() || '?';
        container.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px">
            <div style="width:56px; height:56px; border-radius:50%;
                background: linear-gradient(135deg, var(--accent), var(--accent2));
                display:flex; align-items:center; justify-content:center;
                font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#080c14; flex-shrink:0">
                ${initial}
            </div>
            <div>
                <div style="font-size:20px; font-weight:600; color:var(--text)">${emp.name}</div>
                <div style="font-size:13px; color:var(--text-muted); margin-top:2px">${emp.email}</div>
            </div>
        </div>
        <div class="profile-grid">
            <div class="profile-field">
                <div class="profile-field-label">Department</div>
                <div class="profile-field-value">${emp.department || '—'}</div>
            </div>
            <div class="profile-field">
                <div class="profile-field-label">Salary</div>
                <div class="profile-field-value" style="color:var(--green)">₹${emp.salary?.toLocaleString('en-IN') || '—'}</div>
            </div>
            <div class="profile-field">
                <div class="profile-field-label">Role</div>
                <div class="profile-field-value" style="color:var(--accent2)">${emp.user?.role || '—'}</div>
            </div>
            <div class="profile-field">
                <div class="profile-field-label">Company</div>
                <div class="profile-field-value">${emp.company?.name || '—'}</div>
            </div>
        </div>`;
    })
    .catch(() => {
        container.innerHTML = `<p class="empty-state">Profile not found ❌</p>`;
    });
}

// =========================
// ➕ ADD EMPLOYEE / HR
// =========================

function addEmployee(role) {
    const prefix = role === "HR" ? "hr" : "emp";

    const data = {
        name:       document.getElementById(`${prefix}Name`).value.trim(),
        email:      document.getElementById(`${prefix}Email`).value.trim(),
        department: document.getElementById(`${prefix}Department`).value.trim(),
        salary:     parseFloat(document.getElementById(`${prefix}Salary`).value),
        username:   document.getElementById(`${prefix}Username`).value.trim(),
        password:   document.getElementById(`${prefix}Password`).value.trim(),
        role:       role
    };

    if (!data.name || !data.email || !data.department || !data.salary || !data.username || !data.password) {
        alert("Please fill all fields");
        return;
    }

    disableAllButtons();

    fetch(`${BASE_URL}/employees`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) return res.text().then(err => { throw new Error(err) });
        return res.json();
    })
    .then(() => {
        alert(`${role} added successfully ✅`);
        ["Name","Email","Department","Salary","Username","Password"].forEach(f => {
            const el = document.getElementById(`${prefix}${f}`);
            if (el) el.value = "";
        });
        loadEmployees();
    })
    .catch(err => alert("Failed to add " + role + " ❌ " + err.message))
    .finally(() => enableAllButtons());
}

// =========================
// ❌ REMOVE EMPLOYEE / HR
// HR → EMPLOYEE only
// ADMIN → both
// =========================

function removeEmployee(id, role) {
    if (isHR() && role === "HR") {
        alert("HR cannot remove another HR ❌");
        return;
    }
    if (!confirm(`Remove this ${role}?`)) return;

    disableAllButtons();

    fetch(`${BASE_URL}/employees/${id}`, {
        method: "DELETE",
        headers: authHeader()
    })
    .then(res => {
        if (!res.ok) return res.text().then(err => { throw new Error(err) });
        return res.text();
    })
    .then(() => {
        alert("Removed successfully ✅");
        loadEmployees();
    })
    .catch(err => alert("Failed to remove ❌ " + err.message))
    .finally(() => enableAllButtons());
}

// =========================
// 👥 LOAD EMPLOYEES
// =========================

function loadEmployees() {
    fetch(`${BASE_URL}/employees`, { headers: authHeader() })
    .then(res => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
    })
    .then(data => {
        const container = document.getElementById("employees");
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="empty-state">No employees found.</p>`;
            return;
        }

        const admin = isAdmin();
        // HR cannot delete — only ADMIN can
        container.innerHTML = data.map(emp => {
            const empRole = emp.user?.role || "EMPLOYEE";
            const roleClass = empRole === "ADMIN" ? "role-tag role-tag-admin" : "role-tag";
            const initial = emp.name?.charAt(0).toUpperCase() || '?';

            return `
            <div class="data-item">
                <div class="data-item-header">
                    <div style="display:flex; align-items:center; gap:12px">
                        <div class="emp-avatar">${initial}</div>
                        <div>
                            <div class="data-item-name">${emp.name}</div>
                            <div style="margin-top:2px"><span class="${roleClass}">${empRole}</span></div>
                        </div>
                    </div>
                </div>
                <div class="data-item-meta">
                    <span>📧 ${emp.email}</span>
                    <span>🏢 ${emp.department}</span>
                    <span>💰 ₹${emp.salary?.toLocaleString('en-IN') || '—'}</span>
                </div>
                ${admin ? `
                <div class="data-item-actions">
                    <button class="btn-danger btn-sm" onclick="removeEmployee(${emp.id}, '${empRole}')">🗑 Remove</button>
                </div>` : ''}
            </div>`;
        }).join("");
    })
    .catch(err => alert("Failed to load employees ❌ " + err.message));
}

// =========================
// 🏖️ LOAD ALL LEAVES
// ADMIN → sees all + approves all (including own)
// HR    → sees EMPLOYEE leaves + approves EMPLOYEE only
// =========================

function loadLeaves() {
    fetch(`${BASE_URL}/api/leaves/all`, { headers: authHeader() })
    .then(res => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
    })
    .then(data => {
        const container = document.getElementById("leaveRequests");
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="empty-state">No leave requests found.</p>`;
            return;
        }

        const admin = isAdmin();
        const hr    = isHR();

        container.innerHTML = data.map(l => {
            const statusClass = l.status === 'APPROVED' ? 'badge-approved' : l.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending';
            let showButtons = false;
            if (l.status === "PENDING") {
                if (admin) showButtons = true;
                if (hr && l.employeeRole === "EMPLOYEE") showButtons = true;
            }

            return `
            <div class="data-item">
                <div class="data-item-header">
                    <div>
                        <div class="data-item-name">${l.employeeName} <span class="role-tag">${l.employeeRole}</span></div>
                        <div class="data-item-meta" style="margin-top:6px">
                            <span>${l.leaveType}</span>
                            <span>📅 ${l.startDate} → ${l.endDate}</span>
                            ${l.reason ? `<span>💬 ${l.reason}</span>` : ''}
                        </div>
                    </div>
                    <span class="badge ${statusClass}">${l.status}</span>
                </div>
                ${showButtons ? `
                <div class="data-item-actions">
                    <button onclick="approveLeave(${l.id})">✅ Approve</button>
                    <button class="btn-danger btn-sm" onclick="rejectLeave(${l.id})">❌ Reject</button>
                </div>` : ''}
            </div>`;
        }).join("");
    })
    .catch(err => alert("Failed to load leaves ❌ " + err.message));
}

// =========================
// ✅ APPROVE / REJECT LEAVE
// =========================

function approveLeave(id) {
    if (!confirm("Approve this leave?")) return;
    disableAllButtons();
    updateLeaveStatus(id, "APPROVED");
}

function rejectLeave(id) {
    if (!confirm("Reject this leave?")) return;
    disableAllButtons();
    updateLeaveStatus(id, "REJECTED");
}

function updateLeaveStatus(id, status) {
    fetch(`${BASE_URL}/api/leaves/${id}/status?status=${status}`, {
        method: "PUT",
        headers: authHeader()
    })
    .then(res => {
        if (!res.ok) return res.text().then(err => { throw new Error(err) });
        return res.json();
    })
    .then(() => {
        alert(`Leave ${status} ✅`);
        loadLeaves();
    })
    .catch(err => alert("Error updating leave ❌ " + err.message))
    .finally(() => enableAllButtons());
}

// =========================
// 📝 APPLY LEAVE (ALL ROLES)
// =========================

function applyLeave() {
    const data = {
        leaveType: document.getElementById("leaveType").value,
        startDate: document.getElementById("startDate").value,
        endDate:   document.getElementById("endDate").value,
        reason:    document.getElementById("reason").value
    };

    if (!data.startDate || !data.endDate || !data.reason) {
        alert("Please fill all fields");
        return;
    }

    disableAllButtons();

    fetch(`${BASE_URL}/api/leaves/apply`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to apply leave");
        return res.json();
    })
    .then(() => {
        alert("Leave Applied ✅");
        loadMyLeaves();
    })
    .catch(err => alert("Error ❌ " + err.message))
    .finally(() => enableAllButtons());
}

// =========================
// 📋 MY LEAVES (ALL ROLES)
// =========================

function loadMyLeaves() {
    fetch(`${BASE_URL}/api/leaves/my`, { headers: authHeader() })
    .then(res => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
    })
    .then(data => {
        const container = document.getElementById("leaveList");
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="empty-state">No leaves found.</p>`;
            return;
        }

        container.innerHTML = data.map(l => {
            const statusClass = l.status === 'APPROVED' ? 'badge-approved' : l.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending';
            return `
            <div class="data-item">
                <div class="data-item-header">
                    <div>
                        <div class="data-item-name">${l.leaveType}</div>
                        <div class="data-item-meta" style="margin-top:4px">
                            <span>📅 ${l.startDate} → ${l.endDate}</span>
                        </div>
                    </div>
                    <span class="badge ${statusClass}">${l.status}</span>
                </div>
            </div>`;
        }).join("");
    })
    .catch(err => alert("Failed to load leaves ❌ " + err.message));
}
function initMobileTouch() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        });
    });

    const burger = document.getElementById('hamburger');
    if (burger) {
        burger.addEventListener('touchend', function(e) {
            e.preventDefault();
            toggleSidebar();
        });
    }

    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('touchend', function(e) {
            e.preventDefault();
            closeSidebar();
        });
    }
}