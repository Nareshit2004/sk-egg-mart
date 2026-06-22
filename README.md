# SK EGG MART 🥚

**Wholesale Eggs • Home Delivery Available**

A production-ready Progressive Web App (PWA) for egg ordering and delivery management.

---

## 🚀 Quick Start

### 1. Install Python Dependencies
```bash
cd sk-egg-mart
pip install -r requirements.txt
```

### 2. Run the App
```bash
python app.py
```

### 3. Open in Browser
- **Customer Portal:** http://localhost:5000
- **Admin Portal:**    http://localhost:5000/admin

### 4. Default Admin Login
```
Username: admin
Password: skegg@2024
```

> ⚠️ Change the admin password before going live!

---

## 📁 Project Structure

```
sk-egg-mart/
├── app.py                        # Flask application (all routes + models)
├── requirements.txt              # Python dependencies
│
├── static/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker (offline support)
│   ├── icons/
│   │   ├── icon-192.png          # PWA icon (192×192)
│   │   └── icon-512.png          # PWA icon (512×512)
│   ├── css/
│   │   └── style.css             # Custom CSS (glassmorphism, animations)
│   └── js/
│       ├── customer.js           # Customer portal logic
│       ├── admin.js              # Admin dashboard logic
│       └── pwa.js                # PWA install + Service Worker registration
│
├── templates/
│   ├── base.html                 # Base template (Tailwind, GSAP, PWA meta)
│   ├── index.html                # Customer landing page
│   ├── order.html                # Customer order form
│   ├── order_success.html        # Success page + WhatsApp
│   └── admin/
│       ├── login.html            # Admin login
│       ├── base_admin.html       # Admin layout (sidebar + topbar)
│       ├── dashboard.html        # Stats dashboard
│       ├── orders.html           # Live orders table
│       ├── order_detail.html     # Single order view
│       └── history.html          # Order history
│
└── database/
    └── sk_egg_mart.db            # SQLite DB (auto-created on first run)
```

---

## 🌟 Features

### Customer Portal
- ✅ Mobile-first landing page with animations
- ✅ Multi-item order form (add unlimited egg orders)
- ✅ White Egg & Country/Brown Egg selection cards
- ✅ Live order summary with automatic egg count
- ✅ Order success page with confetti animation
- ✅ WhatsApp Click-to-Chat confirmation (free, no API)
- ✅ Call Shop button

### Admin Portal
- ✅ Secure login (session-based)
- ✅ Dashboard with 8 real-time stats cards
- ✅ Live orders table (auto-refresh every 15 seconds)
- ✅ Search & filter (by name, mobile, order ID, block, date, status)
- ✅ Order status management (Pending → Preparing → Out For Delivery → Delivered)
- ✅ New order sound alerts (Web Audio API — no file needed)
- ✅ Toast notifications
- ✅ Order history (Today / Yesterday / Last 7 / Last 10 days)
- ✅ Excel export (.xlsx) with styled headers
- ✅ WhatsApp & Call buttons per order
- ✅ Mobile-responsive sidebar

### Technical
- ✅ PWA (installable on Android/iPhone home screen)
- ✅ Service Worker with offline caching
- ✅ Auto daily reset at midnight (APScheduler)
- ✅ SQLite database (zero-config)
- ✅ GSAP animations on landing + success pages
- ✅ Glassmorphism UI components
- ✅ Dark-themed admin sidebar

---

## 📱 WhatsApp Integration

Uses free WhatsApp Click-to-Chat — **no API key or business account required**.

Format sent to **9445379128**:
```
Hello SK EGG MART,

Order ID: SKEGG-20260621-001

Customer Name: John Doe
Block: Block A
Room Number: 101
Mobile Number: 9876543210

Order Details:
White Egg - 2 Trays - 5 Eggs
Brown Egg - 1 Tray - 10 Eggs

Total Trays: 3
Total Eggs: 105

Please confirm my order. 🙏
```

---

## 🔐 Security Notes

1. **Change admin password** — edit `init_db()` in `app.py`
2. **Change SECRET_KEY** — replace `skegg-secret-2024-xK9p` with a strong random key
3. **Remove the credentials hint** from `admin/login.html` before production

---

## 📊 Order ID Format

```
SKEGG-YYYYMMDD-NNN
Example: SKEGG-20260621-001
```
Auto-increments sequentially per day, resets the next day.

---

## 🔄 Auto Daily Reset

APScheduler runs at **12:00 AM** daily to:
- Archive yesterday's stats into `DailySummary` table
- Dashboard shows fresh counts for the new day
- Historical data remains accessible in Order History

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| Flask | Web framework |
| Flask-SQLAlchemy | Database ORM |
| openpyxl | Excel export |
| APScheduler | Auto daily reset |
| Werkzeug | Password hashing |

---

## 🛠️ Customization

### Change Admin Password
In `app.py`, find `init_db()` and change:
```python
password_hash=generate_password_hash("YOUR_NEW_PASSWORD")
```

### Change Shop Phone Number
Search for `9445379128` in all files and replace with your number.

### Add More Blocks
In `order.html` and `orders.html`, the block list is generated from:
```python
['A','B','C','D','E','F','G','H','I','J','K','L']
```

---

*Built with ❤️ for SK EGG MART*
