import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ChallengesAdminView from "@/components/admin/ChallengesAdminView";

export const metadata: Metadata = { title: "Challenges · Admin · CHATOOOR" };

export default function AdminChallengesPage() {
  return (
    <AdminShell title="Challenges">
      <ChallengesAdminView />
    </AdminShell>
  );
}
