import { asynchandler } from "../utils/asynchandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import cookieParser from "cookie-parser";

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

const likeComment = asynchandler(async (req, res) => {
  const commentId = req.params.id;
  const user = req.user._id;
  // console.log(commentId, user);

  const doesCommentExists = await Comment.findById(commentId);
  if (!doesCommentExists) {
    throw new ApiError(400, "Invalid Comment ID!!!");
  }

  const isCommentAlreadyLiked = await Like.findOne({
    comment: commentId,
    user: user,
  });

  if (isCommentAlreadyLiked) {
    await Like.findOneAndDelete(isCommentAlreadyLiked._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false },
          "Like Removed from the Comment!!!"
        )
      );
  } else {
    await Like.create({
      comment: commentId,
      user: user,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Like Added to the Comment!!!")
      );
  }
});

export { likeVideo, likeComment };
