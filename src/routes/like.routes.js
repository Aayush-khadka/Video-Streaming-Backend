import { Router } from "express";
import { likeVideo } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/video/:id").post(verifyJWT, likeVideo);

export default router;
