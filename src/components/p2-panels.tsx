"use client";
 
import { useState } from "react";
import { useBiz } from "@/components/shell";
import { Badge, Button, Card, Check, DataTable, Empty, ErrorBox, Loading, Modal, SelectField, TextField } from "@/components/ui";
import { api, fmtDate, fmtDateTime, toast, toInputDate, useApi } from "@/lib/client";
import { formatMoney, fromCents } from "@/lib/money";

const moneyCents = (v: unknown, cur: string) => {
  try {
    return formatMoney(fromCents(BigInt(String(v ?? "0").split(".")[0] || "0")), cur);
  } catch {
    return formatMoney("0", cur);
  }
};

/* ───────── 1. Inventory: Transfer Gudang & Stock Opname ───────── */
export function StockTransferPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/stock-transfers");
  const prods = useApi<any>("/r/products?limit=200");
  const [open, setOpen] = useState(false);
  const [fromW, setFromW] = useState("");
  const [toW, setToW] = useState("");
  const [prodId, setProdId] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const whOpts = biz.warehouses.map((w: any) => ({ value: w.id, label: w.name }));
  const prodOpts = (prods.data?.items ?? []).map((p: any) => ({ value: p.id, label: `${p.name} (${p.sku})` }));
  const whName = (id: string) => biz.warehouses.find((w: any) => w.id === id)?.name ?? id.slice(0, 8);
  const prodName = (id: string) => (prods.data?.items ?? []).find((p: any) => p.id === id)?.name ?? id.slice(0, 8);

  async function save() {
    setBusy(true);
    try {
      await api("/p2/stock-transfers", {
        body: {
          fromWarehouseId: fromW || whOpts[0]?.value,
          toWarehouseId: toW || whOpts[1]?.value || whOpts[0]?.value,
          productId: prodId || prodOpts[0]?.value,
          qty: Number(qty || 1),
          note: note || undefined,
        },
      });
      toast("Transfer stok dicatat");
      setOpen(false);
      setNote("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Transfer Antar Gudang"
      desc="Pindahkan stok antar gudang/cabang dengan pencatatan dokumen TRF."
      actions={biz.can("inventory:write") && whOpts.length >= 2 ? <Button onClick={() => setOpen(true)}>+ Transfer Gudang</Button> : undefined}
    >
      {whOpts.length < 2 && (
        <p className="mb-3 text-xs text-ink-2">Tambahkan minimal 2 gudang di Pengaturan untuk melakukan transfer antar gudang.</p>
      )}
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Transfer stok"
          empty={<Empty title="Belum ada transfer gudang" />}
          columns={[
            { key: "number", label: "No. Dokumen" },
            { key: "productId", label: "Produk", render: (r: any) => prodName(r.productId) },
            { key: "fromWarehouseId", label: "Dari", render: (r: any) => whName(r.fromWarehouseId) },
            { key: "toWarehouseId", label: "Ke", render: (r: any) => whName(r.toWarehouseId) },
            { key: "qtyMilli", label: "Qty", right: true, render: (r: any) => String(Number(r.qtyMilli || 0) / 1000) },
            { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Transfer Antar Gudang">
        <div className="grid gap-3">
          <SelectField label="Gudang Asal" value={fromW || whOpts[0]?.value || ""} onChange={setFromW} options={whOpts} />
          <SelectField label="Gudang Tujuan" value={toW || whOpts[1]?.value || ""} onChange={setToW} options={whOpts} />
          <SelectField label="Produk" value={prodId || prodOpts[0]?.value || ""} onChange={setProdId} options={prodOpts} />
          <TextField label="Jumlah" inputMode="decimal" value={qty} onChange={(v) => setQty(v.replace(/[^\d.]/g, ""))} />
          <TextField label="Catatan" value={note} onChange={setNote} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} onClick={save}>Simpan Transfer</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export function StockCountPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/stock-counts");
  const prods = useApi<any>("/r/products?limit=200");
  const [open, setOpen] = useState(false);
  const [whId, setWhId] = useState("");
  const [prodId, setProdId] = useState("");
  const [counted, setCounted] = useState("0");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const whOpts = biz.warehouses.map((w: any) => ({ value: w.id, label: w.name }));
  const prodOpts = (prods.data?.items ?? []).map((p: any) => ({ value: p.id, label: `${p.name} (${p.sku})` }));

  async function save() {
    setBusy(true);
    try {
      await api("/p2/stock-counts", {
        body: {
          warehouseId: whId || whOpts[0]?.value,
          note: note || undefined,
          items: [{ productId: prodId || prodOpts[0]?.value, countedQty: Number(counted || 0) }],
        },
      });
      toast("Stock opname dicatat");
      setOpen(false);
      setNote("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Stock Opname (Penghitungan Fisik)"
      desc="Catat hasil penghitungan stok fisik per gudang."
      actions={biz.can("inventory:write") ? <Button onClick={() => setOpen(true)}>+ Catat Opname</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Riwayat stock opname"
          empty={<Empty title="Belum ada stock opname" />}
          columns={[
            { key: "number", label: "No. Opname" },
            { key: "createdAt", label: "Tanggal", render: (r: any) => fmtDateTime(r.createdAt) },
            { key: "items", label: "Jumlah Item", right: true, render: (r: any) => String((r.items ?? []).length) },
            { key: "note", label: "Catatan", render: (r: any) => r.note || "—" },
            { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Catat Stock Opname">
        <div className="grid gap-3">
          <SelectField label="Gudang" value={whId || whOpts[0]?.value || ""} onChange={setWhId} options={whOpts} />
          <SelectField label="Produk" value={prodId || prodOpts[0]?.value || ""} onChange={setProdId} options={prodOpts} />
          <TextField label="Jumlah Fisik Terhitung" inputMode="decimal" value={counted} onChange={(v) => setCounted(v.replace(/[^\d.]/g, ""))} />
          <TextField label="Catatan" value={note} onChange={setNote} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} onClick={save}>Simpan Opname</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

/* ───────── 2. Purchasing: Purchase Request & Retur Supplier ───────── */
export function PurchaseRequestPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/purchase-requests");
  const [open, setOpen] = useState(false);
  const [requester, setRequester] = useState("");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("1");
  const [est, setEst] = useState("0");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api("/p2/purchase-requests", {
        body: {
          requester,
          estimatedTotal: est || "0",
          note: note || undefined,
          items: [{ name: itemName, qty: Number(qty || 1) }],
        },
      });
      toast("Purchase Request dibuat");
      setOpen(false);
      setRequester("");
      setItemName("");
      setNote("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function approve(id: string) {
    try {
      await api(`/p2/purchase-requests/${id}/approve`, { body: {} });
      toast("Purchase Request disetujui");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <Card
      title="Permintaan Pembelian (Purchase Request)"
      desc="Ajukan dan setujui permintaan pembelian internal sebelum dibuat PO."
      actions={biz.can("purchasing:write") ? <Button onClick={() => setOpen(true)}>+ Buat PR</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Purchase Request"
          empty={<Empty title="Belum ada Purchase Request" />}
          columns={[
            { key: "number", label: "No. PR" },
            { key: "requester", label: "Pemohon" },
            { key: "estimatedTotal", label: "Estimasi", right: true, render: (r: any) => moneyCents(r.estimatedTotal, biz.currency) },
            { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
            {
              key: "a",
              label: "",
              right: true,
              render: (r: any) =>
                biz.can("purchasing:write") && r.status !== "approved" ? (
                  <Button variant="secondary" className="!min-h-[32px] !px-2.5 text-xs" onClick={() => approve(r.id)}>
                    Setujui
                  </Button>
                ) : null,
            },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Buat Purchase Request">
        <div className="grid gap-3">
          <TextField label="Nama Pemohon / Divisi" value={requester} onChange={setRequester} />
          <TextField label="Nama Barang / Jasa" value={itemName} onChange={setItemName} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Qty" inputMode="decimal" value={qty} onChange={(v) => setQty(v.replace(/[^\d.]/g, ""))} />
            <TextField label="Estimasi Total" inputMode="decimal" value={est} onChange={(v) => setEst(v.replace(/[^\d.]/g, ""))} />
          </div>
          <TextField label="Catatan" value={note} onChange={setNote} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!requester.trim() || !itemName.trim()} onClick={save}>Simpan PR</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export function SupplierReturnPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/supplier-returns");
  const orders = useApi<any>("/purchasing/orders");
  const prods = useApi<any>("/r/products?limit=200");
  const [open, setOpen] = useState(false);
  const [poId, setPoId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const poOpts = (orders.data?.items ?? []).filter((o: any) => o.status !== "cancelled").map((o: any) => ({ value: o.id, label: `${o.number} — ${o.supplierName}` }));
  const prodOpts = (prods.data?.items ?? []).filter((p: any) => p.trackStock).map((p: any) => ({ value: p.id, label: p.name }));

  async function save() {
    setBusy(true);
    try {
      await api("/p2/supplier-returns", {
        body: {
          poId: poId || poOpts[0]?.value,
          reason,
          items: [{ productId: productId || prodOpts[0]?.value, qty: (qty || "1").replace(",", ".") }],
        },
      });
      toast("Retur dicatat: stok, tagihan, dan jurnal diperbarui");
      setOpen(false);
      setReason("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Retur ke Supplier"
      desc="Mengurangi stok, mengurangi tagihan pemasok, dan menjurnal hutang vs persediaan secara otomatis."
      actions={biz.can("purchasing:write") && poOpts.length > 0 ? <Button onClick={() => setOpen(true)}>+ Catat Retur</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Retur supplier"
          empty={<Empty title="Belum ada retur supplier" />}
          columns={[
            { key: "number", label: "No. Retur" },
            { key: "createdAt", label: "Tanggal", render: (r: any) => fmtDateTime(r.createdAt) },
            { key: "reason", label: "Alasan" },
            { key: "total", label: "Nilai", right: true, render: (r: any) => moneyCents(r.total, biz.currency) },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Catat Retur Supplier">
        <div className="grid gap-3">
          <SelectField label="Pesanan pembelian (PO)" value={poId || poOpts[0]?.value || ""} onChange={setPoId} options={poOpts} />
          <SelectField label="Produk" value={productId || prodOpts[0]?.value || ""} onChange={setProductId} options={prodOpts} />
          <TextField label="Jumlah" inputMode="decimal" value={qty} onChange={(v) => setQty(v.replace(/[^\d.,]/g, ""))} />
          <TextField label="Alasan Retur" value={reason} onChange={setReason} />
          <p className="text-sm text-ink-2">Nilai dihitung otomatis dari biaya rata-rata produk dan tidak boleh melebihi sisa tagihan PO.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!qty || !reason.trim() || prodOpts.length === 0} onClick={save}>Simpan Retur</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

/* ───────── 3. HR: Cuti, Shift & Lembur, Payroll ───────── */
export function LeavePanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/leave-requests");
  const emps = useApi<any>("/r/employees?limit=200");
  const [open, setOpen] = useState(false);
  const [empId, setEmpId] = useState("");
  const [leaveType, setLeaveType] = useState("Cuti Tahunan");
  const [startDate, setStartDate] = useState(toInputDate());
  const [endDate, setEndDate] = useState(toInputDate());
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const empOpts = (emps.data?.items ?? []).map((e: any) => ({ value: e.id, label: e.name }));
  const empName = (id: string) => (emps.data?.items ?? []).find((e: any) => e.id === id)?.name ?? id.slice(0, 8);

  async function save() {
    setBusy(true);
    try {
      await api("/p2/leave-requests", {
        body: { employeeId: empId || empOpts[0]?.value, leaveType, startDate, endDate, reason: reason || undefined },
      });
      toast("Pengajuan cuti disimpan");
      setOpen(false);
      setReason("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function decide(id: string, status: "approved" | "rejected") {
    try {
      await api(`/p2/leave-requests/${id}/decide`, { body: { status } });
      toast(status === "approved" ? "Cuti disetujui" : "Cuti ditolak");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <Card
      title="Pengajuan Cuti & Izin"
      actions={biz.can("hr:write") && empOpts.length > 0 ? <Button onClick={() => setOpen(true)}>+ Ajukan Cuti</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Daftar pengajuan cuti"
          empty={<Empty title="Belum ada pengajuan cuti" />}
          columns={[
            { key: "employeeId", label: "Karyawan", render: (r: any) => empName(r.employeeId) },
            { key: "leaveType", label: "Jenis" },
            { key: "startDate", label: "Periode", render: (r: any) => `${fmtDate(r.startDate)} – ${fmtDate(r.endDate)}` },
            { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
            {
              key: "a",
              label: "",
              right: true,
              render: (r: any) =>
                biz.can("hr:write") && r.status === "pending" ? (
                  <div className="flex justify-end gap-1">
                    <Button variant="secondary" className="!min-h-[30px] !px-2 text-xs" onClick={() => decide(r.id, "approved")}>Setujui</Button>
                    <Button variant="danger" className="!min-h-[30px] !px-2 text-xs" onClick={() => decide(r.id, "rejected")}>Tolak</Button>
                  </div>
                ) : null,
            },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Ajukan Cuti">
        <div className="grid gap-3">
          <SelectField label="Karyawan" value={empId || empOpts[0]?.value || ""} onChange={setEmpId} options={empOpts} />
          <TextField label="Jenis Cuti" value={leaveType} onChange={setLeaveType} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Mulai" type="date" value={startDate} onChange={setStartDate} />
            <TextField label="Selesai" type="date" value={endDate} onChange={setEndDate} />
          </div>
          <TextField label="Alasan" value={reason} onChange={setReason} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} onClick={save}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export function ShiftPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/shifts");
  const emps = useApi<any>("/r/employees?limit=200");
  const [open, setOpen] = useState(false);
  const [empId, setEmpId] = useState("");
  const [shiftDate, setShiftDate] = useState(toInputDate());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [ot, setOt] = useState("0");
  const [busy, setBusy] = useState(false);

  const empOpts = (emps.data?.items ?? []).map((e: any) => ({ value: e.id, label: e.name }));
  const empName = (id: string) => (emps.data?.items ?? []).find((e: any) => e.id === id)?.name ?? id.slice(0, 8);

  async function save() {
    setBusy(true);
    try {
      await api("/p2/shifts", {
        body: { employeeId: empId || empOpts[0]?.value, shiftDate, startTime, endTime, overtimeMinutes: Number(ot || 0) },
      });
      toast("Jadwal shift disimpan");
      setOpen(false);
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Jadwal Shift & Lembur"
      actions={biz.can("hr:write") && empOpts.length > 0 ? <Button onClick={() => setOpen(true)}>+ Tambah Shift</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Jadwal shift"
          empty={<Empty title="Belum ada jadwal shift" />}
          columns={[
            { key: "shiftDate", label: "Tanggal", render: (r: any) => fmtDate(r.shiftDate) },
            { key: "employeeId", label: "Karyawan", render: (r: any) => empName(r.employeeId) },
            { key: "startTime", label: "Jam", render: (r: any) => `${r.startTime} – ${r.endTime}` },
            { key: "overtimeMinutes", label: "Lembur (menit)", right: true },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Jadwal Shift">
        <div className="grid gap-3">
          <SelectField label="Karyawan" value={empId || empOpts[0]?.value || ""} onChange={setEmpId} options={empOpts} />
          <TextField label="Tanggal" type="date" value={shiftDate} onChange={setShiftDate} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Jam Masuk" value={startTime} onChange={setStartTime} />
            <TextField label="Jam Pulang" value={endTime} onChange={setEndTime} />
          </div>
          <TextField label="Lembur (menit)" inputMode="numeric" value={ot} onChange={(v) => setOt(v.replace(/\D/g, ""))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} onClick={save}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export function PayrollPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/payroll-runs");
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState(() => toInputDate().slice(0, 7));
  const [mode, setMode] = useState("none");
  const [workingDays, setWorkingDays] = useState("22");
  const [busy, setBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  async function calculate() {
    setBusy(true);
    try {
      await api("/p2/payroll-runs", {
        body: {
          periodMonth: period,
          absence: mode === "per_working_day" ? { mode, workingDays: Number(workingDays) } : { mode: "none" },
        },
      });
      toast("Payroll dihitung dari data karyawan dan absensi (draft)");
      setOpen(false);
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, action: "post" | "reverse") {
    setRowBusy(id);
    try {
      await api(`/p2/payroll-runs/${id}/${action}`, { body: {} });
      toast(action === "post" ? "Payroll diposting ke jurnal" : "Payroll dibatalkan/dibalik");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setRowBusy(null);
    }
  }

  const canPost = biz.can("finance:approve");
  return (
    <Card
      title="Penggajian (Payroll)"
      actions={biz.can("hr:write") ? <Button onClick={() => setOpen(true)}>+ Hitung Payroll</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Riwayat payroll"
          empty={<Empty title="Belum ada payroll run" />}
          columns={[
            { key: "periodMonth", label: "Periode" },
            { key: "totalGross", label: "Gaji Kotor", right: true, render: (r: any) => moneyCents(r.totalGross, biz.currency) },
            { key: "totalDeductions", label: "Potongan", right: true, render: (r: any) => moneyCents(r.totalDeductions, biz.currency) },
            { key: "totalNet", label: "Gaji Bersih", right: true, render: (r: any) => moneyCents(r.totalNet, biz.currency) },
            { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
            {
              key: "id", label: "Aksi", render: (r: any) =>
                canPost && (r.status === "draft" || r.status === "posted") ? (
                  <div className="flex gap-2">
                    {r.status === "draft" && <Button variant="secondary" loading={rowBusy === r.id} onClick={() => act(r.id, "post")}>Posting</Button>}
                    <Button variant="secondary" loading={rowBusy === r.id} onClick={() => act(r.id, "reverse")}>{r.status === "draft" ? "Batalkan" : "Balik jurnal"}</Button>
                  </div>
                ) : null,
            },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Hitung Payroll">
        <div className="grid gap-3">
          <p className="text-sm text-ink-2">Gaji pokok diambil dari data karyawan aktif dan potongan absensi dari catatan absensi berstatus “alpa”. Angka tidak diketik manual.</p>
          <TextField label="Periode (YYYY-MM)" value={period} onChange={setPeriod} />
          <SelectField label="Potongan absensi" value={mode} onChange={setMode} options={[{ value: "none", label: "Tidak ada potongan" }, { value: "per_working_day", label: "Per hari kerja (gaji ÷ hari kerja × hari alpa)" }]} />
          {mode === "per_working_day" && <TextField label="Jumlah hari kerja sebulan" inputMode="numeric" value={workingDays} onChange={(v) => setWorkingDays(v.replace(/\D/g, ""))} />}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!/^\d{4}-\d{2}$/.test(period) || (mode === "per_working_day" && !Number(workingDays))} onClick={calculate}>Hitung</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

/* ───────── 4. Tasks: Komentar & Checklist Tugas ───────── */
export function TaskCommentsPanel() {
  const biz = useBiz();
  const tasks = useApi<any>("/r/tasks?limit=100");
  const [selectedTask, setSelectedTask] = useState("");
  const taskId = selectedTask || tasks.data?.items?.[0]?.id || "";
  const comments = useApi<any>(taskId ? `/p2/tasks/${taskId}/comments` : null);
  const [body, setBody] = useState("");
  const [checkItem, setCheckItem] = useState("");
  const [checkDone, setCheckDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!taskId || !body.trim()) return;
    setBusy(true);
    try {
      await api(`/p2/tasks/${taskId}/comments`, {
        body: {
          body,
          checklist: checkItem.trim() ? [{ label: checkItem.trim(), done: checkDone }] : [],
        },
      });
      toast("Komentar tugas ditambahkan");
      setBody("");
      setCheckItem("");
      setCheckDone(false);
      comments.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Komentar & Checklist Tugas" desc="Diskusi dan daftar periksa per tugas tim.">
      <div className="mb-4 max-w-md">
        <SelectField
          label="Pilih Tugas"
          value={taskId}
          onChange={setSelectedTask}
          options={(tasks.data?.items ?? []).map((t: any) => ({ value: t.id, label: t.title }))}
          placeholder="Pilih tugas"
        />
      </div>
      {!taskId ? (
        <Empty title="Belum ada tugas" hint="Buat tugas terlebih dahulu di tab Daftar Tugas." />
      ) : comments.loading && !comments.data ? (
        <Loading />
      ) : (
        <div className="grid gap-4">
          {(comments.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-ink-2">Belum ada komentar pada tugas ini.</p>
          ) : (
            <ul className="grid gap-2.5">
              {(comments.data?.items ?? []).map((c: any) => (
                <li key={c.id} className="rounded-2xl border border-line bg-surface/60 p-3.5 text-sm">
                  <div className="flex items-center justify-between text-xs text-ink-2">
                    <span className="font-semibold text-ink">{c.author}</span>
                    <span>{fmtDateTime(c.createdAt)}</span>
                  </div>
                  <p className="mt-1">{c.body}</p>
                  {(c.checklist ?? []).length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs">
                      {c.checklist.map((it: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span>{it.done ? "☑" : "☐"}</span>
                          <span className={it.done ? "line-through text-ink-2" : ""}>{it.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          {biz.can("tasks:write") && (
            <div className="grid gap-3 rounded-2xl border border-line p-4">
              <TextField label="Tulis komentar" value={body} onChange={setBody} placeholder="Catatan progres atau arahan…" />
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <TextField label="Item checklist (opsional)" value={checkItem} onChange={setCheckItem} />
                <div className="self-end">
                  <Check label="Selesai" checked={checkDone} onChange={setCheckDone} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button loading={busy} disabled={!body.trim()} onClick={send}>Kirim Komentar</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ───────── 5. Finance: Rekonsiliasi Bank & Credit Note ───────── */
export function BankReconPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/bank-reconciliations");
  const accs = useApi<any>("/finance/cash-accounts");
  const [open, setOpen] = useState(false);
  const [accId, setAccId] = useState("");
  const [stmtDate, setStmtDate] = useState(toInputDate());
  const [stmtBal, setStmtBal] = useState("");
  const [bookBal, setBookBal] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const accOpts = (accs.data?.items ?? []).map((a: any) => ({ value: a.id, label: a.name }));

  async function save() {
    setBusy(true);
    try {
      await api("/p2/bank-reconciliations", {
        body: {
          accountId: accId || accOpts[0]?.value,
          statementDate: stmtDate,
          statementBalance: stmtBal || "0",
          bookBalance: bookBal || "0",
          note: note || undefined,
        },
      });
      toast("Rekonsiliasi bank dicatat");
      setOpen(false);
      setStmtBal("");
      setBookBal("");
      setNote("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Rekonsiliasi Bank"
      desc="Cocokkan saldo rekening koran dengan saldo buku besar."
      actions={biz.can("finance:write") && accOpts.length > 0 ? <Button onClick={() => setOpen(true)}>+ Catat Rekonsiliasi</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Rekonsiliasi bank"
          empty={<Empty title="Belum ada rekonsiliasi bank" />}
          columns={[
            { key: "statementDate", label: "Tanggal", render: (r: any) => fmtDate(r.statementDate) },
            { key: "statementBalance", label: "Saldo Rekening", right: true, render: (r: any) => moneyCents(r.statementBalance, biz.currency) },
            { key: "bookBalance", label: "Saldo Buku", right: true, render: (r: any) => moneyCents(r.bookBalance, biz.currency) },
            { key: "difference", label: "Selisih", right: true, render: (r: any) => moneyCents(r.difference, biz.currency) },
            { key: "status", label: "Status", render: (r: any) => <Badge tone={r.status === "reconciled" ? "good" : "warn"}>{r.status}</Badge> },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Catat Rekonsiliasi Bank">
        <div className="grid gap-3">
          <SelectField label="Akun Kas / Bank" value={accId || accOpts[0]?.value || ""} onChange={setAccId} options={accOpts} />
          <TextField label="Tanggal Rekening Koran" type="date" value={stmtDate} onChange={setStmtDate} />
          <TextField label="Saldo Rekening Koran" inputMode="decimal" value={stmtBal} onChange={(v) => setStmtBal(v.replace(/[^\d.-]/g, ""))} />
          <TextField label="Saldo Buku Besar" inputMode="decimal" value={bookBal} onChange={(v) => setBookBal(v.replace(/[^\d.-]/g, ""))} />
          <TextField label="Catatan" value={note} onChange={setNote} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!stmtBal || !bookBal} onClick={save}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export function CreditNotePanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/p2/credit-notes");
  const clients = useApi<any>(biz.can("crm:read") ? "/r/clients?limit=200" : null);
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api("/p2/credit-notes", {
        body: { clientId: clientId || undefined, amount, reason },
      });
      toast("Credit Note dibuat");
      setOpen(false);
      setAmount("");
      setReason("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Credit Note"
      desc="Terbitkan nota kredit untuk penyesuaian tagihan atau pengembalian dana pelanggan."
      actions={biz.can("finance:write") ? <Button onClick={() => setOpen(true)}>+ Buat Credit Note</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Credit Note"
          empty={<Empty title="Belum ada Credit Note" />}
          columns={[
            { key: "number", label: "No. CN" },
            { key: "createdAt", label: "Tanggal", render: (r: any) => fmtDateTime(r.createdAt) },
            { key: "reason", label: "Alasan" },
            { key: "amount", label: "Nominal", right: true, render: (r: any) => moneyCents(r.amount, biz.currency) },
            { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Buat Credit Note">
        <div className="grid gap-3">
          {clients.data && (
            <SelectField
              label="Pelanggan (opsional)"
              value={clientId}
              onChange={setClientId}
              placeholder="Umum"
              options={clients.data.items.map((c: any) => ({ value: c.id, label: c.name }))}
            />
          )}
          <TextField label="Nominal" inputMode="decimal" value={amount} onChange={(v) => setAmount(v.replace(/[^\d.]/g, ""))} />
          <TextField label="Alasan" value={reason} onChange={setReason} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!amount || !reason.trim()} onClick={save}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

/* ───────── 6. Legal: Permintaan Subjek Data (DSR / UU PDP) ───────── */
export function DsrPanel() {
  const biz = useBiz();
  const canRead = biz.can("settings:write");
  const { data, error, loading, reload } = useApi<any>(canRead ? "/p2/privacy/dsr" : null);
  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [requestType, setRequestType] = useState<"access" | "rectification" | "erasure" | "restriction">("access");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  if (!canRead) return null;

  async function save() {
    setBusy(true);
    try {
      await api("/p2/privacy/dsr", {
        body: { subjectName, requestType, notes: notes || undefined },
      });
      toast("Permintaan Subjek Data dicatat");
      setOpen(false);
      setSubjectName("");
      setNotes("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Permintaan Subjek Data (UU PDP / DSR)"
      desc="Catat permintaan akses, perbaikan, pembatasan, atau penghapusan data pribadi pelanggan/karyawan."
      actions={<Button onClick={() => setOpen(true)}>+ Catat Permintaan DSR</Button>}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Permintaan Subjek Data"
          empty={<Empty title="Belum ada permintaan DSR" />}
          columns={[
            { key: "subjectName", label: "Nama Subjek Data" },
            { key: "requestType", label: "Jenis Permintaan", render: (r: any) => <Badge tone="info">{r.requestType}</Badge> },
            { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
            { key: "notes", label: "Catatan", render: (r: any) => r.notes || "—" },
            { key: "createdAt", label: "Tanggal", render: (r: any) => fmtDateTime(r.createdAt) },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Catat Permintaan Subjek Data">
        <div className="grid gap-3">
          <TextField label="Nama Subjek Data" value={subjectName} onChange={setSubjectName} />
          <SelectField
            label="Jenis Permintaan"
            value={requestType}
            onChange={(v) => setRequestType(v as any)}
            options={[
              { value: "access", label: "Akses Data (Access)" },
              { value: "rectification", label: "Perbaikan Data (Rectification)" },
              { value: "restriction", label: "Pembatasan Pemrosesan (Restriction)" },
              { value: "erasure", label: "Penghapusan Data (Erasure)" },
            ]}
          />
          <TextField label="Catatan" value={notes} onChange={setNotes} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!subjectName.trim()} onClick={save}>Simpan DSR</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
