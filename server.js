import express from "express";
import env from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import { apiLimiter } from "./middleware/rateLimit.js";

env.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes, apiLimiter);
app.use("/user", userRoutes, apiLimiter);
app.use("/admin", adminRoutes, apiLimiter);
app.use("/test", testRoutes, apiLimiter);

app.listen(port, () => {
  console.log("server running");
});
