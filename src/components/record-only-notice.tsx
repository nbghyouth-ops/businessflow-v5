/**
 * R1 — pemberitahuan record-only yang WAJIB tampil pada setiap form bernilai uang.
 * Teks mengikuti kontrak label UI (ID/EN) pada aturan terkunci.
 */
export function RecordOnlyNotice({ className = "" }: { className?: string }) {
  return (
    <p
      lang="id"
      className={`rounded-xl border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-ink-2 ${className}`}
    >
      <span className="block font-semibold text-ink">Business Flow hanya mencatat.</span>
      Pembayaran, transfer, pencairan, dan pengembalian dana dilakukan di luar aplikasi.
      <span lang="en" className="mt-1 block text-[11px] text-ink-2">
        Business Flow only records. Payments, transfers, payouts, and refunds happen outside the app.
      </span>
    </p>
  );
}
