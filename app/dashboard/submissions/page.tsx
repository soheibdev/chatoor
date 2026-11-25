import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import SubmissionsView from "@/components/admin/SubmissionsView";

export const metadata: Metadata = { title: "Submissions · Admin · CHATOOOR" };

export default function AdminSubmissionsPage() {
  return (
    <AdminShell title="Submissions">
      <SubmissionsView />
    </AdminShell>
  );
}
