import mongoose, { Schema, SchemaType } from "mongoose";

const likeSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    communityPost: {
      type: Schema.Types.ObjectId,
      ref: "CommunityPost",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Like = new mongoose.model("Like", likeSchema);
