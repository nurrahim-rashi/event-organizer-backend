import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary mengambil data dari file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fungsi untuk mengubah file buffer dari Multer menjadi URL Cloudinary
export const cloudinaryUpload = (file: Express.Multer.File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_pictures" }, // Nama folder otomatis di Cloudinary kamu
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    // Mengirim file mentah yang ada di RAM ke Cloudinary
    uploadStream.end(file.buffer);
  });
};
