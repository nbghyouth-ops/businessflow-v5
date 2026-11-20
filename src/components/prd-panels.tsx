"use client";
 
import { useState } from "react";
import { useBiz } from "@/components/shell";
import { Badge, Button, Card, DataTable, Empty, ErrorBox, Loading, Modal, SelectField, TextField } from "@/components/ui";
import { api, fmtDate, fmtDateTime, toast, toInputDate, useApi } from "@/lib/client";
import { formatMoney, fromCents } from "@/lib/money";

const moneyCents = (v: unknown, cur: string) => {
  try {
    return formatMoney(fromCents(BigInt(String(v ?? "0").split(".")[0] || "0")), cur);
  } catch {
    return formatMoney("0", cur);
  }
};

/* ───────── 1. POS Shift & Meja / Ruang (POS-01..07) ───────── */
export function PosShiftTablePanel() {
  const biz = useBiz();
  const shifts = useApi<any>("/prd/shifts");
  const tables = useApi<any>("/prd/tables");
  const [openModal, setOpenModal] = useState(false);
  const [closeId, setCloseId] = useState<string | null>(null);
  const [openingCash, setOpeningCash] = useState("0");
  const [countedCash, setCountedCash] = useState("");
  const [cashIn, setCashIn] = useState("0");
  const [cashOut, setCashOut] = useState("0");
  const [note, setNote] = useState("");

  const [tableModal, setTableModal] = useState(false);
  const [tCode, setTCode] = useState("");
  const [tName, setTName] = useState("");
  const [tCap, setTCap] = useState("4");
  const [busy, setBusy] = useState(false);

  async function openShift() {
    setBusy(true);
    try {
      await api("/prd/shifts/open", { body: { openingCash: openingCash || "0", note: note || undefined } });
      toast("Shift kasir dibuka");
      setOpenModal(false);
      setNote("");
      shifts.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function closeShift() {
    if (!closeId) return;
    setBusy(true);
    try {
      const res = await api<any>(`/prd/shifts/${closeId}/close`, {
        body: { countedCash: countedCash || "0", cashIn: cashIn || "0", cashOut: cashOut || "0", note: note || undefined },
      });
      toast(`Shift ditutup. Selisih: ${moneyCents(res.variance, biz.currency)}`);
      setCloseId(null);
      setCountedCash("");
      setNote("");
      shifts.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function addTable() {
    setBusy(true);
    try {
      await api("/prd/tables", { body: { code: tCode, name: tName, capacity: Number(tCap || 4) } });
      toast("Meja/ruang ditambahkan");
      setTableModal(false);
      setTCode("");
      setTName("");
      tables.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function setTableStatus(id: string, status: "available" | "occupied" | "reserved") {
    try {
      await api(`/prd/tables/${id}`, { method: "PATCH", body: { status } });
      tables.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <div className="grid gap-6">
      <Card
        title="Shift Kasir & Kontrol Laci Kas"
        desc="Buka/tutup shift kasir dengan pencatatan kas masuk/keluar dan selisih fisik."
        actions={biz.can("sales:write") ? <Button onClick={() => setOpenModal(true)}>+ Buka Shift Kasir</Button> : undefined}
      >
        {shifts.error ? (
          <ErrorBox message={shifts.error} onRetry={shifts.reload} />
        ) : shifts.loading && !shifts.data ? (
          <Loading />
        ) : (
          <DataTable
            rows={shifts.data?.items ?? []}
            caption="Shift kasir"
            empty={<Empty title="Belum ada sesi shift" />}
            columns={[
              { key: "openedAt", label: "Dibuka", render: (r: any) => fmtDateTime(r.openedAt) },
              { key: "operator", label: "Operator", render: (r: any) => r.operator || "—" },
              { key: "openingCash", label: "Modal Awal", right: true, render: (r: any) => moneyCents(r.openingCash, biz.currency) },
              { key: "expectedCash", label: "Kas Diharapkan", right: true, render: (r: any) => moneyCents(r.expectedCash, biz.currency) },
              { key: "variance", label: "Selisih", right: true, render: (r: any) => (r.variance !== null ? moneyCents(r.variance, biz.currency) : "—") },
              { key: "status", label: "Status", render: (r: any) => <Badge tone={r.status === "open" ? "good" : "neutral"}>{r.status}</Badge> },
              {
                key: "a",
                label: "",
                right: true,
                render: (r: any) =>
                  r.status === "open" && biz.can("sales:write") ? (
                    <Button variant="secondary" className="!min-h-[32px] !px-2.5 text-xs" onClick={() => setCloseId(r.id)}>
                      Tutup Shift
                    </Button>
                  ) : null,
              },
            ]}
          />
        )}
      </Card>

      <Card
        title="Manajemen Meja & Ruang"
        desc="Pantau ketersediaan meja/ruang untuk layanan dine-in atau studio."
        actions={biz.can("sales:write") ? <Button variant="secondary" onClick={() => setTableModal(true)}>+ Tambah Meja/Ruang</Button> : undefined}
      >
        {tables.loading && !tables.data ? (
          <Loading />
        ) : !(tables.data?.items?.length) ? (
          <Empty title="Belum ada meja atau ruang" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tables.data.items.map((t: any) => (
              <div key={t.id} className="rounded-2xl border border-line bg-surface/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{t.code} · {t.name}</span>
                  <Badge tone={t.status === "available" ? "good" : t.status === "occupied" ? "bad" : "warn"}>{t.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-2">Kapasitas {t.capacity} orang</p>
                {biz.can("sales:write") && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(["available", "occupied", "reserved"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => void setTableStatus(t.id, st)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.status === st ? "bg-primary-deep text-white" : "bg-white text-ink-2 border border-line"}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Buka Shift Kasir">
        <div className="grid gap-3">
          <TextField label="Modal Awal Laci Kas" inputMode="decimal" value={openingCash} onChange={(v) => setOpeningCash(v.replace(/[^\d.]/g, ""))} />
          <TextField label="Catatan" value={note} onChange={setNote} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpenModal(false)}>Batal</Button>
            <Button loading={busy} onClick={openShift}>Buka Shift</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!closeId} onClose={() => setCloseId(null)} title="Tutup Shift & Hitung Kas">
        <div className="grid gap-3">
          <TextField label="Jumlah Uang Fisik di Laci" inputMode="decimal" value={countedCash} onChange={(v) => setCountedCash(v.replace(/[^\d.]/g, ""))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Kas Masuk Tambahan" inputMode="decimal" value={cashIn} onChange={(v) => setCashIn(v.replace(/[^\d.]/g, ""))} />
            <TextField label="Kas Keluar / Petty Cash" inputMode="decimal" value={cashOut} onChange={(v) => setCashOut(v.replace(/[^\d.]/g, ""))} />
          </div>
          <TextField label="Catatan Selisih" value={note} onChange={setNote} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCloseId(null)}>Batal</Button>
            <Button loading={busy} disabled={!countedCash} onClick={closeShift}>Tutup & Hitung</Button>
          </div>
        </div>
      </Modal>

      <Modal open={tableModal} onClose={() => setTableModal(false)} title="Tambah Meja / Ruang">
        <div className="grid gap-3">
          <TextField label="Kode" value={tCode} onChange={setTCode} placeholder="M01" />
          <TextField label="Nama Meja / Ruang" value={tName} onChange={setTName} placeholder="Meja Utama 1" />
          <TextField label="Kapasitas" inputMode="numeric" value={tCap} onChange={(v) => setTCap(v.replace(/\D/g, ""))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setTableModal(false)}>Batal</Button>
            <Button loading={busy} disabled={!tCode.trim() || !tName.trim()} onClick={addTable}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ───────── 2. Batch, Serial, Expiry & Waste (INV-11..15) ───────── */
export function BatchWastePanel() {
  const biz = useBiz();
  const batches = useApi<any>("/prd/batches");
  const waste = useApi<any>("/prd/waste");
  const prods = useApi<any>("/r/products?limit=200");
  const [bOpen, setBOpen] = useState(false);
  const [wOpen, setWOpen] = useState(false);
  const [prodId, setProdId] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [qty, setQty] = useState("1");
  const [exp, setExp] = useState("");
  const [reason, setReason] = useState("");
  const [cost, setCost] = useState("0");
  const [busy, setBusy] = useState(false);

  const prodOpts = (prods.data?.items ?? []).map((p: any) => ({ value: p.id, label: `${p.name} (${p.sku})` }));
  const prodName = (id: string) => (prods.data?.items ?? []).find((p: any) => p.id === id)?.name ?? id.slice(0, 8);

  async function saveBatch() {
    setBusy(true);
    try {
      await api("/prd/batches", {
        body: {
          productId: prodId || prodOpts[0]?.value,
          batchNo,
          serialNo: serialNo || undefined,
          qty: Number(qty || 1),
          expiryDate: exp || undefined,
          cost: cost || "0",
        },
      });
      toast("Batch/Serial dicatat");
      setBOpen(false);
      setBatchNo("");
      setSerialNo("");
      batches.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function saveWaste() {
    setBusy(true);
    try {
      await api("/prd/waste", {
        body: { productId: prodId || prodOpts[0]?.value, qty: (qty || "1").replace(",", "."), reason },
      });
      toast("Waste/kerusakan stok dicatat");
      setWOpen(false);
      setReason("");
      waste.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card
        title="Pelacakan Batch, Serial & Kedaluwarsa (FEFO)"
        actions={biz.can("inventory:write") && prodOpts.length > 0 ? <Button onClick={() => setBOpen(true)}>+ Tambah Batch/Serial</Button> : undefined}
      >
        {batches.loading && !batches.data ? (
          <Loading />
        ) : (
          <DataTable
            rows={batches.data?.items ?? []}
            caption="Batch dan serial produk"
            empty={<Empty title="Belum ada data batch atau serial" />}
            columns={[
              { key: "productId", label: "Produk", render: (r: any) => prodName(r.productId) },
              { key: "batchNo", label: "No. Batch" },
              { key: "serialNo", label: "No. Serial", render: (r: any) => r.serialNo || "—" },
              { key: "qtyMilli", label: "Qty", right: true, render: (r: any) => String(Number(r.qtyMilli || 0) / 1000) },
              { key: "expiryDate", label: "Kedaluwarsa", render: (r: any) => (r.expiryDate ? fmtDate(r.expiryDate) : "—") },
              { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
            ]}
          />
        )}
      </Card>

      <Card
        title="Pencatatan Waste & Kerusakan Stok"
        actions={biz.can("inventory:write") && prodOpts.length > 0 ? <Button variant="secondary" onClick={() => setWOpen(true)}>+ Catat Waste</Button> : undefined}
      >
        {waste.loading && !waste.data ? (
          <Loading />
        ) : (
          <DataTable
            rows={waste.data?.items ?? []}
            caption="Waste stok"
            empty={<Empty title="Belum ada catatan waste/rusak" />}
            columns={[
              { key: "createdAt", label: "Tanggal", render: (r: any) => fmtDateTime(r.createdAt) },
              { key: "productId", label: "Produk", render: (r: any) => prodName(r.productId) },
              { key: "qtyMilli", label: "Qty", right: true, render: (r: any) => String(Number(r.qtyMilli || 0) / 1000) },
              { key: "reason", label: "Alasan" },
              { key: "costCents", label: "Estimasi Nilai", right: true, render: (r: any) => moneyCents(r.costCents, biz.currency) },
            ]}
          />
        )}
      </Card>

      <Modal open={bOpen} onClose={() => setBOpen(false)} title="Tambah Batch / Serial Number">
        <div className="grid gap-3">
          <SelectField label="Produk" value={prodId || prodOpts[0]?.value || ""} onChange={setProdId} options={prodOpts} />
          <TextField label="Nomor Batch / Lot" value={batchNo} onChange={setBatchNo} placeholder="BATCH-001" />
          <TextField label="Nomor Serial (opsional)" value={serialNo} onChange={setSerialNo} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Qty" inputMode="decimal" value={qty} onChange={(v) => setQty(v.replace(/[^\d.]/g, ""))} />
            <TextField label="Tanggal Kedaluwarsa" type="date" value={exp} onChange={setExp} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setBOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!batchNo.trim()} onClick={saveBatch}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <Modal open={wOpen} onClose={() => setWOpen(false)} title="Catat Stok Rusak / Waste">
        <div className="grid gap-3">
          <SelectField label="Produk" value={prodId || prodOpts[0]?.value || ""} onChange={setProdId} options={prodOpts} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Qty Rusak" inputMode="decimal" value={qty} onChange={(v) => setQty(v.replace(/[^\d.]/g, ""))} />
            <p className="text-sm text-ink-2">Nilai dihitung otomatis dari biaya rata-rata produk dan dijurnal ke selisih persediaan.</p>
          </div>
          <TextField label="Alasan" value={reason} onChange={setReason} placeholder="Kedaluwarsa / kemasan rusak" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setWOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!reason.trim()} onClick={saveWaste}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ───────── 3. Recipe, BOM & Work Orders (PRD-01..17) ───────── */
export function RecipeProductionPanel() {
  const biz = useBiz();
  const recipes = useApi<any>("/prd/recipes");
  const orders = useApi<any>("/prd/work-orders");
  const [rOpen, setROpen] = useState(false);
  const [wOpen, setWOpen] = useState(false);
  const [rName, setRName] = useState("");
  const [yieldQty, setYieldQty] = useState("1");
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState("1");
  const [selRecipe, setSelRecipe] = useState("");
  const [planQty, setPlanQty] = useState("1");
  const [laborCost, setLaborCost] = useState("0");
  const [busy, setBusy] = useState(false);

  const recOpts = (recipes.data?.items ?? []).map((r: any) => ({ value: r.id, label: `${r.name} (v${r.version})` }));

  async function saveRecipe() {
    setBusy(true);
    try {
      await api("/prd/recipes", {
        body: { name: rName, yieldQty: Number(yieldQty || 1), ingredients: [{ name: ingName, qty: Number(ingQty || 1), unit: "pcs" }] },
      });
      toast("Resep/BOM disimpan");
      setROpen(false);
      setRName("");
      setIngName("");
      recipes.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function saveWO() {
    setBusy(true);
    try {
      await api("/prd/work-orders", {
        body: { recipeId: selRecipe || undefined, plannedQty: Number(planQty || 1), laborCost: laborCost || "0" },
      });
      toast("Work Order dibuat");
      setWOpen(false);
      orders.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function completeWO(id: string, planned: string) {
    try {
      await api(`/prd/work-orders/${id}/complete`, { body: { actualQty: String(planned), wasteQty: "0" } });
      toast("Work Order diselesaikan");
      orders.reload();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <div className="grid gap-6">
      <Card
        title="Master Resep & Bill of Materials (BOM)"
        actions={biz.can("inventory:write") ? <Button onClick={() => setROpen(true)}>+ Tambah Resep/BOM</Button> : undefined}
      >
        {recipes.loading && !recipes.data ? (
          <Loading />
        ) : (
          <DataTable
            rows={recipes.data?.items ?? []}
            caption="Resep dan BOM"
            empty={<Empty title="Belum ada resep atau BOM" />}
            columns={[
              { key: "name", label: "Nama Resep" },
              { key: "version", label: "Versi", render: (r: any) => `v${r.version}` },
              { key: "yieldQty", label: "Hasil Standar", right: true, render: (r: any) => `${Number(r.yieldQty)} ${r.yieldUnit}` },
              { key: "ingredients", label: "Komponen", right: true, render: (r: any) => `${(r.ingredients ?? []).length} bahan` },
            ]}
          />
        )}
      </Card>

      <Card
        title="Perintah Produksi (Work Order)"
        actions={biz.can("inventory:write") ? <Button variant="secondary" onClick={() => setWOpen(true)}>+ Buat Work Order</Button> : undefined}
      >
        {orders.loading && !orders.data ? (
          <Loading />
        ) : (
          <DataTable
            rows={orders.data?.items ?? []}
            caption="Work Orders"
            empty={<Empty title="Belum ada Work Order" />}
            columns={[
              { key: "number", label: "No. WO" },
              { key: "plannedQty", label: "Target", right: true, render: (r: any) => String(Number(r.plannedQty)) },
              { key: "actualQty", label: "Hasil Aktual", right: true, render: (r: any) => String(Number(r.actualQty)) },
              { key: "totalCostCents", label: "Biaya Produksi", right: true, render: (r: any) => moneyCents(r.totalCostCents, biz.currency) },
              { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
              {
                key: "a",
                label: "",
                right: true,
                render: (r: any) =>
                  r.status !== "completed" && biz.can("inventory:write") ? (
                    <Button variant="secondary" className="!min-h-[30px] !px-2 text-xs" onClick={() => void completeWO(r.id, r.plannedQty)}>
                      Selesaikan
                    </Button>
                  ) : null,
              },
            ]}
          />
        )}
      </Card>

      <Modal open={rOpen} onClose={() => setROpen(false)} title="Buat Resep / BOM Baru">
        <div className="grid gap-3">
          <TextField label="Nama Resep / Produk Jadi" value={rName} onChange={setRName} />
          <TextField label="Hasil Yield Standar" inputMode="decimal" value={yieldQty} onChange={(v) => setYieldQty(v.replace(/[^\d.]/g, ""))} />
          <TextField label="Bahan Utama" value={ingName} onChange={setIngName} placeholder="Tepung / Kain / Komponen" />
          <TextField label="Qty Bahan" inputMode="decimal" value={ingQty} onChange={(v) => setIngQty(v.replace(/[^\d.]/g, ""))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setROpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!rName.trim() || !ingName.trim()} onClick={saveRecipe}>Simpan Resep</Button>
          </div>
        </div>
      </Modal>

      <Modal open={wOpen} onClose={() => setWOpen(false)} title="Buat Work Order">
        <div className="grid gap-3">
          <SelectField label="Resep / BOM (opsional)" value={selRecipe} onChange={setSelRecipe} placeholder="Pilih resep" options={recOpts} />
          <TextField label="Target Kuantitas" inputMode="decimal" value={planQty} onChange={(v) => setPlanQty(v.replace(/[^\d.]/g, ""))} />
          <TextField label="Biaya Tenaga Kerja" inputMode="decimal" value={laborCost} onChange={(v) => setLaborCost(v.replace(/[^\d.]/g, ""))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setWOpen(false)}>Batal</Button>
            <Button loading={busy} onClick={saveWO}>Buat WO</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ───────── 4. Fixed Asset & Depreciation (AST-01..19) ───────── */
export function FixedAssetDepPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/prd/assets");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Peralatan");
  const [acqDate, setAcqDate] = useState(toInputDate());
  const [cost, setCost] = useState("");
  const [resVal, setResVal] = useState("0");
  const [life, setLife] = useState("");
  const [method, setMethod] = useState<"straight_line" | "declining_balance">("straight_line");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!life || Number(life) <= 0) {
      toast("Umur manfaat (bulan) wajib diisi", "err");
      return;
    }
    setBusy(true);
    try {
      await api("/prd/assets", {
        body: { name, category, acquisitionDate: acqDate, acquisitionCost: cost, residualValue: resVal || "0", usefulLifeMonths: Number(life), method },
      });
      toast("Aset tetap ditambahkan");
      setOpen(false);
      setName("");
      setCost("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function depreciate(id: string) {
    const periodMonth = toInputDate().slice(0, 7);
    try {
      const res = await api<any>(`/prd/assets/${id}/depreciate`, { body: { periodMonth } });
      toast(`Penyusutan ${res.periodMonth}: ${moneyCents(res.amountCents, biz.currency)}`);
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <Card
      title="Register Aset Tetap & Penyusutan"
      desc="Hitung penyusutan periodik (Straight-line / Declining-balance) dan pantau nilai buku."
      actions={biz.can("assets:write") ? <Button onClick={() => setOpen(true)}>+ Tambah Aset Tetap</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Register aset tetap"
          empty={<Empty title="Belum ada aset tetap terdaftar" />}
          columns={[
            { key: "code", label: "Kode" },
            { key: "name", label: "Nama Aset" },
            { key: "acquisitionCostCents", label: "Nilai Perolehan", right: true, render: (r: any) => moneyCents(r.acquisitionCostCents, biz.currency) },
            { key: "accumulatedDepCents", label: "Akum. Penyusutan", right: true, render: (r: any) => moneyCents(r.accumulatedDepCents, biz.currency) },
            { key: "bookValueCents", label: "Nilai Buku", right: true, render: (r: any) => moneyCents(r.bookValueCents, biz.currency) },
            {
              key: "a",
              label: "",
              right: true,
              render: (r: any) =>
                biz.can("assets:write") ? (
                  <Button variant="secondary" className="!min-h-[30px] !px-2.5 text-xs" onClick={() => void depreciate(r.id)}>
                    Susutkan Bulan Ini
                  </Button>
                ) : null,
            },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Aset Tetap">
        <div className="grid gap-3">
          <TextField label="Nama Aset" value={name} onChange={setName} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Kategori" value={category} onChange={setCategory} />
            <TextField label="Tanggal Perolehan" type="date" value={acqDate} onChange={setAcqDate} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Harga Perolehan" inputMode="decimal" value={cost} onChange={(v) => setCost(v.replace(/[^\d.]/g, ""))} />
            <TextField label="Nilai Residu" inputMode="decimal" value={resVal} onChange={(v) => setResVal(v.replace(/[^\d.]/g, ""))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Umur Manfaat (bulan)" inputMode="numeric" value={life} onChange={(v) => setLife(v.replace(/\D/g, ""))} />
            <SelectField
              label="Metode"
              value={method}
              onChange={(v) => setMethod(v as any)}
              options={[
                { value: "straight_line", label: "Garis Lurus" },
                { value: "declining_balance", label: "Saldo Menurun" },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!name.trim() || !cost} onClick={save}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

/* ───────── 5. Commissions, Cost of Service & Operational Displays ───────── */
export function CommissionPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/prd/commissions");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [basis, setBasis] = useState<"product" | "service" | "target">("product");
  const [rate, setRate] = useState("5");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api("/prd/commissions", { body: { name, basis, ratePercent: Number(rate || 0) } });
      toast("Aturan komisi ditambahkan");
      setOpen(false);
      setName("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Aturan Komisi & Insentif"
      actions={biz.can("hr:write") ? <Button onClick={() => setOpen(true)}>+ Aturan Komisi</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Aturan komisi"
          empty={<Empty title="Belum ada aturan komisi" />}
          columns={[
            { key: "name", label: "Nama Aturan" },
            { key: "basis", label: "Basis", render: (r: any) => <Badge tone="info">{r.basis}</Badge> },
            { key: "ratePercent", label: "Tarif (%)", right: true, render: (r: any) => `${Number(r.ratePercent)}%` },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Aturan Komisi">
        <div className="grid gap-3">
          <TextField label="Nama Aturan" value={name} onChange={setName} />
          <SelectField
            label="Basis Komisi"
            value={basis}
            onChange={(v) => setBasis(v as any)}
            options={[
              { value: "product", label: "Penjualan Produk" },
              { value: "service", label: "Layanan / Jasa" },
              { value: "target", label: "Pencapaian Target" },
            ]}
          />
          <TextField label="Persentase (%)" inputMode="decimal" value={rate} onChange={(v) => setRate(v.replace(/[^\d.]/g, ""))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!name.trim()} onClick={save}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export function ServiceCostPanel() {
  const biz = useBiz();
  const { data, error, loading, reload } = useApi<any>("/prd/service-costs");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [labor, setLabor] = useState("0");
  const [mat, setMat] = useState("0");
  const [rev, setRev] = useState("0");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api("/prd/service-costs", { body: { serviceName: name, laborCost: labor || "0", materialCost: mat || "0", revenue: rev || "0" } });
      toast("Biaya layanan dicatat");
      setOpen(false);
      setName("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Cost of Service & Margin Layanan"
      actions={biz.can("ops:write") ? <Button onClick={() => setOpen(true)}>+ Catat Biaya Layanan</Button> : undefined}
    >
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : (
        <DataTable
          rows={data?.items ?? []}
          caption="Biaya layanan"
          empty={<Empty title="Belum ada catatan biaya layanan" />}
          columns={[
            { key: "serviceName", label: "Layanan" },
            { key: "laborCostCents", label: "Tenaga", right: true, render: (r: any) => moneyCents(r.laborCostCents, biz.currency) },
            { key: "materialCostCents", label: "Bahan", right: true, render: (r: any) => moneyCents(r.materialCostCents, biz.currency) },
            { key: "revenueCents", label: "Pendapatan", right: true, render: (r: any) => moneyCents(r.revenueCents, biz.currency) },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Catat Biaya Layanan">
        <div className="grid gap-3">
          <TextField label="Nama Layanan" value={name} onChange={setName} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Biaya Tenaga" inputMode="decimal" value={labor} onChange={(v) => setLabor(v.replace(/[^\d.]/g, ""))} />
            <TextField label="Biaya Bahan" inputMode="decimal" value={mat} onChange={(v) => setMat(v.replace(/[^\d.]/g, ""))} />
          </div>
          <TextField label="Pendapatan Diakui" inputMode="decimal" value={rev} onChange={(v) => setRev(v.replace(/[^\d.]/g, ""))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!name.trim()} onClick={save}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export function OperationalDisplayPanel() {
  const biz = useBiz();
  const [station, setStation] = useState("");
  const { data, error, loading, reload } = useApi<any>(`/prd/displays${station ? `?station=${station}` : ""}`);
  const [open, setOpen] = useState(false);
  const [st, setSt] = useState<"kitchen" | "production" | "warehouse" | "pickup">("kitchen");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api("/prd/displays", { body: { station: st, title, priority, items: [title] } });
      toast("Tiket antrean ditambahkan");
      setOpen(false);
      setTitle("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: "queued" | "in_progress" | "ready" | "completed") {
    try {
      await api(`/prd/displays/${id}`, { method: "PATCH", body: { status } });
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <Card
      title="Operational Display & Antrean (KDS / Produksi / Gudang / Pickup)"
      actions={biz.can("ops:write") ? <Button onClick={() => setOpen(true)}>+ Tiket Antrean</Button> : undefined}
    >
      <div className="mb-4 max-w-xs">
        <SelectField
          label="Filter Stasiun"
          value={station}
          onChange={setStation}
          placeholder="Semua Stasiun"
          options={[
            { value: "kitchen", label: "Dapur (KDS)" },
            { value: "production", label: "Produksi" },
            { value: "warehouse", label: "Gudang (Picking/Packing)" },
            { value: "pickup", label: "Pickup / Antrean Pelanggan" },
          ]}
        />
      </div>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : !(data?.items?.length) ? (
        <Empty title="Belum ada tiket di display" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((t: any) => (
            <div key={t.id} className="rounded-2xl border border-line bg-surface/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-primary-deep">{t.ticketNo} · {t.station.toUpperCase()}</span>
                <Badge status={t.priority}>{t.priority}</Badge>
              </div>
              <p className="mt-1.5 font-semibold text-ink">{t.title}</p>
              <p className="mt-0.5 text-xs text-ink-2">{fmtDateTime(t.createdAt)}</p>
              {biz.can("ops:write") && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(["queued", "in_progress", "ready", "completed"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void updateStatus(t.id, s)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.status === s ? "bg-[var(--color-action-deep)] text-white" : "bg-white text-ink-2 border border-line"}`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Tiket Operational Display">
        <div className="grid gap-3">
          <SelectField
            label="Stasiun"
            value={st}
            onChange={(v) => setSt(v as any)}
            options={[
              { value: "kitchen", label: "Dapur (KDS)" },
              { value: "production", label: "Produksi" },
              { value: "warehouse", label: "Gudang" },
              { value: "pickup", label: "Pickup Pelanggan" },
            ]}
          />
          <TextField label="Judul / Pesanan" value={title} onChange={setTitle} />
          <SelectField
            label="Prioritas"
            value={priority}
            onChange={(v) => setPriority(v as any)}
            options={[
              { value: "normal", label: "Normal" },
              { value: "high", label: "Tinggi" },
              { value: "urgent", label: "Mendesak" },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={busy} disabled={!title.trim()} onClick={save}>Kirim ke Display</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
