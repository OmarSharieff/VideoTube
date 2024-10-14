import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError("Unauthorized request", 401); // Use 401 for unauthorized
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError("Invalid or Expired AccessToken", 401); // Specific error handling
  }

  const user = await User.findById(decodedToken._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError("User not found", 404); // Handle case where user doesn't exist
  }

  req.user = user;
  next();
});
