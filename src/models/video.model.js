import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming the User schema is defined
      required: true,
      default: "64cf23f65b4d59c4f0e32109",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "", // Default to an empty string if no description is provided
    },
    duration: {
      type: Number,
      required: true, // Duration in seconds
      default: 10,
    },
    views: {
      type: Number,
      default: 0, // Initialize with zero views
    },
    isPublished: {
      type: Boolean,
      default: false, // Default to unpublished
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
    // updatedAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  { timestamps: true }
);

// Middleware to update the `updatedAt` field on save
videoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
