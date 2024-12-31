import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!local) return null;
    cloudinary.uploader(localfilepath, { resource_type: "auto" });
    console.log("FILE UPLOADED SUCESSFULYY", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath);
    return null;
  }
};

export { cloudinary };
