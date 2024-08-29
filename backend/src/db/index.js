import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=> {
  try {
    const connectionInstance = await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`)

  } catch (error) {
    throw Error()
  }
}