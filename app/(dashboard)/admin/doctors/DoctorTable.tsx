export type Doctor = {
  id: string;
  email: string;
  specialization: string;
  years_of_experience: number;
  department_name: string;
};

export default function DoctorTable({ doctors }: { doctors: Doctor[] }) {
  return (
    <div className="border rounded-md">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted">
          <tr>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Specialization</th>
            <th className="p-2 text-left">Experience</th>
            <th className="p-2 text-left">Department</th>
          </tr>
        </thead>

        <tbody>
          {doctors.map((doc) => (
            <tr key={doc.id} className="border-b">
              <td className="p-2">{doc.email}</td>
              <td className="p-2">{doc.specialization}</td>
              <td className="p-2">{doc.years_of_experience} yrs</td>
              <td className="p-2">{doc.department_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
