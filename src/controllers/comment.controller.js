import { asynchandler } from "../utils/asynchandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

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

const editCommentOnVideo = asynchandler(async (req, res) => {
  const commentId = req.params.id;
  const newUserComment = req.body.comment;
  const user = req.user._id;

  const prevComment = await Comment.findById(commentId);

  if (!prevComment) {
    throw new ApiError(400, "Invalid Video ID!!!");
  }

  if (prevComment.commentedBy.toString() !== user.toString()) {
    throw new ApiError(400, "Only the Orginal Commentor can edit the Comment");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId },
    {
      content: newUserComment,
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(500, "Cannot Edit the Comment!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Sucessfully Updated the Comment!!!"));
});

const getCommentOnVideo = asynchandler(async (req, res) => {
  const user = req.user?._id;
  const videoId = req.params.id;
  const { page = 1, limit = 10 } = req.query;

  const doesVideoExists = await Video.findById(videoId);
  if (!doesVideoExists) {
    throw new ApiError(400, "Invalid Video ID!!!");
  }

  const findComments = await Comment.aggregate([
    {
      $match: {
        video: mongoose.isObjectIdOrHexString(req.params.id),
      },
    },
    {
      $lookup: {
        from: "Users",
        localField: "commentedBy",
        foreignField: "_id",
        as: "commentor",
      },
    },
    {
      $project: {
        content: 1,
        "commentor.username": 1,
        "commentor.avatar": 1,
        "commentor.fullname": 1,
        createdAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  if (!findComments) {
    throw new ApiError(500, "Failed to fin the comments of the given video!!!");
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const paginateComments = await Comment.aggregatePaginate(
    findComments,
    options
  );

  if (!paginateComments) {
    throw new ApiError(500, "Failed To Retrive Comments!!! ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paginateComments,
        "Sucessfully Retived the comments of that video!!!"
      )
    );
});
export { commentOnVideo, editCommentOnVideo, getCommentOnVideo };
