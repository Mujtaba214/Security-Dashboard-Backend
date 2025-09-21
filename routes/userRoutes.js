import express from "express";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.use(jwtMiddleware);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.delete("/profile", deleteProfile);

export default router;
