import { Router } from "express";
import { subscribeTochannel } from "../controllers/subscriber.controller.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router();
router.route("/:id").post(verifyJWT, subscribeTochannel);

export default router;
