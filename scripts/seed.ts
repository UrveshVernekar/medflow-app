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
    console.log("🧹 Clearing old appointments, doctor availability, patients, doctors, departments, and users...");
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

    // 4. CREATE 21 DOCTORS (3 PER DEPARTMENT)
    console.log("🩺 Creating 21 Doctors (3 per department)...");
    const doctorsData = [
      // Cardiology
      { firstName: "Robert", lastName: "Chen", email: "dr.chen@medflow.com", dept: "Cardiology", spec: "Interventional Cardiology", lic: "MD-10021", exp: 14 },
      { firstName: "Sarah", lastName: "Jenkins", email: "dr.jenkins@medflow.com", dept: "Cardiology", spec: "Pediatric Cardiology", lic: "MD-10022", exp: 10 },
      { firstName: "Michael", lastName: "Ross", email: "dr.ross@medflow.com", dept: "Cardiology", spec: "Heart Failure & Transplant", lic: "MD-10023", exp: 18 },
      // Neurology
      { firstName: "Elena", lastName: "Rostova", email: "dr.rostova@medflow.com", dept: "Neurology", spec: "Clinical Neurophysiology", lic: "MD-10024", exp: 12 },
      { firstName: "James", lastName: "Wilson", email: "dr.wilson@medflow.com", dept: "Neurology", spec: "Stroke & Vascular Neurology", lic: "MD-10025", exp: 15 },
      { firstName: "Maya", lastName: "Patel", email: "dr.patel@medflow.com", dept: "Neurology", spec: "Movement Disorders", lic: "MD-10026", exp: 8 },
      // Pediatrics
      { firstName: "Emily", lastName: "Thorne", email: "dr.thorne@medflow.com", dept: "Pediatrics", spec: "Pediatric Emergency Medicine", lic: "MD-10027", exp: 9 },
      { firstName: "David", lastName: "Kim", email: "dr.kim@medflow.com", dept: "Pediatrics", spec: "General Pediatrics", lic: "MD-10028", exp: 11 },
      { firstName: "Lisa", lastName: "Al-Mansoor", email: "dr.almansoor@medflow.com", dept: "Pediatrics", spec: "Neonatology", lic: "MD-10029", exp: 16 },
      // Orthopedics
      { firstName: "Marcus", lastName: "Vance", email: "dr.vance@medflow.com", dept: "Orthopedics", spec: "Sports Medicine & Arthroscopy", lic: "MD-10030", exp: 13 },
      { firstName: "Olivia", lastName: "Taylor", email: "dr.taylor@medflow.com", dept: "Orthopedics", spec: "Joint Replacement", lic: "MD-10031", exp: 20 },
      { firstName: "Benjamin", lastName: "Hayes", email: "dr.hayes@medflow.com", dept: "Orthopedics", spec: "Spine Surgery", lic: "MD-10032", exp: 17 },
      // Dermatology
      { firstName: "Sophia", lastName: "Martinez", email: "dr.martinez@medflow.com", dept: "Dermatology", spec: "Cosmetic Dermatology", lic: "MD-10033", exp: 7 },
      { firstName: "Alexander", lastName: "Wright", email: "dr.wright@medflow.com", dept: "Dermatology", spec: "Dermatopathology", lic: "MD-10034", exp: 14 },
      { firstName: "Chloe", lastName: "Bennett", email: "dr.bennett@medflow.com", dept: "Dermatology", spec: "Pediatric Dermatology", lic: "MD-10035", exp: 9 },
      // Oncology
      { firstName: "Jonathan", lastName: "Reed", email: "dr.reed@medflow.com", dept: "Oncology", spec: "Medical Oncology", lic: "MD-10036", exp: 22 },
      { firstName: "Grace", lastName: "Morgan", email: "dr.morgan@medflow.com", dept: "Oncology", spec: "Surgical Oncology", lic: "MD-10037", exp: 13 },
      { firstName: "Daniel", lastName: "Gupta", email: "dr.gupta@medflow.com", dept: "Oncology", spec: "Radiation Oncology", lic: "MD-10038", exp: 11 },
      // General Medicine
      { firstName: "Hannah", lastName: "Abbott", email: "dr.abbott@medflow.com", dept: "General Medicine", spec: "Internal Medicine", lic: "MD-10039", exp: 15 },
      { firstName: "Christopher", lastName: "Lee", email: "dr.lee@medflow.com", dept: "General Medicine", spec: "Family Practice", lic: "MD-10040", exp: 12 },
      { firstName: "Victoria", lastName: "Sterling", email: "dr.sterling@medflow.com", dept: "General Medicine", spec: "Geriatric Medicine", lic: "MD-10041", exp: 19 },
    ];

    const doctorIds: string[] = [];

    for (const doc of doctorsData) {
      // Create User
      const uRes = await sql`
        INSERT INTO medflow.users (email, password_hash, role, first_name, last_name)
        VALUES (${doc.email}, ${doctorPasswordHash}, 'doctor', ${doc.firstName}, ${doc.lastName})
        RETURNING id
      `;
      const userId = uRes[0].id;
      const deptId = departmentMap.get(doc.dept);

      // Create Doctor Profile
      const dRes = await sql`
        INSERT INTO medflow.doctors (user_id, specialization, license_number, years_of_experience, department_id)
        VALUES (${userId}, ${doc.spec}, ${doc.lic}, ${doc.exp}, ${deptId})
        RETURNING id
      `;
      const doctorId = dRes[0].id;
      doctorIds.push(doctorId);

      // Set Doctor Availability (Mon-Fri, 09:00 - 17:00)
      for (let day = 1; day <= 5; day++) {
        await sql`
          INSERT INTO medflow.doctor_availability (doctor_id, day_of_week, start_time, end_time)
          VALUES (${doctorId}, ${day}, '09:00', '17:00')
        `;
      }
    }

    // 5. CREATE 20 PATIENTS
    console.log("👥 Creating 20 Patients...");
    const patientsData = [
      { firstName: "John", lastName: "Doe", email: "john.doe@gmail.com", gender: "male", contact: "+1-555-0101", address: "123 Maple St, New York, NY" },
      { firstName: "Jane", lastName: "Smith", email: "jane.smith@gmail.com", gender: "female", contact: "+1-555-0102", address: "456 Oak Ave, Los Angeles, CA" },
      { firstName: "Alice", lastName: "Johnson", email: "alice.j@gmail.com", gender: "female", contact: "+1-555-0103", address: "789 Pine Rd, Austin, TX" },
      { firstName: "Bob", lastName: "Brown", email: "bob.brown@yahoo.com", gender: "male", contact: "+1-555-0104", address: "321 Cedar Blvd, Miami, FL" },
      { firstName: "Charlie", lastName: "Davis", email: "charlie.d@gmail.com", gender: "male", contact: "+1-555-0105", address: "654 Elm St, Seattle, WA" },
      { firstName: "Diana", lastName: "Prince", email: "diana.p@outlook.com", gender: "female", contact: "+1-555-0106", address: "987 Birch Ln, Chicago, IL" },
      { firstName: "Evan", lastName: "Wright", email: "evan.w@gmail.com", gender: "male", contact: "+1-555-0107", address: "147 Walnut St, Boston, MA" },
      { firstName: "Fiona", lastName: "Gallagher", email: "fiona.g@yahoo.com", gender: "female", contact: "+1-555-0108", address: "258 Spruce Ct, Philadelphia, PA" },
      { firstName: "George", lastName: "Clark", email: "george.c@gmail.com", gender: "male", contact: "+1-555-0109", address: "369 Ash Ave, Columbus, OH" },
      { firstName: "Hannah", lastName: "Montana", email: "hannah.m@gmail.com", gender: "female", contact: "+1-555-0110", address: "741 Chestnut Dr, Charlotte, NC" },
      { firstName: "Ian", lastName: "Malcolm", email: "ian.m@gmail.com", gender: "male", contact: "+1-555-0111", address: "852 Cypress Way, Atlanta, GA" },
      { firstName: "Julia", lastName: "Roberts", email: "julia.r@hotmail.com", gender: "female", contact: "+1-555-0112", address: "963 Magnolia Dr, Detroit, MI" },
      { firstName: "Kevin", lastName: "Bacon", email: "kevin.b@gmail.com", gender: "male", contact: "+1-555-0113", address: "159 Poplar St, Denver, CO" },
      { firstName: "Laura", lastName: "Croft", email: "laura.c@gmail.com", gender: "female", contact: "+1-555-0114", address: "357 Redwood Hwy, Portland, OR" },
      { firstName: "Matthew", lastName: "Murdock", email: "matt.m@gmail.com", gender: "male", contact: "+1-555-0115", address: "468 Sycamore Ln, Hell's Kitchen, NY" },
      { firstName: "Natasha", lastName: "Romanoff", email: "natasha.r@gmail.com", gender: "female", contact: "+1-555-0116", address: "579 Willow Way, Las Vegas, NV" },
      { firstName: "Oscar", lastName: "Isaac", email: "oscar.i@gmail.com", gender: "male", contact: "+1-555-0117", address: "680 Alder Ct, Phoenix, AZ" },
      { firstName: "Penelope", lastName: "Cruz", email: "penelope.c@gmail.com", gender: "female", contact: "+1-555-0118", address: "791 Beech Rd, Santa Fe, NM" },
      { firstName: "Quentin", lastName: "Tarantino", email: "quentin.t@gmail.com", gender: "male", contact: "+1-555-0119", address: "802 Hickory St, Nashville, TN" },
      { firstName: "Rachel", lastName: "Green", email: "rachel.g@gmail.com", gender: "female", contact: "+1-555-0120", address: "913 Olive Ave, New York, NY" },
    ];

    const patientIds: string[] = [];

    for (const pat of patientsData) {
      const uRes = await sql`
        INSERT INTO medflow.users (email, password_hash, role, first_name, last_name)
        VALUES (${pat.email}, ${patientPasswordHash}, 'patient', ${pat.firstName}, ${pat.lastName})
        RETURNING id
      `;
      const userId = uRes[0].id;

      const pRes = await sql`
        INSERT INTO medflow.patients (user_id, first_name, last_name, gender, contact_number, address)
        VALUES (${userId}, ${pat.firstName}, ${pat.lastName}, ${pat.gender}, ${pat.contact}, ${pat.address})
        RETURNING id
      `;
      patientIds.push(pRes[0].id);
    }

    // 6. CREATE DUMMY APPOINTMENTS FOR ANALYTICS VISUALIZATION
    console.log("📅 Creating Sample Appointments for Dashboard Analytics...");
    const sampleNotes = [
      "Routine annual health evaluation and blood test review.",
      "Persistent chest discomfort and blood pressure monitoring.",
      "Pediatric vaccination checkup and growth tracking.",
      "Post-operative joint follow-up and physical therapy guidance.",
      "Dermatology consultation for skin rash and allergy assessment.",
      "Oncology consultation and lab results discussion.",
      "General wellness screening and lifestyle consultation.",
      "Follow-up visit for ongoing medication adjustment."
    ];

    const statuses = ["confirmed", "completed", "pending", "cancelled"];

    // Seed 30 appointments across various dates
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const patientId = patientIds[i % patientIds.length];
      const doctorId = doctorIds[i % doctorIds.length];
      const status = statuses[i % statuses.length];
      const notes = sampleNotes[i % sampleNotes.length];

      // Spread dates between -5 days ago and +5 days in the future
      const dayOffset = (i % 11) - 5;
      const apptDate = new Date(now.valueOf() + dayOffset * 24 * 60 * 60 * 1000);
      apptDate.setHours(9 + (i % 7), 0, 0, 0);

      await sql`
        INSERT INTO medflow.appointments (patient_id, doctor_id, appointment_datetime, notes, status)
        VALUES (${patientId}, ${doctorId}, ${apptDate.toISOString()}::timestamptz, ${notes}, ${status})
      `;
    }

    console.log("🎉 Seeding completed successfully!");
    console.log("--------------------------------------------------");
    console.log("Summary of Seeded Data:");
    console.log(`- 👑 Admin: admin@medflow.com / admin123`);
    console.log(`- 🏢 Departments: ${departmentsData.length}`);
    console.log(`- 🩺 Doctors: ${doctorsData.length} (Password: doctor123)`);
    console.log(`- 👥 Patients: ${patientsData.length} (Password: patient123)`);
    console.log(`- 📅 Appointments: 30 sample visits`);
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
