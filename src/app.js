import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

//routes Import
import user from "./routes/user.routes.js";
import video from "./routes/videos.routes.js";

//routes decleration
app.use("/api/v1/users", user);
app.use("/api/v1/videos", video);

export default app;
// module.exports = app;
