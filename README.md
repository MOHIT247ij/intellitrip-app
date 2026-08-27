# IntelliTrip — AI-Driven Travel Planning and Booking Platform

An MCA postgraduate mini project: a full-stack, AI-powered travel planning and booking platform. IntelliTrip generates structured, day-by-day itineraries using **Google Gemini** grounded by a genuine **Retrieval-Augmented Generation (RAG)** pipeline over a real **MySQL** database, and layers on interactive maps, live weather, hidden-gem discovery, group expense splitting, a UPI/payment-gateway architecture, and a multilingual (English/Hindi/Marathi) UI.

> **Honesty note on this build:** every external paid API (Gemini, Google Maps, OpenWeather, booking inventory, payments, SMS/Email OTP delivery) has a clean **provider abstraction** with a **mock/fallback mode**, so the whole application runs and demos correctly with **zero API keys configured**. Add real keys any time to upgrade a feature from demo mode to live mode — see [Mock Mode vs Production](#mock-mode-vs-production) below.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Requirements](#requirements)
6. [Database Setup (MySQL + MySQL Workbench)](#database-setup-mysql--mysql-workbench)
7. [Backend Setup](#backend-setup)
8. [Frontend Setup](#frontend-setup)
9. [Running Everything Together](#running-everything-together)
10. [Environment Variables Explained](#environment-variables-explained)
11. [API Documentation](#api-documentation)
12. [Architecture](#architecture)
13. [RAG Explanation](#rag-explanation)
14. [Mock Mode vs Production](#mock-mode-vs-production)
15. [Demo Credentials](#demo-credentials)
16. [Manual Testing Guide](#manual-testing-guide)
17. [Automated Tests](#automated-tests)
18. [Viva / Technology Explanations](#viva--technology-explanations)
19. [Troubleshooting](#troubleshooting)

---

## Project Overview

IntelliTrip lets a traveller describe a trip — either through a structured form or a plain-language sentence like *"I want a 5-day Goa trip with 4 friends, budget ₹25,000 per person. I like beaches, adventure, local food and less crowded places"* — and receive a validated, structured itinerary with real coordinates, costs, and durations. The itinerary is grounded in **actual MySQL rows** (destinations, tourist places, hidden gems) retrieved before the AI call, not invented by the model. From there, the traveller can view the itinerary on an interactive map synced to a day-by-day timeline, check live weather, ask the AI to re-plan ("make it cheaper", "add hidden places", "adjust for rain"), browse and book demo hotels/flights/cabs/experiences through a UPI-style payment flow, split group expenses, view verified emergency contacts, and export the itinerary as a PDF.

## Features

- JWT authentication with registration, OTP verification (development mode), and login by email or mobile
- AI Planner with both a structured form and natural-language input, backed by Gemini + RAG
- One-tap AI re-planning that edits the existing itinerary instead of regenerating from scratch
- Interactive Google Maps view synced with the itinerary timeline (click an activity → its marker highlights)
- Live weather (OpenWeather) with a graceful "temporarily unavailable" fallback
- Explore page with search, category, budget and hidden-gem filters over real seeded places
- Trips (upcoming/past/saved), PDF export, delete, re-plan
- Hotels / Flights / Cabs / Experiences booking flow with a UPI payment-gateway architecture (mock by default, clearly labeled)
- Group expense management with even or custom splitting and remaining-budget tracking
- Safety page with verified emergency contacts and optional browser-geolocation map
- Multilingual UI (English / Hindi / Marathi) via react-i18next; AI itineraries can be generated in the selected language
- Role-based Admin panel (USER / ADMIN / PARTNER)
- Skeleton loaders, empty states, and friendly error states throughout

## Technology Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React, Framer Motion, React Hook Form, Zod, i18next / react-i18next, Recharts

**Backend:** Node.js, Express.js, Prisma ORM, MySQL 8, JWT, bcryptjs, Zod, Axios, CORS, Helmet, express-rate-limit, dotenv, pdfkit

**AI:** Google Gemini API (`@google/generative-ai`) with a deterministic RAG-grounded fallback generator when no API key is configured

**Database:** MySQL 8, inspectable/importable via MySQL Workbench

## Project Structure

```
IntelliTrip/
├── README.md, .gitignore, LICENSE, package.json (root convenience scripts)
├── database/
│   ├── schema.sql          # Plain-SQL mirror of the Prisma schema (for Workbench)
│   └── seed.sql            # Reference destinations/places/emergency contacts
├── frontend/                # React + Vite + Tailwind SPA
│   └── src/{components,pages,layouts,hooks,services,context,utils,i18n}
└── backend/                  # Node + Express + Prisma API
    └── src/{config,controllers,routes,services,middleware,validators,utils,ai,rag,integrations}
```

## Requirements

- **Node.js** 18+ and npm — https://nodejs.org
- **MySQL 8+** — https://dev.mysql.com/downloads/mysql/
- **MySQL Workbench** — https://dev.mysql.com/downloads/workbench/
- **VS Code** (recommended) — https://code.visualstudio.com

## Database Setup (MySQL + MySQL Workbench)

1. Open **MySQL Workbench** and connect to your local MySQL 8 server.
2. Create the database (Prisma will actually create/manage tables for you via migration — this step just creates the empty schema):
   ```sql
   CREATE DATABASE intellitrip;
   ```
   Alternatively, run the whole `database/schema.sql` file in Workbench to create every table by hand — useful for inspecting the design without touching Node at all.
3. Note your MySQL username/password (default user is often `root`).

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and set at minimum:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/intellitrip"
JWT_SECRET="some-long-random-string"
```

Then run:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

- `prisma generate` builds the type-safe Prisma Client from `prisma/schema.prisma`.
- `prisma migrate dev` creates every table in MySQL to match the schema (check MySQL Workbench afterwards — the tables will be there).
- `prisma db seed` runs `prisma/seed.js`, populating destinations, places, emergency contacts and a demo account.
- `npm run dev` starts the API on **http://localhost:5000** (nodemon, auto-restarts on changes).

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on **http://localhost:5173** and talks to the backend at the URL in `VITE_API_URL` (default `http://localhost:5000/api`).

## Running Everything Together

From the project root, you can install and run both apps with one command each:

```bash
npm run install:all   # installs backend + frontend dependencies
npm install            # installs the root "concurrently" helper (first time only)
npm run dev             # runs backend (5000) and frontend (5173) together
```

`npm run dev` at the root uses `concurrently` to run both dev servers in one terminal with color-coded output. If you prefer two terminals, use `npm run dev:backend` and `npm run dev:frontend` separately, or just `cd backend && npm run dev` / `cd frontend && npm run dev`.

## Environment Variables Explained

### backend/.env

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string Prisma uses to reach your database |
| `NODE_ENV` | `development` or `production` — affects logging and error verbosity |
| `PORT` | Port the Express API listens on (default 5000) |
| `CLIENT_URL` | Frontend origin allowed by CORS |
| `JWT_SECRET` | Secret used to sign/verify login session tokens — change this |
| `JWT_EXPIRES_IN` | How long a login session lasts (e.g. `7d`) |
| `OTP_DEV_MODE` | When `true`, OTPs are logged to the backend console and returned in the API response instead of sent via SMS/Email — keep `true` for local/college demo |
| `OTP_EXPIRY_MINUTES` | OTP validity window |
| `GEMINI_API_KEY` | Google Gemini key for real AI itinerary generation. Leave blank to use the deterministic RAG fallback generator |
| `GEMINI_MODEL` | Gemini model name (default `gemini-1.5-flash`) |
| `GOOGLE_MAPS_API_KEY` | Not used server-side directly; kept for reference/consistency — the frontend copy is what renders the map |
| `OPENWEATHER_API_KEY` / `WEATHER_PROVIDER` | Real OpenWeather integration; `WEATHER_PROVIDER=mock` (default) uses deterministic demo weather |
| `BOOKING_PROVIDER` | `mock` (default, demo inventory) or `rapidapi` (real hotel/flight search — see [Real Booking Data](#real-booking-data-rapidapi)) |
| `RAPIDAPI_KEY` / `RAPIDAPI_HOTELS_HOST` / `RAPIDAPI_FLIGHTS_HOST` | RapidAPI credentials/hosts used when `BOOKING_PROVIDER=rapidapi` |
| `PAYMENT_PROVIDER` / `PAYMENT_API_KEY` / `UPI_PAYEE_VPA` | `mock` (default) simulates UPI safely; `razorpay` opens a real Razorpay TEST MODE order — see [Real Payments](#real-payments-razorpay-test-mode) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay TEST MODE credentials used when `PAYMENT_PROVIDER=razorpay` |
| `EMAIL_API_KEY` / `SMS_API_KEY` | Legacy/reserved — unused now that `EMAIL_PROVIDER`/`SMS_PROVIDER` below exist |
| `EMAIL_PROVIDER` / `GMAIL_USER` / `GMAIL_APP_PASSWORD` / `EMAIL_FROM_NAME` | `mock` (default) logs OTP emails to console; `gmail` sends real emails — see [Real Email OTP](#real-email-otp-gmail-smtp) |
| `SMS_PROVIDER` / `FAST2SMS_API_KEY` | `mock` (default) logs OTP SMS to console; `fast2sms` sends real SMS — see [Real SMS OTP](#real-sms-otp-fast2sms) |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | API abuse protection |

### frontend/.env

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |
| `VITE_GOOGLE_MAPS_API_KEY` | **Public**, browser-safe key (restrict it by HTTP referrer in Google Cloud Console) that enables the interactive map. Without it, map components show an honest "map unavailable" state instead of faking a map. |

**Never** put `GEMINI_API_KEY`, `PAYMENT_API_KEY`, `DATABASE_URL`, or `JWT_SECRET` in the frontend — anything prefixed `VITE_` is bundled into the public browser JS.

## API Documentation

All responses use a consistent envelope: `{ "success": true, "data": {...} }` or `{ "success": false, "message": "..." }`.

| Method & Path | Description | Auth |
|---|---|---|
| POST `/api/auth/register` | Register a new user, sends OTP | Public |
| POST `/api/auth/verify-otp` | Verify OTP, returns JWT | Public |
| POST `/api/auth/resend-otp` | Resend OTP | Public |
| POST `/api/auth/login` | Login via email or mobile | Public |
| GET `/api/users/me` | Current user + preferences | JWT |
| PUT `/api/users/profile` | Update profile/preferences | JWT |
| GET `/api/destinations` | List destinations | Public |
| GET `/api/destinations/:id` | Destination + places | Public |
| GET `/api/places` | Filterable place search | Public |
| GET `/api/places/:id` | Place detail + reviews | Public |
| POST `/api/ai/plan` | RAG + Gemini itinerary generation, saved as a Trip | JWT |
| POST `/api/ai/replan` | Modify an existing Trip's itinerary | JWT |
| POST `/api/trips` | Create a blank trip | JWT |
| GET `/api/trips` | List my trips | JWT |
| GET `/api/trips/:id` | Trip detail with days/items | JWT |
| PUT `/api/trips/:id` | Update trip | JWT |
| DELETE `/api/trips/:id` | Delete trip | JWT |
| GET `/api/trips/:id/export-pdf` | Download itinerary PDF | JWT |
| GET `/api/weather?city=` | Weather (OpenWeather or mock) | Public |
| GET `/api/hotels?destination=` | Demo hotel inventory | Public |
| GET `/api/flights?destination=&from=` | Demo flight inventory | Public |
| GET `/api/cabs?destination=` | Demo cab inventory | Public |
| GET `/api/experiences?destination=` | Demo experience inventory | Public |
| POST `/api/bookings` | Create a booking | JWT |
| GET `/api/bookings` | List my bookings | JWT |
| POST `/api/payments/create` | Create a payment intent for a booking (mock UPI intent, or a real Razorpay order when `PAYMENT_PROVIDER=razorpay`) | JWT |
| POST `/api/payments/verify` | Verify payment result (simulated in mock mode, real HMAC signature check in Razorpay mode) and confirm the booking | JWT |
| GET `/api/expenses?tripId=` | Trip expense summary + splits | JWT |
| POST `/api/expenses` | Add an expense (even or custom split) | JWT |
| PUT `/api/expenses/:id` | Update an expense | JWT |
| DELETE `/api/expenses/:id` | Delete an expense | JWT |
| GET `/api/safety?city=` | Verified emergency contacts | Public |
| GET `/api/admin/*` | Admin stats/users/bookings/places/trips | JWT (ADMIN) |

## Architecture

```
React (Vite SPA)
   │  Axios, JWT in Authorization header
   ▼
Express REST API  ──── Helmet, CORS, rate limiting, Zod validation
   │
   ├── Prisma ORM ──── MySQL 8  (users, trips, places, bookings, expenses, ...)
   │
   ├── RAG pipeline ── retrieval.service.js → context-builder.js
   │                          │
   │                          ▼
   ├── Gemini AI ─────  itinerary.prompt.js → gemini.service.js → Zod validation (itinerary.schema.js)
   │
   ├── Weather ──────  OpenWeather (real) or Mock provider
   ├── Booking ──────  RapidAPI (real hotels/flights) or Mock provider (cabs/experiences always mock)
   ├── Payment ──────  Razorpay TEST MODE (real order + signature verify) or Mock UPI provider
   ├── Email OTP ────  Gmail SMTP (real, via Nodemailer) or Mock (console log)
   └── SMS OTP ──────  Fast2SMS (real) or Mock (console log)
```

The frontend never talks to Gemini, Maps billing, OpenWeather, or any payment gateway directly — every external call is proxied and validated by the backend, and every secret key lives only in `backend/.env`.

## RAG Explanation

RAG (Retrieval-Augmented Generation) means grounding an LLM's output in real, retrieved data instead of letting it generate purely from memory. IntelliTrip's RAG pipeline (see `backend/src/rag/`) is intentionally simple and honest for a college project — no vector database is needed because our domain data is structured, so we retrieve directly from MySQL:

```
User request (destination, interests, budget, dates)
        │
        ▼
retrieval.service.js — finds the matching Destination row and its
                        Place rows in MySQL, ranked so interest
                        matches and hidden gems surface first
        │
        ▼
context-builder.js — formats those real rows (name, category,
                      coordinates, cost, duration, description) into
                      a compact text block
        │
        ▼
itinerary.prompt.js — embeds that context into the Gemini prompt,
                       instructing the model to build the itinerary
                       FROM these verified places
        │
        ▼
gemini.service.js — sends the prompt to Gemini, gets back JSON text
        │
        ▼
ai.utils.js + itinerary.schema.js — parses and Zod-validates the
                       JSON; retries once on failure; throws a
                       controlled error (never forwarded raw) if
                       still invalid after retry
        │
        ▼
Validated, structured itinerary → saved as a Trip → returned to the UI
```

If no `GEMINI_API_KEY` is configured, `rag.service.js` falls back to `buildDeterministicItinerary`, which assembles a schema-valid itinerary directly from the same retrieved MySQL places — so the AI Planner is always demoable, and the response's `source` field (`"gemini"` vs `"fallback-template"`) tells you honestly which path was used.

## Mock Mode vs Production

| Feature | Mock/Demo mode (default, no keys) | Real provider (configure keys) |
|---|---|---|
| Itinerary generation | Deterministic, RAG-grounded template built from real MySQL places | Google Gemini (`GEMINI_API_KEY`) |
| Interactive map | Honest "map unavailable" panel listing coordinates | Google Maps (`VITE_GOOGLE_MAPS_API_KEY`) |
| Weather | Deterministic demo weather, clearly labeled | OpenWeather (`OPENWEATHER_API_KEY`, `WEATHER_PROVIDER=openweather`) |
| Hotels/Flights | `MockBookingProvider` demo inventory, labeled "Development / Mock Data" | Real search via RapidAPI (`BOOKING_PROVIDER=rapidapi`, `RAPIDAPI_KEY`) — falls back to mock automatically if the external API errors |
| Cabs/Experiences | `MockBookingProvider` demo inventory (always — see [Real Booking Data](#real-booking-data-rapidapi) for why) | Not applicable — intentionally mock-only |
| Payments | `MockPaymentProvider` simulated UPI flow, no real money moves | Real Razorpay **TEST MODE** order + Checkout popup + signature verification (`PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`) — still no real money moves, but a genuine gateway flow |
| Email OTP delivery | Logged to backend console + returned in API response (`OTP_DEV_MODE=true`) | Real email via Gmail SMTP (`EMAIL_PROVIDER=gmail`, `GMAIL_USER`/`GMAIL_APP_PASSWORD`) |
| SMS OTP delivery | Logged to backend console + returned in API response (`OTP_DEV_MODE=true`) | Real SMS via Fast2SMS (`SMS_PROVIDER=fast2sms`, `FAST2SMS_API_KEY`) |

APIs requiring real credentials to go beyond demo mode: **Gemini, Google Maps, OpenWeather, RapidAPI (hotels/flights), Razorpay (payments), Gmail SMTP (email OTP), Fast2SMS (SMS OTP)**. Every real integration above is designed to fail *safely* — if a key is missing or the external call errors, IntelliTrip logs why and falls back to the mock behavior instead of crashing or leaving the user stuck, so the app is always demoable even with zero external accounts configured.

## Real Email OTP (Gmail SMTP)

By default OTPs are only logged to the backend console (`OTP_DEV_MODE=true`). To also send a real email:

1. Use a Gmail account (a throwaway one is fine for a demo).
2. Turn on **2-Step Verification**: https://myaccount.google.com/security
3. Create an **App Password**: https://myaccount.google.com/apppasswords — choose "Mail" / "Other", generate, and copy the 16-character password (this is *not* your normal Gmail password; Gmail blocks plain-password SMTP login).
4. In `backend/.env`:
   ```dotenv
   EMAIL_PROVIDER="gmail"
   GMAIL_USER="youraccount@gmail.com"
   GMAIL_APP_PASSWORD="xxxxxxxxxxxxxxxx"
   ```
5. Restart the backend. Register or log in with an unverified account — a real email with the 6-digit code should arrive within a few seconds.

You can leave `OTP_DEV_MODE=true` at the same time — the OTP will be both emailed for real *and* shown on-screen, which is convenient for a live demo/viva where you don't want to depend on inbox access. Set it to `false` for a production-feeling flow where the code only exists in the email. If Gmail rejects the send (bad app password, 2FA not enabled, account flagged), the error is logged server-side and the request still succeeds — the user just won't receive the email, so check the backend console if a code never arrives.

## Real SMS OTP (Fast2SMS)

1. Create a free account at https://www.fast2sms.com — new accounts get free SMS credits.
2. Go to the **Dev API** tab and copy your API key.
3. In `backend/.env`:
   ```dotenv
   SMS_PROVIDER="fast2sms"
   FAST2SMS_API_KEY="your-key-here"
   ```
4. Restart the backend. Register with a real 10-digit Indian mobile number — the OTP route is designed to work even for DND-registered numbers.

Same fallback behavior as email: a failed SMS send is logged and never blocks registration/login.

## Real Payments (Razorpay Test Mode)

1. Sign up at https://dashboard.razorpay.com/signup (no business verification needed to use Test Mode).
2. In the dashboard, make sure the **Test Mode** toggle (top-right) is ON.
3. Go to **Settings → API Keys** (or https://dashboard.razorpay.com/app/keys) and generate a Test key — copy the **Key Id** and **Key Secret**.
4. In `backend/.env`:
   ```dotenv
   PAYMENT_PROVIDER="razorpay"
   RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
   RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxx"
   ```
5. Restart the backend. Book a hotel/flight/cab and confirm — instead of the "Simulate Success/Failure" buttons, you'll see a **Pay Now via Razorpay** button that opens the real Razorpay Checkout widget (UPI/card/netbanking/wallet tabs). Use Razorpay's published test credentials to complete a payment without any real money moving:
   - **Test UPI id:** `success@razorpay` (always succeeds) or `failure@razorpay` (always fails)
   - **Test card:** `4111 1111 1111 1111`, any future expiry, any CVV, OTP `1234` (or check Razorpay's current test-card docs if these change)
6. On success, the backend independently recomputes the HMAC-SHA256 signature Razorpay returned (never trusting the browser alone) before marking the booking `CONFIRMED`.

If `RAZORPAY_KEY_ID`/`SECRET` are missing or Razorpay's order API is unreachable, `paymentController.js` catches the error and transparently falls back to the mock UPI flow so booking never dead-ends.

## Real Booking Data (RapidAPI)

1. Create a free account at https://rapidapi.com/hub.
2. Subscribe (free tier) to two APIs on the marketplace:
   - **"Booking.com"** (commonly hosted at `booking-com.p.rapidapi.com`) — for hotel search.
   - **"Skyscanner44"** (commonly hosted at `skyscanner44.p.rapidapi.com`) — for flight search.
   RapidAPI occasionally renames/re-hosts listings; if the host differs, override it with `RAPIDAPI_HOTELS_HOST` / `RAPIDAPI_FLIGHTS_HOST`.
3. Copy your `X-RapidAPI-Key` (same key works across every API you subscribe to on your account).
4. In `backend/.env`:
   ```dotenv
   BOOKING_PROVIDER="rapidapi"
   RAPIDAPI_KEY="your-rapidapi-key"
   ```
5. Restart the backend and browse **Hotels**/**Flights** for a destination — results should now be labeled `RapidApiBookingProvider` instead of `MockBookingProvider`.

**Why Cabs and Experiences stay mock-only:** there is no reliable free-tier cab-hailing or local-experiences aggregator API to integrate honestly (real cab booking needs a direct Ola/Uber enterprise partnership, not a public API), so `booking.provider.js` deliberately keeps those two mock in every mode rather than faking a "real" integration that doesn't exist.

**Fallback behavior:** free-tier travel APIs rate-limit aggressively and their response shapes can change without notice. Every real call in `booking.provider.js` is wrapped in a try/catch — on any failure (bad key, no results, rate limit, timeout, unexpected shape) it logs the reason server-side and transparently returns the mock inventory for that request, so the Hotels/Flights pages never show a broken/empty state.

## Demo Credentials

Seeded by `npx prisma db seed`:

- **User:** `demo@intellitrip.app` (or mobile `9876543210`) / password `Demo@1234`
- **Admin:** `admin@intellitrip.app` / password `Demo@1234` (visit `/admin` after logging in)

## Manual Testing Guide

1. Register a new account → note the OTP shown on-screen (dev mode) → verify → you're logged in.
2. Visit **AI Planner** → try both the structured form and the natural-language box → confirm a validated itinerary appears and redirects to `/trips/:id`.
3. On the trip page: switch days, click an activity card and confirm its map marker highlights, check the weather widget, try a re-plan suggestion chip (e.g. "Make it cheaper") and confirm costs update.
4. Export the trip as a PDF.
5. Visit **Explore**, filter by category/hidden gems/search.
6. Visit **Hotels**, book one → walk through Review → Confirm → simulated UPI → Success/Failure.
7. Visit **Expenses** for that trip, add an expense split across a few names, confirm totals and remaining budget.
8. Visit **Safety**, optionally allow location, confirm emergency numbers load.
9. Log in as the admin demo account, visit **/admin**, confirm stats/users/bookings/places/trips load and a booking's status can be changed.
10. Switch the language selector (English/Hindi/Marathi) and confirm the navbar/landing page text changes.

## Automated Tests

```bash
cd backend
npm test
```

Includes: pure-logic tests for expense split math and AI itinerary Zod validation (run anywhere, no DB needed), plus supertest integration tests for registration/login/protected-route behavior (skipped automatically if `DATABASE_URL` isn't set).

## Viva / Technology Explanations

**React** — A component-based JavaScript UI library. IntelliTrip's frontend is a single-page app (Vite-bundled) that communicates with the backend exclusively through REST calls (Axios), never touching the database or AI provider directly.

**Express.js** — A minimal Node.js web framework implementing REST: each resource (trips, bookings, expenses...) gets its own router → controller → service, so an HTTP request flows `route → middleware (auth/validation) → controller → service → Prisma → MySQL → JSON response`.

**MySQL** — A relational database. Travel data is inherently relational (a Trip has many TripDays, each with many ItineraryItems, referencing Places, which belong to Destinations) — foreign keys and joins model this naturally and enforce integrity in a way a document store would leave to application code.

**Prisma** — An ORM that generates a type-safe JavaScript client from `schema.prisma`, so queries like `prisma.trip.findMany(...)` compile to parameterized SQL automatically (preventing SQL injection) and `prisma migrate dev` keeps the MySQL schema in sync with the model definitions.

**JWT (JSON Web Token)** — After login, the server signs a token containing the user's id/role. The client stores it and sends it back as `Authorization: Bearer <token>` on every request; the `protect` middleware verifies the signature and loads the user — no server-side session store needed, which is what makes it "stateless".

**Gemini** — Google's generative AI model. `gemini.service.js` sends a single prompt (built from retrieved MySQL context + the traveller's request) and receives itinerary text back as JSON, which is then Zod-validated before ever reaching the frontend.

**RAG (Retrieval-Augmented Generation)** — Retrieving real data (here, MySQL destination/place rows) and injecting it into the AI prompt so the model's output is grounded in facts rather than invented — see [RAG Explanation](#rag-explanation) above.

**Maps** — The Google Maps JavaScript API is loaded client-side with a public, referrer-restricted key. Each itinerary activity's stored `latitude`/`longitude` becomes a marker; selecting a timeline card highlights its marker via shared React state.

**Weather** — `weather.service.js` calls the OpenWeather REST API server-side (keeping the key secret) and returns simplified JSON; on failure it degrades to mock data with a clear on-screen notice rather than breaking the page.

**Payment (UPI architecture)** — In mock mode, `payment.provider.js` builds a `upi://pay?...` intent URI (what a real UPI app would deep-link into) and simulates the gateway's server-to-server verification callback. With `PAYMENT_PROVIDER=razorpay` and TEST MODE keys, the same module instead opens a real Razorpay order and the frontend launches the actual Razorpay Checkout widget; on success the backend independently recomputes the HMAC-SHA256 signature Razorpay sent (`crypto.createHmac('sha256', keySecret).update(orderId+'|'+paymentId)`) rather than trusting the client callback — the same verification pattern any production Razorpay integration uses.

## Troubleshooting

- **`Can't reach database server`** — check MySQL is running and `DATABASE_URL` in `backend/.env` matches your MySQL username/password/port.
- **`Prisma schema validation error`** — run `npx prisma generate` after any `schema.prisma` change.
- **AI Planner returns a "fallback-template" itinerary** — this is expected with no `GEMINI_API_KEY` configured; it's not a bug, see [Mock Mode vs Production](#mock-mode-vs-production).
- **Map shows "unavailable — no Google Maps API key configured"** — add `VITE_GOOGLE_MAPS_API_KEY` to `frontend/.env` and **restart** `npm run dev` (Vite only reads `.env` at startup, not on save).
- **Map shows "Google rejected the API key"** — this means the key *is* being sent but Google is refusing it, most often because: (a) the **Maps JavaScript API** isn't enabled for the key's project in Google Cloud Console → APIs & Services → Library; (b) **billing isn't enabled** on the project — Google requires a billing account even to stay within the free monthly credit; (c) the key's **HTTP referrer restrictions** don't include `http://localhost:5173/*`. Open the browser DevTools console for the exact error name (`ApiNotActivatedMapError`, `BillingNotEnabledMapError`, `RefererNotAllowedMapError`, `InvalidKeyMapError`) — Google's script loads successfully (HTTP 200) even with a bad key, so this failure only shows up via `gm_authFailure`/console, never as a network error.
- **"Network Error" / `ERR_CONNECTION_REFUSED` calling the API from the frontend** — almost always means the backend and frontend dev servers aren't *both* running at the same time. They must run in **two separate terminal windows left open** (`cd backend && npm run dev` in one, `cd frontend && npm run dev` in the other) — or use `npm run dev` at the project root, which runs both together via `concurrently`. Closing either terminal (or only ever running one at a time) reproduces this exact error. Confirm the backend is actually up by opening `http://localhost:5000/api/health` directly in the browser.
- **CORS errors** — ensure `CLIENT_URL` in `backend/.env` matches the URL you're loading the frontend from (default `http://localhost:5173`).
- **Real OTP email/SMS never arrives** — check the backend console for `[EMAIL FAILED]` / `[SMS FAILED]` log lines; the app deliberately never blocks login/registration on a delivery failure, so the request still "succeeds" even if the message doesn't arrive. Double-check the Gmail App Password (not your normal password) and Fast2SMS wallet balance.
- **Razorpay "Pay Now" button does nothing** — open DevTools console; this usually means `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are missing or invalid in `backend/.env`, in which case `paymentController.js` silently falls back to the mock UPI panel instead (check the network response for `/api/payments/create` — `isMock:false` means real mode engaged).
- **Hotels/Flights show mock data even with `BOOKING_PROVIDER=rapidapi` set** — check the backend console for `[RapidAPI] ... falling back to mock` warnings, which include the exact reason (missing key, no results for that destination/host, rate limit, etc.).
