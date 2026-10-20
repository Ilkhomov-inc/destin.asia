import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/nav";
import { isAdmin } from "@/lib/auth";
import { store, usingSupabase } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const newCount = (await store.all("inquiries")).filter((i) => i.status === "new").length;
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <AdminNav newCount={newCount} storage={usingSupabase ? "Supabase" : "локальный файл .data/db.json"} />
      <div className="min-w-0 flex-1 px-4 pb-16 sm:px-8">{children}</div>
    </div>
  );
}
