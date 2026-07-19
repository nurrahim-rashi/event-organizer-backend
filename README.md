Event-Organizer Platform
Platform manajemen event end-to-end yang memungkinkan penyelenggara membuat acara, mengelola tiket, serta memfasilitasi pengguna untuk membeli tiket dengan sistem voucher dan poin.
✨ Main Features
Event Management: Penyelenggara dapat membuat, mengedit, dan memantau event.
Ticket System: Sistem pemesanan tiket dengan berbagai kategori (Gold, Silver, Bronze, dsb).
Voucher & Coupon: Diskon dinamis untuk setiap event menggunakan kode voucher atau kupon pengguna.
Loyalty Points: Penggunaan poin referal untuk potongan harga transaksi.
Payment Verification: Sistem upload bukti bayar dengan verifikasi dari pihak admin/organizer.
Dashboard & Analytics: Monitoring transaksi dan statistik event.
Role-Based Access: Mendukung akses untuk User, Admin (Organizer), dan Superadmin.
🛠 Tech Stack
Frontend: React 19, Vite, TailwindCSS (v4), TanStack Query, Zustand, Axios, React Router 8.
Backend: Node.js, Express 5, Prisma ORM, PostgreSQL.
Utilities: Cloudinary (Media Storage), Nodemailer (Email Notification), Zod (Validation), Node-Cron (Scheduled Tasks).
🗄️ Database ERD
ERD:
🚀 How to Run Locally
Prerequisites
Node.js (v20+ recommended)
PostgreSQL
Cloudinary Account (untuk upload gambar)
Setup Backend
cd backend
cp .env.example .env (sesuaikan DATABASE_URL dan CLOUDINARY_URL)
npm install
npx prisma db push
npm run dev
Setup Frontend
cd ../frontend
cp .env.example .env (sesuaikan VITE_API_URL)
npm install
npm run dev
🌐 Deployment URLs
Frontend:
Backend:
🔑 Demo Accounts
