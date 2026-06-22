/* ─────────────────────────────────────────────
   SK EGG MART — Admin Dashboard JavaScript
   ───────────────────────────────────────────── */

let lastOrderCount = null;
let notificationSound = null;

// ─────────────────────────────────────────────
// Toast Notification
// ─────────────────────────────────────────────
function showToast(msg, type = "info", duration = 4000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "🔔", new_order: "🛒" };
  toast.innerHTML = `<span style="font-size:1.2rem">${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "toastOut 0.4s ease forwards";
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ─────────────────────────────────────────────
// New Order Sound Alert
// ─────────────────────────────────────────────
function playNotificationSound() {
  // Generate a beep using Web Audio API (no file needed)
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const playBeep = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playBeep(880, 0, 0.15);
    playBeep(1100, 0.2, 0.15);
    playBeep(880, 0.4, 0.3);
  } catch (e) {
    // Audio API not available
  }
}

// ─────────────────────────────────────────────
// Dashboard Stats
// ─────────────────────────────────────────────
async function loadDashboardStats() {
  try {
    const res = await fetch("/api/dashboard-stats");
    const data = await res.json();

    const update = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        animateNumber(el, parseInt(el.textContent) || 0, val);
      }
    };

    update("stat-today-orders", data.today_orders);
    update("stat-white-eggs", data.today_white_eggs);
    update("stat-brown-eggs", data.today_brown_eggs);
    update("stat-today-trays", data.today_trays);
    update("stat-today-eggs", data.today_total_eggs);
    update("stat-pending", data.pending_orders);
    update("stat-delivered", data.delivered_orders);
    update("stat-total-eggs", data.overall_total_eggs);
  } catch (e) {
    console.error("Failed to load stats:", e);
  }
}

function animateNumber(el, from, to) {
  const duration = 800;
  const start = performance.now();
  const animate = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

// ─────────────────────────────────────────────
// Live Orders Polling
// ─────────────────────────────────────────────
async function checkNewOrders() {
  try {
    const res = await fetch("/api/orders/latest-count");
    const data = await res.json();
    const count = data.count;

    if (lastOrderCount !== null && count > lastOrderCount) {
      playNotificationSound();
      showToast(`🛒 New Order Received! (${count - lastOrderCount} new)`, "new_order", 6000);
      if (typeof loadDashboardStats === "function") loadDashboardStats();
      if (typeof loadOrders === "function") loadOrders();
    }
    lastOrderCount = count;
  } catch (e) {
    // Silently fail
  }
}

// ─────────────────────────────────────────────
// Orders Table
// ─────────────────────────────────────────────
const STATUS_COLORS = {
  "Pending": "status-pending",
  "Preparing": "status-preparing",
  "Out For Delivery": "status-out-for-delivery",
  "Delivered": "status-delivered",
  "Cancelled": "status-cancelled",
};

const STATUS_ICONS = {
  "Pending": "⏳",
  "Preparing": "👨‍🍳",
  "Out For Delivery": "🚴",
  "Delivered": "✅",
  "Cancelled": "❌",
};

function renderStatusBadge(status) {
  const cls = STATUS_COLORS[status] || "status-pending";
  const icon = STATUS_ICONS[status] || "⏳";
  return `<span class="status-badge ${cls}">${icon} ${status}</span>`;
}

function renderStatusSelect(orderId, currentStatus) {
  const statuses = ["Pending", "Preparing", "Out For Delivery", "Delivered", "Cancelled"];
  const opts = statuses.map(s =>
    `<option value="${s}" ${s === currentStatus ? "selected" : ""}>${STATUS_ICONS[s]} ${s}</option>`
  ).join("");
  return `
    <select class="status-select" data-order-id="${orderId}"
      onchange="updateOrderStatus('${orderId}', this.value)"
      style="border:1.5px solid #E5E7EB;border-radius:8px;padding:6px 10px;font-family:Outfit,sans-serif;font-size:0.82rem;cursor:pointer;background:white;">
      ${opts}
    </select>`;
}

async function loadOrders() {
  const search = document.getElementById("search-input")?.value || "";
  const status = document.getElementById("status-filter")?.value || "";
  const block = document.getElementById("block-filter")?.value || "";
  const dateVal = document.getElementById("date-filter")?.value || "";

  const params = new URLSearchParams({ search, status, block, date: dateVal });

  try {
    const res = await fetch(`/api/orders?${params}`);
    const orders = await res.json();
    renderOrdersTable(orders);
  } catch (e) {
    console.error("Failed to load orders:", e);
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById("orders-tbody");
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:40px;color:#9CA3AF;">
          <div style="font-size:2rem;margin-bottom:8px;">📦</div>
          <div>No orders found</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>
        <a href="/admin/order/${o.order_id}" style="color:var(--primary);font-weight:700;text-decoration:none;font-size:0.85rem;">
          ${o.order_id}
        </a>
      </td>
      <td style="font-weight:600;">${o.customer.name}</td>
      <td>
        <span style="background:#FEF3C7;color:#D97706;padding:2px 8px;border-radius:4px;font-weight:700;">
          Block ${o.customer.block_name}
        </span>
      </td>
      <td>${o.customer.room_number}</td>
      <td>
        <a href="tel:${o.customer.mobile_number}" style="color:#3B82F6;text-decoration:none;">
          ${o.customer.mobile_number}
        </a>
      </td>
      <td style="white-space:nowrap;font-size:0.85rem;color:#6B7280;">${o.time}</td>
      <td>${renderStatusBadge(o.status)}</td>
      <td>
        <div style="display:flex;gap:8px;align-items:center;">
          ${renderStatusSelect(o.order_id, o.status)}
          <a href="/admin/order/${o.order_id}"
            style="width:30px;height:30px;background:#F3F4F6;border-radius:6px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:0.9rem;">
            👁️
          </a>
        </div>
      </td>
    </tr>
  `).join("");
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order ${orderId} → ${status}`, "success");
      if (typeof loadDashboardStats === "function") loadDashboardStats();
    }
  } catch (e) {
    showToast("Failed to update status", "error");
  }
}

// ─────────────────────────────────────────────
// History
// ─────────────────────────────────────────────
async function loadHistory(days = 7) {
  try {
    const res = await fetch(`/api/history?days=${days}`);
    const data = await res.json();
    renderHistory(data);
  } catch (e) {
    console.error("Failed to load history:", e);
  }
}

function renderHistory(data) {
  const container = document.getElementById("history-container");
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = '<p style="color:#9CA3AF;text-align:center;padding:40px;">No historical data</p>';
    return;
  }

  container.innerHTML = data.map((day, i) => `
    <div class="glass-card" style="padding:20px;margin-bottom:16px;animation:slideInUp 0.4s ease ${i * 0.05}s both;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-weight:700;font-size:1.1rem;color:var(--primary);">${day.date}</div>
          <div style="font-size:0.85rem;color:#6B7280;">Total Orders: <b>${day.total_orders}</b></div>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div style="text-align:center;">
            <div style="font-size:1.4rem;font-weight:800;color:var(--secondary);">${day.total_trays}</div>
            <div style="font-size:0.75rem;color:#6B7280;">Trays</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.4rem;font-weight:800;color:var(--primary);">${day.total_eggs}</div>
            <div style="font-size:0.75rem;color:#6B7280;">Eggs</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.4rem;font-weight:800;color:#10B981;">${day.delivered}</div>
            <div style="font-size:0.75rem;color:#6B7280;">Delivered</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.4rem;font-weight:800;color:#EF4444;">${day.cancelled}</div>
            <div style="font-size:0.75rem;color:#6B7280;">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// ─────────────────────────────────────────────
// Sidebar Toggle (Mobile)
// ─────────────────────────────────────────────
window.toggleSidebar = function () {
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  sidebar?.classList.toggle("open");
  overlay?.classList.toggle("hidden");
};

// ─────────────────────────────────────────────
// Export Excel
// ─────────────────────────────────────────────
window.exportExcel = function () {
  window.location.href = "/api/export-excel";
  showToast("Downloading Excel file…", "info");
};

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Dashboard page
  if (document.getElementById("stat-today-orders")) {
    loadDashboardStats();
    setInterval(loadDashboardStats, 15000);
  }

  // Orders page
  if (document.getElementById("orders-tbody")) {
    loadOrders();
    // Real-time search
    ["search-input", "status-filter", "block-filter", "date-filter"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", loadOrders);
    });
    setInterval(loadOrders, 15000);
  }

  // History page
  if (document.getElementById("history-container")) {
    loadHistory(7);
    document.querySelectorAll("[data-days]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-days]").forEach(b => b.classList.remove("active-tab"));
        btn.classList.add("active-tab");
        loadHistory(btn.getAttribute("data-days"));
      });
    });
  }

  // New order polling (all admin pages)
  setInterval(checkNewOrders, 15000);
  checkNewOrders(); // initial check
});
