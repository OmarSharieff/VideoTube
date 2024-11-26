import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// a function for generating access and refresh token together
const generateAccessTokenAndRefreshToken = async(userId)=> {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError("Something went wrong while generating Access and Refresh token", 500);
  }
}

const registerUser = asyncHandler( async(req,res)=> {
  // get user details from frontend
  // validation - not empty
  // check if the user aleady exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create a user object - create entry in db 
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const {fullName, password, email, username} = req.body
  // console.log("email: ", email)

  // Validating the field to be existing
  if ([fullName, password, email, username].some(field => field?.trim() === "")) {
    throw new ApiError("All fields are required", 400)
  } 

  // Finding the user based on the "username" or "email",
  // If anyone is found, the existingUser is set to true
  const existingUser = await User.findOne({
    $or: [{username}, {email}]
  })

  if (existingUser) {
    throw new ApiError("User already exists", 409)
  }

  const localAvatarPath =  req.files?.avatar[0]?.path;
  // const localCoverImagePath = req.files?.coverImage[0].path;

  let localCoverImagePath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    localCoverImagePath = req.files.coverImage[0].path;
  }

  if (!localAvatarPath) {
    throw new ApiError("Avatar file is required", 400);
  }

  //uploading images on cloudinary
  const avatar = await uploadOnCloudinary(localAvatarPath);
  const coverImage = await uploadOnCloudinary(localCoverImagePath);

  if(!avatar) {
    throw new ApiError("Cloudinary is missing avatar", 400);
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  })
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  
  if (!createdUser) {
    throw new ApiError("Something went wrong while registering the user", 500)
  }
  
  return res.status(201).json(
    new ApiResponse ("User successfully registered!", 200)
  )
});

const loginUser = asyncHandler( async(req,res) => {
  //Get details from front-end
  const {email, username, password} = req.body;

  //For 'email' or 'username' based login
  if (!(email || username)) {
    throw new ApiError("username or email are required", 400);
  }

  //Find the user
  const user = await User.findOne({
    $or: [{email}, {username}]
  });

  if(!user) {
    throw new ApiError("User has not been registered", 402);
  }

  //Validate user's password.
  const validatePassword = await user.isPasswordCorrect(password);

  if(!validatePassword) {
    throw new ApiError("Invalid User Password", 401);
  }

  //get access and refresh token for the user
  const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id); 

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  //send cookies, we need options
  const options = {
  httpOnly: true,
  secure: true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse("User logged in successfully", 200)
  )
});

const logoutUser = asyncHandler( async(req,res)=> {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined
    }
  }, {
    new: true
  })

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(
    new ApiResponse("User successfully logged out", 200, {})
  )
});

const accessRefreshToken = asyncHandler( async(req,res)=> {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError("Unauthorized Request", 400);
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
    if (!decodedToken) {
      throw new ApiError("Invalid refresh token");
    }
    
    const user = await User.findById(decodedToken._id)
    
    if (!user) {
      throw new ApiError("Invalid user", 401)
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError("Refresh token is expired or used", 401)
    }
    
    const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
    const options = {
      httpOnly: true,
      secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse("access and refresh token successfully refreshed", 200, {accessToken, refreshToken: newRefreshToken})
    )

  } catch (error) {
    throw new ApiError(error?.message || "Invalid refresh token", 400)
  }
});

const changeCurrentPassword = asyncHandler( async(req,res)=> {
  const {oldPassword, newPassword} = req.body;

  //Getting user id from req.user
  const user = await User.findById(req.user?._id)

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const validateOldPassword = await user.isPasswordCorrect(oldPassword);

  if (!validateOldPassword) {
    throw new ApiError("Incorrect password", 401);
  }

  user.password = newPassword;
  await user.save({validateBeforeSave: false});

  return res.status(200).json(new ApiResponse("Password successfully changed", 200, {}))
});

const currentUser = asyncHandler( async(req,res)=> {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return res.status(200)
  .json(
    new ApiResponse("Fetched Currect User Successfully", 200, {user})
  )
})

export {registerUser, loginUser, logoutUser, accessRefreshToken, changeCurrentPassword, currentUser};