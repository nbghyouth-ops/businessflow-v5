"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { api, fmtDateTime, useApi } from "@/lib/client";
import { can, type Permission } from "@/lib/permissions";
import { useLock } from "./lock-provider";
import { AccountMenu } from "./account-menu";
import { useScrolled } from "./motion";
import { Button, ErrorBox, Loading, Logo, Modal, Toaster } from "./ui";
import { FallbackBanner } from "./fallback/boundaries";

export type BizCtx = {
  business: any;
  branches: any[];
  warehouses: any[];
  template: any;
  role: string;
  currency: string;
  reload: () => void;
  mode: "simple" | "advanced";
  setMode: (m: "simple" | "advanced") => void;
  can: (p: Permission) => boolean;
};
const Ctx = createContext<BizCtx | null>(null);
export const useBiz = () => useContext(Ctx)!;

type Item = { href: string; label: string; perm?: Permission; key: string; advanced?: boolean };

/** IA v4.1 (D1 §4.1) — 5 grup, label Indonesia, route tidak berubah. */
const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Utama", items: [{ href: "/dashboard", label: "Beranda", key: "dashboard" }] },
  {
    title: "Operasional",
    items: [
      { href: "/finance", label: "Keuangan", perm: "finance:read", key: "finance" },
      { href: "/sales", label: "Penjualan & Kasir", perm: "sales:read", key: "sales" },
      { href: "/bookings", label: "Pesanan & Booking", perm: "booking:read", key: "bookings" },
      { href: "/products", label: "Produk & Stok", perm: "inventory:read", key: "products" },
      { href: "/purchasing", label: "Pembelian", perm: "purchasing:read", key: "purchasing" },
      { href: "/crm", label: "Klien / CRM", perm: "crm:read", key: "crm" },
    ],
  },
  {
    title: "Manajemen",
    items: [
      { href: "/hr", label: "Karyawan & HR", perm: "hr:read", key: "hr", advanced: true },
      { href: "/tasks", label: "Tugas & Tim", perm: "tasks:read", key: "tasks" },
      { href: "/operations", label: "Operasional & Kas", perm: "ops:read", key: "operations", advanced: true },
      { href: "/marketing", label: "Pemasaran", perm: "marketing:read", key: "marketing", advanced: true },
      { href: "/projects", label: "Proyek", perm: "projects:read", key: "projects", advanced: true },
      { href: "/assets", label: "Aset & Dokumen", perm: "assets:read", key: "assets", advanced: true },
    ],
  },
  {
    title: "Laporan",
    items: [
      { href: "/reports", label: "Laporan & Analitik", perm: "reports:read", key: "reports" },
      { href: "/reports/export", label: "Pusat Ekspor", perm: "reports:read", key: "export" },
    ],
  },
  {
    title: "Konfigurasi",
    items: [
      { href: "/settings", label: "Pengaturan", perm: "settings:write", key: "settings" },
      { href: "/templates", label: "Template Bisnis", key: "templates", advanced: true },
      { href: "/devices", label: "Perangkat & Keamanan", perm: "devices:read", key: "devices" },
      { href: "/legal", label: "Syarat & Privasi", key: "legal" },
      { href: "/help", label: "Bantuan", key: "help" },
    ],
  },
];

/* Ikon garis (stroke 1.7) — satu set untuk sidebar, rail, dan bottom nav. */
const ICONS: Record<string, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>,
  finance: <><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v2h-4a3 3 0 000 6h4v2a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /><circle cx="17" cy="12" r="1" /></>,
  sales: <><path d="M3 5h2l2.4 10.2A2 2 0 009.35 17h8.3a2 2 0 001.95-1.55L21 8H6" /><circle cx="10" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></>,
  bookings: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18M9 15h2M13 15h2" /></>,
  products: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></>,
  purchasing: <><path d="M4 6h2l2 11h9l2-8H7" /><path d="M9 20h.01M17 20h.01M14 3v4M12 5h4" /></>,
  crm: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0112 0M16 5.5a3 3 0 010 5.6M18 20a5.5 5.5 0 00-2-4.3" /></>,
  hr: <><circle cx="12" cy="7" r="3.4" /><path d="M5 21a7 7 0 0114 0" /></>,
  tasks: <><path d="M4 6h16M4 12h16M4 18h10" /><path d="M3 5.9l.9.9L5.5 5" /></>,
  operations: <><path d="M4 21V8l8-4 8 4v13" /><path d="M9 21v-6h6v6M8 11h.01M16 11h.01" /></>,
  marketing: <><path d="M4 10v4l12 6V4L4 10z" /><path d="M16 8a4 4 0 010 8M7 14l1 6" /></>,
  projects: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 9h18M9 9v11" /></>,
  assets: <><path d="M3 8a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /><path d="M9 14h6" /></>,
  reports: <><path d="M4 20V5M4 20h16" /><rect x="7" y="12" width="3" height="5" /><rect x="12" y="9" width="3" height="8" /><rect x="17" y="6" width="3" height="11" /></>,
  export: <><path d="M12 3v12M8 11l4 4 4-4" /><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06A1.7 1.7 0 0015 19.4a1.7 1.7 0 00-1 1.56V21a2 2 0 11-4 0v-.1A1.7 1.7 0 009 19.4a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.56-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.6h.1A1.7 1.7 0 0010 3V3a2 2 0 114 0v.1A1.7 1.7 0 0015 4.6a1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9v.1a1.7 1.7 0 001.56 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></>,
  templates: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 10h18M9 10v10" /></>,
  devices: <><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 018 0v3" /></>,
  legal: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.6 2.6 0 015.1.7c0 1.7-2.6 2-2.6 3.6M12 17h.01" /></>,
  more: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>,
  bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0" /></>,
};

function NavIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {ICONS[name] ?? ICONS.dashboard}
    </svg>
  );
}

const TOUR = [
  { sel: "[data-tour=sidebar]", title: "Navigasi", text: "Semua modul ada di sini, dikelompokkan sesuai alur kerja. Titik periwinkle menandai modul prioritas untuk template bisnis Anda." },
  { sel: "[data-tour=topbar]", title: "Bar atas", text: "Cari klien/produk/faktur, lihat notifikasi, bantuan, status perangkat, dan tombol Kunci." },
  { sel: "[data-tour=biz]", title: "Bisnis & cabang", text: "Menampilkan bisnis dan cakupan cabang perangkat ini. Kelola cabang di Pengaturan." },
  { sel: "[data-tour=page-header]", title: "Ringkasan", text: "Setiap halaman diawali judul dan rentang tanggal/aksi utama." },
  { sel: "[data-tour=quick]", title: "Aksi cepat", text: "Catat pemasukan, pengeluaran, atau transfer dengan keypad angka dari sini." },
  { sel: "[data-tour=nav-finance]", title: "Keuangan", text: "Akun kas & bank, transaksi, jurnal, piutang/utang, anggaran, dan penutupan periode." },
  { sel: "[data-tour=nav-crm]", title: "Klien / CRM", text: "Pusat data klien: kontak, aktivitas, faktur, dan riwayat." },
  { sel: "[data-tour=nav-products]", title: "Produk & Stok", text: "Katalog, ledger stok, dan penyesuaian stok." },
  { sel: "[data-tour=nav-reports]", title: "Laporan", text: "Neraca saldo, laba rugi, neraca, arus kas, buku besar. Ekspor CSV/PDF/XLSX tersedia." },
  { sel: "[data-tour=nav-devices]", title: "Perangkat & Keamanan", text: "Tambah perangkat dengan kode pairing, atur peran, cabut akses, dan lihat audit." },
  { sel: "[data-tour=nav-help]", title: "Bantuan", text: "Panduan, FAQ, glosarium, dan mulai ulang tur ini kapan saja." },
];

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("bf-mode", cb);
  window.addEventListener("bf-tour", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("bf-mode", cb);
    window.removeEventListener("bf-tour", cb);
  };
}

export function Shell({
  children,
  authMode = "google",
  emergencyExpiresAt = null,
}: {
  children: ReactNode;
  authMode?: "google" | "device";
  emergencyExpiresAt?: string | null;
}) {
  const { data, error, reload } = useApi<any>("/business");
  const savedMode = useSyncExternalStore(
    subscribeStorage,
    () => (typeof window !== "undefined" ? (localStorage.getItem("bf_mode") as "simple" | "advanced" | null) : null),
    () => null,
  );
  const mode: "simple" | "advanced" = savedMode ?? data?.business?.settings?.mode ?? "simple";
  const setMode = (m: "simple" | "advanced") => {
    localStorage.setItem("bf_mode", m);
    window.dispatchEvent(new Event("bf-mode"));
  };

  const value = useMemo<BizCtx | null>(
    () =>
      data
        ? {
            ...data,
            currency: data.business.currency,
            reload,
            mode,
            setMode,
            can: (p: Permission) => can(data.role, p),
          }
        : null,
    [data, mode, reload],
  );
  if (error) return <div className="p-8"><ErrorBox message={error} onRetry={reload} /></div>;
  if (!value) return <Loading text="Menyiapkan dashboard…" />;
  return (
    <Ctx.Provider value={value}>
      <Frame authMode={authMode} emergencyExpiresAt={emergencyExpiresAt}>{children}</Frame>
      <Toaster />
    </Ctx.Provider>
  );
}

function Frame({
  children,
  authMode = "google",
  emergencyExpiresAt = null,
}: {
  children: ReactNode;
  authMode?: "google" | "device";
  emergencyExpiresAt?: string | null;
}) {
  const biz = useBiz();
  const scrolled = useScrolled();
  const path = usePathname();
  const { lock } = useLock();
  const [more, setMore] = useState(false);
  const recommended = new Set<string>(biz.template.modules);
  const visible = (i: Item) =>
    (!i.perm || biz.can(i.perm)) && (biz.mode === "advanced" || !i.advanced || recommended.has(i.key));
  const mainBranch = biz.branches.find((b: any) => b.isMain)?.name ?? "Pusat";
  const isActive = (href: string) =>
    path === href || (href !== "/reports" && href !== "/dashboard" && path.startsWith(href + "/"));
  const groups = GROUPS.map((g) => ({ ...g, items: g.items.filter(visible) })).filter((g) => g.items.length);

  return (
    <div className="min-h-dvh bg-surface md:bg-surface">
      <a href="#konten" className="skip-link">
        Lewati ke konten utama
      </a>

      <div className="md:grid md:grid-cols-[88px_minmax(0,1fr)] md:gap-3 md:p-3 xl:grid-cols-[232px_minmax(0,1fr)]">
        {/* ── Sidebar periwinkle: rail 88 px (tablet) → 232 px (desktop) ── */}
        <aside
          data-tour="sidebar"
          aria-label="Navigasi utama"
          className="bf-sidebar sticky top-3 hidden h-[calc(100dvh-1.5rem)] flex-col justify-between overflow-y-auto px-3 py-4 md:flex"
        >
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-center gap-2.5 px-1 xl:justify-start">
              <Logo size={36} />
            </div>
            <nav className="space-y-4">
              {groups.map((g) => (
                <div key={g.title}>
                  <p className="mb-1 hidden px-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--color-on-accent)]/70 xl:block">
                    {g.title}
                  </p>
                  <ul className="space-y-0.5">
                    {g.items.map((i) => {
                      const active = isActive(i.href);
                      return (
                        <li key={i.href}>
                          <Link
                            href={i.href}
                            data-tour={`nav-${i.key}`}
                            aria-current={active ? "page" : undefined}
                            title={i.label}
                            className="bf-nav-item justify-center xl:justify-start"
                          >
                            <NavIcon name={i.key} />
                            <span className="hidden min-w-0 flex-1 truncate xl:block">{i.label}</span>
                            {recommended.has(i.key) && (
                              <span
                                title="Prioritas untuk template bisnis Anda"
                                aria-label="Prioritas template"
                                className={`hidden h-2 w-2 shrink-0 rounded-full xl:block ${active ? "bg-[var(--color-accent)]" : "bg-[var(--color-action)]/45"}`}
                              />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-4 hidden rounded-[20px] bg-white/70 p-3.5 xl:block">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--color-on-accent)]">Mode Tampilan</p>
            <p className="mt-1 text-sm font-bold text-ink">{biz.mode === "simple" ? "Mode Sederhana" : "Mode Lanjutan"}</p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-[var(--color-on-accent)]">
              {biz.mode === "simple" ? "Menampilkan modul inti usaha Anda." : "Semua modul operasional & HR aktif."}
            </p>
            <button
              type="button"
              onClick={() => biz.setMode(biz.mode === "simple" ? "advanced" : "simple")}
              className="mt-3 w-full rounded-full bg-[var(--color-action)] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--color-action-hover)]"
            >
              {biz.mode === "simple" ? "Aktifkan Mode Lanjutan" : "Mode Sederhana"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => biz.setMode(biz.mode === "simple" ? "advanced" : "simple")}
            className="mx-auto mt-3 grid h-11 w-11 place-items-center rounded-full bg-white/70 text-[11px] font-bold text-ink xl:hidden"
            aria-label={biz.mode === "simple" ? "Aktifkan Mode Lanjutan" : "Kembali ke Mode Sederhana"}
            title={biz.mode === "simple" ? "Aktifkan Mode Lanjutan" : "Mode Sederhana"}
          >
            {biz.mode === "simple" ? "S" : "L"}
          </button>
        </aside>

        {/* ── Kolom konten ── */}
        <div className="min-w-0 bg-white md:min-h-[calc(100dvh-1.5rem)] md:overflow-hidden md:rounded-[24px] md:border md:border-line">
          <header
            data-tour="topbar"
            className={`topbar sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-transparent bg-white/95 px-3 backdrop-blur md:h-16 md:gap-3 md:px-6 ${
              scrolled ? "topbar-scrolled border-line" : ""
            }`}
          >
            <button
              aria-label="Buka semua modul"
              onClick={() => setMore(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink hover:bg-surface md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            <div data-tour="biz" className="flex min-w-0 items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-accent)] text-[11.5px] font-bold text-ink md:h-10 md:w-10 md:text-sm">
                {biz.business.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 leading-tight">
                <Link href="/settings" className="block truncate text-[13px] font-bold text-ink hover:underline md:text-sm">
                  {biz.business.name}
                </Link>
                <p className="hidden truncate text-[11px] text-ink-2 md:block">
                  {mainBranch}
                  {biz.branches.length > 1 ? ` (+${biz.branches.length - 1})` : ""} · Perangkat
                </p>
              </div>
            </div>

            <div className="hidden flex-1 md:block">
              <GlobalSearch />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
              <div className="hidden md:block">
                <DeviceChip />
              </div>
              <Bell />
              <Link
                href="/help"
                aria-label="Bantuan"
                title="Bantuan"
                className="hidden h-11 w-11 place-items-center rounded-full border border-line text-ink hover:bg-surface md:grid"
              >
                <NavIcon name="help" />
              </Link>
              <button
                type="button"
                onClick={lock}
                aria-label="Kunci layar"
                title="Kunci layar"
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink hover:bg-surface md:h-11 md:w-11"
              >
                <NavIcon name="lock" />
              </button>
              <AccountMenu currentWorkspaceName={biz.business.name} />
            </div>
          </header>

          {emergencyExpiresAt ? (
            <FallbackBanner kind="emergency" expiresAt={emergencyExpiresAt} />
          ) : authMode === "device" ? (
            <FallbackBanner kind="device_mode" />
          ) : null}

          <main id="konten" className="safe-pb px-3 pb-24 pt-4 md:px-6 md:pb-6 md:pt-5">
            <div key={path} className="anim-page-enter mx-auto max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>

      <MobileNav path={path} onMore={() => setMore(true)} groups={groups} />
      <MobileMenu open={more} onClose={() => setMore(false)} groups={groups} path={path} />
      <Tour />
    </div>
  );
}

function DeviceChip() {
  const { data } = useApi<any>("/device/me");
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[11.5px] font-semibold text-ink-2 lg:inline-flex"
      title="Perangkat terdaftar (lapisan keamanan kedua setelah akun Google)"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-ok)]" />
      {data?.deviceName ?? "Perangkat"} · {data?.role ?? "aktif"}
    </span>
  );
}

/* Bottom navigation 5 slot (D1 §4.4) — Beranda · Keuangan · Kasir · Stok · Lainnya */
function MobileNav({ path, onMore, groups }: { path: string; onMore: () => void; groups: { title: string; items: Item[] }[] }) {
  const allowed = new Set(groups.flatMap((g) => g.items.map((i) => i.href)));
  const slot = (href: string) => (path === href ? "page" : undefined);
  const items: { href?: string; key: string; label: string; onClick?: () => void; current?: boolean }[] = [
    { href: "/dashboard", key: "dashboard", label: "Beranda", current: path === "/dashboard" },
    { href: "/finance", key: "finance", label: "Keuangan", current: path === "/finance" },
    { href: "/sales", key: "sales", label: "Kasir", current: path === "/sales" },
    { href: "/products", key: "products", label: "Stok", current: path === "/products" },
    { key: "more", label: "Lainnya", onClick: onMore },
  ];
  return (
    <nav aria-label="Navigasi cepat" className="bf-bottom-nav md:hidden">
      {items.map((i) => {
        const locked = i.href ? !allowed.has(i.href) : false;
        const inner = (
          <>
            <span className="bf-nav-ico"><NavIcon name={i.key} /></span>
            <span className="truncate">{i.label}</span>
          </>
        );
        if (i.onClick) {
          return (
            <button key={i.key} type="button" onClick={i.onClick} aria-haspopup="dialog">
              {inner}
            </button>
          );
        }
        if (locked) {
          return (
            <span key={i.key} aria-disabled="true" className="pointer-events-none opacity-40">
              {inner}
            </span>
          );
        }
        return (
          <Link key={i.key} href={i.href!} aria-current={i.current ? "page" : undefined}>
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileMenu({
  open,
  onClose,
  groups,
  path,
}: {
  open: boolean;
  onClose: () => void;
  groups: { title: string; items: Item[] }[];
  path: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Semua modul">
      <nav aria-label="Semua modul" className="space-y-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-1.5 px-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-2">{g.title}</p>
            <ul className="grid gap-1">
              {g.items.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    onClick={onClose}
                    aria-current={path === i.href ? "page" : undefined}
                    className={`flex min-h-[48px] items-center gap-3 rounded-2xl px-3 text-sm font-medium ${
                      path === i.href ? "bg-[var(--color-action)] text-white" : "bg-surface text-ink"
                    }`}
                  >
                    <NavIcon name={i.key} />
                    <span className="truncate">{i.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </Modal>
  );
}

function Bell() {
  const [open, setOpen] = useState(false);
  const { data, reload } = useApi<any>(open ? "/notifications" : null);
  const items: any[] = data?.items ?? [];
  const unread = items.filter((n) => !n.readAt).length;
  return (
    <div className="relative">
      <button
        aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-line text-ink hover:bg-surface md:h-11 md:w-11"
      >
        <NavIcon name="bell" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" aria-hidden />
        )}
      </button>
      {open && (
        <div className="anim-drop-in absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-[20px] border border-line bg-white p-4 shadow-pop">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Notifikasi</p>
            {unread > 0 && (
              <button
                className="text-xs font-semibold text-ink underline"
                onClick={async () => {
                  await api("/notifications/read", { body: {} });
                  reload();
                }}
              >
                Tandai dibaca
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-2">Belum ada notifikasi.</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="border-t border-divider py-2 text-sm">
                  <p className={n.readAt ? "text-ink-2" : "font-semibold"}>{n.title}</p>
                  {n.body && <p className="text-xs text-ink-2">{n.body}</p>}
                  <p className="text-[11px] text-ink-2">{fmtDateTime(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    const t = setTimeout(() => {
      api<any>(`/search?q=${encodeURIComponent(trimmed)}`)
        .then((d) => setRes(d.items))
        .catch(() => setRes([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  const visibleRes = q.trim().length >= 2 ? res : [];
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <label className="sr-only" htmlFor="gsearch">
        Cari klien, produk, atau faktur
      </label>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden>
        <NavIcon name="search" />
      </span>
      <input
        id="gsearch"
        value={q}
        onChange={(e) => {
          const v = e.target.value;
          setQ(v);
          if (v.trim().length < 2) setRes([]);
        }}
        placeholder="Cari klien, produk, faktur…"
        className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-2 focus:border-[var(--color-action)] focus:outline-none"
        autoComplete="off"
      />
      {q.trim().length >= 2 && (
        <ul className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-pop">
          {visibleRes.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-2">Tidak ada hasil.</li>
          ) : (
            visibleRes.map((r) => (
              <li key={r.type + r.id}>
                <button
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface"
                  onClick={() => {
                    setQ("");
                    setRes([]);
                    router.push(r.href);
                  }}
                >
                  <span className="truncate font-medium">{r.label}</span>
                  <span className="shrink-0 text-xs text-ink-2">{r.type}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/* ───────── Guided tour (dapat dihentikan & dilanjutkan) ───────── */
export function startTour() {
  localStorage.setItem("bf_tour", "running");
  localStorage.setItem("bf_tour_step", "0");
  window.dispatchEvent(new Event("bf-tour"));
}

function Tour() {
  const tourSnapshot = useSyncExternalStore(
    subscribeStorage,
    () =>
      typeof window !== "undefined"
        ? `${localStorage.getItem("bf_tour") ?? ""}|${localStorage.getItem("bf_tour_step") ?? "0"}`
        : "|0",
    () => "|0",
  );
  const [rawState, rawStep] = tourSnapshot.split("|");
  const state = rawState || null;
  const step = Number(rawStep || 0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (state !== "running") return;
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector(TOUR[step]?.sel);
      el?.scrollIntoView({ block: "nearest" });
      setRect(el ? el.getBoundingClientRect() : null);
    });
    return () => cancelAnimationFrame(raf);
  }, [state, step]);

  const set = (s: string | null, n = step) => {
    if (s) localStorage.setItem("bf_tour", s);
    localStorage.setItem("bf_tour_step", String(n));
    window.dispatchEvent(new Event("bf-tour"));
  };

  if (state === "pending") {
    return (
      <Modal open onClose={() => set("dismissed")} title="Ingin tur singkat Business Flow?">
        <p className="mb-4 text-sm text-ink-2">
          Tur ini mengenalkan navigasi, bar atas, aksi cepat, dan modul utama. Anda dapat menghentikannya kapan saja dan melanjutkannya dari Pusat Bantuan.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => set("dismissed")}>
            Nanti saja
          </Button>
          <Button onClick={() => set("running", 0)}>Mulai tur</Button>
        </div>
      </Modal>
    );
  }
  if (state !== "running") return null;
  const s = TOUR[step];
  return (
    <>
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[55] rounded-xl ring-4 ring-[var(--color-gold)]"
          style={{ left: rect.left - 4, top: rect.top - 4, width: rect.width + 8, height: rect.height + 8 }}
        />
      )}
      <div
        role="dialog"
        aria-label={`Tur: ${s.title}`}
        className="fixed bottom-24 left-1/2 z-[56] w-[min(94vw,420px)] -translate-x-1/2 rounded-2xl border border-line bg-white p-4 shadow-pop md:bottom-4"
      >
        <p className="text-xs font-semibold text-ink-2">
          Langkah {step + 1} dari {TOUR.length}
        </p>
        <h2 className="text-base font-bold">{s.title}</h2>
        <p className="mt-1 text-sm text-ink-2">{s.text}</p>
        <div className="mt-3 flex justify-between gap-2">
          <Button variant="ghost" onClick={() => set("paused")}>
            Hentikan
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="secondary" onClick={() => set("running", step - 1)}>
                Kembali
              </Button>
            )}
            {step < TOUR.length - 1 ? (
              <Button onClick={() => set("running", step + 1)}>Lanjut</Button>
            ) : (
              <Button onClick={() => set("done", 0)}>Selesai</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
