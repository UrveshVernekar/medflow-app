import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcrypt";
import postgres from "postgres";

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ Error: DATABASE_URL is not defined in .env.local");
    process.exit(1);
  }

  const sql = postgres(dbUrl, { ssl: false });

  console.log("🌱 Starting MedFlow EMR Database Cleanup & Rich Data Seeding...");

  try {
    // 1. CLEANUP PREVIOUS DATA
    console.log("🧹 Clearing old database records...");
    await sql`DELETE FROM medflow.vital_signs;`;
    await sql`DELETE FROM medflow.prescription_items;`;
    await sql`DELETE FROM medflow.prescriptions;`;
    await sql`DELETE FROM medflow.patient_allergies;`;
    await sql`DELETE FROM medflow.beds;`;
    await sql`DELETE FROM medflow.wards;`;
    await sql`DELETE FROM medflow.audit_logs;`;
    await sql`DELETE FROM medflow.appointments;`;
    await sql`DELETE FROM medflow.doctor_availability;`;
    await sql`DELETE FROM medflow.patients;`;
    await sql`DELETE FROM medflow.doctors;`;
    await sql`DELETE FROM medflow.departments;`;
    await sql`DELETE FROM medflow.users;`;

    // Shared default password hash
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const doctorPasswordHash = await bcrypt.hash("doctor123", 10);
    const patientPasswordHash = await bcrypt.hash("patient123", 10);

    // 2. CREATE ADMIN USER
    console.log("👤 Creating Admin Account (admin@medflow.com)...");
    await sql`
      INSERT INTO medflow.users (email, password_hash, role, first_name, last_name)
      VALUES ('admin@medflow.com', ${adminPasswordHash}, 'admin', 'System', 'Administrator')
    `;

    // 3. CREATE DEPARTMENTS
    console.log("🏢 Creating 7 Hospital Departments...");
    const departmentsData = [
      { name: "Cardiology", description: "Heart, vascular health, and cardiovascular care" },
      { name: "Neurology", description: "Brain, spinal cord, and central nervous system specialties" },
      { name: "Pediatrics", description: "Comprehensive healthcare for infants, children, and teens" },
      { name: "Orthopedics", description: "Bone, joint, spine, and musculoskeletal medical care" },
      { name: "Dermatology", description: "Skin, hair, and nail health and cosmetic care" },
      { name: "Oncology", description: "Advanced cancer diagnosis, therapy, and patient care" },
      { name: "General Medicine", description: "Primary care, health screenings, and internal medicine" },
    ];

    const departmentMap = new Map<string, string>(); // name -> id
    for (const dep of departmentsData) {
      const res = await sql`
        INSERT INTO medflow.departments (name, description)
        VALUES (${dep.name}, ${dep.description})
        RETURNING id, name
      `;
      departmentMap.set(res[0].name, res[0].id);
    }

    // 4. CREATE DOCTORS
    console.log("🩺 Creating 21 Doctors (3 per department)...");
    const doctorsData = [
      // Cardiology
      { email: "carolyn.ross@medflow.com", firstName: "Carolyn", lastName: "Ross", spec: "Cardiology", lic: "MED-CARD-001", exp: 14, dep: "Cardiology" },
      { email: "david.miller@medflow.com", firstName: "David", lastName: "Miller", spec: "Cardiology", lic: "MED-CARD-002", exp: 9, dep: "Cardiology" },
      { email: "elena.gomez@medflow.com", firstName: "Elena", lastName: "Gomez", spec: "Cardiology", lic: "MED-CARD-003", exp: 6, dep: "Cardiology" },

      // Neurology
      { email: "william.white@medflow.com", firstName: "William", lastName: "White", spec: "Neurology", lic: "MED-NEUR-001", exp: 16, dep: "Neurology" },
      { email: "sophia.chen@medflow.com", firstName: "Sophia", lastName: "Chen", spec: "Neurology", lic: "MED-NEUR-002", exp: 11, dep: "Neurology" },
      { email: "marcus.vance@medflow.com", firstName: "Marcus", lastName: "Vance", spec: "Neurology", lic: "MED-NEUR-003", exp: 8, dep: "Neurology" },

      // Pediatrics
      { email: "sarah.jenkins@medflow.com", firstName: "Sarah", lastName: "Jenkins", spec: "Pediatrics", lic: "MED-PEDI-001", exp: 12, dep: "Pediatrics" },
      { email: "lucas.scott@medflow.com", firstName: "Lucas", lastName: "Scott", spec: "Pediatrics", lic: "MED-PEDI-002", exp: 7, dep: "Pediatrics" },
      { email: "emily.watson@medflow.com", firstName: "Emily", lastName: "Watson", spec: "Pediatrics", lic: "MED-PEDI-003", exp: 5, dep: "Pediatrics" },

      // Orthopedics
      { email: "robert.taylor@medflow.com", firstName: "Robert", lastName: "Taylor", spec: "Orthopedics", lic: "MED-ORTH-001", exp: 18, dep: "Orthopedics" },
      { email: "amanda.king@medflow.com", firstName: "Amanda", lastName: "King", spec: "Orthopedics", lic: "MED-ORTH-002", exp: 10, dep: "Orthopedics" },
      { email: "brian.harrs@medflow.com", firstName: "Brian", lastName: "Harris", spec: "Orthopedics", lic: "MED-ORTH-003", exp: 6, dep: "Orthopedics" },

      // Dermatology
      { email: "jessica.alvarez@medflow.com", firstName: "Jessica", lastName: "Alvarez", spec: "Dermatology", lic: "MED-DERM-001", exp: 13, dep: "Dermatology" },
      { email: "daniel.kim@medflow.com", firstName: "Daniel", lastName: "Kim", spec: "Dermatology", lic: "MED-DERM-002", exp: 8, dep: "Dermatology" },
      { email: "rachel.green@medflow.com", firstName: "Rachel", lastName: "Green", spec: "Dermatology", lic: "MED-DERM-003", exp: 4, dep: "Dermatology" },

      // Oncology
      { email: "thomas.wright@medflow.com", firstName: "Thomas", lastName: "Wright", spec: "Oncology", lic: "MED-ONCO-001", exp: 20, dep: "Oncology" },
      { email: "olivia.bennett@medflow.com", firstName: "Olivia", lastName: "Bennett", spec: "Oncology", lic: "MED-ONCO-002", exp: 12, dep: "Oncology" },
      { email: "kevin.patel@medflow.com", firstName: "Kevin", lastName: "Patel", spec: "Oncology", lic: "MED-ONCO-003", exp: 9, dep: "Oncology" },

      // General Medicine
      { email: "james.wilson@medflow.com", firstName: "James", lastName: "Wilson", spec: "General Medicine", lic: "MED-GENM-001", exp: 15, dep: "General Medicine" },
      { email: "hannah.brooks@medflow.com", firstName: "Hannah", lastName: "Brooks", spec: "General Medicine", lic: "MED-GENM-002", exp: 7, dep: "General Medicine" },
      { email: "alexander.reed@medflow.com", firstName: "Alexander", lastName: "Reed", spec: "General Medicine", lic: "MED-GENM-003", exp: 5, dep: "General Medicine" },
    ];

    const doctorIds: string[] = [];

    for (const doc of doctorsData) {
      const depId = departmentMap.get(doc.dep) ?? null;
      
      const userRes = await sql`
        INSERT INTO medflow.users (email, password_hash, role, first_name, last_name)
        VALUES (${doc.email}, ${doctorPasswordHash}, 'doctor', ${doc.firstName}, ${doc.lastName})
        RETURNING id
      `;
      const userId = userRes[0].id;

      const docRes = await sql`
        INSERT INTO medflow.doctors (user_id, specialization, license_number, years_of_experience, department_id)
        VALUES (${userId}, ${doc.spec}, ${doc.lic}, ${doc.exp}, ${depId})
        RETURNING id
      `;
      const doctorId = docRes[0].id;
      doctorIds.push(doctorId);

      // Create default availability (Mon - Fri: 09:00 to 17:00)
      for (let day = 1; day <= 5; day++) {
        await sql`
          INSERT INTO medflow.doctor_availability (doctor_id, day_of_week, start_time, end_time)
          VALUES (${doctorId}, ${day}, '09:00', '17:00')
        `;
      }
    }

    // 5. CREATE PATIENTS
    console.log("👥 Creating 20 Patients...");
    const patientsData = [
      { email: "john.doe@gmail.com", firstName: "John", lastName: "Doe", gender: "Male", contact: "+1-555-0101", address: "123 Maple St, Springfield" },
      { email: "jane.smith@gmail.com", firstName: "Jane", lastName: "Smith", gender: "Female", contact: "+1-555-0102", address: "456 Oak Ave, Metropolis" },
      { email: "michael.brown@yahoo.com", firstName: "Michael", lastName: "Brown", gender: "Male", contact: "+1-555-0103", address: "789 Pine Rd, Gotham" },
      { email: "emily.davis@outlook.com", firstName: "Emily", lastName: "Davis", gender: "Female", contact: "+1-555-0104", address: "101 Birch Ln, Star City" },
      { email: "chris.wilson@gmail.com", firstName: "Chris", lastName: "Wilson", gender: "Male", contact: "+1-555-0105", address: "202 Cedar St, Central City" },
      { email: "amanda.taylor@gmail.com", firstName: "Amanda", lastName: "Taylor", gender: "Female", contact: "+1-555-0106", address: "303 Elm St, Coast City" },
      { email: "matthew.anderson@yahoo.com", firstName: "Matthew", lastName: "Anderson", gender: "Male", contact: "+1-555-0107", address: "404 Spruce Dr, Blüdhaven" },
      { email: "ashley.thomas@gmail.com", firstName: "Ashley", lastName: "Thomas", gender: "Female", contact: "+1-555-0108", address: "505 Willow Way, Keystone" },
      { email: "david.jackson@outlook.com", firstName: "David", lastName: "Jackson", gender: "Male", contact: "+1-555-0109", address: "606 Ash Ct, Smallville" },
      { email: "jessica.white@gmail.com", firstName: "Jessica", lastName: "White", gender: "Female", contact: "+1-555-0110", address: "707 Walnut St, Midway" },
      { email: "james.harris@yahoo.com", firstName: "James", lastName: "Harris", gender: "Male", contact: "+1-555-0111", address: "808 Chestnut Ave, Ivy Town" },
      { email: "sarah.martin@gmail.com", firstName: "Sarah", lastName: "Martin", gender: "Female", contact: "+1-555-0112", address: "909 Cypress Rd, Opal City" },
      { email: "robert.thompson@outlook.com", firstName: "Robert", lastName: "Thompson", gender: "Male", contact: "+1-555-0113", address: "111 Poplar Dr, Hub City" },
      { email: "megan.garcia@gmail.com", firstName: "Megan", lastName: "Garcia", gender: "Female", contact: "+1-555-0114", address: "222 Beech St, Fawcett City" },
      { email: "andrew.martinez@yahoo.com", firstName: "Andrew", lastName: "Martinez", gender: "Male", contact: "+1-555-0115", address: "333 Redwood Ln, Happy Harbor" },
      { email: "stephanie.robinson@gmail.com", firstName: "Stephanie", lastName: "Robinson", gender: "Female", contact: "+1-555-0116", address: "444 Magnolia Way, Gateway City" },
      { email: "joshua.clark@outlook.com", firstName: "Joshua", lastName: "Clark", gender: "Male", contact: "+1-555-0117", address: "555 Sycamore St, Suburbia" },
      { email: "nicole.rodriquez@gmail.com", firstName: "Nicole", lastName: "Rodriguez", gender: "Female", contact: "+1-555-0118", address: "666 Alder Ave, Riverdale" },
      { email: "daniel.lee@yahoo.com", firstName: "Daniel", lastName: "Lee", gender: "Male", contact: "+1-555-0119", address: "777 Hickory Rd, Hill Valley" },
      { email: "samantha.walker@gmail.com", firstName: "Samantha", lastName: "Walker", gender: "Female", contact: "+1-555-0120", address: "888 Larch St, Sunnydale" }
    ];

    const patientIds: string[] = [];

    for (const pat of patientsData) {
      const userRes = await sql`
        INSERT INTO medflow.users (email, password_hash, role, first_name, last_name)
        VALUES (${pat.email}, ${patientPasswordHash}, 'patient', ${pat.firstName}, ${pat.lastName})
        RETURNING id
      `;
      const userId = userRes[0].id;

      const patRes = await sql`
        INSERT INTO medflow.patients (user_id, first_name, last_name, gender, contact_number, address)
        VALUES (${userId}, ${pat.firstName}, ${pat.lastName}, ${pat.gender}, ${pat.contact}, ${pat.address})
        RETURNING id
      `;
      patientIds.push(patRes[0].id);
    }

    // 6. CREATE SAMPLE APPOINTMENTS
    console.log("📅 Creating Sample Appointments for Dashboard Analytics...");
    const sampleNotes = [
      "Routine annual cardiovascular checkup. Patient reports occasional fatigue.",
      "Post-operative knee recovery assessment.",
      "Severe migraine consultation and neurological examination.",
      "Pediatric routine immunization & developmental milestone evaluation.",
      "Dermatological checkup for skin lesion evaluation.",
      "Oncology progress review and lab test analysis.",
      "General wellness screening and lifestyle consultation.",
      "Follow-up visit for ongoing medication adjustment."
    ];

    const statuses = ["confirmed", "completed", "pending", "cancelled"];
    const now = new Date();
    const appointmentIds: string[] = [];

    for (let i = 0; i < 30; i++) {
      const patientId = patientIds[i % patientIds.length];
      const doctorId = doctorIds[i % doctorIds.length];
      const status = statuses[i % statuses.length];
      const notes = sampleNotes[i % sampleNotes.length];

      const dayOffset = (i % 11) - 5;
      const apptDate = new Date(now.valueOf() + dayOffset * 24 * 60 * 60 * 1000);
      apptDate.setHours(9 + (i % 7), 0, 0, 0);

      const apptRes = await sql`
        INSERT INTO medflow.appointments (patient_id, doctor_id, appointment_datetime, notes, status)
        VALUES (${patientId}, ${doctorId}, ${apptDate.toISOString()}::timestamptz, ${notes}, ${status})
        RETURNING id
      `;
      appointmentIds.push(apptRes[0].id);
    }

    // 7. CREATE WARDS & BEDS
    console.log("🛏️ Creating Hospital Wards & ICU/Emergency Bed Matrix...");
    const wardsData = [
      { name: "ICU Alpha", type: "ICU", totalBeds: 6 },
      { name: "Emergency Ward", type: "Emergency", totalBeds: 8 },
      { name: "General Medicine Ward", type: "General", totalBeds: 6 },
      { name: "Pediatric Care Ward", type: "Pediatric", totalBeds: 4 },
    ];

    let patientAssignIndex = 0;

    for (const ward of wardsData) {
      const wardRes = await sql`
        INSERT INTO medflow.wards (name, ward_type, total_beds)
        VALUES (${ward.name}, ${ward.type}, ${ward.totalBeds})
        RETURNING id
      `;
      const wardId = wardRes[0].id;

      const bedStatuses = ["available", "occupied", "sanitizing", "available", "occupied", "maintenance"];
      
      for (let b = 1; b <= ward.totalBeds; b++) {
        const bedNum = `${ward.type.toUpperCase()}-${b.toString().padStart(2, '0')}`;
        const status = bedStatuses[(b - 1) % bedStatuses.length];
        const assignedPatId = status === "occupied" ? patientIds[patientAssignIndex++ % patientIds.length] : null;
        const assignedAt = status === "occupied" ? new Date().toISOString() : null;

        await sql`
          INSERT INTO medflow.beds (ward_id, bed_number, status, assigned_patient_id, assigned_at)
          VALUES (${wardId}, ${bedNum}, ${status}, ${assignedPatId}, ${assignedAt}::timestamptz)
        `;
      }
    }

    // 8. CREATE PATIENT ALLERGIES
    console.log("⚠️ Seeding Patient Allergies & Contraindications...");
    const sampleAllergies = [
      { patientIdx: 0, allergen: "Penicillin", severity: "severe", reaction: "Hives and acute dyspnea" },
      { patientIdx: 0, allergen: "Aspirin", severity: "moderate", reaction: "Gastric upset & mild rash" },
      { patientIdx: 1, allergen: "Amoxicillin", severity: "anaphylactic", reaction: "Anaphylaxis and airway contraction" },
      { patientIdx: 2, allergen: "Sulfa Drugs", severity: "moderate", reaction: "Skin redness and itching" },
      { patientIdx: 3, allergen: "Ibuprofen", severity: "mild", reaction: "Mild facial swelling" },
      { patientIdx: 4, allergen: "Penicillin", severity: "severe", reaction: "Severe rash and wheezing" },
    ];

    for (const item of sampleAllergies) {
      const patId = patientIds[item.patientIdx];
      await sql`
        INSERT INTO medflow.patient_allergies (patient_id, allergen, severity, reaction)
        VALUES (${patId}, ${item.allergen}, ${item.severity}, ${item.reaction})
      `;
    }

    // 9. CREATE E-PRESCRIPTIONS & ITEMS
    console.log("💊 Seeding Sample E-Prescriptions & Prescription Items...");
    const samplePrescriptions = [
      {
        patientIdx: 0,
        doctorIdx: 0,
        diagnosis: "Essential Hypertension & Mild Angina",
        notes: "Monitor blood pressure daily at home. Low sodium diet advised.",
        items: [
          { name: "Lisinopril", dosage: "10mg", frequency: "Once daily in morning", duration: "30 days", instructions: "Take with food" },
          { name: "Amlodipine", dosage: "5mg", frequency: "Once daily at bedtime", duration: "30 days", instructions: "Avoid grapefruit juice" }
        ]
      },
      {
        patientIdx: 1,
        doctorIdx: 1,
        diagnosis: "Migraine with Aura",
        notes: "Avoid bright lights during acute migraine episodes.",
        items: [
          { name: "Sumatriptan", dosage: "50mg", frequency: "As needed at onset", duration: "10 days", instructions: "Do not exceed 200mg in 24 hours" },
          { name: "Propranolol", dosage: "40mg", frequency: "Twice daily", duration: "30 days", instructions: "Prophylactic therapy" }
        ]
      },
      {
        patientIdx: 2,
        doctorIdx: 6,
        diagnosis: "Acute Bronchitis & Cough",
        notes: "Increase hydration. Rest adequately.",
        items: [
          { name: "Azithromycin", dosage: "250mg", frequency: "Once daily", duration: "5 days", instructions: "Complete full antibiotic course" },
          { name: "Benzonatate", dosage: "100mg", frequency: "Three times daily", duration: "7 days", instructions: "Swallow whole, do not chew" }
        ]
      }
    ];

    for (let p = 0; p < samplePrescriptions.length; p++) {
      const script = samplePrescriptions[p];
      const pId = patientIds[script.patientIdx];
      const dId = doctorIds[script.doctorIdx];
      const apptId = appointmentIds[p % appointmentIds.length];

      const scriptRes = await sql`
        INSERT INTO medflow.prescriptions (appointment_id, doctor_id, patient_id, diagnosis, notes, status)
        VALUES (${apptId}, ${dId}, ${pId}, ${script.diagnosis}, ${script.notes}, 'active')
        RETURNING id
      `;
      const prescriptionId = scriptRes[0].id;

      for (const item of script.items) {
        await sql`
          INSERT INTO medflow.prescription_items (prescription_id, medication_name, dosage, frequency, duration, instructions)
          VALUES (${prescriptionId}, ${item.name}, ${item.dosage}, ${item.frequency}, ${item.duration}, ${item.instructions})
        `;
      }
    }

    // 10. CREATE LONGITUDINAL VITAL SIGNS
    console.log("📈 Seeding Historical Vital Signs & Longitudinal Metrics...");
    for (let p = 0; p < 5; p++) {
      const patId = patientIds[p];
      // Generate 4 historical vital readings over past 30 days
      for (let v = 4; v >= 0; v--) {
        const recordedDate = new Date(now.valueOf() - v * 7 * 24 * 60 * 60 * 1000);
        const sys = 115 + Math.floor(Math.random() * 25);
        const dia = 75 + Math.floor(Math.random() * 15);
        const hr = 68 + Math.floor(Math.random() * 20);
        const spo2 = 96 + Math.floor(Math.random() * 4);
        const temp = (36.4 + Math.random() * 1.2).toFixed(1);
        const resp = 14 + Math.floor(Math.random() * 6);
        const weight = (65 + Math.random() * 20).toFixed(1);
        const height = 172.0;
        const bmi = (parseFloat(weight) / ((height / 100) * (height / 100))).toFixed(1);

        await sql`
          INSERT INTO medflow.vital_signs (
            patient_id, blood_pressure_systolic, blood_pressure_diastolic, 
            heart_rate, spo2, temperature_celsius, respiratory_rate, 
            weight_kg, height_cm, bmi, recorded_at
          ) VALUES (
            ${patId}, ${sys}, ${dia}, ${hr}, ${spo2}, ${temp}, ${resp},
            ${weight}, ${height}, ${bmi}, ${recordedDate.toISOString()}::timestamptz
          )
        `;
      }
    }

    console.log("🎉 Seeding completed successfully!");
    console.log("--------------------------------------------------");
    console.log("Summary of Phase 2 Seeded Data:");
    console.log(`- 👑 Admin: admin@medflow.com / admin123`);
    console.log(`- 🏢 Departments: ${departmentsData.length}`);
    console.log(`- 🩺 Doctors: ${doctorsData.length} (Password: doctor123)`);
    console.log(`- 👥 Patients: ${patientsData.length} (Password: patient123)`);
    console.log(`- 📅 Appointments: 30 sample visits`);
    console.log(`- 🛏️ Hospital Wards: 4 (ICU, Emergency, General, Pediatric)`);
    console.log(`- 💊 Prescriptions & Allergies: Seeded for test patients`);
    console.log(`- 📈 Vital Signs: Historical longitudinal data populated`);
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
