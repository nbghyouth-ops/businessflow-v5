# PANDUAN DEPLOY — Business Flow (Vercel + Neon + Google OAuth)

Waktu: ±25 menit. Semua langkah di bawah dikerjakan **oleh Anda** (agen tidak memegang kredensial).

## 0. Berkas yang Anda punya

| Berkas | Isi | Pakai untuk |
|---|---|---|
| `business-flow-github-vercel.zip` | kode produksi (158 berkas) + `MANIFEST.md` + `SHA256SUMS.txt` | **upload ke GitHub → deploy Vercel** |
| `business-flow-dev-qa.zip` | kode + `tests/`, `docs/`, skrip QA | pengembangan & QA |
| `business-flow-opsional.zip` | `android/`, `capacitor.config.ts`, `functions/` | build APK & dispatcher Neon (opsional) |
| `LAPORAN_AKHIR.md`, `CHECKLIST_UJI_MANUAL.md` | status & uji manual | review |

Ekstrak ZIP inti; di dalamnya ada folder `business-flow/`. Itulah akar repo.

## 1. Neon (database)

1. Buat project Neon, region **Singapore (`sin1`)** agar dekat Vercel `sin1`.
2. Salin **connection string pooled** (host berakhiran `-pooler`) → ini `DATABASE_URL`.
3. Migrasi dijalankan otomatis saat request pertama (aman & idempoten). Bila ingin manual:
   ```bash
   npm ci
   DATABASE_URL="postgres://..." npm run db:migrate
   DATABASE_URL="postgres://..." npm run db:check
   ```
   `db:check` harus melaporkan 91 tabel dan 75 tabel RLS.

## 2. Google OAuth (login nyata)

1. Google Cloud Console → **APIs & Services → OAuth consent screen**: tipe External, isi nama aplikasi,
   email dukungan, domain. Tambahkan scope **`openid`, `email`, `profile`** saja.
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. Authorized JavaScript origins:
   ```
   https://<domain-anda>
   ```
4. Authorized redirect URIs (harus **persis**, tanpa garis miring di akhir):
   ```
   https://<domain-anda>/api/auth/callback/google
   ```
5. Simpan `Client ID` dan `Client Secret`.

> Jika memakai domain Vercel `*.vercel.app`, URL deployment-specific **tidak bisa** dipakai sebagai
> redirect URI. Pakai domain produksi (custom domain) atau domain `*-projects.vercel.app` yang stabil.

## 3. GitHub

```bash
cd business-flow
git init
git add .
git commit -m "Business Flow v4.1 — periwinkle banking UI"
git branch -M main
git remote add origin https://github.com/<akun>/<repo>.git
git push -u origin main
```

`.env` tidak ikut (sudah di `.gitignore`). Jangan pernah commit `.env`.

## 4. Vercel

1. **Add New → Project → Import** repo tadi. Framework: Next.js (terdeteksi otomatis).
2. **Settings → Functions → Region: `sin1`** (sudah ada di `vercel.json`).
3. **Settings → Environment Variables** (Production **dan** Preview sesuai kebutuhan):

   | Nama | Nilai |
   |---|---|
   | `DATABASE_URL` | connection string Neon (pooled) |
   | `BETTER_AUTH_SECRET` | string acak ≥ 32 karakter (`openssl rand -base64 32`) |
   | `BETTER_AUTH_URL` | `https://<domain-anda>` (tanpa `/` di akhir) |
   | `GOOGLE_CLIENT_ID` | dari langkah 2 |
   | `GOOGLE_CLIENT_SECRET` | dari langkah 2 |

   Tidak ada ENV lain. Build dan impor lulus tanpa ENV; kelima nilai di atas diperlukan agar login nyata.
4. **Deploy**.
5. **Settings → Deployment Protection → Vercel Authentication: OFF untuk Production.**
   (Ini penyebab R-20: client tidak bisa membuka situs.)
6. Buka `https://<domain-anda>/api/health` → `status: "ok"`, `schema: "ok"`, `auth: "google"`.

## 5. Setelah deploy — uji login nyata

1. Buka `/` → klik **Masuk dengan Google** → pilih akun → kembali ke `/` atau `/dashboard`.
2. Pertama kali: `/onboarding` (17 langkah) → buat workspace → PIN 4–6 digit.
3. Login dari **perangkat lain** dengan Google yang sama → workspace dan data klien harus sama.
4. Cabut perangkat di `/devices` → perangkat itu harus kehilangan akses pada permintaan berikutnya.

Bila login gagal: cek `Authorized redirect URIs` **persis** sama dengan
`https://<domain>/api/auth/callback/google`, lalu cek `BETTER_AUTH_URL` tidak memakai garis miring akhir.

## 6. Opsional

- **Dispatcher job (Neon Function)**: ekstrak `business-flow-opsional.zip`; fungsi berada di `functions/`.
  Tanpa dispatcher aplikasi tetap benar (notifikasi dihitung saat dibaca).
- **APK Android**: butuh Android Studio/SDK. Set `CAP_SERVER_URL=https://<domain-anda>` saat build.
  Login Android memakai browser sistem (Custom Tabs), bukan WebView tertanam.

## 7. Rollback

Vercel → Deployments → pilih deployment sebelumnya → **Promote to Production**. Database tidak ikut
berubah karena migrasi bersifat aditif dan idempoten.

## 8. Catatan teknis yang WAJIB diketahui (hasil audit 19 Nov 2026)

1. **Role database.** Migrasi `002` membuat role runtime `bf_app` (`NOLOGIN NOBYPASSRLS`). Ini
   memerlukan hak **CREATEROLE** pada role koneksi. Role bawaan Neon (pemilik project) sudah
   memenuhinya. Jika Anda memakai role terbatas, migrasi akan berhenti dengan
   `permission denied to create role`.
2. **Koneksi aplikasi vs isolasi tenant.** Koneksi utama memakai role pemilik (di Neon: anggota
   `neon_superuser`, sehingga RLS dilewati untuk pencarian perangkat/grant). Setiap pekerjaan
   tenant tetap dijalankan di dalam transaksi yang melakukan `SET LOCAL ROLE bf_app` +
   `app.workspace_id`, sehingga isolasi antar workspace tetap berlaku.
3. **Migrasi otomatis.** `DATABASE_URL` terisi → skema dimigrasikan pada request pertama
   (idempoten, memakai advisory lock). Untuk menjalankan manual:
   `DATABASE_URL="postgres://…" npm run db:migrate && npm run db:check`.
   `db:check` harus melaporkan **91 tabel** dan **75 tabel RLS**.
4. **Nama rute record-only.** Rute penjualan kini `POST /api/v1/sales/record` (dulu
   `/sales/checkout`) dan pembayaran `…/record-payment`. Ini mengikuti aturan R1: aplikasi hanya
   mencatat, tidak memproses pembayaran.
5. **`functions/`** ikut di ZIP deploy karena `npm run verify` (typecheck + tes unit) mengimpornya.
   Folder ini tidak dipakai runtime Vercel.
