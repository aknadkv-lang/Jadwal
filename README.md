# Ruang Kuliah API

Backend REST untuk jadwal kuliah dan tugas. Data disimpan dalam SQLite di `data/ruang-kuliah.sqlite` sehingga cocok untuk pengembangan lokal.

## Endpoint

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| GET, POST | `/api/schedules` | Daftar dan tambah jadwal |
| GET, PATCH, DELETE | `/api/schedules/:id` | Lihat, ubah, atau hapus jadwal |
| GET, POST | `/api/tasks` | Daftar dan tambah tugas |
| GET, PATCH, DELETE | `/api/tasks/:id` | Lihat, ubah, atau hapus tugas |
| GET | `/api/dashboard` | Ringkasan dashboard |

Inisialisasi database dengan `npm.cmd run db:init`, lalu jalankan aplikasi dengan `npm.cmd run dev`. Akses API di `http://localhost:3000/api/...`.
