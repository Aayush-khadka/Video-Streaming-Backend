import { Router } from "express";
import { commentOnVideo } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/video/:id").post(verifyJWT, commentOnVideo);

export default router;
