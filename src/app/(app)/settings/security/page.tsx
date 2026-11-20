import { SecurityPanel } from "@/components/security-panel";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Akun & Keamanan — Business Flow" };

export default function SecurityPage() {
  return (
    <>
      <PageHeader label="Pengaturan" title="Akun, anggota & keamanan" desc="Akun Google Anda, sesi aktif, anggota workspace, dan undangan. Kunci perangkat (PIN) terpisah dari akun." />
      <SecurityPanel />
    </>
  );
}
