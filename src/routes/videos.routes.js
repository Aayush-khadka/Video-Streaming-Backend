import { Router } from "express";
import { uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/upload").post(
  verifyJWT,
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
