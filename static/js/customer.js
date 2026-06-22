/* ─────────────────────────────────────────────
   SK EGG MART — Customer Portal JavaScript
   ───────────────────────────────────────────── */

let orderItems = [];
let orderCount = 1;

// ─────────────────────────────────────────────
// Utility: Show Field Error
// ─────────────────────────────────────────────
function showError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add("error");
  let err = field.parentElement.querySelector(".field-error");
  if (!err) {
    err = document.createElement("span");
    err.className = "field-error";
    err.style.cssText = "color:#EF4444;font-size:0.8rem;margin-top:4px;display:block;";
    field.parentElement.appendChild(err);
  }
  err.textContent = msg;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove("error");
  const err = field.parentElement.querySelector(".field-error");
  if (err) err.remove();
}

// ─────────────────────────────────────────────
// Customer Info Validation
// ─────────────────────────────────────────────
function validateCustomerInfo() {
  let valid = true;
  const name = document.getElementById("customer_name").value.trim();
  const block = document.getElementById("block_name").value;
  const room = document.getElementById("room_number").value.trim();
  const mobile = document.getElementById("mobile_number").value.trim();

  if (!name) { showError("customer_name", "Name is required"); valid = false; }
  else clearError("customer_name");

  if (!block) { showError("block_name", "Please select a block"); valid = false; }
  else clearError("block_name");

  if (!room || !/^\d+$/.test(room)) { showError("room_number", "Valid room number required"); valid = false; }
  else clearError("room_number");

  if (!mobile || !/^\d{10}$/.test(mobile)) { showError("mobile_number", "Enter valid 10-digit mobile"); valid = false; }
  else clearError("mobile_number");

  return valid;
}

// ─────────────────────────────────────────────
// Order Section Management
// ─────────────────────────────────────────────
function createOrderItem(index) {
  const div = document.createElement("div");
  div.className = "order-item-block";
  div.setAttribute("data-index", index);
  div.id = `order-item-${index}`;

  div.innerHTML = `
    <div class="order-item-header">
      <span class="order-item-title">
        <span>🥚</span>
        <span>Order ${index}</span>
      </span>
      ${index > 1 ? `
      <button type="button" class="remove-item-btn" onclick="removeOrderItem(${index})" title="Remove">
        ✕
      </button>` : ""}
    </div>

    <!-- Egg Type -->
    <div style="margin-bottom:16px;">
      <label class="form-label">Egg Type <span style="color:#EF4444">*</span></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="egg-card" id="card-white-${index}" onclick="selectEggType(${index}, 'White Egg')">
          <div class="egg-check">✓</div>
          <span class="egg-icon">🥚</span>
          <div class="egg-name">White Egg</div>
          <div style="font-size:0.75rem;color:#6B7280;margin-top:4px;">Farm Fresh</div>
        </div>
        <div class="egg-card" id="card-brown-${index}" onclick="selectEggType(${index}, 'Country/Brown Egg')">
          <div class="egg-check">✓</div>
          <span class="egg-icon">🟤</span>
          <div class="egg-name">Country/Brown Egg</div>
          <div style="font-size:0.75rem;color:#6B7280;margin-top:4px;">Desi Egg</div>
        </div>
      </div>
      <input type="hidden" id="egg_type_${index}" value="">
      <span id="egg-type-error-${index}" style="color:#EF4444;font-size:0.8rem;display:none;">Please select egg type</span>
    </div>

    <!-- Number of Trays -->
    <div style="margin-bottom:16px;">
      <label class="form-label" for="trays_${index}">Number of Trays <span style="color:#EF4444">*</span></label>
      <select class="form-select" id="trays_${index}" onchange="updateSummary()">
        <option value="">Select Trays</option>
        ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}">${n} Tray${n>1?'s':''} (${n*30} Eggs)</option>`).join("")}
      </select>
      <span id="trays-error-${index}" style="color:#EF4444;font-size:0.8rem;display:none;">Please select trays</span>
    </div>

    <!-- Additional Eggs -->
    <div>
      <label class="form-label" for="additional_${index}">Additional Eggs <span style="color:#EF4444">*</span></label>
      <input type="number" class="form-input" id="additional_${index}" min="0" value="0"
        placeholder="0" oninput="updateSummary()" style="max-width:160px;">
      <div style="font-size:0.78rem;color:#6B7280;margin-top:4px;">Enter 0 if no extra eggs needed</div>
    </div>
  `;

  return div;
}

function selectEggType(index, type) {
  document.getElementById(`egg_type_${index}`).value = type;
  document.getElementById(`card-white-${index}`).classList.remove("selected");
  document.getElementById(`card-brown-${index}`).classList.remove("selected");
  const cardId = type === "White Egg" ? `card-white-${index}` : `card-brown-${index}`;
  document.getElementById(cardId).classList.add("selected");
  document.getElementById(`egg-type-error-${index}`).style.display = "none";
  updateSummary();

  // Animate
  const card = document.getElementById(cardId);
  card.style.transform = "scale(1.05)";
  setTimeout(() => card.style.transform = "", 300);
}

function removeOrderItem(index) {
  const el = document.getElementById(`order-item-${index}`);
  if (el) {
    el.style.animation = "slideInUp 0.3s ease reverse";
    setTimeout(() => {
      el.remove();
      updateSummary();
    }, 280);
  }
}

window.addOrderItem = function () {
  orderCount++;
  const container = document.getElementById("order-items-container");
  const newItem = createOrderItem(orderCount);
  container.appendChild(newItem);

  // Scroll to it
  setTimeout(() => {
    newItem.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);

  updateSummary();
};

// ─────────────────────────────────────────────
// Live Summary Calculation
// ─────────────────────────────────────────────
function updateSummary() {
  const container = document.getElementById("order-items-container");
  const items = container.querySelectorAll(".order-item-block");
  let totalTrays = 0;
  let totalEggs = 0;
  let summaryHtml = "";

  items.forEach((item) => {
    const idx = item.getAttribute("data-index");
    const eggType = document.getElementById(`egg_type_${idx}`)?.value || "";
    const trays = parseInt(document.getElementById(`trays_${idx}`)?.value || "0") || 0;
    const additional = parseInt(document.getElementById(`additional_${idx}`)?.value || "0") || 0;
    const eggs = trays * 30 + additional;

    totalTrays += trays;
    totalEggs += eggs;

    if (eggType || trays > 0) {
      summaryHtml += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(245,158,11,0.2);">
          <span style="font-weight:500;">${eggType || "—"}</span>
          <span style="font-size:0.85rem;color:#6B7280;">${trays} Tray${trays!==1?'s':''} + ${additional} Eggs</span>
          <span style="font-weight:700;color:var(--primary);">${eggs} Eggs</span>
        </div>`;
    }
  });

  const summaryEl = document.getElementById("order-summary-items");
  const totalTraysEl = document.getElementById("summary-total-trays");
  const totalEggsEl = document.getElementById("summary-total-eggs");

  if (summaryEl) summaryEl.innerHTML = summaryHtml || '<span style="color:#9CA3AF;">Add items above…</span>';
  if (totalTraysEl) totalTraysEl.textContent = totalTrays;
  if (totalEggsEl) totalEggsEl.textContent = totalEggs;
}

// ─────────────────────────────────────────────
// Validate Order Items
// ─────────────────────────────────────────────
function validateOrderItems() {
  const container = document.getElementById("order-items-container");
  const items = container.querySelectorAll(".order-item-block");
  let valid = true;

  items.forEach((item) => {
    const idx = item.getAttribute("data-index");
    const eggType = document.getElementById(`egg_type_${idx}`)?.value;
    const trays = document.getElementById(`trays_${idx}`)?.value;
    const additional = document.getElementById(`additional_${idx}`)?.value;

    if (!eggType) {
      document.getElementById(`egg-type-error-${idx}`).style.display = "block";
      valid = false;
    }
    if (!trays) {
      document.getElementById(`trays-error-${idx}`).style.display = "block";
      valid = false;
    } else {
      document.getElementById(`trays-error-${idx}`).style.display = "none";
    }
    if (additional === "" || parseInt(additional) < 0) {
      document.getElementById(`additional_${idx}`).value = 0;
    }
  });

  return valid;
}

// ─────────────────────────────────────────────
// Submit Order
// ─────────────────────────────────────────────
window.submitOrder = async function () {
  if (!validateCustomerInfo()) {
    document.getElementById("customer_name").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (!validateOrderItems()) {
    document.getElementById("order-items-container").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const container = document.getElementById("order-items-container");
  const itemEls = container.querySelectorAll(".order-item-block");
  const items = [];

  itemEls.forEach((item) => {
    const idx = item.getAttribute("data-index");
    items.push({
      egg_type: document.getElementById(`egg_type_${idx}`).value,
      trays: document.getElementById(`trays_${idx}`).value,
      additional_eggs: document.getElementById(`additional_${idx}`).value || 0,
    });
  });

  const payload = {
    customer_name: document.getElementById("customer_name").value.trim(),
    block_name: document.getElementById("block_name").value,
    room_number: document.getElementById("room_number").value.trim(),
    mobile_number: document.getElementById("mobile_number").value.trim(),
    items,
  };

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Placing Order…`;

  try {
    const res = await fetch("/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = `/order/success/${data.order_id}`;
    } else {
      throw new Error("Server error");
    }
  } catch (e) {
    btn.disabled = false;
    btn.innerHTML = "🚀 Place Order";
    showToast("Failed to place order. Please try again.", "error");
  }
};

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
function showToast(msg, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "toastOut 0.4s ease forwards";
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ─────────────────────────────────────────────
// Init Order Page
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("order-items-container");
  if (container && container.children.length === 0) {
    container.appendChild(createOrderItem(1));
  }

  // Real-time validation
  ["customer_name", "room_number", "mobile_number"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => clearError(id));
  });

  const blockEl = document.getElementById("block_name");
  if (blockEl) blockEl.addEventListener("change", () => clearError("block_name"));
});
