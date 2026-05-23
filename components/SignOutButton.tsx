"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={signOut} className="text-[#8B7355] hover:text-bone transition" aria-label="Sign out">
      <LogOut size={16} />
    </button>
  );
}
