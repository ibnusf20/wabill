# Wabill v1.2.0

Kirim pesen WhatsApp massal pake template dari data Excel/Google Sheets.

## Fitur

- Konek WhatsApp pake QR Code (multi-device)
- Paste data tabular — baris pertama = nama kolom, kolom pertama = nomor WA
- Template pesen pake `{nama_kolom}` — otomatis ngisi dari data
- Preview pesen sebelum kirim
- Kirim massal otomatis jeda 4 detik per pesen
- Tracking status realtime via Socket.IO
- Auto-reply: balas otomatis data absensi dari Google Sheets

## Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js | 16+ | Runtime |
| Express | ^4.17.1 | Web server (port 4000) |
| Socket.IO | ^4.1.3 | Realtime QR & log |
| Baileys | ^7.0.0 | WhatsApp Multi-Device API |
| qrcode | ^1.4.4 | Generate QR code |
| axios | - | HTTP client (Google Apps Script) |

## Cara Install

```bash
# 1. Clone / extract project
cd wabill

# 2. Install dependencies
npm install

# 3. Jalanin server
npm start
# atau
node index.js
```

## Cara Pake

1. Buka **`http://localhost:4000/`** di browser
2. Klik **icon gear ⚙️** pojok kanan atas buat buka panel QR
3. **Scan QR** pake WhatsApp kamu
4. **Paste data** dari Excel/Google Sheets ke textarea (kolom pertama = nomor WA)
5. Klik **Format**
6. Tulis **template pesen**, pake `{nama_kolom}` untuk placeholder
7. Klik **Preview** buat liat hasilnya
8. Klik **Kirim** — pesen dikirim otomatis satu per satu

### Contoh Data

```
nama    no_wa       tagihan
Budi    62123456    Rp50.000
Siti    62123456    Rp75.000
```

### Contoh Template

```
Halo {nama}, tagihan kamu sebesar {tagihan} udah jatuh tempo. Bayar segera ya.
```

Hasilnya:
```
Halo Budi, tagihan kamu sebesar Rp50.000 udah jatuh tempo. Bayar segera ya.
```

## Auto-Reply Absensi

Saat ada pesen masuk, Wabill otomatis:
1. Ambil nomor pengirim
2. Hit API Google Apps Script: `GET /exec?whatsapp=<nomor>`
3. Balas laporan absensi (nama, absen, libur, alpa, gaji, detail per tgl)

API endpoint bisa diubah di `index.js`.

## Build Executable

```bash
npm run build
# Hasil di folder dist/
# Target: Linux x64 & Windows x64
```

## Struktur Folder

```
├── index.js              # Server utama
├── index.html            # Web UI
├── assets/               # Frontend (CSS, JS, gambar)
├── client/               # Frontend duplikat (buat build pkg)
├── wabill_session/       # Session WhatsApp (persisten)
└── package.json
```

## Troubleshooting

**QR Code tidak muncul?**
- Pastikan akses lewat `http://localhost:4000/` — bukan buka file HTML langsung
- Klik icon gear ⚙️ pojok kanan atas buat buka panel QR
- Cek console browser (F12) — pastikan ga ada error Socket.IO
- Hapus folder `wabill_session/` trus restart server kalo mau scan ulang
- Update Baileys kalo perlu: `npm install baileys@latest`

**Gagal kirim pesen?**
- Pastikan nomor tujuan terdaftar di WhatsApp
- Cek koneksi internet
- Cek log di terminal/server

## Author

**Mas Ibeng**
