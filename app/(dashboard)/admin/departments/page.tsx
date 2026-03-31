import { getDepartments } from "@/features/departments/department.service";
import {
  createDepartmentAction,
  deleteDepartmentAction,
} from "@/features/departments/department.actions";
import { Button } from "@/components/ui/button";

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Departments</h1>

      {/* Create */}
      <form
        action={async (formData) => {
          "use server";
          await createDepartmentAction(formData);
        }}
        className="flex gap-2"
      >
        <input name="name" placeholder="Department name" required />
        <input name="description" placeholder="Description" />
        <Button type="submit">Add</Button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {departments.map((dept: any) => (
          <div key={dept.id} className="flex justify-between border p-2">
            <span>{dept.name}</span>

            <form
              action={async () => {
                "use server";
                await deleteDepartmentAction(dept.id);
              }}
            >
              <Button variant="destructive">Delete</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
