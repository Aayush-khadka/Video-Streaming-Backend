import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import mongoose from "mongoose";

const uploadVideo = asynchandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((fileds) => fileds.trim() === "")) {
    throw new ApiError(400, "ALL fields must be Filleds!!!");
  }

  const videoLocalPath = req.files?.video[0]?.path;
  const thubmailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thubmailLocalPath) {
    throw new ApiError(400, "Video and Thumbnail is Needed!!!");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thubmailLocalPath);

  if (!video || !thumbnail) {
    throw new ApiError(
      400,
      "Video and Thumbnail Upload on Cloudinary Failed!!!"
    );
  }

  const user = req.user._id;
  console.log(user);

  const videoUpload = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: video.duration,
    owner: user,
  });

  if (!videoUpload) {
    throw new ApiError(500, "Uplading of the Video failed !!!");
  }
  const uploadedVideo = await Video.findById(videoUpload._id);

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video Sucessfully Uploaded!!!"));
});

export { uploadVideo };
