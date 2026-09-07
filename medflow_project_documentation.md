# 🏥 MedFlow EMR — Official Project Documentation

> **System Version:** 0.1.0  
> **Target Environment:** Local / Self-Hosted / Hybrid Cloud  
> **Document Status:** Official Architecture & Feature Specification  
> **Last Updated:** September 2026  

---

## 1. Executive Summary

**MedFlow EMR** is a modern, high-performance Electronic Medical Record (EMR) and Hospital Operations Management Platform built to streamline patient care, doctor schedules, and hospital administrative workflows. 

Designed with a multi-tenant-like, role-based architecture, MedFlow provides three distinct persona workflows:
- **Patients**: Seamless online doctor discovery, automated slot-based appointment booking, schedule management, and personal health profile tracking.
- **Doctors**: Real-time appointment management, patient historical record access, 7-day consultation traffic analytics, and working-hour slot management.
- **Administrators**: Centralized operational overview, global hospital analytics (doctor, patient, and appointment metrics), cross-department distribution charts, doctor account provisioning, and department directory management.

---

## 2. Tech Stack & Architecture

MedFlow leverages a modern full-stack web architecture with serverless-first data fetching, type-safe database queries, and role-guarded routing.

| Layer | Technology / Library | Purpose / Details |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Server Components, Client Hydration, Layout-level state isolation |
| **UI Component System** | Radix UI + Shadcn UI + Lucide React | Accessible, keyboard-navigable interactive UI elements |
| **Styling & Design System** | Tailwind CSS v4 + `tw-animate-css` | Responsive CSS grid layouts, dynamic dark/light mode themes, glassmorphism UI |
| **State & Data Fetching** | React 19 + `@tanstack/react-query` | Dynamic client-side revalidation and caching |
| **Forms & Validation** | `react-hook-form` + `zod` | End-to-end type-safe payload validation on client & server |
| **Data Analytics & Charts**| Recharts | Responsive SVG bar charts, pie/donut charts for hospital & doctor analytics |
| **Database Engine** | PostgreSQL | Relational ACID database store |
| **Database Connector** | `postgres` (pnpm/npm package) | Parameterized SQL query execution avoiding SQL injection risks |
| **Authentication & RBAC** | NextAuth.js (v5 Beta) | JWT-based session tokens with role claims & bcrypt password encryption |
| **Middleware Security** | Next.js Middleware (`proxy.ts`) | Server-side automatic role route protection (`/admin`, `/doctor`, `/patient`) |

---

## 3. System Architecture & Request Flow

```mermaid
graph TD
    Client[Browser / Client App] -->|HTTPS Request| MW[Next.js Middleware proxy.ts]
    MW -->|Verify JWT Role| Guard{Authorized?}
    Guard -->|No| Login[/login Route]
    Guard -->|Yes| Router[App Router Page / Action]
    Router -->|Next.js Server Action| Logic[Feature Service Layer]
    Logic -->|Parameterized SQL| DB[(PostgreSQL medflow schema)]
    DB -->|Result Set| Logic
    Logic -->|Encapsulated State| Client
```

---

## 4. Relational Database Schema Specification (`medflow` Schema)

The database logic is structured within a isolated PostgreSQL schema named `medflow`. All entity deletions preserve historical data integrity via a soft-deletion model (`deleted_at` timestamp).

```mermaid
erDiagram
    USERS ||--o| DOCTORS : "has profile (role=doctor)"
    USERS ||--o| PATIENTS : "has profile (role=patient)"
    DEPARTMENTS ||--o{ DOCTORS : "belongs to"
    DOCTORS ||--o{ DOCTOR_AVAILABILITY : "defines working slots"
    DOCTORS ||--o{ APPOINTMENTS : "conducts"
    PATIENTS ||--o{ APPOINTMENTS : "books"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string role "admin | doctor | patient"
        string first_name
        string last_name
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    DEPARTMENTS {
        uuid id PK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }

    DOCTORS {
        uuid id PK
        uuid user_id FK
        string specialization
        string license_number
        int years_of_experience
        uuid department_id FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    DOCTOR_AVAILABILITY {
        uuid id PK
        uuid doctor_id FK
        int day_of_week "0=Sun ... 6=Sat"
        time start_time
        time end_time
    }

    PATIENTS {
        uuid id PK
        uuid user_id FK
        string first_name
        string last_name
        string gender
        string contact_number
        string address
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    APPOINTMENTS {
        uuid id PK
        uuid patient_id FK
        uuid doctor_id FK
        timestamp appointment_datetime
        string notes
        string status "pending | confirmed | completed | cancelled"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
```

---

## 5. Module Feature Matrix

### 5.1 Patient Portal (`/patient`)
- **Interactive Doctor Search**: Filter doctors by medical department or specialization in real-time.
- **Slot Availability Engine**: Computes open 30-minute consultation slots based on the doctor's recurring weekly availability and existing non-cancelled bookings.
- **Appointment Management**: View upcoming vs. historical visits with cancellation confirmations.
- **Patient Medical Profile**: Edit contact details, gender, emergency contact info, and address.
- **Patient Analytics**: Personal dashboard showing total consultations, unique doctors visited, and department breakdowns.

### 5.2 Doctor Dashboard (`/doctor`)
- **Schedule & Consultation Queue**: Monitor pending, confirmed, and completed patient visits.
- **Status Workflows**: Update appointment status in real-time (`confirmed`, `completed`, `cancelled`).
- **Availability Configurator**: Interactively define working days and operating hours (e.g. Monday-Friday, 09:00 to 17:00).
- **Patient Medical History Directory**: Inspect patient records, past appointment logs, and clinical notes.
- **Doctor Analytics Hub**: 7-day consultation traffic distribution graph, status breakdown pie charts, and unique patient counts.

### 5.3 Hospital Administrator Portal (`/admin`)
- **Executive Analytics Dashboard**: High-level KPI summary (Total Doctors, Registered Patients, Total Appointments, Active Departments).
- **Hospital Department Manager**: Add, edit, or remove medical departments (e.g., Cardiology, Neurology, Pediatrics, Orthopedics).
- **Doctor Account Provisioning**: Register doctor user accounts linked to specific departments, set specialization details, license numbers, and years of experience.
- **Global Patient Directory**: Comprehensive oversight of all registered patients, registration dates, and cumulative visit counts across departments.
- **Visual Analytics**: Interactive Recharts visualizations detailing appointment volume per department and weekly hospital throughput.

---

## 6. Security & Authorization Architecture

1. **Role-Based Access Control (RBAC)**: User roles (`admin`, `doctor`, `patient`) are embedded in the NextAuth JWT session token during login verification.
2. **Middleware Route Enforcement (`proxy.ts`)**:
   - Unauthorized users trying to visit `/admin`, `/doctor`, or `/patient` are automatically redirected to `/login`.
   - Logged-in users attempting to access `/login` or `/register` are intelligently redirected to their respective role dashboard.
3. **Password Security**: Credentials are encrypted using **Bcrypt** algorithm with salt factor 10.
4. **Parameterized SQL Queries**: All queries execute via the `postgres` tagged template literal syntax, automatically parameterizing user input to prevent SQL Injection vulnerabilities.

---

## 7. Local Setup & Installation Guide

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`+ installed
- **npm**: `v9.x`+ installed
- **PostgreSQL**: Local PostgreSQL server running (default port `5432`)

---

### Step 1: Clone & Install Dependencies
```bash
# Navigate to the workspace directory
cd "d:\Personal Projects\medflow-app"

# Install dependencies
npm install
```

---

### Step 2: Configure Environment Variables
Create a file named `.env.local` in the project root:

```ini
# Database Connection String (PostgreSQL)
# Format: postgres://<username>:<password>@<host>:<port>/<dbname>
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"

# NextAuth Secret (Generate any random 32-char string)
AUTH_SECRET="medflow-super-secret-jwt-key-32-chars-minimum"
```

---

### Step 3: Initialize Database Schema
Execute the database setup script to create the `medflow` schema and required tables:

```sql
-- Run this script inside PostgreSQL (via psql, pgAdmin, or DBeaver)
CREATE SCHEMA IF NOT EXISTS medflow;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS medflow.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS medflow.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medflow.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES medflow.users(id) ON DELETE CASCADE,
  specialization VARCHAR(255) NOT NULL,
  license_number VARCHAR(100),
  years_of_experience INT DEFAULT 0,
  department_id UUID REFERENCES medflow.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS medflow.doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES medflow.doctors(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS medflow.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES medflow.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gender VARCHAR(20),
  contact_number VARCHAR(50),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS medflow.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES medflow.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES medflow.doctors(id) ON DELETE CASCADE,
  appointment_datetime TIMESTAMPTZ NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

---

### Step 4: Seed Initial Accounts
Populate demo users (Admin, Doctors, Patients) into the local database:

```bash
npx tsx scripts/seed.ts
```

#### Pre-seeded Demo Accounts:
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@medflow.com` | `admin123` |
| **Doctor 1** | `doc1@medflow.com` | `doctor123` |
| **Doctor 2** | `doc2@medflow.com` | `doctor123` |
| **Patient 1** | `pat1@medflow.com` | `patient123` |
| **Patient 2** | `pat2@medflow.com` | `patient123` |

---

### Step 5: Run Local Development Server
```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 8. Summary of Future Dockerization (Roadmap)

In upcoming iterations, MedFlow EMR will be containerized with:
- **`Dockerfile`**: Multi-stage production build using Next.js standalone output.
- **`docker-compose.yml`**: Single command execution spinning up both the Next.js Web App container and PostgreSQL database container with persistent data volume mounts.
