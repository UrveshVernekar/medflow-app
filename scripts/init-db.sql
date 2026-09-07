-- MedFlow EMR Database Initialization Script
-- Schema: medflow

CREATE SCHEMA IF NOT EXISTS medflow;

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
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

-- Departments Table
CREATE TABLE IF NOT EXISTS medflow.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors Table
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

-- Doctor Availability Table
CREATE TABLE IF NOT EXISTS medflow.doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES medflow.doctors(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

-- Patients Table
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

-- Appointments Table
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

-- PHI Audit Logs Table
CREATE TABLE IF NOT EXISTS medflow.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Allergies Table
CREATE TABLE IF NOT EXISTS medflow.patient_allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES medflow.patients(id) ON DELETE CASCADE,
  allergen VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL DEFAULT 'moderate',
  reaction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS medflow.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES medflow.appointments(id) ON DELETE SET NULL,
  doctor_id UUID NOT NULL REFERENCES medflow.doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES medflow.patients(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescription Items Table
CREATE TABLE IF NOT EXISTS medflow.prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES medflow.prescriptions(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  instructions TEXT
);

-- Hospital Wards Table
CREATE TABLE IF NOT EXISTS medflow.wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  ward_type VARCHAR(100) NOT NULL,
  total_beds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospital Beds Table
CREATE TABLE IF NOT EXISTS medflow.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES medflow.wards(id) ON DELETE CASCADE,
  bed_number VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  assigned_patient_id UUID REFERENCES medflow.patients(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Vital Signs Table
CREATE TABLE IF NOT EXISTS medflow.vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES medflow.patients(id) ON DELETE CASCADE,
  recorded_by_user_id UUID REFERENCES medflow.users(id) ON DELETE SET NULL,
  blood_pressure_systolic INT NOT NULL,
  blood_pressure_diastolic INT NOT NULL,
  heart_rate INT NOT NULL,
  spo2 INT NOT NULL,
  temperature_celsius NUMERIC(4, 1) NOT NULL,
  respiratory_rate INT,
  weight_kg NUMERIC(5, 2),
  height_cm NUMERIC(5, 2),
  bmi NUMERIC(4, 1),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
