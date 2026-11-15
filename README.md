# Muse Quota — iPhone Widget

Data kuota Muse (Free) untuk widget iPhone (Scriptable), diperbarui otomatis
tiap 3 jam oleh `update_quota.py`.

- `quota.json` — data kuota (mentah): https://raw.githubusercontent.com/HeyRdzy/muse-quota/main/quota.json
- `MuseQuotaWidget.js` — script widget Scriptable.
- `update_quota.py` — updater (jalan tiap 3 jam via cron di VM Muse).

## Isi widget
- Sisa kuota mingguan (%) + progress bar
- Warna bar: hijau ≥25%, kuning <25%, merah <10%
- Waktu reset (hitung mundur)
- Token tambahan yang tersisa
- Kalau gagal ambil data, tampilkan cache terakhir (tanda "⚠️ cache")

## Pasang (iPhone)
1. Install aplikasi **Scriptable** (gratis, App Store).
2. Buka Scriptable → tap **+** → paste isi `MuseQuotaWidget.js` → beri nama
   "Muse Quota" → tap **Done**.
3. Kembali ke Home Screen → tekan lama area kosong → tap **+** (kiri atas) →
   cari **Scriptable** → pilih ukuran **Small** → **Add Widget**.
4. Tekan lama widget-nya → **Edit Widget** → pilih script **Muse Quota** →
   tap di luar untuk selesai.
5. Widget akan refresh sendiri tiap 3 jam (dan tiap kali dibuka). Kalau mau
   refresh manual: tekan lama widget → **Edit Widget** → pilih script lagi,
   atau buka Scriptable dan jalankan script-nya.

Catatan: data di repo ini publik (hanya persentase kuota + waktu reset,
tanpa kredensial apa pun).
