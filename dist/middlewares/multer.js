import multer from "multer";
const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Membatasi ukuran gambar maksimal 2MB
    },
    fileFilter: (req, file, cb) => {
        // Memastikan file yang diunggah hanya berformat gambar
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed!"));
        }
    },
});
