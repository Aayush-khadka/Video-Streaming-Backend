import { asynchandler } from "../utils/asynchandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const likeVideo = asynchandler(async (req, res) => {
  const videoId = req.params.id;

  const doesVideoExists = await Video.findById(videoId);

  if (!doesVideoExists) {
    throw new ApiError(400, "The video Does not exists!!!");
  }

  const likingUser = req.user._id;

  const checkUser = await User.findById(likingUser);

  if (!checkUser) {
    throw new ApiError(400, "User not Found!!!");
  }

  const isVideoAlreadyLiked = await Like.findOne({
    video: videoId,
    user: likingUser,
  });
  if (isVideoAlreadyLiked) {
    await Like.findOneAndDelete(isVideoAlreadyLiked._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Like Removed from Video!!!")
      );
  } else {
    await Like.create({
      video: videoId,
      user: likingUser,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Like Added from video!!!")
      );
  }
});

export { likeVideo };
