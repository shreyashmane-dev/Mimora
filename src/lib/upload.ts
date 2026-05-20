import imageCompression from "browser-image-compression";

// Image compression utility
export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.8, // Target size under 800kb
    maxWidthOrHeight: 1080, // Optimized for mobile viewport resolutions
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Compression error, using original file:", error);
    return file;
  }
};

// Convert file to base64 utility
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Upload to Cloudinary (with local Base64 fallback)
export const uploadImage = async (file: File): Promise<string> => {
  // First compress the image
  const compressedFile = await compressImage(file);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // If Cloudinary keys are configured, perform standard unsigned upload
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error, falling back to local base64:", err);
    }
  }

  // Fallback to base64 string when Cloudinary is not configured or fails
  return await fileToBase64(compressedFile);
};
