# MedFlow EMR

MedFlow EMR is a comprehensive, modern, and highly scalable Electronic Medical Record (EMR) platform built on the latest web technologies. It is designed to streamline hospital operations by providing seamless access for patients, distinct analytical tools for doctors, and global management overviews for hospital administrators.

---

## 🐳 Quick Start with Docker (Recommended - Zero Setup)

Anyone can run MedFlow EMR instantly without installing PostgreSQL or configuring database connections locally:

```bash
# Clone the repository
git clone https://github.com/UrveshVernekar/medflow-app.git
cd medflow-app

# Start the full stack (PostgreSQL DB + Web App + Auto-seeding)
docker compose up --build
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 🔑 Demo Login Credentials
- **👑 Administrator:** `admin@medflow.com` / `admin123`
- **🩺 Doctor:** `dr.chen@medflow.com` / `doctor123`
- **👥 Patient:** `john.doe@gmail.com` / `patient123`

---

## 🛠️ Local Development (Without Docker)

```bash
# Step 1: Install dependencies
npm install

# Step 2: Configure environment variables in .env.local
# Copy from .env.example and set your local DATABASE_URL

# Step 3: Initialize database schema & seed initial data
npm run db:init
npm run db:seed

# Step 4: Launch local dev server
npm run dev
```

---

## 🚀 Features

### 👤 Patient Portal
- **Appointment Booking:** Patients can easily search for doctors by name, department, or specialization, filter available date slots, and book appointments.
- **Appointment Management:** A unified dashboard to view upcoming and past appointments with cancellation dialogs.
- **Dynamic Profiles:** Keep essential contact details and medical profiles up-to-date tracking personalized care.

### 🩺 Doctor Dashboard
- **Schedule Management:** See all upcoming appointments at a glance and easily confirm or track pending bookings.
- **Analytics & Insights:** Visualized analytics displaying unique patients, 7-day consultation traffic, and status breakdowns.
- **Patient History:** Quick access to past and relevant patient appointment charts with specialized medical notes.

### 🏢 Administrator Global View
- **Hospital Analytics Overview:** A holistic view of the hospital, displaying real-time metrics for registered doctors, active patients, and active departments.
- **Global Patient & Doctor Directory:** Review user lists across the platform.
- **Data Visualizations:** Comprehensive bar and pie charts illustrating appointment distribution across internal hospital departments.

---

## 🛠️ Tech Stack & Architecture

### **Frontend:**
- **Framework:** [Next.js 16](https://nextjs.org/) (React 19, App Router, Server Components & Server Actions)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Architecture:** [radix-ui](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Forms & Validation:** `react-hook-form` + [Zod](https://zod.dev/)

### **Backend / Database:**
- **Authentication:** [NextAuth.js (v5 Beta)](https://authjs.dev/) with Bcrypt password encryption.
- **Database Engine:** PostgreSQL (utilizing the `postgres` driver)
- **Containerization:** Docker & Docker Compose
