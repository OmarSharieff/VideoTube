import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=> {
  try {
    const connectionInstance = await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`)
    console.log("Successfully connnected to MongoDB on host: ",connectionInstance);
    
  } catch (error) {
    throw Error("Failed to connnect to Database");
  }
}
export {connectDB};