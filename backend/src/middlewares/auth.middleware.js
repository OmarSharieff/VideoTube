import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"

export const verifyJWT = async(req,res,next)=> {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
    if(!token) {
      throw new ApiError("Unauthorized request", 401)
    }
  
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = User.findById(decodedToken?._id).select("-password -refreshToken")
  
    if(!user) {
      throw new ApiError("Invalid Access Token")
    }
  
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(error?.message || "Invalid access token", 401)
  }
}