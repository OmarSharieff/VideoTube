import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// a function for generating access and refresh token together
const generateAccessTokenAndRefreshToken = async(userId)=> {
  try {
    const user = User.findById(userId);
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
  if (!email || !username) {
    throw new ApiError("Both username and email are required", 400);
  }

  //Find the user
  const user = User.findOne({
    $or: [{email}, {username}]
  });

  if(!user) {
    throw new ApiError("User has not been registered", 402);
  }

  //Validate user's password.
  const validatePassword = await user.isPasswordCorrect(user.password);

  if(!validatePassword) {
    throw new ApiError("Invalid User Password", 401);
  }

  //get access and refresh token for the user
  const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id); 

  const loggedInUser = User.findById(user._id).select("-password -refreshToken");

  //send cookies, we need options
  const options = {
  httpOnly: true,
  security: true
  }

  return res
  .status(200)
  .cookie("AccessToken",accessToken,options)
  .cookie("RefreshToken",refreshToken,options)
  .json(
    new ApiResponse("User logged in successfully", 200)
  )
})

const logoutUser = asyncHandler( async(req,res)=> {
  
})


export {registerUser, loginUser};