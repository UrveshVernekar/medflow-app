# MedFlow EMR

MedFlow EMR is a comprehensive, modern, and highly scalable Electronic Medical Record (EMR) platform built on the latest web technologies. It is designed to streamline hospital operations by providing seamless access for patients, distinct analytical tools for doctors, and global management overviews for hospital administrators.

## 🚀 Features

### 👤 Patient Portal
- **Appointment Booking:** Patients can easily search for doctors by name, department, or specialization, filter available date slots, and book appointments.
- **Appointment Management:** A unified dashboard to view upcoming and past appointments. Patients can easily cancel upcoming appointments seamlessly with intuitive confirmation dialogs.
- **Dynamic Profiles:** Keep essential contact details and medical profiles up-to-date tracking personalized care.

### 🩺 Doctor Dashboard
- **Schedule Management:** See all upcoming appointments at a glance and easily confirm or track pending bookings.
- **Analytics & Insights:** Beautifully visualized analytics displaying total unique patients, appointment traffic distributed over a 7-day period, and historical patient load.
- **Patient History:** Quick access to past and relevant patient appointment charts with specialized medical notes.

### 🏢 Administrator Global View
- **Hospital Analytics Overview:** A holistic view of the whole hospital, displaying real-time metrics for registered doctors, active patients, and active departments.
- **Global Patient & Doctor Directory:** Perform administrative tasks like reviewing the complete list of users across the platform.
- **Data Visualizations:** Comprehensive bar and pie charts illustrating appointment distribution across all internal hospital departments.

## 🛠️ Tech Stack & Architecture

This project adopts a modern full-stack ecosystem powered by Next.js and robust cloud-native integrations.

### **Frontend:**
- **Framework:** [Next.js](https://nextjs.org/) (React 19, App Router, Server Components & Server Actions)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Architecture:** [radix-ui](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/) for beautiful, responsive, and accessible interactive components.
- **Data Visualization:** [Recharts](https://recharts.org/) for beautiful, responsive frontend charting in the doctor and admin analytical dashboards.
- **Forms & Validation:** `react-hook-form` closely coupled with [Zod](https://zod.dev/) for strict payload validation and type-safe schemas.
- **Notifications & Feedback:** [Sonner](https://sonner.emilkowal.ski/) for rich toast notifications.

### **Backend / Database:**
- **Authentication:** [NextAuth.js (v5 Beta)](https://authjs.dev/) utilizing credential-based workflows explicitly encrypted with Bcrypt.
- **Database Engine:** PostgreSQL (utilizing the `postgres` driver)
- **ORM System:** [Drizzle ORM](https://orm.drizzle.team/) for blazing-fast, type-safe robust SQL queries, enforcing structured schema integrity.

## 💡 Key Advantages 
- **Server-Side Data Mutations:** Built rigorously using Next.js Server Actions, keeping the API logic securely encapsulated on the server, avoiding network waterfalls and maintaining high performance.
- **Role-Based Routing Security:** Secure multi-tenant-like isolation handling distinct functional boundaries between Patients, Doctors, and Admin roles directly at the server component level and dashboard layout routing.
- **Refined Aesthetics & UI/UX:** Prioritizes a polished and rich aesthetic. Designed leveraging smooth gradient palettes, subtle backdrop blurring (glassmorphism), customized badges, interactive hover transformations, and dynamic loading feedback for a truly premium feel.

## ⚙️ Getting Started locally

First, make sure to clone the repository and configure the necessary environmental configurations (e.g. your database URL strings, and NextAuth authenticators).

```bash
# Step 1: Install project dependencies
npm install

# Step 2: Synchronize and push your ORM schemas into your database
npx drizzle-kit push

# Step 3: Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience MedFlow EMR.
