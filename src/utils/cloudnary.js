import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    const result = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localfilepath);
    return result;
  } catch (error) {
    console.error("ERROR UPLOADING FILE TO CLOUDINARY", error);
    fs.unlinkSync(localfilepath);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

export { uploadOnCloudinary };
