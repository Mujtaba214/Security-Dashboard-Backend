import express from "express";
import { signupController } from "../controllers/signupController.js";
import {
  changePassword,
  forgetPassword,
  loginController,
  resetPassword,
} from "../controllers/loginController.js";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import { loginLimiter } from "../middleware/rateLimit.js";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

// /router.use(jwtMiddleware);

router.post("/signup", signupController);
router.post("/login", loginController, loginLimiter);
router.post("/change-password/:id", changePassword);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);



export default router;
