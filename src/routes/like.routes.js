import { Router } from "express";
import { likeComment, likeVideo } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/video/:id").post(verifyJWT, likeVideo);
router.route("/comment/:id").post(verifyJWT, likeComment);

export default router;
