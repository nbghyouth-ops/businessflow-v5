/**
 * Registry navigasi (PRD Frontend v5.0 §5) — satu sumber untuk sidebar, rail,
 * bottom nav, sheet "Lainnya", dan pencarian. Mode Sederhana/Lanjutan hanya mengatur tampilan;
 * izin tetap ditentukan  (mode Sederhana tidak menambah akses).
 */
import type { Permission } from "./permissions";

export type NavItem = { href: string; label: string; perm?: Permission; key: string; advanced?: boolean };
export type NavGroup = { key: string; title: string; items: NavItem[] };

export const GROUPS: NavGroup[] = [
  { key: "main", title: "Utama", items: [{ href: "/dashboard", label: "Beranda", key: "dashboard" }] },
  {
    key: "operations",
    title: "Operasional",
    items: [
      { href: "/finance", label: "Keuangan", perm: "finance:read", key: "finance" },
      { href: "/sales", label: "Penjualan & Kasir", perm: "sales:read", key: "sales" },
      { href: "/bookings", label: "Pesanan & Booking", perm: "booking:read", key: "bookings" },
      { href: "/products", label: "Produk & Stok", perm: "inventory:read", key: "products" },
      { href: "/purchasing", label: "Pembelian", perm: "purchasing:read", key: "purchasing" },
      { href: "/crm", label: "Klien / CRM", perm: "crm:read", key: "crm" },
      { href: "/marketplace", label: "Marketplace", perm: "marketplace:read", key: "marketplace" },
      { href: "/storefront", label: "Etalase Online", perm: "storefront:read", key: "storefront" },
      { href: "/rfq", label: "Permintaan Penawaran", perm: "rfq:read", key: "rfq" },
    ],
  },
  {
    key: "management",
    title: "Manajemen",
    items: [
      { href: "/hr", label: "Karyawan & HR", perm: "hr:read", key: "hr", advanced: true },
      { href: "/tasks", label: "Tugas & Tim", perm: "tasks:read", key: "tasks" },
      { href: "/operations", label: "Operasional & Kas", perm: "ops:read", key: "operations", advanced: true },
      { href: "/marketing", label: "Pemasaran", perm: "marketing:read", key: "marketing", advanced: true },
      { href: "/projects", label: "Proyek", perm: "projects:read", key: "projects", advanced: true },
      { href: "/assets", label: "Aset & Dokumen", perm: "assets:read", key: "assets", advanced: true },
      { href: "/personal", label: "Keuangan Pribadi", perm: "personal:read", key: "personal", advanced: true },
      { href: "/bridge", label: "Jembatan Pemilik", perm: "bridge:read", key: "bridge", advanced: true },
    ],
  },
  {
    key: "reports",
    title: "Laporan",
    items: [
      { href: "/reports", label: "Laporan & Analitik", perm: "reports:read", key: "reports" },
      { href: "/reports/export", label: "Pusat Ekspor", perm: "reports:read", key: "export" },
      { href: "/forecast", label: "Prakiraan Kas", perm: "forecast:read", key: "forecast" },
      { href: "/insights", label: "Intelijen Bisnis", perm: "bi:read", key: "bi" },
    ],
  },
  {
    key: "settings",
    title: "Konfigurasi",
    items: [
      { href: "/settings", label: "Pengaturan", perm: "settings:write", key: "settings" },
      { href: "/settings/language", label: "Bahasa & Regional", perm: "settings:write", key: "language" },
      { href: "/import", label: "Pusat Import", perm: "import:write", key: "import" },
      { href: "/templates", label: "Template Bisnis", key: "templates", advanced: true },
      { href: "/devices", label: "Perangkat & Keamanan", perm: "devices:read", key: "devices" },
      { href: "/legal", label: "Syarat & Privasi", key: "legal" },
      { href: "/learn", label: "Pembelajaran", perm: "learning:read", key: "learning" },
      { href: "/help", label: "Bantuan", key: "help" },
    ],
  },
];

export const BOTTOM_NAV = [
  { key: "dashboard", href: "/dashboard" },
  { key: "finance", href: "/finance" },
  { key: "sales", href: "/sales" },
  { key: "products", href: "/products" },
] as const;
