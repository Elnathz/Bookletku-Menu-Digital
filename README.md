===========================================================================
✨ BOOKLETKU - MENU DIGITAL & KATALOG ONLINE TERINTEGRASI WHATSAPP 🚀
===========================================================================

[ 🇮🇩 BAHASA INDONESIA ]

Halo! 👋 Selamat datang di BookletKu.

Aplikasi ini adalah solusi kekinian berbasis web (React + Vite) untuk pemilik
usaha kuliner (Restoran 🍽️, Kafe ☕, UMKM 🏪). BookletKu menyulap menu kertas
yang membosankan menjadi katalog digital yang interaktif, cantik, dan bisa
langsung dipesan via WhatsApp! 💬

Dibangun dengan teknologi "Zaman Now" (React, Tailwind CSS, Supabase),
dijamin ngebut, aman, dan nyaman dipakai. ⚡

---

1. 🚀 MULAI DARI SINI (INSTALASI)

---

Ikuti langkah simpel ini buat jalanin aplikasinya di laptop kamu (Localhost).

📋 SYARAT UTAMA:
✅ Node.js (Versi 16+)
✅ Git
✅ Akun Supabase (Gratis kok!)

Langkah-langkah:

A. 📥 Clone Project
Buka terminal/CMD, lalu ketik:
$ git clone https://github.com/Elnathz/Bookletku-Menu-Digital.git
$ cd Bookletku-Menu-Digital

B. 📦 Install "Bumbu-Bumbu" (Dependencies)
Biar aplikasinya jalan, install dulu paketnya:
$ npm install

(Tunggu bentar ya sambil ngopi ☕, tergantung internetmu)

C. 🔑 Atur Kunci Rahasia (.env)
Aplikasi butuh koneksi ke "Otak" (Supabase).

1. Buat file baru di folder paling luar bernama: .env
2. Isi dengan kode rahasia dari Supabase kamu:

    VITE_SUPABASE_URL=https://url-project-kamu.supabase.co
    VITE_SUPABASE_ANON_KEY=kunci-anon-public-kamu-disini

D. 🏃‍♂️ Jalankan Mesin!
Semua siap? Yuk nyalakan:
$ npm run dev

Buka browser dan meluncur ke alamat yang muncul (biasanya):
👉 http://localhost:3000

---

2. 🗄️ SETUP DATABASE & STORAGE (WAJIB!)

---

Biar fitur Login, Simpan Menu, dan Upload Foto jalan mulus, kita perlu
siapin "wadah" datanya di Supabase. Buka SQL Editor di Dashboard Supabase,
lalu jalankan mantra ini:

A. 🏗️ Buat Tabel
Kita butuh 3 tabel utama:

1. 🏪 'stores': Info toko (Nama, Alamat, Jam Buka).
2. 🍔 'menu_items': Daftar makanan/minuman.
3. 👤 'user_profiles': Data admin/user (Bisa ganti foto profil lho!).

B. 🛡️ Pasang Satpam (RLS Security)
Pastikan Rules-nya benar:

-   👀 PUBLIK cuma boleh LIHAT menu.
-   🔐 Cuma ADMIN LOGIN yang boleh EDIT/HAPUS.

C. 📸 Gudang Foto (Storage)

1. Buat Bucket baru bernama 'bookletku' (Set ke PUBLIC).
2. Atur Policy biar User Login bisa upload foto ke folder 'avatars/'
   atau root bucket.

---

3. 🔥 FITUR-FITUR KEREN (HIGHLIGHTS)

---

Aplikasi ini punya dua wajah: Sisi Pelanggan & Sisi Admin.

=== 📱 SISI PELANGGAN (PUBLIC MENU) ===

1. 🖼️ Tampilan Menawan
   Menu tampil dengan kartu gambar besar yang bikin ngiler.

2. 🔍 Cari & Filter Sat-Set
   Mau cari "Nasi Goreng"? Atau filter cuma "Minuman"? Gampang banget!

3. 🛒 Keranjang Belanja Pintar

    - Tombol keranjang melayang (Floating Button).
    - Bisa tambah catatan (cth: "Jangan pedas ya bang! 🌶️🚫").

4. 💬 Checkout WhatsApp
   Pesanan otomatis jadi teks rapi, langsung kirim ke WA pemilik toko.
   Admin tinggal bilang "Siap, ditunggu ya!".

5. 🎨 Tema Warna-Warni
   Warna aplikasi bakal berubah sesuai mood Admin (Minimalis atau Colorful).

=== 🛠️ SISI ADMIN (DASHBOARD) ===

1. 📝 Manajemen Menu (CRUD)
   Tambah, Edit, Hapus menu semudah update status sosmed.
   ✨ Fitur CROP FOTO: Upload foto menu/profil bisa di-crop & zoom biar rapi!

2. 🖐️ Drag & Drop Sorting
   Menu andalan mau taruh paling atas? Tinggal tarik dan lepas! (Drag & Drop).
   _Tips: Fitur ini aktif kalau kamu buka per kategori ya!_

3. 🎨 Kustomisasi Tema (Theming Engine)

    - Mode Minimalist: Pilih 1 warna utama (Hex Code).
    - Mode Colorful: Gradasi warna kekinian (Violet-Pink) 🦄.

4. ⚙️ Pengaturan Toko
   Ubah nama toko, alamat, jam buka (dropdown detail), dan nomor WA tujuan.

5. 📷 QR Code Generator
   Bikin QR Code otomatis! Tinggal print, tempel di meja, pelanggan scan deh.

6. 👤 Profil Kece
   Ganti foto profil sesuka hati, ubah nama, dan password. Aman terkendali.

---

4. 💻 TEKNOLOGI DI BALIK LAYAR (TECH STACK)

---

Kami pakai racikan teknologi terbaik biar performa maksimal:

-   ⚛️ React.js (v18): Framework UI paling populer.
-   ⚡ Vite: Build tool super ngebut.
-   💅 Tailwind CSS v4: Styling cepat dan cantik.
-   🔥 Supabase: Backend sakti (Database & Auth).
-   🧩 Lucide React: Ikon-ikon minimalis yang manis.
-   📦 Fitur Tambahan:
    -   @dnd-kit (Drag & Drop smooth)
    -   react-easy-crop (Potong gambar)
    -   qrcode.react (Bikin QR Code)

---

5. 💡 TIPS & TRIK (TROUBLESHOOTING)

---

🐛 "Kak, kok Upload Gagal?"
👉 Cek Policy Storage di Supabase. Pastikan folder 'avatars' dan root bucket
sudah diizinkan buat user yang login.

🐛 "Kak, Drag & Drop kok diem aja?"
👉 Pastikan kamu ada di tab Kategori spesifik (misal: Makanan), bukan di
tab "Semua". Ini biar urutannya gak berantakan.

🐛 "Kak, pas di-deploy ke Vercel kok 404?"
👉 Jangan lupa tambahin file 'vercel.json' di root folder ya!

===========================================================================
🎉 Selamat Menggunakan BookletKu! Semoga Usahanya Laris Manis! 💸
Hak Cipta (c) 2024 - BookletKu Digital Menu Project
===========================================================================

...........................................................................
...........................................................................

===========================================================================
✨ BOOKLETKU - DIGITAL MENU & WHATSAPP INTEGRATED CATALOG 🚀
===========================================================================

[ 🇺🇸 ENGLISH VERSION ]

Hello! 👋 Welcome to BookletKu.

This application is a modern web-based solution (React + Vite) designed for
culinary business owners (Restaurants 🍽️, Cafes ☕, SMEs 🏪). BookletKu
transforms boring paper menus into interactive, beautiful digital catalogs
that allow direct ordering via WhatsApp! 💬

Built with cutting-edge technology (React, Tailwind CSS, Supabase), it is
guaranteed to be fast, secure, and easy to use. ⚡

---

1. 🚀 START HERE (INSTALLATION)

---

Follow these simple steps to run the application on your local machine.

📋 PREREQUISITES:
✅ Node.js (Version 16+)
✅ Git
✅ Supabase Account (It's free!)

Steps:

A. 📥 Clone Project
Open your terminal/CMD, then type:
$ git clone https://github.com/Elnathz/Bookletku-Menu-Digital.git
$ cd Bookletku-Menu-Digital

B. 📦 Install Dependencies
To make the app run, install the necessary packages first:
$ npm install

(Wait a moment while enjoying your coffee ☕, depends on your internet)

C. 🔑 Setup Environment Variables (.env)
The app needs a connection to its "Brain" (Supabase).

1. Create a new file in the root folder named: .env
2. Fill it with your Supabase credentials:

    VITE_SUPABASE_URL=your-project-url.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

D. 🏃‍♂️ Run the Engine!
All set? Let's fire it up:
$ npm run dev

Open your browser and go to the address shown (usually):
👉 http://localhost:3000

---

2. 🗄️ DATABASE & STORAGE SETUP (MANDATORY!)

---

To ensure Login, Menu Saving, and Photo Upload features work smoothly, you
need to prepare the data "container" in Supabase. Open the SQL Editor in
your Supabase Dashboard, and run these scripts:

A. 🏗️ Create Tables
We need 3 main tables:

1. 🏪 'stores': Store info (Name, Address, Opening Hours).
2. 🍔 'menu_items': List of food/drinks.
3. 👤 'user_profiles': Admin/user data (Can change profile pics too!).

B. 🛡️ Set Security Guards (RLS Security)
Ensure the Rules are correct:

-   👀 PUBLIC can only VIEW the menu.
-   🔐 Only LOGGED-IN ADMINS can EDIT/DELETE.

C. 📸 Photo Warehouse (Storage)

1. Create a new Bucket named 'bookletku' (Set to PUBLIC).
2. Set Policies so Logged-in Users can upload photos to the 'avatars/'
   folder or root bucket.

---

3. 🔥 COOL FEATURES (HIGHLIGHTS)

---

The app has two faces: Customer Side & Admin Side.

=== 📱 CUSTOMER SIDE (PUBLIC MENU) ===

1. 🖼️ Stunning Display
   The menu appears with large, appetizing image cards.

2. 🔍 Fast Search & Filter
   Want to find "Fried Rice"? or filter only "Drinks"? Super easy!

3. 🛒 Smart Shopping Cart

    - Floating Cart Button.
    - Add notes (e.g., "No spicy please! 🌶️🚫").

4. 💬 WhatsApp Checkout
   Orders are automatically formatted into neat text, sent directly to the
   store owner's WA. Admin just replies "Ready, please wait!".

5. 🎨 Colorful Themes
   The app color changes according to the Admin's mood (Minimalist or Colorful).

=== 🛠️ ADMIN SIDE (DASHBOARD) ===

1. 📝 Menu Management (CRUD)
   Add, Edit, Delete menu items as easily as updating social media status.
   ✨ CROP PHOTO Feature: Upload menu/profile photos with crop & zoom tools!

2. 🖐️ Drag & Drop Sorting
   Want your best-selling menu on top? Just drag and drop!
   _Tip: This feature activates when you open a specific category tab!_

3. 🎨 Theme Customization (Theming Engine)

    - Minimalist Mode: Choose 1 primary color (Hex Code).
    - Colorful Mode: Trendy gradient colors (Violet-Pink) 🦄.

4. ⚙️ Store Settings
   Change store name, address, opening hours (detailed dropdown), and WA number.

5. 📷 QR Code Generator
   Create QR Codes automatically! Print them, stick them on tables, and customers scan away.

6. 👤 Cool Profiles
   Change profile picture, update name, and password securely.

---

4. 💻 TECHNOLOGY BEHIND THE SCENES (TECH STACK)

---

We use the best tech recipe for maximum performance:

-   ⚛️ React.js (v18): Most popular UI Framework.
-   ⚡ Vite: Super fast build tool.
-   💅 Tailwind CSS v4: Fast and beautiful styling.
-   🔥 Supabase: The Magic Backend (Database & Auth).
-   🧩 Lucide React: Sweet minimalist icons.
-   📦 Extra Features:
    -   @dnd-kit (Smooth Drag & Drop)
    -   react-easy-crop (Image cropping)
    -   qrcode.react (QR Code generation)

---

5. 💡 TIPS & TRICKS (TROUBLESHOOTING)

---

🐛 "Hey, why did the Upload Fail?"
👉 Check Storage Policies in Supabase. Make sure 'avatars' folder and root
bucket are permitted for logged-in users.

🐛 "Hey, Drag & Drop isn't moving?"
👉 Ensure you are in a specific Category tab (e.g., Food), not in the
"All" tab. This prevents messing up the global order.

🐛 "Hey, getting 404 on Vercel deployment?"
👉 Don't forget to add the 'vercel.json' file in the root folder!

===========================================================================
🎉 Enjoy using BookletKu! Wishing your business great success! 💸
Copyright (c) 2024 - BookletKu Digital Menu Project
===========================================================================
