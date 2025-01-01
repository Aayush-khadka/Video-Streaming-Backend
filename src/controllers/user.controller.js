import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";

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

export { registerUser };
