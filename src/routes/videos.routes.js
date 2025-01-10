import { Router } from "express";
import {
  uploadVideo,
  deleteVideo,
  updateVideoTitle,
  updateVideoDescription,
  togglePublishStatus,
  getvideo,
} from "../controllers/video.controller.js";
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
router.route("/toggle/publish/:id").post(verifyJWT, togglePublishStatus);

router.route("/delete/:id").delete(verifyJWT, deleteVideo);
router.route("/update-title/:id").patch(verifyJWT, updateVideoTitle);
router
  .route("/update-description/:id")
  .patch(verifyJWT, updateVideoDescription);
router.route("/c/v/:id").get(getvideo);

export default router;
