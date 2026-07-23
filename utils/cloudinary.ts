import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Konfigurasi Cloudinary mengambil data dari file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = (
  file: Express.Multer.File,
  folderName: string = "uploads"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName,
        resource_type: "image",
       },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      },
    );

    uploadStream.end(file.buffer);
  });
};
