🎁 SocialWishlist

**SocialWishlist** is a mobile-first social gifting platform that keeps the surprise alive — a wishlist owner can track funding progress in real time **without ever seeing who contributed**.


---

## ✨ Product highlights

- ⚡ **Real-time updates (FastAPI + Socket.IO + React)**  
  Contributions/reservations instantly update every connected client (room-based broadcasting per wishlist).
- 🕶️ **“Blind‑Surprise” privacy model**  
  The wishlist owner sees item status and progress, but **never** contributor identities or per-user amounts.
- 📱 **Mobile-first, responsive UI**  
  Touch-friendly controls, modern transitions (fade/slide/scale), and a custom **Purple/Violet** palette.
- 🔗 **Smart item add via scraping**  
  Paste a product URL → metadata extraction via **OpenGraph + JSON‑LD** (with fallbacks for real-world sites).
- 💜 **Group funding + progress bars**  
  Partial funding, fully funded states, and reservation flows with clean edge-case handling.
- 🔐 **Google OAuth 2.0 + JWT sessions**  
  Google Sign-In via token verification, plus JWT session cookie for API authentication.

---

## 🧱 Architecture overview

### Backend (FastAPI)

- **Async-first**: FastAPI + SQLAlchemy Async + asyncpg.
- **Migrations**: Alembic runs on startup (`upgrade head`) with a safe fallback to `create_all` for local bootstrapping.
- **Real-time**: Socket.IO ASGI server + wishlist rooms (e.g. `wishlist_<id>`) and `item_updated` events.
- **Privacy boundaries (Blind‑Surprise)**:
  - Public wishlist endpoint returns **wishlist + items + aggregated funding** (total + contributor_count), not identities.
  - Contribution endpoints are **per authenticated user** (`/mine`) and updates broadcast only aggregated totals.
- **Scraping service**: `/api/scrape` fetches HTML and extracts title/image/price using OG tags + JSON‑LD + pragmatic fallbacks.

### Frontend (Next.js)

- **Next.js App Router** with TypeScript + React.
- **Socket.IO client** with a reliability-first strategy:
  - `transports: ["polling", "websocket"]` to survive restrictive hosting, then upgrade.
  - automatic room rejoin on reconnect for consistent real-time UX.
- **UI system**: Tailwind CSS v4 theme tokens + reusable components (cards, modals, toasts, skeletons, progress bars).

---

## 🧰 Tech stack

### Frontend

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS v4** (custom theme tokens + motion utilities)
- **Socket.IO client** for real-time events

### Backend

- **FastAPI** (Python)
- **PostgreSQL** (Docker image: `postgres:16-alpine`)
- **SQLAlchemy 2 (Async)** + **asyncpg**
- **Alembic** for schema migrations
- **python-socketio** (ASGI mode) for real-time broadcasting
- **httpx** + **BeautifulSoup4** for scraping (OG tags / JSON-LD)

### DevOps

- **Docker** + **Docker Compose**
- Environment-driven configuration (`.env`, `.env.example`)

---

## 📱 Mobile excellence

SocialWishlist is intentionally optimized for mobile usage patterns:

- ✅ **Touch targets & ergonomics**: primary actions are large, full-width buttons with comfortable spacing.
- ✅ **Responsive layout**: components scale from small screens upward with a card-based layout that avoids overflow and tiny hit areas.
- ✅ **Perceived performance**: skeleton loaders + optimistic UI patterns reduce “blank screen” time.
- ✅ **Motion & feedback**: subtle fade/slide/scale transitions and toast feedback provide clarity without visual noise.
- ✅ **Mobile-safe networking**: Socket.IO uses polling fallback and reconnection strategies to handle unstable cellular networks.

---

## 🚀 Quickstart (Docker Compose)

### Prerequisites

- Docker + Docker Compose installed

### 1) Configure environment

Create a `.env` file at the repository root (or export env vars in your shell). Minimum recommended:

```bash
# Database
POSTGRES_PASSWORD=changeme

# Backend
JWT_SECRET=change-this-in-production
CORS_ORIGINS=http://localhost:3000

# Frontend build/runtime (Docker Compose defaults are already OK)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:8000

# Optional: Google OAuth (recommended for full feature set)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 2) Start the stack

```bash
docker-compose up --build
```

### 3) Open the app

- **Frontend**: `http://localhost:3000`
- **Backend health**: `http://localhost:8000/api/health`

---

## 🧪 Core user flows

- 🎯 **Owner**
  - Create wishlists, add items (manual or via scraping), share public link, track overall progress.
  - Sees **funding progress only** — never contributor details.
- 🤝 **Contributor**
  - Open public wishlist link, sign in, reserve or contribute to items.
  - Can view and edit **their own** contribution.

---

## 🗂️ Project structure

```text
.
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── websocket/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── lib/
│   ├── public/
│   ├── Dockerfile
│   ├── next.config.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🔐 Security & privacy notes

- 🍪 **Session security**: JWT is issued server-side and stored as an **HTTP-only** cookie by default.
- 🧩 **Principle of least privilege**: owner-only routes require authentication; public routes are intentionally scoped to non-sensitive data.
- 🕶️ **Blind‑Surprise enforcement**: public wishlist responses only expose aggregated funding, never identities or per-user breakdowns.

---

## 👤 Author

**benus-code** — Master 2 Student & Junior IT Professional.
