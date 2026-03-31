import { getDoctors } from "@/features/doctors/doctor.service";
import { getDepartments } from "@/features/departments/department.service";
import DoctorTable, { Doctor } from "./DoctorTable";
import CreateDoctorDialog from "./CreateDoctorDialog";

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: { department?: string };
}) {
  const departmentId = searchParams.department;

  const [doctors, departments] = await Promise.all([
    getDoctors(departmentId),
    getDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Doctors</h1>
        <CreateDoctorDialog departments={departments} />
      </div>

      {/* Filter */}
      <form className="flex gap-2">
        <select name="department" defaultValue={departmentId || ""}>
          <option value="">All Departments</option>
          {departments.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <button type="submit">Filter</button>
      </form>

      <DoctorTable doctors={doctors as unknown as Doctor[]} />
    </div>
  );
}
