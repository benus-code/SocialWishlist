🎁 SocialWishlist
The social gifting platform that keeps the surprise alive.

Developed as a technical test for Robert. This is a production-ready application focusing on real-time interactions, clean UX, and strict privacy logic.

🌟 Vision & Logic
SocialWishlist solves the "duplicate gift" problem while ensuring the creator never knows who bought what.

The "Blind-Surprise" Protocol: The wishlist owner can see the progress of their items but never the identity of the contributors or individual amounts (unless explicitly revealed).

Real-Time Synergy: Every reservation or contribution is broadcasted instantly to all users via WebSockets—no refreshing needed.

Frictionless Sharing: Friends can contribute or reserve items via a public link without needing an account.

🛠️ Technical Stack
Frontend: Next.js 14 (App Router), Tailwind CSS, Lucide Icons, Shadcn/UI.

Backend: FastAPI (Python), PostgreSQL, SQLAlchemy (Async), Alembic.

Real-Time: Native WebSockets with broadcast logic.

Auth: Google OAuth & JWT-based session management.

DevOps: Docker Compose, GitHub Actions.

✅ Implementation Status
Phase 1 - Core & Tech
[x] Auth: Full Google Sign-In integration.

[x] Smart Add: Automatic item metadata scraping (OpenGraph, JSON-LD) via URL.

[x] Infrastructure: Complete Dockerization for easy local setup.

[x] Real-Time: WebSocket implementation with a polling fallback for stability.

Phase 2 - UX & Design (Custom UI)
[x] Branding: Custom "Vibe" palette (Deep Violet/Purple).

[x] Feedback: Toast notifications for all actions and Skeleton loaders for data fetching.

[x] Social: Built-in sharing tools for WhatsApp, Telegram, and Email.

[x] Animations: Smooth transitions (scale, fade, slide) using CSS and Tailwind.

Phase 3 - Advanced Business Logic
[x] Crowdfunding: Dynamic progress bars for high-value items.

[x] Edge Case Management: Handling expired wishlists, contribution withdrawals, and item deletion warnings.

[x] Data Integrity: Async migrations managed via Alembic.


🚀 Getting Started
Local Development
Clone the repo:

Bash
git clone -b dev https://github.com/yourusername/social-wishlist.git
cd social-wishlist



Setup Environment:
Create a .env file in the root (refer to .env.example).

Run with Docker:

Bash
docker-compose up --build
The app will be available at localhost:3000 (Front) and localhost:8000 (Back)





📂 Project Structure
Plaintext
├── frontend/          # Next.js Application
├── backend/           # FastAPI Application
│   ├── alembic/       # Database migrations
│   ├── models/        # SQLAlchemy Schemas
│   ├── routes/        # API Endpoints
│   └── main.py        # WebSocket & App Entry point
├── docker-compose.yml
└── README.md




👤 Author
Mbong joseph lustigier (benus-code) Master 2 Student in Software for Automated Systems & Junior IT Professional. Specialized in System Administration, Network Security, and AI-driven automation.
