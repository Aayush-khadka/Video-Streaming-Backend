import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    content: {
      type: String,
      required: true,
    },
    communityPost: {
      type: Schema.Types.ObjectId,
      ref: "communityPost",
    },
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", commentSchema);
