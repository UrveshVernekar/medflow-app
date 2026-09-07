import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfileData } from "@/features/profile/profile.actions";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const profileData = await getUserProfileData();

  if (!profileData) {
    redirect("/login");
  }

  return <ProfileClient data={profileData} />;
}
