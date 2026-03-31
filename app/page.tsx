import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "admin":
      redirect("/admin");
    case "doctor":
      redirect("/doctor");
    case "patient":
      redirect("/patient");
  }
}
