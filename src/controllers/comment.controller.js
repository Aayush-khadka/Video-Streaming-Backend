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
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "commentedBy",
        foreignField: "_id",
        as: "commentor",
      },
    },
    {
      $addFields: {
        commentor: {
          $first: "$commentor",
        },
      },
    },

    {
      $project: {
        content: 1,
        commentor: {
          username: 1,
          fullname: 1,
          avatar: 1,
        },
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

const deleteCommentOnVideo = asynchandler(async (req, res) => {
  const commentID = req.params.id;
  const currentUser = req.user._id;
  const videoId = req.params.vid;
  const comment = await Comment.findById(commentID);

  if (!comment) {
    throw new ApiError(400, "Unable to find the comment");
  }

  if (currentUser.toString() !== comment.commentedBy.toString()) {
    throw new ApiError(400, "Invalid User!!!");
  }

  const video = await Video.findById(videoId);

  if (video.owner.toString() !== comment.commentedBy.toString()) {
    throw new ApiError(400, "Inavlid  OWner User!!!");
  }

  const deleteComment = await Comment.findByIdAndDelete(commentID);

  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteComment, "Sucessfully Delted The Comment!!!")
    );
});
export {
  commentOnVideo,
  editCommentOnVideo,
  getCommentOnVideo,
  deleteCommentOnVideo,
};
