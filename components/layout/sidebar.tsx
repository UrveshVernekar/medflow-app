"use client";

import Link from "next/link";

type Props = {
  role: "admin" | "doctor" | "patient";
};

export function Sidebar({ role }: Props) {
  const links = getLinks(role);

  return (
    <aside className="w-64 border-r p-4">
      <h2 className="text-lg font-semibold mb-4">MedFlow</h2>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 hover:bg-muted"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function getLinks(role: Props["role"]) {
  switch (role) {
    case "admin":
      return [
        { label: "Dashboard", href: "/admin" },
        { label: "Doctors", href: "/admin/doctors" },
        { label: "Patients", href: "/admin/patients" },
        { label: "Analytics", href: "/admin/analytics" },
      ];

    case "doctor":
      return [
        { label: "Dashboard", href: "/doctor" },
        { label: "Appointments", href: "/doctor/appointments" },
        { label: "Patients", href: "/doctor/patients" },
      ];

    case "patient":
      return [
        { label: "Dashboard", href: "/patient" },
        { label: "Appointments", href: "/patient/appointments" },
        { label: "Medical Records", href: "/patient/records" },
      ];
  }
}
