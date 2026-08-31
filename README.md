# 🧺 Cloth Bank Management System

A web-based platform for NGOs/INGOs to manage clothing donation campaigns.

---

## 🗂 Project Structure

```
cloth-bank/
├── backend/     Laravel 10 API (PHP 8.2, Passport, MySQL)
└── frontend/    Vue 2 SPA (Vue Router, Axios)
```

---

## ⚙️ Backend Setup (Laravel)

### 1. Install dependencies

```bash
cd backend
composer install
```

### 2. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set:
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `MAIL_USERNAME`, `MAIL_PASSWORD` (Gmail App Password)

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate for "Mail"

### 3. Run migrations and seed

```bash
php artisan migrate --seed
```

This creates:
- **Admin**: admin@clothbank.com / password
- **Agent**: agent@clothbank.com / password
- Sample campaign: *Winter Cloth Drive 2024*

### 4. Install Passport

```bash
php artisan passport:install
```

### 5. Start the server

```bash
php artisan serve
# Runs on http://localhost:8000
```

---

## 🖥 Frontend Setup (Vue 2)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VUE_APP_API_URL=http://localhost:8000/api
```

### 3. Add Google Maps API Key

In `public/index.html`, replace `YOUR_GOOGLE_MAPS_API_KEY` with your key.

Get one at: https://console.cloud.google.com → Enable **Maps JavaScript API**

### 4. Start dev server

```bash
npm run serve
# Runs on http://localhost:8080
```

---

## 🔗 API Endpoints

### Public (No Auth)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/login` | Login |
| GET | `/api/campaigns/active` | List active campaigns |
| GET | `/api/campaigns/{id}` | Campaign detail |
| POST | `/api/donations` | Submit donation |

### Admin (Bearer Token + role=admin)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/dashboard` | Dashboard stats |
| GET/POST | `/api/campaigns` | List / Create |
| PUT/DELETE | `/api/campaigns/{id}` | Update / Delete |
| GET | `/api/donations` | List (filterable) |
| GET | `/api/donations/{id}` | Detail |
| PATCH | `/api/donations/{id}/assign` | Assign agent |
| PATCH | `/api/donations/{id}/verify` | Verify + send email |
| GET/POST | `/api/users` | List / Create |
| PUT/DELETE | `/api/users/{id}` | Update / Delete |
| GET | `/api/users/agents` | List agents |

### Agent (Bearer Token + role=agent)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/agent/pickups` | My assigned pickups |
| PATCH | `/api/donations/{id}/pickup` | Mark picked up |
| PATCH | `/api/donations/{id}/deliver` | Mark delivered |

---

## 🔄 Donation Status Flow

```
Pending → Assigned → Picked Up → Delivered → Verified
```

| Status | Who Sets It |
|--------|------------|
| `pending` | Auto on submission |
| `assigned` | Admin assigns agent |
| `picked_up` | Agent confirms pickup |
| `delivered` | Agent confirms delivery |
| `verified` | Admin verifies + triggers email |

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full system access, campaign/user management, verification |
| **Agent** | View & update own assigned pickups only |
| **Public** | Submit donations (no login required) |

---

## 📧 Email

A "Thank You" email is sent automatically when an admin verifies a donation.  
Template: `backend/resources/views/emails/thank_you.blade.php`

---

## 🗃 Database Tables

| Table | Description |
|-------|-------------|
| `users` | Admin & Agent accounts |
| `campaigns` | Donation campaigns |
| `donations` | Donor submissions with full status tracking |
| `oauth_*` | Laravel Passport token tables |

---

## 🏗 Architecture

### Backend — Repository Pattern
```
Controller → Repository Interface → Repository → Eloquent Model
```
- `app/Repositories/Interfaces/` — Contracts
- `app/Repositories/` — Implementations
- Bindings in `AppServiceProvider`

### Frontend — Service Layer
```
Vue Component → API Service (axios) → Laravel API
```
- `src/api/` — One file per resource
- `src/views/` — Pages
- `src/layouts/` — Admin & Agent shells
- `src/router/` — Route guards by role
