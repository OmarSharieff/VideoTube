import {v2 as cloudinary} from "cloudinary";
//importing file system 
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localPath)=> {
  try {
    if (!localPath) return Error("No file found");
    const response = await cloudinary.uploader.upload(localPath,
      {
        resource_type: "auto"
      }
    )
    // If the file is successfully uploaded
    console.log("File has been successfully uploaded");
    console.log(response.url);
    return response
  } catch (error) {
    //removing the locally saved file as the upload operation got failed
    fs.unlinkSync(localPath)
    return null
  }
}

export {uploadOnCloudinary}