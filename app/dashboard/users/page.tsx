import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ParticipantsView from "@/components/admin/ParticipantsView";

export const metadata: Metadata = { title: "Participants · Admin · CHATOOOR" };

export default function AdminUsersPage() {
  return (
    <AdminShell title="Participants">
      <ParticipantsView />
    </AdminShell>
  );
}
