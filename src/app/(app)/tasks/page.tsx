"use client";
import { useState } from "react";
import { TaskCommentsPanel } from "@/components/p2-panels";
import { ResourcePage } from "@/components/resource-page";
import { PageHeader, Tabs } from "@/components/ui";

export default function Tasks() {
  const [tab, setTab] = useState("list");
  return (
    <>
      <PageHeader label="Management" title="Tugas & Tim" desc="Tugas dengan prioritas, tenggat, komentar, dan checklist. Aktivitas dicatat atas nama perangkat/operator." />
      <Tabs tabs={[{ key: "list", label: "Daftar Tugas" }, { key: "comments", label: "Komentar & Checklist" }]} value={tab} onChange={setTab} />
      {tab === "list" ? <ResourcePage resource="tasks" /> : <TaskCommentsPanel />}
    </>
  );
}
