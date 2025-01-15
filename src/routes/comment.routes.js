import { Router } from "express";
import {
  commentOnVideo,
  deleteCommentOnVideo,
  editCommentOnVideo,
  getCommentOnVideo,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/video/:id").post(verifyJWT, commentOnVideo);
router.route("/video/update-comment/:id").post(verifyJWT, editCommentOnVideo);
router.route("/get-comments/:id").get(getCommentOnVideo);
router.route("/delete/:vid/:id").delete(verifyJWT, deleteCommentOnVideo);

export default router;
