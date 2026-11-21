# PackCraft — 3D Packaging Customization, Dynamic Cost Estimation & Order Management Platform

**PackCraft** is an industrial-grade full-stack web platform where direct-to-consumer (D2C) brands, retailers, and packaging manufacturers design packaging, customize dimensions and materials with real-time 3D parametric visualization, compute authoritative manufacturing cost estimates, request formal quotations, and track production floor fulfillment.

---

## 🌟 Key Highlights & Capabilities

### 1. Interactive 3D Packaging Studio (Three.js & React Three Fiber)
- **Six Distinct Parametric Packaging Structures**:
  - **Roll-End Tuck Front (RETF) Mailer Box**: E-commerce self-locking mailer with double-wall rollover crush resistance, front tuck flaps, dust wings, and interactive lid open/close animation.
  - **Straight Tuck-End Folding Carton**: High-definition paperboard retail carton with tuck flaps, dust flaps, and optional acetate window cutouts.
  - **Luxury 2-Piece Rigid Setup Box**: Heavyweight 1.8mm greyboard core with wrapped paper finish, distinct base tray, and lift-off lid.
  - **Regular Slotted Container (RSC) Shipping Carton**: Heavy industrial corrugated master transit shipper with center-meeting top/bottom flaps and packaging tape strip.
  - **Gusseted Kraft Boutique Shopping Bag**: Recycled paper bag with side gusset creases, block bottom, and twisted paper/cotton cord handles.
  - **Slide Product Sleeve (Belly Band)**: Open-ended sliding band engineered to wrap around stock containers.
- **Real-Time Parametric Mesh Scaling**: Length, Width, and Height sliders with physical millimetric bounds validation.
- **Dynamic 3D Canvas Branding**: Generates custom artwork and brand wordmarks directly mapped onto the 3D packaging geometry with custom ink colors and patterns (dots, grid, stripes).
- **Studio Controls**: OrbitControls, camera view presets (Perspective, Front, Top, Side, Interior), interactive lid inspection slider, wireframe mode, and 360° spin.

### 2. Authoritative Dynamic Cost Estimation Engine
- **Server-Side Mathematical Precision**: Calculates true physical unfolded blank surface area ($m^2$) based on packaging folds, tucks, glue seams, and flute calipers.
- **Substrate & Caliper Multipliers**: Accounts for board GSM and flute grades (E-Flute, B-Flute, SBS Paperboard, Rigid Greyboard).
- **Printing & Finishing Rates**: Full-color CMYK passes, single-color flexo/screen, matte, gloss UV, soft-touch velvet, and spot foil.
- **Tooling Amortization**: Fixed machine die-cutting plate setups amortized across ordered run quantity.
- **Volume Tier Economies of Scale**:
  - Pilot Run (50 - 249 units): Standard baseline
  - Small Batch (250 - 499 units): 12% Volume Discount
  - Mid Batch (500 - 999 units): 24% Volume Discount
  - Standard Production (1,000 - 2,499 units): 36% Volume Discount
  - High Volume (2,500 - 9,999 units): 48% Volume Discount
  - Enterprise Bulk (10,000+ units): 60% Volume Discount
- **Transparent Cost Breakdown**: Surface area, unit material cost, unit print cost, finishing cost, tooling setup per unit, subtotal, 5% manufacturing tax, and estimated ground freight.

### 3. Customer Library & Quotation Lifecycle
- **Persistent Saved Designs**: Store 3D configurations, artwork parameters, and pricing snapshots in MongoDB.
- **Formal Quotation System**:
  - Generates unique quotation references (e.g., `PC-QT-2026-01001`).
  - Immutable pricing and configuration snapshot preserving price integrity.
  - **Downloadable PDF Quotations**: Built with `jspdf` and `jspdf-autotable` featuring professional industrial layouts, spec tables, cost line items, and manufacturing terms.
  - Lifecycle: `requested` → `under_review` → `quotation_prepared` → `sent` → `accepted` / `revision_requested` / `declined`.

### 4. Order Management & Plant Floor Fulfillment Tracking
- **Order Placement**: Authorized purchase orders created directly from accepted quotations.
- **Interactive Visual Production Stepper**:
  `Order Placed` → `Confirmed` → `Artwork Approved` → `Plant Scheduled` → `In Production` → `Quality Check` → `Dispatched` → `Delivered`.
- **Order Activity Audit Log**: Every stage change records actor details, timestamp, previous status, new status, and plant notes into `OrderActivity`.
- **Carrier Dispatch Tracking**: Carrier name and tracking number linked directly in the tracking dashboard.

### 5. Protected Administrative Console
- **Live Metrics Dashboard**: Real-time aggregation of total products, active designs, quotation requests, orders in production, and confirmed revenue.
- **Quotation Review**: Adjust authorized prices, set custom discounts or surcharges, modify freight estimates, and add internal engineer notes.
- **Production Stage Controls**: Transition order statuses across plant floor stages with automated audit logging.
- **Pricing Rule Engine**: Modify base die-cut tooling setups, print rates per $m^2$, finishing rates, waste allowance %, and volume discount tiers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Framer Motion, Zustand, Axios, Lucide React, Canvas Confetti, jsPDF |
| **Backend** | Node.js (ES Modules), Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), bcryptjs, Multer, Morgan |
| **Styling** | Custom Industrial Aesthetic: Natural kraft paper palettes (`#faf7f2`, `#f4ece1`, `#c89d6c`), charcoal blacks (`#18191b`), subtle borders, typography (Plus Jakarta Sans, Outfit, JetBrains Mono) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `localhost:27017` (or remote MongoDB connection string)

### 1. Installation
Clone repository and install dependencies in both client and server:

```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Create or verify `.env` in `server/.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/packcraft
JWT_SECRET=packcraft_super_secret_jwt_key_2026_industrial_packaging
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Database Seeding
Populate the database with certified materials, 6 packaging products, global pricing rules, and demo accounts:

```bash
cd server
npm run seed
```

### 4. Running the Platform
Run backend and frontend servers:

```bash
# Terminal 1: Start Express API server (port 5001)
cd server
npm start

# Terminal 2: Start Vite Client (port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🔑 Demo Accounts & Quick Logins

The login screen provides **one-click demo sign-in buttons** for instant evaluation:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Customer** | `elena@luminarybotanicals.com` | `customer123` | Customize in 3D, save designs, request quotes, accept quotes, place orders, track shipments |
| **Administrator** | `admin@packcraft.com` | `admin123` | Full dashboard access, quotation reviews & adjustments, order stage transitions, pricing rules |

---

## 🧪 Verified Workflows

The following automated full-stack tests were executed against the live API and MongoDB instance:
- **Authentication**: JWT token generation and role verification for Customer and Admin.
- **Pricing Calculation**: Server-side physical surface area calculations and bounds validation.
- **Design Persistence**: Save, duplicate, update, and retrieve customer designs.
- **Quotation Workflow**: Submit request → Admin review → Customer acceptance → Immutable pricing snapshot.
- **Order Lifecycle**: Quotation acceptance conversion → Order creation → Status transition (`in_production`, `dispatched`) → Activity history audit trail.
- **PDF Generation**: Client-side jsPDF quotation generation with specification tables and terms.
