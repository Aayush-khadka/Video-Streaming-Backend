import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

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

const deleteVideo = asynchandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new ApiError(400, "Video ID Needed!!!");
  }
  const videoExists = await Video.findById(id);

  if (!videoExists) {
    throw new ApiError(400, "The Video Does not Exists!!!");
  }

  const videoDelete = await Video.deleteOne({ _id: id });

  if (!videoDelete) {
    throw new ApiError(500, "Deleting the Video Failed!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videoExists, "Video Deleted"));
});

const updateVideoTitle = asynchandler(async (req, res) => {
  const { title } = req.body;
  const id = req.params.id;
  const user = req.user.id;
  const checkOwner = await Video.findOne({ owner: user });
  if (!checkOwner) {
    throw new ApiError(400, "Unauthorized Access");
  }

  if (!title) {
    throw new ApiError(400, "Provide The updated Title!!!");
  }
  if (!id) {
    throw new ApiError(
      400,
      "Provide The Id for which the video title to be updated!!!"
    );
  }

  const videoExits = await Video.findById(id);

  if (!videoExits) {
    throw new ApiError(400, "The video does not Exixts !!!");
  }

  await Video.updateOne({ $set: { title } });
  return res
    .status(200)
    .json(new ApiResponse(200, title, "Changed the Video Title!!!"));
});

const updateVideoDescription = asynchandler(async (req, res) => {
  const { description } = req.body;
  const id = req.params.id;
  const user = req.user.id;
  const checkOwner = await Video.findOne({ owner: user });
  if (!checkOwner) {
    throw new ApiError(400, "Unauthorized Access");
  }

  if (!description) {
    throw new ApiError(400, "Provide The updated Description!!!");
  }
  if (!id) {
    throw new ApiError(
      400,
      "Provide The Id for which the video description to be updated!!!"
    );
  }

  const videoExits = await Video.findById(id);

  if (!videoExits) {
    throw new ApiError(400, "The video does not Exixts !!!");
  }

  await Video.updateOne({ $set: { description } });
  return res
    .status(200)
    .json(
      new ApiResponse(200, description, "Changed the Video Description!!!")
    );
});

const togglePublishStatus = asynchandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "User id Required!!!");
  }
  const user = req.user.id;
  const checkOwner = await Video.findOne({ owner: user });
  if (!checkOwner) {
    throw new ApiError(400, "Unauthorized Access");
  }

  const video = await Video.findById(id);
  const togglestatus = await Video.findOneAndUpdate(
    { _id: id },
    { $set: { isPublished: !video.isPublished } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Toggled Publish Status"));
});

const getvideo = asynchandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "User id Required!!!");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {},
  ]);

  return res.status(200).json(new ApiResponse(200, video[0], "Uploaded Video"));
});
export {
  uploadVideo,
  deleteVideo,
  updateVideoTitle,
  updateVideoDescription,
  togglePublishStatus,
  getvideo,
};
