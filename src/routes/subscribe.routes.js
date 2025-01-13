import { Router } from "express";
import {
  getAllSubscribers,
  subscribeTochannel,
} from "../controllers/subscriber.controller.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router();
router.route("/:id").post(verifyJWT, subscribeTochannel);
router.route("/get-all-subscribers/:id").get(verifyJWT, getAllSubscribers);

export default router;
