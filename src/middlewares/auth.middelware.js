import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asynchandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }

    const decoddedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoddedToken?._id).select(
      "-password - refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "INVALID ACCESS TOKEN");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "INVALID ACCESS TOKEN");
  }
});
