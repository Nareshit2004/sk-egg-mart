/* ─────────────────────────────────────────────
   SK EGG MART — Customer Portal JavaScript
   (with live pricing & billing summary)
   ───────────────────────────────────────────── */

let orderItems = [];
let orderCount = 1;

// Live pricing (fetched from server)
let PRICES = { white_egg_price: 6, brown_egg_price: 8, delivery_charge: 20 };

// ─────────────────────────────────────────────
// Fetch current prices from admin settings
// ─────────────────────────────────────────────
async function fetchPricing() {
  try {
    const res  = await fetch("/api/pricing");
    const data = await res.json();
    PRICES = data;
    // Re-render price labels on all existing egg cards
    document.querySelectorAll("[data-price-white]").forEach(el => {
      el.textContent = `₹${data.white_egg_price} per Egg`;
    });
    document.querySelectorAll("[data-price-brown]").forEach(el => {
      el.textContent = `₹${data.brown_egg_price} per Egg`;
    });
    updateSummary();
  } catch (e) {
    console.warn("Could not fetch pricing, using defaults.");
  }
}

// ─────────────────────────────────────────────
// Utility: Show / Clear Field Error
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
  const name   = document.getElementById("customer_name").value.trim();
  const block  = document.getElementById("block_name").value;
  const room   = document.getElementById("room_number").value.trim();
  const mobile = document.getElementById("mobile_number").value.trim();

  if (!name)   { showError("customer_name", "Name is required"); valid = false; }
  else           clearError("customer_name");
  if (!block)  { showError("block_name", "Please select a block"); valid = false; }
  else           clearError("block_name");
  if (!room || !/^\d+$/.test(room)) { showError("room_number", "Valid room number required"); valid = false; }
  else           clearError("room_number");
  if (!mobile || !/^\d{10}$/.test(mobile)) { showError("mobile_number", "Enter valid 10-digit mobile"); valid = false; }
  else           clearError("mobile_number");

  return valid;
}

// ─────────────────────────────────────────────
// Create Order Item Block (with price labels)
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

    <!-- Egg Type Selection with Price -->
    <div style="margin-bottom:16px;">
      <label class="form-label">Egg Type <span style="color:#EF4444">*</span></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

        <!-- White Egg Card -->
        <div class="egg-card" id="card-white-${index}" onclick="selectEggType(${index}, 'White Egg')">
          <div class="egg-check">✓</div>
          <span class="egg-icon">🥚</span>
          <div class="egg-name">White Egg</div>
          <div style="font-size:0.72rem;color:#6B7280;margin-top:2px;">Farm Fresh</div>
          <div data-price-white style="font-size:0.8rem;font-weight:700;color:#D97706;margin-top:4px;background:rgba(245,158,11,0.1);border-radius:6px;padding:2px 6px;">
            ₹${PRICES.white_egg_price} per Egg
          </div>
        </div>

        <!-- Brown Egg Card -->
        <div class="egg-card" id="card-brown-${index}" onclick="selectEggType(${index}, 'Country/Brown Egg')">
          <div class="egg-check">✓</div>
          <span class="egg-icon">🟤</span>
          <div class="egg-name">Country/Brown Egg</div>
          <div style="font-size:0.72rem;color:#6B7280;margin-top:2px;">Desi Egg</div>
          <div data-price-brown style="font-size:0.8rem;font-weight:700;color:#92400E;margin-top:4px;background:rgba(146,64,14,0.1);border-radius:6px;padding:2px 6px;">
            ₹${PRICES.brown_egg_price} per Egg
          </div>
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
    <div style="margin-bottom:8px;">
      <label class="form-label" for="additional_${index}">Additional Eggs</label>
      <input type="number" class="form-input" id="additional_${index}" min="0" value="0"
        placeholder="0" oninput="updateSummary()" style="max-width:160px;">
      <div style="font-size:0.78rem;color:#6B7280;margin-top:4px;">Enter 0 if no extra eggs needed</div>
    </div>

    <!-- Item Cost Display -->
    <div id="item-cost-${index}"
      style="display:none;background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(234,88,12,0.05));
             border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:10px 14px;margin-top:8px;
             font-size:0.85rem;color:#92400E;font-weight:600;text-align:center;">
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
  const card = document.getElementById(cardId);
  card.style.transform = "scale(1.05)";
  setTimeout(() => card.style.transform = "", 300);
}

function removeOrderItem(index) {
  const el = document.getElementById(`order-item-${index}`);
  if (el) {
    el.style.animation = "slideInUp 0.3s ease reverse";
    setTimeout(() => { el.remove(); updateSummary(); }, 280);
  }
}

window.addOrderItem = function () {
  orderCount++;
  const container = document.getElementById("order-items-container");
  const newItem   = createOrderItem(orderCount);
  container.appendChild(newItem);
  setTimeout(() => newItem.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  updateSummary();
};

// ─────────────────────────────────────────────
// Live Summary Calculation (with pricing)
// ─────────────────────────────────────────────
function updateSummary() {
  const container = document.getElementById("order-items-container");
  const items     = container.querySelectorAll(".order-item-block");
  let totalTrays  = 0;
  let totalEggs   = 0;
  let subtotal    = 0;
  let summaryRows = "";

  items.forEach((item) => {
    const idx       = item.getAttribute("data-index");
    const eggType   = document.getElementById(`egg_type_${idx}`)?.value || "";
    const trays     = parseInt(document.getElementById(`trays_${idx}`)?.value || "0") || 0;
    const additional= parseInt(document.getElementById(`additional_${idx}`)?.value || "0") || 0;
    const eggs      = trays * 30 + additional;
    const priceEach = eggType === "White Egg" ? PRICES.white_egg_price : PRICES.brown_egg_price;
    const cost      = eggs * priceEach;

    totalTrays += trays;
    totalEggs  += eggs;

    // Show per-item cost below the fields
    const costEl = document.getElementById(`item-cost-${idx}`);
    if (costEl) {
      if (eggType && eggs > 0) {
        costEl.style.display = "block";
        costEl.innerHTML = `🥚 ${eggs} Eggs × ₹${priceEach} = <strong style="color:#D97706;font-size:1rem;">₹${cost.toFixed(2)}</strong>`;
        subtotal += cost;
      } else {
        costEl.style.display = "none";
      }
    }

    if (eggType || trays > 0) {
      summaryRows += `
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:10px 0;border-bottom:1px solid rgba(245,158,11,0.15);">
          <div>
            <div style="font-weight:600;font-size:0.88rem;">${eggType || "—"}</div>
            <div style="font-size:0.78rem;color:#9CA3AF;">${eggs} eggs × ₹${priceEach}</div>
          </div>
          <div style="font-weight:800;color:#D97706;font-size:0.95rem;">₹${cost.toFixed(2)}</div>
        </div>`;
    }
  });

  const deliveryCharge = PRICES.delivery_charge;
  const grandTotal     = subtotal + deliveryCharge;

  // Update summary section
  const summaryEl    = document.getElementById("order-summary-items");
  const traysEl      = document.getElementById("summary-total-trays");
  const eggsEl       = document.getElementById("summary-total-eggs");
  const subtotalEl   = document.getElementById("summary-subtotal");
  const deliveryEl   = document.getElementById("summary-delivery");
  const grandTotalEl = document.getElementById("summary-grand-total");

  if (summaryEl) {
    summaryEl.innerHTML = summaryRows ||
      '<span style="color:#9CA3AF;font-size:0.88rem;">Add items above to see price…</span>';
  }
  if (traysEl)      traysEl.textContent = totalTrays;
  if (eggsEl)       eggsEl.textContent  = totalEggs;
  if (subtotalEl)   subtotalEl.textContent  = `₹${subtotal.toFixed(2)}`;
  if (deliveryEl)   deliveryEl.textContent  = `₹${deliveryCharge.toFixed(2)}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;
}

// ─────────────────────────────────────────────
// Validate Order Items
// ─────────────────────────────────────────────
function validateOrderItems() {
  const container = document.getElementById("order-items-container");
  const items     = container.querySelectorAll(".order-item-block");
  let valid       = true;

  items.forEach((item) => {
    const idx        = item.getAttribute("data-index");
    const eggType    = document.getElementById(`egg_type_${idx}`)?.value;
    const trays      = document.getElementById(`trays_${idx}`)?.value;
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
  const itemEls   = container.querySelectorAll(".order-item-block");
  const items     = [];

  itemEls.forEach((item) => {
    const idx = item.getAttribute("data-index");
    items.push({
      egg_type:        document.getElementById(`egg_type_${idx}`).value,
      trays:           document.getElementById(`trays_${idx}`).value,
      additional_eggs: document.getElementById(`additional_${idx}`).value || 0,
    });
  });

  const payload = {
    customer_name: document.getElementById("customer_name").value.trim(),
    block_name:    document.getElementById("block_name").value,
    room_number:   document.getElementById("room_number").value.trim(),
    mobile_number: document.getElementById("mobile_number").value.trim(),
    items,
  };

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Placing Order…`;

  try {
    const res  = await fetch("/order", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
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
// Init
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  // Fetch prices first, then render first item
  await fetchPricing();

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
