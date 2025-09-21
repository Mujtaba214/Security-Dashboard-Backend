import express from "express";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import {
  deleteAUser,
  getAllUsers,
  unlockUser,
  updateRole,
} from "../controllers/adminController.js";
import { detectThreats } from "../controllers/threatsController.js";
import { getSecurityMetrics } from "../controllers/securityController.js";
import { getSuspiciousIp } from "../controllers/suspiciousIpController.js";
import { userActivity } from "../controllers/userActivity.js";
import { blockIP, unBlockIP } from "../controllers/blockIpController.js";
import { getSummaryStats, ipFails } from "../controllers/summaryStatsController.js";

const router = express.Router();

router.get("/users", jwtMiddleware, getAllUsers);
router.delete("/users/:id", jwtMiddleware, deleteAUser);
router.patch("/users/unlock/:id", jwtMiddleware, unlockUser);
router.patch("/users/role/:id", jwtMiddleware, updateRole);
router.get("/threats", jwtMiddleware, detectThreats);
router.get("/metrics", jwtMiddleware, getSecurityMetrics);
router.get("/suspicious_ips", jwtMiddleware, getSuspiciousIp);
router.get("/user-activity", jwtMiddleware, userActivity);
router.put("/block-ip/:id", jwtMiddleware, blockIP);
router.put("/unblock-ip/:id", jwtMiddleware, unBlockIP);
router.get("/stats", jwtMiddleware, getSummaryStats);
router.get("/ip-fails", jwtMiddleware, ipFails);

export default router;
