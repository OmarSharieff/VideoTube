import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
 export const verifyJWT = async(req,res,next)=> {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      throw new ApiError("Unauthorized request", 400);
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      throw new ApiError("Invalid AccessToken", 401)
    }
    const user = User.findById(decodedToken?._id).select("-password -refreshToken")
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(error?.message || "Invalid AccessToken", 402);
  }
}