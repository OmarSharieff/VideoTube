import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async ()=> {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log("Successfully connnected to MongoDB on host: ",connectionInstance.connection.host);
    
  } catch (error) {
    throw Error("Failed to connnect to Database");
  }
}
export {connectDB};