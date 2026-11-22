import { v2 as cloudinary } from "cloudinary";

// Automatically parses process.env.CLOUDINARY_URL
cloudinary.config({
  secure: true,
});

export { cloudinary };

export type UploadFolder = "portfolio" | "team" | "general";

export async function uploadImageBufferToCloudinary(
  buffer: Buffer,
  folder: UploadFolder = "general"
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error(
      "CLOUDINARY_URL belum dikonfigurasi. Tambahkan di .env.local atau Vercel Environment Variables."
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `kodelokal/${folder}`,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload ke Cloudinary gagal."));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    );
    stream.end(buffer);
  });
}
