import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors(
  {
    origin: process.env.CORS,
    optionsSuccessStatus: 200
  }
));

app.use(express.urlencoded({limit: "16kb", extended: true}));
app.use(express.json({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

//Import Router
import userRouter from "./routes/user.routes.js";

//Router declaration
app.use("/user", userRouter);