import { Router } from "express";
import { uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload").post(
  upload.fields([
    {
      name: "video",
      maxCount: 2,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

export default router;
