"use client";
 
import { useRef, useState } from "react";
import { api, fmtDateTime, toast, useApi } from "@/lib/client";
import { useConfirm } from "./confirm-dialog";
import { beginExternalPicker } from "./lock-provider";
import { Badge, Button, Card, DataTable, SelectField } from "./ui";

function parseCsvSimple(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const splitRow = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQ = !inQ;
      } else if (ch === "," && !inQ) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };
  const headers = splitRow(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const vals = splitRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] ?? "";
    });
    return obj;
  });
}

export function ImportCenter() {
  const { data, reload } = useApi<any>("/p2/imports");
  const [target, setTarget] = useState<"clients" | "products">("clients");
  const [filename, setFilename] = useState("");
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { confirm, ConfirmUI } = useConfirm();

  async function onFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const rows = parseCsvSimple(text);
    setFilename(file.name);
    setPreviewRows(rows);
    if (!rows.length) toast("CSV kosong atau tidak memiliki header + baris data.", "err");
  }

  async function commit() {
    if (!previewRows.length) return;
    setBusy(true);
    try {
      const r = await api<any>("/p2/imports/commit", {
        body: { target, filename: filename || "import.csv", rows: previewRows },
      });
      toast(`Impor selesai: ${r.importedRows} berhasil, ${r.errorRows} gagal`);
      setPreviewRows([]);
      setFilename("");
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function rollback(id: string) {
    if (!(await confirm({ title: "Rollback Impor", message: "Hapus semua baris yang diimpor pada batch ini?", confirmLabel: "Rollback" }))) {
      return;
    }
    try {
      const r = await api<any>(`/p2/imports/${id}/rollback`, { body: {} });
      toast(`Rollback berhasil (${r.rolledBackCount} baris dihapus)`);
      reload();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <>
      {ConfirmUI}
      <Card
        title="Import / Migration Center (CSV + Rollback)"
        desc="Pratinjau baris per baris sebelum disimpan. Setiap batch dapat di-rollback bila terjadi kesalahan."
      >
        <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
          <SelectField
            label="Target data"
            value={target}
            onChange={(v) => setTarget(v as "clients" | "products")}
            options={[
              { value: "clients", label: "Klien (name, phone, email)" },
              { value: "products", label: "Produk (sku, name, price)" },
            ]}
          />
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <Button
              variant="secondary"
              onClick={() => {
                beginExternalPicker(30_000);
                inputRef.current?.click();
              }}
            >
              Pilih Berkas CSV {filename ? `(${filename})` : ""}
            </Button>
          </div>
          {previewRows.length > 0 && (
            <Button loading={busy} onClick={() => void commit()}>
              Impor {previewRows.length} Baris
            </Button>
          )}
        </div>

        {previewRows.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-primary-deep">Pratinjau 5 baris pertama dari {previewRows.length} baris:</p>
            <pre className="max-h-40 overflow-auto rounded-xl border border-line bg-surface p-3 text-xs">
              {JSON.stringify(previewRows.slice(0, 5), null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-5">
          <DataTable
            rows={data?.items ?? []}
            caption="Riwayat batch impor"
            empty="Belum ada riwayat impor."
            columns={[
              { key: "filename", label: "Berkas" },
              { key: "target", label: "Target" },
              { key: "importedRows", label: "Masuk", right: true },
              { key: "errorRows", label: "Galat", right: true },
              { key: "status", label: "Status", render: (r: any) => <Badge status={r.status} /> },
              { key: "createdAt", label: "Waktu", render: (r: any) => fmtDateTime(r.createdAt) },
              {
                key: "a",
                label: "",
                render: (r: any) =>
                  r.status === "committed" ? (
                    <Button variant="ghost" className="!min-h-[32px] !px-2 text-xs !text-[var(--color-danger-strong)]" onClick={() => void rollback(r.id)}>
                      Rollback
                    </Button>
                  ) : null,
              },
            ]}
          />
        </div>
      </Card>
    </>
  );
}
