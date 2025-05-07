# WhatsApp Chatbot dengan Integrasi CS dan Log Spreadsheet

Sebuah chatbot WhatsApp yang dibuat menggunakan Node.js dan Baileys, dengan fitur integrasi CS (Customer Service) dan logging pesan ke Google Spreadsheet.

## Fitur

- Koneksi otomatis ke WhatsApp Web
- Autentikasi menggunakan QR Code
- Penyimpanan sesi otomatis
- Sistem menu interaktif
- Integrasi dengan CS:
  - CS menggunakan WhatsApp yang sama dengan bot
  - Timeout handling untuk respons CS
  - Status tracking untuk chat CS
- Logging lengkap:
  - Log ke Google Spreadsheet
  - Log sistem untuk debugging
  - Track status perubahan
  - Track interaksi CS

## Persyaratan

- Node.js versi 14 atau lebih baru
- NPM (Node Package Manager)
- Koneksi internet yang stabil
- Smartphone dengan WhatsApp terinstall
- Akun Google dan akses ke Google Cloud Console

## Instalasi

1. Clone repository ini
```bash
git clone [url-repository]
```

2. Masuk ke direktori project:
```bash
cd whatsapp-chatbot
```

3. Install dependencies:
```bash
npm install
```

4. Salin file .env.example menjadi .env:
```bash
cp .env.example .env
```

5. Update konfigurasi di file .env dengan nilai yang sesuai:
```
SPREADSHEET_ID=your_spreadsheet_id  # ID Google Spreadsheet
SHEET_NAME=Chat Logs               # Nama sheet untuk logging
CREDENTIALS_PATH=./credentials.json # Path ke credentials Google
LOG_LEVEL=info                     # Level logging (debug/info/error)
```

## Setup Google Sheets

### 1. Buat Google Spreadsheet
1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Catat ID spreadsheet dari URL (bagian antara /d/ dan /edit)
4. Update SPREADSHEET_ID di file .env

### 2. Setup Google Cloud Project
1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan Google Sheets API:
   - Buka "APIs & Services" > "Library"
   - Cari "Google Sheets API"
   - Klik "Enable"

### 3. Buat Service Account
1. Di Google Cloud Console:
   - Buka "APIs & Services" > "Credentials"
   - Klik "Create Credentials" > "Service Account"
   - Isi informasi yang diperlukan
   - Klik "Create and Continue"
   - Pilih role "Editor"
   - Klik "Done"

2. Buat dan download key:
   - Klik service account yang baru dibuat
   - Buka tab "Keys"
   - Klik "Add Key" > "Create new key"
   - Pilih "JSON"
   - Klik "Create"
   - File credentials akan terdownload

3. Setup credentials:
   - Rename file credentials yang didownload menjadi credentials.json
   - Pindahkan ke folder project (root directory)
   - Share Google Spreadsheet dengan email service account dari credentials

## Menjalankan Bot

1. Pastikan semua setup sudah selesai:
   - Dependencies terinstall
   - File .env sudah dikonfigurasi
   - credentials.json ada di root directory
   - Spreadsheet sudah di-share dengan service account

2. Jalankan bot:
```bash
npm start
```

3. Scan QR Code yang muncul dengan WhatsApp di smartphone

## Alur Kerja Bot

1. Bot (Automated Agent):
   - Mengirim pesan otomatis sesuai menu
   - Menangani menu utama dan sub-menu
   - Mencatat semua interaksi ke Google Sheets

2. CS (Customer Service):
   - Menggunakan WhatsApp yang sama dengan bot
   - Menerima notifikasi saat ada chat baru
   - Langsung membalas ke pengguna
   - Tidak perlu format khusus untuk membalas

3. Pengguna:
   - Menerima menu otomatis
   - Bisa pilih opsi chat dengan CS
   - Bisa kembali ke menu utama

---

## Alur Kerja Kode (Detail)

1. **Inisialisasi dan Koneksi WhatsApp**
   - Kode memulai koneksi ke WhatsApp Web menggunakan `@whiskeysockets/baileys`.
   - Autentikasi menggunakan QR code yang ditampilkan di terminal.
   - Status koneksi dipantau dan jika terputus, bot akan mencoba reconnect secara otomatis.

2. **Manajemen State Pengguna**
   - Setiap pengguna memiliki status percakapan yang disimpan dalam `userStates`.
   - Status ini menentukan bagaimana pesan dari pengguna diproses (misal: `MAIN_MENU`, `CHATTING_CS`, dll).
   - Saat pengguna memilih opsi "Chat dengan CS", status mereka diubah ke `CHATTING_CS`.

3. **Penanganan Pesan Masuk**
   - Pesan yang diterima dari pengguna diproses oleh `messageHandler`.
   - Jika status pengguna adalah `CHATTING_CS` atau `WAITING_CS`, pesan langsung diteruskan ke CS.
   - Pesan dari CS (yang menggunakan WhatsApp yang sama dengan bot) dipantau.
   - Jika CS mengirim pesan "Terima kasih sudah menghubungi kami", status pengguna dikembalikan ke `MAIN_MENU` dan pengguna diberi tahu bahwa sesi chat selesai.

4. **Logging Interaksi**
   - Semua pesan dan respons dicatat ke Google Sheets menggunakan `messageLogger`.
   - Logging juga dilakukan secara terstruktur menggunakan `logger` untuk debugging dan monitoring.

5. **Timeout dan Notifikasi**
   - Jika CS tidak merespon dalam waktu tertentu (default 5 menit), pengguna diberi tahu dan status dikembalikan ke `MAIN_MENU`.
   - CS menerima notifikasi saat ada permintaan chat baru dari pengguna.

6. **Struktur Kode**
   - `src/index.js`: Entry point aplikasi, memulai koneksi dan mengatur event handler.
   - `src/services/whatsapp.js`: Mengelola koneksi WhatsApp, pengiriman dan penerimaan pesan, serta manajemen state.
   - `src/handlers/messageHandler.js`: Logika bisnis untuk memproses pesan pengguna dan mengatur respons.
   - `src/utils/messageLogger.js`: Mengelola pencatatan pesan ke Google Sheets.
   - `src/utils/logger.js`: Sistem logging terstruktur untuk aplikasi.

7. **Keamanan dan Konfigurasi**
   - Konfigurasi sensitif disimpan di file `.env`.
   - File `credentials.json` berisi kredensial Google API dan tidak boleh dibagikan.
   - Semua konfigurasi diatur melalui environment variables untuk kemudahan deployment.

---

Penjelasan ini membantu memahami bagaimana kode bekerja secara internal dan bagaimana alur interaksi antara bot, CS, dan pengguna diatur.

## Format Log Spreadsheet

Bot mencatat setiap interaksi dengan format:
1. Timestamp - Waktu pesan
2. Sender - Pengirim pesan
3. Message Type - Tipe pesan
4. Message Content - Isi pesan
5. Response - Balasan yang diberikan
6. State - Status chat saat itu

## Troubleshooting

### Masalah Koneksi WhatsApp
- Pastikan smartphone terhubung internet
- Coba scan ulang QR Code
- Periksa log untuk error detail

### Masalah Google Sheets
- Verifikasi credentials.json valid
- Pastikan spreadsheet shared dengan service account
- Periksa permission service account

### Masalah CS
- Pastikan CS menggunakan WhatsApp yang sama dengan bot
- Cek timeout settings jika perlu

### Error Umum
- Periksa file .env lengkap
- Lihat log untuk detail error
- Pastikan versi Node.js sesuai

## Keamanan

- Jangan share credentials.json
- Jangan share file .env
- Jangan share QR Code WhatsApp
- Batasi akses ke Google Spreadsheet

## Pengembangan

Untuk mode development:
```bash
npm run dev
```

## Lisensi

MIT License
