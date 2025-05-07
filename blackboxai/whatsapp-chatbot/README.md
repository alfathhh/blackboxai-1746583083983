# WhatsApp Chatbot dengan Integrasi CS dan Log Spreadsheet

Sebuah chatbot WhatsApp yang dibuat menggunakan Node.js dan Baileys, dengan fitur integrasi CS (Customer Service) dan logging pesan ke Google Spreadsheet.

## Fitur

- Koneksi otomatis ke WhatsApp Web
- Autentikasi menggunakan QR Code
- Penyimpanan sesi otomatis
- Sistem menu interaktif
- Integrasi dengan CS:
  - Forwarding pesan ke CS
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
- Nomor WhatsApp untuk CS

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
CS_CONTACT_ID=62XXXXXXXXXX@c.us    # Nomor WhatsApp CS
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
   - Menerima forward pesan dari pengguna
   - Membalas menggunakan format khusus:
     ```
     User: [user_id]; Reply: [pesan balasan]
     ```
   - Mendapat notifikasi saat ada chat baru

3. Pengguna:
   - Menerima menu otomatis
   - Bisa pilih opsi chat dengan CS
   - Bisa kembali ke menu utama

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
- Pastikan format balasan CS sesuai
- Verifikasi CS_CONTACT_ID di .env benar
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
- Jaga kerahasiaan CS_CONTACT_ID

## Pengembangan

Untuk mode development:
```bash
npm run dev
```

## Lisensi

MIT License
