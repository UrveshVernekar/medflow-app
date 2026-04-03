// DoctorTable.tsx
import { Card } from "@/components/ui/card";

export type Doctor = {
  id: string;
  name: string;
  email: string;
  specialization: string;
  years_of_experience: number;
  department_name: string;
};

export default function DoctorTable({ doctors }: { doctors: Doctor[] }) {
  if (doctors.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 dark:text-zinc-400">
        No doctors found matching your criteria.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="px-8 py-5 text-left font-semibold text-zinc-900 dark:text-white">
              Doctor
            </th>
            <th className="px-8 py-5 text-left font-semibold text-zinc-900 dark:text-white">
              Email
            </th>
            <th className="px-8 py-5 text-left font-semibold text-zinc-900 dark:text-white">
              Specialization
            </th>
            <th className="px-8 py-5 text-left font-semibold text-zinc-900 dark:text-white">
              Experience
            </th>
            <th className="px-8 py-5 text-left font-semibold text-zinc-900 dark:text-white">
              Department
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {doctors.map((doc) => (
            <tr
              key={doc.id}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <td className="px-8 py-6 font-medium text-zinc-900 dark:text-white">
                {doc.name}
              </td>
              <td className="px-8 py-6 font-medium text-zinc-900 dark:text-white">
                {doc.email}
              </td>
              <td className="px-8 py-6 text-zinc-700 dark:text-zinc-300">
                {doc.specialization}
              </td>
              <td className="px-8 py-6">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  {doc.years_of_experience} years
                </span>
              </td>
              <td className="px-8 py-6 text-zinc-600 dark:text-zinc-400">
                {doc.department_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
