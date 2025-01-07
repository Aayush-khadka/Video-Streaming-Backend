import { Router } from "express";
import { uploadVideo, deleteVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/upload").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);
// router.route("/toggle/publish/:id");

router.route("/delete/:id").delete(verifyJWT, deleteVideo);

export default router;
