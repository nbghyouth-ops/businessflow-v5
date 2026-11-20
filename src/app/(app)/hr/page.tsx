"use client";
import { useState } from "react";
import { LeavePanel, PayrollPanel, ShiftPanel } from "@/components/p2-panels";
import { CommissionPanel } from "@/components/prd-panels";
import { ResourcePage } from "@/components/resource-page";
import { PageHeader, Tabs } from "@/components/ui";

export default function Hr() {
  const [tab, setTab] = useState("emp");
  return (
    <>
      <PageHeader label="Management" title="Karyawan & HR" desc="Catatan karyawan, absensi, cuti, jadwal shift, lembur, dan penggajian (payroll)." />
      <Tabs tabs={[{ key: "emp", label: "Karyawan" }, { key: "att", label: "Absensi" }, { key: "leave", label: "Cuti & Izin" }, { key: "shift", label: "Shift & Lembur" }, { key: "payroll", label: "Payroll" }, { key: "comm", label: "Komisi" }]} value={tab} onChange={setTab} />
      {tab === "emp" && <ResourcePage resource="employees" />}
      {tab === "att" && <ResourcePage resource="attendance" hint="Catat kehadiran per karyawan per tanggal." />}
      {tab === "leave" && <LeavePanel />}
      {tab === "shift" && <ShiftPanel />}
      {tab === "payroll" && <PayrollPanel />}
      {tab === "comm" && <CommissionPanel />}
    </>
  );
}
