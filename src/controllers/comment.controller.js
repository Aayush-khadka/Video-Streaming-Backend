import { asynchandler } from "../utils/asynchandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const commentOnVideo = asynchandler(async (req, res) => {
  const videoId = req.params.id;
  const userComment = req.body.comment;
  const user = req.user._id;

  const doesVideoExists = await Video.findById(videoId);

  if (!doesVideoExists) {
    throw new ApiError(400, "Invalid Video ID!!!");
  }

  const comment = await Comment.create({
    video: videoId,
    commentedBy: user,
    content: userComment,
  });

  if (!comment) {
    throw new ApiError(500, "Cannot comment on video!!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, comment, "Sucessfully Commented to the Video!!!")
    );
});

export { commentOnVideo };
