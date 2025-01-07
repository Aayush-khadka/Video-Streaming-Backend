import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import path from "path";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (UserID) => {
  try {
    const user = await User.findById(UserID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh tokens"
    );
  }
};

const registerUser = asynchandler(async (req, res, next) => {
  const { fullname, username, email, password } = req.body;
  //   console.log(fullname, username, email, password);

  if (
    [fullname, username, email, password].some((fields) => fields.trim() === "")
  ) {
    throw new ApiError(400, "ALL FIELDS ARE REQUIRED");
  }

  const ExistedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (ExistedUser) {
    throw new ApiError(409, "USER ALREADY EXISTS");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is needed");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "SMTH WENT WRONG WHILE CREATING USER");
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "USERREG"));
});

const loginUser = asynchandler(async (req, res, next) => {
  const { email, password } = req.body;
  // console.log(email, password);

  if (!email || !password) {
    throw new ApiError(400, "Username and password both are Required");
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "User is not Registered");

  const isPasswordValid = await user.ispasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(400, "Password is Invalid");

  // console.log(user._id);

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "USER SUCESSFULLY LOGGED IN "
      )
    );
});

const logoutUser = asynchandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incommingRefreshToken = req.cookies.accessToken || req.body.accessToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized Access");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid RefreshToken");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("refreshToken", newrefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "Access Token Refrshed "
        )
      );
  } catch (error) {
    throw new ApiError(500, error?.message || "INVALID REFRESH TOKEN");
  }
});

const changeCurrentPassword = asynchandler(async (req, res) => {
  const { newpassword, oldpassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.ispasswordCorrect(oldpassword);

  if (!isPasswordCorrect) {
    throw new ApiError(500, "THE password is incorrect");
  }

  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "USER PASSWORD CHANGED"));
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullname, newemail } = req.body;
  if (!fullname || !newemail) {
    throw new ApiError(400, "Fields Required");
  }

  const user = await User.findOneAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: newemail,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Updated"));
});

const updateAvatarImage = asynchandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(500, "There is no Avatar");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(500, "There is error while uploading to Cloudinary");
  }

  const user = await User.findOneAndUpdate(
    req.user._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Avatar Updated"));
});

const updateCoverImage = asynchandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(500, "There is no Coverimgae");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(500, "There is error while uploading to Cloudinary");
  }

  const user = await User.findOneAndUpdate(
    req.user._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Cover Image Updated"));
});

const getUserChannelProfile = asynchandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "There is no username");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedToOCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscribedToOCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "channel doesnot Exixts");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "USEr channel fetched successfully")
    );
});

const getUserWatchHistory = asynchandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "WATCH HISTORY FETECHED SUCCESSFULLY"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};
